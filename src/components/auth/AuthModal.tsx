import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  Sparkles,
  RefreshCw,
  ArrowLeft,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { SelluyLogo } from '../common/SelluyLogo';
import { Button } from '../ui/Button';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'signup';
  initialPhone?: string;
  initialStep?: 'password-login' | 'otp-phone';
}

type AuthScreen =
  | 'password-login'
  | 'otp-phone'
  | 'otp-verify'
  | 'set-password-first-time'
  | 'forgot-phone'
  | 'forgot-otp'
  | 'forgot-reset'
  | 'success';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialPhone = '',
  initialStep = 'password-login',
}) => {
  const { sendOtp, verifyOtp, setPassword, loginWithPassword } = useAuth();

  const [screen, setScreen] = useState<AuthScreen>('password-login');
  const [phone, setPhone] = useState('');
  const [password, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP State
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [cooldown, setCooldown] = useState(0);
  const [attemptCount, setAttemptCount] = useState(0);

  // Password Setup & Reset State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // UI & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  // Initialize modal state on open
  useEffect(() => {
    if (isOpen) {
      const savedPhone =
        initialPhone ||
        localStorage.getItem('selluy_last_phone') ||
        '';

      const cleanPhone = savedPhone.replace(/\D/g, '').slice(0, 10);
      setPhone(cleanPhone);
      setPasswordInput('');
      setShowPassword(false);
      setOtp(['', '', '', '', '', '']);
      setNewPassword('');
      setConfirmPassword('');
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      setErrorMsg('');
      setSuccessNotice('');
      setAttemptCount(0);

      // Default to Password Login as primary for returning experience
      setScreen(initialStep || 'password-login');
    }
  }, [isOpen, initialPhone, initialStep]);

  // Resend cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

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

  // Phone input formatting
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (raw.length <= 10) {
      setPhone(raw);
      setErrorMsg('');
    }
  };

  // OTP digit input
  const handleOtpDigitChange = (index: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < 5) {
      const nextInput = document.getElementById(`selluy-otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`selluy-otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  // Complexity rules for new password
  const hasMinLength = newPassword.length >= 6;
  const hasLetter = /[a-zA-Z]/.test(newPassword);
  const hasNumber = /\d/.test(newPassword);
  const hasSpecial = /[@$!%*?&#^()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword);
  const isPasswordValid = hasMinLength && hasLetter && hasNumber && hasSpecial;
  const passwordsMatch = newPassword === confirmPassword && newPassword.length > 0;

  // 1. PRIMARY LOGIN: Mobile Number + Password
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (phone.length !== 10 || !/^[6-9]\d{9}$/.test(phone)) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await loginWithPassword(phone, password);
      if (res.success) {
        localStorage.setItem('selluy_last_phone', phone);
        setSuccessNotice('Welcome back! Logging in...');
        setScreen('success');
        setTimeout(() => {
          onClose();
        }, 1100);
      } else {
        setErrorMsg(res.error || 'Incorrect mobile number or password. Try again or log in with OTP.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 2. SECONDARY LOGIN: Send OTP
  const handleSendLoginOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (phone.length !== 10 || !/^[6-9]\d{9}$/.test(phone)) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await sendOtp(phone);
      if (res.success) {
        setScreen('otp-verify');
        setCooldown(45);
        setOtp(['', '', '', '', '', '']);
      } else {
        setErrorMsg(res.error || 'Failed to send OTP. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP for secondary login
  const handleVerifyLoginOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = otp.join('');
    if (token.length !== 6) {
      setErrorMsg('Please enter the full 6-digit verification code.');
      return;
    }

    if (attemptCount >= 5) {
      setErrorMsg('Maximum attempts reached. Please request a new OTP.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await verifyOtp(phone, token);
      if (res.success) {
        localStorage.setItem('selluy_last_phone', phone);
        // If brand new user or password not yet configured, offer optional password creation
        if (res.isNewUser || !res.user?.password_configured) {
          setScreen('set-password-first-time');
        } else {
          setSuccessNotice('Verified successfully!');
          setScreen('success');
          setTimeout(() => {
            onClose();
          }, 1100);
        }
      } else {
        setAttemptCount((prev) => prev + 1);
        setErrorMsg(res.error || 'Incorrect OTP code. Please check your SMS and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // First-time optional password setup
  const handleFirstTimeSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) {
      setErrorMsg('Please satisfy all password complexity requirements.');
      return;
    }

    if (!passwordsMatch) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await setPassword(newPassword, phone);
      if (res.success) {
        setSuccessNotice('Password set! Logging into Selluy...');
        setScreen('success');
        setTimeout(() => {
          onClose();
        }, 1100);
      } else {
        setErrorMsg(res.error || 'Failed to save password.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipPassword = () => {
    setSuccessNotice('Welcome to Selluy!');
    setScreen('success');
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  // 3. FORGOT PASSWORD FLOW
  // Screen A: Send OTP to reset password
  const handleSendForgotPasswordOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (phone.length !== 10 || !/^[6-9]\d{9}$/.test(phone)) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await sendOtp(phone);
      if (res.success) {
        setScreen('forgot-otp');
        setCooldown(45);
        setOtp(['', '', '', '', '', '']);
      } else {
        setErrorMsg(res.error || 'Failed to send OTP code.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Screen B: Verify OTP for password reset
  const handleVerifyForgotPasswordOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = otp.join('');
    if (token.length !== 6) {
      setErrorMsg('Please enter the full 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await verifyOtp(phone, token);
      if (res.success) {
        // Identity verified via OTP. Now allow creating new password.
        setScreen('forgot-reset');
      } else {
        setErrorMsg(res.error || 'Incorrect OTP code. Please check your SMS.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Screen C: Set & Confirm New Password
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) {
      setErrorMsg('Please satisfy all password complexity requirements.');
      return;
    }

    if (!passwordsMatch) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await setPassword(newPassword, phone);
      if (res.success) {
        localStorage.setItem('selluy_last_phone', phone);
        setSuccessNotice('Password successfully updated! Logging you in...');
        setScreen('success');
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setErrorMsg(res.error || 'Failed to update password.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP for either login or forgot-password
  const handleResendOtp = async () => {
    if (cooldown > 0 || !phone) return;
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await sendOtp(phone);
      if (res.success) {
        setCooldown(45);
        setOtp(['', '', '', '', '', '']);
        setAttemptCount(0);
      } else {
        setErrorMsg(res.error || 'Failed to resend verification code.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            className="relative bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-sand-200 overflow-hidden z-10"
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
            <div className="flex flex-col items-center text-center mb-6">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 350, damping: 20 }}
              >
                <SelluyLogo variant="symbol" size="lg" className="mb-3" />
              </motion.div>

              <h3 className="text-2xl font-black text-stone-950 font-display tracking-tight">
                {screen === 'password-login'
                  ? 'Welcome back'
                  : screen === 'otp-phone'
                  ? 'Sign in with OTP'
                  : screen === 'otp-verify'
                  ? 'Verify your number'
                  : screen === 'set-password-first-time'
                  ? 'Secure your account'
                  : screen === 'forgot-phone'
                  ? 'Forgot password?'
                  : screen === 'forgot-otp'
                  ? 'Verify identity'
                  : screen === 'forgot-reset'
                  ? 'Create new password'
                  : 'Welcome to Selluy!'}
              </h3>

              <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-xs leading-relaxed">
                {screen === 'password-login'
                  ? 'Sign in with your mobile number and password.'
                  : screen === 'otp-phone'
                  ? 'Enter your Indian mobile number for instant OTP sign in.'
                  : screen === 'otp-verify'
                  ? `Enter the 6-digit OTP sent to +91 ${phone.slice(0, 5)} ${phone.slice(5)}`
                  : screen === 'set-password-first-time'
                  ? 'Set a password to log in directly next time without waiting for SMS OTP.'
                  : screen === 'forgot-phone'
                  ? 'Enter your mobile number to receive a secure OTP code.'
                  : screen === 'forgot-otp'
                  ? `Enter the 6-digit reset code sent to +91 ${phone.slice(0, 5)} ${phone.slice(5)}`
                  : screen === 'forgot-reset'
                  ? 'Choose a strong new password for your account.'
                  : successNotice || 'Taking you into the local marketplace...'}
              </p>
            </div>

            {/* Error Banner */}
            <AnimatePresence>
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700 font-medium"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <span>{errorMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 1. SCREEN: PASSWORD LOGIN (PRIMARY FOR RETURNING USERS) */}
            {screen === 'password-login' && (
              <motion.form
                key="screen-password-login"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handlePasswordLogin}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Mobile number
                  </label>
                  <div className="relative flex items-center rounded-2xl border border-sand-300 focus-within:ring-2 focus-within:ring-blue-500/40 focus-within:border-blue-600 bg-sand-50/50 overflow-hidden transition-all shadow-xs">
                    <span className="px-3.5 py-3 text-sm font-bold text-stone-700 border-r border-sand-200 bg-sand-100/70 select-none">
                      🇮🇳 +91
                    </span>
                    <input
                      type="tel"
                      placeholder="Enter 10-digit number"
                      value={phone}
                      onChange={handlePhoneChange}
                      className="w-full px-3.5 py-3 text-base font-semibold text-stone-900 bg-transparent focus:outline-none placeholder-stone-400"
                      autoFocus={!phone}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative flex items-center rounded-2xl border border-sand-300 focus-within:ring-2 focus-within:ring-blue-500/40 focus-within:border-blue-600 bg-sand-50/50 overflow-hidden transition-all shadow-xs">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full px-3.5 py-3 text-sm font-semibold text-stone-900 bg-transparent focus:outline-none placeholder-stone-400"
                      autoFocus={Boolean(phone)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="px-3 text-stone-400 hover:text-stone-700 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Forgot Password Link */}
                  <div className="flex justify-end pt-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMsg('');
                        setScreen('forgot-phone');
                      }}
                      className="text-xs text-blue-600 hover:underline font-bold cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>

                {/* Primary Button */}
                <Button
                  type="submit"
                  disabled={isLoading || phone.length !== 10 || !password}
                  isLoading={isLoading}
                  size="lg"
                  className="w-full py-3.5 shadow-md bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Log In
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>

                {/* Secondary Option: Login with OTP */}
                <div className="pt-2">
                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-sand-200" />
                    <span className="flex-shrink mx-3 text-stone-400 text-xs font-medium">or</span>
                    <div className="flex-grow border-t border-sand-200" />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg('');
                      setScreen('otp-phone');
                    }}
                    className="w-full py-2.5 rounded-xl border border-sand-300 text-stone-700 hover:bg-sand-50 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Login with OTP instead</span>
                  </button>
                </div>
              </motion.form>
            )}

            {/* 2. SCREEN: OTP PHONE INPUT (SECONDARY OPTION) */}
            {screen === 'otp-phone' && (
              <motion.form
                key="screen-otp-phone"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleSendLoginOtp}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Indian Mobile Number
                  </label>
                  <div className="relative flex items-center rounded-2xl border border-sand-300 focus-within:ring-2 focus-within:ring-blue-500/40 focus-within:border-blue-600 bg-sand-50/50 overflow-hidden transition-all shadow-xs">
                    <span className="px-3.5 py-3 text-sm font-bold text-stone-700 border-r border-sand-200 bg-sand-100/70 select-none">
                      🇮🇳 +91
                    </span>
                    <input
                      type="tel"
                      placeholder="Enter 10-digit number"
                      value={phone}
                      onChange={handlePhoneChange}
                      className="w-full px-3.5 py-3 text-base font-semibold text-stone-900 bg-transparent focus:outline-none placeholder-stone-400"
                      autoFocus
                      required
                    />
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1.5 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Instant Fast2SMS OTP verification delivered to your phone.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || phone.length !== 10}
                  isLoading={isLoading}
                  size="lg"
                  className="w-full py-3.5 shadow-md bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Send OTP
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>

                <div className="pt-2">
                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-sand-200" />
                    <span className="flex-shrink mx-3 text-stone-400 text-xs font-medium">or</span>
                    <div className="flex-grow border-t border-sand-200" />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg('');
                      setScreen('password-login');
                    }}
                    className="w-full py-2.5 rounded-xl border border-sand-300 text-stone-700 hover:bg-sand-50 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Login with Password instead</span>
                  </button>
                </div>
              </motion.form>
            )}

            {/* 3. SCREEN: OTP VERIFICATION (LOGIN) */}
            {screen === 'otp-verify' && (
              <motion.form
                key="screen-otp-verify"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                onSubmit={handleVerifyLoginOtp}
                className="space-y-5"
              >
                <div className="flex justify-between gap-1.5 sm:gap-2">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`selluy-otp-${idx}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-11 sm:w-12 h-13 sm:h-14 text-center text-xl font-black text-stone-900 border border-sand-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-600 bg-sand-50/50 shadow-xs transition"
                      autoFocus={idx === 0}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
                  <button
                    type="button"
                    onClick={() => setScreen('otp-phone')}
                    className="hover:text-stone-800 underline cursor-pointer"
                  >
                    Change number
                  </button>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={cooldown > 0 || isLoading}
                    className="text-blue-600 font-bold disabled:text-stone-400 hover:underline cursor-pointer"
                  >
                    {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
                  </button>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || otp.join('').length !== 6}
                  isLoading={isLoading}
                  size="lg"
                  className="w-full py-3.5 shadow-md bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Verify &amp; Log In
                </Button>
              </motion.form>
            )}

            {/* 4. SCREEN: OPTIONAL FIRST-TIME PASSWORD SETUP */}
            {screen === 'set-password-first-time' && (
              <motion.form
                key="screen-first-time-password"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                onSubmit={handleFirstTimeSetPassword}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Create Password
                  </label>
                  <div className="relative flex items-center rounded-2xl border border-sand-300 focus-within:ring-2 focus-within:ring-blue-500 bg-sand-50/50 overflow-hidden">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="e.g. Selluy@123"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm font-medium text-stone-900 bg-transparent focus:outline-none"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="px-3 text-stone-400 hover:text-stone-700"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative flex items-center rounded-2xl border border-sand-300 focus-within:ring-2 focus-within:ring-blue-500 bg-sand-50/50 overflow-hidden">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm font-medium text-stone-900 bg-transparent focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="px-3 text-stone-400 hover:text-stone-700"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Validation Indicators */}
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
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
                    <span>Special character</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={!isPasswordValid || !passwordsMatch || isLoading}
                  isLoading={isLoading}
                  size="lg"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Set Password &amp; Continue
                </Button>

                <button
                  type="button"
                  onClick={handleSkipPassword}
                  className="w-full py-2 text-xs font-bold text-stone-500 hover:text-stone-800 transition cursor-pointer"
                >
                  Skip for now
                </button>
              </motion.form>
            )}

            {/* 5. SCREEN: FORGOT PASSWORD — PHONE INPUT */}
            {screen === 'forgot-phone' && (
              <motion.form
                key="screen-forgot-phone"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleSendForgotPasswordOtp}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Your Registered Indian Mobile Number
                  </label>
                  <div className="relative flex items-center rounded-2xl border border-sand-300 focus-within:ring-2 focus-within:ring-blue-500/40 focus-within:border-blue-600 bg-sand-50/50 overflow-hidden transition-all shadow-xs">
                    <span className="px-3.5 py-3 text-sm font-bold text-stone-700 border-r border-sand-200 bg-sand-100/70 select-none">
                      🇮🇳 +91
                    </span>
                    <input
                      type="tel"
                      placeholder="Enter 10-digit number"
                      value={phone}
                      onChange={handlePhoneChange}
                      className="w-full px-3.5 py-3 text-base font-semibold text-stone-900 bg-transparent focus:outline-none placeholder-stone-400"
                      autoFocus
                      required
                    />
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1.5 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    For your security, a 6-digit verification code will be sent to your mobile.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || phone.length !== 10}
                  isLoading={isLoading}
                  size="lg"
                  className="w-full py-3.5 shadow-md bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Send Verification Code
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg('');
                      setScreen('password-login');
                    }}
                    className="text-xs text-stone-600 hover:text-stone-900 font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to Login
                  </button>
                </div>
              </motion.form>
            )}

            {/* 6. SCREEN: FORGOT PASSWORD — VERIFY OTP */}
            {screen === 'forgot-otp' && (
              <motion.form
                key="screen-forgot-otp"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                onSubmit={handleVerifyForgotPasswordOtp}
                className="space-y-5"
              >
                <div className="flex justify-between gap-1.5 sm:gap-2">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`selluy-otp-${idx}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-11 sm:w-12 h-13 sm:h-14 text-center text-xl font-black text-stone-900 border border-sand-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-600 bg-sand-50/50 shadow-xs transition"
                      autoFocus={idx === 0}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
                  <button
                    type="button"
                    onClick={() => setScreen('forgot-phone')}
                    className="hover:text-stone-800 underline cursor-pointer"
                  >
                    Change number
                  </button>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={cooldown > 0 || isLoading}
                    className="text-blue-600 font-bold disabled:text-stone-400 hover:underline cursor-pointer"
                  >
                    {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
                  </button>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || otp.join('').length !== 6}
                  isLoading={isLoading}
                  size="lg"
                  className="w-full py-3.5 shadow-md bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Verify Code
                </Button>
              </motion.form>
            )}

            {/* 7. SCREEN: FORGOT PASSWORD — CREATE NEW PASSWORD */}
            {screen === 'forgot-reset' && (
              <motion.form
                key="screen-forgot-reset"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                onSubmit={handleResetPasswordSubmit}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    New Password
                  </label>
                  <div className="relative flex items-center rounded-2xl border border-sand-300 focus-within:ring-2 focus-within:ring-blue-500 bg-sand-50/50 overflow-hidden">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="Create a strong password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm font-medium text-stone-900 bg-transparent focus:outline-none"
                      autoFocus
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="px-3 text-stone-400 hover:text-stone-700 cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative flex items-center rounded-2xl border border-sand-300 focus-within:ring-2 focus-within:ring-blue-500 bg-sand-50/50 overflow-hidden">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm font-medium text-stone-900 bg-transparent focus:outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="px-3 text-stone-400 hover:text-stone-700 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Validation Indicators */}
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
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
                    <span>Special character</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={!isPasswordValid || !passwordsMatch || isLoading}
                  isLoading={isLoading}
                  size="lg"
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md"
                >
                  Reset &amp; Save Password
                </Button>
              </motion.form>
            )}

            {/* 8. SCREEN: SUCCESS */}
            {screen === 'success' && (
              <motion.div
                key="screen-success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8 text-center space-y-3"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-200 shadow-sm">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <h4 className="text-xl font-black text-stone-950 font-display">
                  {successNotice || 'Successfully Authenticated'}
                </h4>
                <p className="text-xs text-stone-500">
                  Redirecting to the marketplace...
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
