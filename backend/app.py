from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import io

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

@app.route('/test')
def get_data():
    return jsonify({'message': 'test test'})


@app.route('/upload-csv', methods=['POST'])
def upload_csv():
    if 'csv_file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['csv_file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if file and file.filename.endswith('.csv'):
        # Read CSV content
        stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
        df = pd.read_csv(stream)
        
        # Process your CSV data here
        print(f"Received CSV with {len(df)} rows")
        
        return jsonify({
            'message': 'CSV uploaded successfully',
            'rows': len(df),
            'columns': list(df.columns)
        })
    
    return jsonify({'error': 'Invalid file format'}), 400

if __name__ == '__main__':
    app.run(debug=True)
