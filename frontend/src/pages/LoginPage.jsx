import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Lock, Mail, ArrowRight, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const LoginPage = () => {
  const [email, setEmail] = useState('officer@vehicleshield.gov');
  const [password, setPassword] = useState('Officer@1234');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email.trim(), password);
      navigate('/scan');
    } catch (err) {
      console.error("Login attempt failed:", err);
      if (err.response) {
        if (err.response.status === 401) {
          setError("Incorrect password or email. Please check credentials.");
        } else {
          setError(err.response.data?.detail || `Server Error (${err.response.status}).`);
        }
      } else if (err.request) {
        setError("Cannot reach backend server. If using Netlify, ensure the Python backend is deployed on Render and connected via VITE_API_URL.");
      } else {
        setError("Authentication failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3 z-10 px-4">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-xl shadow-blue-500/30">
          <ShieldAlert className="h-9 w-9 text-white" />
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white">
          VehicleShield
        </h1>
        <p className="text-sm text-gray-400 font-medium max-w-sm mx-auto">
          Authorized Real-World Vehicle Identification & Stolen Vehicle Detection System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 z-10">
        <div className="bg-[#111827] py-8 px-6 sm:px-10 rounded-2xl border border-slate-800 shadow-2xl space-y-6">
          
          {error && (
            <div className="p-3.5 bg-red-950/90 border border-red-800 text-red-200 text-xs rounded-xl flex items-start space-x-2.5 shadow-lg">
              <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Officer Email / Badge ID
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-gray-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="officer@vehicleshield.gov"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-gray-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to VehicleShield'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Quick Demo One-Click Selectors */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 text-center">
              Quick One-Click Demo Credentials:
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickDemo('officer@vehicleshield.gov', 'Officer@1234')}
                className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition-colors"
              >
                <div className="font-bold text-blue-400">Field Officer</div>
                <div className="text-[10px] text-gray-400">Mobile Scanner App</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('admin@vehicleshield.gov', 'Admin@1234')}
                className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition-colors"
              >
                <div className="font-bold text-indigo-400">Chief Inspector</div>
                <div className="text-[10px] text-gray-400">Admin Dashboard</div>
              </button>
            </div>
          </div>

          <div className="text-center text-[11px] text-gray-500">
            Secure law enforcement & authorized traffic checkpoint portal.
          </div>
        </div>
      </div>
    </div>
  );
};
