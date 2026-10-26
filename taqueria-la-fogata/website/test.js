'use strict';
const assert = require('node:assert/strict'), fs = require('node:fs'), vm = require('node:vm'), path = require('node:path');
const read = f => fs.readFileSync(path.join(__dirname, f), 'utf8');
function render(iso, configure = () => {}) {
  const nodes = {}, listeners = {}, storage = {};
  const node = id => nodes[id] ||= { innerHTML:'', textContent:'', dataset:{}, hidden:false };
  class Clock extends Date { constructor(...args) { super(...(args.length ? args : [iso])); } }
  const window = {localStorage:{getItem:k=>storage[k],setItem:(k,v)=>storage[k]=v},matchMedia:()=>({matches:false})};
  const root = {lang:'en',setAttribute:(k,v)=>root[k]=v, removeAttribute:k=>delete root[k]};
  const context = {window, Date:Clock, Intl, document:{getElementById:node,documentElement:root,addEventListener:(k,v)=>listeners[k]=v},setInterval:()=>{},setTimeout:()=>{}};
  vm.runInNewContext(read('site-config.js'), context); configure(window.FOGATA);
  vm.runInNewContext(read('app.js'), context);
  return {nodes,root,click:id=>listeners.click({target:{id}})};
}
let tests = 0;
const baseline = render('2026-10-26T16:00:00Z');
assert.equal(baseline.nodes.status.dataset.open,'unknown');
assert(!baseline.nodes.actions.innerHTML.includes('maps')); assert(baseline.nodes.actions.innerHTML.includes('tel:+17707942122'));
assert.equal(baseline.nodes['menu-body'].innerHTML, '');
assert.equal(baseline.nodes.happyhour.hidden,true); assert.equal(baseline.nodes.coming.hidden,true);
baseline.click('lang-toggle'); assert.equal(baseline.root.lang,'es'); assert(baseline.nodes.status.textContent.includes('Llámanos'));
baseline.click('theme-toggle'); assert.equal(baseline.root['data-theme'],'light');
tests++;
const normal = c => { c.verified.hours = true; c.hours = Object.fromEntries(['sun','mon','tue','wed','thu','fri','sat'].map(d=>[d,{open:'10:00',close:'20:00'}])); };
for (const [time,open] of [['2026-10-26T13:59:00Z',false],['2026-10-26T14:00:00Z',true],['2026-10-26T23:59:00Z',true],['2026-10-27T00:00:00Z',false],['2026-11-02T14:59:00Z',false],['2026-11-02T15:00:00Z',true]]) {
  assert.equal(render(time,normal).nodes.status.dataset.open,open?'yes':'no',time); tests++;
}
const overnight = c => {c.verified.hours=true;c.hours={fri:{open:'18:00',close:'02:00'},sat:{open:null,close:null}};};
for (const [time,open] of [['2026-10-23T05:00:00Z',false],['2026-10-23T22:00:00Z',true],['2026-10-24T05:59:00Z',true],['2026-10-24T06:00:00Z',false],['2026-10-24T22:00:00Z',false]]) {
  assert.equal(render(time,overnight).nodes.status.dataset.open,open?'yes':'no',time);tests++;
}
const approvals = render('2026-10-26T16:00:00Z',c=>{c.happyHour.show=true;c.comingSoon.show=true;});
assert(approvals.nodes.happyhour.hidden && approvals.nodes.coming.hidden);tests++;
console.log(`${tests} scenario groups passed: unknown data, bilingual/theme controls, daytime boundaries, DST, previous-day overnight spillover, closed days, unapproved offers.`);
