import { writeFileSync } from 'node:fs';
import { carousels } from './data/content.mjs';

// ─── Icon SVGs (lucide-style) ───
const icons = {
  book: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
  sparkles: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3L12 3z"/></svg>`,
  file: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/></svg>`,
  clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  trend: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>`,
  users: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  zap: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  edit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`,
  calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>`,
  shield: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>`,
  globe: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>`,
  cap: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5"/></svg>`,
  message: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  chart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  award: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><polyline points="15.477 12.89 17 22 12 19 7 22 8.523 12.89"/></svg>`,
  bell: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>`,
  building: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2"/><path d="M9 22v-4h6v4"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M8 10h.01"/><path d="M16 10h.01"/><path d="M8 14h.01"/><path d="M16 14h.01"/></svg>`,
  laptop: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="12" x="3" y="4" rx="2" ry="2"/><line x1="2" x2="22" y1="20" y2="20"/></svg>`,
  target: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
  link: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
  pie: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>`,
  lock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  arrow: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" x2="19" y1="12" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,
  play: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
  lightbulb: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17h8v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7z"/></svg>`,
};

function icon(name) { return icons[name] || icons.sparkles; }

// ─── Slide header ───
function header({ num, total, dark = false }) {
  const dots = Array.from({ length: total }, (_, i) =>
    `<span${i + 1 === num ? ' class="on"' : ''}></span>`
  ).join('');
  return `
  <div class="brand-row">
    <div class="logo-lockup">
      <img class="logo-mark" src="assets/logo-tight.png" alt="Zirva">
      <span class="logo-word">Zirva<span class="plus">+</span></span>
    </div>
    <div class="slide-index">
      <span>${String(num).padStart(2, '0')} / ${String(total).padStart(2, '0')}</span>
      <span class="slide-dots">${dots}</span>
    </div>
  </div>`;
}

function foot(l, r) {
  return `<div class="foot"><span>${l}</span><span>${r || 'Sürüşdürün →'}</span></div>`;
}

// ─── Slide templates ───
function slideShell({ theme = '', content, num, total, footerLeft = 'Zirva+', footerRight }) {
  const wmOpacity = theme.includes('dark') || theme.includes('gradient') ? '' : '';
  return `<!doctype html>
<html lang="az">
<head>
<meta charset="utf-8">
<title>slide</title>
<link rel="stylesheet" href="styles.css">
</head>
<body>
<div class="slide ${theme}">
  <img class="bg-mountain" src="assets/logo-tight.png" alt="">
  <div class="noise"></div>
  ${header({ num, total })}
  ${content}
  ${foot(footerLeft, footerRight)}
</div>
</body>
</html>`;
}

// COVER template — auto-size headline based on length
function tplCover({ num, total, theme, eyebrow, headline, subhead, preview, footerLeft, footerRight, size }) {
  const raw = headline.replace(/<[^>]+>/g, '').replace(/&[a-z]+;/gi, '');
  const longestWord = raw.split(/\s+/).reduce((a, b) => (a.length > b.length ? a : b), '');
  const auto = size || (longestWord.length >= 13 ? 'xl' : 'xxl');
  const previewHtml = preview ? `
    <div class="icons-preview" style="margin-top:36px;">
      ${preview.map((p, i) => `<div class="ico-chip${i === 0 ? ' solid' : ''}">${p}</div>`).join('')}
    </div>` : '';
  return slideShell({
    theme, num, total, footerLeft, footerRight,
    content: `
    <div class="body center">
      <div class="eyebrow">${eyebrow}</div>
      <h1 class="h-display ${auto}" style="margin-top:22px;">${headline}</h1>
      ${subhead ? `<p class="subhead" style="margin-top:28px;">${subhead}</p>` : ''}
      ${previewHtml}
    </div>`,
  });
}

// FEATURE GRID template (2x2 bento, with accent bars)
function tplFeatureGrid({ num, total, theme, eyebrow, headline, subhead, features, footerLeft, footerRight }) {
  const accentMap = {
    'teal': 'accent-teal',
    'gold': 'accent-gold',
    'coral': 'accent-coral',
    '': 'accent-purple',
    'purple-ico': 'accent-purple',
    'mint': 'accent-teal',
  };
  const featHtml = features.map((f) => {
    const iconCls = f.iconStyle || '';
    const accent = f.variant || accentMap[f.iconStyle] || 'accent-purple';
    return `
      <div class="feat ${accent}">
        <div class="feat-icon ${iconCls}">${icon(f.icon)}</div>
        <div class="feat-title">${f.title}</div>
        <div class="feat-desc">${f.desc}</div>
      </div>`;
  }).join('');
  const cols = features.length > 4 ? 'three' : '';
  return slideShell({
    theme, num, total, footerLeft, footerRight,
    content: `
    <div class="body top">
      <div class="eyebrow">${eyebrow}</div>
      <h1 class="h-display md" style="margin-top:16px;">${headline}</h1>
      ${subhead ? `<p class="subhead" style="margin-top:18px;font-size:21px;">${subhead}</p>` : ''}
      <div class="feat-grid ${cols}" style="margin-top:28px;">${featHtml}</div>
    </div>`,
  });
}

// LIST template
function tplList({ num, total, theme, eyebrow, headline, subhead, items, footerLeft, footerRight }) {
  const listHtml = items.map(it => `
    <div class="row">
      <div class="ico ${it.iconStyle || ''}">${icon(it.icon)}</div>
      <div class="col" style="flex:1;">
        <div class="txt">${it.title}</div>
        ${it.hint ? `<span class="hint">${it.hint}</span>` : ''}
      </div>
    </div>`).join('');
  return slideShell({
    theme, num, total, footerLeft, footerRight,
    content: `
    <div class="body top">
      <div class="eyebrow">${eyebrow}</div>
      <h1 class="h-display md" style="margin-top:18px;">${headline}</h1>
      ${subhead ? `<p class="subhead mt-24" style="font-size:22px;">${subhead}</p>` : ''}
      <div class="clean-list mt-40">${listHtml}</div>
    </div>`,
  });
}

// MOCKUP template (chat or dashboard)
function tplMockup({ num, total, theme, eyebrow, headline, subhead, mockup, footerLeft, footerRight }) {
  return slideShell({
    theme, num, total, footerLeft, footerRight,
    content: `
    <div class="body top">
      <div class="eyebrow">${eyebrow}</div>
      <h1 class="h-display md" style="margin-top:18px;">${headline}</h1>
      ${subhead ? `<p class="subhead mt-24" style="font-size:22px;">${subhead}</p>` : ''}
      <div class="mt-40">${mockup}</div>
    </div>`,
  });
}

// STATS template
function tplStats({ num, total, theme, eyebrow, headline, stats, footerLeft, footerRight, cta }) {
  const statsHtml = stats.map(s => `
    <div class="stat-card">
      <div class="stat-label">${s.label}</div>
      <div class="stat-value ${s.color || ''}">${s.value}</div>
      ${s.note ? `<div class="stat-note">${s.note}</div>` : ''}
    </div>`).join('');
  const ctaHtml = cta ? `
    <div class="mt-40">
      <a class="cta ${cta.style || 'gold'}">${cta.label} <span class="cta-arrow">${icon('arrow')}</span></a>
    </div>` : '';
  const gridCls = stats.length >= 3 ? 'stats-grid three' : 'stats-grid';
  return slideShell({
    theme, num, total, footerLeft, footerRight,
    content: `
    <div class="body top">
      <div class="eyebrow">${eyebrow}</div>
      <h1 class="h-display lg" style="margin-top:18px;">${headline}</h1>
      <div class="${gridCls} mt-40">${statsHtml}</div>
      ${ctaHtml}
    </div>`,
  });
}

// CTA template
function tplCTA({ num, total, theme, eyebrow, headline, subhead, cta, footerLeft, footerRight }) {
  const raw = headline.replace(/<[^>]+>/g, '');
  const longestWord = raw.split(/\s+/).reduce((a, b) => (a.length > b.length ? a : b), '');
  const sizeCls = longestWord.length >= 13 ? 'lg' : 'xl';
  return slideShell({
    theme, num, total, footerLeft, footerRight,
    content: `
    <div class="body center">
      <div class="eyebrow">${eyebrow}</div>
      <h1 class="h-display ${sizeCls}" style="margin-top:22px;">${headline}</h1>
      ${subhead ? `<p class="subhead" style="margin-top:28px;">${subhead}</p>` : ''}
      <div style="margin-top:36px;">
        <a class="cta ${cta.style || 'gold'}">${cta.label} <span class="cta-arrow">${icon('arrow')}</span></a>
      </div>
    </div>`,
  });
}

// Mockup helpers
export const mockups = {
  chat(messages) {
    const bubbles = messages.map(m => {
      if (m.role === 'user') return `<div class="bubble user">${m.text}</div>`;
      return `<div class="bubble zeka"><span class="mark">✦ Zəka</span>${m.text}</div>`;
    }).join('');
    return `
    <div class="mockup" style="max-width:820px;">
      <div class="mockup-header">
        <span>Zəka AI</span>
        <span class="mockup-header-dots"><span></span><span></span><span></span></span>
      </div>
      ${bubbles}
    </div>`;
  },

  rows(title, rows) {
    const rowsHtml = rows.map(r => `
      <div class="mini-row">
        <div class="mini-ico ${r.iconStyle || ''}">${r.letter || ''}</div>
        <div class="grow">${r.name}</div>
        <div class="tag-sm">${r.tag}</div>
      </div>`).join('');
    return `
    <div class="mockup" style="max-width:820px;">
      <div class="mockup-header">
        <span>${title}</span>
        <span class="mockup-header-dots"><span></span><span></span><span></span></span>
      </div>
      <div class="col gap-8">${rowsHtml}</div>
    </div>`;
  },

  progress(title, items) {
    const list = items.map(it => `
      <div class="col gap-8">
        <div class="row" style="justify-content:space-between;font-size:15px;font-weight:600;">
          <span>${it.name}</span>
          <span style="color:var(--muted);">${it.value}</span>
        </div>
        <div class="bar"><div class="fill ${it.color || ''}" style="width:${it.pct};"></div></div>
      </div>`).join('');
    return `
    <div class="mockup" style="max-width:820px;">
      <div class="mockup-header">
        <span>${title}</span>
        <span class="mockup-header-dots"><span></span><span></span><span></span></span>
      </div>
      <div class="col gap-16">${list}</div>
    </div>`;
  },
};

// ─── Main generation ───
const tpl = { cover: tplCover, features: tplFeatureGrid, list: tplList, mockup: tplMockup, stats: tplStats, cta: tplCTA };

let count = 0;
for (const [carouselIdx, car] of carousels.entries()) {
  for (const [slideIdx, slide] of car.slides.entries()) {
    const fn = tpl[slide.type];
    if (!fn) throw new Error(`Unknown type: ${slide.type}`);
    const html = fn({
      ...slide,
      num: slideIdx + 1,
      total: car.slides.length,
      footerLeft: slide.footerLeft || car.footer || car.title,
    });
    const fname = `c${String(carouselIdx + 1).padStart(2, '0')}-s${slideIdx + 1}.html`;
    writeFileSync(fname, html);
    count++;
  }
}
console.log(`generated ${count} slides across ${carousels.length} carousels`);
