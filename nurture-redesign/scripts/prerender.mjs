import { readFile, writeFile } from 'node:fs/promises';
import { render } from '../.prerender/entry-server.js';
const template = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
if (!template.includes('<!--app-html-->')) throw new Error('Prerender marker missing');
await writeFile(new URL('../dist/index.html', import.meta.url), template.replace('<!--app-html-->', render()));
console.log('Prerendered the complete Nurture page for immediate and no-JavaScript access.');
