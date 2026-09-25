import crypto from 'crypto';

function cleanIndianPhone(phone) {
  let cleaned = (phone || '').replace(/\D/g, '');
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    cleaned = cleaned.slice(2);
  } else if (cleaned.length === 11 && cleaned.startsWith('0')) {
    cleaned = cleaned.slice(1);
  } else if (cleaned.length > 10) {
    cleaned = cleaned.slice(-10);
  }
  return cleaned;
}

/**
 * Selluy Password Login Serverless Function (Vercel)
 * Route: POST /api/login-password
 * Body: { phone: "9876543210", password: "...", storedHash?: "..." }
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
    const { phone, password, storedHash } = req.body || {};
    const cleanPhone = cleanIndianPhone(phone);

    if (cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      return res.status(400).json({ success: false, error: 'Invalid 10-digit mobile number.' });
    }

    if (!password) {
      return res.status(400).json({ success: false, error: 'Please enter your password.' });
    }

    let targetHash = storedHash;

    // If targetHash not passed from client session cache, check cloud database
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (!targetHash && supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('mock-instance')) {
      try {
        const dbRes = await fetch(`${supabaseUrl}/rest/v1/users?phone=eq.%2B91${cleanPhone}&select=*`, {
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`,
          },
        });
        const users = await dbRes.json().catch(() => []);
        if (Array.isArray(users) && users.length > 0 && users[0].password_hash) {
          targetHash = users[0].password_hash;
        }
      } catch (dbErr) {
        console.warn('Database lookup notice:', dbErr);
      }
    }

    if (!targetHash || !targetHash.includes(':')) {
      return res.status(400).json({
        success: false,
        error: 'Password is not set for this account. Please log in using SMS OTP to set one.',
      });
    }

    const [salt, expectedKey] = targetHash.split(':');
    const computedKey = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');

    if (crypto.timingSafeEqual(Buffer.from(computedKey, 'hex'), Buffer.from(expectedKey, 'hex'))) {
      return res.status(200).json({
        success: true,
        message: 'Password authentication successful.',
        phone: `+91${cleanPhone}`,
      });
    }

    return res.status(400).json({
      success: false,
      error: 'Incorrect password. Please try again or log in with SMS OTP.',
    });
  } catch (err) {
    console.error('login-password endpoint error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error while authenticating password.' });
  }
}
