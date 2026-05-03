// ============================================================
// BOLTAI STUDIO — api/submit.js
// Vercel Serverless Function
//
// Uses Resend (https://resend.com) to send email notifications.
//
// SETUP:
//   1. Sign up at resend.com (free tier: 100 emails/day)
//   2. Get your API key from the Resend dashboard
//   3. In Vercel dashboard → your project → Settings → Environment Variables
//      Add:  RESEND_API_KEY = re_xxxxxxxxxxxxxx
//      Add:  NOTIFY_EMAIL   = your@email.com   (where leads go)
//      Add:  FROM_EMAIL     = studio@yourdomain.com  (must be verified in Resend)
//   4. Deploy — it works automatically
//
// To use a different email provider, swap the fetch() call below.
// ============================================================

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // CORS headers (adjust origin to your actual domain)
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const { name, email, description, budget, timeline, references } = req.body || {};

  // Server-side validation
  if (!name || typeof name !== 'string' || name.trim().length < 1) {
    return res.status(400).json({ message: 'Name is required.' });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: 'Valid email is required.' });
  }
  if (!description || typeof description !== 'string' || description.trim().length < 10) {
    return res.status(400).json({ message: 'Project description is required.' });
  }

  // Read env vars
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const NOTIFY_EMAIL   = process.env.NOTIFY_EMAIL;
  const FROM_EMAIL     = process.env.FROM_EMAIL || 'studio@boltai.dev';

  if (!RESEND_API_KEY || !NOTIFY_EMAIL) {
    console.error('Missing env vars: RESEND_API_KEY or NOTIFY_EMAIL');
    return res.status(500).json({ message: 'Server configuration error.' });
  }

  // Build email HTML
  const notifyHtml = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1a2332;">
      <div style="background:linear-gradient(135deg,#0a2540,#0e3460);padding:28px 32px;border-radius:12px 12px 0 0;">
        <h2 style="color:#ffffff;margin:0;font-size:20px;">⚡ New Studio Lead</h2>
        <p style="color:rgba(255,255,255,0.6);margin:6px 0 0;font-size:13px;">BoltAI Studio — new project inquiry</p>
      </div>
      <div style="background:#f5f8fc;padding:28px 32px;border:1px solid #dde6f0;border-top:none;">
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:10px 0;border-bottom:1px solid #e8edf4;font-weight:600;width:130px;font-size:13px;color:#445566;">Name</td><td style="padding:10px 0;border-bottom:1px solid #e8edf4;font-size:14px;">${escHtml(name)}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #e8edf4;font-weight:600;font-size:13px;color:#445566;">Email</td><td style="padding:10px 0;border-bottom:1px solid #e8edf4;font-size:14px;"><a href="mailto:${escHtml(email)}" style="color:#009d84;">${escHtml(email)}</a></td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #e8edf4;font-weight:600;font-size:13px;color:#445566;">Budget</td><td style="padding:10px 0;border-bottom:1px solid #e8edf4;font-size:14px;">${escHtml(budget || '—')}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #e8edf4;font-weight:600;font-size:13px;color:#445566;">Timeline</td><td style="padding:10px 0;border-bottom:1px solid #e8edf4;font-size:14px;">${escHtml(timeline || '—')}</td></tr>
          ${references ? `<tr><td style="padding:10px 0;border-bottom:1px solid #e8edf4;font-weight:600;font-size:13px;color:#445566;">References</td><td style="padding:10px 0;border-bottom:1px solid #e8edf4;font-size:14px;">${escHtml(references)}</td></tr>` : ''}
        </table>
        <div style="margin-top:20px;">
          <p style="font-weight:600;font-size:13px;color:#445566;margin-bottom:8px;">Project Description</p>
          <div style="background:#ffffff;border:1px solid #dde6f0;border-radius:8px;padding:16px;font-size:14px;line-height:1.6;white-space:pre-wrap;">${escHtml(description)}</div>
        </div>
        <div style="margin-top:24px;">
          <a href="mailto:${escHtml(email)}?subject=Re: Your BoltAI Studio inquiry" style="display:inline-block;background:linear-gradient(135deg,#00e5c0,#00c9a7);color:#0a2540;font-weight:700;font-size:14px;padding:12px 24px;border-radius:9px;text-decoration:none;">Reply to ${escHtml(name)} →</a>
        </div>
      </div>
      <div style="padding:16px 32px;font-size:12px;color:#8899b0;text-align:center;">
        BoltAI Studio · boltai.dev/studio
      </div>
    </div>
  `;

  // Auto-reply HTML to the lead
  const autoReplyHtml = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1a2332;">
      <div style="background:linear-gradient(135deg,#0a2540,#0e3460);padding:28px 32px;border-radius:12px 12px 0 0;">
        <h2 style="color:#ffffff;margin:0;font-size:20px;">We got your request, ${escHtml(name.split(' ')[0])}!</h2>
        <p style="color:rgba(255,255,255,0.6);margin:6px 0 0;font-size:13px;">BoltAI Studio</p>
      </div>
      <div style="background:#ffffff;padding:28px 32px;border:1px solid #dde6f0;border-top:none;">
        <p style="font-size:15px;line-height:1.7;margin-bottom:16px;">Thanks for reaching out! We've received your project inquiry and will get back to you within <strong>24 hours</strong> to schedule a quick call.</p>
        <p style="font-size:15px;line-height:1.7;margin-bottom:24px;">On the call we'll discuss your requirements and send you a <strong>fixed-price proposal</strong> — no commitment until you're happy with it.</p>
        <div style="background:#f5f8fc;border:1px solid #dde6f0;border-radius:10px;padding:20px 24px;margin-bottom:24px;">
          <p style="font-size:13px;font-weight:700;color:#445566;margin-bottom:12px;text-transform:uppercase;letter-spacing:0.05em;">What you submitted</p>
          <p style="font-size:14px;color:#1a2332;line-height:1.6;white-space:pre-wrap;">${escHtml(description)}</p>
        </div>
        <p style="font-size:13px;color:#8899b0;line-height:1.6;">While you wait, you can explore BoltAI's UI generator at <a href="https://boltai.dev" style="color:#009d84;">boltai.dev</a> to start visualising your product.</p>
      </div>
      <div style="padding:16px 32px;font-size:12px;color:#8899b0;text-align:center;">
        BoltAI Studio · boltai.dev/studio · You're receiving this because you submitted a project inquiry.
      </div>
    </div>
  `;

  try {
    // Send notification to you
    await sendEmail({
      apiKey: RESEND_API_KEY,
      from: FROM_EMAIL,
      to: NOTIFY_EMAIL,
      subject: `New Studio Lead: ${name} — ${budget || 'budget not specified'}`,
      html: notifyHtml,
    });

    // Send auto-reply to the lead
    await sendEmail({
      apiKey: RESEND_API_KEY,
      from: FROM_EMAIL,
      to: email,
      subject: `We got your request — BoltAI Studio`,
      html: autoReplyHtml,
    });

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('Email send error:', err);
    return res.status(500).json({ message: 'Failed to send email. Please try again.' });
  }
}

// ── Helpers ──

async function sendEmail({ apiKey, from, to, subject, html }) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to, subject, html }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `Resend API error: ${response.status}`);
  }

  return response.json();
}

function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
