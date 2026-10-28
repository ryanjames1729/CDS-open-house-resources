# CLAUDE.md

Parent-facing Open House resources site for Carolina Day School. It's static HTML built by `scripts/build.mjs` (marked, js-yaml, qrcode) from `content/` into `dist/`, and deployed to GitHub Pages by `.github/workflows/pages.yml` on every push to `main`. The owner is Ryan James (Technology Office).

- Commands: `npm run build`, `npm run dev` (serves on :4173).
- Content: `content/site.yaml` plus `content/pages/NN-slug.{md,yaml}`. Every page takes title, summary, optional `eyebrow` (small label) and `seal` (image name in `public/brand/`, e.g. `seal-upper-school`). Page types are `markdown` and `directory` (top-level `categories` `{id, label}` for the topic buttons; groups → items with `categories`, hidden search `keywords`, faculty/alsoHere `{name, role}`, `students`, `studentLed`, `description`). To add a new page shape, add a renderer in `build.mjs`.
- Use relative URLs only, because the site is served from `/CDS-open-house-resources/`.
- The site is public. Never publish student names, internal staff notes, or unconfirmed school facts. Put unconfirmed facts in `# TODO-CDS:` comments and ask the owner.
- Design follows the 2021 Brand Guidelines and the look of carolinaday.org: the secondary logo on a white header, soft gray sections, centered navy Baskerville headings with an italic serif line (home headline: the marketing theme "Think one kid can change the world? We do." in `site.yaml`), square letter-spaced buttons, warm-gray labels, a taupe "Discover CDS" band and a light gray footer, plus a red ribbon (from the division seals) and faint navy/red rings. Text must meet 4.5:1 contrast. School wording, links and contact details in `content/site.yaml` come from carolinaday.org. Division seals come from the guidelines PDF; never recolor or alter them.
- Brand: navy `#003A70`, red `#C8102E`, accents from the 2021 guidelines; Libre Baskerville for headings and Libre Franklin for body text. Don't alter or recolor the seal.
- Check at 390px phone width: no horizontal scroll, and tap targets of 44px or more.
