import React, { useEffect, useRef, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface StarCursorProps {
    containerRef?: React.RefObject<HTMLElement>;
    hideDefaultCursor?: boolean;
    className?: string;
    primaryColor?: string;
    secondaryColor?: string;
}

// ── Three-Geometry Particle System ────────────────────────────────────────────
interface StarParticle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    alpha: number;
    size: number;
    decay: number;
    friction: number;
    type: 'dust' | 'spark' | 'microburst';
    rotation: number;
    rotSpeed: number;
}

// ── Click shockwave ring ───────────────────────────────────────────────────────
interface Ring {
    x: number;
    y: number;
    radius: number;
    maxRadius: number;
    alpha: number;
}

// ─── Component ────────────────────────────────────────────────────────────────
export const StarCursor: React.FC<StarCursorProps> = ({
    containerRef,
    hideDefaultCursor = true,
    className = '',
    primaryColor   = '#06b6d4',
    secondaryColor = '#818cf8',
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // ── Config ────────────────────────────────────────────────────────────────
    const CFG = useRef({
        lerpSpeed:      0.10,      // Aether Glide elastic LERP
        baseScale:      0.65,      // Base scale modifier
        rayLength:      52,        // Standard ray length
        rayWidth:       2.2,       // Standard broad ray width for contrast
        diagModifier:   0.55,      // Diagonal rays shrunk proportionally to 55%
        diagWidthMod:   0.78,
        glowRadius:     52,        // Nebula casing backing glow radius
        coreRadius:     9.5,
        pulseSpeed:     0.002,     // Breathing core breathing frequency
        rotSpeed:       0.00015,   // Slow base continuous rotation angle speed
        hoverScale:     1.25,      // Scale up by 20% - 30%
        hoverRotExtra:  0.0003,    // Added rotation rate on hover
        lerpHoverSpeed: 0.08,
        flashDecay:     0.083,     // Decays flare spike over exactly 0.2s (at 60fps)
        motionBlur:     0.18,      // High-fidelity natural canvas motion blur factor
    });

    // ── Refs ──────────────────────────────────────────────────────────────────
    const mouse       = useRef({ x: 0, y: 0 });
    const star        = useRef({ x: 0, y: 0, vx: 0, vy: 0, lastX: 0, lastY: 0 });
    const rotation    = useRef(0);
    const time        = useRef(0);
    const hoverFactor = useRef(0);
    const isHovering  = useRef(false);
    const flash       = useRef(0);
    const particles   = useRef<StarParticle[]>([]);
    const rings       = useRef<Ring[]>([]);
    const frameId     = useRef<number>(0);
    const inContainer = useRef(false);
    const lastTime    = useRef<number>(0);

    // Parse hex colors
    const parseHex = (hex: string): [number, number, number] => {
        const h = hex.replace('#', '');
        return [
            parseInt(h.slice(0,2), 16),
            parseInt(h.slice(2,4), 16),
            parseInt(h.slice(4,6), 16)
        ];
    };
    const [pr, pg, pb] = parseHex(primaryColor);
    const [sr, sg, sb] = parseHex(secondaryColor);

    // ── Diamond path helper (optics drawing) ───────────────────────────────
    const drawDiamond = useCallback((
        ctx: CanvasRenderingContext2D,
        len: number,
        wid: number,
        color: string | CanvasGradient,
        alpha = 1
    ) => {
        ctx.save();
        ctx.globalAlpha *= alpha;
        ctx.beginPath();
        ctx.moveTo(0, -len);
        ctx.lineTo(wid, 0);
        ctx.lineTo(0, len);
        ctx.lineTo(-wid, 0);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        ctx.restore();
    }, []);

    // ── Particle Renderers ────────────────────────────────────────────────────
    
    // 1. Standard Dust: Soft radial gradient nodes
    const drawDust = useCallback((ctx: CanvasRenderingContext2D, p: StarParticle) => {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.globalCompositeOperation = 'screen';
        
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, `rgba(${pr},${pg},${pb},0.8)`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }, [pr, pg, pb]);

    // 2. Sparks: High-velocity ellipses aligned to velocity direction
    const drawSpark = useCallback((ctx: CanvasRenderingContext2D, p: StarParticle) => {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.globalCompositeOperation = 'screen';
        ctx.translate(p.x, p.y);
        
        const angle = Math.atan2(p.vy, p.vx);
        ctx.rotate(angle);
        
        const speed = Math.hypot(p.vx, p.vy);
        const lengthMod = Math.min(4.0, 1.5 + speed * 0.12);
        ctx.scale(lengthMod, 0.65);
        
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.4, `rgba(${sr},${sg},${sb},0.8)`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }, [sr, sg, sb]);

    // 3. Micro Starbursts: Mini 4-point cross sparkles
    const drawMicroburst = useCallback((ctx: CanvasRenderingContext2D, p: StarParticle) => {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.globalCompositeOperation = 'screen';
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        
        const spikeLen = p.size * 2.2;
        const spikeW = p.size * 0.22;
        
        for (let j = 0; j < 4; j++) {
            ctx.save();
            ctx.rotate((j / 4) * Math.PI * 2);
            
            const g = ctx.createLinearGradient(0, 0, 0, -spikeLen);
            g.addColorStop(0, '#ffffff');
            g.addColorStop(0.4, `rgba(${pr},${pg},${pb},0.75)`);
            g.addColorStop(1, 'rgba(0,0,0,0)');
            
            ctx.beginPath();
            ctx.moveTo(-spikeW, 0);
            ctx.lineTo(0, -spikeLen);
            ctx.lineTo(spikeW, 0);
            ctx.closePath();
            
            ctx.fillStyle = g;
            ctx.fill();
            ctx.restore();
        }
        ctx.restore();
    }, [pr, pg, pb]);

    // ── Click Action burst ────────────────────────────────────────────────────
    const spawnClickBurst = useCallback((x: number, y: number) => {
        const dpr = window.devicePixelRatio || 1;
        const count = 15 + Math.floor(Math.random() * 11); // 15-25 explosive particles
        
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
            const speed = (2.2 + Math.random() * 6.0) * dpr;
            const pvx = Math.cos(angle) * speed;
            const pvy = Math.sin(angle) * speed;
            
            const lifetime = 0.8 + Math.random() * 1.7; // exact 0.8 to 2.5s lifecycle
            const decay = 1 / (60 * lifetime);
            
            const typeRand = Math.random();
            const type = typeRand < 0.45 
                ? 'spark' 
                : (typeRand < 0.80 ? 'dust' : 'microburst');
            
            particles.current.push({
                x,
                y,
                vx: pvx,
                vy: pvy,
                alpha: 0.85 + Math.random() * 0.15,
                size: (2.0 + Math.random() * 3.2) * dpr,
                decay: decay,
                friction: 0.95, // exact vacuum friction
                type: type,
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.1,
            });
        }
    }, []);

    // ── Main animation loop ───────────────────────────────────────────────────
    const animate = useCallback((ts: number) => {
        const canvas = canvasRef.current;
        const ctx    = canvas?.getContext('2d');
        if (!canvas || !ctx) { 
            frameId.current = requestAnimationFrame(animate); 
            return; 
        }

        const dt  = Math.min(ts - lastTime.current, 50); 
        lastTime.current = ts;
        time.current += dt;

        const cfg = CFG.current;
        const dpr = window.devicePixelRatio || 1;

        // ── MOTION BLUR: source-over partial clear ────────────────────────────
        // Filling with black is NEUTRAL under screen blend mode.
        // It leaves page backgrounds unchanged while trailing canvas graphics cleanly.
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = `rgba(0,0,0,${cfg.motionBlur})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // ── Lerp tracking ─────────────────────────────────────────────────────
        const s = star.current;
        const m = mouse.current;
        s.x += (m.x - s.x) * cfg.lerpSpeed;
        s.y += (m.y - s.y) * cfg.lerpSpeed;
        s.vx = (s.x - s.lastX) * dpr;
        s.vy = (s.y - s.lastY) * dpr;
        s.lastX = s.x;
        s.lastY = s.y;

        const moveSpeed = Math.hypot(s.vx, s.vy);

        // Dynamic persistent rotation (base rate + speed-accelerated depth spin)
        const rotationFactor = cfg.rotSpeed + Math.min(0.001, moveSpeed * 0.00004);
        rotation.current += rotationFactor * dt;

        // Hover smooth easing interpolation
        hoverFactor.current += ((isHovering.current ? 1 : 0) - hoverFactor.current) * cfg.lerpHoverSpeed;

        // Click flash bloom spike decay
        flash.current = Math.max(0, flash.current - cfg.flashDecay);

        // Pulse scale modulation (sinusoidal scaling of ±4% at low speed)
        const pulseSpeedMultiplier = moveSpeed > 1 ? 0.3 : 1.0;
        const pulse = Math.sin(time.current * cfg.pulseSpeed * pulseSpeedMultiplier);
        const pulseScale = cfg.baseScale * (1 + pulse * 0.04);
        
        // Active Scale calculation including hover expansion and flash spike
        const S = pulseScale * (1 + hoverFactor.current * (cfg.hoverScale - 1)) * (1 + flash.current * 0.35);

        const cx = s.x * dpr;
        const cy = s.y * dpr;

        // ── Spawn velocity stardust tail ─────────────────────────────────────
        if (inContainer.current && moveSpeed > 0.3) {
            const spawnChance = Math.min(0.85, moveSpeed * 0.06);
            if (Math.random() < spawnChance) {
                const baseAngle = Math.atan2(s.vy, s.vx) + Math.PI;
                const spread = (Math.random() - 0.5) * 1.3;
                const angle = baseAngle + spread;
                
                const speed = moveSpeed * (0.06 + Math.random() * 0.16) * dpr;
                const pvx = Math.cos(angle) * speed;
                const pvy = Math.sin(angle) * speed;
                
                const px = cx + (Math.random() - 0.5) * 6 * dpr;
                const py = cy + (Math.random() - 0.5) * 6 * dpr;
                
                const lifetime = 0.8 + Math.random() * 1.7; // 0.8 to 2.5s
                const decay = 1 / (60 * lifetime);
                
                const typeRand = Math.random();
                const type = typeRand < 0.45 
                    ? 'dust' 
                    : (typeRand < 0.80 ? 'spark' : 'microburst');
                
                particles.current.push({
                    x: px,
                    y: py,
                    vx: pvx,
                    vy: pvy,
                    alpha: 0.70 + Math.random() * 0.25,
                    size: (1.6 + Math.random() * 2.8) * dpr,
                    decay: decay,
                    friction: 0.95, // exact vacuum friction
                    type: type,
                    rotation: Math.random() * Math.PI * 2,
                    rotSpeed: (Math.random() - 0.5) * 0.08,
                });
            }
        }

        // ── Spawn idle diffraction sparkles or hover vibration sparkles ──────
        const idleRate = isHovering.current ? 0.24 : 0.08;
        if (inContainer.current && Math.random() < idleRate) {
            // Drill along one of 4 cardinal ray paths (vertical/horizontal spike axes)
            const axisIndex = Math.floor(Math.random() * 4);
            const axisAngle = (axisIndex * Math.PI) / 2;
            const dist = (0.25 + Math.random() * 0.70) * cfg.rayLength * S * dpr;
            
            const px = cx + Math.cos(axisAngle) * dist;
            const py = cy + Math.sin(axisAngle) * dist;
            
            const driftSpeed = (0.15 + Math.random() * 0.25) * dpr;
            const pvx = Math.cos(axisAngle) * driftSpeed;
            const pvy = Math.sin(axisAngle) * driftSpeed;
            
            const lifetime = 0.8 + Math.random() * 1.7; // 0.8s to 2.5s
            const decay = 1 / (60 * lifetime);
            
            particles.current.push({
                x: px,
                y: py,
                vx: pvx,
                vy: pvy,
                alpha: 0.75 + Math.random() * 0.25,
                size: (1.4 + Math.random() * 1.6) * dpr,
                decay: decay,
                friction: 0.95, // vacuum friction
                type: Math.random() < 0.4 ? 'microburst' : 'dust',
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.05,
            });
        }

        // Additional energetic vibrations if hovering
        if (inContainer.current && isHovering.current && Math.random() < 0.18) {
            const angle = Math.random() * Math.PI * 2;
            const dist = (1.0 + Math.random() * 8.0) * dpr;
            const px = cx + Math.cos(angle) * dist;
            const py = cy + Math.sin(angle) * dist;
            
            const pvx = (Math.random() - 0.5) * 1.0 * dpr;
            const pvy = (Math.random() - 0.5) * 1.0 * dpr;
            
            const lifetime = 0.4 + Math.random() * 0.5;
            
            particles.current.push({
                x: px,
                y: py,
                vx: pvx,
                vy: pvy,
                alpha: 0.85,
                size: (1.2 + Math.random() * 1.5) * dpr,
                decay: 1 / (60 * lifetime),
                friction: 0.95,
                type: 'spark',
                rotation: 0,
                rotSpeed: 0,
            });
        }

        // ── Draw active particle pool ─────────────────────────────────────────
        for (let i = particles.current.length - 1; i >= 0; i--) {
            const p = particles.current[i];
            
            p.vx *= p.friction;
            p.vy *= p.friction;
            p.x  += p.vx;
            p.y  += p.vy;
            p.alpha -= p.decay;
            p.rotation += p.rotSpeed;

            if (p.alpha <= 0) {
                particles.current.splice(i, 1);
                continue;
            }

            if (p.type === 'dust') {
                drawDust(ctx, p);
            } else if (p.type === 'spark') {
                drawSpark(ctx, p);
            } else {
                drawMicroburst(ctx, p);
            }
        }

        // ── Render shockwave rings (action filament) ──────────────────────────
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        for (let i = rings.current.length - 1; i >= 0; i--) {
            const ring = rings.current[i];
            ring.radius += 5.5 * dpr;
            ring.alpha  = Math.max(0, ring.alpha - 0.045);
            
            if (ring.alpha <= 0 || ring.radius > ring.maxRadius) {
                rings.current.splice(i, 1);
                continue;
            }
            
            ctx.save();
            ctx.globalAlpha = ring.alpha;
            ctx.strokeStyle = `rgba(${pr},${pg},${pb},1)`;
            ctx.lineWidth   = Math.max(0.6 * dpr, 2.0 * dpr * (1 - ring.radius / ring.maxRadius));
            ctx.beginPath();
            ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
        ctx.restore();

        // ── Draw main star optics ─────────────────────────────────────────────
        if (!inContainer.current || (s.x < -100 && s.y < -100)) {
            frameId.current = requestAnimationFrame(animate);
            return;
        }

        // 1. NEBULA BACKING HALO with Stretch math
        const glowR = cfg.glowRadius * S * dpr * (1 + flash.current * 0.5 + hoverFactor.current * 0.4);
        const haloA = (0.5 + flash.current * 0.4 + hoverFactor.current * 0.25) * (inContainer.current ? 1 : 0);

        if (haloA > 0.01) {
            ctx.save();
            ctx.translate(cx, cy);
            ctx.globalCompositeOperation = 'screen';
            ctx.globalAlpha = haloA;

            if (moveSpeed > 0.2) {
                const stretchAngle = Math.atan2(s.vy, s.vx);
                ctx.rotate(stretchAngle);
                const stretch = Math.min(0.55, moveSpeed * 0.02);
                ctx.scale(1 + stretch, 1 / (1 + stretch * 0.5));
            }

            const hg = ctx.createRadialGradient(0, 0, 0, 0, 0, glowR);
            hg.addColorStop(0.00, '#ffffff');
            hg.addColorStop(0.12, `rgba(${sr},${sg},${sb},0.9)`);
            hg.addColorStop(0.48, `rgba(${pr},${pg},${pb},0.6)`);
            hg.addColorStop(1.00, 'rgba(0,0,0,0)');
            ctx.fillStyle = hg;
            
            ctx.beginPath();
            ctx.arc(0, 0, glowR, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // 2. LAYERED LENS SPIKES (Diffraction structure)
        ctx.save();
        ctx.translate(cx, cy);
        ctx.globalCompositeOperation = 'screen';
        
        // Star rotation over time and interactive state
        const targetRotExtra = isHovering.current ? cfg.hoverRotExtra : 0;
        ctx.rotate(rotation.current + hoverFactor.current * targetRotExtra);

        const L  = cfg.rayLength * S * dpr;
        const W  = cfg.rayWidth  * S * dpr * (1 + hoverFactor.current * 0.25);
        const DL = L * cfg.diagModifier;
        const DW = W * cfg.diagWidthMod;

        // ── 4 Cardinal Rays (3 layers each: casing, main, thin needle) ────
        const cc = `rgba(${pr},${pg},${pb},1)`;
        for (const a of [0, Math.PI / 2]) {
            for (const d of [0, Math.PI]) {
                ctx.save();
                ctx.rotate(a + d);
                // Backing Flare Casing: soft colored chromatic aura
                drawDiamond(ctx, L * 1.15, W * 1.65, cc, 0.35);
                // Main Ray: broader glowing ray
                drawDiamond(ctx, L, W * 0.55, '#ffffff', 1.0);
                // Core Needle: blazing white, ultra-thin high-exposure ray extending far out
                drawDiamond(ctx, L * 1.5, 0.25 * dpr, '#ffffff', 0.98);
                ctx.restore();
            }
        }

        // ── 4 Diagonal Rays (2 layers each: casing, inner needle) ─────────
        const dc = `rgba(${sr},${sg},${sb},1)`;
        for (const a of [Math.PI / 4, Math.PI * 3 / 4]) {
            for (const d of [0, Math.PI]) {
                ctx.save();
                ctx.rotate(a + d);
                // Soft colored backing casing
                drawDiamond(ctx, DL * 1.15, DW * 1.35, dc, 0.30);
                // Thin sharp white inner needle
                drawDiamond(ctx, DL, DW * 0.18, '#ffffff', 0.92);
                ctx.restore();
            }
        }

        // 3. INTENSE STELLAR CORE HALO
        {
            const cr = cfg.coreRadius * S * dpr * (1 + flash.current * 0.4);
            const cg = ctx.createRadialGradient(0, 0, 0, 0, 0, cr);
            cg.addColorStop(0.00, '#ffffff');
            cg.addColorStop(0.20, '#ffffff');
            cg.addColorStop(0.40, `rgba(${sr},${sg},${sb},0.95)`);
            cg.addColorStop(0.75, `rgba(${pr},${pg},${pb},0.45)`);
            cg.addColorStop(1.00, 'rgba(0,0,0,0)');
            
            ctx.save();
            ctx.globalAlpha = 0.96 + flash.current * 0.04;
            ctx.fillStyle = cg;
            ctx.beginPath();
            ctx.arc(0, 0, cr, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // 4. CLICK FLASH BLOOM SPIKE
        if (flash.current > 0.01) {
            const fg = ctx.createRadialGradient(0, 0, 0, 0, 0, glowR * 1.8);
            fg.addColorStop(0, `rgba(255,255,255,${flash.current * 0.85})`);
            fg.addColorStop(0.3, `rgba(${pr},${pg},${pb},${flash.current * 0.5})`);
            fg.addColorStop(1, 'rgba(0,0,0,0)');
            
            ctx.save();
            ctx.globalAlpha = flash.current;
            ctx.fillStyle = fg;
            ctx.beginPath();
            ctx.arc(0, 0, glowR * 1.8, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        ctx.restore();
        frameId.current = requestAnimationFrame(animate);
    }, [drawDiamond, drawDust, drawSpark, drawMicroburst, spawnClickBurst, pr, pg, pb, sr, sg, sb]);

    // ── Events ────────────────────────────────────────────────────────────────
    useEffect(() => {
        const target: EventTarget    = containerRef?.current ?? window;
        const container: HTMLElement = containerRef?.current ?? document.body;

        const onMove = (e: Event) => {
            const me   = e as MouseEvent;
            const rect = container === document.body
                ? { left: 0, top: 0 }
                : (container as HTMLElement).getBoundingClientRect();
            mouse.current = { x: me.clientX - rect.left, y: me.clientY - rect.top };
        };
        const onEnter = () => { inContainer.current = true; };
        const onLeave = () => { inContainer.current = false; };
        
        const onOver  = (e: Event) => {
            const el = (e as MouseEvent).target as HTMLElement;
            if (el?.closest('a,button,[role="button"],input,textarea,select,label,[data-interactive]')) {
                isHovering.current = true;
            }
        };
        const onOut = (e: Event) => {
            const rel = (e as MouseEvent).relatedTarget as HTMLElement | null;
            if (!rel?.closest('a,button,[role="button"],input,textarea,select,label,[data-interactive]')) {
                isHovering.current = false;
            }
        };
        
        const onDown = () => {
            flash.current = 1.0;
            const dpr = window.devicePixelRatio || 1;
            const cx = star.current.x * dpr;
            const cy = star.current.y * dpr;
            
            // Shockwave Filament (radius 0, expands smoothly to 150-250px)
            rings.current.push({
                x: cx,
                y: cy,
                radius: 0,
                maxRadius: (150 + Math.random() * 100) * dpr,
                alpha: 0.95,
            });
            
            spawnClickBurst(cx, cy);
        };

        target.addEventListener('mousemove', onMove,  { passive: true });
        target.addEventListener('mouseover', onOver,  { passive: true });
        target.addEventListener('mouseout',  onOut,   { passive: true });
        target.addEventListener('mousedown', onDown,  { passive: true });

        if (containerRef?.current) {
            containerRef.current.addEventListener('mouseenter', onEnter, { passive: true });
            containerRef.current.addEventListener('mouseleave', onLeave, { passive: true });
        } else {
            inContainer.current = true;
        }

        // Hide OS Cursor fallback on pointer-fine devices
        let styleEl: HTMLStyleElement | null = null;
        if (hideDefaultCursor) {
            styleEl = document.createElement('style');
            styleEl.id = '__star-cursor-hide__';
            if (containerRef?.current) {
                styleEl.textContent = `[data-star-scope] { cursor: none !important; }`;
                containerRef.current.dataset.starScope = '1';
            } else {
                styleEl.textContent = `@media (pointer: fine) { *, *::before, *::after { cursor: none !important; } }`;
            }
            document.head.appendChild(styleEl);
        }

        return () => {
            target.removeEventListener('mousemove', onMove);
            target.removeEventListener('mouseover', onOver);
            target.removeEventListener('mouseout',  onOut);
            target.removeEventListener('mousedown', onDown);
            if (containerRef?.current) {
                containerRef.current.removeEventListener('mouseenter', onEnter);
                containerRef.current.removeEventListener('mouseleave', onLeave);
                delete containerRef.current.dataset.starScope;
            }
            styleEl?.remove();
        };
    }, [containerRef, hideDefaultCursor, spawnClickBurst]);

    useEffect(() => {
        lastTime.current = performance.now();
        frameId.current  = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frameId.current);
    }, [animate]);

    // Resilient Canvas Resizing
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const setup = () => {
            const dpr = window.devicePixelRatio || 1;
            const el  = containerRef?.current ?? document.documentElement;
            const w   = el === document.documentElement ? window.innerWidth  : (el as HTMLElement).getBoundingClientRect().width;
            const h   = el === document.documentElement ? window.innerHeight : (el as HTMLElement).getBoundingClientRect().height;
            canvas.width  = w * dpr;
            canvas.height = h * dpr;
            canvas.style.width  = `${w}px`;
            canvas.style.height = `${h}px`;
        };
        
        setup();
        const ro = new ResizeObserver(setup);
        ro.observe(containerRef?.current ?? document.documentElement);
        window.addEventListener('resize', setup, { passive: true });
        
        return () => { 
            ro.disconnect(); 
            window.removeEventListener('resize', setup); 
        };
    }, [containerRef]);

    return (
        <>
            <style>{`
                .star-cursor-canvas {
                    position: ${containerRef ? 'absolute' : 'fixed'};
                    top: 0; left: 0;
                    pointer-events: none;
                    z-index: 9999;
                    mix-blend-mode: screen;
                }
            `}</style>
            <canvas ref={canvasRef} className={`star-cursor-canvas ${className}`} aria-hidden="true" />
        </>
    );
};

export default StarCursor;
