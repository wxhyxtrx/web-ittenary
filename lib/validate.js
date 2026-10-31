const isText = (v) => typeof v === 'string' && v.length <= 2000;
const isList = (v) => Array.isArray(v) && v.length <= 200;
const STATUSES = ['aman', 'mepet', 'bentrok'];

function validateItem(it) {
  return isText(it?.time) && isText(it?.text) && (it.mapsUrl === undefined || /^https:\/\/\S+$/.test(it.mapsUrl));
}

function validateDay(d) {
  return /^\d{4}-\d{2}-\d{2}$/.test(d?.date)
    && [d.title, d.area, d.timezone].every(isText)
    && /^[a-z-]+\.jpg$/.test(d.image)
    && isList(d.items) && d.items.length > 0 && d.items.every(validateItem)
    && isList(d.outfits) && d.outfits.every((o) => [o?.event, o?.aay, o?.wull].every(isText))
    && [d.meals?.breakfast, d.meals?.lunch, d.meals?.dinner].every(isText)
    && isList(d.open) && d.open.every(isText);
}

function validateTrip(t) {
  return isText(t?.title)
    && isList(t.people) && t.people.every(isText)
    && isList(t.notes) && t.notes.every(isText)
    && isList(t.days) && t.days.length > 0 && t.days.every(validateDay)
    && t.packing && Object.values(t.packing).every((list) => isList(list) && list.every((p) => isText(p?.category) && isText(p?.item) && Number.isInteger(p?.days) && p.days >= 0))
    && isList(t.checks) && t.checks.every((c) => /^\d{4}-\d{2}-\d{2}$/.test(c?.date) && isText(c.title) && isText(c.note) && STATUSES.includes(c.status));
}

module.exports = { validateTrip };
