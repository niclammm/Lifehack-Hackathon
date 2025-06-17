import React, { useState } from 'react';

const RecommendationsRenderer = ({ recommendationsData }) => {
  const [copiedCode, setCopiedCode] = useState('');

  // Handle the case where recommendationsData might be nested
  const recommendations = recommendationsData?.recommended_rewards?.recommendations || 
                         recommendationsData?.recommendations || 
                         recommendationsData || {};

  const copyRewardCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const parseReward = (reward) => {
    const discountMatch = reward.match(/(\d+)% off/);
    const productMatch = reward.match(/off ([A-Z0-9]+)/);
    const codeMatch = reward.match(/<([^>]+)>/);
    
    return {
      discount: discountMatch ? discountMatch[1] : '0',
      product: productMatch ? productMatch[1] : 'Unknown',
      code: codeMatch ? codeMatch[1] : '',
      fullText: reward
    };
  };

  // If no recommendations data
  if (!recommendations || Object.keys(recommendations).length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <div className="text-4xl mb-3">🎁</div>
        <h3 className="text-lg font-medium text-gray-600 mb-2">No Recommendations Available</h3>
        <p className="text-gray-500">Upload your data first to generate personalized rewards.</p>
      </div>
    );
  }

  const totalCustomers = Object.keys(recommendations).length;
  const customersWithEmails = Object.values(recommendations).filter(
    userData => userData.email && userData.email !== "No Email Provided"
  ).length;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🎁</div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Personalized Rewards</h2>
              <p className="text-gray-600">AI-generated recommendations for your customers</p>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-medium">
              {totalCustomers} customers
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {customersWithEmails} with emails
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">👥</span>
              <span className="font-semibold text-blue-800">Total Customers</span>
            </div>
            <p className="text-2xl font-bold text-blue-600 mt-1">{totalCustomers}</p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">📧</span>
              <span className="font-semibold text-green-800">With Email</span>
            </div>
            <p className="text-2xl font-bold text-green-600 mt-1">{customersWithEmails}</p>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">🛍️</span>
              <span className="font-semibold text-purple-800">Total Rewards</span>
            </div>
            <p className="text-2xl font-bold text-purple-600 mt-1">
              {Object.values(recommendations).reduce((sum, userData) => sum + (userData.rewards?.length || 0), 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Customer Recommendations</h3>
        
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {Object.entries(recommendations).map(([userId, userData]) => (
            <div key={userId} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              {/* Customer Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {userId.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Customer {userId}</h4>
                    {userData.email && userData.email !== "No Email Provided" ? (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>📧</span>
                        <span>{userData.email}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span>📧</span>
                        <span>No email available</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    {userData.rewards?.length || 0} rewards
                  </span>
                </div>
              </div>

              {/* Rewards List */}
              {userData.rewards && userData.rewards.length > 0 ? (
                <div className="space-y-2">
                  {userData.rewards.map((reward, index) => {
                    const parsed = parseReward(reward);
                    return (
                      <div key={index} className="flex items-center justify-between bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-3 border border-orange-200">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex items-center gap-1">
                            <span className="text-orange-600">💰</span>
                            <span className="font-bold text-orange-700 text-lg">{parsed.discount}%</span>
                          </div>
                          <div className="text-gray-700">
                            <span className="font-medium">OFF</span>
                            <span className="ml-2 bg-white px-2 py-1 rounded border text-sm font-mono">
                              {parsed.product}
                            </span>
                          </div>
                        </div>
                        
                        {parsed.code && (
                          <button
                            onClick={() => copyRewardCode(parsed.code)}
                            className="flex items-center gap-2 bg-white px-3 py-2 rounded border border-gray-300 hover:bg-gray-50 transition-colors ml-3"
                            title="Copy reward code"
                          >
                            {copiedCode === parsed.code ? (
                              <>
                                <span className="text-green-600">✅</span>
                                <span className="text-green-600 font-medium text-sm">Copied!</span>
                              </>
                            ) : (
                              <>
                                <span className="text-gray-600">📋</span>
                                <span className="font-mono text-sm font-bold">{parsed.code}</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-2">🎁</div>
                  <p className="text-sm">No rewards generated for this customer</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Export Actions */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <strong>{customersWithEmails}</strong> customers ready for email campaigns
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                const data = JSON.stringify(recommendations, null, 2);
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'recommendations.json';
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              📄 Export JSON
            </button>
            <button 
              onClick={() => {
                let csvContent = "Customer ID,Email,Reward,Discount,Product,Code\n";
                Object.entries(recommendations).forEach(([userId, userData]) => {
                  userData.rewards?.forEach(reward => {
                    const parsed = parseReward(reward);
                    csvContent += `${userId},"${userData.email}","${reward}",${parsed.discount},${parsed.product},${parsed.code}\n`;
                  });
                });
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'recommendations.csv';
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm font-medium"
            >
              📊 Export CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendationsRenderer;