import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, ArrowRight, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SelluyLogo } from '../components/common/SelluyLogo';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { adminLogin } = useAuth();

  const [email, setEmail] = useState('admin@selluy.in');
  const [secretKey, setSecretKey] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const ok = await adminLogin(email, secretKey);
      if (ok) {
        navigate('/admin');
      } else {
        setErrorMsg('Invalid administrative credentials or security passcode.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="bg-stone-900 text-white rounded-4xl p-8 sm:p-12 max-w-md w-full border border-stone-800 shadow-2xl space-y-6">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-200">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to marketplace
        </Link>

        <div className="space-y-2 text-center">
          <div className="w-14 h-14 rounded-2xl bg-stone-800 text-blue-400 flex items-center justify-center mx-auto border border-stone-700 shadow-inner">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black font-display tracking-tight text-white">
            Administrative Portal
          </h1>
          <p className="text-xs text-stone-400">
            Restricted access for platform governance, seller vetting, and catalog moderation.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-stone-300 mb-1">Admin Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-stone-800 border border-stone-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-300 mb-1">Administrative Secret Passcode</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="Enter admin security key..."
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                className="w-full pl-4 pr-10 py-3 rounded-2xl bg-stone-800 border border-stone-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Lock className="w-4 h-4 text-stone-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-6 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 mt-4"
          >
            {isSubmitting ? 'Authenticating...' : 'Unlock Admin Console'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;
