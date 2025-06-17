# LightFM Recommender System Model using item_features.csv, user_features.csv, interactions.csv
# ----- For finalised features and model -----

from flask import Flask, request, jsonify, send_file
import pandas as pd
import numpy as np
from lightfm import LightFM
from lightfm.data import Dataset
from lightfm.cross_validation import random_train_test_split
import pickle
import os
import uuid
import json
import random
import string

def calculate_discount_percentage(user_data, product_data, interaction_data):
    """
    Calculate discount percentage for a product based on user and product features.
    
    Args:
        user_data (pd.Series): User data containing AgeGroup and Gender.
        product_data (pd.Series): Product data containing ProductCategory and Price.
        interaction_data (pd.DataFrame): Interaction data containing Rating and Purchases.
    
    Returns:
        float: Discount percentage (0-100).
    """
    discount = 5

    # User-based discount
    if user_data["AgeGroup"] == "Young Adult":
        discount += 10  # Young adults get a base discount
    elif user_data["AgeGroup"] == "Senior":
        discount += 15  # Seniors get a higher base discount

    if user_data["Gender"] == "Female" and product_data["ProductCategory"] in ["Fashion", "Beauty"]:
        discount += 5  # Additional discount for gender-specific categories

    # Product-based discount
    product_price = float(product_data["Price"])
    if product_price > 100:
        discount += 10  # Higher discount for expensive products

    # Interaction-based discount
    if not interaction_data.empty:
        rating = interaction_data["Rating"].iloc[0]
        purchases = interaction_data["NumberOfPurchases"].iloc[0]
        if rating >= 4:
            discount += 5  # Reward high ratings
        if purchases > 2:
            discount += 10  # Reward frequent purchases

    # Cap discount at 50%
    discount = min(discount, 50)

    return discount

def generate_reward_code():
    """Generate a random 5-character alphanumeric reward code."""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=5))

def train_model(interactions_df, user_features_df, item_features_df, num_of_rewards):
    print("Starting model training...")
    try:
        # Prepare LightFM dataset
        print("Interactions DataFrame:", interactions_df.shape, interactions_df.columns)
        print("User Features DataFrame:", user_features_df.shape, user_features_df.columns)
        print("Item Features DataFrame:", item_features_df.shape, item_features_df.columns)
        dataset = Dataset()

        print("Fitting dataset with users and items...")
        # Fit users and items with their features
        dataset.fit(
            users=user_features_df["CustomerID"],
            items=pd.concat([interactions_df["ProductID"], item_features_df["ProductID"]]).unique(),
            user_features=user_features_df["Gender"].unique().tolist() + user_features_df["AgeGroup"].unique().tolist(),
            item_features=item_features_df["ProductCategory"].unique().tolist() + item_features_df["Price"].astype(str).unique().tolist()
        )

        print("Dataset fitted. Building interaction matrices...")
        # Build interactions matrix
        (interactions, _) = dataset.build_interactions([
            (row["CustomerID"], row["ProductID"], row["Rating"] + row["NumberOfPurchases"])
            for _, row in interactions_df.iterrows()
        ])

        print("Interactions matrix built. Splitting into train and test sets...")
        # Build user features matrix
        user_features = dataset.build_user_features([
            (row["CustomerID"], [row["Gender"], row["AgeGroup"]])
            for _, row in user_features_df.iterrows()
        ])

        print("User features matrix built. Building item features matrix...")
        # Build item features matrix
        item_features = dataset.build_item_features([
            (row["ProductID"], [row["ProductCategory"], str(row["Price"])])
            for _, row in item_features_df.iterrows()
        ])

        print("Dataset and matrices prepared. Starting model training...")
        
        # Train LightFM model
        model = LightFM(no_components=30, loss='warp')
        model.fit(interactions, user_features=user_features, item_features=item_features, epochs=10, num_threads=4)

        # Save model to a file
        os.makedirs("backend/models", exist_ok=True)
        model_id = str(uuid.uuid4())
        model_path = f"backend/models/lightfm_model_{model_id}.pkl"
        with open(model_path, "wb") as f:
            pickle.dump(model, f)

        print(f"Model saved to lightfm_model_{model_id}.pkl")

        # Generate recommendations for all users
        user_id_map, _, item_id_map, _ = dataset.mapping()
        reverse_item_map = {v: k for k, v in item_id_map.items()}
        num_items = len(item_id_map)

        recommendations = {}
        for index, (user_id, internal_user_id) in enumerate(user_id_map.items()):
            if index >= 10:  # Limit to the first 10 users
                break

            scores = model.predict(internal_user_id, np.arange(num_items), user_features=user_features, item_features=item_features)
            top_items = np.argsort(-scores)[:num_of_rewards]  # Get top N items based on scores
            
            user_data = user_features_df[user_features_df["CustomerID"] == user_id].iloc[0]
            
            email_row = interactions_df[interactions_df["CustomerID"] == user_id]["Email"]
            email = email_row.iloc[0] if not email_row.empty and pd.notna(email_row.iloc[0]) else "No Email Provided"
            
            rewards = [] 
            
            for item_id in top_items:
                product_id = reverse_item_map[item_id]
                product_match = item_features_df[item_features_df["ProductID"] == product_id]
                if product_match.empty:
                    print(f"⚠️ Skipping missing ProductID: {product_id}")
                    continue  # or handle gracefully

                product_data = product_match.iloc[0]
                product_data = item_features_df[item_features_df["ProductID"] == product_id].iloc[0]
                
                interaction_data = interactions_df[
                    (interactions_df["CustomerID"] == user_id) & (interactions_df["ProductID"] == product_id)
                ]
                
                # Calculate discount percentage
                discount_percentage = calculate_discount_percentage(user_data, product_data, interaction_data)
                
                # Generate a reward code
                reward_code = generate_reward_code()
                
                # Append reward string
                rewards.append(f"{discount_percentage}% off {product_id} <{reward_code}>")
            
            # Append user_id and rewards to recommendations_with_discounts
            recommendations[user_id] = {
                "email": email,
                "rewards": rewards
            }
            
        # Save recommendations to a JSON file
        os.makedirs("backend/recommendations", exist_ok=True)
        recommendations_path = f"backend/recommendations/recommendations_{model_id}.json"
        with open(recommendations_path, "w") as f:
            json.dump(recommendations, f)

        print(f"Recommendations saved to {recommendations_path}")
        
        # Filter recommendations to include only user_ids with valid emails
        recommendations_with_emails = [
            recommendation for recommendation in recommendations.values() if recommendation["email"] != "No Email Provided"
        ]

        # Save recommendations_with_emails to a JSON file
        os.makedirs("backend/recommendations_with_emails", exist_ok=True)
        recommendations_with_emails_path = f"backend/recommendations_with_emails/recommendations_{model_id}.json"
        with open(recommendations_with_emails_path, "w") as f:
            json.dump(recommendations_with_emails, f)

        print(f"Recommendations with emails saved to {recommendations_with_emails_path}")

        return {
            "message": "Model trained successfully!",
            "model_id": model_id,
            "recommendations": recommendations,
        }

    except Exception as e:
        import traceback
        print("Error occurred during model training:", str(e))
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

def get_recommendations(model_id):
    try:
        # Construct the path to the recommendations_with_emails file using the model_id
        recommendations_path = f"recommendations_with_emails/recommendations_{model_id}.json"

        # Check if the file exists
        if not os.path.exists(recommendations_path):
            return jsonify({"error": f"Recommendations for model_id {model_id} not found"}), 404

        ### instead of returning json, 
        ### we send emails for user_ids in recommendations_with_emails
        
        # Serve the recommendations JSON file
        return send_file(recommendations_path, mimetype='application/json')
    except Exception as e:
        return jsonify({"error": str(e)}), 500