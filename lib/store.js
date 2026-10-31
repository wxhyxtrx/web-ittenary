const seed = require('./seed.json');

// Dipakai dev-server.js saja, supaya tes lokal tidak menyentuh database.
let memory = null;

async function supabase(path, options = {}) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', ...options.headers },
  });
  if (!res.ok) throw new Error(`Supabase ${res.status}`);
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

async function readTrip() {
  if (process.env.STORE === 'memory') {
    memory ??= { data: seed, updated_at: new Date().toISOString() };
    return memory;
  }
  const select = 'trip?id=eq.1&select=data,updated_at';
  const [row] = await supabase(select);
  if (row) return row;
  await supabase('trip', {
    method: 'POST',
    headers: { Prefer: 'resolution=ignore-duplicates' },
    body: JSON.stringify({ id: 1, data: seed }),
  });
  return (await supabase(select))[0];
}

// updatedAt yang lama berarti ada simpanan lain, jadi kembalikan null dan jangan timpa.
async function writeTrip(data, updatedAt) {
  const next = new Date().toISOString();
  if (process.env.STORE === 'memory') {
    if (memory?.updated_at !== updatedAt) return null;
    memory = { data, updated_at: next };
    return memory;
  }
  const rows = await supabase(`trip?id=eq.1&updated_at=eq.${encodeURIComponent(updatedAt)}&select=data,updated_at`, {
    method: 'PATCH',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({ data, updated_at: next }),
  });
  return rows[0] ?? null;
}

module.exports = { readTrip, writeTrip };
