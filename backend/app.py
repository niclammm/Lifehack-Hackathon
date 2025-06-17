from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import io

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
    DISCOUNT_APPLIED = 'DiscountApplied(%)'  # Keep the (%) as in original

# Column name constants for interactions data
class InteractionHeaders:
    CUSTOMER_ID = 'CustomerID'
    PRODUCT_ID = 'ProductID'
    PURCHASES = 'purchases'
    NUMBER_OF_CLICKS = 'NumberOfClicks'
    INTERACTION = 'interaction'

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

customers_df = None # dataframe for customer metadata
products_df = None # product data e.g. price
interactions_df = None #interactions done per product purchased

def calculate_basic_analytics():
    """Calculate basic analytics and return as dictionary"""
    analytics = {
        "data_loaded": {
            "customers": customers_df is not None,
            "products": products_df is not None, 
            "interactions": interactions_df is not None
        },
        "basic_stats": {}
    }
    
    if interactions_df is not None:
        try:
            # Average purchases per user
            user_purchases = interactions_df.groupby(InteractionHeaders.CUSTOMER_ID)[InteractionHeaders.PURCHASES].sum()
            analytics["basic_stats"]["average_purchases_per_user"] = round(user_purchases.mean(), 2) if len(user_purchases) > 0 else 0
            
            # User retention
            repeat_customers = (user_purchases > 1).sum()
            total_customers = len(user_purchases)
            retention_rate = (repeat_customers / total_customers * 100) if total_customers > 0 else 0
            analytics["basic_stats"]["retention_rate_percentage"] = round(retention_rate, 2)
            analytics["basic_stats"]["repeat_customers"] = int(repeat_customers)
            analytics["basic_stats"]["total_customers"] = int(total_customers)
            
            # Top products (top 3 for quick view)
            product_purchases = interactions_df.groupby(InteractionHeaders.PRODUCT_ID)[InteractionHeaders.PURCHASES].sum().sort_values(ascending=False)
            top_products = []
            for product_id, purchases in product_purchases.head(3).items():
                product_info = {"product_id": product_id, "total_purchases": int(purchases)}
                if products_df is not None:
                    product_details = products_df[products_df[ProductHeaders.PRODUCT_ID] == product_id]
                    if not product_details.empty:
                        product_info["category"] = product_details.iloc[0][ProductHeaders.CATEGORY]
                        product_info["price"] = round(product_details.iloc[0][ProductHeaders.PRICE], 2)
                top_products.append(product_info)
            
            analytics["basic_stats"]["top_products"] = top_products
            
            # Unique users and totals
            analytics["basic_stats"]["unique_users_count"] = len(interactions_df[InteractionHeaders.CUSTOMER_ID].unique())
            analytics["basic_stats"]["total_purchases"] = int(interactions_df[InteractionHeaders.PURCHASES].sum())
            analytics["basic_stats"]["total_clicks"] = int(interactions_df[InteractionHeaders.NUMBER_OF_CLICKS].sum())
            
            # Calculate revenue if product data available
            if products_df is not None:
                merged_df = interactions_df.merge(products_df, on=ProductHeaders.PRODUCT_ID, how='left')
                merged_df['revenue'] = merged_df[InteractionHeaders.PURCHASES] * merged_df[ProductHeaders.PRICE]
                total_revenue = merged_df['revenue'].sum()
                user_revenue = merged_df.groupby(InteractionHeaders.CUSTOMER_ID)['revenue'].sum()
                
                analytics["basic_stats"]["total_revenue"] = round(total_revenue, 2)
                analytics["basic_stats"]["average_revenue_per_user"] = round(user_revenue.mean(), 2)
            
        except Exception as e:
            analytics["error"] = f"Error calculating analytics: {str(e)}"
    
    return analytics

@app.route('/upload_data', methods=['POST'])
def upload_data_json():
    """Upload CSV data as JSON strings and return basic analytics"""
    global customers_df, products_df, interactions_df
    
    try:
        data = request.get_json()
        uploaded_data = {}
        debug_info = {}
        
        # Process uploaded data with header debugging
        if 'customers' in data and data['customers']:
            customers_df = pd.read_csv(io.StringIO(data['customers']))
            uploaded_data['customers'] = f"Loaded {len(customers_df)} customer records"
            debug_info['customers_headers'] = list(customers_df.columns)
        
        if 'products' in data and data['products']:
            products_df = pd.read_csv(io.StringIO(data['products']))
            uploaded_data['products'] = f"Loaded {len(products_df)} product records"
            debug_info['products_headers'] = list(products_df.columns)
        
        if 'interactions' in data and data['interactions']:
            interactions_df = pd.read_csv(io.StringIO(data['interactions']))
            
            # Auto-fix common header variations
            header_fixes = {
                'Purchases': 'purchases',
                'purchase': 'purchases',
                'Purchase': 'purchases',
                'PurchaseCount': 'purchases',
                'Purchase Count': 'purchases',
                'InteractionScore': 'interaction',
                'Interaction Score': 'interaction'
            }
            
            # Apply header fixes
            for old_name, new_name in header_fixes.items():
                if old_name in interactions_df.columns:
                    interactions_df.rename(columns={old_name: new_name}, inplace=True)
            
            # Create missing required columns with default values
            required_columns = {
                'purchases': 1,           # Default: each row represents 1 purchase
                'NumberOfClicks': 1,      # Default: assume 1 click per interaction
                'interaction': 0.5        # Default: medium interaction score
            }
            
            columns_created = []
            for col_name, default_value in required_columns.items():
                if col_name not in interactions_df.columns:
                    interactions_df[col_name] = default_value
                    columns_created.append(f"'{col_name}' (default: {default_value})")
            
            if columns_created:
                debug_info['columns_auto_created'] = f"Auto-created columns: {', '.join(columns_created)}"
            
            uploaded_data['interactions'] = f"Loaded {len(interactions_df)} interaction records"
            debug_info['interactions_headers'] = list(interactions_df.columns)
        
        if not uploaded_data:
            return jsonify({"error": "No valid CSV data provided", "status": "error"}), 400
        
        # Calculate analytics after upload
        analytics = calculate_basic_analytics()
        
        return jsonify({
            "message": "Data uploaded successfully", 
            "status": "success",
            "uploaded": uploaded_data,
            "debug_info": debug_info,  # Show actual headers for debugging
            "analytics": analytics
        })
    
    except Exception as e:
        return jsonify({"error": str(e), "status": "error"}), 400

# Keep existing analytics endpoints for detailed views
@app.route('/analytics/average_purchase_per_user', methods=['GET'])
def average_purchase_per_user():
    """Calculate average purchases per user"""
    try:
        if interactions_df is None:
            return jsonify({"error": "No interaction data available"}), 404
        
        user_purchases = interactions_df.groupby(InteractionHeaders.CUSTOMER_ID)[InteractionHeaders.PURCHASES].sum()
        avg_purchases = user_purchases.mean()
        
        return jsonify({
            "average_purchases_per_user": round(avg_purchases, 2),
            "total_users": len(user_purchases),
            "total_purchases": int(user_purchases.sum())
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/analytics/user_retention', methods=['GET'])
def user_retention():
    """Calculate user retention (users with more than 1 purchase)"""
    try:
        if interactions_df is None:
            return jsonify({"error": "No interaction data available"}), 404
        
        user_purchases = interactions_df.groupby(InteractionHeaders.CUSTOMER_ID)[InteractionHeaders.PURCHASES].sum()
        repeat_customers = (user_purchases > 1).sum()
        total_customers = len(user_purchases)
        retention_rate = (repeat_customers / total_customers * 100) if total_customers > 0 else 0
        
        return jsonify({
            "retention_rate_percentage": round(retention_rate, 2),
            "repeat_customers": int(repeat_customers),
            "total_customers": int(total_customers),
            "one_time_customers": int(total_customers - repeat_customers)
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/analytics/top_products', methods=['GET'])
def top_products():
    """Get top purchased products"""
    try:
        if interactions_df is None:
            return jsonify({"error": "No interaction data available"}), 404
        
        product_purchases = interactions_df.groupby(InteractionHeaders.PRODUCT_ID)[InteractionHeaders.PURCHASES].sum().sort_values(ascending=False)
        
        top_products_list = []
        for product_id, purchases in product_purchases.head(10).items():
            product_info = {"product_id": product_id, "total_purchases": int(purchases)}
            
            if products_df is not None:
                product_details = products_df[products_df[ProductHeaders.PRODUCT_ID] == product_id]
                if not product_details.empty:
                    product_info.update({
                        "category": product_details.iloc[0][ProductHeaders.CATEGORY],
                        "price": round(product_details.iloc[0][ProductHeaders.PRICE], 2)
                    })
            
            top_products_list.append(product_info)
        
        return jsonify({
            "top_products": top_products_list,
            "total_products": len(product_purchases)
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/analytics/unique_users', methods=['GET'])
def unique_users():
    """Get unique users count and details"""
    try:
        if interactions_df is None:
            return jsonify({"error": "No interaction data available"}), 404
        
        unique_customer_ids = interactions_df[InteractionHeaders.CUSTOMER_ID].unique()
        unique_users_count = len(unique_customer_ids)
        
        user_details = []
        if customers_df is not None:
            for customer_id in unique_customer_ids:
                customer_info = {"customer_id": int(customer_id)}
                customer_details = customers_df[customers_df[CustomerHeaders.CUSTOMER_ID] == customer_id]
                
                if not customer_details.empty:
                    customer_info.update({
                        "gender": customer_details.iloc[0][CustomerHeaders.GENDER],
                        "age_group": customer_details.iloc[0][CustomerHeaders.AGE_GROUP]
                    })
                
                customer_purchases = interactions_df[interactions_df[InteractionHeaders.CUSTOMER_ID] == customer_id]
                customer_info.update({
                    "total_purchases": int(customer_purchases[InteractionHeaders.PURCHASES].sum()),
                    "total_clicks": int(customer_purchases[InteractionHeaders.NUMBER_OF_CLICKS].sum()),
                    "products_interacted": len(customer_purchases)
                })
                
                user_details.append(customer_info)
        else:
            for customer_id in unique_customer_ids:
                customer_purchases = interactions_df[interactions_df[InteractionHeaders.CUSTOMER_ID] == customer_id]
                user_details.append({
                    "customer_id": int(customer_id),
                    "total_purchases": int(customer_purchases[InteractionHeaders.PURCHASES].sum()),
                    "total_clicks": int(customer_purchases[InteractionHeaders.NUMBER_OF_CLICKS].sum()),
                    "products_interacted": len(customer_purchases)
                })
        
        return jsonify({
            "unique_users_count": unique_users_count,
            "user_details": user_details
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/analytics/dashboard', methods=['GET'])
def dashboard():
    """Get all analytics data in one endpoint"""
    try:
        return jsonify(calculate_basic_analytics())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)