import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Store,
  Sparkles,
  ShieldCheck,
  MapPin,
  Instagram,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { POPULAR_CITIES } from '../context/LocationContext';

export const SellerOnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, registerSellerStore } = useAuth();

  const [formData, setFormData] = useState({
    store_name: '',
    phone: '+91 98765 00000',
    city: user?.city || 'Hyderabad',
    state: 'Telangana',
    category_focus: 'Fashion & Apparel',
    description: '',
    social_link: 'instagram.com/myindiestore',
    logo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await registerSellerStore(formData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/seller/dashboard');
      }, 1500);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-black text-stone-950 font-display">
          Welcome to Selluy Studios!
        </h1>
        <p className="text-stone-600 text-sm">
          Your store <strong className="text-stone-900">{formData.store_name}</strong> has been created.
          Your application has been submitted for verification. Redirecting you to your seller dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          For Instagram, WhatsApp & Indie Creators
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-stone-950 font-display">
          Open Your Direct Storefront on Selluy
        </h1>
        <p className="text-stone-600 text-sm max-w-lg mx-auto leading-relaxed">
          Get discovered by buyers in your city, manage drops without messy DMs, and build verified local trust.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-4xl p-6 sm:p-10 border border-sand-200/90 shadow-soft-sm space-y-6">
        <div className="space-y-4">
          <h3 className="text-base font-bold text-stone-900 flex items-center gap-2 border-b border-sand-100 pb-3">
            <Store className="w-5 h-5 text-brand-600" />
            Studio Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Store / Brand Name *
              </label>
              <input
                type="text"
                name="store_name"
                required
                placeholder="e.g. Clay & Co, The Linen Studio"
                value={formData.store_name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-sand-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Contact Phone / WhatsApp *
              </label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-sand-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Primary Craft Focus
              </label>
              <select
                name="category_focus"
                value={formData.category_focus}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-sand-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white"
              >
                <option value="Fashion & Apparel">Fashion & Apparel</option>
                <option value="Accessories & Jewelry">Accessories & Jewelry</option>
                <option value="Handmade Crafts">Handmade Crafts</option>
                <option value="Art & Prints">Art & Prints</option>
                <option value="Custom Gifts">Custom Gifts</option>
                <option value="Home & Decor">Home & Decor</option>
                <option value="Clean Beauty & Soaps">Clean Beauty & Soaps</option>
                <option value="Artisanal & Homemade">Artisanal & Homemade</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                City *
              </label>
              <select
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-sand-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white"
              >
                {POPULAR_CITIES.filter((c) => c !== 'All Cities').map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                State
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-sand-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Instagram / Social Link (For Verification) *
              </label>
              <div className="relative">
                <Instagram className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="social_link"
                  required
                  placeholder="instagram.com/yourhandle"
                  value={formData.social_link}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-sand-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Brand Logo / Creator Photo URL
              </label>
              <input
                type="url"
                name="logo"
                value={formData.logo}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-sand-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
              <span className="text-[11px] text-stone-400 mt-1 block">
                Paste an image link or leave default placeholder
              </span>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-stone-700 mb-1">
                About Your Brand & Craftsmanship *
              </label>
              <textarea
                name="description"
                rows={3}
                required
                placeholder="Tell buyers what makes your creations special, materials you use, how you craft them..."
                value={formData.description}
                onChange={handleChange}
                className="w-full p-4 rounded-xl border border-sand-300 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-sand-50 border border-sand-200/80 flex items-start gap-3 text-xs text-stone-600">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-stone-800 block">Verified Seller Review</span>
            Once submitted, your store is instantly created in test mode. The Selluy team will review your Instagram profile and grant the official Verified Seller badge.
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 px-6 rounded-full bg-brand-600 hover:bg-brand-500 text-white font-black text-sm shadow-md transition flex items-center justify-center gap-2"
        >
          {isSubmitting ? 'Creating Store...' : 'Submit & Launch Storefront'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
