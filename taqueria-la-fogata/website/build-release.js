'use strict';
const fs = require('node:fs'), path = require('node:path'), cp = require('node:child_process');
for (const script of ['build-metadata.js','build-preview.js','test.js','validate.js']) cp.execFileSync(process.execPath,[path.join(__dirname,script), ...(script === 'validate.js' ? ['--release'] : [])], {stdio:'inherit'});
const out = path.resolve(__dirname,'../dist');
if (fs.existsSync(out)) fs.rmSync(out,{recursive:true});
fs.mkdirSync(out);
// Publish only runtime files. Keep strategy, financial assumptions, tests and source tools out.
for (const file of ['index.html','styles.css','site-config.js','app.js']) fs.copyFileSync(path.join(__dirname,file),path.join(out,file));
fs.writeFileSync(path.join(out,'.nojekyll'),'');
console.log('Release artifact prepared: '+out);
