const { roleForPassword, createToken, sessionCookie, sendJson } = require('../lib/auth');

module.exports = async (req, res) => {
  if (req.method === 'DELETE') {
    res.setHeader('Set-Cookie', sessionCookie('', 0));
    return sendJson(res, 200, { ok: true });
  }
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Metode tidak didukung.' });

  const role = roleForPassword(req.body?.password);
  if (!role) {
    // shortcut: jeda per request, bukan rate limit global; tambahkan limit kalau link menyebar luas.
    await new Promise((resolve) => setTimeout(resolve, 800));
    return sendJson(res, 401, { error: 'Kata sandi salah.' });
  }
  res.setHeader('Set-Cookie', sessionCookie(createToken(role, process.env.SESSION_SECRET)));
  return sendJson(res, 200, { role });
};
