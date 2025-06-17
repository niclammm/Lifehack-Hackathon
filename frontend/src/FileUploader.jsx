// import React, { useState, useEffect } from 'react';

// const FileUploader = () => {
//   const [csvData, setCsvData] = useState({
//     customers: null,
//     products: null,
//     interactions: null
//   });

//   const [uploadStatus, setUploadStatus] = useState({
//     loading: false,
//     success: false,
//     error: null,
//     message: '',
//     debugInfo: null
//   });

//   const [analytics, setAnalytics] = useState(null);
//   const [renderKey, setRenderKey] = useState(0); // Force re-render

//   const handleFileUpload = (fileType, file) => {
//     if (!file) return;

//     const reader = new FileReader();
//     reader.onload = (e) => {
//       setCsvData(prev => ({
//         ...prev,
//         [fileType]: e.target.result
//       }));
//     };
//     reader.readAsText(file);
//   };

//   const uploadDataToBackend = async () => {
//     setUploadStatus({ loading: true, success: false, error: null, message: 'Uploading...' });
//     setAnalytics(null);
//     setRenderKey(0);

//     try {
//       console.log('Making request to backend...');
//       const response = await fetch('https://lifehack-hackathon.onrender.com/upload_data', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(csvData)
//       });

//       console.log('Response status:', response.status);
//       console.log('Response ok:', response.ok);

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const result = await response.json();
//       console.log('=== BACKEND RESPONSE ===');
//       console.log('Full result:', result);
//       console.log('Result status:', result.status);
//       console.log('Result analytics:', result.analytics);
//       console.log('====================');
      
//       if (result.status === 'success') {
//         setUploadStatus({
//           loading: false,
//           success: true,
//           error: null,
//           message: result.message,
//           debugInfo: result.debug_info
//         });
        
//         // Set analytics and force re-render
//         console.log('Setting analytics to:', result.analytics);
//         setAnalytics(result.analytics);
//         setRenderKey(prev => prev + 1); // Force re-render
        
//       } else {
//         setUploadStatus({
//           loading: false,
//           success: false,
//           error: result.error,
//           message: 'Upload failed',
//           debugInfo: null
//         });
//       }
//     } catch (error) {
//       console.error('Upload error:', error);
//       setUploadStatus({
//         loading: false,
//         success: false,
//         error: error.message,
//         message: 'Upload failed'
//       });
//     }
//   };

//   const MetricCard = ({ title, value, subtitle, bgColor = "bg-blue-50", textColor = "text-blue-900" }) => (
//     <div className={`${bgColor} p-4 rounded-lg border min-h-[120px]`}>
//       <h3 className={`text-sm font-medium ${textColor} opacity-75 mb-2`}>{title}</h3>
//       <p className={`text-2xl font-bold ${textColor} mb-1`}>{value}</p>
//       {subtitle && <p className={`text-sm ${textColor} opacity-60`}>{subtitle}</p>}
//     </div>
//   );

//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat('en-US', {
//       style: 'currency',
//       currency: 'USD'
//     }).format(amount);
//   };

//   // Force render check
//   console.log('=== RENDER DEBUG ===');
//   console.log('Analytics state:', analytics);
//   console.log('Render key:', renderKey);
//   console.log('Should show analytics?', !!analytics);

//   return (
//     <div className="min-h-screen bg-gray-50" key={renderKey}>
//       <div className="max-w-6xl mx-auto p-6 space-y-8">
//         <h1 className="text-3xl font-bold text-gray-900 mb-8">Data Upload & Analytics</h1>
        
//         {/* File Upload Section */}
//         <div className="bg-white rounded-lg shadow-md p-6">
//           <h2 className="text-xl font-semibold mb-4">Upload CSV Files</h2>
          
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Customers CSV:
//               </label>
//               <input 
//                 type="file" 
//                 accept=".csv"
//                 onChange={(e) => handleFileUpload('customers', e.target.files[0])}
//                 className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
//               />
//             </div>
            
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Products CSV:
//               </label>
//               <input 
//                 type="file" 
//                 accept=".csv"
//                 onChange={(e) => handleFileUpload('products', e.target.files[0])}
//                 className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
//               />
//             </div>
            
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Interactions CSV:
//               </label>
//               <input 
//                 type="file" 
//                 accept=".csv"
//                 onChange={(e) => handleFileUpload('interactions', e.target.files[0])}
//                 className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
//               />
//             </div>
//           </div>
          
//           {/* File Status */}
//           <div className="grid grid-cols-3 gap-4 mb-6">
//             <div className={`flex items-center gap-2 ${csvData.customers ? 'text-green-600' : 'text-gray-400'}`}>
//               <div className={`w-3 h-3 rounded-full ${csvData.customers ? 'bg-green-500' : 'bg-gray-300'}`}></div>
//               <span className="text-sm">Customers {csvData.customers ? 'Ready' : 'Not loaded'}</span>
//             </div>
            
//             <div className={`flex items-center gap-2 ${csvData.products ? 'text-green-600' : 'text-gray-400'}`}>
//               <div className={`w-3 h-3 rounded-full ${csvData.products ? 'bg-green-500' : 'bg-gray-300'}`}></div>
//               <span className="text-sm">Products {csvData.products ? 'Ready' : 'Not loaded'}</span>
//             </div>
            
//             <div className={`flex items-center gap-2 ${csvData.interactions ? 'text-green-600' : 'text-gray-400'}`}>
//               <div className={`w-3 h-3 rounded-full ${csvData.interactions ? 'bg-green-500' : 'bg-gray-300'}`}></div>
//               <span className="text-sm">Interactions {csvData.interactions ? 'Ready' : 'Not loaded'}</span>
//             </div>
//           </div>
          
//           {/* Upload Button */}
//           <button 
//             onClick={uploadDataToBackend}
//             disabled={(!csvData.customers && !csvData.products && !csvData.interactions) || uploadStatus.loading}
//             className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
//           >
//             {uploadStatus.loading ? 'Uploading...' : 'Upload Data & Generate Analytics'}
//           </button>
          
//           {/* Upload Status */}
//           {uploadStatus.message && (
//             <div className={`mt-4 p-4 rounded-md ${
//               uploadStatus.success ? 'bg-green-50 text-green-800 border border-green-200' : 
//               uploadStatus.error ? 'bg-red-50 text-red-800 border border-red-200' : 
//               'bg-blue-50 text-blue-800 border border-blue-200'
//             }`}>
//               <p className="font-medium">{uploadStatus.message}</p>
//               {uploadStatus.error && <p className="text-sm mt-1">Error: {uploadStatus.error}</p>}
              
//               {/* Debug Information */}
//               {uploadStatus.debugInfo && (
//                 <div className="mt-3 p-3 bg-gray-100 rounded border">
//                   <p className="font-medium text-gray-800 mb-2">📋 Detected Headers (for debugging):</p>
//                   {uploadStatus.debugInfo.customers_headers && (
//                     <div className="mb-2">
//                       <span className="font-medium text-blue-700">Customers:</span>
//                       <span className="text-sm ml-2">{uploadStatus.debugInfo.customers_headers.join(', ')}</span>
//                     </div>
//                   )}
//                   {uploadStatus.debugInfo.products_headers && (
//                     <div className="mb-2">
//                       <span className="font-medium text-green-700">Products:</span>
//                       <span className="text-sm ml-2">{uploadStatus.debugInfo.products_headers.join(', ')}</span>
//                     </div>
//                   )}
//                   {uploadStatus.debugInfo.interactions_headers && (
//                     <div className="mb-2">
//                       <span className="font-medium text-purple-700">Interactions:</span>
//                       <span className="text-sm ml-2">{uploadStatus.debugInfo.interactions_headers.join(', ')}</span>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
//           )}
//         </div>

//         {/* ALWAYS SHOW: Status indicator */}
//         <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//           <h3 className="font-bold text-blue-800 mb-2">🔍 Current Status</h3>
//           <div className="grid grid-cols-2 gap-4 text-sm">
//             <div>
//               <span className="font-medium">Analytics Data:</span>
//               <span className={`ml-2 px-2 py-1 rounded ${analytics ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
//                 {analytics ? 'LOADED ✅' : 'NOT LOADED ❌'}
//               </span>
//             </div>
//             <div>
//               <span className="font-medium">Render Key:</span>
//               <span className="ml-2 px-2 py-1 rounded bg-gray-100 text-gray-700">{renderKey}</span>
//             </div>
//           </div>
//           {analytics && (
//             <div className="mt-2 text-xs text-blue-600">
//               Available data: {Object.keys(analytics).join(', ')}
//             </div>
//           )}
//         </div>

//         {/* Analytics Section - Using multiple conditions to force render */}
//         {(analytics && Object.keys(analytics).length > 0) && (
//           <div className="space-y-8 pb-12" key={`analytics-${renderKey}`}>
//             <div className="flex items-center gap-3">
//               <h2 className="text-3xl font-bold text-gray-900">📊 Analytics Dashboard</h2>
//               <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
//             </div>
            
//             {/* Data Status */}
//             <div className="bg-white rounded-lg shadow-md p-6">
//               <h3 className="text-lg font-semibold mb-4 text-gray-800">Data Status</h3>
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                 <div className={`flex items-center gap-3 p-4 rounded-lg border-2 ${analytics.data_loaded?.customers ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
//                   <div className={`w-4 h-4 rounded-full ${analytics.data_loaded?.customers ? 'bg-green-500' : 'bg-red-500'}`}></div>
//                   <span className="font-medium">Customers Data</span>
//                 </div>
//                 <div className={`flex items-center gap-3 p-4 rounded-lg border-2 ${analytics.data_loaded?.products ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
//                   <div className={`w-4 h-4 rounded-full ${analytics.data_loaded?.products ? 'bg-green-500' : 'bg-red-500'}`}></div>
//                   <span className="font-medium">Products Data</span>
//                 </div>
//                 <div className={`flex items-center gap-3 p-4 rounded-lg border-2 ${analytics.data_loaded?.interactions ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
//                   <div className={`w-4 h-4 rounded-full ${analytics.data_loaded?.interactions ? 'bg-green-500' : 'bg-red-500'}`}></div>
//                   <span className="font-medium">Interactions Data</span>
//                 </div>
//               </div>
//             </div>

//             {/* Key Metrics */}
//             {analytics.basic_stats && (
//               <div className="bg-white rounded-lg shadow-md p-6">
//                 <h3 className="text-lg font-semibold mb-6 text-gray-800">Key Performance Metrics</h3>
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//                   <MetricCard
//                     title="Average Purchases per User"
//                     value={analytics.basic_stats.average_purchases_per_user || 'N/A'}
//                     subtitle={analytics.basic_stats.total_customers ? `${analytics.basic_stats.total_customers} total users` : ''}
//                     bgColor="bg-blue-50"
//                     textColor="text-blue-900"
//                   />
                  
//                   <MetricCard
//                     title="User Retention Rate"
//                     value={analytics.basic_stats.retention_rate_percentage ? `${analytics.basic_stats.retention_rate_percentage}%` : 'N/A'}
//                     subtitle={analytics.basic_stats.repeat_customers ? `${analytics.basic_stats.repeat_customers} repeat customers` : ''}
//                     bgColor="bg-green-50"
//                     textColor="text-green-900"
//                   />
                  
//                   <MetricCard
//                     title="Total Purchases"
//                     value={analytics.basic_stats.total_purchases ? analytics.basic_stats.total_purchases.toLocaleString() : 'N/A'}
//                     subtitle="All-time purchases"
//                     bgColor="bg-purple-50"
//                     textColor="text-purple-900"
//                   />
                  
//                   <MetricCard
//                     title="Unique Users"
//                     value={analytics.basic_stats.unique_users ? analytics.basic_stats.unique_users.toLocaleString() : 'N/A'}
//                     subtitle="Active customers"
//                     bgColor="bg-yellow-50"
//                     textColor="text-yellow-900"
//                   />
//                 </div>
//               </div>
//             )}

//             {/* Rating Analytics */}
//             {analytics.basic_stats?.average_rating_overall && (
//               <div className="bg-white rounded-lg shadow-md p-6">
//                 <h3 className="text-lg font-semibold mb-6 text-gray-800">⭐ Rating Analytics</h3>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <MetricCard
//                     title="Average Rating"
//                     value={`${analytics.basic_stats.average_rating_overall}/5`}
//                     subtitle={`${analytics.basic_stats.total_ratings_given || 0} ratings given`}
//                     bgColor="bg-orange-50"
//                     textColor="text-orange-900"
//                   />
                  
//                   {analytics.basic_stats.rating_distribution && Object.keys(analytics.basic_stats.rating_distribution).length > 0 && (
//                     <div className="bg-orange-50 p-6 rounded-lg border min-h-[120px]">
//                       <h3 className="text-sm font-medium text-orange-900 opacity-75 mb-3">Rating Distribution</h3>
//                       <div className="space-y-2">
//                         {Object.entries(analytics.basic_stats.rating_distribution)
//                           .sort(([a], [b]) => Number(b) - Number(a))
//                           .map(([rating, count]) => (
//                           <div key={rating} className="flex justify-between items-center text-sm">
//                             <span className="text-orange-800">⭐ {rating} stars:</span>
//                             <span className="font-semibold text-orange-900">{count} reviews</span>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}

//             {/* Top Products */}
//             {(analytics.basic_stats?.top_sold_product || analytics.basic_stats?.top_rated_product) && (
//               <div className="bg-white rounded-lg shadow-md p-6">
//                 <h3 className="text-lg font-semibold mb-6 text-gray-800">🏆 Top Performing Products</h3>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   {analytics.basic_stats.top_sold_product && (
//                     <div className="p-6 bg-blue-50 rounded-xl border-2 border-blue-200">
//                       <h4 className="font-bold text-blue-900 mb-4 text-lg flex items-center gap-2">
//                         🛒 Best Selling Product
//                       </h4>
//                       <div className="space-y-2 text-blue-800">
//                         <p><span className="font-semibold">Product ID:</span> {analytics.basic_stats.top_sold_product.product_id}</p>
//                         <p><span className="font-semibold">Total Sales:</span> {analytics.basic_stats.top_sold_product.total_purchases.toLocaleString()}</p>
//                         {analytics.basic_stats.top_sold_product.category && (
//                           <p><span className="font-semibold">Category:</span> {analytics.basic_stats.top_sold_product.category}</p>
//                         )}
//                         {analytics.basic_stats.top_sold_product.price && (
//                           <p><span className="font-semibold">Price:</span> {formatCurrency(analytics.basic_stats.top_sold_product.price)}</p>
//                         )}
//                       </div>
//                     </div>
//                   )}
                  
//                   {analytics.basic_stats.top_rated_product && analytics.basic_stats.top_rated_product.product_id && (
//                     <div className="p-6 bg-green-50 rounded-xl border-2 border-green-200">
//                       <h4 className="font-bold text-green-900 mb-4 text-lg flex items-center gap-2">
//                         ⭐ Highest Rated Product
//                       </h4>
//                       <div className="space-y-2 text-green-800">
//                         <p><span className="font-semibold">Product ID:</span> {analytics.basic_stats.top_rated_product.product_id}</p>
//                         <p><span className="font-semibold">Average Rating:</span> {analytics.basic_stats.top_rated_product.average_rating}/5</p>
//                         <p><span className="font-semibold">Review Count:</span> {analytics.basic_stats.top_rated_product.rating_count}</p>
//                         {analytics.basic_stats.top_rated_product.category && (
//                           <p><span className="font-semibold">Category:</span> {analytics.basic_stats.top_rated_product.category}</p>
//                         )}
//                         {analytics.basic_stats.top_rated_product.price && (
//                           <p><span className="font-semibold">Price:</span> {formatCurrency(analytics.basic_stats.top_rated_product.price)}</p>
//                         )}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}

//             {analytics.error && (
//               <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
//                 <div className="flex items-center gap-3 mb-2">
//                   <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
//                     <span className="text-white text-sm font-bold">!</span>
//                   </div>
//                   <p className="text-red-800 font-bold text-lg">Analytics Error</p>
//                 </div>
//                 <p className="text-red-600">{analytics.error}</p>
//               </div>
//             )}

//             {/* Success Message */}
//             <div className="text-center bg-green-50 border border-green-200 rounded-lg p-6">
//               <div className="text-green-800 font-semibold text-lg mb-2">
//                 🎉 Analytics Dashboard Loaded Successfully!
//               </div>
//               <p className="text-green-600 text-sm">
//                 Your data has been processed and all metrics are now available above.
//               </p>
//             </div>
//           </div>
//         )}

//         {/* If analytics exists but is empty */}
//         {analytics && Object.keys(analytics).length === 0 && (
//           <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
//             <h3 className="font-bold text-yellow-800 mb-2">⚠️ Empty Analytics Data</h3>
//             <p className="text-yellow-700">Analytics object exists but contains no data.</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default FileUploader;

import React, { useState, useEffect } from 'react';

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
  const [renderKey, setRenderKey] = useState(0); // Force re-render

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

  // const uploadDataToBackend = async () => {
  //   setUploadStatus({ loading: true, success: false, error: null, message: 'Uploading...' });
  //   setAnalytics(null);
  //   setRenderKey(0);

  //   try {
  //     console.log('Making request to backend...');
  //     const response = await fetch('http://127.0.0.1:10000/upload_data', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(csvData)
  //     });

  //     console.log('Response status:', response.status);
  //     console.log('Response ok:', response.ok);

  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }

  //     const result = await response.json();
  //     console.log('=== BACKEND RESPONSE ===');
  //     console.log('Full result:', result);
  //     console.log('Result status:', result.status);
  //     console.log('Result analytics:', result.analytics);
  //     console.log('====================');
      
  //     if (result.status === 'success') {
  //       setUploadStatus({
  //         loading: false,
  //         success: true,
  //         error: null,
  //         message: result.message,
  //         debugInfo: result.debug_info
  //       });
        
  //       // Set analytics and force re-render
  //       console.log('Setting analytics to:', result.analytics);
  //       setAnalytics(result.analytics);
  //       setRenderKey(prev => prev + 1); // Force re-render
        
  //     } else {
  //       setUploadStatus({
  //         loading: false,
  //         success: false,
  //         error: result.error,
  //         message: 'Upload failed',
  //         debugInfo: null
  //       });
  //     }
  //   } catch (error) {
  //     console.error('Upload error:', error);
  //     setUploadStatus({
  //       loading: false,
  //       success: false,
  //       error: error.message,
  //       message: 'Upload failed'
  //     });
  //   }
  // };

  // Updated upload function for better large file handling
const uploadDataToBackend = async () => {
  setUploadStatus({ loading: true, success: false, error: null, message: 'Uploading...' });
  setAnalytics(null);
  setRenderKey(0);

  try {
    console.log('Creating FormData for file upload...');
    const formData = new FormData();
    
    // Add files directly to FormData (much more efficient than JSON)
    const fileInputs = document.querySelectorAll('input[type="file"]');
    let hasFiles = false;
    
    fileInputs.forEach((input, index) => {
      if (input.files && input.files[0]) {
        const fileTypes = ['customers', 'products', 'interactions'];
        const fileType = fileTypes[index];
        formData.append(fileType, input.files[0]);
        hasFiles = true;
        console.log(`Added ${fileType} file: ${input.files[0].name} (${input.files[0].size} bytes)`);
      }
    });
    
    if (!hasFiles) {
      throw new Error('No files selected');
    }
    
    console.log('Making request to backend...');
    
    // Use the new file upload endpoint
    const response = await fetch('https://lifehack-hackathon.onrender.com/upload_files', {
      method: 'POST',
      body: formData,  // Send FormData directly, not JSON
      mode: 'no-cors'
      // Don't set Content-Type header - let browser set it with boundary for multipart
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const result = await response.json();
    console.log('=== BACKEND RESPONSE ===');
    console.log('Full result:', result);
    
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

  const MetricCard = ({ title, value, subtitle, bgColor = "bg-blue-50", textColor = "text-blue-900" }) => (
    <div className={`${bgColor} p-4 rounded-lg border min-h-[120px]`}>
      <h3 className={`text-sm font-medium ${textColor} opacity-75 mb-2`}>{title}</h3>
      <p className={`text-2xl font-bold ${textColor} mb-1`}>{value}</p>
      {subtitle && <p className={`text-sm ${textColor} opacity-60`}>{subtitle}</p>}
    </div>
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Force render check
  console.log('=== RENDER DEBUG ===');
  console.log('Analytics state:', analytics);
  console.log('Render key:', renderKey);
  console.log('Should show analytics?', !!analytics);

  return (
    <div className="min-h-screen bg-gray-50" key={renderKey}>
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Data Upload & Analytics</h1>
        
        {/* File Upload Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Upload CSV Files</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customers CSV:
              </label>
              <input 
                type="file" 
                accept=".csv"
                onChange={(e) => handleFileUpload('customers', e.target.files[0])}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Products CSV:
              </label>
              <input 
                type="file" 
                accept=".csv"
                onChange={(e) => handleFileUpload('products', e.target.files[0])}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interactions CSV:
              </label>
              <input 
                type="file" 
                accept=".csv"
                onChange={(e) => handleFileUpload('interactions', e.target.files[0])}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
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
            {uploadStatus.loading ? 'Uploading...' : 'Upload Data & Generate Analytics'}
          </button>
          
          {/* Upload Status */}
          {uploadStatus.message && (
            <div className={`mt-4 p-4 rounded-md ${
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
                </div>
              )}
            </div>
          )}
        </div>

        {/* ALWAYS SHOW: Status indicator */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-bold text-blue-800 mb-2">🔍 Current Status</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Analytics Data:</span>
              <span className={`ml-2 px-2 py-1 rounded ${analytics ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                {analytics ? 'LOADED ✅' : 'NOT LOADED ❌'}
              </span>
            </div>
            <div>
              <span className="font-medium">Render Key:</span>
              <span className="ml-2 px-2 py-1 rounded bg-gray-100 text-gray-700">{renderKey}</span>
            </div>
          </div>
          {analytics && (
            <div className="mt-2 text-xs text-blue-600">
              Available data: {Object.keys(analytics).join(', ')}
            </div>
          )}
        </div>

        {/* Analytics Section - Using multiple conditions to force render */}
        {(analytics && Object.keys(analytics).length > 0) && (
          <div className="space-y-8 pb-12" key={`analytics-${renderKey}`}>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold text-gray-900">📊 Analytics Dashboard</h2>
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            
            {/* Data Status */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Data Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`flex items-center gap-3 p-4 rounded-lg border-2 ${analytics.data_loaded?.customers ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                  <div className={`w-4 h-4 rounded-full ${analytics.data_loaded?.customers ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="font-medium">Customers Data</span>
                </div>
                <div className={`flex items-center gap-3 p-4 rounded-lg border-2 ${analytics.data_loaded?.products ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                  <div className={`w-4 h-4 rounded-full ${analytics.data_loaded?.products ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="font-medium">Products Data</span>
                </div>
                <div className={`flex items-center gap-3 p-4 rounded-lg border-2 ${analytics.data_loaded?.interactions ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                  <div className={`w-4 h-4 rounded-full ${analytics.data_loaded?.interactions ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="font-medium">Interactions Data</span>
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            {analytics.basic_stats && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-6 text-gray-800">Key Performance Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                    value={analytics.basic_stats.total_purchases ? analytics.basic_stats.total_purchases.toLocaleString() : 'N/A'}
                    subtitle="All-time purchases"
                    bgColor="bg-purple-50"
                    textColor="text-purple-900"
                  />
                  
                  <MetricCard
                    title="Unique Users"
                    value={analytics.basic_stats.unique_users ? analytics.basic_stats.unique_users.toLocaleString() : 'N/A'}
                    subtitle="Active customers"
                    bgColor="bg-yellow-50"
                    textColor="text-yellow-900"
                  />
                </div>
              </div>
            )}

            {/* Rating Analytics */}
            {analytics.basic_stats?.average_rating_overall && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-6 text-gray-800">⭐ Rating Analytics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <MetricCard
                    title="Average Rating"
                    value={`${analytics.basic_stats.average_rating_overall}/5`}
                    subtitle={`${analytics.basic_stats.total_ratings_given || 0} ratings given`}
                    bgColor="bg-orange-50"
                    textColor="text-orange-900"
                  />
                  
                  {analytics.basic_stats.rating_distribution && Object.keys(analytics.basic_stats.rating_distribution).length > 0 && (
                    <div className="bg-orange-50 p-6 rounded-lg border min-h-[120px]">
                      <h3 className="text-sm font-medium text-orange-900 opacity-75 mb-3">Rating Distribution</h3>
                      <div className="space-y-2">
                        {Object.entries(analytics.basic_stats.rating_distribution)
                          .sort(([a], [b]) => Number(b) - Number(a))
                          .map(([rating, count]) => (
                          <div key={rating} className="flex justify-between items-center text-sm">
                            <span className="text-orange-800">⭐ {rating} stars:</span>
                            <span className="font-semibold text-orange-900">{count} reviews</span>
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
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-6 text-gray-800">🏆 Top Performing Products</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {analytics.basic_stats.top_sold_product && (
                    <div className="p-6 bg-blue-50 rounded-xl border-2 border-blue-200">
                      <h4 className="font-bold text-blue-900 mb-4 text-lg flex items-center gap-2">
                        🛒 Best Selling Product
                      </h4>
                      <div className="space-y-2 text-blue-800">
                        <p><span className="font-semibold">Product ID:</span> {analytics.basic_stats.top_sold_product.product_id}</p>
                        <p><span className="font-semibold">Total Sales:</span> {analytics.basic_stats.top_sold_product.total_purchases.toLocaleString()}</p>
                        {analytics.basic_stats.top_sold_product.category && (
                          <p><span className="font-semibold">Category:</span> {analytics.basic_stats.top_sold_product.category}</p>
                        )}
                        {analytics.basic_stats.top_sold_product.price && (
                          <p><span className="font-semibold">Price:</span> {formatCurrency(analytics.basic_stats.top_sold_product.price)}</p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {analytics.basic_stats.top_rated_product && analytics.basic_stats.top_rated_product.product_id && (
                    <div className="p-6 bg-green-50 rounded-xl border-2 border-green-200">
                      <h4 className="font-bold text-green-900 mb-4 text-lg flex items-center gap-2">
                        ⭐ Highest Rated Product
                      </h4>
                      <div className="space-y-2 text-green-800">
                        <p><span className="font-semibold">Product ID:</span> {analytics.basic_stats.top_rated_product.product_id}</p>
                        <p><span className="font-semibold">Average Rating:</span> {analytics.basic_stats.top_rated_product.average_rating}/5</p>
                        <p><span className="font-semibold">Review Count:</span> {analytics.basic_stats.top_rated_product.rating_count}</p>
                        {analytics.basic_stats.top_rated_product.category && (
                          <p><span className="font-semibold">Category:</span> {analytics.basic_stats.top_rated_product.category}</p>
                        )}
                        {analytics.basic_stats.top_rated_product.price && (
                          <p><span className="font-semibold">Price:</span> {formatCurrency(analytics.basic_stats.top_rated_product.price)}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {analytics.error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">!</span>
                  </div>
                  <p className="text-red-800 font-bold text-lg">Analytics Error</p>
                </div>
                <p className="text-red-600">{analytics.error}</p>
              </div>
            )}

            {/* Success Message */}
            <div className="text-center bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="text-green-800 font-semibold text-lg mb-2">
                🎉 Analytics Dashboard Loaded Successfully!
              </div>
              <p className="text-green-600 text-sm">
                Your data has been processed and all metrics are now available above.
              </p>
            </div>
          </div>
        )}

        {/* If analytics exists but is empty */}
        {analytics && Object.keys(analytics).length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="font-bold text-yellow-800 mb-2">⚠️ Empty Analytics Data</h3>
            <p className="text-yellow-700">Analytics object exists but contains no data.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploader;