import crypto from 'crypto';

/**
 * Selluy Password Setup & Update Serverless Function (Vercel)
 * Route: POST /api/set-password
 * Body: { phone: "9876543210", password: "...", token?: "123456", hash?: "..." }
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
    const { phone, password, token, hash } = req.body || {};
    const cleanPhone = (phone || '').replace(/\D/g, '');

    if (cleanPhone.length !== 10) {
      return res.status(400).json({ success: false, error: 'Invalid 10-digit mobile number.' });
    }

    if (!password || typeof password !== 'string') {
      return res.status(400).json({ success: false, error: 'Password is required.' });
    }

    // Password Complexity Validation:
    // Minimum 6 characters, at least 1 letter, 1 number, and 1 special character
    const hasMinLength = password.length >= 6;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasMinLength || !hasLetter || !hasNumber || !hasSpecial) {
      return res.status(400).json({
        success: false,
        error: 'Password must contain at least 6 characters, including a letter, a number, and a special character.',
      });
    }

    // Cryptographic PBKDF2 Password Hashing
    const salt = crypto.randomBytes(16).toString('hex');
    const derivedKey = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    const passwordHash = `${salt}:${derivedKey}`;

    // Cloud database persistence if Supabase configured
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('mock-instance')) {
      try {
        await fetch(`${supabaseUrl}/rest/v1/users?phone=eq.%2B91${cleanPhone}`, {
          method: 'PATCH',
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            password_configured: true,
            updated_at: new Date().toISOString(),
          }),
        }).catch(() => null);
      } catch (dbErr) {
        console.warn('Database password state sync warning:', dbErr);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Password configured securely.',
      password_configured: true,
      password_hash: passwordHash,
    });
  } catch (err) {
    console.error('set-password endpoint error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error while configuring password.' });
  }
}
