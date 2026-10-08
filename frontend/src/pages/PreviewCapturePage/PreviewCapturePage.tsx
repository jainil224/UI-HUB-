import React from 'react';
import { componentList } from '../../data/componentData';

/**
 * Hidden showcase page used by the announcement image pipeline
 * (scripts/announcement/capture-previews.mjs) to screenshot components
 * full-bleed on a dark canvas. Not linked anywhere in the UI.
 *
 * ?ids=one,two,three  → renders exactly those components (defaults to all
 *                       interactive-background and particles-background components).
 */
const PreviewCapturePage = () => {
  const params = new URLSearchParams(window.location.search);
  const ids = (params.get('ids') || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const isCaptured = (c: { category: string }) =>
    c.category === 'interactive-background' || c.category === 'particles-background';

  const selected = ids.length > 0
    ? componentList.filter((c) => ids.includes(c.id))
    : componentList.filter(isCaptured);

  React.useEffect(() => {
    document.body.style.background = '#0A0A0A';
    document.body.style.margin = '0';
  }, []);

  return (
    <div className="bg-[#0A0A0A]">
      {selected.map((item) => (
        <div
          key={item.id}
          data-capture-id={item.id}
          data-capture-title={item.title}
          data-capture-category={item.category}
          style={{
            width: 1600,
            height: 900,
            background: '#0A0A0A',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {item.preview()}
        </div>
      ))}
    </div>
  );
};

export default PreviewCapturePage;