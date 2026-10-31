const { getRole, sendJson } = require('../lib/auth');
const { readTrip, writeTrip } = require('../lib/store');
const { validateTrip } = require('../lib/validate');

module.exports = async (req, res) => {
  const role = getRole(req);
  if (!role) return sendJson(res, 401, { error: 'Masukkan kata sandi.' });

  try {
    if (req.method === 'GET') {
      const row = await readTrip();
      return sendJson(res, 200, { data: row.data, updatedAt: row.updated_at, role });
    }
    if (req.method !== 'PUT') return sendJson(res, 405, { error: 'Metode tidak didukung.' });
    if (role !== 'edit') return sendJson(res, 403, { error: 'Pakai kata sandi edit.' });
    if (!validateTrip(req.body?.data) || !req.body?.updatedAt) return sendJson(res, 400, { error: 'Ada isian yang belum benar.' });

    const row = await writeTrip(req.body.data, req.body.updatedAt);
    if (!row) return sendJson(res, 409, { error: 'Data sudah diubah di perangkat lain. Muat ulang sebelum menyimpan.' });
    return sendJson(res, 200, { updatedAt: row.updated_at });
  } catch (err) {
    console.error(err);
    return sendJson(res, 502, { error: 'Data belum bisa dimuat. Coba lagi sebentar.' });
  }
};
