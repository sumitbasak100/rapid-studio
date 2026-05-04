# BoltAI Studio — Build For Me

Landing page with contact form, powered by [Resend](https://resend.com).

## Project Structure

```
├── public/
│   └── index.html       # The landing page
├── api/
│   └── contact.js       # Vercel serverless function → sends email via Resend
├── vercel.json          # Vercel config
└── .env.example         # Environment variable template
```

## Deploy to Vercel

### 1. Push to GitHub
Upload this repo to GitHub (public or private).

### 2. Import on Vercel
Go to [vercel.com/new](https://vercel.com/new), import your GitHub repo. Vercel auto-detects the config.

### 3. Add Environment Variable
In your Vercel project → **Settings → Environment Variables**, add:

| Name | Value |
|------|-------|
| `RESEND_API_KEY` | `re_your_key_here` |

Get your key from [resend.com/api-keys](https://resend.com/api-keys).

### 4. Update sender/recipient in `api/contact.js`
```js
from: 'BoltAI Studio <you@yourdomain.com>',  // must be verified in Resend
to:   ['you@yourdomain.com'],                 // where you receive inquiries
```

> **Note:** Until you verify a domain in Resend, you can use `onboarding@resend.dev` as the `from` address — but emails can only be sent **to the email address registered on your Resend account** in test mode.

## Local Development

```bash
npm i -g vercel
cp .env.example .env.local
# fill in RESEND_API_KEY in .env.local
vercel dev
```
