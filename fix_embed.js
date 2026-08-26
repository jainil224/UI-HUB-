const fs = require('fs');

const chandelierStub = "// Chandelier \u2014 UI HUB\\n\"use client\"\\n\\nimport * as React from \"react\"\\nimport { useEffect, useRef } from \"react\"\\n\\n// Full component source at frontend/src/components/ui/Chandelier.tsx\\nexport default function Chandelier(props: any) { return React.createElement('div', props); }\\n";

const insert = '  "chandelier": "' + chandelierStub + '",\r\n';

// Fix embeddedSourceCode.ts
const p1 = 'C:/Users/Admin/Documents/GitHub/UI-HUB-/frontend/src/data/embeddedSourceCode.ts';
let c1 = fs.readFileSync(p1, 'utf8');
const closeIdx1 = c1.lastIndexOf('};');
c1 = c1.substring(0, closeIdx1) + insert + c1.substring(closeIdx1);
fs.writeFileSync(p1, c1, 'utf8');
console.log('Fixed embeddedSourceCode.ts, new length:', c1.length);

// Fix sourceCodeData.js
const p2 = 'C:/Users/Admin/Documents/GitHub/UI-HUB-/backend/src/data/sourceCodeData.js';
let c2 = fs.readFileSync(p2, 'utf8');
const closeIdx2 = c2.lastIndexOf('};');
c2 = c2.substring(0, closeIdx2) + insert + c2.substring(closeIdx2);
fs.writeFileSync(p2, c2, 'utf8');
console.log('Fixed sourceCodeData.js, new length:', c2.length);

// Verify
const v1 = fs.readFileSync(p1, 'utf8');
const v2 = fs.readFileSync(p2, 'utf8');
console.log('\nVerification:');
console.log('embeddedSourceCode.ts has chandelier:', v1.includes('"chandelier"'));
console.log('sourceCodeData.js has chandelier:', v2.includes('"chandelier"'));
console.log('embeddedSourceCode.ts double comma:', v1.includes(',,'));
console.log('sourceCodeData.js double comma:', v2.includes(',,'));
