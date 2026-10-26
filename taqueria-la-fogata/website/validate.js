'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const read = f => fs.readFileSync(path.join(__dirname, f), 'utf8');
const context = {window:{}};
vm.runInNewContext(read('site-config.js'), context);
const c = context.window.FOGATA, v = c.verified;
assert.equal(c.usingPlaceholders, false, 'Sample content must be removed.');
assert.match(c.phone, /^\(\d{3}\) \d{3}-\d{4}$/);
assert(!c.phone.includes('555'));
for (const section of ['happyHour','comingSoon']) assert(!c[section].show || c[section].approved, section + ' requires approval');
assert(v.address || (!c.address.street && !c.mapsUrl), 'Unverified address must be absent');
assert(v.hours || Object.keys(c.hours).length === 0, 'Unverified schedule must be absent');
assert(v.menu || c.menu.length === 0, 'Unverified menu must be absent');
assert(v.social || Object.values(c.social).every(x => !x), 'Unverified social links must be absent');
if (v.address) { assert(c.address.street); assert.match(c.mapsUrl, /^https:\/\/www.google.com\/maps\//); }
if (v.hours) for (const day of ['mon','tue','wed','thu','fri','sat','sun']) {
  assert(Object.hasOwn(c.hours, day), 'Every day must be explicitly specified');
  const h = c.hours[day];
  assert(h && ((h.open === null && h.close === null) || ([h.open,h.close].every(t => /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(t)))), 'Invalid hours: '+day);
}
if (v.menu) assert(c.menu.some(cat => cat.items.some(i => !i.hidden)), 'Verified menu must have visible items');
for (const url of Object.values(c.social).filter(Boolean)) assert.match(url, /^https:\/\//);
const html = read('index.html');
const data = JSON.parse(html.match(/<script id="business-data" type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
assert.equal(data.telephone, '+1'+c.phone.replace(/\D/g,''));
assert.equal(Boolean(data.address), v.address);
assert.equal(Boolean(data.openingHoursSpecification), v.hours);
assert(!/555-0100|1234 Example|summer 2027/i.test(html));
for (const file of ['app.js','site-config.js','styles.css']) assert(html.includes('"'+file+'"'));
assert(read('preview.html').includes(read('site-config.js')), 'Regenerate preview');
if (process.argv.includes('--release')) {
  assert.equal(c.launchApproved, true, 'Owner business review is incomplete');
  for (const field of ['phone','address','hours','menu']) assert(v[field], field+' verification required');
  assert(!html.includes('noindex'), 'Regenerate metadata after approval');
}
console.log('Content checks passed' + (process.argv.includes('--release') ? ' (release)' : ' (review only; not release approval)'));
