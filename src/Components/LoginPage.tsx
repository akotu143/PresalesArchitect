import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Phone, ArrowRight, Check } from 'lucide-react';

type LoginMethod = 'email' | 'phone';
type LoginStep = 'input' | 'verify';

export function LoginPage() {
  const [method, setMethod] = useState<LoginMethod>('email');
  const [step, setStep] = useState<LoginStep>('input');
  const [contact, setContact] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (method === 'email') {
        const { error } = await supabase.auth.signInWithOtp({
          email: contact,
          options: {
            shouldCreateUser: true,
          },
        });

        if (error) throw error;
        setMessage('Check your email for the OTP code');
        setStep('verify');
      } else {
        const formattedPhone = contact.startsWith('+') ? contact : `+${contact}`;
        const { error } = await supabase.auth.signInWithOtp({
          phone: formattedPhone,
          options: {
            shouldCreateUser: true,
          },
        });

        if (error) throw error;
        setMessage('Check your phone for the OTP code');
        setStep('verify');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (method === 'email') {
        const { error } = await supabase.auth.verifyOtp({
          email: contact,
          token: otp,
          type: 'email',
        });

        if (error) throw error;
      } else {
        const formattedPhone = contact.startsWith('+') ? contact : `+${contact}`;
        const { error } = await supabase.auth.verifyOtp({
          phone: formattedPhone,
          token: otp,
          type: 'sms',
        });

        if (error) throw error;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid OTP code');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep('input');
    setContact('');
    setOtp('');
    setError('');
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
              <span className="text-white text-2xl font-bold">AI</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Trainer</h1>
            <p className="text-gray-600">Sign in to access your personal trainer</p>
          </div>

          {step === 'input' ? (
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div className="flex gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => setMethod('email')}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                    method === 'email'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Mail className="w-5 h-5" />
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('phone')}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                    method === 'phone'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Phone className="w-5 h-5" />
                  Phone
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {method === 'email' ? 'Email Address' : 'Phone Number'}
                </label>
                <input
                  type={method === 'email' ? 'email' : 'tel'}
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder={
                    method === 'email' ? 'your@email.com' : '+1234567890'
                  }
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                {method === 'phone' && (
                  <p className="mt-2 text-sm text-gray-500">
                    Include country code (e.g., +1 for US)
                  </p>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  'Sending...'
                ) : (
                  <>
                    Send OTP
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-blue-800">{message}</p>
                <p className="text-xs text-blue-600 mt-1">
                  Sent to: <span className="font-medium">{contact}</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter OTP Code
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  maxLength={6}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center text-2xl tracking-widest font-mono"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    'Verifying...'
                  ) : (
                    <>
                      Verify & Sign In
                      <Check className="w-5 h-5" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full text-gray-600 py-2 px-6 rounded-xl font-medium hover:bg-gray-100 transition-all"
                >
                  Use different {method === 'email' ? 'email' : 'number'}
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
