// Builds the static site into dist/ from content/. No framework: one HTML file per page.
//   content/site.yaml          site title, URL, welcome text
//   content/pages/NN-slug.md   Markdown page with YAML front matter (title, summary, icon)
//   content/pages/NN-slug.yaml structured page (type: directory)
// Pages are listed on the home screen in file-name order.
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { marked } from 'marked';
import QRCode from 'qrcode';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const out = path.join(root, 'dist');
const site = yaml.load(fs.readFileSync(path.join(root, 'content/site.yaml'), 'utf8'));

const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const slugify = (s) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const ICONS = {
  tables: '<path d="M3 5h18M3 12h18M3 19h18M8 5v14"/>',
  map: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  people: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6.5 6.5 0 0 1 3.5 6"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
  book: '<path d="M4 4h6a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4zM20 4h-6a3 3 0 0 0-3 3"/><path d="M20 4v14h-7"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
};
const icon = (name, cls = 'icon') =>
  `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ICONS.info}</svg>`;

const RINGS = `<svg class="rings" viewBox="0 0 400 400" aria-hidden="true"><circle cx="200" cy="200" r="190" fill="none" stroke="#C8102E" stroke-width="10"/><circle cx="200" cy="200" r="168" fill="none" stroke="#003A70" stroke-width="3"/><circle cx="200" cy="200" r="120" fill="none" stroke="#003A70" stroke-width="1.5" stroke-dasharray="2 10"/></svg>`;
const ribbon = (text) => `<span class="ribbon"><span>${esc(text)}</span></span>`;

// ---------- Load pages ----------
const pagesDir = path.join(root, 'content/pages');
const pages = fs.readdirSync(pagesDir).filter((f) => /\.(md|ya?ml)$/.test(f)).sort().map((file) => {
  const raw = fs.readFileSync(path.join(pagesDir, file), 'utf8');
  const slug = file.replace(/^\d+-/, '').replace(/\.(md|ya?ml)$/, '');
  let data, body = '';
  if (file.endsWith('.md')) {
    const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
    if (!m) throw new Error(`${file}: missing front matter`);
    data = yaml.load(m[1]);
    body = m[2];
    data.type ??= 'markdown';
  } else {
    data = yaml.load(raw);
  }
  if (!data.title) throw new Error(`${file}: missing title`);
  return { ...data, slug, file, body };
});

// ---------- Layout ----------
function layout({ title, body, home = false }) {
  const pageTitle = home ? `${site.title} · ${site.schoolName}` : `${title} · ${site.schoolName}`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#003A70">
<meta name="description" content="${esc(site.tagline)}">
<title>${esc(pageTitle)}</title>
<link rel="icon" type="image/png" href="brand/cds-seal-64.png">
<link rel="apple-touch-icon" href="brand/cds-seal-180.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=Libre+Franklin:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="styles.css">
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="topbar">
  <div class="wrap">
    <a class="brand" href="./" aria-label="${esc(site.schoolName)}, ${esc(site.title)} home">
      <img src="brand/cds-logo-horizontal.png" alt="${esc(site.schoolName)}" width="144" height="44">
    </a>
    <span class="topbar-label">${esc(site.shortTitle || 'Open House')}</span>
  </div>
</header>
<main id="main">
${body}
</main>
<footer class="footer">
  <div class="wrap">
    <img class="footer-logo" src="brand/cds-logo-horizontal.png" alt="${esc(site.schoolName)}" width="180" height="55">
    ${site.contact ? `<address>${(site.contact.address || []).map(esc).join('<br>')}${site.contact.phone ? `<br>Phone: <a href="tel:${esc(site.contact.phone.replace(/[^0-9]/g, ''))}">${esc(site.contact.phone)}</a>` : ''}</address>
    ${site.contact.about ? `<p class="footer-about">${esc(site.contact.about)}</p>` : ''}
    ${site.contact.social?.length ? `<p class="footer-social">${site.contact.social.map((l) => `<a href="${esc(l.url)}">${esc(l.label)}</a>`).join('<span aria-hidden="true">/</span>')}</p>` : ''}` : ''}
  </div>
</footer>
<script src="app.js" defer></script>
</body>
</html>
`;
}

function pagerNav(i) {
  const prev = pages[i - 1], next = pages[i + 1];
  return `<nav class="pager wrap" aria-label="More resources">
  <a class="pager-home" href="./">← All resources</a>
  ${next ? `<a class="pager-next" href="${next.slug}.html"><small>Next</small>${esc(next.title)} →</a>` : prev ? `<a class="pager-next" href="${prev.slug}.html"><small>Previous</small>← ${esc(prev.title)}</a>` : ''}
</nav>`;
}

// ---------- Page types ----------
const person = (p) => `<li><span class="pname">${esc(p.name)}</span>${p.role ? `<span class="prole">${esc(p.role)}</span>` : ''}</li>`;

function renderDirectory(page) {
  const groups = page.groups || [];
  const jump = `<nav class="chips" aria-label="Jump to a location">${groups
    .map((g) => `<a class="chip" href="#${slugify(g.name)}">${icon('map', 'chip-icon')}${esc(g.name)}<span class="count">${g.items.length}</span></a>`)
    .join('')}</nav>`;
  const cats = page.categories || [];
  const catLabel = Object.fromEntries(cats.map((c) => [c.id, c.label]));
  const topics = cats.length
    ? `<div class="topics" role="group" aria-label="Filter by topic">
  <button type="button" class="topic" data-topic="" aria-pressed="true">All</button>
  ${cats.map((c) => `<button type="button" class="topic" data-topic="${esc(c.id)}" aria-pressed="false">${esc(c.label)}</button>`).join('\n  ')}
</div>`
    : '';
  const search = `<div class="search">
  <label for="q" class="sr-only">Search tables</label>
  <input id="q" type="search" placeholder="Search a subject, activity or name" autocomplete="off" data-filter>
  ${topics}
  <p class="empty" hidden>No tables match. Try another word, or ask any faculty member: they'll point you the right way.</p>
</div>`;
  const sections = groups.map((g) => `<section class="group" id="${slugify(g.name)}" data-group>
  <h2 class="group-title"><span class="label">Tables in the</span><span class="venue">${esc(g.name)}</span><span class="tally">${g.items.length} tables</span></h2>
  <ul class="tables">
  ${g.items.map((it) => {
    const tags = [
      it.studentLed ? '<span class="tag tag-red">Student-led</span>' : '',
      it.students && !it.studentLed ? '<span class="tag">Student ambassadors here</span>' : '',
    ].join('');
    const itemCats = it.categories || [];
    for (const c of itemCats) if (!catLabel[c]) throw new Error(`${page.file}: ${it.name} has unknown category "${c}"`);
    const text = [it.name, it.description, it.keywords, ...itemCats.map((c) => catLabel[c]), g.name, ...(it.faculty || []).flatMap((p) => [p.name, p.role]), ...(it.alsoHere || []).map((p) => p.name)].filter(Boolean).join(' ');
    return `<li class="table-card" data-search="${esc(text.toLowerCase())}" data-topics="${esc(itemCats.join(' '))}">
    <h3>${esc(it.name)}</h3>
    ${it.description ? `<p class="desc">${esc(it.description)}</p>` : ''}
    ${tags ? `<p class="tags">${tags}</p>` : ''}
    ${it.faculty?.length ? `<ul class="people">${it.faculty.map(person).join('')}</ul>` : ''}
    ${it.alsoHere?.length ? `<p class="also"><span>Also joining:</span> ${it.alsoHere.map((p) => esc(p.name)).join(', ')}</p>` : ''}
  </li>`;
  }).join('\n  ')}
  </ul>
</section>`).join('\n');
  return `<div class="wrap">${page.intro ? `<div class="lead">${marked.parse(page.intro)}</div>` : ''}${jump}${search}${sections}</div>`;
}

const renderers = {
  markdown: (page) => `<div class="wrap"><article class="prose">${marked.parse(page.body)}</article></div>`,
  directory: renderDirectory,
};

// ---------- Write ----------
fs.rmSync(out, { recursive: true, force: true });
fs.cpSync(path.join(root, 'public'), out, { recursive: true });
fs.copyFileSync(path.join(root, 'src/styles.css'), path.join(out, 'styles.css'));
fs.copyFileSync(path.join(root, 'src/app.js'), path.join(out, 'app.js'));

pages.forEach((page, i) => {
  const render = renderers[page.type];
  if (!render) throw new Error(`${page.file}: unknown type "${page.type}"`);
  const body = `<div class="masthead${page.seal ? ' has-seal' : ''}">
  ${RINGS}
  <div class="wrap">
    <a class="back" href="./">← All resources</a>
    <div class="masthead-body">
      ${page.seal ? `<img class="division-seal" src="brand/${esc(page.seal)}.png" alt="${esc(page.eyebrow || '')}" width="120" height="104">` : ''}
      <div class="masthead-text">
        ${page.eyebrow ? `<p class="eyebrow">${esc(page.eyebrow)}</p>` : ''}
        <h1>${esc(page.title)}</h1>
        ${page.summary ? `<p class="summary">${esc(page.summary)}</p>` : ''}
      </div>
    </div>
  </div>
</div>
${render(page)}
${pagerNav(i)}`;
  fs.writeFileSync(path.join(out, `${page.slug}.html`), layout({ title: page.title, body }));
});

const discover = site.discover
  ? `<section class="discover">
  <div class="wrap">
    <h2>${esc(site.discover.title)}</h2>
    ${site.discover.text ? `<p>${esc(site.discover.text)}</p>` : ''}
    <p class="buttons">${(site.discover.links || []).map((l) => `<a class="btn" href="${esc(l.url)}">${esc(l.label)}</a>`).join('')}</p>
  </div>
</section>`
  : '';
const home = `<section class="hero">
  ${RINGS}
  <div class="wrap">
    ${ribbon(site.ribbon || site.title)}
    <h1>${esc(site.headline || site.title)}${site.headlineAnswer ? `<span class="hero-answer">${esc(site.headlineAnswer)}</span>` : ''}</h1>
    <div class="hero-lead">${marked.parse(site.welcome || '')}</div>
  </div>
</section>
<section class="wrap resources">
  <h2 class="section-label">Resources</h2>
  <ol class="cards">
${pages.map((p, n) => `    <li><a class="card" href="${p.slug}.html"><span class="num">${String(n + 1).padStart(2, '0')}</span><span class="card-text">${p.eyebrow ? `<em>${esc(p.eyebrow)}</em>` : ''}<strong>${esc(p.title)}</strong>${p.summary ? `<small>${esc(p.summary)}</small>` : ''}</span><span class="chev" aria-hidden="true">${icon('arrow', 'chev-icon')}</span></a></li>`).join('\n')}
  </ol>
</section>
${discover}`;
fs.writeFileSync(path.join(out, 'index.html'), layout({ title: site.title, body: home, home: true }));

// Printable QR sign that points at the site (not linked from the site; open /qr.html to print).
const qrSvg = await QRCode.toString(site.url, { type: 'svg', margin: 1, errorCorrectionLevel: 'M', color: { dark: '#003A70', light: '#FFFFFF' } });
fs.writeFileSync(path.join(out, 'qr.svg'), qrSvg);
fs.writeFileSync(path.join(out, 'qr.html'), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>QR sign · ${esc(site.title)}</title><meta name="robots" content="noindex">
<link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=Libre+Franklin:wght@400;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="styles.css"></head>
<body class="qr-page"><div class="qr-sign">
<img class="qr-logo" src="brand/cds-logo-horizontal.png" alt="${esc(site.schoolName)}">
<h1>${esc(site.title)}</h1>
<p class="qr-cta">Scan with your phone's camera</p>
<div class="qr-code">${qrSvg}</div>
<p class="qr-url">${esc(site.url.replace(/^https?:\/\//, '').replace(/\/$/, ''))}</p>
</div></body></html>`);

fs.writeFileSync(path.join(out, '.nojekyll'), '');
console.log(`Built ${pages.length} page(s) + home + QR sign into dist/`);
