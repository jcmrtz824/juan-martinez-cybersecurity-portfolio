'use strict';
// Create a clean, standalone source directory. No repository creation or publication.
const fs = require('node:fs'), path = require('node:path');
const source = path.resolve(__dirname, '..');
const destination = path.resolve(process.argv[2] || '');
if (!process.argv[2] || fs.existsSync(destination) || destination.startsWith(source+path.sep)) throw new Error('Supply a NEW destination outside this project.');
fs.mkdirSync(destination, {recursive:true});
for (const f of ['README.md','docs','website','scripts','deployment']) fs.cpSync(path.join(source,f),path.join(destination,f),{recursive:true});
fs.mkdirSync(path.join(destination,'.github/workflows'),{recursive:true});
fs.copyFileSync(path.join(source,'deployment/pages.yml'),path.join(destination,'.github/workflows/pages.yml'));
fs.writeFileSync(path.join(destination,'.gitignore'),'dist/\n.openai/\n');
console.log('Standalone source prepared at '+destination+'; not pushed or published.');
