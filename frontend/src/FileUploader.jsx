import React, { useState, useEffect } from 'react';
import { Upload, FileText, BarChart3, Gift, Users, ShoppingCart, Star, TrendingUp, Zap, AlertCircle, CheckCircle2, Clock, Mail } from 'lucide-react';

const FileUploader = () => {
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
  const [recommendations, setRecommendations] = useState(null);
  const [numRewards, setNumRewards] = useState(3);
  const [renderKey, setRenderKey] = useState(0);

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
    setRecommendations(null); // Clear previous recommendations
    setRenderKey(0);

    try {
      console.log('Making request to backend...');
      const response = await fetch('http://localhost:10000/upload_data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(csvData)
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('=== BACKEND RESPONSE ===');
      console.log('Full result:', result);
      console.log('Result status:', result.status);
      console.log('Result analytics:', result.analytics);
      console.log('Result recommendations:', result.recommended_rewards);
      console.log('====================');
      
      if (result.status === 'success') {
        setUploadStatus({
          loading: false,
          success: true,
          error: null,
          message: result.message,
          debugInfo: result.debug_info
        });
        
        // Set analytics
        console.log('Setting analytics to:', result.analytics);
        setAnalytics(result.analytics);
        
        // Set recommendations - Fixed the key name
        console.log('Setting recommendations to:', result.recommended_rewards);
        setRecommendations(result.recommended_rewards);

        setRenderKey(prev => prev + 1); // Force re-render
        
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
      console.error('Upload error:', error);
      setUploadStatus({
        loading: false,
        success: false,
        error: error.message,
        message: 'Upload failed'
      });
    }
  };

  const MetricCard = ({ title, value, subtitle, icon: Icon, bgColor = "bg-blue-50", textColor = "text-blue-900", borderColor = "border-blue-200" }) => (
    <div className={`${bgColor} ${borderColor} p-6 rounded-xl border-2 shadow-sm hover:shadow-md transition-all duration-300 min-h-[140px]`}>
      <div className="flex items-start justify-between mb-3">
        <h3 className={`text-sm font-medium ${textColor} opacity-75`}>{title}</h3>
        {Icon && <Icon className={`w-5 h-5 ${textColor} opacity-60`} />}
      </div>
      <p className={`text-3xl font-bold ${textColor} mb-2`}>{value}</p>
      {subtitle && <p className={`text-sm ${textColor} opacity-70`}>{subtitle}</p>}
    </div>
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50" key={renderKey}>
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Smart Analytics & Recommendations
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload your CSV files to generate powerful insights and personalized customer recommendations
          </p>
        </div>
        
        {/* File Upload Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <Upload className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-semibold text-gray-900">Upload CSV Files</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Customers CSV
              </label>
              <input 
                type="file" 
                accept=".csv"
                onChange={(e) => handleFileUpload('customers', e.target.files[0])}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:transition-colors"
              />
            </div>
            
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                Products CSV
              </label>
              <input 
                type="file" 
                accept=".csv"
                onChange={(e) => handleFileUpload('products', e.target.files[0])}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 file:transition-colors"
              />
            </div>
            
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Interactions CSV
              </label>
              <input 
                type="file" 
                accept=".csv"
                onChange={(e) => handleFileUpload('interactions', e.target.files[0])}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 file:transition-colors"
              />
            </div>
          </div>
          
          {/* File Status */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${csvData.customers ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
              {csvData.customers ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
              <span className="font-medium">Customers {csvData.customers ? 'Ready' : 'Pending'}</span>
            </div>
            
            <div className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${csvData.products ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
              {csvData.products ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
              <span className="font-medium">Products {csvData.products ? 'Ready' : 'Pending'}</span>
            </div>
            
            <div className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${csvData.interactions ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
              {csvData.interactions ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
              <span className="font-medium">Interactions {csvData.interactions ? 'Ready' : 'Pending'}</span>
            </div>
          </div>
          
          {/* Upload Button */}
          <button 
            onClick={uploadDataToBackend}
            disabled={(!csvData.customers && !csvData.products && !csvData.interactions) || uploadStatus.loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
          >
            {uploadStatus.loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Processing & Generating Recommendations...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Generate Analytics & Smart Recommendations
              </>
            )}
          </button>
          
          {/* Upload Status */}
          {uploadStatus.message && (
            <div className={`mt-6 p-6 rounded-xl border-2 ${
              uploadStatus.success ? 'bg-green-50 text-green-800 border-green-200' : 
              uploadStatus.error ? 'bg-red-50 text-red-800 border-red-200' : 
              'bg-blue-50 text-blue-800 border-blue-200'
            }`}>
              <div className="flex items-center gap-3 mb-2">
                {uploadStatus.success ? <CheckCircle2 className="w-5 h-5" /> : 
                 uploadStatus.error ? <AlertCircle className="w-5 h-5" /> : 
                 <FileText className="w-5 h-5" />}
                <p className="font-semibold">{uploadStatus.message}</p>
              </div>
              {uploadStatus.error && <p className="text-sm mt-2 ml-8">Error: {uploadStatus.error}</p>}
              
              {uploadStatus.debugInfo && (
                <div className="mt-4 p-4 bg-white/70 rounded-lg border">
                  <p className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Detected Headers
                  </p>
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
                </div>
              )}
            </div>
          )}
        </div>

        {/* Debug Section - Add this to see what's happening */}
        {(analytics || recommendations) && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6 shadow-lg">
            <h3 className="font-bold text-yellow-800 mb-4 flex items-center gap-3">
              <AlertCircle className="w-6 h-6" />
              Debug Information
            </h3>
            <div className="space-y-2 text-sm">
              <p><strong>Analytics exists:</strong> {analytics ? 'Yes' : 'No'}</p>
              <p><strong>Recommendations exists:</strong> {recommendations ? 'Yes' : 'No'}</p>
              {recommendations && (
                <div>
                  <p><strong>Recommendations type:</strong> {typeof recommendations}</p>
                  <p><strong>Recommendations keys:</strong> {typeof recommendations === 'object' ? Object.keys(recommendations).join(', ') : 'N/A'}</p>
                  <p><strong>Number of customers:</strong> {typeof recommendations === 'object' ? Object.keys(recommendations).length : 'N/A'}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analytics Section */}
        {(analytics && Object.keys(analytics).length > 0) && (
          <div className="space-y-8 pb-12" key={`analytics-${renderKey}`}>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-blue-600" />
                <h2 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h2>
              </div>
              <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            
            {/* Data Status */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <h3 className="text-xl font-semibold mb-6 text-gray-800 flex items-center gap-3">
                <FileText className="w-5 h-5 text-blue-600" />
                Data Status
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`flex items-center gap-4 p-6 rounded-xl border-2 transition-all ${analytics.data_loaded?.customers ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${analytics.data_loaded?.customers ? 'bg-green-500' : 'bg-red-500'}`}>
                    {analytics.data_loaded?.customers ? <CheckCircle2 className="w-4 h-4 text-white" /> : <AlertCircle className="w-4 h-4 text-white" />}
                  </div>
                  <span className="font-semibold">Customers Data</span>
                </div>
                <div className={`flex items-center gap-4 p-6 rounded-xl border-2 transition-all ${analytics.data_loaded?.products ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${analytics.data_loaded?.products ? 'bg-green-500' : 'bg-red-500'}`}>
                    {analytics.data_loaded?.products ? <CheckCircle2 className="w-4 h-4 text-white" /> : <AlertCircle className="w-4 h-4 text-white" />}
                  </div>
                  <span className="font-semibold">Products Data</span>
                </div>
                <div className={`flex items-center gap-4 p-6 rounded-xl border-2 transition-all ${analytics.data_loaded?.interactions ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${analytics.data_loaded?.interactions ? 'bg-green-500' : 'bg-red-500'}`}>
                    {analytics.data_loaded?.interactions ? <CheckCircle2 className="w-4 h-4 text-white" /> : <AlertCircle className="w-4 h-4 text-white" />}
                  </div>
                  <span className="font-semibold">Interactions Data</span>
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            {analytics.basic_stats && (
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <h3 className="text-xl font-semibold mb-8 text-gray-800 flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Key Performance Metrics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <MetricCard
                    title="Avg Purchases/User"
                    value={analytics.basic_stats.average_purchases_per_user || 'N/A'}
                    subtitle={analytics.basic_stats.total_customers ? `${analytics.basic_stats.total_customers} total users` : ''}
                    icon={ShoppingCart}
                    bgColor="bg-blue-50"
                    textColor="text-blue-900"
                    borderColor="border-blue-200"
                  />
                  
                  <MetricCard
                    title="Retention Rate"
                    value={analytics.basic_stats.retention_rate_percentage ? `${analytics.basic_stats.retention_rate_percentage}%` : 'N/A'}
                    subtitle={analytics.basic_stats.repeat_customers ? `${analytics.basic_stats.repeat_customers} repeat customers` : ''}
                    icon={Users}
                    bgColor="bg-green-50"
                    textColor="text-green-900"
                    borderColor="border-green-200"
                  />
                  
                  <MetricCard
                    title="Total Purchases"
                    value={analytics.basic_stats.total_purchases ? analytics.basic_stats.total_purchases.toLocaleString() : 'N/A'}
                    subtitle="All-time purchases"
                    icon={TrendingUp}
                    bgColor="bg-purple-50"
                    textColor="text-purple-900"
                    borderColor="border-purple-200"
                  />
                  
                  <MetricCard
                    title="Unique Users"
                    value={analytics.basic_stats.unique_users ? analytics.basic_stats.unique_users.toLocaleString() : 'N/A'}
                    subtitle="Active customers"
                    icon={Users}
                    bgColor="bg-orange-50"
                    textColor="text-orange-900"
                    borderColor="border-orange-200"
                  />
                </div>
              </div>
            )}

            {analytics.error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 shadow-lg">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-red-800 font-bold text-xl">Analytics Error</p>
                </div>
                <p className="text-red-600 ml-12">{analytics.error}</p>
              </div>
            )}
          </div>
        )}

        {/* Recommendations Section - Updated with better error handling */}
        {recommendations && (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-8">
              <Gift className="w-6 h-6 text-purple-600" />
              <h3 className="text-xl font-semibold text-gray-800">Personalized Recommendations & Rewards</h3>
            </div>
            
            {typeof recommendations === 'object' && Object.keys(recommendations).length > 0 ? (
              <div className="grid gap-6">
                {Object.entries(recommendations).map(([userId, userData], index) => (
                  <div key={userId} className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-200 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-bold text-purple-900 flex items-center gap-2">
                          <Users className="w-5 h-5" />
                          Customer #{userId}
                        </h4>
                        <div className="flex items-center gap-2 mt-2">
                          <Mail className="w-4 h-4 text-purple-600" />
                          <span className="text-sm text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
                            {userData?.email || 'No Email Provided'}
                          </span>
                        </div>
                      </div>
                      <div className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                        {userData?.rewards?.length || 0} Rewards
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h5 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                        <Gift className="w-4 h-4" />
                        Recommended Rewards:
                      </h5>
                      {userData?.rewards && userData.rewards.length > 0 ? (
                        <div className="grid gap-3">
                          {userData.rewards.map((reward, rewardIndex) => (
                            <div key={rewardIndex} className="bg-white p-4 rounded-lg border border-purple-200 shadow-sm">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                                    REWARD
                                  </div>
                                  <div>
                                    <span className="text-gray-800">{reward}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <span className="text-yellow-800">No rewards generated for this customer</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <span className="text-yellow-800 font-medium">No recommendations available</span>
                </div>
                <p className="text-yellow-700 mt-2 text-sm">
                  Recommendations might still be processing or there might be insufficient data to generate personalized recommendations.
                </p>
              </div>
            )}
            
            {/* Summary */}
            {typeof recommendations === 'object' && Object.keys(recommendations).length > 0 && (
              <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200">
                <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Recommendations Summary
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{Object.keys(recommendations).length}</div>
                    <div className="text-blue-800">Customers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {Object.values(recommendations).reduce((total, user) => total + (user?.rewards?.length || 0), 0)}
                    </div>
                    <div className="text-purple-800">Total Rewards</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {Object.values(recommendations).filter(user => user?.email && user.email !== "No Email Provided").length}
                    </div>
                    <div className="text-green-800">Email Ready</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Success Message */}
        {uploadStatus.success && (
          <div className="text-center bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-2xl p-8 shadow-lg">
            <div className="text-green-800 font-bold text-xl mb-3 flex items-center justify-center gap-3">
              <CheckCircle2 className="w-6 h-6" />
              Analytics Dashboard Successfully Generated!
            </div>
            <p className="text-green-700">
              Your data has been processed and all metrics are now available. 
              {recommendations ? " Smart recommendations have been generated automatically!" : " Upload completed successfully!"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploader;