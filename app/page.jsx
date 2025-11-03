'use client';
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Search, Zap, CreditCard, Calendar, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

export default function HomePage() {
  const [consumerId, setConsumerId] = useState('');
  const [bill, setBill] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchBill = async () => {
    // Validation: Check if consumer ID is empty
    if (!consumerId.trim()) {
      setError('Please enter a Consumer ID');
      return;
    }

    setLoading(true);
    setError('');
    setBill(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError('Please login to view your bill');
        setLoading(false);
        return;
      }

      const res = await fetch(`/api/client/getBill?consumer_id=${consumerId.trim()}`, {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });
      const result = await res.json();

      if (!res.ok) {
        // Handle specific error cases
        if (res.status === 404) {
          setError('No bill found for this Consumer ID. Please check and try again.');
        } else if (res.status === 401) {
          setError('Unauthorized access. Please login again.');
        } else if (res.status === 403) {
          setError('You do not have permission to view this bill.');
        } else {
          setError(result.error || 'Unable to fetch bill. Please try again later.');
        }
      } else {
        // Check if bill data exists
        if (!result.bill) {
          setError('No bill found for this Consumer ID. Please verify your Consumer ID and try again.');
        } else {
          setBill(result.bill);
        }
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
      console.error('Fetch bill error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && consumerId.trim() && !loading) {
      fetchBill();
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4 transform hover:scale-110 transition-transform duration-300">
            <Zap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Electric Bill Lookup
          </h1>
          <p className="text-gray-600">Enter your consumer ID to view your bill details</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100">
          {/* Search Section */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Consumer ID
              <span className="text-gray-500 font-normal ml-2">(as mentioned on your bill)</span>
            </label>
            <div className="relative">
              <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={consumerId}
                onChange={(e) => {
                  setConsumerId(e.target.value);
                  // Clear error when user starts typing
                  if (error) setError('');
                }}
                onKeyPress={handleKeyPress}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white text-lg"
                placeholder="e.g., C12345"
              />
            </div>
          </div>

          <button
            onClick={fetchBill}
            disabled={loading || !consumerId.trim()}
            className={`w-full py-4 rounded-xl font-semibold text-white text-lg transition-all duration-300 transform flex items-center justify-center gap-3 ${
              loading || !consumerId.trim()
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:scale-105'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Fetching Bill...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Get Bill Details
              </>
            )}
          </button>

          {/* Error Message */}
          {error && (
            <div className="mt-6 bg-red-50 border-2 border-red-200 rounded-xl p-4 animate-fade-in">
              <div className="flex items-start gap-3">
                <div className="bg-red-100 p-2 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-red-800 mb-1">Error</h3>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Bill Details */}
          {bill && (
            <div className="mt-6 animate-fade-in">
              {/* Success Banner */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-800">Bill Found!</h3>
                    <p className="text-green-700 text-sm">Your bill details are displayed below</p>
                  </div>
                </div>
              </div>

              {/* Bill Information Card */}
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-gray-200 rounded-2xl p-6 space-y-4">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-600" />
                  Bill Details
                </h2>

                {/* Consumer ID */}
                <div className="bg-white rounded-xl p-4 border border-gray-200 duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Consumer ID</p>
                        <p className="text-lg font-bold text-gray-900">{bill.consumer_id}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bill Amount */}
                <div className="bg-white rounded-xl p-4 border border-gray-200 duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-emerald-100 p-2 rounded-lg">
                        <Zap className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Bill Amount</p>
                        <p className="text-2xl font-bold text-emerald-600">₹{parseFloat(bill.bill_amount).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Due Date */}
                <div className="bg-white rounded-xl p-4 border border-gray-200 duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-violet-100 p-2 rounded-lg">
                        <Calendar className="w-5 h-5 text-violet-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Due Date</p>
                        <p className="text-lg font-bold text-gray-900">
                          {new Date(bill.due_date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pay Now Button */}
                <button className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-4 rounded-xl font-semibold hover:from-emerald-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 mt-4">
                  Pay Now
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="text-center mt-6 text-sm text-gray-600">
          <p>Need help? Contact customer support at <span className="font-semibold text-blue-600">1800-XXX-XXXX</span></p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </main>
  );
}