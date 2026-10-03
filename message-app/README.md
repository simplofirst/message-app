# Message-App

Next.js + Upstash Blob screen-capture project.

## Required environment variable

Set this in Vercel:

`UPSTASH_BLOB_TOKEN`

Never commit `.env.local` or the token to GitHub.

## Local development

```bash
npm install
npm run dev
```

The upload handler is mounted at `/api/upload` through the Next.js App Router.
