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
    let foundUser = null;

    const supabaseUrl =
      process.env.VITE_SUPABASE_URL ||
      process.env.SUPABASE_URL ||
      'https://uxmoahxrzvxqzuvbmvwx.supabase.co';
    const supabaseAnonKey =
      process.env.VITE_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      'sb_publishable_MfxInnFBDCL0KZvEGB7Geg_454G_ibU';

    const headers = {
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`,
    };

    // If targetHash not passed from client local storage, query cloud database
    if (!targetHash && supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('mock-instance')) {
      // 1. Check user_credentials table
      try {
        const credRes = await fetch(
          `${supabaseUrl}/rest/v1/user_credentials?phone=eq.${cleanPhone}&select=password_hash`,
          { headers }
        );
        const creds = await credRes.json().catch(() => []);
        if (Array.isArray(creds) && creds.length > 0 && creds[0].password_hash) {
          targetHash = creds[0].password_hash;
        }
      } catch (credErr) {
        console.warn('user_credentials lookup notice:', credErr);
      }

      // 2. Query users table
      try {
        const userRes = await fetch(
          `${supabaseUrl}/rest/v1/users?or=(phone.eq.%2B91${cleanPhone},phone.eq.%2B91%20${cleanPhone},phone.ilike.*${cleanPhone}*)&select=*`,
          { headers }
        );
        const users = await userRes.json().catch(() => []);
        if (Array.isArray(users) && users.length > 0) {
          foundUser = users[0];
          if (!targetHash && foundUser.password_hash) {
            targetHash = foundUser.password_hash;
          }
        }
      } catch (dbErr) {
        console.warn('Database users lookup notice:', dbErr);
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
      const activeUser = foundUser
        ? {
            id: foundUser.id,
            name: foundUser.name || `User ${cleanPhone.slice(-4)}`,
            phone: foundUser.phone || `+91${cleanPhone}`,
            email: foundUser.email || `${cleanPhone}@selluy.user`,
            role: foundUser.role || 'buyer',
            city: foundUser.city || 'Hyderabad',
            avatar: foundUser.avatar,
            password_configured: true,
            created_at: foundUser.created_at || new Date().toISOString(),
          }
        : {
            id: `usr_${cleanPhone}`,
            name: `User ${cleanPhone.slice(-4)}`,
            phone: `+91${cleanPhone}`,
            email: `${cleanPhone}@selluy.user`,
            role: 'buyer',
            city: 'Hyderabad',
            password_configured: true,
            created_at: new Date().toISOString(),
          };

      return res.status(200).json({
        success: true,
        message: 'Password authentication successful.',
        phone: `+91${cleanPhone}`,
        password_hash: targetHash,
        user: activeUser,
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
