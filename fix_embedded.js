const fs = require('fs');
const path = 'C:/Users/Admin/Documents/GitHub/UI-HUB-/frontend/src/data/embeddedSourceCode.ts';
let content = fs.readFileSync(path, 'utf8');

// The issue: "};\n  "gravitational-vortex":..." is outside the object
// We need to remove the stale gravitational-vortex entry (outside object) and add it properly inside

// Find the broken part: after the text-vaporize closing, there's "};\n  "gravitational-vortex":..." then "};"
// We need: text-vaporize ends with \n", then gravitational-vortex inside, then };

// Strategy: Remove everything after the text-vaporize entry's closing quote, and replace with proper ending
const marker = 'VaporizeTextCycle;\n"';
const idx = content.lastIndexOf(marker);
if (idx === -1) {
  console.log('ERROR: Could not find marker');
  process.exit(1);
}

const endOfMarker = idx + marker.length;

// Everything after endOfMarker is: "\n};\n  "gravitational-vortex":...\n";\n"
const brokenTail = content.substring(endOfMarker);
console.log('Broken tail starts with:', JSON.stringify(brokenTail.substring(0, 60)));

// Remove the broken tail and replace with proper ending
const cleanTail = '\n' +
  '  "gravitational-vortex": "// Gravitational Vortex — UI HUB\\n\\"use client\\"\\n\\nimport * as React from \\"react\\"\\nimport { useEffect, useRef } from \\"react\\"\\n\\n// Full component source at frontend/src/components/ui/GravitationalVortex.tsx\\nexport default function GravitationalVortex(props: any) { return React.createElement(\\'div\\', props); }\\n",\n' +
  '  "black-hole": "// Black Hole — UI HUB\\n\\"use client\\"\\nimport * as React from \\"react\\"\\nimport { useRef, useEffect, useCallback, useState } from \\"react\\"\\n\\n// Full component source at frontend/src/components/ui/BlackHole.tsx\\nexport default function BlackHole(props: any) { return React.createElement(\\'div\\', props); }\\n",\n' +
  '};\n';

const fixed = content.substring(0, endOfMarker) + cleanTail;
fs.writeFileSync(path, fixed, 'utf8');
console.log('Fixed! File written.');
