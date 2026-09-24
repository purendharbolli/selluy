import crypto from 'crypto';

/**
 * Fast2SMS OTP Verification Serverless Function (Vercel)
 * Route: POST /api/verify-otp
 * Body: { phone: "9876543210", token: "123456", hash: "..." }
 */
export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });
  }

  try {
    const { phone, token, hash } = req.body || {};
    const cleanPhone = (phone || '').replace(/\D/g, '');
    const cleanToken = (token || '').trim();

    if (cleanPhone.length !== 10) {
      return res.status(400).json({ success: false, error: 'Invalid 10-digit mobile number.' });
    }

    if (cleanToken.length !== 6 || !/^\d{6}$/.test(cleanToken)) {
      return res.status(400).json({ success: false, error: 'Please enter a valid 6-digit verification code.' });
    }

    const apiKey = process.env.FAST2SMS_API_KEY;
    const secret = process.env.OTP_SECRET || apiKey || 'selluy-fast2sms-production-secret-2026';

    // 1. Verify against HMAC hash if provided
    if (hash && typeof hash === 'string' && hash.includes('.')) {
      const [expectedHash, expiresAtStr] = hash.split('.');
      const expiresAt = parseInt(expiresAtStr, 10);

      // Check OTP expiry (5 minutes)
      if (Date.now() > expiresAt) {
        return res.status(400).json({
          success: false,
          error: 'Verification code has expired. Please request a new OTP.',
        });
      }

      // Recompute HMAC with supplied token
      const computedHash = crypto
        .createHmac('sha256', secret)
        .update(`${cleanPhone}:${cleanToken}:${expiresAt}`)
        .digest('hex');

      if (computedHash === expectedHash) {
        return res.status(200).json({
          success: true,
          message: 'OTP verified successfully.',
          phone: `+91${cleanPhone}`,
        });
      }
    }

    // 2. Dev / Staging fallback verification (123456) when API key is not configured
    if (!apiKey && cleanToken === '123456') {
      return res.status(200).json({
        success: true,
        message: 'Dev fallback OTP verified successfully.',
        phone: `+91${cleanPhone}`,
      });
    }

    return res.status(400).json({
      success: false,
      error: 'Incorrect OTP code. Please check your SMS and try again.',
    });
  } catch (err) {
    console.error('verify-otp endpoint error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error while verifying OTP.' });
  }
}
