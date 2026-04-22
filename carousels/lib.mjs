// Mockup helpers — full-width, detailed UI

const WRAP = 'width:100%;';

export const chat = (messages) => {
  const bubbles = messages.map(m => {
    if (m.role === 'user') return `<div class="bubble user">${m.text}</div>`;
    return `<div class="bubble zeka"><span class="mark">✦ Zəka</span>${m.text}</div>`;
  }).join('');
  return `
  <div class="mockup" style="${WRAP}">
    <div class="mockup-header">
      <span>✦ Zəka AI — Köməkçi</span>
      <span class="mockup-header-dots"><span></span><span></span><span></span></span>
    </div>
    <div class="col" style="gap:12px;padding:6px 4px;">${bubbles}</div>
    <div style="display:flex;align-items:center;gap:12px;padding:14px 18px;margin-top:8px;background:var(--bg-cream);border-radius:14px;font-size:17px;color:var(--muted);">
      <span style="color:var(--purple);font-size:20px;">✦</span>
      Cavab yazın...
      <span style="margin-left:auto;padding:6px 12px;background:var(--purple);color:#fff;border-radius:999px;font-size:13px;font-weight:700;letter-spacing:0.06em;">GÖNDƏR</span>
    </div>
  </div>`;
};

export const rows = (title, list) => {
  const rowsHtml = list.map(r => `
    <div class="mini-row">
      <div class="mini-ico ${r.iconStyle || ''}">${r.letter || ''}</div>
      <div class="grow">${r.name}</div>
      <div class="tag-sm">${r.tag}</div>
    </div>`).join('');
  return `
  <div class="mockup" style="${WRAP}">
    <div class="mockup-header"><span>${title}</span><span class="mockup-header-dots"><span></span><span></span><span></span></span></div>
    <div class="col gap-8" style="margin-top:10px;">${rowsHtml}</div>
  </div>`;
};

export const progress = (title, items) => {
  const list = items.map(it => `
    <div class="col" style="gap:10px;">
      <div class="row" style="justify-content:space-between;font-size:19px;font-weight:600;color:var(--ink);">
        <span>${it.name}</span>
        <span style="color:${it.color === 'teal' ? 'var(--teal)' : it.color === 'gold' ? 'var(--gold-2)' : 'var(--purple)'};font-family:'DM Serif Display',serif;font-size:30px;line-height:1;">${it.value}</span>
      </div>
      <div class="bar"><div class="fill ${it.color || ''}" style="width:${it.pct};"></div></div>
    </div>`).join('');
  return `
  <div class="mockup" style="${WRAP}">
    <div class="mockup-header"><span>${title}</span><span class="mockup-header-dots"><span></span><span></span><span></span></span></div>
    <div class="col" style="gap:24px;margin-top:16px;padding:6px 4px;">${list}</div>
  </div>`;
};

export const report = () => `
<div class="mockup" style="${WRAP}">
  <div class="mockup-header">
    <span>Həftəlik Hesabat — Sinif 10-A</span>
    <span class="mockup-header-dots"><span></span><span></span><span></span></span>
  </div>
  <div class="col" style="gap:10px;margin-top:10px;">
    <div class="mini-row"><div class="mini-ico">R</div><div class="grow">Riyaziyyat — 28 şagird</div><div class="tag-sm">Hazır</div></div>
    <div class="mini-row"><div class="mini-ico teal">İ</div><div class="grow">İngilis dili — 27 şagird</div><div class="tag-sm">Hazır</div></div>
    <div class="mini-row"><div class="mini-ico gold">F</div><div class="grow">Fizika — 28 şagird</div><div class="tag-sm">Hazır</div></div>
    <div class="mini-row" style="background:linear-gradient(135deg, var(--purple) 0%, var(--purple-deep) 100%);color:#fff;border:none;">
      <div class="mini-ico" style="background:rgba(255,255,255,0.2);">✦</div>
      <div class="grow" style="color:#fff;">Zəka — yeni hesabat yarat</div>
      <div class="tag-sm" style="background:#fff;color:var(--purple);">20 dəq</div>
    </div>
  </div>
</div>`;

export const calendar = () => `
<div class="mockup" style="${WRAP}">
  <div class="mockup-header"><span>Bu Günün Cədvəli</span><span class="mockup-header-dots"><span></span><span></span><span></span></span></div>
  <div class="col" style="gap:10px;margin-top:10px;">
    <div class="mini-row"><div class="mini-ico" style="font-family:'DM Serif Display',serif;">R</div><div class="grow">Riyaziyyat — 9:00</div><div class="tag-sm">10-A</div></div>
    <div class="mini-row"><div class="mini-ico teal" style="font-family:'DM Serif Display',serif;">F</div><div class="grow">Fizika — 10:30</div><div class="tag-sm">10-B</div></div>
    <div class="mini-row"><div class="mini-ico gold" style="font-family:'DM Serif Display',serif;">İ</div><div class="grow">İngilis dili — 13:00</div><div class="tag-sm">11-A</div></div>
  </div>
</div>`;

export const grading = () => `
<div class="mockup" style="${WRAP}">
  <div class="mockup-header">
    <span>Qiymətləndirmə — 10-A Riyaziyyat</span>
    <span class="mockup-header-dots"><span></span><span></span><span></span></span>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;margin-top:16px;">
    <div style="padding:22px 22px 24px;background:var(--purple-soft);border-radius:16px;">
      <div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:var(--purple);font-weight:800;">A kriteriyası</div>
      <div style="font-family:'DM Serif Display',serif;font-size:64px;color:var(--purple);line-height:1;margin-top:10px;letter-spacing:-0.03em;">7/8</div>
      <div style="font-size:13px;color:var(--muted);margin-top:6px;">Bilik və anlayış</div>
    </div>
    <div style="padding:22px 22px 24px;background:var(--teal-soft);border-radius:16px;">
      <div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:var(--teal);font-weight:800;">B kriteriyası</div>
      <div style="font-family:'DM Serif Display',serif;font-size:64px;color:var(--teal);line-height:1;margin-top:10px;letter-spacing:-0.03em;">6/8</div>
      <div style="font-size:13px;color:var(--muted);margin-top:6px;">Tədqiqat prosesi</div>
    </div>
    <div style="padding:22px 22px 24px;background:var(--gold-soft);border-radius:16px;">
      <div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:var(--gold-2);font-weight:800;">Milli (10 bal)</div>
      <div style="font-family:'DM Serif Display',serif;font-size:64px;color:var(--gold-2);line-height:1;margin-top:10px;letter-spacing:-0.03em;">9</div>
      <div style="font-size:13px;color:var(--muted);margin-top:6px;">Ümumi qiymət</div>
    </div>
  </div>
  <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:16px;background:var(--bg-cream);padding:18px 22px;border-radius:14px;">
    <div style="font-size:17px;font-weight:600;color:var(--ink);">İki sistem — avtomatik sinxron</div>
    <span class="tag-sm">real vaxt</span>
  </div>
</div>`;

export const attendance = () => `
<div class="mockup" style="${WRAP}">
  <div class="mockup-header"><span>Davamiyyət — 10-A · 8 Aprel</span><span class="mockup-header-dots"><span></span><span></span><span></span></span></div>
  <div class="col" style="gap:10px;margin-top:12px;">
    <div class="mini-row"><div class="mini-ico teal">✓</div><div class="grow">Aysu Həsənova</div><div class="tag-sm">iştirak etdi</div></div>
    <div class="mini-row"><div class="mini-ico teal">✓</div><div class="grow">Cavid Məmmədov</div><div class="tag-sm">iştirak etdi</div></div>
    <div class="mini-row"><div class="mini-ico coral">!</div><div class="grow">Leyla Quliyeva</div><div class="tag-sm" style="background:#FFE6DC;color:var(--coral);">yox</div></div>
    <div class="mini-row"><div class="mini-ico teal">✓</div><div class="grow">Rauf Əliyev</div><div class="tag-sm">iştirak etdi</div></div>
  </div>
  <div style="display:flex;align-items:center;gap:14px;margin-top:14px;padding:18px 22px;background:linear-gradient(135deg, var(--purple) 0%, var(--purple-deep) 100%);color:#fff;border-radius:14px;">
    <span style="font-size:22px;">🔔</span>
    <div style="flex:1;">
      <div style="font-weight:700;font-size:18px;">Valideynə bildiriş göndərildi</div>
      <div style="font-size:14px;opacity:0.8;margin-top:2px;">Leyla Quliyeva · SMS + push</div>
    </div>
  </div>
</div>`;

export const comms = () => `
<div class="mockup" style="${WRAP}">
  <div class="mockup-header"><span>Müəllim — Valideyn</span><span class="mockup-header-dots"><span></span><span></span><span></span></span></div>
  <div class="col" style="gap:12px;margin-top:12px;padding:6px 4px;">
    <div class="bubble zeka" style="font-size:20px;"><span class="mark" style="color:var(--purple);">Müəllim Aysel</span>Salam! Riyaziyyat testinin nəticəsi hazırdır — 85/100.</div>
    <div class="bubble user" style="font-size:20px;">Təşəkkür edirəm. Görüş təyin edə bilərikmi?</div>
    <div class="bubble zeka" style="font-size:20px;"><span class="mark" style="color:var(--purple);">Müəllim Aysel</span>Əlbəttə — cümə, 15:00 uyğundurmu?</div>
  </div>
</div>`;

export const security = () => `
<div class="mockup" style="${WRAP}">
  <div class="mockup-header"><span>Təhlükəsizlik & Uyğunluq</span><span class="mockup-header-dots"><span></span><span></span><span></span></span></div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:14px;">
    <div style="padding:24px;background:var(--teal-soft);border-radius:16px;">
      <div style="font-size:28px;">🛡</div>
      <div style="font-weight:700;font-size:22px;color:var(--teal);margin-top:10px;">ISO/IEC 27001</div>
      <div style="font-size:16px;color:var(--muted);margin-top:4px;">Sertifikatlı</div>
    </div>
    <div style="padding:24px;background:var(--purple-soft);border-radius:16px;">
      <div style="font-size:28px;">🇦🇿</div>
      <div style="font-weight:700;font-size:22px;color:var(--purple);margin-top:10px;">Yerli hosting</div>
      <div style="font-size:16px;color:var(--muted);margin-top:4px;">AZ serverləri</div>
    </div>
    <div style="padding:24px;background:var(--gold-soft);border-radius:16px;">
      <div style="font-size:28px;">🇪🇺</div>
      <div style="font-weight:700;font-size:22px;color:var(--gold-2);margin-top:10px;">GDPR uyğun</div>
      <div style="font-size:16px;color:var(--muted);margin-top:4px;">Avropa standartı</div>
    </div>
    <div style="padding:24px;background:#FFE6DC;border-radius:16px;">
      <div style="font-size:28px;">🔒</div>
      <div style="font-weight:700;font-size:22px;color:var(--coral);margin-top:10px;">24/7 izləmə</div>
      <div style="font-size:16px;color:var(--muted);margin-top:4px;">Təhdid tanıma</div>
    </div>
  </div>
</div>`;

export const integrations = () => `
<div class="mockup" style="${WRAP}">
  <div class="mockup-header"><span>Aktiv İnteqrasiyalar</span><span class="mockup-header-dots"><span></span><span></span><span></span></span></div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:14px;">
    <div style="padding:20px 22px;background:var(--bg-cream);border-radius:16px;display:flex;align-items:center;gap:14px;">
      <img src="assets/claude.png" style="height:52px;width:auto;object-fit:contain;">
      <div><div style="font-weight:700;font-size:19px;">Claude AI</div><div style="font-size:15px;color:var(--muted);">Zəka AI motoru</div></div>
    </div>
    <div style="padding:20px 22px;background:var(--bg-cream);border-radius:16px;display:flex;align-items:center;gap:14px;">
      <img src="assets/egov.png" style="height:48px;width:auto;object-fit:contain;">
      <div><div style="font-weight:700;font-size:19px;">E-Gov.az</div><div style="font-size:15px;color:var(--muted);">Avtomatik ixrac</div></div>
    </div>
    <div style="padding:20px 22px;background:var(--bg-cream);border-radius:16px;display:flex;align-items:center;gap:14px;">
      <img src="assets/asanxidmet.png" style="height:48px;width:auto;object-fit:contain;">
      <div><div style="font-weight:700;font-size:19px;">ASAN xidmət</div><div style="font-size:15px;color:var(--muted);">Vahid identifikasiya</div></div>
    </div>
    <div style="padding:20px 22px;background:var(--bg-cream);border-radius:16px;display:flex;align-items:center;gap:14px;">
      <img src="assets/dp.png" style="height:40px;width:auto;object-fit:contain;">
      <div><div style="font-weight:700;font-size:19px;">IBIS · IBO</div><div style="font-size:15px;color:var(--muted);">IB imtahan, CAS</div></div>
    </div>
  </div>
</div>`;

export const ib = () => `
<div style="display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:10px;">
  <div style="padding:28px 30px;background:#fff;border:1px solid var(--line);border-radius:20px;box-shadow:0 4px 20px rgba(15,13,46,0.04);">
    <img src="assets/pyp.png" style="height:52px;width:auto;object-fit:contain;">
    <div style="font-family:'DM Serif Display',serif;font-size:36px;color:var(--ink);margin-top:16px;letter-spacing:-0.02em;">İlk İllər</div>
    <div style="font-size:17px;color:var(--muted);margin-top:8px;line-height:1.4;">Tədqiqat əsaslı öyrənmə, birgə planlama.</div>
  </div>
  <div style="padding:28px 30px;background:#fff;border:1px solid var(--line);border-radius:20px;box-shadow:0 4px 20px rgba(15,13,46,0.04);">
    <img src="assets/myp.png" style="height:52px;width:auto;object-fit:contain;">
    <div style="font-family:'DM Serif Display',serif;font-size:36px;color:var(--ink);margin-top:16px;letter-spacing:-0.02em;">Orta İllər</div>
    <div style="font-size:17px;color:var(--muted);margin-top:8px;line-height:1.4;">Tədqiqat proqramı üçün tam dəstək.</div>
  </div>
  <div style="padding:28px 30px;background:#fff;border:1px solid var(--line);border-radius:20px;box-shadow:0 4px 20px rgba(15,13,46,0.04);">
    <img src="assets/dp.png" style="height:52px;width:auto;object-fit:contain;">
    <div style="font-family:'DM Serif Display',serif;font-size:36px;color:var(--ink);margin-top:16px;letter-spacing:-0.02em;">Diploma</div>
    <div style="font-size:17px;color:var(--muted);margin-top:8px;line-height:1.4;">IBIS, e-kurs, CAS idarəetməsi.</div>
  </div>
  <div style="padding:28px 30px;background:#fff;border:1px solid var(--line);border-radius:20px;box-shadow:0 4px 20px rgba(15,13,46,0.04);">
    <img src="assets/cp.png" style="height:52px;width:auto;object-fit:contain;">
    <div style="font-family:'DM Serif Display',serif;font-size:36px;color:var(--ink);margin-top:16px;letter-spacing:-0.02em;">Karyera</div>
    <div style="font-size:17px;color:var(--muted);margin-top:8px;line-height:1.4;">Peşəyönümlü məktəblər üçün.</div>
  </div>
</div>`;
