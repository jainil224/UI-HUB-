const fs = require('fs');
const p = 'C:/Users/Admin/Documents/GitHub/UI-HUB-/frontend/src/data/embeddedSourceCode.ts';
let c = fs.readFileSync(p, 'utf8');

// Remove the bad chandelier entry
const chIdx = c.indexOf('"chandelier"');
const chEnd = c.indexOf('\r\n};', chIdx);
const badEntry = c.substring(chIdx, chEnd + 2); // include \r\n
c = c.replace(badEntry, '');

// Verify removed
console.log('Removed bad entry, has chandelier still:', c.includes('"chandelier"'));

// Now insert a proper one with escaped quotes
const properEntry = '  "chandelier": "// Chandelier \\u2014 UI HUB\\n\\\"use client\\\"\\n\\nimport * as React from \\\"react\\\"\\nimport { useEffect, useRef } from \\\"react\\\"\\n\\n// Full component source at frontend/src/components/ui/Chandelier.tsx\\nexport default function Chandelier(props: any) { return React.createElement(\\\'div\\\', props); }\\n",\r\n';

const closeIdx = c.lastIndexOf('};');
c = c.substring(0, closeIdx) + properEntry + c.substring(closeIdx);
fs.writeFileSync(p, c, 'utf8');

// Verify
const v = fs.readFileSync(p, 'utf8');
console.log('Has chandelier:', v.includes('"chandelier"'));
console.log('No double comma:', !v.includes(',,'));
console.log('New length:', v.length);
