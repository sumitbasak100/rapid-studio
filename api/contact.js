export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, description, budget, timeline, links } = req.body;

  if (!name || !email || !description) {
    return res.status(400).json({ error: 'Name, email, and description are required.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY is not set');
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  function esc(str) {
    return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#0d1b2a">
      <div style="background:linear-gradient(135deg,#071e35,#0d2d52);padding:28px 32px;border-radius:12px 12px 0 0">
        <h2 style="color:#00e5c0;margin:0;font-size:22px;font-weight:800">New Project Inquiry</h2>
        <p style="color:rgba(255,255,255,.55);margin:6px 0 0;font-size:13px">BoltAI Studio — build-for-me form</p>
      </div>
      <div style="background:#fff;padding:28px 32px;border:1px solid #dae3ee;border-top:none;border-radius:0 0 12px 12px">
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:10px 0;border-bottom:1px solid #f0f4f8;font-size:13px;color:#7a8fa6;width:120px">Name</td><td style="padding:10px 0;border-bottom:1px solid #f0f4f8;font-size:14px;font-weight:600">${esc(name)}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #f0f4f8;font-size:13px;color:#7a8fa6">Email</td><td style="padding:10px 0;border-bottom:1px solid #f0f4f8;font-size:14px"><a href="mailto:${esc(email)}" style="color:#009d84">${esc(email)}</a></td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #f0f4f8;font-size:13px;color:#7a8fa6">Budget</td><td style="padding:10px 0;border-bottom:1px solid #f0f4f8;font-size:14px">${esc(budget || 'Not specified')}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #f0f4f8;font-size:13px;color:#7a8fa6">Timeline</td><td style="padding:10px 0;border-bottom:1px solid #f0f4f8;font-size:14px">${esc(timeline || 'Not specified')}</td></tr>
          ${links ? `<tr><td style="padding:10px 0;border-bottom:1px solid #f0f4f8;font-size:13px;color:#7a8fa6">Links</td><td style="padding:10px 0;border-bottom:1px solid #f0f4f8;font-size:14px">${esc(links)}</td></tr>` : ''}
        </table>
        <div style="margin-top:20px;background:#f4f7fb;border-radius:8px;padding:16px 20px">
          <p style="font-size:12px;color:#7a8fa6;margin:0 0 8px;text-transform:uppercase;letter-spacing:.06em;font-weight:700">Project Description</p>
          <p style="font-size:14px;line-height:1.7;margin:0;white-space:pre-wrap">${esc(description)}</p>
        </div>
        <div style="margin-top:24px;text-align:center">
          <a href="mailto:${esc(email)}" style="display:inline-block;background:linear-gradient(135deg,#00e5c0,#00c9a7);color:#071e35;font-weight:700;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px">Reply to ${esc(name)} &rarr;</a>
        </div>
      </div>
    </div>`;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: 'BoltAI Studio <onboarding@resend.dev>',
        to: ['hello@boltai.dev'],
        reply_to: email,
        subject: `New project inquiry from ${name}`,
        html,
      }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      console.error('Resend error:', data);
      return res.status(502).json({ error: data.message || 'Failed to send email.' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Unexpected error:', err);
    return res.status(500).json({ error: 'Unexpected server error.' });
  }
}
