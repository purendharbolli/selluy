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
 * Selloi Password Setup & Update Serverless Function (Vercel)
 * Route: POST /api/set-password
 * Body: { phone: "9876543210", password: "..." }
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
    const { phone, password } = req.body || {};
    const cleanPhone = cleanIndianPhone(phone);

    if (cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      return res.status(400).json({ success: false, error: 'Invalid 10-digit mobile number.' });
    }

    if (!password || typeof password !== 'string') {
      return res.status(400).json({ success: false, error: 'Password is required.' });
    }

    // Password Complexity Validation: Minimum 6 characters
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must contain at least 6 characters.',
      });
    }

    // Cryptographic PBKDF2 Password Hashing
    const salt = crypto.randomBytes(16).toString('hex');
    const derivedKey = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    const passwordHash = `${salt}:${derivedKey}`;

    // Cloud database persistence if Supabase configured
    const supabaseUrl =
      process.env.VITE_SUPABASE_URL ||
      process.env.SUPABASE_URL ||
      'https://uxmoahxrzvxqzuvbmvwx.supabase.co';
    const supabaseAnonKey =
      process.env.VITE_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      'sb_publishable_MfxInnFBDCL0KZvEGB7Geg_454G_ibU';

    if (supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('mock-instance')) {
      const now = new Date().toISOString();
      const headers = {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      };

      // 1. Persist in user_credentials table (dedicated credentials store for cross-device sync)
      try {
        await fetch(`${supabaseUrl}/rest/v1/user_credentials`, {
          method: 'POST',
          headers: {
            ...headers,
            'Prefer': 'resolution=merge-duplicates',
          },
          body: JSON.stringify({
            phone: cleanPhone,
            password_hash: passwordHash,
            updated_at: now,
          }),
        }).catch(() => null);
      } catch (credErr) {
        console.warn('user_credentials sync notice:', credErr);
      }

      // 2. Persist in users table (find or upsert)
      try {
        const userCheckRes = await fetch(
          `${supabaseUrl}/rest/v1/users?or=(phone.eq.%2B91${cleanPhone},phone.eq.%2B91%20${cleanPhone},phone.ilike.*${cleanPhone}*)&select=id`,
          { headers }
        );
        const existingUsers = await userCheckRes.json().catch(() => []);

        if (Array.isArray(existingUsers) && existingUsers.length > 0) {
          // Update existing user
          await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${existingUsers[0].id}`, {
            method: 'PATCH',
            headers: {
              ...headers,
              'Prefer': 'return=minimal',
            },
            body: JSON.stringify({
              password_configured: true,
              password_hash: passwordHash,
              updated_at: now,
            }),
          }).catch(() => null);
        } else {
          // Insert new user row with email and role matching check constraints
          await fetch(`${supabaseUrl}/rest/v1/users`, {
            method: 'POST',
            headers: {
              ...headers,
              'Prefer': 'resolution=merge-duplicates',
            },
            body: JSON.stringify({
              id: `usr_${cleanPhone}`,
              name: `User ${cleanPhone.slice(-4)}`,
              email: `${cleanPhone}@selloi.user`,
              phone: `+91${cleanPhone}`,
              role: 'buyer',
              city: 'Hyderabad',
              password_configured: true,
              password_hash: passwordHash,
              created_at: now,
              updated_at: now,
            }),
          }).catch(() => null);
        }
      } catch (dbErr) {
        console.warn('Database users password sync notice:', dbErr);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Password configured securely.',
      password_configured: true,
      password_hash: passwordHash,
      phone: `+91${cleanPhone}`,
    });
  } catch (err) {
    console.error('set-password endpoint error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error while configuring password.' });
  }
}
