import React, { useState } from 'react';
import { 
  Upload, 
  Users, 
  Package, 
  Activity, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  TrendingUp,
  Star,
  DollarSign,
  Mail,
  Send,
  Download,
  FileText,
  BarChart3,
  Eye,
  Shield,
  Sparkles,
  ArrowRight,
  Database
} from 'lucide-react';
import RecommendationsRenderer from './Recommendations';

const FileUploader = () => {
  const [csvData, setCsvData] = useState({
    customers: null,
    products: null,
    interactions: null
  });

  const [recommendations, setRecommendations] = useState(null);

  const [uploadStatus, setUploadStatus] = useState({
    loading: false,
    success: false,
    error: null,
    message: '',
    debugInfo: null
  });

  const [analytics, setAnalytics] = useState(null);
  const [renderKey, setRenderKey] = useState(0);

  const [sendModelId, setSendModelId] = useState('');
  const [emailStatus, setEmailStatus] = useState('');

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
    setRenderKey(0);

    try {
      console.log('Making request to backend...');
      const response = await fetch('https://lifehack-hackathon.onrender.com/upload_data', {
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
      console.log('====================');
      
      if (result.status === 'success') {
        setUploadStatus({
          loading: false,
          success: true,
          error: null,
          message: result.message,
          debugInfo: result.debug_info
        });
        
        console.log('Setting analytics to:', result.analytics);
        setAnalytics(result.analytics);
        setRecommendations(result.recommended_rewards);

        setRenderKey(prev => prev + 1);
        
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

  const sendBulkEmails = async () => {
    try {
      const response = await fetch(`https://lifehack-hackathon.onrender.com/send_rewards/${sendModelId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      const result = await response.json();
      if (response.ok) {
        setEmailStatus(`✅ Emails sent: ${result.sent_count}`);
      } else {
        setEmailStatus(`❌ Error: ${result.error}`);
      }
    } catch (err) {
      setEmailStatus(`❌ Email dispatch failed: ${err.message}`);
    }
  };

  const MetricCard = ({ title, value, subtitle, icon: Icon, bgColor = "from-blue-500/10 to-blue-600/5", textColor = "text-blue-700", iconColor = "text-blue-600" }) => (
    <div className={`relative overflow-hidden backdrop-blur-xl bg-gradient-to-br ${bgColor} border border-white/20 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105`}>
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/10 to-transparent rounded-full -translate-y-12 translate-x-12"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <Icon className={`w-7 h-7 ${iconColor}`} />
          <div className="w-2 h-2 bg-current rounded-full opacity-40"></div>
        </div>
        <h3 className={`text-sm font-medium ${textColor} opacity-80 mb-2 leading-relaxed`}>{title}</h3>
        <p className={`text-3xl font-bold ${textColor} mb-1 tracking-tight`}>{value}</p>
        {subtitle && <p className={`text-sm ${textColor} opacity-60 leading-relaxed`}>{subtitle}</p>}
      </div>
    </div>
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  console.log('=== RENDER DEBUG ===');
  console.log('Analytics state:', analytics);
  console.log('Render key:', renderKey);
  console.log('Should show analytics?', !!analytics);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20" key={renderKey}>
      <div className="max-w-7xl mx-auto p-8 space-y-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              LOYALYTICS
            </h1>
          </div>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Transform your customer data into actionable insights with AI-powered analytics and personalized rewards
          </p>
        </div>
        
        {/* File Upload Section */}
        <div className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-3xl shadow-2xl p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
              <Upload className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Data Upload Center</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Customers Upload */}
            <div className="group">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-blue-600" />
                <label className="text-lg font-semibold text-slate-700">Customer Data</label>
              </div>
              <div className="relative">
                <input 
                  type="file" 
                  accept=".csv"
                  onChange={(e) => handleFileUpload('customers', e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="border-2 border-dashed border-blue-300 rounded-2xl p-6 text-center hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-300 group-hover:scale-105 h-32 flex flex-col justify-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Database className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-sm font-medium text-slate-700 mb-2">Drop your CSV file here</p>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Required: CustomerID, Gender, AgeGroup
                  </p>
                </div>
              </div>
            </div>
            
            {/* Products Upload */}
            <div className="group">
              <div className="flex items-center gap-3 mb-4">
                <Package className="w-6 h-6 text-emerald-600" />
                <label className="text-lg font-semibold text-slate-700">Product Catalog</label>
              </div>
              <div className="relative">
                <input 
                  type="file" 
                  accept=".csv"
                  onChange={(e) => handleFileUpload('products', e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="border-2 border-dashed border-emerald-300 rounded-2xl p-6 text-center hover:border-emerald-500 hover:bg-emerald-50/50 transition-all duration-300 group-hover:scale-105 h-32 flex flex-col justify-center">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Package className="w-6 h-6 text-emerald-600" />
                  </div>
                  <p className="text-sm font-medium text-slate-700 mb-2">Drop your CSV file here</p>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Required: ProductID, ProductCategory, Price
                  </p>
                </div>
              </div>
            </div>
            
            {/* Interactions Upload */}
            <div className="group">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="w-6 h-6 text-purple-600" />
                <label className="text-lg font-semibold text-slate-700">Interaction History</label>
              </div>
              <div className="relative">
                <input 
                  type="file" 
                  accept=".csv"
                  onChange={(e) => handleFileUpload('interactions', e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="border-2 border-dashed border-purple-300 rounded-2xl p-6 text-center hover:border-purple-500 hover:bg-purple-50/50 transition-all duration-300 group-hover:scale-105 h-32 flex flex-col justify-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Activity className="w-6 h-6 text-purple-600" />
                  </div>
                  <p className="text-sm font-medium text-slate-700 mb-2">Drop your CSV file here</p>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Required: CustomerID, ProductID, Rating, NumberOfPurchases, Email
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* File Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className={`flex items-center gap-3 p-4 rounded-2xl backdrop-blur-sm transition-all duration-300 ${csvData.customers ? 'bg-emerald-100/70 border border-emerald-200' : 'bg-slate-100/70 border border-slate-200'}`}>
              {csvData.customers ? (
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              ) : (
                <XCircle className="w-5 h-5 text-slate-400" />
              )}
              <span className={`font-medium ${csvData.customers ? 'text-emerald-700' : 'text-slate-500'}`}>
                Customers {csvData.customers ? 'Ready' : 'Pending'}
              </span>
            </div>
            
            <div className={`flex items-center gap-3 p-4 rounded-2xl backdrop-blur-sm transition-all duration-300 ${csvData.products ? 'bg-emerald-100/70 border border-emerald-200' : 'bg-slate-100/70 border border-slate-200'}`}>
              {csvData.products ? (
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              ) : (
                <XCircle className="w-5 h-5 text-slate-400" />
              )}
              <span className={`font-medium ${csvData.products ? 'text-emerald-700' : 'text-slate-500'}`}>
                Products {csvData.products ? 'Ready' : 'Pending'}
              </span>
            </div>
            
            <div className={`flex items-center gap-3 p-4 rounded-2xl backdrop-blur-sm transition-all duration-300 ${csvData.interactions ? 'bg-emerald-100/70 border border-emerald-200' : 'bg-slate-100/70 border border-slate-200'}`}>
              {csvData.interactions ? (
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              ) : (
                <XCircle className="w-5 h-5 text-slate-400" />
              )}
              <span className={`font-medium ${csvData.interactions ? 'text-emerald-700' : 'text-slate-500'}`}>
                Interactions {csvData.interactions ? 'Ready' : 'Pending'}
              </span>
            </div>
          </div>
          
          {/* Upload Button */}
          <button 
            onClick={uploadDataToBackend}
            disabled={(!csvData.customers && !csvData.products && !csvData.interactions) || uploadStatus.loading}
            className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 disabled:from-slate-300 disabled:to-slate-400 text-white py-4 px-8 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3 group"
          >
            {uploadStatus.loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Processing Data...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                Generate Analytics & Recommendations
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </>
            )}
          </button>
          
          {/* Upload Status */}
          {uploadStatus.message && (
            <div className={`mt-6 p-6 rounded-2xl backdrop-blur-sm border transition-all duration-300 ${
              uploadStatus.success ? 'bg-emerald-50/80 text-emerald-800 border-emerald-200' : 
              uploadStatus.error ? 'bg-red-50/80 text-red-800 border-red-200' : 
              'bg-blue-50/80 text-blue-800 border-blue-200'
            }`}>
              <div className="flex items-center gap-3 mb-3">
                {uploadStatus.success ? (
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                ) : uploadStatus.error ? (
                  <XCircle className="w-6 h-6 text-red-600" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-blue-600" />
                )}
                <p className="font-semibold text-lg">{uploadStatus.message}</p>
              </div>
              {uploadStatus.error && <p className="text-sm mt-2 opacity-80">Error: {uploadStatus.error}</p>}
              
              {/* Debug Information */}
              {uploadStatus.debugInfo && (
                <div className="mt-4 p-4 bg-white/50 rounded-xl border border-white/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Eye className="w-5 h-5 text-slate-600" />
                    <p className="font-medium text-slate-800">Detected Headers</p>
                  </div>
                  {uploadStatus.debugInfo.customers_headers && (
                    <div className="mb-3">
                      <span className="font-medium text-blue-700 text-sm">Customers:</span>
                      <span className="text-sm ml-2 text-slate-600">{uploadStatus.debugInfo.customers_headers.join(', ')}</span>
                    </div>
                  )}
                  {uploadStatus.debugInfo.products_headers && (
                    <div className="mb-3">
                      <span className="font-medium text-emerald-700 text-sm">Products:</span>
                      <span className="text-sm ml-2 text-slate-600">{uploadStatus.debugInfo.products_headers.join(', ')}</span>
                    </div>
                  )}
                  {uploadStatus.debugInfo.interactions_headers && (
                    <div className="mb-3">
                      <span className="font-medium text-purple-700 text-sm">Interactions:</span>
                      <span className="text-sm ml-2 text-slate-600">{uploadStatus.debugInfo.interactions_headers.join(', ')}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Status Indicator */}
        <div className="backdrop-blur-xl bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-white/20 rounded-2xl shadow-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-bold text-blue-800">System Status</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-4 bg-white/50 rounded-xl">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-5 h-5 text-slate-600" />
                <span className="font-medium text-slate-700">Analytics Engine</span>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${analytics ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                <div className={`w-2 h-2 rounded-full ${analytics ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                {analytics ? 'Active' : 'Standby'}
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-white/50 rounded-xl">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-slate-600" />
                <span className="font-medium text-slate-700">Data Pipeline</span>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${uploadStatus.success ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                <div className={`w-2 h-2 rounded-full ${uploadStatus.success ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                {uploadStatus.success ? 'Connected' : 'Ready'}
              </div>
            </div>
          </div>
          {analytics && (
            <div className="mt-4 p-3 bg-white/30 rounded-xl">
              <p className="text-sm text-blue-700 font-medium">
                Available Modules: {Object.keys(analytics).join(', ')}
              </p>
            </div>
          )}
        </div>

        {/* Analytics Section */}
        {(analytics && Object.keys(analytics).length > 0) && (
          <div className="space-y-10" key={`analytics-${renderKey}`}>
            {/* Header */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Analytics Dashboard
                </h2>
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
              </div>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Deep insights into your customer behavior and business performance
              </p>
            </div>
            
            {/* Data Status Cards */}
            <div className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-3xl shadow-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <Database className="w-6 h-6 text-slate-600" />
                <h3 className="text-xl font-bold text-slate-800">Data Health Check</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`flex items-center gap-4 p-6 rounded-2xl border-2 transition-all duration-300 ${analytics.data_loaded?.customers ? 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200 shadow-lg' : 'bg-gradient-to-br from-red-50 to-pink-50 border-red-200'}`}>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${analytics.data_loaded?.customers ? 'bg-emerald-500' : 'bg-red-500'}`}>
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">Customer Data</p>
                    <p className={`text-sm ${analytics.data_loaded?.customers ? 'text-emerald-600' : 'text-red-600'}`}>
                      {analytics.data_loaded?.customers ? 'Loaded Successfully' : 'Not Available'}
                    </p>
                  </div>
                </div>
                
                <div className={`flex items-center gap-4 p-6 rounded-2xl border-2 transition-all duration-300 ${analytics.data_loaded?.products ? 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200 shadow-lg' : 'bg-gradient-to-br from-red-50 to-pink-50 border-red-200'}`}>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${analytics.data_loaded?.products ? 'bg-emerald-500' : 'bg-red-500'}`}>
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">Product Catalog</p>
                    <p className={`text-sm ${analytics.data_loaded?.products ? 'text-emerald-600' : 'text-red-600'}`}>
                      {analytics.data_loaded?.products ? 'Loaded Successfully' : 'Not Available'}
                    </p>
                  </div>
                </div>
                
                <div className={`flex items-center gap-4 p-6 rounded-2xl border-2 transition-all duration-300 ${analytics.data_loaded?.interactions ? 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200 shadow-lg' : 'bg-gradient-to-br from-red-50 to-pink-50 border-red-200'}`}>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${analytics.data_loaded?.interactions ? 'bg-emerald-500' : 'bg-red-500'}`}>
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">Interactions</p>
                    <p className={`text-sm ${analytics.data_loaded?.interactions ? 'text-emerald-600' : 'text-red-600'}`}>
                      {analytics.data_loaded?.interactions ? 'Loaded Successfully' : 'Not Available'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            {analytics.basic_stats && (
              <div className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-3xl shadow-2xl p-8">
                <div className="flex items-center gap-3 mb-8">
                  <TrendingUp className="w-6 h-6 text-slate-600" />
                  <h3 className="text-xl font-bold text-slate-800">Key Performance Metrics</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <MetricCard
                    title="Avg. Purchases per Customer"
                    value={analytics.basic_stats.average_purchases_per_user || 'N/A'}
                    subtitle={analytics.basic_stats.total_customers ? `${analytics.basic_stats.total_customers} total customers` : ''}
                    icon={TrendingUp}
                    bgColor="from-blue-500/10 to-cyan-500/5"
                    textColor="text-blue-700"
                    iconColor="text-blue-600"
                  />
                  
                  <MetricCard
                    title="Customer Retention Rate"
                    value={analytics.basic_stats.retention_rate_percentage ? `${analytics.basic_stats.retention_rate_percentage}%` : 'N/A'}
                    subtitle={analytics.basic_stats.repeat_customers ? `${analytics.basic_stats.repeat_customers} repeat customers` : ''}
                    icon={Users}
                    bgColor="from-emerald-500/10 to-green-500/5"
                    textColor="text-emerald-700"
                    iconColor="text-emerald-600"
                  />
                  
                  <MetricCard
                    title="Total Purchase Volume"
                    value={analytics.basic_stats.total_purchases ? analytics.basic_stats.total_purchases.toLocaleString() : 'N/A'}
                    subtitle="Lifetime transactions"
                    icon={Package}
                    bgColor="from-purple-500/10 to-violet-500/5"
                    textColor="text-purple-700"
                    iconColor="text-purple-600"
                  />
                  
                  <MetricCard
                    title="Active Customer Base"
                    value={analytics.basic_stats.unique_users ? analytics.basic_stats.unique_users.toLocaleString() : 'N/A'}
                    subtitle="Engaged customers"
                    icon={Activity}
                    bgColor="from-amber-500/10 to-yellow-500/5"
                    textColor="text-amber-700"
                    iconColor="text-amber-600"
                  />
                </div>
              </div>
            )}

            {/* Rating Analytics */}
            {analytics.basic_stats?.average_rating_overall && (
              <div className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-3xl shadow-2xl p-8">
                <div className="flex items-center gap-3 mb-8">
                  <Star className="w-6 h-6 text-amber-500" />
                  <h3 className="text-xl font-bold text-slate-800">Customer Satisfaction</h3>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <MetricCard
                    title="Average Customer Rating"
                    value={`${analytics.basic_stats.average_rating_overall}/5`}
                    subtitle={`Based on ${analytics.basic_stats.total_ratings_given || 0} customer reviews`}
                    icon={Star}
                    bgColor="from-amber-500/10 to-orange-500/5"
                    textColor="text-amber-700"
                    iconColor="text-amber-600"
                  />
                  
                  {analytics.basic_stats.rating_distribution && Object.keys(analytics.basic_stats.rating_distribution).length > 0 && (
                    <div className="backdrop-blur-sm bg-gradient-to-br from-amber-50/80 to-orange-50/60 border border-amber-200/50 rounded-2xl p-6 shadow-lg">
                      <div className="flex items-center gap-3 mb-6">
                        <Star className="w-6 h-6 text-amber-600" />
                        <h4 className="text-lg font-semibold text-amber-800">Rating Distribution</h4>
                      </div>
                      <div className="space-y-3">
                        {Object.entries(analytics.basic_stats.rating_distribution)
                          .sort(([a], [b]) => Number(b) - Number(a))
                          .map(([rating, count]) => (
                          <div key={rating} className="flex items-center justify-between p-3 bg-white/60 rounded-xl">
                            <div className="flex items-center gap-2">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`w-4 h-4 ${i < Number(rating) ? 'text-amber-400 fill-current' : 'text-slate-300'}`} 
                                  />
                                ))}
                              </div>
                              <span className="text-sm font-medium text-amber-800">{rating} stars</span>
                            </div>
                            <span className="font-semibold text-amber-900 bg-amber-100 px-3 py-1 rounded-full text-sm">
                              {count} reviews
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Top Products */}
            {(analytics.basic_stats?.top_sold_product || analytics.basic_stats?.top_rated_product) && (
              <div className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-3xl shadow-2xl p-8">
                <div className="flex items-center gap-3 mb-8">
                  <Package className="w-6 h-6 text-emerald-600" />
                  <h3 className="text-xl font-bold text-slate-800">Top Performing Products</h3>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {analytics.basic_stats.top_sold_product && (
                    <div className="backdrop-blur-sm bg-gradient-to-br from-blue-50/80 to-cyan-50/60 border border-blue-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center">
                          <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <h4 className="text-lg font-bold text-blue-800">Best Selling Product</h4>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-white/60 rounded-xl">
                          <span className="text-sm font-medium text-blue-700">Product ID</span>
                          <span className="font-semibold text-blue-900 bg-blue-100 px-3 py-1 rounded-full text-sm">
                            {analytics.basic_stats.top_sold_product.product_id}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white/60 rounded-xl">
                          <span className="text-sm font-medium text-blue-700">Total Sales</span>
                          <span className="font-semibold text-blue-900">
                            {analytics.basic_stats.top_sold_product.total_purchases.toLocaleString()} units
                          </span>
                        </div>
                        {analytics.basic_stats.top_sold_product.category && (
                          <div className="flex items-center justify-between p-3 bg-white/60 rounded-xl">
                            <span className="text-sm font-medium text-blue-700">Category</span>
                            <span className="font-semibold text-blue-900">
                              {analytics.basic_stats.top_sold_product.category}
                            </span>
                          </div>
                        )}
                        {analytics.basic_stats.top_sold_product.price && (
                          <div className="flex items-center justify-between p-3 bg-white/60 rounded-xl">
                            <span className="text-sm font-medium text-blue-700">Price</span>
                            <span className="font-semibold text-blue-900">
                              {formatCurrency(analytics.basic_stats.top_sold_product.price)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {analytics.basic_stats.top_rated_product && analytics.basic_stats.top_rated_product.product_id && (
                    <div className="backdrop-blur-sm bg-gradient-to-br from-emerald-50/80 to-green-50/60 border border-emerald-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center">
                          <Star className="w-6 h-6 text-white" />
                        </div>
                        <h4 className="text-lg font-bold text-emerald-800">Highest Rated Product</h4>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-white/60 rounded-xl">
                          <span className="text-sm font-medium text-emerald-700">Product ID</span>
                          <span className="font-semibold text-emerald-900 bg-emerald-100 px-3 py-1 rounded-full text-sm">
                            {analytics.basic_stats.top_rated_product.product_id}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white/60 rounded-xl">
                          <span className="text-sm font-medium text-emerald-700">Average Rating</span>
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`w-4 h-4 ${i < Math.floor(analytics.basic_stats.top_rated_product.average_rating) ? 'text-amber-400 fill-current' : 'text-slate-300'}`} 
                                />
                              ))}
                            </div>
                            <span className="font-semibold text-emerald-900">
                              {analytics.basic_stats.top_rated_product.average_rating}/5
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white/60 rounded-xl">
                          <span className="text-sm font-medium text-emerald-700">Review Count</span>
                          <span className="font-semibold text-emerald-900">
                            {analytics.basic_stats.top_rated_product.rating_count} reviews
                          </span>
                        </div>
                        {analytics.basic_stats.top_rated_product.category && (
                          <div className="flex items-center justify-between p-3 bg-white/60 rounded-xl">
                            <span className="text-sm font-medium text-emerald-700">Category</span>
                            <span className="font-semibold text-emerald-900">
                              {analytics.basic_stats.top_rated_product.category}
                            </span>
                          </div>
                        )}
                        {analytics.basic_stats.top_rated_product.price && (
                          <div className="flex items-center justify-between p-3 bg-white/60 rounded-xl">
                            <span className="text-sm font-medium text-emerald-700">Price</span>
                            <span className="font-semibold text-emerald-900">
                              {formatCurrency(analytics.basic_stats.top_rated_product.price)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {analytics.error && (
              <div className="backdrop-blur-xl bg-gradient-to-br from-red-50/80 to-pink-50/60 border border-red-200/50 rounded-2xl shadow-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center">
                    <XCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-red-800 font-bold text-lg">Analytics Processing Error</p>
                    <p className="text-red-600 text-sm">Something went wrong while processing your data</p>
                  </div>
                </div>
                <div className="p-4 bg-white/50 rounded-xl">
                  <p className="text-red-700 font-mono text-sm">{analytics.error}</p>
                </div>
              </div>
            )}

            {/* Success Message */}
            <div className="text-center backdrop-blur-xl bg-gradient-to-br from-emerald-50/80 to-green-50/60 border border-emerald-200/50 rounded-2xl shadow-xl p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <div className="text-emerald-800 font-bold text-2xl mb-3">
                🎉 Analytics Dashboard Ready!
              </div>
              <p className="text-emerald-600 text-lg max-w-2xl mx-auto leading-relaxed">
                Your comprehensive business intelligence dashboard has been generated successfully. 
                All metrics and insights are now available for strategic decision-making.
              </p>
            </div>
          </div>
        )}

        {/* Empty Analytics State */}
        {analytics && Object.keys(analytics).length === 0 && (
          <div className="backdrop-blur-xl bg-gradient-to-br from-amber-50/80 to-yellow-50/60 border border-amber-200/50 rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-bold text-amber-800 text-xl mb-3">Analytics Data Unavailable</h3>
            <p className="text-amber-700 leading-relaxed">
              The analytics engine received an empty dataset. Please verify your uploaded files contain valid data.
            </p>
          </div>
        )}

        {/* Email Campaign Section */}
        <div className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-3xl shadow-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Email Campaign Manager</h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Recommendation System ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter your recommendation system ID here..."
                  value={sendModelId}
                  onChange={(e) => setSendModelId(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-2xl bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 placeholder-slate-400"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Shield className="w-5 h-5 text-slate-400" />
                </div>
              </div>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={sendBulkEmails}
                disabled={!sendModelId}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-slate-300 disabled:to-slate-400 text-white py-3 px-6 rounded-2xl font-semibold disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3 group"
              >
                <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                Send Campaign
              </button>
            </div>
          </div>

          {emailStatus && (
            <div className="mt-6 p-4 bg-gradient-to-br from-blue-50/80 to-indigo-50/60 border border-blue-200/50 rounded-2xl">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-600" />
                <p className="font-medium text-blue-800">{emailStatus}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Recommendations Section */}
      {recommendations && (
        <div className="max-w-7xl mx-auto px-8 pb-12">
          <RecommendationsRenderer recommendationsData={recommendations} />
        </div>
      )}
    </div>
  );
};

export default FileUploader;