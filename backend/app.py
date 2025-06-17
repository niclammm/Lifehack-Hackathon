from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
import io
import traceback
from train_lightfm import train_model
import os
# Column name constants for customers data
class CustomerHeaders:
    CUSTOMER_ID = 'CustomerID'
    GENDER = 'Gender'
    AGE_GROUP = 'AgeGroup'

# Column name constants for products data  
class ProductHeaders:
    PRODUCT_ID = 'ProductID'
    CATEGORY = 'ProductCategory'
    PRICE = 'Price'

# Column name constants for interactions data
class InteractionHeaders:
    CUSTOMER_ID = 'CustomerID'
    PRODUCT_ID = 'ProductID'
    PURCHASES = 'NumberOfPurchases'
    RATINGS = 'Rating'
    EMAIL = 'Email'

import os
import tempfile
from werkzeug.utils import secure_filename


app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Create upload directory if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

ALLOWED_EXTENSIONS = {'csv'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

customers_df = None # dataframe for customer metadata
products_df = None # product data e.g. price
interactions_df = None #interactions done per product purchased

def calculate_basic_analytics():
    """Calculate comprehensive analytics and return as dictionary"""
    print("=== STARTING ANALYTICS CALCULATION ===")
    
    analytics = {
        "data_loaded": {
            "customers": customers_df is not None and len(customers_df) > 0,
            "products": products_df is not None and len(products_df) > 0, 
            "interactions": interactions_df is not None and len(interactions_df) > 0
        },
        "basic_stats": {}
    }
    
    print(f"Data loaded status: {analytics['data_loaded']}")
    
    try:
        if interactions_df is None:
            print("ERROR: interactions_df is None")
            analytics["error"] = "No interaction data available - DataFrame is None"
            return analytics
            
        if len(interactions_df) == 0:
            print("ERROR: interactions_df is empty")
            analytics["error"] = "No interaction data available - DataFrame is empty"
            return analytics
        
        print(f"Interactions shape: {interactions_df.shape}")
        print(f"Interactions columns: {interactions_df.columns.tolist()}")
        print(f"Interactions dtypes:\n{interactions_df.dtypes}")
        
        # Create working copy and ensure data quality
        print("Creating working copy...")
        working_df = interactions_df.copy()
        print(f"Working copy created with shape: {working_df.shape}")
        
        # Clean and validate required columns
        required_columns = {
            InteractionHeaders.CUSTOMER_ID: str,
            InteractionHeaders.PRODUCT_ID: str,
            InteractionHeaders.PURCHASES: int,
            InteractionHeaders.RATINGS: float
        }
        
        print("Validating required columns...")
        for col, dtype in required_columns.items():
            print(f"Processing column: {col}")
            
            if col not in working_df.columns:
                print(f"Column {col} missing, creating with defaults...")
                if col == InteractionHeaders.PURCHASES:
                    working_df[col] = 1
                elif col == InteractionHeaders.RATINGS:
                    working_df[col] = 4.0
                else:
                    print(f"ERROR: Missing required column: {col}")
                    analytics["error"] = f"Missing required column: {col}"
                    return analytics
            
            print(f"Converting {col} to {dtype}")
            # Convert data types and handle nulls more carefully
            if dtype == int:
                print(f"  Before conversion - {col} unique values: {working_df[col].unique()[:10]}")
                # Handle None, NaN, and string values
                working_df[col] = pd.to_numeric(working_df[col], errors='coerce')
                working_df[col] = working_df[col].fillna(1)
                working_df[col] = working_df[col].astype(int)
                print(f"  After conversion - {col} unique values: {working_df[col].unique()[:10]}")
                # Filter out invalid purchases using boolean indexing
                print(f"  Filtering {col} > 0...")
                valid_mask = working_df[col] > 0
                working_df = working_df[valid_mask].copy()
                print(f"  After filtering shape: {working_df.shape}")
            elif dtype == float:
                print(f"  Before conversion - {col} unique values: {working_df[col].unique()[:10]}")
                # Handle None, NaN, and string values  
                working_df[col] = pd.to_numeric(working_df[col], errors='coerce')
                working_df[col] = working_df[col].fillna(4.0)
                working_df[col] = working_df[col].clip(1, 5)  # Ensure ratings are 1-5
                print(f"  After conversion - {col} unique values: {working_df[col].unique()[:10]}")
            else:
                print(f"  Converting {col} to string...")
                # Handle string columns
                working_df[col] = working_df[col].fillna('Unknown').astype(str)
                print(f"  After conversion - {col} sample values: {working_df[col].unique()[:5]}")
        
        if len(working_df) == 0:
            print("ERROR: No valid data after cleaning")
            analytics["error"] = "No valid data after cleaning"
            return analytics
        
        print(f"Cleaned data shape: {working_df.shape}")
        print("Sample cleaned data:")
        print(working_df.head())
        
        # 1. BASIC COUNTS
        print("Calculating basic counts...")
        analytics["basic_stats"]["unique_users"] = int(working_df[InteractionHeaders.CUSTOMER_ID].nunique())
        analytics["basic_stats"]["unique_products"] = int(working_df[InteractionHeaders.PRODUCT_ID].nunique())
        analytics["basic_stats"]["total_purchases"] = int(working_df[InteractionHeaders.PURCHASES].sum())
        print(f"Basic counts: {analytics['basic_stats']}")
        
        # 2. USER ENGAGEMENT METRICS
        print("Calculating user engagement metrics...")
        user_purchases = working_df.groupby(InteractionHeaders.CUSTOMER_ID)[InteractionHeaders.PURCHASES].sum()
        print(f"User purchases calculated: {len(user_purchases)} users")
        
        if len(user_purchases) > 0:
            # Average purchases per user
            avg_purchases = user_purchases.mean()
            analytics["basic_stats"]["average_purchases_per_user"] = round(float(avg_purchases), 2) if pd.notna(avg_purchases) else 0
            
            # Retention metrics - handle None values carefully
            repeat_customers = 0
            total_customers = len(user_purchases)
            
            for purchase_count in user_purchases:
                if pd.notna(purchase_count) and purchase_count > 1:
                    repeat_customers += 1
            
            retention_rate = (repeat_customers / total_customers * 100) if total_customers > 0 else 0
            
            analytics["basic_stats"]["repeat_customers"] = repeat_customers
            analytics["basic_stats"]["total_customers"] = total_customers
            analytics["basic_stats"]["retention_rate_percentage"] = round(retention_rate, 2)
        else:
            analytics["basic_stats"]["average_purchases_per_user"] = 0
            analytics["basic_stats"]["repeat_customers"] = 0
            analytics["basic_stats"]["total_customers"] = 0
            analytics["basic_stats"]["retention_rate_percentage"] = 0
        
        print(f"User engagement metrics: {analytics['basic_stats']}")
        
        # 3. RATING ANALYTICS
        print("Calculating rating analytics...")
        # Filter for valid ratings (not null and between 1-5)
        valid_ratings_mask = (
            working_df[InteractionHeaders.RATINGS].notna() & 
            (working_df[InteractionHeaders.RATINGS] >= 1) & 
            (working_df[InteractionHeaders.RATINGS] <= 5)
        )
        valid_ratings = working_df[valid_ratings_mask]
        print(f"Valid ratings found: {len(valid_ratings)}")
        
        if len(valid_ratings) > 0:
            avg_rating = valid_ratings[InteractionHeaders.RATINGS].mean()
            analytics["basic_stats"]["average_rating_overall"] = round(float(avg_rating), 2) if pd.notna(avg_rating) else 0
            analytics["basic_stats"]["total_ratings_given"] = len(valid_ratings)
            
            # Rating distribution
            rating_dist = valid_ratings[InteractionHeaders.RATINGS].value_counts().sort_index()
            analytics["basic_stats"]["rating_distribution"] = {int(k): int(v) for k, v in rating_dist.items() if pd.notna(k)}
        else:
            analytics["basic_stats"]["average_rating_overall"] = 0
            analytics["basic_stats"]["total_ratings_given"] = 0
            analytics["basic_stats"]["rating_distribution"] = {}
        
        print(f"Rating analytics: {analytics['basic_stats']}")
        
        # 4. PRODUCT PERFORMANCE
        print("Calculating product performance...")
        # Top sold product by total purchases
        product_sales = working_df.groupby(InteractionHeaders.PRODUCT_ID)[InteractionHeaders.PURCHASES].sum().sort_values(ascending=False)
        print(f"Product sales calculated for {len(product_sales)} products")
        
        if len(product_sales) > 0:
            top_product_id = product_sales.index[0]
            top_sold_info = {
                "product_id": str(top_product_id),
                "total_purchases": int(product_sales.iloc[0])
            }
            
            # Add product details if available
            if products_df is not None and len(products_df) > 0:
                print(f"Adding product details for {top_product_id}")
                product_detail = products_df[products_df[ProductHeaders.PRODUCT_ID] == top_product_id]
                if not product_detail.empty:
                    if ProductHeaders.CATEGORY in product_detail.columns:
                        category = product_detail.iloc[0][ProductHeaders.CATEGORY]
                        if pd.notna(category):
                            top_sold_info["category"] = str(category)
                    
                    if ProductHeaders.PRICE in product_detail.columns:
                        price = pd.to_numeric(product_detail.iloc[0][ProductHeaders.PRICE], errors='coerce')
                        if pd.notna(price) and price > 0:
                            top_sold_info["price"] = round(float(price), 2)
            
            analytics["basic_stats"]["top_sold_product"] = top_sold_info
        
        # Top rated product (minimum 2 ratings for reliability)
        print("Calculating top rated product...")
        try:
            product_ratings = working_df.groupby(InteractionHeaders.PRODUCT_ID)[InteractionHeaders.RATINGS].agg(['mean', 'count']).reset_index()
            print(f"Product ratings calculated for {len(product_ratings)} products")
            
            # Safely filter products with sufficient ratings
            qualified_mask = product_ratings['count'] >= 2
            qualified_products = product_ratings[qualified_mask]
            print(f"Qualified products (>=2 ratings): {len(qualified_products)}")
            
            if not qualified_products.empty and len(qualified_products) > 0:
                # Find product with highest average rating
                max_rating_idx = qualified_products['mean'].idxmax()
                if pd.notna(max_rating_idx):
                    top_rated = qualified_products.loc[max_rating_idx]
                    
                    top_rated_info = {
                        "product_id": str(top_rated[InteractionHeaders.PRODUCT_ID]),
                        "average_rating": round(float(top_rated['mean']), 2) if pd.notna(top_rated['mean']) else 0,
                        "rating_count": int(top_rated['count']) if pd.notna(top_rated['count']) else 0
                    }
                    
                    # Add product details
                    if products_df is not None and len(products_df) > 0:
                        product_detail = products_df[products_df[ProductHeaders.PRODUCT_ID] == top_rated[InteractionHeaders.PRODUCT_ID]]
                        if not product_detail.empty:
                            if ProductHeaders.CATEGORY in product_detail.columns:
                                category = product_detail.iloc[0][ProductHeaders.CATEGORY]
                                if pd.notna(category):
                                    top_rated_info["category"] = str(category)
                            
                            if ProductHeaders.PRICE in product_detail.columns:
                                price = pd.to_numeric(product_detail.iloc[0][ProductHeaders.PRICE], errors='coerce')
                                if pd.notna(price) and price > 0:
                                    top_rated_info["price"] = round(float(price), 2)
                    
                    analytics["basic_stats"]["top_rated_product"] = top_rated_info
                else:
                    analytics["basic_stats"]["top_rated_product"] = {"message": "No products with sufficient ratings (min 2)"}
            else:
                analytics["basic_stats"]["top_rated_product"] = {"message": "No products with sufficient ratings (min 2)"}
        except Exception as e:
            print(f"Error calculating top rated product: {e}")
            traceback.print_exc()
            analytics["basic_stats"]["top_rated_product"] = {"message": f"Error calculating top rated product: {str(e)}"}
        
        # Continue with simplified calculations for now
        print("Setting basic defaults for remaining metrics...")
        analytics["basic_stats"]["top_5_products_by_sales"] = []
        analytics["basic_stats"]["total_revenue"] = 0
        analytics["basic_stats"]["average_spending_per_user"] = 0
        analytics["basic_stats"]["customer_demographics"] = {
            "gender_distribution": {},
            "age_group_distribution": {}
        }
        
        print("Analytics calculation completed successfully")
        print(f"Final analytics: {analytics}")
        return analytics
        
    except Exception as e:
        print(f"CRITICAL ERROR in analytics calculation: {e}")
        print(f"Error type: {type(e)}")
        traceback.print_exc()
        analytics["error"] = f"Analytics calculation failed: {str(e)}"
        return analytics


@app.route('/upload_data', methods=['POST'])
def upload_data_json(num_of_rewards=3):
    """Upload CSV data as JSON strings and return basic analytics"""
    global customers_df, products_df, interactions_df
    
    print("=== UPLOAD ENDPOINT HIT ===")
    
    try:
        print("Step 1: Checking request data...")
        # Check if request has data
        if not request.data:
            print("ERROR: No request data")
            return jsonify({"error": "No data received", "status": "error"}), 400
        
        print("Step 2: Checking content length...")
        # Get content length to check size
        content_length = request.content_length
        # max_content_length = app.config.get('MAX_CONTENT_LENGTH') or (16 * 1024 * 1024)  # Default to 16MB
        
        # print(f"Content length: {content_length}")
        # print(f"Max content length: {max_content_length}")
        
        # if content_length and content_length > max_content_length:
        #     print(f"ERROR: File too large: {content_length}")
        #     return jsonify({
        #         "error": f"File too large. Maximum size allowed: {max_content_length // (1024*1024)}MB", 
        #         "status": "error"
        #     }), 413
        
        print("Step 3: Parsing JSON...")
        data = request.get_json()
        if not data:
            print("ERROR: Invalid JSON data")
            return jsonify({"error": "Invalid JSON data", "status": "error"}), 400
        
        print(f"Received data keys: {list(data.keys())}")
        
        uploaded_data = {}
        debug_info = {}
        
        print("Step 4: Processing uploaded data...")
        
        # Process customers data
        if 'customers' in data and data['customers']:
            print("Processing customers data...")
            try:
                customers_df = pd.read_csv(io.StringIO(data['customers']))
                uploaded_data['customers'] = f"Loaded {len(customers_df)} customer records"
                debug_info['customers_headers'] = list(customers_df.columns)
                print(f"Customers loaded: {len(customers_df)} records")
                print(f"Customers columns: {customers_df.columns.tolist()}")
            except Exception as e:
                print(f"Error processing customers: {e}")
                return jsonify({"error": f"Error processing customers data: {str(e)}", "status": "error"}), 400
        
        # Process products data
        if 'products' in data and data['products']:
            print("Processing products data...")
            try:
                products_df = pd.read_csv(io.StringIO(data['products']))
                uploaded_data['products'] = f"Loaded {len(products_df)} product records"
                debug_info['products_headers'] = list(products_df.columns)
                print(f"Products loaded: {len(products_df)} records")
                print(f"Products columns: {products_df.columns.tolist()}")
            except Exception as e:
                print(f"Error processing products: {e}")
                return jsonify({"error": f"Error processing products data: {str(e)}", "status": "error"}), 400
        
        # Process interactions data
        if 'interactions' in data and data['interactions']:
            print("Processing interactions data...")
            try:
                # Read CSV and immediately handle duplicate columns
                csv_data = data['interactions']
                print("Raw CSV first few lines:")
                print('\n'.join(csv_data.split('\n')[:3]))
                
                interactions_df = pd.read_csv(io.StringIO(csv_data))
                
                print(f"Loaded {len(interactions_df)} interaction records")
                print("Original headers:", interactions_df.columns.tolist())
                print("Column counts:", interactions_df.columns.value_counts().to_dict())
                
                # Clean up column names (strip whitespace)
                interactions_df.columns = interactions_df.columns.str.strip()
                
                # Handle duplicate columns by renaming them
                cols = interactions_df.columns.tolist()
                seen = {}
                new_cols = []
                for col in cols:
                    if col in seen:
                        seen[col] += 1
                        new_cols.append(f"{col}_{seen[col]}")
                        print(f"Renamed duplicate column '{col}' to '{col}_{seen[col]}'")
                    else:
                        seen[col] = 0
                        new_cols.append(col)
                
                interactions_df.columns = new_cols
                print("Headers after duplicate handling:", interactions_df.columns.tolist())
                
                # Remove any completely empty columns
                interactions_df = interactions_df.dropna(axis=1, how='all')
                print("Headers after removing empty columns:", interactions_df.columns.tolist())
                
                # Auto-fix common header variations and map to our expected headers
                header_mapping = {
                    # Current header -> Our expected header
                    'Rating': InteractionHeaders.RATINGS,
                    'Rating_1': InteractionHeaders.RATINGS,  # Handle duplicate
                    'rating': InteractionHeaders.RATINGS,
                    'ratings': InteractionHeaders.RATINGS,
                    'NumberOfPurchases': InteractionHeaders.PURCHASES,
                    'Purchases': InteractionHeaders.PURCHASES,
                    'purchase': InteractionHeaders.PURCHASES,
                    'Purchase': InteractionHeaders.PURCHASES,
                    'PurchaseCount': InteractionHeaders.PURCHASES,
                    'Email': InteractionHeaders.EMAIL,
                    'email': InteractionHeaders.EMAIL,
                    'CustomerID': InteractionHeaders.CUSTOMER_ID,
                    'ProductID': InteractionHeaders.PRODUCT_ID
                }
                
                # Apply header mapping
                rename_dict = {}
                for current_col in interactions_df.columns:
                    if current_col in header_mapping:
                        rename_dict[current_col] = header_mapping[current_col]
                
                interactions_df.rename(columns=rename_dict, inplace=True)
                print("Headers after mapping:", interactions_df.columns.tolist())
                
                # Handle Email column
                if InteractionHeaders.EMAIL not in interactions_df.columns:
                    interactions_df[InteractionHeaders.EMAIL] = "No Email Provided"
                else:
                    interactions_df[InteractionHeaders.EMAIL] = interactions_df[InteractionHeaders.EMAIL].fillna("No Email Provided")
                
                # Create missing required columns with default values
                required_columns = {
                    InteractionHeaders.PURCHASES: 1, 
                    InteractionHeaders.RATINGS: 4
                }
                
                columns_created = []
                for col_name, default_value in required_columns.items():
                    if col_name not in interactions_df.columns:
                        interactions_df[col_name] = default_value
                        columns_created.append(f"'{col_name}' (default: {default_value})")
                
                if columns_created:
                    debug_info['columns_auto_created'] = f"Auto-created columns: {', '.join(columns_created)}"
                
                # Ensure we have the core required columns
                required_core_columns = [InteractionHeaders.CUSTOMER_ID, InteractionHeaders.PRODUCT_ID]
                missing_core = [col for col in required_core_columns if col not in interactions_df.columns]
                if missing_core:
                    raise ValueError(f"Missing required columns: {missing_core}")
                
                # Convert numeric columns
                numeric_columns = [InteractionHeaders.PURCHASES, InteractionHeaders.RATINGS]
                for col in numeric_columns:
                    if col in interactions_df.columns:
                        interactions_df[col] = pd.to_numeric(interactions_df[col], errors='coerce').fillna(1 if col == InteractionHeaders.PURCHASES else 4)
                
                print("Final headers:", interactions_df.columns.tolist())
                print("Final data types:", interactions_df.dtypes.to_dict())
                print("Sample processed data:")
                print(interactions_df.head())
                
                uploaded_data['interactions'] = f"Loaded {len(interactions_df)} interaction records"
                debug_info['interactions_headers'] = list(interactions_df.columns)
                
            except Exception as e:
                print(f"Error processing interactions: {e}")
                traceback.print_exc()
                return jsonify({"error": f"Error processing interactions data: {str(e)}", "status": "error"}), 400
        
        print("Debug info:", debug_info)
        
        if not uploaded_data:
            print("ERROR: No valid CSV data provided")
            return jsonify({"error": "No valid CSV data provided", "status": "error"}), 400
        
        print("Step 5: Data upload successful. Processing analytics...")
        
        # Calculate analytics after upload
        analytics = calculate_basic_analytics()
        
        print("Step 6: Analytics completed, returning response...")
        recommended_rewards = train_model(interactions_df, customers_df, products_df, num_of_rewards)
        return jsonify({
            "message": "Data uploaded successfully", 
            "status": "success",
            "uploaded": uploaded_data,
            "debug_info": debug_info,  # Show actual headers for debugging
            "analytics": analytics,
            "recommended_rewards": recommended_rewards
        })
    
    except Exception as e:
        print(f"CRITICAL ERROR in upload endpoint: {e}")
        print(f"Error type: {type(e)}")
        traceback.print_exc()
        return jsonify({"error": str(e), "status": "error"}), 400



if __name__ == '__main__':
    port = int(os.environ.get('PORT', 10000))  # Default to 10000 if PORT not set
    app.run(host='0.0.0.0', port=port)