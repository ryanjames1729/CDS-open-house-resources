# CDS Open House Resources

A phone-friendly website for Carolina Day School Open House. Parents scan a QR code and browse the resources instead of taking printed handouts. It's a static site (no server or database), hosted free on GitHub Pages.

**Live site:** https://ryanjames1729.github.io/CDS-open-house-resources/
**Printable QR sign:** https://ryanjames1729.github.io/CDS-open-house-resources/qr.html (print from the browser)

## Turning on GitHub Pages (one time)
1. In the repo, open **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.
3. Every push to `main` then rebuilds and publishes the site (see `.github/workflows/pages.yml`). It takes about a minute.

## Adding or editing content
All content lives in `content/`:

| File | What it is |
| --- | --- |
| `content/site.yaml` | Site title, welcome text, footer, and the public URL the QR code points to |
| `content/pages/NN-name.md` | A regular page written in Markdown |
| `content/pages/NN-name.yaml` | A structured page, such as a directory of tables (`type: directory`) |

Pages appear on the home screen in file-name order, so the number prefix (`01-`, `02-` …) sets the order. The file name without the number becomes the page address (`01-us-interest-tables.yaml` → `us-interest-tables.html`).

A Markdown page starts with a short header:

```markdown
---
title: Arrival & Parking
summary: Where to park and which door to use.
icon: map        # tables, map, calendar, people, info, book, link
---

## Parking
Regular Markdown goes here: headings, lists, links, tables and > callouts.
```

Images or PDFs go in `public/` (for example `public/files/map.pdf`) and are linked with a relative path (`files/map.pdf`).

## Previewing locally
```bash
npm install
npm run dev     # builds, then serves http://localhost:4173
```

## Branding
Colors and fonts follow the CDS Brand Guidelines (2021): navy `#003A70` (PMS 654), red `#C8102E` (PMS 186), the accent palette, Libre Baskerville for headings and Libre Franklin for body text. The seal and logo in `public/brand/` are used as-is. Don't recolor or alter them.

## Privacy
This site is public, so it lists faculty names and roles but leaves out **student names** (for example, student ambassadors) and internal staff notes.
