# NimbusPost · Internal Tools (JD Builder)

A small internal dashboard where any NimbusPost manager can sign in with their
company email, fill a simple form, and download a job description in the exact
NimbusPost careers format — as a print-ready **PDF** or an editable **Word** file.

Built to grow: the dashboard is a grid of tools, so new modules (offer letters,
policies, and so on) slot in without touching the JD code.

---

## Run it locally

```bash
npm install
npm run dev          # http://localhost:3000
```

```bash
npm run build && npm start   # production build
```

Node 20 or newer.

---

## Deploy

### Vercel (recommended)

1. Push this folder to a GitHub repo.
2. On [vercel.com](https://vercel.com) → **Add New → Project** → import the repo.
3. The framework is detected as **Next.js**. Leave every setting at its default
   and hit **Deploy**.
4. Add your domain under **Settings → Domains** (e.g. `tools.nimbuspost.com`).

No environment variables are needed.

### Netlify

1. Push to GitHub, then **Add new site → Import an existing project**.
2. Build command `npm run build`, publish directory `.next`.
3. Netlify's Next.js runtime is picked up automatically from `netlify.toml`.

---

## How sign-in works

There is no password and no server. A person enters their name (optional), their
`@nimbuspost.com` email and their employee ID; the app checks the email domain
and stores the session in that browser's local storage.

This keeps the deployment free and zero-maintenance, and is appropriate for an
internal tool behind a company URL. It is **not** a security boundary — anyone
who knows the URL and a company email format can get in.

When you want real access control later, the natural next steps are:

- put the site behind Vercel Authentication (Settings → Deployment Protection), or
- swap `src/lib/auth.tsx` for Google sign-in restricted to the NimbusPost workspace.

Both are drop-in replacements: every page reads the session through `useAuth()`.

---

## Where things live

```
src/
  app/
    page.tsx              Login screen
    dashboard/            Tool grid
    create-jd/            The JD builder (form + live preview + downloads)
  components/
    AppShell.tsx          Top bar, tabs, sign-out  <- add new tabs here
    BrandLogo.tsx         The NimbusPost mark
    jd/
      JDForm.tsx          Every editable field
      JDPreview.tsx       True-size A4 preview + page breaking
      blocks.tsx          The document, as a list of atomic blocks
  lib/
    brand.ts              Colours, type sizes, page geometry  <- single source of truth
    auth.tsx              Session handling
    jd/
      defaults.ts         The default (SDR) content
      pdfDocument.tsx     PDF export - pixel-matched to the Figma template
      docxBuilder.ts      Word export
public/fonts/             Inter (400/500/600/700), used by the app and the PDF
```

### Design tokens

Everything visual comes from `src/lib/brand.ts`, lifted 1:1 from the Figma file:

| Token | Value | Used for |
| --- | --- | --- |
| `brand` | `#1d4ed8` | header band, labels, links |
| `accent` | `#3b82f6` | 42×3 underline bar, bullets |
| `navy` | `#0f2a63` | section headings, snapshot values |
| `body` | `#22303f` | body copy |
| `muted` | `#64748b` | footer, EEO note |
| `cardBg` | `#eaf1fc` | Role Snapshot cards |
| `softBg` | `#f5f9fe` | Why Join / How to Apply cards |
| `border` | `#d7e3f7` | hairlines |

The page is laid out in the same 96 dpi coordinate space as the Figma file
(794 × 1123, 58 px margins, 678 px content width). The PDF converts those to
points with a single `× 0.75`, so the export lands exactly on A4.

---

## Swapping the logo

The official NimbusPost lockup ships in two tones:

- `public/nimbuspost-logo-white.png` — used on the blue masthead and the login panel
- `public/nimbuspost-logo-blue.png` — used on white backgrounds (top bar, page 2 running header)

Replace those two files (keep the filenames) and the logo updates everywhere —
app chrome, live preview, PDF and Word. If your new artwork has a different
width-to-height ratio, update `LOGO_ASPECT` in `src/lib/brand.ts`.

---

## Adding another tool later

1. Create `src/app/<your-tool>/page.tsx` and wrap it in `<AppShell>`.
2. Add it to `NAV` in `src/components/AppShell.tsx` (this renders the top tab).
3. Add a card to `TOOLS` in `src/app/dashboard/page.tsx`.

---

## Notes on the two export formats

- **PDF** is the authoritative one. It is generated as real vector text (not a
  screenshot), so it stays sharp at any zoom, is searchable, and matches the
  Figma template position for position — including the running header on page 2+
  and the page numbers in the footer.
- **Word** carries the same content and branding for people who need to edit it.
  Word's text engine paginates slightly differently from the PDF, so line breaks
  can land in a different place. It uses Inter if the font is installed on the
  machine, otherwise Word substitutes the closest available font.

Drafts auto-save to the browser, so a half-finished JD survives a reload.
