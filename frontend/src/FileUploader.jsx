import React, { useState } from 'react';
import { Users, Package, Blend, } from 'lucide-react';

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

  const [analytics, setAnalytics] = useState(null);

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
    setUploadStatus({ loading: true, success: false, error: null, message: 'Uploading...' });
    setAnalytics(null);

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
        
        // Set analytics data from upload response
        setAnalytics(result.analytics);
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

  const MetricCard = ({ title, value, subtitle, bgColor = "bg-blue-50", textColor = "text-blue-900" }) => (
    <div className={`${bgColor} p-4 rounded-lg border`}>
      <h3 className={`text-sm font-medium ${textColor} opacity-75`}>{title}</h3>
      <p className={`text-2xl font-bold ${textColor} mt-1`}>{value}</p>
      {subtitle && <p className={`text-sm ${textColor} opacity-60 mt-1`}>{subtitle}</p>}
    </div>
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <header className="text-center mb-3">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Data Upload & Analytics</h1>
      </header>
      
      {/* File Upload Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Upload CSV Files</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <div  className="flex items-center gap-2 mb-2">
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
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {uploadStatus.loading ? 'Uploading...' : 'Upload Data & Generate Analytics'}
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
              <div className="mt-3 p-3 bg-gray-100 rounded border">
                <p className="font-medium text-gray-800 mb-2">📋 Detected Headers (for debugging):</p>
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
                  <p><strong>Expected Interactions headers:</strong> CustomerID, ProductID, purchases, NumberOfClicks, interaction</p>
                  {uploadStatus.debugInfo.columns_auto_created && (
                    <p className="text-blue-600 mt-1"><strong>✨ {uploadStatus.debugInfo.columns_auto_created}</strong></p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Analytics Section */}
      {analytics && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">📊 Analytics Dashboard</h2>
          
          {/* Data Status */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-3">Data Status</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className={`flex items-center gap-2 ${analytics.data_loaded?.customers ? 'text-green-600' : 'text-red-600'}`}>
                <div className={`w-3 h-3 rounded-full ${analytics.data_loaded?.customers ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>Customers Data</span>
              </div>
              <div className={`flex items-center gap-2 ${analytics.data_loaded?.products ? 'text-green-600' : 'text-red-600'}`}>
                <div className={`w-3 h-3 rounded-full ${analytics.data_loaded?.products ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>Products Data</span>
              </div>
              <div className={`flex items-center gap-2 ${analytics.data_loaded?.interactions ? 'text-green-600' : 'text-red-600'}`}>
                <div className={`w-3 h-3 rounded-full ${analytics.data_loaded?.interactions ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>Interactions Data</span>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          {analytics.basic_stats && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  title="Average Purchases per User"
                  value={analytics.basic_stats.average_purchases_per_user || 'N/A'}
                  subtitle={analytics.basic_stats.total_customers ? `${analytics.basic_stats.total_customers} total users` : ''}
                  bgColor="bg-blue-50"
                  textColor="text-blue-900"
                />
                
                <MetricCard
                  title="User Retention Rate"
                  value={analytics.basic_stats.retention_rate_percentage ? `${analytics.basic_stats.retention_rate_percentage}%` : 'N/A'}
                  subtitle={analytics.basic_stats.repeat_customers ? `${analytics.basic_stats.repeat_customers} repeat customers` : ''}
                  bgColor="bg-green-50"
                  textColor="text-green-900"
                />
                
                <MetricCard
                  title="Total Purchases"
                  value={analytics.basic_stats.total_purchases || 'N/A'}
                  subtitle={analytics.basic_stats.total_clicks ? `${analytics.basic_stats.total_clicks} total clicks` : ''}
                  bgColor="bg-purple-50"
                  textColor="text-purple-900"
                />
                
                <MetricCard
                  title="Unique Users"
                  value={analytics.basic_stats.unique_users_count || 'N/A'}
                  subtitle="Active customers"
                  bgColor="bg-yellow-50"
                  textColor="text-yellow-900"
                />
              </div>

              {/* Revenue Metrics (if available) */}
              {analytics.basic_stats.total_revenue && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <MetricCard
                    title="Total Revenue"
                    value={formatCurrency(analytics.basic_stats.total_revenue)}
                    subtitle="Total sales amount"
                    bgColor="bg-emerald-50"
                    textColor="text-emerald-900"
                  />
                  
                  <MetricCard
                    title="Average Revenue per User"
                    value={formatCurrency(analytics.basic_stats.average_revenue_per_user)}
                    subtitle="Revenue per customer"
                    bgColor="bg-emerald-50"
                    textColor="text-emerald-900"
                  />
                </div>
              )}

              {/* Top Products */}
              {analytics.basic_stats.top_products && analytics.basic_stats.top_products.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4">🏆 Top Products</h3>
                  <div className="space-y-3">
                    {analytics.basic_stats.top_products.map((product, index) => (
                      <div key={product.product_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <span className="font-medium">#{index + 1} Product {product.product_id}</span>
                          {product.category && <span className="text-sm text-gray-600 ml-2">({product.category})</span>}
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{product.total_purchases} purchases</div>
                          {product.price && <div className="text-sm text-gray-600">{formatCurrency(product.price)} each</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {analytics.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-medium">Analytics Error</p>
              <p className="text-red-600 text-sm mt-1">{analytics.error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUploaderWithAnalytics;