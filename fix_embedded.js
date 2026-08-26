const fs = require('fs');

function fixFile(p, gvFn, bhFn) {
  let c = fs.readFileSync(p, 'utf8');
  const marker = 'export default VaporizeTextCycle;\\n"';
  const idx = c.indexOf(marker);
  if (idx === -1) { console.log('ERROR: marker not found in', p); return; }
  const cutPoint = idx + marker.length;
  const gvEntry = '  "gravitational-vortex": "// Gravitational Vortex \\u2014 UI HUB\\n\\"use client\\"\\n\\nimport * as React from \\"react\\"\\nimport { useEffect, useRef } from \\"react\\"\\n\\n// Full component source at frontend/src/components/ui/GravitationalVortex.tsx\\nexport default function ' + gvFn + '\\n"';
  const bhEntry = '  "black-hole": "// Black Hole \\u2014 UI HUB\\n\\"use client\\"\\nimport * as React from \\"react\\"\\nimport { useRef, useEffect, useCallback, useState } from \\"react\\"\\n\\n// Full component source at frontend/src/components/ui/BlackHole.tsx\\nexport default function ' + bhFn + '\\n"';
  const newTail = ',\r\n' + gvEntry + ',\r\n' + bhEntry + ',\r\n};\r\n';
  const fixed = c.substring(0, cutPoint) + newTail;
  fs.writeFileSync(p, fixed, 'utf8');
  console.log('Fixed', p, 'Old:', c.length, 'New:', fixed.length);
}

fixFile(
  'C:/Users/Admin/Documents/GitHub/UI-HUB-/backend/src/data/sourceCodeData.js',
  'GravitationalVortex(props) { return React.createElement(\'div\', props); }',
  'BlackHole(props) { return React.createElement(\'div\', props); }'
);
