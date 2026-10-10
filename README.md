# Daybook

Write a few sentences about your day and get a unique piece of generated art, plus a streak calendar and monthly mosaic posters.

- Next.js (App Router, TypeScript), no backend, no accounts
- Entries are stored in `localStorage` under `daybook:entries`; art is regenerated from (date, text)
- Design source and build spec: `design/`

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
```

Deploy by importing the repo on Vercel; no configuration needed.
