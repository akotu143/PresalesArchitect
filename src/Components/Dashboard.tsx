import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Coins, Calendar, TrendingUp, LogOut, RefreshCw } from 'lucide-react';

interface TokenData {
  tokens_available: number;
  tokens_used: number;
  last_reset_date: string;
}

export function Dashboard() {
  const { user, signOut } = useAuth();
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);

  const fetchTokenData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_tokens')
        .select('tokens_available, tokens_used, last_reset_date')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const today = new Date().toISOString().split('T')[0];
        const lastReset = data.last_reset_date;

        if (lastReset !== today) {
          const { data: updatedData, error: updateError } = await supabase
            .from('user_tokens')
            .update({
              tokens_available: 100,
              tokens_used: 0,
              last_reset_date: today,
            })
            .eq('user_id', user.id)
            .select()
            .single();

          if (updateError) throw updateError;
          setTokenData(updatedData);
        } else {
          setTokenData(data);
        }
      }
    } catch (error) {
      console.error('Error fetching token data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokenData();
  }, [user]);

  const handleRefresh = async () => {
    setResetting(true);
    await fetchTokenData();
    setTimeout(() => setResetting(false), 500);
  };

  const getNextResetTime = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const diff = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  };

  const tokenPercentage = tokenData
    ? (tokenData.tokens_available / 100) * 100
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">AI</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">AI Architect</h1>
                <p className="text-xs text-gray-500">Personal Dashboard</p>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.email || user?.phone}
          </h2>
          <p className="text-gray-600">
            Track your daily tokens and training sessions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Coins className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    Available Tokens
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {tokenData?.tokens_available || 0}
                  </p>
                </div>
              </div>
              <button
                onClick={handleRefresh}
                className={`p-2 hover:bg-gray-100 rounded-lg transition-all ${
                  resetting ? 'animate-spin' : ''
                }`}
              >
                <RefreshCw className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full transition-all duration-500 ease-out rounded-full"
                style={{ width: `${tokenPercentage}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {tokenPercentage}% remaining
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Tokens Used Today</p>
                <p className="text-3xl font-bold text-gray-900">
                  {tokenData?.tokens_used || 0}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Keep training to reach your goals
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-orange-100 rounded-xl">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Next Reset</p>
                <p className="text-3xl font-bold text-gray-900">
                  {getNextResetTime()}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Tokens refresh daily at midnight
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Coins className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Ready to Train?
            </h3>
            <p className="text-gray-600 mb-6">
              Your AI trainer is ready to help you achieve your fitness goals.
              Start a conversation to begin your personalized training session.
            </p>
            <button className="bg-blue-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all">
              Start Training Session
            </button>
            <p className="text-sm text-gray-500 mt-4">
              Coming soon: Chat with your AI trainer
            </p>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <h3 className="font-bold text-blue-900 mb-2">How it works</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>You receive 100 tokens daily to interact with your AI trainer</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Each message you send uses tokens based on length</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Tokens automatically reset at midnight every day</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Your chat history is saved for future reference</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
