#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const read = f => fs.readFileSync(path.join(__dirname,f),'utf8');
// Retain doctype, language, viewport, robots and verified structured metadata.
const html = read('index.html')
  .replace('<link rel="stylesheet" href="styles.css">', '<style>\n'+read('styles.css')+'\n</style>')
  .replace('<script src="site-config.js"></script>', '<script>\n'+read('site-config.js')+'\n</script>')
  .replace('<script src="app.js"></script>', '<script>\n'+read('app.js')+'\n</script>');
fs.writeFileSync(path.join(__dirname,'preview.html'),html);
console.log('Self-contained preview regenerated.');
