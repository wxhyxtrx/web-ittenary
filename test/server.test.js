const test = require('node:test');
const assert = require('node:assert');
const { roleForPassword, createToken, readToken } = require('../lib/auth');
const { validateTrip } = require('../lib/validate');
const seed = require('../lib/seed.json');

const env = { VIEW_PASSWORD: 'lihat', EDIT_PASSWORD: 'ubah' };

test('kata sandi menentukan peran', () => {
  assert.equal(roleForPassword('lihat', env), 'view');
  assert.equal(roleForPassword('ubah', env), 'edit');
  assert.equal(roleForPassword('salah', env), null);
  assert.equal(roleForPassword('', env), null);
  assert.equal(roleForPassword('lihat', {}), null);
});

test('token ditolak jika dipalsukan atau kedaluwarsa', () => {
  const token = createToken('view', 'rahasia', 1000);
  assert.equal(readToken(token, 'rahasia', 2000), 'view');
  assert.equal(readToken(token.replace('view', 'edit'), 'rahasia', 2000), null);
  assert.equal(readToken(token, 'lain', 2000), null);
  assert.equal(readToken(token, 'rahasia', 1000 + 31 * 86400000), null);
  assert.equal(readToken('', 'rahasia'), null);
});

test('data awal valid dan data rusak ditolak', () => {
  assert.ok(validateTrip(seed));
  assert.ok(!validateTrip({}));
  const clone = () => JSON.parse(JSON.stringify(seed));
  const badLink = clone(); badLink.days[0].items[0].mapsUrl = 'javascript:alert(1)';
  assert.ok(!validateTrip(badLink));
  const badStatus = clone(); badStatus.checks[0].status = 'x';
  assert.ok(!validateTrip(badStatus));
  const noItems = clone(); noItems.days[0].items = [];
  assert.ok(!validateTrip(noItems));
});
