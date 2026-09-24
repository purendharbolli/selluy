import crypto from 'crypto';

/**
 * Fast2SMS OTP Dispatcher Serverless Function (Vercel)
 * Route: POST /api/send-otp
 * Body: { phone: "9876543210" }
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
    const { phone } = req.body || {};
    const cleanPhone = (phone || '').replace(/\D/g, '');

    // Validate 10-digit Indian Mobile Number starting with 6, 7, 8, or 9
    if (cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.',
      });
    }

    const apiKey = process.env.FAST2SMS_API_KEY;
    const secret = process.env.OTP_SECRET || apiKey || 'selluy-fast2sms-production-secret-2026';

    // Generate random 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity

    // Create tamper-proof HMAC verification token
    const hash = crypto
      .createHmac('sha256', secret)
      .update(`${cleanPhone}:${otp}:${expiresAt}`)
      .digest('hex');
    const tokenHash = `${hash}.${expiresAt}`;

    // If Fast2SMS API key is present in environment, dispatch real SMS via Fast2SMS OTP Route
    if (apiKey && apiKey.trim() !== '') {
      try {
        const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
          method: 'POST',
          headers: {
            'authorization': apiKey.trim(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            route: 'otp',
            variables_values: otp,
            numbers: cleanPhone,
          }),
        });

        const data = await response.json();

        if (data && (data.return === true || (Array.isArray(data.message) && data.message[0]?.toLowerCase().includes('success')))) {
          return res.status(200).json({
            success: true,
            message: 'OTP sent successfully to your mobile number via Fast2SMS.',
            hash: tokenHash,
            provider: 'fast2sms',
            requestId: data.request_id || null,
          });
        } else {
          console.warn('Fast2SMS gateway returned notice:', data);
          // If wallet low balance or rate limit, return fallback hash so user isn't locked out during setup
          return res.status(200).json({
            success: true,
            warning: data.message || 'SMS provider gateway notice. Fallback active.',
            hash: tokenHash,
            devOtp: otp,
            provider: 'fast2sms-fallback',
          });
        }
      } catch (smsErr) {
        console.error('Fast2SMS network error:', smsErr);
        return res.status(200).json({
          success: true,
          hash: tokenHash,
          devOtp: otp,
          provider: 'fast2sms-fallback',
        });
      }
    }

    // Dev/Staging Fallback (when FAST2SMS_API_KEY is not yet added in Vercel)
    return res.status(200).json({
      success: true,
      message: 'Fast2SMS API key not yet set in Vercel. Test OTP generated.',
      hash: tokenHash,
      devOtp: '123456',
      provider: 'dev-fallback',
    });
  } catch (err) {
    console.error('send-otp endpoint error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error while dispatching OTP.' });
  }
}
