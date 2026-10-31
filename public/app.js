const ICONS = {
  today:'<path d="M5 7h14v13H5zM8 4v5m8-5v5M5 11h14"/>',
  days:'<path d="M9 5 4 7v13l5-2 6 2 5-2V5l-5 2zM9 5v13m6-11v13"/>',
  packing:'<path d="M5 5h14v14H5zM9 12l2 2 4-4"/>',
  checks:'<circle cx="12" cy="12" r="8"/><path d="M12 7v5l3 2"/>',
  moon:'<path d="M19 14A8 8 0 1 1 10 5a6.5 6.5 0 0 0 9 9z"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2"/>',
  next:'<path d="m9 6 6 6-6 6"/>',
};
const icon = (n) => `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n]}</svg>`;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
const fmtDate = (s, o) => new Intl.DateTimeFormat('id-ID', { timeZone:'UTC', ...o }).format(new Date(s + 'T00:00:00Z'));
const CARD_COLORS = ['lav', 'blu', 'pnk', 'sag'];
const STATUS = { aman:['Aman', 'sag'], mepet:['Mepet', 'amb'], bentrok:['Bentrok', 'pnk'] };
const NAV = [['today', 'Hari ini'], ['days', 'Semua hari'], ['packing', 'Packing'], ['checks', 'Cek jadwal']];

let trip, dayIndex = 0, tab = 'today', person = 'Aay';
const checked = load('trip-checked', {});

const todayISO = () => { const d = new Date(); return new Date(d - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };

function defaultDay(days, today) {
  const i = days.findIndex((d) => d.date === today);
  if (i >= 0) return i;
  return today < days[0].date ? 0 : days.length - 1;
}

function countdown(days, today) {
  const n = Math.round((new Date(days[0].date) - new Date(today)) / 86400000);
  if (n > 0) return [n, 'hari lagi'];
  return today > days[days.length - 1].date ? ['Selesai', 'liburan'] : ['Mulai', 'liburan'];
}

const themeIcon = () => {
  const t = document.documentElement.dataset.theme;
  const dark = t ? t === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  return dark ? ['sun', 'Ganti ke mode terang'] : ['moon', 'Ganti ke mode gelap'];
};

const dateRange = () => {
  const { days } = trip, a = days[0].date, b = days[days.length - 1].date;
  return `${fmtDate(a, { day:'numeric', month:'short' })} - ${fmtDate(b, { day:'numeric', month:'short', year:'numeric' })}`;
};

const header = (title, sub, image) => {
  const [i, label] = themeIcon();
  return `<header class="hero"><img src="/images/${esc(image)}" alt=""><div class="hero-top"><span class="chip">${esc(dateRange())}</span><button class="toggle" data-action="theme" aria-label="${label}" title="${label}">${icon(i)}</button></div><div class="hero-text"><h1>${esc(title)}</h1><p>${esc(sub)}</p></div></header>`;
};

function checkRow(c) {
  const [text, color] = STATUS[c.status];
  return `<div class="item"><div><b>${esc(c.title)}</b><small>${esc(c.note)}</small></div><span class="status ${color}">${text}</span></div>`;
}

function today() {
  const d = trip.days[dayIndex], next = trip.days[dayIndex + 1];
  const [count, countLabel] = countdown(trip.days, todayISO());
  const checks = trip.checks.filter((c) => c.date === d.date);
  const outfits = d.outfits.length ? d.outfits.map((o) => `<div class="outfit"><b>${esc(o.event)}</b><p>Aay: ${esc(o.aay || 'Belum diisi')}</p><p>Wull: ${esc(o.wull || 'Belum diisi')}</p></div>`).join('') : '<div class="outfit"><p class="sub">Outfit belum diisi</p></div>';
  const meals = [['Pagi', d.meals.breakfast], ['Siang', d.meals.lunch], ['Malam', d.meals.dinner]];
  return header(trip.title, `${d.area} · ${d.timezone}`, d.image) + `
  <div class="stack">
    <div class="tiles">
      <div class="tile lav"><b>Hari ${dayIndex + 1}</b>dari ${trip.days.length}</div>
      <div class="tile blu"><b>${trip.people.length}</b>orang</div>
      <div class="tile pnk"><b>${count}</b>${countLabel}</div>
    </div>
  </div>
  <div class="pills">${trip.days.map((x, i) => `<button data-day="${i}" aria-pressed="${i === dayIndex}">${esc(fmtDate(x.date, { day:'numeric', month:'short' }))}</button>`).join('')}</div>
  <div class="layout">
    <div class="col">
      <p class="label">Detail hari ini</p>
      <section class="card">
        <div class="row-top"><span class="tag">${esc(fmtDate(d.date, { weekday:'long' }))}</span><span>${esc(d.items[0].time)}</span></div>
        <h2>${esc(d.title)}</h2><p class="sub">${esc(fmtDate(d.date, { day:'numeric', month:'long', year:'numeric' }))}</p>
        ${outfits}
      </section>
    </div>
    <div class="col">
      ${checks.length ? `<p class="label">Info penting</p><section class="list">${checks.map(checkRow).join('')}</section>` : ''}
      <p class="label">Makan hari ini</p>
      <section class="list">${meals.map(([k, v]) => `<div class="item"><div><b>${esc(v || 'Belum diisi')}</b><small>${k}</small></div></div>`).join('')}</section>
      <p class="sub">${esc(trip.notes[0] || '')}</p>
    </div>
    <div class="wide col">
      <p class="label">Timeline perjalanan</p>
      <div class="scroll" tabindex="0" aria-label="Timeline perjalanan">${d.items.map((it, i) => `<article class="node"><span class="n">${i + 1}</span><time>${esc(it.time)}</time><span>${esc(it.text)}</span>${it.tentative ? '<span class="sub">Belum pasti</span>' : ''}${it.mapsUrl ? `<a href="${esc(it.mapsUrl)}" target="_blank" rel="noopener">Buka Maps</a>` : ''}</article>`).join('')}</div>
    </div>
    ${d.open.length ? `<section class="dash wide"><b>Belum pasti</b><ul>${d.open.map((o) => `<li>${esc(o)}</li>`).join('')}</ul></section>` : ''}
    ${next ? `<button class="next wide" data-day="${dayIndex + 1}"><span><small>Berikutnya, ${esc(fmtDate(next.date, { day:'numeric', month:'short' }))}</small><b>${esc(next.title)}</b></span>${icon('next')}</button>` : ''}
  </div>`;
}

function days() {
  const credits = Object.values(window.TRIP_IMAGES).map((c) => `<li><a href="${esc(c.url)}" target="_blank" rel="noopener">${esc(c.label)}</a>, ${esc(c.author)}, ${esc(c.license)}</li>`).join('');
  return header(trip.title, 'Semua hari', 'pantai.jpg') + `<div class="stack">
    <div class="list split" style="margin-top:-30px;position:relative;z-index:2">${trip.days.map((d, i) => `<button class="item" data-day="${i}"><span class="badge ${CARD_COLORS[i % 4]}">${esc(fmtDate(d.date, { day:'numeric' }))}</span><div><b>${esc(d.title)}</b><small>${esc(fmtDate(d.date, { day:'numeric', month:'short' }))} · ${esc(d.area)}</small></div></button>`).join('')}</div>
    <a class="btn ghost" href="/edit">Edit konten</a>
    <details class="sub"><summary>Sumber foto</summary><ul>${credits}</ul><p>Foto diperkecil. Lisensi CC BY-SA berlaku untuk foto terkait.</p></details>
  </div>`;
}

function packing() {
  const list = trip.packing[person];
  const key = (it) => `${person}|${it.category}|${it.item}`;
  const done = list.filter((it) => checked[key(it)]).length;
  const cats = [...new Set(list.map((it) => it.category))];
  return `<div class="stack">
    <h1 class="page-title">Packing</h1>
    <div class="tabs">${Object.keys(trip.packing).map((p) => `<button data-person="${esc(p)}" aria-pressed="${p === person}">${esc(p)}</button>`).join('')}</div>
    <section class="card lav"><b>${done} dari ${list.length} siap</b><div class="bar"><div style="width:${list.length ? Math.round(done / list.length * 100) : 0}%"></div></div></section>
    ${cats.map((c) => `<p class="label">${esc(c)}</p><section class="list split">${list.filter((it) => it.category === c).map((it) => `<label class="check"><input type="checkbox" data-key="${esc(key(it))}" ${checked[key(it)] ? 'checked' : ''}><span>${esc(it.item)}</span>${it.days > 1 ? `<small>${it.days} hari</small>` : ''}</label>`).join('')}</section>`).join('')}
    <p class="sub">Centang tersimpan di perangkat ini.</p>
  </div>`;
}

function checks() {
  return `<div class="stack"><h1 class="page-title">Cek jadwal</h1><p class="sub">Waktu perjalanan masih perkiraan.</p><section class="list">${trip.checks.map((c) => checkRow({ ...c, title:`${fmtDate(c.date, { day:'numeric', month:'short' })} · ${c.title}` })).join('')}</section></div>`;
}

function render() {
  document.getElementById('view').innerHTML = { today, days, packing, checks }[tab]();
  const nav = document.getElementById('nav');
  nav.hidden = false;
  nav.innerHTML = NAV.map(([id, label]) => `<button data-tab="${id}" aria-label="${label}" title="${label}" ${tab === id ? 'aria-current="page"' : ''}>${icon(id)}</button>`).join('');
  const pills = document.querySelector('.pills'), active = pills?.querySelector('[aria-pressed="true"]');
  if (active) pills.scrollLeft = active.offsetLeft - pills.offsetLeft - (pills.clientWidth - active.offsetWidth) / 2;
}

function showLogin(message = '') {
  document.getElementById('nav').hidden = true;
  document.getElementById('view').innerHTML = `<div class="gate"><form id="login"><h1 class="page-title">Liburan Aay dan Wull</h1><label class="field" for="password">Kata sandi<input class="input" id="password" type="password" autocomplete="current-password" required></label><p class="error" role="alert">${esc(message)}</p><button class="btn">Masuk</button></form></div>`;
  document.getElementById('password').focus();
}

async function start() {
  try {
    const res = await fetch('/api/trip');
    if (res.status === 401) return showLogin();
    const body = await res.json();
    if (!res.ok) throw new Error(body.error);
    trip = body.data;
    if (!trip.packing[person]) person = Object.keys(trip.packing)[0];
    dayIndex = defaultDay(trip.days, todayISO());
    render();
  } catch (err) {
    document.getElementById('view').innerHTML = `<p class="stack" style="padding-block:24px">${esc(err.message || 'Rencana liburan belum bisa dimuat. Muat ulang halaman ini.')}</p>`;
  }
}

document.addEventListener('submit', async (e) => {
  if (e.target.id !== 'login') return;
  e.preventDefault();
  const res = await fetch('/api/login', { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify({ password:document.getElementById('password').value }) });
  if (res.ok) return start();
  showLogin((await res.json()).error);
});

document.addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  if (b.dataset.tab) { tab = b.dataset.tab; render(); scrollTo(0, 0); }
  else if (b.dataset.day) { dayIndex = Number(b.dataset.day); tab = 'today'; render(); scrollTo(0, 0); }
  else if (b.dataset.person) { person = b.dataset.person; render(); }
  else if (b.dataset.action === 'theme') {
    const next = themeIcon()[0] === 'sun' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    save('trip-theme', next);
    render();
  }
});

document.addEventListener('change', (e) => {
  if (!e.target.dataset.key) return;
  checked[e.target.dataset.key] = e.target.checked;
  save('trip-checked', checked);
  render();
});

const savedTheme = load('trip-theme', null);
if (savedTheme) document.documentElement.dataset.theme = savedTheme;
start();
