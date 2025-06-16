from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

@app.route('/test')
def get_data():
    return jsonify({'message': 'test test'})

if __name__ == '__main__':
    app.run(debug=True)
