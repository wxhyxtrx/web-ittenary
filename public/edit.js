const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
const view = document.getElementById('view');
const NEW_ROW = {
  items: () => ({ time:'', text:'' }),
  outfits: () => ({ event:'', aay:'', wull:'' }),
  open: () => '',
  checks: () => ({ date:trip.days[0].date, title:'', status:'aman', note:'' }),
  notes: () => '',
};

let trip, updatedAt, dirty = false, section = 'day', dayIndex = 0, person = 'Aay', message = '';
const openPanels = new Set();

const getAt = (path) => path.reduce((o, k) => o[k], trip);
const setAt = (path, value) => { getAt(path.slice(0, -1))[path.at(-1)] = value; dirty = true; };

function input(label, path, type = 'text') {
  const id = path.join('-').replace(/[^\w-]/g, '_');
  const attrs = `id="${id}" class="input" data-path='${esc(JSON.stringify(path))}'`;
  const value = getAt(path);
  const control = type === 'area' ? `<textarea ${attrs} rows="2">${esc(value)}</textarea>`
    : type === 'category' ? `<input ${attrs} type="text" list="categories" value="${esc(value)}">`
    : `<input ${attrs} type="${type}" value="${esc(value)}"${type === 'number' ? ' min="0" step="1"' : ''}>`;
  return `<label class="field" for="${id}">${label}${control}</label>`;
}

function select(label, path, options) {
  const id = path.join('-').replace(/[^\w-]/g, '_');
  return `<label class="field" for="${id}">${label}<select id="${id}" class="input" data-path='${esc(JSON.stringify(path))}'>${options.map(([v, t]) => `<option value="${esc(v)}" ${v === getAt(path) ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select></label>`;
}

const removeBtn = (path, i) => `<button class="btn ghost" type="button" data-remove='${esc(JSON.stringify(path))}' data-index="${i}">Hapus</button>`;
const addBtn = (path, kind, text) => `<button class="btn ghost" type="button" data-add='${esc(JSON.stringify(path))}' data-kind="${kind}">${text}</button>`;

function dayForm() {
  const p = ['days', dayIndex], d = trip.days[dayIndex];
  return `
  ${select('Hari', ['__day'], [])}
  <section class="card"><div class="edit-row grid">
    ${input('Judul', [...p, 'title'])}${input('Area', [...p, 'area'])}${input('Zona waktu', [...p, 'timezone'])}
    ${select('Foto', [...p, 'image'], Object.entries(window.TRIP_IMAGES).map(([f, c]) => [f, c.label]))}
  </div></section>
  <p class="label">Jadwal</p><section class="list">${d.items.map((_, i) => {
    const r = [...p, 'items', i];
    return `<div class="edit-row grid">${input('Jam', [...r, 'time'])}${input('Kegiatan', [...r, 'text'])}${input('Link Maps, opsional', [...r, 'mapsUrl'], 'url')}
      <label class="inline"><input type="checkbox" data-flag='${esc(JSON.stringify([...r, 'tentative']))}' ${d.items[i].tentative ? 'checked' : ''}>Belum pasti</label>${d.items.length > 1 ? removeBtn([...p, 'items'], i) : ''}</div>`;
  }).join('')}</section>${addBtn([...p, 'items'], 'items', 'Tambah jadwal')}
  <p class="label">Outfit</p><section class="list">${d.outfits.map((_, i) => {
    const r = [...p, 'outfits', i];
    return `<div class="edit-row grid">${input('Acara', [...r, 'event'])}${input('Aay', [...r, 'aay'], 'area')}${input('Wull', [...r, 'wull'], 'area')}${removeBtn([...p, 'outfits'], i)}</div>`;
  }).join('') || '<p class="sub">Belum ada outfit.</p>'}</section>${addBtn([...p, 'outfits'], 'outfits', 'Tambah outfit')}
  <p class="label">Makan</p><section class="card"><div class="edit-row grid">${input('Pagi', [...p, 'meals', 'breakfast'])}${input('Siang', [...p, 'meals', 'lunch'])}${input('Malam', [...p, 'meals', 'dinner'])}</div></section>
  <p class="label">Belum pasti</p><section class="list">${d.open.map((_, i) => `<div class="edit-row">${input('Catatan', [...p, 'open', i])}${removeBtn([...p, 'open'], i)}</div>`).join('') || '<p class="sub">Tidak ada.</p>'}</section>${addBtn([...p, 'open'], 'open', 'Tambah catatan')}`;
}

const panel = (key, summary, body) => `<details class="acc" data-panel="${esc(key)}" ${openPanels.has(key) ? 'open' : ''}><summary>${summary}</summary><div class="acc-body">${body}</div></details>`;

function packingForm() {
  const list = trip.packing[person], p = ['packing', person];
  const cats = [...new Set(list.map((it) => it.category))];
  const rows = (cat) => list.map((it, i) => (it.category === cat ? `<div class="pack-row">${input('Barang', [...p, i, 'item'])}${input('Kategori', [...p, i, 'category'], 'category')}${input('Hari', [...p, i, 'days'], 'number')}${removeBtn(p, i)}</div>` : '')).join('');
  return `<div class="tabs">${Object.keys(trip.packing).map((n) => `<button type="button" data-person="${esc(n)}" aria-pressed="${n === person}">${esc(n)}</button>`).join('')}</div>
  <datalist id="categories">${cats.map((c) => `<option value="${esc(c)}">`).join('')}</datalist>
  ${cats.map((c) => panel(`${person}|${c}`, `<span>${esc(c || 'Tanpa kategori')}</span><small>${list.filter((it) => it.category === c).length} barang</small>`, `${rows(c)}<button class="btn ghost" type="button" data-add-packing="${esc(c)}">Tambah barang</button>`)).join('')}
  ${cats.length ? '' : '<button class="btn ghost" type="button" data-add-packing="Baju">Tambah barang</button>'}
  <p class="sub">Ketik nama baru di Kategori untuk membuat kategori baru.</p>`;
}

const STATUS_LABEL = { aman:'Aman', mepet:'Mepet', bentrok:'Bentrok' };
const checkSummary = (c) => `<span class="sum">${esc(c.date)} · ${esc(c.title || 'Tanpa judul')}</span><small>${STATUS_LABEL[c.status]}</small>`;

function checksForm() {
  const dates = trip.days.map((d) => [d.date, d.date]);
  return `${trip.checks.map((c, i) => {
    const r = ['checks', i];
    return panel(`check|${i}`, checkSummary(c), `<div class="edit-row grid">${select('Tanggal', [...r, 'date'], dates)}${select('Status', [...r, 'status'], Object.entries(STATUS_LABEL))}${input('Judul', [...r, 'title'])}${input('Catatan', [...r, 'note'], 'area')}</div>${removeBtn(['checks'], i)}`);
  }).join('')}${addBtn(['checks'], 'checks', 'Tambah cek jadwal')}`;
}

function notesForm() {
  return `<section class="card">${input('Judul web', ['title'])}</section>
  <p class="label">Catatan umum</p><section class="list">${trip.notes.map((_, i) => `<div class="edit-row">${input('Catatan', ['notes', i], 'area')}${removeBtn(['notes'], i)}</div>`).join('')}</section>${addBtn(['notes'], 'notes', 'Tambah catatan')}`;
}

function render() {
  const sections = [['day', 'Hari'], ['packing', 'Packing'], ['checks', 'Cek jadwal'], ['notes', 'Umum']];
  const body = { day:dayForm, packing:packingForm, checks:checksForm, notes:notesForm }[section]();
  view.innerHTML = `<div class="stack" style="width:100%;max-width:860px;margin:0 auto;padding-bottom:20px">
    <h1 class="page-title">Edit konten</h1>
    <div class="tabs">${sections.map(([id, t]) => `<button type="button" data-section="${id}" aria-pressed="${id === section}">${t}</button>`).join('')}</div>
    ${body}</div>
  <div class="actions"><a class="btn ghost" href="/">Lihat web</a><span class="sub" role="status">${esc(message)}</span><button class="btn" type="button" data-save>Simpan</button></div>`;
  const daySelect = document.getElementById('__day');
  if (daySelect) {
    daySelect.removeAttribute('data-path');
    daySelect.innerHTML = trip.days.map((d, i) => `<option value="${i}" ${i === dayIndex ? 'selected' : ''}>${esc(d.date)} · ${esc(d.title)}</option>`).join('');
    daySelect.addEventListener('change', () => { dayIndex = Number(daySelect.value); render(); });
  }
}

function showLogin(text = '') {
  view.innerHTML = `<div class="gate"><form id="login"><h1 class="page-title">Edit konten</h1><label class="field" for="password">Kata sandi edit<input class="input" id="password" type="password" autocomplete="current-password" required></label><p class="error" role="alert">${esc(text)}</p><button class="btn">Masuk</button></form></div>`;
  document.getElementById('password').focus();
}

async function start() {
  const res = await fetch('/api/trip');
  if (res.status === 401) return showLogin();
  const body = await res.json();
  if (!res.ok) { view.innerHTML = `<p class="stack" style="padding-block:24px">${esc(body.error)}</p>`; return; }
  if (body.role !== 'edit') return showLogin('Halaman ini memakai kata sandi edit.');
  trip = body.data;
  updatedAt = body.updatedAt;
  render();
}

// Kolom opsional yang dikosongkan harus hilang, karena validasi server menolak link kosong.
function cleanTrip() {
  const copy = JSON.parse(JSON.stringify(trip));
  copy.days.forEach((d) => d.items.forEach((it) => {
    if (!it.mapsUrl) delete it.mapsUrl;
    if (!it.tentative) delete it.tentative;
  }));
  return copy;
}

async function saveTrip() {
  message = 'Menyimpan...';
  render();
  const res = await fetch('/api/trip', { method:'PUT', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify({ data:cleanTrip(), updatedAt }) }).catch(() => null);
  const body = await res?.json().catch(() => null);
  if (res?.ok) { updatedAt = body.updatedAt; dirty = false; message = 'Tersimpan'; }
  else message = body?.error || 'Belum tersimpan. Cek koneksi lalu coba lagi.';
  render();
}

document.addEventListener('submit', async (e) => {
  if (e.target.id !== 'login') return;
  e.preventDefault();
  const res = await fetch('/api/login', { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify({ password:document.getElementById('password').value }) });
  if (!res.ok) return showLogin((await res.json()).error);
  start();
});

document.addEventListener('change', (e) => {
  const { path, flag } = e.target.dataset;
  if (path) {
    const value = e.target.type === 'number' ? Math.max(0, Math.floor(Number(e.target.value) || 0)) : e.target.value;
    const parsed = JSON.parse(path);
    setAt(parsed, value);
    if (parsed.at(-1) === 'category') { openPanels.add(`${person}|${value}`); render(); }
    if (parsed[0] === 'checks') e.target.closest('details').querySelector('summary').innerHTML = checkSummary(trip.checks[parsed[1]]);
  } else if (flag) setAt(JSON.parse(flag), e.target.checked);
});

// Event toggle tidak bubble, jadi perlu capture supaya panel tetap terbuka setelah render ulang.
document.addEventListener('toggle', (e) => {
  const key = e.target.dataset?.panel;
  if (key === undefined) return;
  if (e.target.open) openPanels.add(key); else openPanels.delete(key);
}, true);

document.addEventListener('input', (e) => { if (e.target.dataset.path) { message = 'Belum disimpan'; dirty = true; } });

document.addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  const d = b.dataset;
  if (d.section) section = d.section;
  else if (d.person) person = d.person;
  else if (d.add) {
    const list = getAt(JSON.parse(d.add));
    list.push(NEW_ROW[d.kind]());
    dirty = true;
    if (d.kind === 'checks') openPanels.add(`check|${list.length - 1}`);
  }
  else if ('addPacking' in d) { trip.packing[person].push({ category:d.addPacking, item:'', days:1 }); dirty = true; openPanels.add(`${person}|${d.addPacking}`); }
  else if (d.remove) { getAt(JSON.parse(d.remove)).splice(Number(d.index), 1); dirty = true; message = 'Belum disimpan'; }
  else if ('save' in d) { document.activeElement?.blur(); saveTrip(); return; }
  else return;
  render();
});

addEventListener('beforeunload', (e) => { if (dirty) e.preventDefault(); });
start();
