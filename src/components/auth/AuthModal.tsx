import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Smartphone, ArrowRight, ShieldCheck, RefreshCw, AlertCircle, CheckCircle2, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { SelluyLogo } from '../common/SelluyLogo';
import { Button } from '../ui/Button';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'signup';
  initialPhone?: string;
  initialStep?: 'phone' | 'otp';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialPhone = '',
  initialStep = 'phone',
}) => {
  const { sendOtp, verifyOtp } = useAuth();

  // Step 1: 'phone' -> Step 2: 'otp' -> Step 3: 'success'
  const [step, setStep] = useState<'phone' | 'otp' | 'success'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [attemptCount, setAttemptCount] = useState(0);

  // Initialize or reset state on open/change
  useEffect(() => {
    if (isOpen) {
      const activeStep = initialStep || 'phone';
      const cleanInitialPhone = initialPhone ? initialPhone.replace(/\D/g, '').slice(0, 10) : '';
      setStep(activeStep);
      setPhone(cleanInitialPhone);
      setOtp(['', '', '', '', '', '']);
      setErrorMsg('');
      setAttemptCount(0);

      if (activeStep === 'otp') {
        setCooldown(45);
        setTimeout(() => {
          document.getElementById('selluy-otp-0')?.focus();
        }, 120);
      }
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

  // Format 10-digit phone
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (raw.length <= 10) {
      setPhone(raw);
      setErrorMsg('');
    }
  };

  // Submit phone number to request OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (phone.length !== 10 || !/^[6-9]\d{9}$/.test(phone)) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await sendOtp(phone);
      if (res.success) {
        setIsNewUser(res.isNewUser);
        setStep('otp');
        setCooldown(45); // 45 seconds cooldown
      } else {
        setErrorMsg(res.error || 'Failed to send OTP.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP digit input
  const handleOtpDigitChange = (index: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto-advance focus to next input
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

  // Verify OTP submission
  const handleVerifyOtp = async (e: React.FormEvent) => {
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
        setStep('success');
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setAttemptCount((prev) => prev + 1);
        setErrorMsg(res.error || 'Incorrect OTP code. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (cooldown > 0) return;
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await sendOtp(phone);
      if (res.success) {
        setCooldown(45);
        setOtp(['', '', '', '', '', '']);
        setAttemptCount(0);
      } else {
        setErrorMsg(res.error || 'Failed to resend OTP.');
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

            {/* Modal Brand Header */}
            <div className="flex flex-col items-center text-center mb-6">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 350, damping: 20 }}
              >
                <SelluyLogo variant="symbol" size="lg" className="mb-3" />
              </motion.div>
              <h3 className="text-2xl font-black text-stone-950 font-display tracking-tight">
                {step === 'phone'
                  ? 'Welcome to Selluy'
                  : step === 'otp'
                  ? 'Verify your number'
                  : 'Verified successfully!'}
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-xs">
                {step === 'phone'
                  ? 'Enter your Indian mobile number to access verified indie sellers.'
                  : step === 'otp'
                  ? `We sent a 6-digit OTP to +91 ${phone.slice(0, 5)} ${phone.slice(5)}`
                  : 'Taking you into the local marketplace...'}
              </p>
            </div>

            {/* Shakeable Error Alert */}
            <AnimatePresence>
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    x: [-6, 6, -5, 5, -2, 2, 0],
                  }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700 font-medium"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <span>{errorMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* STEP 1: Phone Input */}
            {step === 'phone' && (
              <motion.form
                key="step-phone"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSendOtp}
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
                    Instant passwordless OTP access.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || phone.length !== 10}
                  isLoading={isLoading}
                  size="lg"
                  className="w-full py-3.5 shadow-md"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </motion.form>
            )}

            {/* STEP 2: 6-Digit OTP */}
            {step === 'otp' && (
              <motion.form
                key="step-otp"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleVerifyOtp}
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
                    onClick={() => setStep('phone')}
                    className="hover:text-blue-600 underline font-medium cursor-pointer"
                  >
                    Change number
                  </button>

                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={cooldown > 0 || isLoading}
                    className="font-bold text-blue-600 hover:text-blue-700 disabled:text-stone-400 cursor-pointer"
                  >
                    {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}
                  </button>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || otp.join('').length !== 6}
                  isLoading={isLoading}
                  size="lg"
                  className="w-full py-3.5 shadow-md"
                >
                  Verify &amp; Continue
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </motion.form>
            )}

            {/* STEP 3: Success */}
            {step === 'success' && (
              <motion.div
                key="step-success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8 flex flex-col items-center justify-center text-center"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-3">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h4 className="text-xl font-black text-stone-950 font-display">You&apos;re Signed In!</h4>
                <p className="text-xs text-stone-600 mt-1">
                  {isNewUser ? 'Account created. Setting up local city discovery...' : 'Welcome back to Selluy.'}
                </p>
              </motion.div>
            )}

            {/* Footer Note */}
            <div className="mt-6 pt-4 border-t border-sand-100 text-center text-[11px] text-stone-400">
              By continuing, you agree to Selluy&apos;s Terms of Service and Privacy Policy.
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
