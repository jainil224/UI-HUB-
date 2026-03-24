export const ANTIGRAVITY_PROMPTS: Record<string, string> = {
    '3d-rubiks-cube': `# UI HUB • ANTIGRAVITY / ADVANCE MASTER PROMPT
## Ground Truth Source Code
\`\`\`tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import styles from './RubiksCube.module.css';

const STEP_PX = 66; const HALF_PX = 33;
const FC = {
    front: { bg: '#009B48', cls: styles.fcGreen }, back: { bg: '#0051A2', cls: styles.fcBlue },
    right: { bg: '#C41E3A', cls: styles.fcRed }, left: { bg: '#FF5800', cls: styles.fcOrange },
    top: { bg: '#FFFFFF', cls: styles.fcWhite }, bottom: { bg: '#FFD500', cls: styles.fcYellow },
    inner: { bg: '#1a1a1a', cls: styles.fcInner },
};
const FACE_DEFS = [
    { key: 'front', t: 'translateZ(33px)' }, { key: 'back', t: 'rotateY(180deg) translateZ(33px)' },
    { key: 'right', t: 'rotateY(90deg) translateZ(33px)' }, { key: 'left', t: 'rotateY(-90deg) translateZ(33px)' },
    { key: 'top', t: 'rotateX(90deg) translateZ(33px)' }, { key: 'bottom', t: 'rotateX(-90deg) translateZ(33px)' },
];
const MOVES = [
  {axis:'y',slice:1,angle:90},{axis:'y',slice:1,angle:-90}, {axis:'y',slice:0,angle:90},{axis:'y',slice:0,angle:-90},
  {axis:'y',slice:-1,angle:90},{axis:'y',slice:-1,angle:-90}, {axis:'x',slice:1,angle:90},{axis:'x',slice:1,angle:-90},
  {axis:'x',slice:0,angle:90},{axis:'x',slice:0,angle:-90}, {axis:'x',slice:-1,angle:90},{axis:'x',slice:-1,angle:-90},
  {axis:'z',slice:1,angle:90},{axis:'z',slice:1,angle:-90}, {axis:'z',slice:-1,angle:90},{axis:'z',slice:-1,angle:-90}
];
interface Cubie { el: HTMLDivElement; m: DOMMatrix; }
export const RubiksCube: React.FC = () => {
    const sceneRef = useRef<HTMLDivElement>(null); const cubiesRef = useRef<Cubie[]>([]);
    const [status, setStatus] = useState('Initialized ✓'); const [busy, setBusy] = useState(false);
    const historyRef = useRef<any[]>([]); const rotationRef = useRef({ x: -22, y: 45, velX: 0, velY: 0, lastDx: 0, lastDy: 0, dragging: false, lx2: 0, ly2: 0 });
    const manualModeRef = useRef(false); const manualTimerRef = useRef<any>(null);

    const makeCubie = useCallback((lx: number, ly: number, lz: number) => {
        const el = document.createElement('div'); el.className = styles.cubie;
        FACE_DEFS.forEach(fd => {
            let fc = FC.inner;
            if (fd.key==='front' && lz===1) fc = FC.front; if (fd.key==='back' && lz===-1) fc = FC.back;
            if (fd.key==='right' && lx===1) fc = FC.right; if (fd.key==='left' && lx===-1) fc = FC.left;
            if (fd.key==='top' && ly===1) fc = FC.top; if (fd.key==='bottom' && ly===-1) fc = FC.bottom;
            const face = document.createElement('div'); face.className = \`\${styles.cubieFace} \${fc.cls}\`;
            face.style.transform = fd.t + (fc === FC.inner ? ' scale(0.98)' : '');
            if (fc !== FC.inner) {
                face.style.backgroundColor = fc.bg; 
                face.innerHTML = \`<div class="\${styles.gloss}"></div><div class="\${styles.shine}"></div>\`;
            } else { face.style.backgroundColor = '#111'; }
            el.appendChild(face);
        });
        const m = new DOMMatrix().translate(lx * STEP_PX, -ly * STEP_PX, lz * STEP_PX);
        el.style.transform = m.toString(); return { el, m };
    }, []);

    const snap = (m: DOMMatrix) => {
        m.m41 = Math.round(m.m41/66)*66; m.m42 = Math.round(m.m42/66)*66; m.m43 = Math.round(m.m43/66)*66;
        ['m11','m12','m13','m21','m22','m23','m31','m32','m33'].forEach(k => {
            const v = (m as any)[k]; if (Math.abs(v)<0.1) (m as any)[k]=0; else if (v>0.9) (m as any)[k]=1;
            else if (v<-0.9) (m as any)[k]=-1; else (m as any)[k]=Math.sign(v);
        });
    };

    const rotateLayer = useCallback(async (axis: string, slice: number, angle: number, ms: number) => {
        if (!sceneRef.current) return;
        const layer = cubiesRef.current.filter(c => {
            const x = Math.round(c.m.m41/66), y = Math.round(-c.m.m42/66), z = Math.round(c.m.m43/66);
            return (axis==='x'?x:axis==='y'?y:z) === slice;
        });
        if (layer.length===0) return;
        const pivot = document.createElement('div'); pivot.style.cssText = 'position:absolute;transform-style:preserve-3d;';
        sceneRef.current.appendChild(pivot); layer.forEach(c => pivot.appendChild(c.el));
        pivot.getBoundingClientRect(); if (ms>0) pivot.style.transition = \`transform \${ms}ms cubic-bezier(0.34, 1.25, 0.64, 1)\`;
        const rotStr = axis==='y' ? \`rotateY(\${angle}deg)\` : axis==='x' ? \`rotateX(\${angle}deg)\` : \`rotateZ(\${angle}deg)\`;
        pivot.style.transform = rotStr; await new Promise(r => setTimeout(r, ms+80));
        const rotM = new DOMMatrix(rotStr);
        layer.forEach(c => {
            c.m = rotM.multiply(c.m); snap(c.m); sceneRef.current?.appendChild(c.el);
            c.el.style.transform = c.m.toString();
        });
        pivot.remove();
    }, []);

    const scramble = useCallback(async (n=14, ms=220) => {
        if (busy) return; setBusy(true); setStatus('Scrambling...'); historyRef.current = [];
        for (let i=0; i<n; i++) {
            let m; do { m = MOVES[Math.floor(Math.random()*MOVES.length)]; } while (historyRef.current.length && historyRef.current[historyRef.current.length-1].axis===m.axis && historyRef.current[historyRef.current.length-1].slice===m.slice);
            historyRef.current.push(m); await rotateLayer(m.axis, m.slice, m.angle, ms); await new Promise(r => setTimeout(r, 40));
        }
        setBusy(false); setStatus('Scrambled');
    }, [busy, rotateLayer]);

    const solve = useCallback(async (ms=380) => {
        if (busy || !historyRef.current.length) return; setBusy(true); setStatus('Solving...');
        const moves = [...historyRef.current].reverse().map(m => ({ ...m, angle: -m.angle }));
        for (const m of moves) { await rotateLayer(m.axis, m.slice, m.angle, ms); await new Promise(r => setTimeout(r, 60)); }
        historyRef.current = []; setBusy(false); setStatus('Solved!');
    }, [busy, rotateLayer]);

    useEffect(() => {
        if (!sceneRef.current) return; sceneRef.current.innerHTML = ''; cubiesRef.current = [];
        for (let y=1; y>=-1; y--) for (let x=-1; x<=1; x++) for (let z=1; z>=-1; z--) {
            const c = makeCubie(x,y,z); sceneRef.current.appendChild(c.el); cubiesRef.current.push(c);
        }
        let rafId: number; const animRot = () => {
            const rot = rotationRef.current; if (!rot.dragging) {
                rot.velY *= 0.92; rot.velX *= 0.92; if (!manualModeRef.current && historyRef.current.length===0) { rot.velY += (0.25-rot.velY)*0.025; rot.velX += (0-rot.velX)*0.025; }
                rot.y += rot.velY; rot.x += rot.velX; rot.x = Math.max(-65, Math.min(65, rot.x));
            }
            if (sceneRef.current) sceneRef.current.style.transform = \`rotateX(\${rot.x}deg) rotateY(\${rot.y}deg)\`;
            rafId = requestAnimationFrame(animRot);
        };
        rafId = requestAnimationFrame(animRot); return () => cancelAnimationFrame(rafId);
    }, [makeCubie]);

    const handleMouseDown = (e: any) => {
        const clientX = e.touches ? e.touches[0].clientX : e.clientX; const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const rot = rotationRef.current; rot.dragging = true; rot.lx2 = clientX; rot.ly2 = clientY;
        rot.velX = 0; rot.velY = 0; manualModeRef.current = true;
    };
    const handleMouseMove = useCallback((e: any) => {
        const rot = rotationRef.current; if (!rot.dragging) return;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX, clientY = e.touches ? e.touches[0].clientY : e.clientY;
        rot.lastDx = (clientX-rot.lx2)*0.45; rot.lastDy = (clientY-rot.ly2)*0.45;
        rot.y += rot.lastDx; rot.x -= rot.lastDy; rot.x = Math.max(-65, Math.min(65, rot.x));
        rot.lx2 = clientX; rot.ly2 = clientY;
    }, []);
    const handleMouseUp = useCallback(() => {
        const rot = rotationRef.current; if (!rot.dragging) return; rot.dragging = false;
        rot.velY = rot.lastDx*0.85; rot.velX = -rot.lastDy*0.85;
        manualTimerRef.current = setTimeout(() => { manualModeRef.current = false; }, 8000);
    }, []);

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove); window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('touchmove', handleMouseMove); window.addEventListener('touchend', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleMouseMove); window.removeEventListener('touchend', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    return (
        <div className={styles.cubeWrapper}>
            <div className={styles.layoutContainer}>
                <div className={styles.textContent}>
                    <span className={styles.subtitle}>Interactive Piece</span>
                    <h2 className={styles.title}>3D RUBIKS CUBE</h2>
                    <p className={styles.description}>3D inertia, scramble logic, and automated solver.</p>
                    <div className={styles.cubeUi}>
                        <div className={styles.cubeStatus}>{status}</div>
                        <div className={styles.cubeBtns}>
                            <button className={styles.cbtn} onClick={() => scramble()}>Scramble</button>
                            <button className={styles.cbtn} onClick={() => solve()}>Solve</button>
                        </div>
                    </div>
                </div>
                <div className="relative flex items-center justify-center min-w-[300px]">
                    <div className={styles.cubeAura}></div>
                    <div className={styles.cubeViewport} onMouseDown={handleMouseDown} onTouchStart={handleMouseDown}>
                        <div id="cubeScene" ref={sceneRef} className={styles.cubeScene}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default RubiksCube;
\`\`\`
\n## Performance\n* GPU-accelerated transforms (matrix3d).\n* Minimal re-renders through Ref-based management.`,
};
