import crypto from 'crypto';

/**
 * Fast2SMS Live OTP Dispatcher Serverless Function (Vercel)
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

    const apiKey = (process.env.FAST2SMS_API_KEY || '').trim();
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'FAST2SMS_API_KEY is not configured in Vercel environment variables. Please add it to your Vercel Project Settings.',
      });
    }

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

    let lastGatewayError = null;
    let dispatchSuccess = false;
    let successDetails = null;

    const checkSuccess = (data) => {
      if (!data) return false;
      if (data.return === true) return true;
      if (Array.isArray(data.message) && data.message.some((m) => typeof m === 'string' && m.toLowerCase().includes('success'))) {
        return true;
      }
      if (typeof data.message === 'string' && data.message.toLowerCase().includes('success')) {
        return true;
      }
      return false;
    };

    // ATTEMPT 1: Quick SMS Route (route: 'q') via POST
    // Does not require pre-approved domain verification
    try {
      const qRes = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          authorization: apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route: 'q',
          message: `Your Selluy verification code is ${otp}. Valid for 5 minutes.`,
          language: 'english',
          flash: 0,
          numbers: cleanPhone,
        }),
      });

      const qData = await qRes.json().catch(() => null);
      if (checkSuccess(qData)) {
        dispatchSuccess = true;
        successDetails = { provider: 'fast2sms-quick', requestId: qData?.request_id || null };
      } else if (qData) {
        lastGatewayError = Array.isArray(qData.message) ? qData.message.join(', ') : qData.message;
      }
    } catch (err) {
      lastGatewayError = err.message;
    }

    // ATTEMPT 2: Quick SMS Route (route: 'q') via GET query parameters
    if (!dispatchSuccess) {
      try {
        const getUrl = `https://www.fast2sms.com/dev/bulkV2?authorization=${encodeURIComponent(apiKey)}&route=q&message=${encodeURIComponent(`Your Selluy verification code is ${otp}. Valid for 5 minutes.`)}&language=english&flash=0&numbers=${encodeURIComponent(cleanPhone)}`;
        const qGetRes = await fetch(getUrl, {
          method: 'GET',
          headers: {
            authorization: apiKey,
          },
        });
        const qGetData = await qGetRes.json().catch(() => null);
        if (checkSuccess(qGetData)) {
          dispatchSuccess = true;
          successDetails = { provider: 'fast2sms-quick-get', requestId: qGetData?.request_id || null };
        } else if (qGetData) {
          lastGatewayError = Array.isArray(qGetData.message) ? qGetData.message.join(', ') : qGetData.message;
        }
      } catch (err) {
        lastGatewayError = err.message;
      }
    }

    // ATTEMPT 3: OTP Route (route: 'otp') via POST
    if (!dispatchSuccess) {
      try {
        const otpRes = await fetch('https://www.fast2sms.com/dev/bulkV2', {
          method: 'POST',
          headers: {
            authorization: apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            route: 'otp',
            variables_values: otp,
            numbers: cleanPhone,
          }),
        });

        const otpData = await otpRes.json().catch(() => null);
        if (checkSuccess(otpData)) {
          dispatchSuccess = true;
          successDetails = { provider: 'fast2sms-otp', requestId: otpData?.request_id || null };
        } else if (otpData) {
          lastGatewayError = Array.isArray(otpData.message) ? otpData.message.join(', ') : otpData.message;
        }
      } catch (err) {
        lastGatewayError = err.message;
      }
    }

    // ATTEMPT 4: OTP Route (route: 'otp') via GET query parameters
    if (!dispatchSuccess) {
      try {
        const getOtpUrl = `https://www.fast2sms.com/dev/bulkV2?authorization=${encodeURIComponent(apiKey)}&route=otp&variables_values=${encodeURIComponent(otp)}&numbers=${encodeURIComponent(cleanPhone)}`;
        const otpGetRes = await fetch(getOtpUrl, {
          method: 'GET',
          headers: {
            authorization: apiKey,
          },
        });
        const otpGetData = await otpGetRes.json().catch(() => null);
        if (checkSuccess(otpGetData)) {
          dispatchSuccess = true;
          successDetails = { provider: 'fast2sms-otp-get', requestId: otpGetData?.request_id || null };
        } else if (otpGetData) {
          lastGatewayError = Array.isArray(otpGetData.message) ? otpGetData.message.join(', ') : otpGetData.message;
        }
      } catch (err) {
        lastGatewayError = err.message;
      }
    }

    // If any attempt succeeded in delivering SMS
    if (dispatchSuccess) {
      return res.status(200).json({
        success: true,
        message: 'OTP sent successfully to your mobile number via Fast2SMS.',
        hash: tokenHash,
        ...successDetails,
      });
    }

    // Format human-friendly error explanation from Fast2SMS response
    const rawMsg = typeof lastGatewayError === 'string' ? lastGatewayError : JSON.stringify(lastGatewayError || 'Unknown gateway error');
    let friendlyError = rawMsg;

    if (rawMsg.toLowerCase().includes('website verification')) {
      friendlyError = 'Fast2SMS notice: Website verification required. In your Fast2SMS dashboard, go to Dev API / OTP Message and enter https://selluy.vercel.app, or recharge wallet.';
    } else if (rawMsg.toLowerCase().includes('balance') || rawMsg.toLowerCase().includes('insufficient')) {
      friendlyError = 'Fast2SMS notice: Insufficient wallet balance. Please recharge ₹10–₹50 in your Fast2SMS dashboard to send SMS.';
    } else if (rawMsg.toLowerCase().includes('authorization') || rawMsg.toLowerCase().includes('key') || rawMsg.toLowerCase().includes('invalid')) {
      friendlyError = 'Fast2SMS notice: Invalid API authorization key. Please verify FAST2SMS_API_KEY in Vercel settings.';
    }

    console.error('Fast2SMS dispatch failed:', { rawMsg, cleanPhone });

    return res.status(400).json({
      success: false,
      error: friendlyError,
      rawGatewayMessage: rawMsg,
    });
  } catch (err) {
    console.error('send-otp endpoint error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error while dispatching OTP.' });
  }
}
