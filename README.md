# BoltAI Studio — Vercel Deployment

## File structure

```
boltai-studio/
├── public/
│   ├── index.html       ← the studio page
│   ├── studio.css       ← all styles
│   └── studio.js        ← frontend JS (scroll, nav, form)
├── api/
│   └── submit.js        ← serverless function (form → email)
├── vercel.json          ← Vercel routing config
├── HERO_BANNER_SNIPPET.html  ← paste this into your main site
└── README.md
```

---

## Deploy to Vercel in 3 steps

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
gh repo create boltai-studio --public --push
```

### 2. Import in Vercel
- Go to https://vercel.com/new
- Import your GitHub repo
- Vercel auto-detects the config

### 3. Add environment variables
In Vercel → Project → Settings → Environment Variables, add:

| Variable | Value | Notes |
|----------|-------|-------|
| `RESEND_API_KEY` | `re_xxxxxxxxxxxxxx` | Get from resend.com/api-keys |
| `NOTIFY_EMAIL` | `you@yourdomain.com` | Where lead emails go |
| `FROM_EMAIL` | `studio@boltai.dev` | Must be verified in Resend |
| `ALLOWED_ORIGIN` | `https://boltai.dev` | Your main domain (CORS) |

Then **Redeploy** once after adding env vars.

---

## Setting up Resend (free, takes 5 min)

1. Sign up at https://resend.com — free tier is 100 emails/day, 3,000/month
2. Add and verify your domain (boltai.dev) under Domains
3. Copy your API key from API Keys section
4. Paste it as `RESEND_API_KEY` in Vercel

---

## Hosting on a subdirectory of boltai.dev

If you want it at `boltai.dev/studio` instead of a separate domain:

**Option A — Vercel rewrite in your main project:**
Add to your main `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/studio/:path*", "destination": "https://your-studio.vercel.app/:path*" }
  ]
}
```

**Option B — Just use the standalone URL:**
Deploy as `studio.boltai.dev` — add a CNAME in your DNS pointing to `cname.vercel-dns.com`.

---

## Adding the hero banner to boltai.dev

Open `HERO_BANNER_SNIPPET.html` and paste the entire block
(the `<style>` tag + the `<div class="studio-banner">` element)
directly after your "Try these examples" chips in your homepage.

Change the `href="/studio"` to wherever you host this page.

---

## Customising

- **Pricing** — edit the three `.pc` cards in `public/index.html`
- **Services** — edit the `.bg-card` items in the "What we build" section
- **Brand colours** — all defined as CSS variables at the top of `studio.css`
- **Email template** — edit the HTML strings in `api/submit.js`
