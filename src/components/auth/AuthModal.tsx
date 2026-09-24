import React, { useState } from 'react';
import { X, Sparkles, Store, ShoppingBag, ArrowRight, CheckCircle2, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { POPULAR_CITIES } from '../../context/LocationContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
}) => {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [roleChoice, setRoleChoice] = useState<'buyer' | 'seller'>('buyer');

  // Form states
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [city, setCity] = useState('Hyderabad');
  const [isLoading, setIsLoading] = useState(false);
  const [successToast, setSuccessToast] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === 'signin') {
        await login(email, roleChoice);
      } else {
        await signup(name, email, roleChoice, city);
      }
      setSuccessToast(true);
      setTimeout(() => {
        setSuccessToast(false);
        onClose();
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoBuyer = async () => {
    setIsLoading(true);
    await login('aarav@example.com', 'buyer');
    setIsLoading(false);
    onClose();
  };

  const handleDemoSeller = async () => {
    setIsLoading(true);
    await login('team@localthread.in', 'seller');
    setIsLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-4xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-sand-200 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-sand-100 text-stone-400 hover:text-stone-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand header */}
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-9 h-9 rounded-2xl bg-brand-500 flex items-center justify-center shadow-xs">
            <span className="text-white font-extrabold text-xl">S</span>
          </div>
          <div>
            <h3 className="text-lg font-black text-stone-950 font-display">
              {mode === 'signin' ? 'Welcome Back to Selluy' : 'Join the Selluy Community'}
            </h3>
            <p className="text-xs text-stone-500">Discover local. Buy direct.</p>
          </div>
        </div>

        {/* Mode switcher tabs */}
        <div className="flex rounded-2xl bg-sand-100 p-1 mb-5 text-xs font-bold">
          <button
            onClick={() => setMode('signin')}
            className={`flex-1 py-2 rounded-xl transition ${
              mode === 'signin' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`flex-1 py-2 rounded-xl transition ${
              mode === 'signup' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {successToast ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
            <p className="text-sm font-bold text-stone-900">
              {mode === 'signin' ? 'Signed in successfully!' : 'Account created! Welcome to Selluy.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Choose account type if signing up */}
            {mode === 'signup' && (
              <div>
                <label className="block font-bold text-stone-700 mb-1.5">I am joining as:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRoleChoice('buyer')}
                    className={`p-3 rounded-2xl border text-left transition flex items-center gap-2 ${
                      roleChoice === 'buyer'
                        ? 'border-brand-500 bg-brand-50/60 text-brand-900 font-bold'
                        : 'border-sand-200 hover:bg-sand-50 text-stone-700'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4 text-brand-600" />
                    <div>
                      <span className="block text-xs">Shopper</span>
                      <span className="text-[10px] text-stone-500 font-normal">Discover & buy</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRoleChoice('seller')}
                    className={`p-3 rounded-2xl border text-left transition flex items-center gap-2 ${
                      roleChoice === 'seller'
                        ? 'border-brand-500 bg-brand-50/60 text-brand-900 font-bold'
                        : 'border-sand-200 hover:bg-sand-50 text-stone-700'
                    }`}
                  >
                    <Store className="w-4 h-4 text-amber-600" />
                    <div>
                      <span className="block text-xs">Creator / Studio</span>
                      <span className="text-[10px] text-stone-500 font-normal">Sell products</span>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {mode === 'signup' && (
              <div>
                <label className="block font-bold text-stone-700 mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aanya Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-sand-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="block font-bold text-stone-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-sand-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block font-bold text-stone-700 mb-1">Your City</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-sand-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white"
                >
                  {POPULAR_CITIES.filter((c) => c !== 'All Cities').map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-full bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? 'Processing...' : mode === 'signin' ? 'Sign In to Selluy' : 'Create My Account'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Demo Fast Logins for Convenience */}
        <div className="mt-5 pt-4 border-t border-sand-100 space-y-2">
          <p className="text-[11px] text-stone-400 font-bold uppercase tracking-wider text-center">
            One-Click Demo Accounts:
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleDemoBuyer}
              className="flex-1 py-1.5 px-3 rounded-xl bg-sand-100 hover:bg-sand-200 text-stone-700 text-xs font-semibold transition"
            >
              Demo Buyer
            </button>
            <button
              onClick={handleDemoSeller}
              className="flex-1 py-1.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold transition"
            >
              Demo Creator Studio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
