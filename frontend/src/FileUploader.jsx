import React, { useState } from 'react';
import { Users, Package, Blend, Gift } from 'lucide-react';

const FileUploaderWithAnalytics = () => {
  const [csvData, setCsvData] = useState({
    customers: null,
    products: null,
    interactions: null
  });

  const [uploadStatus, setUploadStatus] = useState({
    loading: false,
    success: false,
    error: null,
    message: '',
    debugInfo: null
  });

  const [recommendations, setRecommendations] = useState(null);

  const handleFileUpload = (fileType, file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setCsvData(prev => ({
        ...prev,
        [fileType]: e.target.result
      }));
    };
    reader.readAsText(file);
  };

  const uploadDataToBackend = async () => {
    setUploadStatus({ loading: true, success: false, error: null, message: 'Training model and generating recommendations...' });
    setRecommendations(null);

    try {
      const response = await fetch('http://127.0.0.1:5000/upload_data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(csvData)
      });

      const result = await response.json();
      
      if (result.status === 'success') {
        setUploadStatus({
          loading: false,
          success: true,
          error: null,
          message: result.message,
          debugInfo: result.debug_info
        });
        
        // Set recommendations data from upload response
        if (result.recommended_rewards) {
          setRecommendations(result.recommended_rewards);
        }
      } else {
        setUploadStatus({
          loading: false,
          success: false,
          error: result.error,
          message: 'Upload failed',
          debugInfo: null
        });
      }
    } catch (error) {
      setUploadStatus({
        loading: false,
        success: false,
        error: error.message,
        message: 'Upload failed'
      });
    }
  };

  const RecommendationCard = ({ customerId, customerData }) => (
    <div className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 mb-3">
        <Gift className="w-5 h-5 text-purple-600" />
        <h3 className="font-semibold text-gray-900">Customer {customerId}</h3>
      </div>
      
      <div className="mb-3">
        <span className="text-sm text-gray-600">Email: </span>
        <span className={`text-sm font-medium ${customerData.email === "No Email Provided" ? 'text-red-600' : 'text-green-600'}`}>
          {customerData.email}
        </span>
      </div>
      
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">Recommended Rewards:</p>
        <ul className="space-y-2">
          {customerData.rewards.map((reward, index) => {
            // Extract discount percentage from reward string
            const discountMatch = reward.match(/(\d+)% off/);
            const discount = discountMatch ? parseInt(discountMatch[1]) : 0;
            
            return (
              <li key={index} className={`text-sm p-3 rounded border-l-4 ${
                discount > 0 
                  ? 'bg-green-50 border-green-400 text-green-800' 
                  : 'bg-gray-50 border-gray-400 text-gray-700'
              }`}>
                <div className="font-medium">{reward}</div>
                {discount > 0 && (
                  <div className="text-xs mt-1 opacity-75">Active discount available!</div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <header className="text-center mb-3">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Recommendation System</h1>
        <p className="text-gray-600">Upload your CSV files to generate personalized customer rewards</p>
      </header>
      
      {/* File Upload Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Upload CSV Files</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-6 h-6 text-blue-600 mb-2" />
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customers CSV:
              </label>
            </div>
            <input 
              type="file" 
              accept=".csv"
              onChange={(e) => handleFileUpload('customers', e.target.files[0])}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer cursor-pointer"
            />
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-6 h-6 text-green-600 mb-2" />
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Products CSV:
              </label>
            </div>
            <input 
              type="file" 
              accept=".csv"
              onChange={(e) => handleFileUpload('products', e.target.files[0])}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 file:cursor-pointer cursor-pointer"
            />
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Blend className="w-6 h-6 text-purple-600 mb-2" />
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interactions CSV:
              </label>
            </div>
            <input 
              type="file" 
              accept=".csv"
              onChange={(e) => handleFileUpload('interactions', e.target.files[0])}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 file:cursor-pointer cursor-pointer"
            />
          </div>
        </div>
        
        {/* File Status */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className={`flex items-center gap-2 ${csvData.customers ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-3 h-3 rounded-full ${csvData.customers ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span className="text-sm">Customers {csvData.customers ? 'Ready' : 'Not loaded'}</span>
          </div>
          
          <div className={`flex items-center gap-2 ${csvData.products ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-3 h-3 rounded-full ${csvData.products ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span className="text-sm">Products {csvData.products ? 'Ready' : 'Not loaded'}</span>
          </div>
          
          <div className={`flex items-center gap-2 ${csvData.interactions ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-3 h-3 rounded-full ${csvData.interactions ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span className="text-sm">Interactions {csvData.interactions ? 'Ready' : 'Not loaded'}</span>
          </div>
        </div>
        
        {/* Upload Button */}
        <button 
          onClick={uploadDataToBackend}
          disabled={(!csvData.customers && !csvData.products && !csvData.interactions) || uploadStatus.loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {uploadStatus.loading ? 'Training Model & Generating Recommendations...' : 'Upload Data & Generate Recommendations'}
        </button>
        
        {/* Upload Status */}
        {uploadStatus.message && (
          <div className={`mt-4 p-3 rounded-md ${
            uploadStatus.success ? 'bg-green-50 text-green-800 border border-green-200' : 
            uploadStatus.error ? 'bg-red-50 text-red-800 border border-red-200' : 
            'bg-blue-50 text-blue-800 border border-blue-200'
          }`}>
            <p className="font-medium">{uploadStatus.message}</p>
            {uploadStatus.error && <p className="text-sm mt-1">Error: {uploadStatus.error}</p>}
            
            {/* Debug Information */}
            {uploadStatus.debugInfo && (
              <details className="mt-3">
                <summary className="cursor-pointer font-medium text-gray-800 mb-2">📋 Detected Headers (click to expand)</summary>
                <div className="p-3 bg-gray-100 rounded border">
                  {uploadStatus.debugInfo.customers_headers && (
                    <div className="mb-2">
                      <span className="font-medium text-blue-700">Customers:</span>
                      <span className="text-sm ml-2">{uploadStatus.debugInfo.customers_headers.join(', ')}</span>
                    </div>
                  )}
                  {uploadStatus.debugInfo.products_headers && (
                    <div className="mb-2">
                      <span className="font-medium text-green-700">Products:</span>
                      <span className="text-sm ml-2">{uploadStatus.debugInfo.products_headers.join(', ')}</span>
                    </div>
                  )}
                  {uploadStatus.debugInfo.interactions_headers && (
                    <div className="mb-2">
                      <span className="font-medium text-purple-700">Interactions:</span>
                      <span className="text-sm ml-2">{uploadStatus.debugInfo.interactions_headers.join(', ')}</span>
                    </div>
                  )}
                  <div className="mt-2 text-xs text-gray-600">
                    <p><strong>Expected Interactions headers:</strong> CustomerID, ProductID, NumberOfPurchases, Rating, Email</p>
                    {uploadStatus.debugInfo.columns_auto_created && (
                      <p className="text-blue-600 mt-1"><strong>✨ {uploadStatus.debugInfo.columns_auto_created}</strong></p>
                    )}
                  </div>
                </div>
              </details>
            )}
          </div>
        )}
      </div>

      {/* Recommendations Section */}
      {recommendations && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Gift className="w-8 h-8 text-purple-600" />
            <div>
              <h2 className="text-2xl font-semibold text-gray-900"> Generated Recommendations</h2>
              <p className="text-gray-600">Personalized rewards based on LightFM collaborative filtering</p>
            </div>
          </div>
          
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="text-sm font-medium text-blue-900 opacity-75">Total Customers</h4>
              <p className="text-2xl font-bold text-blue-900 mt-1">{Object.keys(recommendations).length}</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="text-sm font-medium text-green-900 opacity-75">With Valid Email</h4>
              <p className="text-2xl font-bold text-green-900 mt-1">
                {Object.values(recommendations).filter(customer => customer.email !== "No Email Provided").length}
              </p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h4 className="text-sm font-medium text-purple-900 opacity-75">Total Rewards</h4>
              <p className="text-2xl font-bold text-purple-900 mt-1">
                {Object.values(recommendations).reduce((total, customer) => total + customer.rewards.length, 0)}
              </p>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h4 className="text-sm font-medium text-yellow-900 opacity-75">Active Discounts</h4>
              <p className="text-2xl font-bold text-yellow-900 mt-1">
                {Object.values(recommendations).reduce((total, customer) => 
                  total + customer.rewards.filter(reward => {
                    const discountMatch = reward.match(/(\d+)% off/);
                    return discountMatch && parseInt(discountMatch[1]) > 0;
                  }).length, 0
                )}
              </p>
            </div>
          </div>

          {/* Recommendations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Object.entries(recommendations).map(([customerId, customerData]) => (
              <RecommendationCard 
                key={customerId} 
                customerId={customerId} 
                customerData={customerData} 
              />
            ))}
          </div>

          {/* Export Section */}
          <div className="bg-gray-50 rounded-lg p-6 border">
            <h3 className="text-lg font-semibold mb-3">📤 Export Options</h3>
            <p className="text-gray-600 text-sm mb-4">
              Model trained successfully! Recommendations have been generated and can be exported for email campaigns.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  const dataStr = JSON.stringify(recommendations, null, 2);
                  const dataBlob = new Blob([dataStr], {type: 'application/json'});
                  const url = URL.createObjectURL(dataBlob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = 'recommendations.json';
                  link.click();
                }}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors text-sm"
              >
                Download JSON
              </button>
              <button 
                onClick={() => {
                  const csvContent = "Customer ID,Email,Rewards\n" + 
                    Object.entries(recommendations).map(([id, data]) => 
                      `"${id}","${data.email}","${data.rewards.join('; ')}"`
                    ).join('\n');
                  const csvBlob = new Blob([csvContent], {type: 'text/csv'});
                  const url = URL.createObjectURL(csvBlob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = 'recommendations.csv';
                  link.click();
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm"
              >
                Download CSV
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploaderWithAnalytics;