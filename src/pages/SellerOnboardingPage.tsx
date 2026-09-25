import React, { useState, useEffect, useRef } from 'react';
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
  Camera,
  Trash2,
  RefreshCw,
  Lock,
  Globe,
  Instagram,
  Check,
  Package,
  Truck,
  Eye,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { marketplaceService } from '../services/marketplaceService';
import { SellerType, SellerApplication } from '../types';
import { POPULAR_INDIAN_CITIES } from '../components/common/CityOnboardingModal';
import { AuthModal } from '../components/auth/AuthModal';

const DRAFT_STORAGE_KEY = 'selluy_seller_draft_v2';

export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Delhi',
  'Chandigarh',
  'Puducherry',
  'Jammu & Kashmir',
  'Ladakh',
];

export const CATEGORIES = [
  'Fashion & Apparel',
  'Handmade Crafts',
  'Accessories & Jewelry',
  'Art & Prints',
  'Home & Decor',
  'Clean Beauty & Soaps',
  'Artisanal & Homemade',
  'Custom Gifts',
];

export const SellerOnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Steps: 1 (Account), 2 (Business), 3 (Products & Samples), 4 (Verification & Pickup), 5 (Review & Submit), 6 (Submitted)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedApp, setSubmittedApp] = useState<SellerApplication | null>(null);
  const [existingApp, setExistingApp] = useState<SellerApplication | null>(null);
  const [isEditingExisting, setIsEditingExisting] = useState(false);
  const [hasDraftRestored, setHasDraftRestored] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // File input refs
  const sampleFilesRef = useRef<HTMLInputElement>(null);
  const replaceSampleIndexRef = useRef<number | null>(null);
  const singleReplaceRef = useRef<HTMLInputElement>(null);
  const idFrontRef = useRef<HTMLInputElement>(null);
  const idBackRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Account
    full_name: '',
    phone: '',
    email: '',
    city: 'Hyderabad',
    // Step 2: Business
    store_name: '',
    seller_type: 'individual' as SellerType,
    area: '',
    category: 'Fashion & Apparel',
    description: '',
    has_social: false,
    social_media_url: '',
    has_website: false,
    website_url: '',
    // Step 3: Products
    product_types: '',
    craft_type: '100% Handcrafted by Me / Our Artisans',
    product_range: '₹500 - ₹2,000',
    delivery_method: 'Local Same-Day / Next-Day Delivery',
    product_samples: [] as string[],
    // Step 4: Verification & Pickup
    verification_id_type: 'aadhaar' as 'aadhaar' | 'voter_id',
    government_id_front: '',
    government_id_back: '',
    business_address: '',
    state: 'Telangana',
    pincode: '',
    // Step 5: Review & Agreement
    agreement: false,
  });

  // Check for existing application and load draft
  useEffect(() => {
    if (user) {
      const app = marketplaceService.getApplicationByUserId(user.id);
      if (app) {
        setExistingApp(app);
      }

      // Check draft storage
      const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          setFormData((prev) => ({
            ...prev,
            ...parsed,
            // Ensure phone and name use authenticated user if not set
            phone: parsed.phone || user.phone || '',
            full_name: parsed.full_name || user.name || '',
            email: parsed.email || user.email || '',
            city: parsed.city || user.city || 'Hyderabad',
          }));
          setHasDraftRestored(true);
          return;
        } catch (e) {
          console.warn('Failed to parse draft:', e);
        }
      }

      // If no draft but user exists, prefill from user
      setFormData((prev) => ({
        ...prev,
        full_name: prev.full_name || user.name || '',
        phone: prev.phone || user.phone || '',
        email: prev.email || user.email || '',
        city: prev.city || user.city || 'Hyderabad',
        business_address: prev.business_address || user.address || '',
      }));
    }
  }, [user]);

  // Autosave draft on form change (only when authenticated and not submitted)
  useEffect(() => {
    if (isAuthenticated && currentStep < 6) {
      try {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formData));
      } catch (e) {
        // Storage quota might be reached if base64 images are large
      }
    }
  }, [formData, isAuthenticated, currentStep]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const discardDraft = () => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    setHasDraftRestored(false);
    setFormData({
      full_name: user?.name || '',
      phone: user?.phone || '',
      email: user?.email || '',
      city: user?.city || 'Hyderabad',
      store_name: '',
      seller_type: 'individual',
      area: '',
      category: 'Fashion & Apparel',
      description: '',
      has_social: false,
      social_media_url: '',
      has_website: false,
      website_url: '',
      product_types: '',
      craft_type: '100% Handcrafted by Me / Our Artisans',
      product_range: '₹500 - ₹2,000',
      delivery_method: 'Local Same-Day / Next-Day Delivery',
      product_samples: [],
      verification_id_type: 'aadhaar',
      government_id_front: '',
      government_id_back: '',
      business_address: user?.address || '',
      state: 'Telangana',
      pincode: '',
      agreement: false,
    });
  };

  // Convert File to base64 Data URL
  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Handle Product Samples Device Upload
  const handleSampleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setErrorMsg('');
    const newSamples = [...formData.product_samples];

    for (let i = 0; i < files.length; i++) {
      if (newSamples.length >= 5) break;
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Image size must be under 5MB per photo.');
        continue;
      }
      try {
        const url = await fileToDataUrl(file);
        newSamples.push(url);
      } catch (err) {
        console.warn('Failed reading photo:', err);
      }
    }

    setFormData((prev) => ({ ...prev, product_samples: newSamples }));
    if (sampleFilesRef.current) sampleFilesRef.current.value = '';
  };

  // Replace a specific sample
  const triggerReplaceSample = (index: number) => {
    replaceSampleIndexRef.current = index;
    singleReplaceRef.current?.click();
  };

  const handleSingleReplaceSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const index = replaceSampleIndexRef.current;
    if (!file || index === null || index === undefined) return;

    try {
      const url = await fileToDataUrl(file);
      setFormData((prev) => {
        const updated = [...prev.product_samples];
        updated[index] = url;
        return { ...prev, product_samples: updated };
      });
    } catch (err) {
      console.warn('Failed replacing photo:', err);
    }
    if (singleReplaceRef.current) singleReplaceRef.current.value = '';
  };

  // Remove a product sample
  const removeSample = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      product_samples: prev.product_samples.filter((_, i) => i !== index),
    }));
  };

  // Handle ID Document Uploads
  const handleIdUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'front' | 'back'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('File size must be under 5MB.');
      return;
    }

    try {
      const url = await fileToDataUrl(file);
      if (type === 'front') {
        setFormData((prev) => ({ ...prev, government_id_front: url }));
      } else {
        setFormData((prev) => ({ ...prev, government_id_back: url }));
      }
    } catch (err) {
      console.warn('Failed reading document:', err);
    }
  };

  // Step 1 Validation -> Proceed to Step 2
  const handleProceedToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!formData.full_name.trim()) {
      setErrorMsg('Please enter your full legal name.');
      return;
    }
    if (!formData.phone.trim()) {
      setErrorMsg('Mobile number is required.');
      return;
    }
    if (!formData.city) {
      setErrorMsg('Please select your city.');
      return;
    }
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 2 Validation -> Proceed to Step 3
  const handleProceedToStep3 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!formData.store_name.trim()) {
      setErrorMsg('Please enter your store or brand name.');
      return;
    }
    if (!formData.description.trim() || formData.description.trim().length < 20) {
      setErrorMsg('Please provide a description of your craft and store (at least 20 characters).');
      return;
    }
    if (formData.has_social && !formData.social_media_url.trim()) {
      setErrorMsg('Please enter your social media profile URL or uncheck the option.');
      return;
    }
    if (formData.has_website && !formData.website_url.trim()) {
      setErrorMsg('Please enter your website URL or uncheck the option.');
      return;
    }
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 3 Validation -> Proceed to Step 4
  const handleProceedToStep4 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!formData.product_types.trim()) {
      setErrorMsg('Please describe what types of products you make or sell.');
      return;
    }
    if (formData.product_samples.length < 2) {
      setErrorMsg('Please upload at least 2 product sample photos from your device.');
      return;
    }
    setCurrentStep(4);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 4 Validation -> Proceed to Step 5
  const handleProceedToStep5 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!formData.government_id_front) {
      setErrorMsg('Please upload the front photo of your identity document.');
      return;
    }
    if (!formData.business_address.trim()) {
      setErrorMsg('Please enter your dispatch / pickup address for local deliveries.');
      return;
    }
    if (!formData.pincode.trim() || !/^[1-9][0-9]{5}$/.test(formData.pincode.trim())) {
      setErrorMsg('Please enter a valid 6-digit Indian PIN code.');
      return;
    }
    setCurrentStep(5);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 5 Submission
  const handleFinalSubmit = async () => {
    if (!isAuthenticated || !user) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!formData.agreement) {
      setErrorMsg('Please certify and agree to the Seller Community Guidelines.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const app = await marketplaceService.submitSellerApplication({
        user_id: user.id,
        full_name: formData.full_name.trim(),
        store_name: formData.store_name.trim(),
        seller_type: formData.seller_type,
        city: formData.city,
        area: formData.area.trim() || undefined,
        category: formData.category,
        description: formData.description.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || user.email || '',
        social_media_url: formData.has_social ? formData.social_media_url.trim() : undefined,
        website_url: formData.has_website ? formData.website_url.trim() : undefined,
        product_types: formData.product_types.trim(),
        craft_type: formData.craft_type,
        product_range: formData.product_range,
        delivery_method: formData.delivery_method,
        product_samples: formData.product_samples,
        verification_id_type: formData.verification_id_type,
        government_id_front: formData.government_id_front,
        government_id_back: formData.government_id_back || undefined,
        business_address: formData.business_address.trim(),
        state: formData.state,
        pincode: formData.pincode.trim(),
        documents: {
          craft_samples: formData.product_samples,
          government_id_front: formData.government_id_front,
          government_id_back: formData.government_id_back || undefined,
        },
        status: 'under_review',
      });

      // Clear draft storage
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      setSubmittedApp(app);
      setExistingApp(app);
      setIsEditingExisting(false);
      setCurrentStep(6);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit seller application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If user is not authenticated, show welcoming landing card with login trigger
  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-20">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-sand-200 shadow-soft-lg text-center space-y-8">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-xs border border-blue-100">
            <Store className="w-8 h-8 text-blue-600" />
          </div>

          <div className="space-y-3 max-w-xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Verified Local Makers &amp; Independent Brands
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-stone-950 font-display">
              Sell Directly to Local Buyers Across Your City
            </h1>
            <p className="text-stone-600 text-sm leading-relaxed">
              Selluy connects authentic local makers, artisans, and independent brands directly with nearby customers. Zero arbitrary listing fees. Direct payouts.
            </p>
          </div>

          {/* 3 Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left max-w-2xl mx-auto pt-2">
            <div className="p-4 rounded-2xl bg-sand-50 border border-sand-200/80">
              <ShieldCheck className="w-5 h-5 text-blue-600 mb-2" />
              <h4 className="text-xs font-extrabold text-stone-900">Verified Seller Badge</h4>
              <p className="text-[11px] text-stone-500 mt-1">
                Every seller is vetted to ensure genuine craftsmanship and consumer trust.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-sand-50 border border-sand-200/80">
              <MapPin className="w-5 h-5 text-amber-600 mb-2" />
              <h4 className="text-xs font-extrabold text-stone-900">City-First Discovery</h4>
              <p className="text-[11px] text-stone-500 mt-1">
                Local buyers discover your studio first with local fast delivery or pickup.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-sand-50 border border-sand-200/80">
              <Sparkles className="w-5 h-5 text-indigo-600 mb-2" />
              <h4 className="text-xs font-extrabold text-stone-900">Curated Showcase</h4>
              <p className="text-[11px] text-stone-500 mt-1">
                Stand out with rich brand storytelling, photo drops, and direct ordering.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-8 py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Log in with Mobile to Apply</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-[11px] text-stone-400 mt-2">
              Existing users will be automatically signed in without losing progress.
            </p>
          </div>
        </div>

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </div>
    );
  }

  // If user already has an application and is not in editing mode
  if (existingApp && !isEditingExisting && currentStep !== 6) {
    if (existingApp.status === 'approved') {
      return (
        <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6 animate-fadeIn">
          <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border-4 border-emerald-100 shadow-soft-sm">
            <ShieldCheck className="w-10 h-10 text-emerald-600" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold">
            Verified Seller Status Active
          </div>

          <h1 className="text-3xl font-black text-stone-950 font-display">
            You are a Verified Selluy Seller!
          </h1>

          <p className="text-stone-600 text-sm max-w-md mx-auto leading-relaxed">
            Your store <strong className="text-stone-950">{existingApp.store_name}</strong> is verified in {existingApp.city}. You can publish drops, manage stock, and track orders directly from your Seller Studio.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/seller/dashboard"
              className="px-7 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
            >
              <Store className="w-4 h-4" />
              <span>Go to Seller Studio</span>
            </Link>
            <Link
              to="/"
              className="px-6 py-3 rounded-full border border-sand-300 text-stone-700 hover:bg-sand-50 font-bold text-xs transition"
            >
              Marketplace Home
            </Link>
          </div>
        </div>
      );
    }

    if (
      existingApp.status === 'under_review' ||
      existingApp.status === 'pending' ||
      existingApp.status === 'submitted'
    ) {
      return (
        <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6 animate-fadeIn">
          <div className="w-20 h-20 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border-4 border-amber-100 shadow-soft-sm">
            <Clock className="w-10 h-10 text-amber-600" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
            Application Status: Under Review
          </div>

          <h1 className="text-3xl font-black text-stone-950 font-display">
            Application Under Review
          </h1>

          <p className="text-stone-600 text-sm max-w-md mx-auto leading-relaxed">
            We received your seller application for <strong className="text-stone-950">{existingApp.store_name}</strong> in {existingApp.city}. Our curation team reviews documents within 24–48 hours to maintain marketplace trust.
          </p>

          <div className="bg-white rounded-3xl p-6 border border-sand-200 text-left max-w-md mx-auto space-y-3 shadow-soft-sm text-xs">
            <div className="flex justify-between pb-2 border-b border-sand-100">
              <span className="text-stone-500">Application ID:</span>
              <span className="font-mono font-bold text-stone-900">{existingApp.id}</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-sand-100">
              <span className="text-stone-500">Store Name:</span>
              <span className="font-bold text-stone-900">{existingApp.store_name}</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-sand-100">
              <span className="text-stone-500">Category:</span>
              <span className="font-bold text-stone-900">{existingApp.category}</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-sand-100">
              <span className="text-stone-500">City &amp; Area:</span>
              <span className="font-bold text-stone-900">{existingApp.city} {existingApp.area ? `(${existingApp.area})` : ''}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Submitted On:</span>
              <span className="font-medium text-stone-700">
                {new Date(existingApp.created_at).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => {
                setFormData((prev) => ({
                  ...prev,
                  full_name: existingApp.full_name || prev.full_name,
                  store_name: existingApp.store_name || prev.store_name,
                  seller_type: existingApp.seller_type || prev.seller_type,
                  city: existingApp.city || prev.city,
                  area: existingApp.area || prev.area,
                  category: existingApp.category || prev.category,
                  description: existingApp.description || prev.description,
                  phone: existingApp.phone || prev.phone,
                  email: existingApp.email || prev.email,
                  has_social: Boolean(existingApp.social_media_url),
                  social_media_url: existingApp.social_media_url || '',
                  has_website: Boolean(existingApp.website_url),
                  website_url: existingApp.website_url || '',
                  product_types: existingApp.product_types || '',
                  craft_type: existingApp.craft_type || prev.craft_type,
                  product_range: existingApp.product_range || prev.product_range,
                  delivery_method: existingApp.delivery_method || prev.delivery_method,
                  product_samples: existingApp.product_samples || existingApp.documents?.craft_samples || [],
                  verification_id_type: (existingApp.verification_id_type as any) || 'aadhaar',
                  government_id_front: existingApp.government_id_front || existingApp.documents?.government_id_front || '',
                  government_id_back: existingApp.government_id_back || existingApp.documents?.government_id_back || '',
                  business_address: existingApp.business_address || '',
                  state: existingApp.state || 'Telangana',
                  pincode: existingApp.pincode || '',
                  agreement: true,
                }));
                setIsEditingExisting(true);
                setCurrentStep(1);
              }}
              className="px-6 py-3 rounded-full bg-sand-100 hover:bg-sand-200 text-stone-800 font-bold text-xs transition"
            >
              Update / Edit Application
            </button>
            <Link
              to="/"
              className="px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition"
            >
              Return to Marketplace
            </Link>
          </div>
        </div>
      );
    }

    if (existingApp.status === 'rejected') {
      return (
        <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6 animate-fadeIn">
          <div className="w-20 h-20 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border-4 border-rose-100 shadow-soft-sm">
            <AlertCircle className="w-10 h-10 text-rose-600" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-900 text-xs font-bold">
            Application Needs Revision
          </div>

          <h1 className="text-3xl font-black text-stone-950 font-display">
            Action Needed on Your Application
          </h1>

          <div className="bg-rose-50/80 rounded-2xl p-4 border border-rose-200 max-w-md mx-auto text-left text-xs">
            <span className="font-bold text-rose-900 block mb-1">Feedback from Verification Team:</span>
            <p className="text-rose-800 leading-relaxed">
              {existingApp.rejection_reason || 'Please provide updated product craft samples or verification documents.'}
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                setFormData((prev) => ({
                  ...prev,
                  full_name: existingApp.full_name || prev.full_name,
                  store_name: existingApp.store_name || prev.store_name,
                  seller_type: existingApp.seller_type || prev.seller_type,
                  city: existingApp.city || prev.city,
                  area: existingApp.area || prev.area,
                  category: existingApp.category || prev.category,
                  description: existingApp.description || prev.description,
                  phone: existingApp.phone || prev.phone,
                  email: existingApp.email || prev.email,
                  has_social: Boolean(existingApp.social_media_url),
                  social_media_url: existingApp.social_media_url || '',
                  has_website: Boolean(existingApp.website_url),
                  website_url: existingApp.website_url || '',
                  product_types: existingApp.product_types || '',
                  craft_type: existingApp.craft_type || prev.craft_type,
                  product_range: existingApp.product_range || prev.product_range,
                  delivery_method: existingApp.delivery_method || prev.delivery_method,
                  product_samples: existingApp.product_samples || existingApp.documents?.craft_samples || [],
                  verification_id_type: (existingApp.verification_id_type as any) || 'aadhaar',
                  government_id_front: existingApp.government_id_front || existingApp.documents?.government_id_front || '',
                  government_id_back: existingApp.government_id_back || existingApp.documents?.government_id_back || '',
                  business_address: existingApp.business_address || '',
                  state: existingApp.state || 'Telangana',
                  pincode: existingApp.pincode || '',
                  agreement: false,
                }));
                setIsEditingExisting(true);
                setCurrentStep(1);
              }}
              className="px-8 py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Update &amp; Resubmit Application</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      );
    }
  }

  // STEP 6: SUBMITTED SUCCESS STATE
  if (currentStep === 6) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6 animate-fadeIn">
        <div className="w-20 h-20 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border-4 border-amber-100 shadow-soft-sm">
          <Clock className="w-10 h-10 text-amber-600" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
          Status: UNDER REVIEW
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-stone-950 font-display">
          Application Submitted!
        </h1>

        <p className="text-stone-600 text-sm max-w-md mx-auto leading-relaxed">
          Your seller application for <strong className="text-stone-950">{formData.store_name}</strong> in {formData.city} has been received. Our curation team will review your photos and verification documents within 24–48 hours.
        </p>

        <div className="bg-white rounded-3xl p-6 border border-sand-200 text-left max-w-md mx-auto space-y-3 shadow-soft-sm text-xs">
          <div className="flex justify-between pb-2 border-b border-sand-100">
            <span className="text-stone-500">Application ID:</span>
            <span className="font-mono font-bold text-stone-900">{submittedApp?.id || 'APP-SUBMITTED'}</span>
          </div>
          <div className="flex justify-between pb-2 border-b border-sand-100">
            <span className="text-stone-500">Store Name:</span>
            <span className="font-bold text-stone-900">{formData.store_name}</span>
          </div>
          <div className="flex justify-between pb-2 border-b border-sand-100">
            <span className="text-stone-500">Category:</span>
            <span className="font-bold text-stone-900">{formData.category}</span>
          </div>
          <div className="flex justify-between pb-2 border-b border-sand-100">
            <span className="text-stone-500">City:</span>
            <span className="font-bold text-stone-900">{formData.city}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Samples Uploaded:</span>
            <span className="font-bold text-stone-900">{formData.product_samples.length} photos</span>
          </div>
        </div>

        <div className="pt-4 flex justify-center gap-3">
          <Link
            to="/"
            className="px-8 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition"
          >
            Return to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  // 5-STEP WIZARD
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Hidden file inputs for sample uploads and replaces */}
      <input
        type="file"
        ref={sampleFilesRef}
        onChange={handleSampleFilesSelected}
        accept="image/*"
        multiple
        className="hidden"
      />
      <input
        type="file"
        ref={singleReplaceRef}
        onChange={handleSingleReplaceSelected}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={idFrontRef}
        onChange={(e) => handleIdUpload(e, 'front')}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={idBackRef}
        onChange={(e) => handleIdUpload(e, 'back')}
        accept="image/*"
        className="hidden"
      />

      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          Selluy Verified Seller Onboarding
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-stone-950 font-display">
          Apply to Sell on Selluy
        </h1>
        <p className="text-stone-600 text-sm max-w-lg mx-auto">
          We curate genuine local makers and independent brands. Complete the 5 steps below to get your verified seller badge.
        </p>
      </div>

      {/* Draft Restored Banner */}
      {hasDraftRestored && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/90 text-amber-900 text-xs flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Resumed your saved application draft. Your progress is autosaved.</span>
          </div>
          <button
            type="button"
            onClick={discardDraft}
            className="text-amber-800 hover:text-amber-950 underline font-bold shrink-0 cursor-pointer"
          >
            Discard Draft
          </button>
        </div>
      )}

      {/* 5-Step Stepper */}
      <div className="bg-white rounded-2xl p-4 border border-sand-200 shadow-soft-sm">
        <div className="flex items-center justify-between text-xs font-bold">
          {[
            { step: 1, label: 'Account' },
            { step: 2, label: 'Business' },
            { step: 3, label: 'Products' },
            { step: 4, label: 'Verification' },
            { step: 5, label: 'Review' },
          ].map((item, idx) => {
            const isActive = currentStep === item.step;
            const isCompleted = currentStep > item.step;
            return (
              <React.Fragment key={item.step}>
                <div
                  className={`flex items-center gap-1.5 ${
                    isActive
                      ? 'text-blue-600'
                      : isCompleted
                      ? 'text-emerald-700'
                      : 'text-stone-400'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-sand-200 text-stone-600'
                    }`}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5" /> : item.step}
                  </span>
                  <span className="hidden sm:inline">{item.label}</span>
                </div>
                {idx < 4 && (
                  <div
                    className={`flex-1 mx-2 h-0.5 transition ${
                      currentStep > idx + 1 ? 'bg-emerald-500' : 'bg-sand-200'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
        <div className="text-[11px] text-stone-500 text-center mt-2.5 sm:hidden font-medium">
          Step {currentStep} of 5: {[
            'Account & Contact',
            'Business Details',
            'Products & Samples',
            'Identity & Pickup',
            'Review & Submit',
          ][currentStep - 1]}
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* STEP 1: ACCOUNT & CONTACT INFO */}
      {currentStep === 1 && (
        <form onSubmit={handleProceedToStep2} className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-200 shadow-soft-sm space-y-6">
          <div className="border-b border-sand-100 pb-3 flex items-center justify-between">
            <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-black flex items-center justify-center">1</span>
              Account &amp; Contact Details
            </h3>
            <span className="text-xs text-stone-400">Pre-populated from account</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Your Full Legal Name <span className="text-rose-500">*</span>
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
              <span className="text-[11px] text-stone-400 mt-1 block">
                Must match your government identity proof for verification.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center justify-between">
                <span>Verified Mobile Number</span>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                  <ShieldCheck className="w-3 h-3" /> OTP Verified
                </span>
              </label>
              <input
                type="text"
                name="phone"
                disabled
                value={formData.phone}
                className="w-full px-3.5 py-2.5 rounded-xl border border-sand-200 text-sm bg-sand-100/70 text-stone-600 font-semibold cursor-not-allowed select-none"
              />
              <span className="text-[11px] text-stone-400 mt-1 block">
                Linked to your Fast2SMS verified phone session.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="name@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <span className="text-[11px] text-stone-400 mt-1 block">
                Used for order notifications and monthly seller statements.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Base City <span className="text-rose-500">*</span>
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
              <span className="text-[11px] text-stone-400 mt-1 block">
                Where your workshop or physical studio is located.
              </span>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>Continue to Business Details</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* STEP 2: BUSINESS DETAILS */}
      {currentStep === 2 && (
        <form onSubmit={handleProceedToStep3} className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-200 shadow-soft-sm space-y-6">
          <div className="border-b border-sand-100 pb-3 flex items-center justify-between">
            <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-black flex items-center justify-center">2</span>
              Studio &amp; Brand Information
            </h3>
            <span className="text-xs text-stone-400">Step 2 of 5</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Store / Brand Name <span className="text-rose-500">*</span>
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
              <span className="text-[11px] text-stone-400 mt-1 block">
                This will be your storefront name displayed on Selluy.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Seller Type <span className="text-rose-500">*</span>
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
                Primary Product Category <span className="text-rose-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
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
                placeholder="e.g. Banjara Hills, Koramangala, Bandra"
                className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <span className="text-[11px] text-stone-400 mt-1 block">
                Helps local buyers know which neighborhood you ship from.
              </span>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Store Description &amp; Craftsmanship <span className="text-rose-500">*</span>
              </label>
              <textarea
                name="description"
                rows={3}
                required
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Tell us what you make, materials used, technique, and where you produce your pieces..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
              />
              <span className="text-[11px] text-stone-400 mt-1 block">
                Minimum 20 characters. This appears on your public storefront bio.
              </span>
            </div>

            {/* Social Media Toggle */}
            <div className="sm:col-span-2 p-3.5 rounded-2xl bg-sand-50 border border-sand-200 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="has_social"
                  checked={formData.has_social}
                  onChange={handleCheckboxChange}
                  className="rounded border-sand-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                  <Instagram className="w-3.5 h-3.5 text-pink-600" />
                  I have a social media presence (Instagram / YouTube / Facebook)
                </span>
              </label>
              {formData.has_social && (
                <div className="pt-1">
                  <input
                    type="url"
                    name="social_media_url"
                    value={formData.social_media_url}
                    onChange={handleInputChange}
                    placeholder="https://instagram.com/yourbrand"
                    className="w-full px-3 py-2 rounded-xl border border-sand-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  />
                  <span className="text-[10px] text-stone-400 mt-1 block">
                    Our curation team will review your social media portfolio for faster approval.
                  </span>
                </div>
              )}
            </div>

            {/* Website Toggle */}
            <div className="sm:col-span-2 p-3.5 rounded-2xl bg-sand-50 border border-sand-200 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="has_website"
                  checked={formData.has_website}
                  onChange={handleCheckboxChange}
                  className="rounded border-sand-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-blue-600" />
                  I have an independent website or online portfolio
                </span>
              </label>
              {formData.has_website && (
                <div className="pt-1">
                  <input
                    type="url"
                    name="website_url"
                    value={formData.website_url}
                    onChange={handleInputChange}
                    placeholder="https://yourbrand.com"
                    className="w-full px-3 py-2 rounded-xl border border-sand-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 flex justify-between items-center border-t border-sand-100">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-5 py-2.5 rounded-full border border-sand-300 text-stone-700 font-bold text-xs hover:bg-sand-50 transition flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <button
              type="submit"
              className="px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>Next: Product Samples</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* STEP 3: PRODUCTS & SAMPLE MEDIA UPLOADS */}
      {currentStep === 3 && (
        <form onSubmit={handleProceedToStep4} className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-200 shadow-soft-sm space-y-6">
          <div className="border-b border-sand-100 pb-3 flex items-center justify-between">
            <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-black flex items-center justify-center">3</span>
              Products &amp; Craftsmanship Samples
            </h3>
            <span className="text-xs text-stone-400">Step 3 of 5</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                What products do you make or sell? <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="product_types"
                required
                value={formData.product_types}
                onChange={handleInputChange}
                placeholder="e.g. Ceramic mugs, handmade bowls, handloom cotton sarees"
                className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Craft / Production Type
                </label>
                <select
                  name="craft_type"
                  value={formData.craft_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-xl border border-sand-300 text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="100% Handcrafted by Me / Our Artisans">100% Handcrafted by Me / Artisans</option>
                  <option value="Designed In-House & Locally Produced">Designed In-House &amp; Locally Produced</option>
                  <option value="Curated Local Indie Boutique">Curated Local Indie Boutique</option>
                  <option value="Authorized Regional Brand">Authorized Regional Brand</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Average Price Range
                </label>
                <select
                  name="product_range"
                  value={formData.product_range}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-xl border border-sand-300 text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Under ₹500">Under ₹500</option>
                  <option value="₹500 - ₹2,000">₹500 - ₹2,000</option>
                  <option value="₹2,000 - ₹5,000">₹2,000 - ₹5,000</option>
                  <option value="₹5,000+">₹5,000+</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Fulfillment Method
                </label>
                <select
                  name="delivery_method"
                  value={formData.delivery_method}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-xl border border-sand-300 text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Local Same-Day / Next-Day Delivery">Local Same-Day / Next-Day</option>
                  <option value="Pan-India Courier / SpeedPost">Pan-India Courier</option>
                  <option value="Storefront Pickup + Courier">Storefront Pickup + Courier</option>
                </select>
              </div>
            </div>

            {/* Product Sample Media Upload Box */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-stone-800">
                  Product Sample Photos (Upload 2 to 5 photos) <span className="text-rose-500">*</span>
                </label>
                <span className={`text-xs font-bold ${formData.product_samples.length >= 2 ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {formData.product_samples.length} of 5 uploaded {formData.product_samples.length < 2 && '(Min 2 required)'}
                </span>
              </div>

              {/* Upload Drop Zone / Button */}
              {formData.product_samples.length < 5 && (
                <div
                  onClick={() => sampleFilesRef.current?.click()}
                  className="border-2 border-dashed border-sand-300 hover:border-blue-500 rounded-2xl p-6 text-center cursor-pointer transition bg-sand-50/50 hover:bg-blue-50/30 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white text-blue-600 flex items-center justify-center mx-auto shadow-xs border border-sand-200 group-hover:scale-105 transition">
                    <Upload className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-xs font-bold text-stone-900 mt-2.5">
                    Click to select product photos from your device
                  </p>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    PNG, JPG, or WebP up to 5MB. Real photos of your handcrafted pieces or workshop.
                  </p>
                </div>
              )}

              {/* Uploaded Samples Grid */}
              {formData.product_samples.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mt-4">
                  {formData.product_samples.map((url, idx) => (
                    <div
                      key={idx}
                      className="relative rounded-2xl overflow-hidden border border-sand-200 group bg-sand-100 aspect-square shadow-xs"
                    >
                      <img
                        src={url}
                        alt={`Sample ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-1.5 left-1.5 bg-stone-950/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md backdrop-blur-xs">
                        {idx === 0 ? 'Cover' : `#${idx + 1}`}
                      </div>
                      <div className="absolute inset-0 bg-stone-950/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2 p-2">
                        <button
                          type="button"
                          onClick={() => triggerReplaceSample(idx)}
                          className="p-1.5 rounded-full bg-white text-stone-800 hover:bg-blue-50 hover:text-blue-600 transition shadow-xs"
                          title="Replace photo"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeSample(idx)}
                          className="p-1.5 rounded-full bg-white text-rose-600 hover:bg-rose-50 transition shadow-xs"
                          title="Remove photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 flex justify-between items-center border-t border-sand-100">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-5 py-2.5 rounded-full border border-sand-300 text-stone-700 font-bold text-xs hover:bg-sand-50 transition flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <button
              type="submit"
              className="px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>Next: ID Verification</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* STEP 4: GOVERNMENT ID VERIFICATION & PICKUP ADDRESS */}
      {currentStep === 4 && (
        <form onSubmit={handleProceedToStep5} className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-200 shadow-soft-sm space-y-6">
          <div className="border-b border-sand-100 pb-3 flex items-center justify-between">
            <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-black flex items-center justify-center">4</span>
              Identity Verification &amp; Pickup Address
            </h3>
            <span className="text-xs text-stone-400">Step 4 of 5</span>
          </div>

          {/* Privacy Disclaimer Box */}
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 flex items-start gap-3 text-xs text-blue-900">
            <Lock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Private &amp; Restricted View:</strong> Your government identity documents are encrypted and accessible exclusively by Selluy verification moderators. They will never be shared publicly or visible on your storefront.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Document Type <span className="text-rose-500">*</span>
              </label>
              <select
                name="verification_id_type"
                value={formData.verification_id_type}
                onChange={handleInputChange}
                className="w-full sm:w-64 px-3.5 py-2.5 rounded-xl border border-sand-300 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="aadhaar">Aadhaar Card</option>
                <option value="voter_id">Voter ID Card</option>
              </select>
            </div>

            {/* Front & Back Document Upload Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Front Photo */}
              <div className="p-4 rounded-2xl border border-sand-200 bg-sand-50/50 space-y-3">
                <span className="text-xs font-bold text-stone-900 block">
                  Document Front Side <span className="text-rose-500">*</span>
                </span>
                {formData.government_id_front ? (
                  <div className="relative rounded-xl overflow-hidden border border-sand-300 aspect-[16/10] bg-sand-100 group">
                    <img
                      src={formData.government_id_front}
                      alt="ID Front"
                      className="w-full h-full object-cover filter blur-[1px] group-hover:blur-none transition"
                    />
                    <div className="absolute inset-0 bg-stone-950/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => idFrontRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg bg-white text-stone-800 text-xs font-bold shadow-xs"
                      >
                        Change Photo
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData((p) => ({ ...p, government_id_front: '' }))}
                        className="p-1.5 rounded-lg bg-rose-500 text-white shadow-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => idFrontRef.current?.click()}
                    className="w-full border-2 border-dashed border-sand-300 hover:border-blue-500 rounded-xl p-6 text-center cursor-pointer transition bg-white"
                  >
                    <Upload className="w-6 h-6 text-stone-400 mx-auto mb-1" />
                    <span className="text-xs font-bold text-blue-600 block">Upload Front Photo</span>
                    <span className="text-[10px] text-stone-400 mt-0.5 block">Clear photo from device</span>
                  </button>
                )}
              </div>

              {/* Back Photo (Optional for Voter ID, Recommended for Aadhaar) */}
              <div className="p-4 rounded-2xl border border-sand-200 bg-sand-50/50 space-y-3">
                <span className="text-xs font-bold text-stone-900 block">
                  Document Back Side (Optional)
                </span>
                {formData.government_id_back ? (
                  <div className="relative rounded-xl overflow-hidden border border-sand-300 aspect-[16/10] bg-sand-100 group">
                    <img
                      src={formData.government_id_back}
                      alt="ID Back"
                      className="w-full h-full object-cover filter blur-[1px] group-hover:blur-none transition"
                    />
                    <div className="absolute inset-0 bg-stone-950/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => idBackRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg bg-white text-stone-800 text-xs font-bold shadow-xs"
                      >
                        Change Photo
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData((p) => ({ ...p, government_id_back: '' }))}
                        className="p-1.5 rounded-lg bg-rose-500 text-white shadow-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => idBackRef.current?.click()}
                    className="w-full border-2 border-dashed border-sand-300 hover:border-blue-500 rounded-xl p-6 text-center cursor-pointer transition bg-white"
                  >
                    <Upload className="w-6 h-6 text-stone-400 mx-auto mb-1" />
                    <span className="text-xs font-bold text-blue-600 block">Upload Back Photo</span>
                    <span className="text-[10px] text-stone-400 mt-0.5 block">Address side</span>
                  </button>
                )}
              </div>
            </div>

            {/* Dispatch / Pickup Address */}
            <div className="pt-2 border-t border-sand-100 space-y-4">
              <h4 className="text-xs font-extrabold text-stone-900 uppercase tracking-wide flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-blue-600" />
                Dispatch &amp; Order Pickup Address
              </h4>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Workshop / Studio Street Address <span className="text-rose-500">*</span>
                </label>
                <textarea
                  name="business_address"
                  rows={2}
                  required
                  value={formData.business_address}
                  onChange={handleInputChange}
                  placeholder="Flat/Door No., Building, Street, Landmark, Locality"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    State <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    6-Digit Postal PIN Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    maxLength={6}
                    required
                    value={formData.pincode}
                    onChange={handleInputChange}
                    placeholder="e.g. 500034"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-between items-center border-t border-sand-100">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="px-5 py-2.5 rounded-full border border-sand-300 text-stone-700 font-bold text-xs hover:bg-sand-50 transition flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <button
              type="submit"
              className="px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>Next: Review &amp; Submit</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* STEP 5: REVIEW & FINAL SUBMISSION */}
      {currentStep === 5 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-200 shadow-soft-sm space-y-6">
          <div className="border-b border-sand-100 pb-3 flex items-center justify-between">
            <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-black flex items-center justify-center">5</span>
              Review Application Details
            </h3>
            <span className="text-xs text-stone-400">Step 5 of 5</span>
          </div>

          <div className="space-y-4">
            {/* Card 1: Account */}
            <div className="p-4 rounded-2xl bg-sand-50/70 border border-sand-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-stone-900 uppercase tracking-wide">
                  Account &amp; Contact
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  Edit
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-stone-500">Applicant:</span>{' '}
                  <span className="font-bold text-stone-900">{formData.full_name}</span>
                </div>
                <div>
                  <span className="text-stone-500">Phone:</span>{' '}
                  <span className="font-bold text-stone-900">{formData.phone}</span>
                </div>
                <div>
                  <span className="text-stone-500">Email:</span>{' '}
                  <span className="font-bold text-stone-900">{formData.email || 'None provided'}</span>
                </div>
                <div>
                  <span className="text-stone-500">Base City:</span>{' '}
                  <span className="font-bold text-stone-900">{formData.city}</span>
                </div>
              </div>
            </div>

            {/* Card 2: Business */}
            <div className="p-4 rounded-2xl bg-sand-50/70 border border-sand-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-stone-900 uppercase tracking-wide">
                  Business &amp; Studio
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  Edit
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-stone-500">Store Name:</span>{' '}
                  <span className="font-bold text-stone-900">{formData.store_name}</span>
                </div>
                <div>
                  <span className="text-stone-500">Seller Type:</span>{' '}
                  <span className="font-bold text-stone-900 capitalize">{formData.seller_type.replace('_', ' ')}</span>
                </div>
                <div>
                  <span className="text-stone-500">Category:</span>{' '}
                  <span className="font-bold text-stone-900">{formData.category}</span>
                </div>
                <div>
                  <span className="text-stone-500">Locality:</span>{' '}
                  <span className="font-bold text-stone-900">{formData.area || formData.city}</span>
                </div>
                {formData.has_social && formData.social_media_url && (
                  <div className="sm:col-span-2">
                    <span className="text-stone-500">Social Profile:</span>{' '}
                    <span className="font-bold text-blue-600">{formData.social_media_url}</span>
                  </div>
                )}
                {formData.has_website && formData.website_url && (
                  <div className="sm:col-span-2">
                    <span className="text-stone-500">Website:</span>{' '}
                    <span className="font-bold text-blue-600">{formData.website_url}</span>
                  </div>
                )}
                <div className="sm:col-span-2 pt-1 border-t border-sand-200 text-stone-700">
                  <span className="text-stone-500 block mb-0.5">Bio / Description:</span>
                  <p className="line-clamp-3">{formData.description}</p>
                </div>
              </div>
            </div>

            {/* Card 3: Products & Samples */}
            <div className="p-4 rounded-2xl bg-sand-50/70 border border-sand-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-stone-900 uppercase tracking-wide">
                  Products &amp; Samples ({formData.product_samples.length} photos)
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  Edit
                </button>
              </div>
              <div className="text-xs space-y-1">
                <div>
                  <span className="text-stone-500">Products:</span>{' '}
                  <span className="font-bold text-stone-900">{formData.product_types}</span>
                </div>
                <div>
                  <span className="text-stone-500">Craft Type:</span>{' '}
                  <span className="font-bold text-stone-900">{formData.craft_type}</span>
                </div>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 pt-2">
                {formData.product_samples.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`Sample ${i + 1}`}
                    className="w-full aspect-square rounded-xl object-cover border border-sand-300"
                  />
                ))}
              </div>
            </div>

            {/* Card 4: Verification & Pickup */}
            <div className="p-4 rounded-2xl bg-sand-50/70 border border-sand-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-stone-900 uppercase tracking-wide">
                  Verification &amp; Dispatch Pickup
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  Edit
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-stone-500">ID Type:</span>{' '}
                  <span className="font-bold text-stone-900 capitalize">{formData.verification_id_type}</span>
                </div>
                <div>
                  <span className="text-stone-500">PIN Code:</span>{' '}
                  <span className="font-bold text-stone-900">{formData.pincode} ({formData.state})</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-stone-500">Pickup Address:</span>{' '}
                  <span className="font-bold text-stone-900">{formData.business_address}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Certification Checkbox */}
          <label className="flex items-start gap-2.5 pt-2 cursor-pointer select-none">
            <input
              type="checkbox"
              name="agreement"
              checked={formData.agreement}
              onChange={handleCheckboxChange}
              className="mt-0.5 rounded border-sand-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-xs text-stone-600 leading-relaxed">
              I certify that all details provided are accurate and genuine. I agree to Selluy's Seller Code of Conduct, zero-counterfeit policy, and honest local fulfillment guidelines.
            </span>
          </label>

          <div className="pt-4 flex justify-between items-center border-t border-sand-100">
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="px-5 py-2.5 rounded-full border border-sand-300 text-stone-700 font-bold text-xs hover:bg-sand-50 transition flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handleFinalSubmit}
              disabled={isSubmitting || !formData.agreement}
              className="px-8 py-3 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Submitting Application...</span>
                </>
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
