import React, { useState } from 'react';
import { 
  Gift, 
  Users, 
  Mail, 
  MailCheck, 
  Download, 
  FileText, 
  Copy, 
  Check, 
  AlertCircle,
  DollarSign,
  Tag,
  Code,
  Sparkles,
  TrendingUp,
  BarChart3,
  User,
  X,
  Database
} from 'lucide-react';

const RecommendationsRenderer = ({ recommendationsData }) => {
  const [copiedCode, setCopiedCode] = useState('');
  const [showModelIdPopup, setShowModelIdPopup] = useState(true);

  // Handle the case where recommendationsData might be nested
  const recommendations = recommendationsData?.recommended_rewards?.recommendations || 
                         recommendationsData?.recommendations || 
                         recommendationsData || {};

  const modelId = recommendationsData?.recommended_rewards?.model_id || 
                  recommendationsData?.model_id || 
                  null;

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
      <div className="backdrop-blur-xl bg-gradient-to-br from-slate-50/80 to-gray-50/60 border border-white/20 rounded-3xl shadow-2xl p-8 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-slate-400 to-gray-500 rounded-3xl flex items-center justify-center mx-auto mb-4">
          <Gift className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-slate-600 mb-3">No Recommendations Available</h3>
        <p className="text-slate-500 leading-relaxed max-w-md mx-auto">
          Upload your customer data first to generate personalized reward recommendations using our AI engine.
        </p>
      </div>
    );
  }

  const totalCustomers = Object.keys(recommendations).length;
  const customersWithEmails = Object.values(recommendations).filter(
    userData => userData.email && userData.email !== "No Email Provided"
  ).length;

  return (
    <div className="space-y-8">
      {/* Model ID Popup */}
      {modelId && showModelIdPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div className="backdrop-blur-xl bg-white/90 border border-white/20 rounded-3xl shadow-2xl p-8 text-center max-w-md mx-4">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-4">System Ready!</h3>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Your recommendation engine has been successfully built. Store this ID for future campaigns:
            </p>
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200/50 mb-6">
              <code className="text-lg font-mono text-blue-800 break-all">{modelId}</code>
            </div>
            <button
              onClick={() => setShowModelIdPopup(false)}
              className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white py-3 px-6 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Continue to Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Model ID Display */}
      {modelId && (
        <div className="backdrop-blur-xl bg-gradient-to-br from-emerald-50/80 to-green-50/60 border border-emerald-200/50 rounded-2xl shadow-xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-emerald-800 text-lg">Recommendation System Active</p>
              <p className="text-emerald-600 text-sm">Store this ID for future email campaigns</p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-white/60 rounded-xl">
            <code className="text-sm font-mono text-emerald-800">{modelId}</code>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-3xl shadow-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl flex items-center justify-center shadow-lg">
              <Gift className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent">
                AI-Powered Rewards
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed">
                Personalized recommendations tailored for each customer
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-2xl font-bold text-lg shadow-lg">
              {totalCustomers} customers
            </div>
            <div className="text-sm text-slate-500 mt-2 font-medium">
              {customersWithEmails} ready for email campaigns
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="backdrop-blur-sm bg-gradient-to-br from-blue-50/80 to-cyan-50/60 border border-blue-200/50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-blue-800 text-lg">Total Customers</span>
            </div>
            <p className="text-3xl font-bold text-blue-600">{totalCustomers}</p>
          </div>
          
          <div className="backdrop-blur-sm bg-gradient-to-br from-emerald-50/80 to-green-50/60 border border-emerald-200/50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center">
                <MailCheck className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-emerald-800 text-lg">Email Ready</span>
            </div>
            <p className="text-3xl font-bold text-emerald-600">{customersWithEmails}</p>
          </div>
          
          <div className="backdrop-blur-sm bg-gradient-to-br from-purple-50/80 to-violet-50/60 border border-purple-200/50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center">
                <Tag className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-purple-800 text-lg">Total Rewards</span>
            </div>
            <p className="text-3xl font-bold text-purple-600">
              {Object.values(recommendations).reduce((sum, userData) => sum + (userData.rewards?.length || 0), 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="backdrop-blur-xl bg-white/70 border border-white/20 rounded-3xl shadow-2xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-6 h-6 text-slate-600" />
          <h3 className="text-2xl font-bold text-slate-800">Customer Recommendations</h3>
        </div>
        
        <div className="space-y-6 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
          {Object.entries(recommendations).map(([userId, userData]) => (
            <div key={userId} className="backdrop-blur-sm bg-gradient-to-br from-white/60 to-slate-50/40 border border-white/30 rounded-2xl p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
              {/* Customer Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    <User className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg">Customer {userId}</h4>
                    {userData.email && userData.email !== "No Email Provided" ? (
                      <div className="flex items-center gap-2 text-emerald-600 mt-1">
                        <MailCheck className="w-4 h-4" />
                        <span className="text-sm font-medium">{userData.email}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-slate-400 mt-1">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">No email available</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-xl font-bold shadow-lg">
                    {userData.rewards?.length || 0} rewards
                  </div>
                </div>
              </div>

              {/* Rewards List */}
              {userData.rewards && userData.rewards.length > 0 ? (
                <div className="space-y-4">
                  {userData.rewards.map((reward, index) => {
                    const parsed = parseReward(reward);
                    return (
                      <div key={index} className="backdrop-blur-sm bg-gradient-to-r from-orange-50/80 to-red-50/80 border border-orange-200/50 rounded-2xl p-4 hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="flex items-center gap-2">
                              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <span className="font-bold text-orange-700 text-2xl">{parsed.discount}%</span>
                                <p className="text-orange-600 text-sm font-medium">OFF</p>
                              </div>
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <span className="text-slate-600 font-medium">Product:</span>
                                <span className="bg-white px-3 py-1 rounded-xl border border-slate-200 font-mono text-sm font-bold text-slate-700">
                                  {parsed.product}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {parsed.code && (
                            <button
                              onClick={() => copyRewardCode(parsed.code)}
                              className="flex items-center gap-3 bg-white hover:bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 hover:border-slate-300 transition-all duration-300 ml-4 group"
                              title="Copy reward code"
                            >
                              {copiedCode === parsed.code ? (
                                <>
                                  <Check className="w-5 h-5 text-emerald-600" />
                                  <span className="text-emerald-600 font-bold text-sm">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-5 h-5 text-slate-600 group-hover:text-slate-800" />
                                  <span className="font-mono text-sm font-bold text-slate-700 group-hover:text-slate-900">
                                    {parsed.code}
                                  </span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 backdrop-blur-sm bg-slate-50/60 rounded-2xl border border-slate-200/50">
                  <div className="w-16 h-16 bg-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Gift className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500 font-medium">No rewards generated for this customer</p>
                  <p className="text-slate-400 text-sm mt-1">Try adjusting recommendation parameters</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Export Actions */}
      <div className="backdrop-blur-xl bg-gradient-to-br from-slate-50/80 to-gray-50/60 border border-white/20 rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-slate-600" />
            <div>
              <p className="font-bold text-slate-800 text-lg">Export Campaign Data</p>
              <p className="text-slate-600 text-sm">
                <strong>{customersWithEmails}</strong> customers ready for email marketing campaigns
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
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
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl group"
            >
              <FileText className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              Export JSON
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
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl group"
            >
              <Download className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              Export CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendationsRenderer;