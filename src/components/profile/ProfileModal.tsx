import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Camera,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Save,
  ShieldCheck,
  KeyRound,
  Store,
  Clock,
  Eye,
  EyeOff,
  Check,
  RefreshCw,
  ExternalLink,
  Lock,
  Package,
  Key,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { marketplaceService } from '../../services/marketplaceService';
import { SellerApplication, Order } from '../../types';
import { Button } from '../ui/Button';
import { normalizeIndianPhone, formatIndianPhoneDisplay } from '../../utils/phone';

export interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'profile' | 'orders' | 'security' | 'seller';
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, initialTab = 'profile' }) => {
  const navigate = useNavigate();
  const { user, updateUser, sendOtp, verifyOtp, setPassword, loginWithPassword } = useAuth();
  const { availableCities } = useLocation();

  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'security' | 'seller'>(initialTab);

  // Profile Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<string>('prefer_not_to_say');
  const [city, setCity] = useState('');
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Password / Security State
  // Mode: 'idle' | 'set_password' | 'change_password' | 'verify_otp' | 'enter_new_password'
  const [securityStep, setSecurityStep] = useState<
    'idle' | 'set_password' | 'change_password' | 'verify_otp' | 'enter_new_password'
  >('idle');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [isSettingPassword, setIsSettingPassword] = useState(false);
  const [securityFeedback, setSecurityFeedback] = useState<{ type: 'error' | 'success'; msg: string } | null>(null);

  // Seller App State
  const [sellerApp, setSellerApp] = useState<SellerApplication | null>(null);

  // Buyer Orders State
  const [userOrders, setUserOrders] = useState<Order[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state from user object on modal open
  useEffect(() => {
    if (isOpen) {
      if (initialTab) {
        setActiveTab(initialTab);
      }
      if (user) {
        setName(user.name || '');
        setEmail(user.email || '');
        setAddress(user.address || '');
        setAge(user.age !== undefined ? String(user.age) : '');
        setGender(user.gender || 'prefer_not_to_say');
        setCity(user.city || 'Hyderabad');
        setAvatar(user.avatar || undefined);
        setSuccessMsg('');
        setErrorMsg('');
        setSecurityStep('idle');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowCurrentPassword(false);
        setShowPassword(false);
        setShowConfirmPassword(false);
        setOtpCode('');
        setSecurityFeedback(null);

        // Fetch seller application
        const app = marketplaceService.getApplicationByUserId(user.id);
        setSellerApp(app || null);

        // Fetch buyer's real orders
        const orders = marketplaceService.getOrdersByBuyer(user.id);
        setUserOrders(orders);
      }
    }
  }, [isOpen, initialTab, user]);

  // Resend countdown timer
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((t) => t - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Password rules validation
  const hasMinLength = newPassword.length >= 6;
  const hasLetter = /[a-zA-Z]/.test(newPassword);
  const hasNumber = /\d/.test(newPassword);
  const hasSpecial = /[@$!%*?&#^()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword);
  const isPasswordValid = hasMinLength && hasLetter && hasNumber && hasSpecial;
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  // Handle image upload from file picker
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setErrorMsg('Image size should be less than 3MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatar(reader.result);
        setErrorMsg('');
      }
    };
    reader.readAsDataURL(file);
  };

  // Remove photo
  const handleRemovePhoto = () => {
    setAvatar(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Submit profile updates
  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const parsedAge = age.trim() ? parseInt(age.trim(), 10) : undefined;

      await updateUser({
        name: name.trim(),
        email: email.trim() || undefined,
        address: address.trim() || undefined,
        age: parsedAge,
        gender: gender || 'prefer_not_to_say',
        city: city || user?.city || 'Hyderabad',
        avatar: avatar || undefined,
      });

      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 900);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset security forms back to idle
  const resetSecurityState = () => {
    setSecurityStep('idle');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrentPassword(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setOtpCode('');
  };

  // Direct initial password setup for logged-in user (NO OTP required!)
  const handleDirectSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) {
      setSecurityFeedback({
        type: 'error',
        msg: 'Please ensure your password meets all complexity requirements.',
      });
      return;
    }
    if (!passwordsMatch) {
      setSecurityFeedback({
        type: 'error',
        msg: 'Passwords do not match. Please re-type your confirm password.',
      });
      return;
    }

    setIsSettingPassword(true);
    setSecurityFeedback(null);
    try {
      const res = await setPassword(newPassword, user?.phone);
      if (res.success) {
        setSecurityFeedback({
          type: 'success',
          msg: 'Password created successfully! You can now log in using your password.',
        });
        resetSecurityState();
      } else {
        setSecurityFeedback({ type: 'error', msg: res.error || 'Failed to set password.' });
      }
    } catch (err: any) {
      setSecurityFeedback({ type: 'error', msg: err.message || 'Error setting password.' });
    } finally {
      setIsSettingPassword(false);
    }
  };

  // Direct password change for user who already has a password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword.trim()) {
      setSecurityFeedback({
        type: 'error',
        msg: 'Please enter your current password.',
      });
      return;
    }
    if (!isPasswordValid) {
      setSecurityFeedback({
        type: 'error',
        msg: 'New password must meet all complexity requirements.',
      });
      return;
    }
    if (!passwordsMatch) {
      setSecurityFeedback({
        type: 'error',
        msg: 'New passwords do not match.',
      });
      return;
    }
    if (currentPassword === newPassword) {
      setSecurityFeedback({
        type: 'error',
        msg: 'New password cannot be the same as your current password.',
      });
      return;
    }

    setIsSettingPassword(true);
    setSecurityFeedback(null);
    try {
      // First verify the current password
      const authRes = await loginWithPassword(user?.phone || '', currentPassword);
      if (!authRes.success) {
        setSecurityFeedback({
          type: 'error',
          msg: 'Current password incorrect. Use "Reset via SMS OTP" below if you forgot it.',
        });
        setIsSettingPassword(false);
        return;
      }

      // Update to new password
      const res = await setPassword(newPassword, user?.phone);
      if (res.success) {
        setSecurityFeedback({
          type: 'success',
          msg: 'Password updated successfully!',
        });
        resetSecurityState();
      } else {
        setSecurityFeedback({ type: 'error', msg: res.error || 'Failed to update password.' });
      }
    } catch (err: any) {
      setSecurityFeedback({ type: 'error', msg: err.message || 'Error updating password.' });
    } finally {
      setIsSettingPassword(false);
    }
  };

  // Security: Trigger OTP to user's verified phone for forgot-password reset
  const handleStartOtpReset = async () => {
    if (!user?.phone) {
      setSecurityFeedback({ type: 'error', msg: 'Mobile number not linked to account.' });
      return;
    }

    setOtpSending(true);
    setSecurityFeedback(null);
    try {
      const clean = normalizeIndianPhone(user.phone);
      const res = await sendOtp(clean);
      if (res.success) {
        setSecurityStep('verify_otp');
        setResendTimer(30);
        setSecurityFeedback({
          type: 'success',
          msg: `Verification code sent to ${formatIndianPhoneDisplay(user.phone)}.`,
        });
      } else {
        setSecurityFeedback({ type: 'error', msg: res.error || 'Failed to send OTP code.' });
      }
    } catch (err: any) {
      setSecurityFeedback({ type: 'error', msg: err.message || 'SMS gateway error.' });
    } finally {
      setOtpSending(false);
    }
  };

  // Security: Resend OTP
  const handleResendOtp = async () => {
    if (!user?.phone || resendTimer > 0) return;
    setOtpSending(true);
    try {
      const clean = normalizeIndianPhone(user.phone);
      const res = await sendOtp(clean);
      if (res.success) {
        setResendTimer(30);
        setSecurityFeedback({
          type: 'success',
          msg: `New verification code sent to ${formatIndianPhoneDisplay(user.phone)}.`,
        });
      } else {
        setSecurityFeedback({ type: 'error', msg: res.error || 'Failed to resend OTP.' });
      }
    } finally {
      setOtpSending(false);
    }
  };

  // Security: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.phone || otpCode.trim().length !== 6) {
      setSecurityFeedback({ type: 'error', msg: 'Please enter the 6-digit code sent to your phone.' });
      return;
    }

    setOtpVerifying(true);
    setSecurityFeedback(null);
    try {
      const clean = normalizeIndianPhone(user.phone);
      const res = await verifyOtp(clean, otpCode.trim());
      if (res.success) {
        setSecurityStep('enter_new_password');
        setSecurityFeedback({
          type: 'success',
          msg: 'Identity verified. You can now set your new password.',
        });
      } else {
        setSecurityFeedback({ type: 'error', msg: res.error || 'Invalid OTP code. Please try again.' });
      }
    } catch (err: any) {
      setSecurityFeedback({ type: 'error', msg: err.message || 'Verification failed.' });
    } finally {
      setOtpVerifying(false);
    }
  };

  // Security: Save New Password after OTP verification
  const handleSavePasswordAfterOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) {
      setSecurityFeedback({
        type: 'error',
        msg: 'Please ensure your password meets all complexity requirements.',
      });
      return;
    }
    if (!passwordsMatch) {
      setSecurityFeedback({
        type: 'error',
        msg: 'Passwords do not match.',
      });
      return;
    }

    setIsSettingPassword(true);
    setSecurityFeedback(null);
    try {
      const res = await setPassword(newPassword, user?.phone);
      if (res.success) {
        setSecurityFeedback({
          type: 'success',
          msg: 'Password successfully updated and secured!',
        });
        resetSecurityState();
      } else {
        setSecurityFeedback({ type: 'error', msg: res.error || 'Failed to update password.' });
      }
    } catch (err: any) {
      setSecurityFeedback({ type: 'error', msg: err.message || 'Error updating password.' });
    } finally {
      setIsSettingPassword(false);
    }
  };

  const userInitial = name.trim() ? name.trim().charAt(0).toUpperCase() : 'U';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="relative bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-sand-200 overflow-hidden z-10 my-8"
            role="dialog"
            aria-modal="true"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-sand-100 hover:bg-sand-200 text-stone-500 hover:text-stone-900 flex items-center justify-center transition cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="mb-5">
              <h3 className="text-2xl font-black text-stone-950 font-display tracking-tight">
                Account &amp; Settings
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Manage your profile details, password security, and seller status.
              </p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-sand-100 border border-sand-200 mb-5 text-xs font-bold overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className={`flex-1 py-2 px-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeTab === 'profile'
                    ? 'bg-white text-stone-950 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Account</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className={`flex-1 py-2 px-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeTab === 'orders'
                    ? 'bg-white text-stone-950 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Orders</span>
                {userOrders.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
                    {userOrders.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('security')}
                className={`flex-1 py-2 px-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeTab === 'security'
                    ? 'bg-white text-stone-950 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Security</span>
                {user?.password_configured ? (
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('seller')}
                className={`flex-1 py-2 px-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeTab === 'seller'
                    ? 'bg-white text-stone-950 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>{user?.role === 'seller' || sellerApp?.status === 'approved' ? 'Seller Studio' : 'Become Seller'}</span>
                {sellerApp?.status === 'approved' && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                )}
              </button>
            </div>

            {/* Feedback Banners */}
            <AnimatePresence>
              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-800 font-semibold"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{successMsg}</span>
                </motion.div>
              )}

              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-xs text-rose-700 font-medium"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* TAB 1: PERSONAL PROFILE INFO */}
            {activeTab === 'profile' && (
              <form onSubmit={handleSubmitProfile} className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                {/* Profile Picture Section */}
                <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-sand-50/70 border border-sand-200/90">
                  <div className="relative group">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt={name || 'Profile'}
                        className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-soft-sm ring-2 ring-blue-500/20"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 text-white flex items-center justify-center font-black text-lg shadow-soft-sm border-2 border-white select-none">
                        {userInitial}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-stone-900 text-white flex items-center justify-center hover:bg-blue-600 transition shadow-xs cursor-pointer"
                      title="Change profile picture"
                    >
                      <Camera className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-stone-900">Profile Photo</span>
                      {!avatar && (
                        <span className="text-[10px] text-stone-500 bg-sand-200/70 px-2 py-0.5 rounded-full font-medium">
                          No photo set
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      Optional. Add a personal picture or keep initials badge.
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2.5 py-1 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition cursor-pointer"
                      >
                        {avatar ? 'Change photo' : 'Add photo'}
                      </button>
                      {avatar && (
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* 1. Full Name & Verified Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
                      <UserIcon className="w-3.5 h-3.5 text-stone-500" />
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold text-stone-900 bg-sand-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-stone-500" />
                        Mobile Number
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full inline-flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Verified
                      </span>
                    </label>
                    <input
                      type="text"
                      value={user?.phone || ''}
                      disabled
                      className="w-full px-3.5 py-2.5 rounded-xl border border-sand-200 bg-sand-100/60 text-sm font-semibold text-stone-600 cursor-not-allowed select-none"
                    />
                  </div>
                </div>

                {/* 2. Email & City */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-stone-500" />
                      Email Address <span className="text-[10px] text-stone-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-stone-900 bg-sand-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-stone-500" />
                      Current City
                    </label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold text-stone-900 bg-sand-50/50"
                    >
                      {availableCities.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 3. Age & Gender */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-stone-500" />
                      Age
                    </label>
                    <input
                      type="number"
                      min={12}
                      max={120}
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="e.g. 24"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-stone-900 bg-sand-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Gender
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium text-stone-900 bg-sand-50/50"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                {/* 4. Delivery Address */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-stone-500" />
                    Delivery / Home Address
                  </label>
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Flat / House No., Building Name, Street, Landmark, Area, Pincode"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-stone-900 bg-sand-50/50 resize-none"
                  />
                </div>

                {/* Save Button */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-sand-200">
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={onClose}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    size="md"
                    isLoading={isLoading}
                    className="shadow-md px-6 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Save className="w-4 h-4 mr-1.5" />
                    Save Profile
                  </Button>
                </div>
              </form>
            )}

            {/* TAB 2: BUYER ORDERS & STATUS */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                {userOrders.length === 0 ? (
                  <div className="py-12 px-4 text-center space-y-3 bg-sand-50/50 rounded-2xl border border-sand-200">
                    <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200 shadow-2xs">
                      <Package className="w-7 h-7" />
                    </div>
                    <h4 className="text-base font-extrabold text-stone-900">No orders placed yet</h4>
                    <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                      Discover local artisan drops, place an order with instant seller confirmation, and track your local delivery right here.
                    </p>
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          navigate('/explore');
                        }}
                        className="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition cursor-pointer"
                      >
                        Explore Local Products
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                    {userOrders.map((order) => (
                      <div key={order.id} className="p-4 rounded-2xl bg-sand-50/70 border border-sand-200/90 space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <div>
                            <span className="font-mono font-bold text-stone-900">#{order.id.slice(0, 8)}</span>
                            <span className="text-stone-400 mx-1.5">•</span>
                            <span className="text-stone-500">{new Date(order.created_at).toLocaleDateString()}</span>
                          </div>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              order.status === 'delivered'
                                ? 'bg-emerald-100 text-emerald-800'
                                : order.status === 'shipped'
                                ? 'bg-blue-100 text-blue-800'
                                : order.status === 'processing'
                                ? 'bg-indigo-100 text-indigo-800'
                                : order.status === 'confirmed'
                                ? 'bg-amber-100 text-amber-800'
                                : order.status === 'cancelled'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-sand-200 text-stone-700'
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>

                        <div className="space-y-2 border-y border-sand-200/80 py-2">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2.5">
                                {item.product?.images?.[0] ? (
                                  <img
                                    src={item.product.images[0]}
                                    alt={item.product.name}
                                    className="w-10 h-10 rounded-lg object-cover border border-sand-200"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-sand-200 flex items-center justify-center text-stone-500 font-bold text-[10px]">
                                    IMG
                                  </div>
                                )}
                                <div>
                                  <p className="font-bold text-stone-900 line-clamp-1">
                                    {item.product?.name || `Item ${idx + 1}`}
                                  </p>
                                  <p className="text-[11px] text-stone-500">
                                    Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}
                                  </p>
                                </div>
                              </div>
                              <span className="font-extrabold text-stone-900">
                                ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1">
                          <span className="text-stone-500">
                            Ship to: <strong className="text-stone-700">{order.shipping_address?.city || 'Local'}</strong>
                          </span>
                          <div className="text-right">
                            <span className="text-stone-500 text-[11px] mr-1">Total:</span>
                            <span className="text-sm font-black text-stone-950 font-display">
                              ₹{order.total_amount.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: PASSWORD & SECURITY */}
            {activeTab === 'security' && (
              <div className="space-y-5">
                {/* Security Feedback */}
                {securityFeedback && (
                  <div
                    className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2.5 ${
                      securityFeedback.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {securityFeedback.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span>{securityFeedback.msg}</span>
                  </div>
                )}

                {/* Linked Phone Number display card */}
                <div className="p-3.5 rounded-2xl bg-sand-50 border border-sand-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Linked Mobile</div>
                      <div className="text-xs font-black text-stone-900 font-mono">
                        {user?.phone ? formatIndianPhoneDisplay(user.phone) : 'Not provided'}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                    <Check className="w-3 h-3" /> Verified
                  </span>
                </div>

                {/* STATE 1: IDLE OVERVIEW */}
                {securityStep === 'idle' && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-white border border-sand-200 space-y-3 shadow-xs">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-sand-100 flex items-center justify-center text-stone-700">
                            <KeyRound className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-extrabold text-stone-900">Account Password</span>
                            <div className="mt-0.5">
                              {user?.password_configured ? (
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                  <Check className="w-3 h-3" /> Password Active
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                                  Not Configured
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-stone-600 leading-relaxed">
                        {user?.password_configured
                          ? 'Your account is secured with a password. You can sign in using your mobile number and password on any device without waiting for SMS codes.'
                          : 'Set a password to unlock instant 1-click password login without waiting for SMS OTP every time.'}
                      </p>

                      <div className="pt-2">
                        {user?.password_configured ? (
                          <div className="space-y-2">
                            <button
                              type="button"
                              onClick={() => {
                                setSecurityFeedback(null);
                                setSecurityStep('change_password');
                              }}
                              className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <Key className="w-3.5 h-3.5" />
                              <span>Change Account Password</span>
                            </button>

                            <button
                              type="button"
                              onClick={handleStartOtpReset}
                              disabled={otpSending}
                              className="w-full py-2 rounded-xl text-blue-600 hover:bg-blue-50 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                              {otpSending ? (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  <span>Sending OTP to your phone...</span>
                                </>
                              ) : (
                                <span>Forgot password? Reset via SMS OTP</span>
                              )}
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setSecurityFeedback(null);
                              setSecurityStep('set_password');
                            }}
                            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <Lock className="w-3.5 h-3.5" />
                            <span>Set Account Password</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* STATE 2: DIRECT SET INITIAL PASSWORD (NO OTP REQUIRED) */}
                {securityStep === 'set_password' && (
                  <form onSubmit={handleDirectSetPassword} className="space-y-4 p-4 rounded-2xl bg-white border border-sand-200">
                    <div>
                      <h4 className="text-sm font-extrabold text-stone-900">Set Account Password</h4>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Create a secure password for your verified account ({formatIndianPhoneDisplay(user?.phone)}).
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                          className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-type new password"
                          className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {confirmPassword && (
                        <p className={`text-[11px] mt-1 font-semibold ${passwordsMatch ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                        </p>
                      )}
                    </div>

                    {/* Criteria Badges */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 p-2.5 rounded-xl bg-sand-50 border border-sand-200">
                      <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-700 font-bold' : 'text-stone-400'}`}>
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${hasMinLength ? 'bg-emerald-600 text-white' : 'bg-sand-200 text-stone-500'}`}>
                          ✓
                        </div>
                        <span>6+ characters</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${hasLetter ? 'text-emerald-700 font-bold' : 'text-stone-400'}`}>
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${hasLetter ? 'bg-emerald-600 text-white' : 'bg-sand-200 text-stone-500'}`}>
                          ✓
                        </div>
                        <span>Contains letter</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-700 font-bold' : 'text-stone-400'}`}>
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${hasNumber ? 'bg-emerald-600 text-white' : 'bg-sand-200 text-stone-500'}`}>
                          ✓
                        </div>
                        <span>Contains number</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${hasSpecial ? 'text-emerald-700 font-bold' : 'text-stone-400'}`}>
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${hasSpecial ? 'bg-emerald-600 text-white' : 'bg-sand-200 text-stone-500'}`}>
                          ✓
                        </div>
                        <span>Special character (@$!%*?&#)</span>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={resetSecurityState}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-sand-100"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!isPasswordValid || !passwordsMatch || isSettingPassword}
                        className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
                      >
                        {isSettingPassword ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Saving Password...</span>
                          </>
                        ) : (
                          <span>Save Password</span>
                        )}
                      </button>
                    </div>
                  </form>
                )}

                {/* STATE 3: DIRECT CHANGE PASSWORD (WITH CURRENT PASSWORD) */}
                {securityStep === 'change_password' && (
                  <form onSubmit={handleChangePassword} className="space-y-4 p-4 rounded-2xl bg-white border border-sand-200">
                    <div>
                      <h4 className="text-sm font-extrabold text-stone-900">Change Account Password</h4>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Enter your current password followed by your new password.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          required
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter your existing password"
                          className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                        >
                          {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <div className="mt-1 text-right">
                        <button
                          type="button"
                          onClick={handleStartOtpReset}
                          className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer"
                        >
                          Forgot current password? Reset via SMS OTP
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Create a new password"
                          className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-type new password"
                          className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {confirmPassword && (
                        <p className={`text-[11px] mt-1 font-semibold ${passwordsMatch ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                        </p>
                      )}
                    </div>

                    {/* Criteria Badges */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 p-2.5 rounded-xl bg-sand-50 border border-sand-200">
                      <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-700 font-bold' : 'text-stone-400'}`}>
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${hasMinLength ? 'bg-emerald-600 text-white' : 'bg-sand-200 text-stone-500'}`}>
                          ✓
                        </div>
                        <span>6+ characters</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${hasLetter ? 'text-emerald-700 font-bold' : 'text-stone-400'}`}>
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${hasLetter ? 'bg-emerald-600 text-white' : 'bg-sand-200 text-stone-500'}`}>
                          ✓
                        </div>
                        <span>Contains letter</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-700 font-bold' : 'text-stone-400'}`}>
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${hasNumber ? 'bg-emerald-600 text-white' : 'bg-sand-200 text-stone-500'}`}>
                          ✓
                        </div>
                        <span>Contains number</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${hasSpecial ? 'text-emerald-700 font-bold' : 'text-stone-400'}`}>
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${hasSpecial ? 'bg-emerald-600 text-white' : 'bg-sand-200 text-stone-500'}`}>
                          ✓
                        </div>
                        <span>Special character (@$!%*?&#)</span>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={resetSecurityState}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-sand-100"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!currentPassword || !isPasswordValid || !passwordsMatch || isSettingPassword}
                        className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
                      >
                        {isSettingPassword ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Updating...</span>
                          </>
                        ) : (
                          <span>Update Password</span>
                        )}
                      </button>
                    </div>
                  </form>
                )}

                {/* STATE 4: VERIFY OTP (FOR FORGOT PASSWORD) */}
                {securityStep === 'verify_otp' && (
                  <form onSubmit={handleVerifyOtp} className="space-y-4 p-4 rounded-2xl bg-white border border-sand-200">
                    <div className="text-center space-y-1">
                      <h4 className="text-sm font-extrabold text-stone-900">Verify Mobile Number</h4>
                      <p className="text-xs text-stone-500">
                        Enter the 6-digit code sent to <strong className="text-stone-900">{user?.phone ? formatIndianPhoneDisplay(user.phone) : ''}</strong>
                      </p>
                    </div>

                    <div>
                      <input
                        type="text"
                        maxLength={6}
                        required
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="• • • • • •"
                        className="w-full text-center tracking-[0.5em] font-mono font-black text-2xl py-3 rounded-2xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <button
                        type="button"
                        onClick={resetSecurityState}
                        className="text-stone-500 hover:text-stone-800"
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={resendTimer > 0 || otpSending}
                        className="text-blue-600 font-bold disabled:text-stone-400 hover:underline cursor-pointer"
                      >
                        {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend Code'}
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={otpVerifying || otpCode.length !== 6}
                      className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {otpVerifying ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Verifying OTP...</span>
                        </>
                      ) : (
                        <span>Verify &amp; Continue</span>
                      )}
                    </button>
                  </form>
                )}

                {/* STATE 5: ENTER NEW PASSWORD AFTER OTP */}
                {securityStep === 'enter_new_password' && (
                  <form onSubmit={handleSavePasswordAfterOtp} className="space-y-4 p-4 rounded-2xl bg-white border border-sand-200">
                    <div>
                      <h4 className="text-sm font-extrabold text-stone-900">Set New Password</h4>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Your mobile is verified. Create your new account password.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                          className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-type new password"
                          className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {confirmPassword && (
                        <p className={`text-[11px] mt-1 font-semibold ${passwordsMatch ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                        </p>
                      )}
                    </div>

                    {/* Criteria Badges */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 p-2.5 rounded-xl bg-sand-50 border border-sand-200">
                      <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-700 font-bold' : 'text-stone-400'}`}>
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${hasMinLength ? 'bg-emerald-600 text-white' : 'bg-sand-200 text-stone-500'}`}>
                          ✓
                        </div>
                        <span>6+ characters</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${hasLetter ? 'text-emerald-700 font-bold' : 'text-stone-400'}`}>
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${hasLetter ? 'bg-emerald-600 text-white' : 'bg-sand-200 text-stone-500'}`}>
                          ✓
                        </div>
                        <span>Contains letter</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-700 font-bold' : 'text-stone-400'}`}>
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${hasNumber ? 'bg-emerald-600 text-white' : 'bg-sand-200 text-stone-500'}`}>
                          ✓
                        </div>
                        <span>Contains number</span>
                      </div>
                      <div className={`flex items-center gap-1.5 ${hasSpecial ? 'text-emerald-700 font-bold' : 'text-stone-400'}`}>
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${hasSpecial ? 'bg-emerald-600 text-white' : 'bg-sand-200 text-stone-500'}`}>
                          ✓
                        </div>
                        <span>Special character (@$!%*?&#)</span>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={resetSecurityState}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-sand-100"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!isPasswordValid || !passwordsMatch || isSettingPassword}
                        className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
                      >
                        {isSettingPassword ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Saving Password...</span>
                          </>
                        ) : (
                          <span>Save Password</span>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* TAB 3: SELLER STUDIO & APPLICATION STATUS */}
            {activeTab === 'seller' && (
              <div className="space-y-4">
                {/* CASE 1: VERIFIED ACTIVE SELLER */}
                {sellerApp?.status === 'approved' || user?.role === 'seller' ? (
                  <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-600" />
                        <h4 className="text-sm font-extrabold text-emerald-950">Verified Seller Active</h4>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Approved
                      </span>
                    </div>

                    <p className="text-xs text-emerald-800 leading-relaxed">
                      Your store <strong className="text-emerald-950">{sellerApp?.store_name || 'Your Studio'}</strong> is verified to publish products and fulfill local customer orders.
                    </p>

                    <div className="pt-2 flex flex-col sm:flex-row gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          navigate('/seller/dashboard');
                        }}
                        className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Store className="w-4 h-4" />
                        <span>Seller Dashboard</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          const storeId = sellerApp?.id || marketplaceService.getSellerByUserId(user?.id || '')?.id || user?.id;
                          navigate(`/seller/${storeId}`);
                        }}
                        className="flex-1 py-2.5 rounded-xl bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-800 font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>View Storefront</span>
                      </button>
                    </div>
                  </div>
                ) : sellerApp?.status === 'under_review' || sellerApp?.status === 'pending' || sellerApp?.status === 'submitted' ? (
                  /* CASE 2: UNDER REVIEW */
                  <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-amber-600" />
                        <h4 className="text-sm font-extrabold text-amber-950">Application Under Review</h4>
                      </div>
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                        Review in Progress
                      </span>
                    </div>

                    <p className="text-xs text-amber-900 leading-relaxed">
                      We received your seller application for <strong className="text-amber-950">{sellerApp.store_name}</strong> ({sellerApp.city}). Our curation team verifies photos and IDs within 24–48 hours.
                    </p>

                    <div className="text-[11px] text-amber-800 space-y-1 bg-amber-100/60 p-2.5 rounded-xl">
                      <div>Application ID: <span className="font-mono font-bold">{sellerApp.id}</span></div>
                      <div>Primary Category: <span className="font-bold">{sellerApp.category}</span></div>
                    </div>

                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          navigate('/become-seller');
                        }}
                        className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>View / Update Application</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : sellerApp?.status === 'rejected' ? (
                  /* CASE 3: ACTION NEEDED / REJECTED */
                  <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-rose-600" />
                        <h4 className="text-sm font-extrabold text-rose-950">Application Needs Revision</h4>
                      </div>
                      <span className="text-[10px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full">
                        Action Needed
                      </span>
                    </div>

                    <p className="text-xs text-rose-800 leading-relaxed">
                      {sellerApp.rejection_reason || 'Please provide updated product craft samples or verification documents.'}
                    </p>

                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          navigate('/become-seller');
                        }}
                        className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>Revise &amp; Resubmit Application</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* CASE 4: NOT APPLIED YET */
                  <div className="p-5 rounded-2xl bg-sand-50 border border-sand-200 space-y-3 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
                      <Store className="w-6 h-6 text-blue-600" />
                    </div>

                    <h4 className="text-sm font-extrabold text-stone-900">
                      Sell on Selluy
                    </h4>

                    <p className="text-xs text-stone-600 max-w-sm mx-auto leading-relaxed">
                      Reach customers in your city looking for authentic indie brands and crafts. Complete the 5-step seller onboarding to get verified.
                    </p>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          navigate('/become-seller');
                        }}
                        className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>Apply to Become a Verified Seller</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ProfileModal;
