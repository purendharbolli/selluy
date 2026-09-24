import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Store,
  Sparkles,
  ShieldCheck,
  MapPin,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Clock,
  Upload,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { marketplaceService } from '../services/marketplaceService';
import { SellerType, SellerApplication } from '../types';
import { POPULAR_INDIAN_CITIES } from '../components/common/CityOnboardingModal';
import { AuthModal } from '../components/auth/AuthModal';

export const SellerOnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Steps: 1 (Business Info), 2 (Verification), 3 (Review), 4 (Submitted)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedApp, setSubmittedApp] = useState<SellerApplication | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    full_name: user?.name || '',
    store_name: '',
    seller_type: 'individual' as SellerType,
    city: user?.city || 'Hyderabad',
    area: '',
    category: 'Fashion & Apparel',
    description: '',
    phone: user?.phone || '+91 ',
    email: user?.email || '',
    id_proof_url: '',
    craft_sample_1: '',
    craft_sample_2: '',
    agreement: false,
  });

  const [errorMsg, setErrorMsg] = useState('');

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.checked }));
  };

  // Step 1 Validation
  const handleProceedToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!formData.store_name.trim() || !formData.full_name.trim() || !formData.description.trim()) {
      setErrorMsg('Please complete all required fields.');
      return;
    }
    setCurrentStep(2);
  };

  // Step 2 Validation
  const handleProceedToStep3 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!formData.craft_sample_1.trim()) {
      setErrorMsg('Please provide at least one photo or portfolio link of your craft/store.');
      return;
    }
    setCurrentStep(3);
  };

  // Step 3 Submission
  const handleFinalSubmit = async () => {
    if (!isAuthenticated || !user) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!formData.agreement) {
      setErrorMsg('Please accept the Seller Community Guidelines and verification terms.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const app = await marketplaceService.submitSellerApplication({
        user_id: user.id,
        full_name: formData.full_name,
        store_name: formData.store_name,
        seller_type: formData.seller_type,
        city: formData.city,
        area: formData.area,
        category: formData.category,
        description: formData.description,
        phone: formData.phone,
        email: formData.email,
        documents: {
          id_proof_url: formData.id_proof_url,
          craft_samples: [formData.craft_sample_1, formData.craft_sample_2].filter(Boolean),
        },
      });

      setSubmittedApp(app);
      setCurrentStep(4);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Logged-in check prompt
  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
          <Store className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-3xl font-black text-stone-950 font-display">
          Sell on Selluy
        </h1>
        <p className="text-stone-600 text-sm max-w-md mx-auto leading-relaxed">
          Log in with your Indian mobile number to begin your seller application. Only verified local sellers can publish products.
        </p>
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="px-8 py-3.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md transition inline-flex items-center gap-2"
        >
          <span>Log in to Apply</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </div>
    );
  }

  // STEP 4: SUBMITTED SUCCESS / PENDING REVIEW STATE
  if (currentStep === 4) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6 animate-fadeIn">
        <div className="w-20 h-20 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border-4 border-amber-100">
          <Clock className="w-10 h-10 text-amber-600" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
          Status: PENDING REVIEW
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-stone-950 font-display">
          Application Submitted!
        </h1>

        <p className="text-stone-600 text-sm max-w-md mx-auto leading-relaxed">
          Your seller application for <strong className="text-stone-950">{formData.store_name}</strong> in {formData.city} has been received.
          Our team reviews applications within 24–48 hours to maintain marketplace trust.
        </p>

        <div className="bg-white rounded-3xl p-6 border border-sand-200 text-left max-w-md mx-auto space-y-3 shadow-soft-sm text-xs">
          <div className="flex justify-between pb-2 border-b border-sand-100">
            <span className="text-stone-500">Application ID:</span>
            <span className="font-mono font-bold text-stone-900">{submittedApp?.id || 'APP-PENDING'}</span>
          </div>
          <div className="flex justify-between pb-2 border-b border-sand-100">
            <span className="text-stone-500">Store Name:</span>
            <span className="font-bold text-stone-900">{formData.store_name}</span>
          </div>
          <div className="flex justify-between pb-2 border-b border-sand-100">
            <span className="text-stone-500">Category:</span>
            <span className="font-bold text-stone-900">{formData.category}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">City:</span>
            <span className="font-bold text-stone-900">{formData.city}</span>
          </div>
        </div>

        <div className="pt-4 flex justify-center gap-3">
          <Link
            to="/"
            className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition"
          >
            Return to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          Selluy Verified Seller Application
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-stone-950 font-display">
          Apply to Sell on Selluy
        </h1>
        <p className="text-stone-600 text-sm max-w-lg mx-auto">
          We curate verified independent brands and makers. Once approved, you gain full access to publish drops and reach local buyers.
        </p>
      </div>

      {/* Progress Stepper */}
      <div className="flex items-center justify-between max-w-md mx-auto text-xs font-bold text-stone-500">
        <div className={`flex items-center gap-1.5 ${currentStep >= 1 ? 'text-blue-600' : ''}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-sand-200'}`}>
            1
          </span>
          <span>Business</span>
        </div>
        <div className="w-12 h-0.5 bg-sand-200" />
        <div className={`flex items-center gap-1.5 ${currentStep >= 2 ? 'text-blue-600' : ''}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-sand-200'}`}>
            2
          </span>
          <span>Verification</span>
        </div>
        <div className="w-12 h-0.5 bg-sand-200" />
        <div className={`flex items-center gap-1.5 ${currentStep >= 3 ? 'text-blue-600' : ''}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-sand-200'}`}>
            3
          </span>
          <span>Review</span>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* STEP 1: BUSINESS INFORMATION */}
      {currentStep === 1 && (
        <form onSubmit={handleProceedToStep2} className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-200 shadow-soft-sm space-y-5">
          <h3 className="text-base font-bold text-stone-900 border-b border-sand-100 pb-3 flex items-center gap-2">
            <Store className="w-4 h-4 text-blue-600" />
            Step 1: Studio &amp; Business Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Your Full Legal Name *
              </label>
              <input
                type="text"
                name="full_name"
                required
                value={formData.full_name}
                onChange={handleInputChange}
                placeholder="e.g. Purendhar Bolli"
                className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Store / Brand Name *
              </label>
              <input
                type="text"
                name="store_name"
                required
                value={formData.store_name}
                onChange={handleInputChange}
                placeholder="e.g. Hyderabad Handloom Studio"
                className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Seller Type *
              </label>
              <select
                name="seller_type"
                value={formData.seller_type}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="individual">Individual Maker / Artisan</option>
                <option value="small_business">Small Indie Business</option>
                <option value="local_store">Local Retail Store</option>
                <option value="brand">Independent Brand</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                City *
              </label>
              <select
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {POPULAR_INDIAN_CITIES.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name} ({c.state})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Locality / Area
              </label>
              <input
                type="text"
                name="area"
                value={formData.area}
                onChange={handleInputChange}
                placeholder="e.g. Jubilee Hills, Indiranagar"
                className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Primary Product Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
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

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Store Description &amp; Craftsmanship *
              </label>
              <textarea
                name="description"
                rows={3}
                required
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Tell us what you make, materials used, and where you produce your pieces..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
            >
              <span>Next: Verification Info</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* STEP 2: VERIFICATION & SAMPLES */}
      {currentStep === 2 && (
        <form onSubmit={handleProceedToStep3} className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-200 shadow-soft-sm space-y-5">
          <h3 className="text-base font-bold text-stone-900 border-b border-sand-100 pb-3 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            Step 2: Authenticity &amp; Craft Verification
          </h3>

          <p className="text-xs text-stone-600">
            To prevent counterfeit or dropshipping resellers, Selluy verifies genuine handmade and independent products.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Product Image / Portfolio Link 1 (Primary sample) *
              </label>
              <input
                type="url"
                name="craft_sample_1"
                required
                value={formData.craft_sample_1}
                onChange={handleInputChange}
                placeholder="https://images.unsplash.com/... or Instagram link"
                className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <span className="text-[11px] text-stone-400 mt-1 block">
                Direct photo URL of your workshop, studio, or handcrafted pieces.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Product Image / Portfolio Link 2 (Secondary sample)
              </label>
              <input
                type="url"
                name="craft_sample_2"
                value={formData.craft_sample_2}
                onChange={handleInputChange}
                placeholder="https://images.unsplash.com/... (optional)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                ID / Business Registration Proof URL (Optional for Individuals)
              </label>
              <input
                type="url"
                name="id_proof_url"
                value={formData.id_proof_url}
                onChange={handleInputChange}
                placeholder="Link to GST certificate or government identity (stored privately)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <span className="text-[11px] text-stone-400 mt-1 block">
                Verification documents are strictly private and never displayed publicly.
              </span>
            </div>
          </div>

          <div className="pt-4 flex justify-between items-center">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-5 py-2.5 rounded-full border border-sand-300 text-stone-700 font-bold text-xs hover:bg-sand-50 transition flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <button
              type="submit"
              className="px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
            >
              <span>Next: Review Application</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* STEP 3: REVIEW & SUBMIT */}
      {currentStep === 3 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-200 shadow-soft-sm space-y-5">
          <h3 className="text-base font-bold text-stone-900 border-b border-sand-100 pb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            Step 3: Review Application Details
          </h3>

          <div className="bg-sand-50 rounded-2xl p-4 space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2 pb-2 border-b border-sand-200">
              <span className="text-stone-500">Applicant:</span>
              <span className="font-bold text-stone-900">{formData.full_name}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pb-2 border-b border-sand-200">
              <span className="text-stone-500">Store Name:</span>
              <span className="font-bold text-stone-900">{formData.store_name}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pb-2 border-b border-sand-200">
              <span className="text-stone-500">Seller Type:</span>
              <span className="font-bold text-stone-900 capitalize">{formData.seller_type.replace('_', ' ')}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pb-2 border-b border-sand-200">
              <span className="text-stone-500">City &amp; Area:</span>
              <span className="font-bold text-stone-900">{formData.city} {formData.area ? `(${formData.area})` : ''}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pb-2 border-b border-sand-200">
              <span className="text-stone-500">Category:</span>
              <span className="font-bold text-stone-900">{formData.category}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <span className="text-stone-500">Description:</span>
              <span className="text-stone-800">{formData.description}</span>
            </div>
          </div>

          <label className="flex items-start gap-2.5 pt-2 cursor-pointer select-none">
            <input
              type="checkbox"
              name="agreement"
              checked={formData.agreement}
              onChange={handleCheckboxChange}
              className="mt-0.5 rounded border-sand-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-xs text-stone-600 leading-relaxed">
              I certify that I craft or directly retail authentic items. I understand that all applications require manual admin review and products can only be published once verified.
            </span>
          </label>

          <div className="pt-4 flex justify-between items-center">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-5 py-2.5 rounded-full border border-sand-300 text-stone-700 font-bold text-xs hover:bg-sand-50 transition flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handleFinalSubmit}
              disabled={isSubmitting || !formData.agreement}
              className="px-8 py-3 rounded-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
            >
              {isSubmitting ? (
                <span>Submitting Application...</span>
              ) : (
                <>
                  <span>Submit Application</span>
                  <CheckCircle className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerOnboardingPage;
