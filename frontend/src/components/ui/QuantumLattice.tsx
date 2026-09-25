"use client";

import * as React from "react";

export interface QuantumLatticeProps {
  background?: string;
  nodeColor?: string;
  activeColor?: string;
  spacing?: number;
  springTension?: number;
  damping?: number;
  reach?: number;
  impulse?: number;
  pulseOnClick?: boolean;
  showNodes?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

interface LatticeNode {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
  row: number;
  col: number;
}

interface QuantumShockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  strength: number;
  speed: number;
  active: boolean;
}

interface ColorRgb {
  r: number;
  g: number;
  b: number;
}

function parseHexColor(hex: string): ColorRgb {
  const clean = hex.replace("#", "").trim();
  if (clean.length === 3) {
    return {
      r: parseInt(clean[0] + clean[0], 16),
      g: parseInt(clean[1] + clean[1], 16),
      b: parseInt(clean[2] + clean[2], 16),
    };
  }
  if (clean.length >= 6) {
    return {
      r: parseInt(clean.substring(0, 2), 16),
      g: parseInt(clean.substring(2, 4), 16),
      b: parseInt(clean.substring(4, 6), 16),
    };
  }
  return { r: 61, g: 92, b: 255 };
}

export default function QuantumLattice(props: QuantumLatticeProps) {
  const {
    background = "#0A0A0A",
    nodeColor = "#3D5CFF",
    activeColor = "#00E5FF",
    spacing = 42,
    springTension = 0.08,
    damping = 0.88,
    reach = 140,
    impulse = 0.8,
    pulseOnClick = true,
    showNodes = true,
    className = "",
    style,
  } = props;

  const containerRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId = 0;
    let isIntersecting = true;
    let width = 0;
    let height = 0;
    let dpr = 1;

    let nodes: LatticeNode[] = [];
    let cols = 0;
    let rows = 0;

    let shockwaves: QuantumShockwave[] = [];

    const pointer = {
      x: -1000,
      y: -1000,
      prevX: -1000,
      prevY: -1000,
      vx: 0,
      vy: 0,
      active: false,
    };

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reducedMotion = mediaQuery.matches;

    const cNode = parseHexColor(nodeColor);
    const cActive = parseHexColor(activeColor);

    const initGrid = () => {
      if (width <= 0 || height <= 0) return;
      const cellSpacing = Math.max(28, Math.min(80, spacing));
      cols = Math.ceil(width / cellSpacing) + 2;
      rows = Math.ceil(height / cellSpacing) + 2;

      const offsetX = (width - (cols - 1) * cellSpacing) / 2;
      const offsetY = (height - (rows - 1) * cellSpacing) / 2;

      nodes = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const bx = offsetX + c * cellSpacing;
          const by = offsetY + r * cellSpacing;
          nodes.push({
            x: bx,
            y: by,
            baseX: bx,
            baseY: by,
            vx: 0,
            vy: 0,
            row: r,
            col: c,
          });
        }
      }
    };

    const resize = () => {
      const rect = container.getBoundingClientRect();
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));

      const rawDpr = window.devicePixelRatio || 1;
      dpr = Math.min(rawDpr, width > 1920 ? 1.5 : 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initGrid();

      if (reducedMotion) {
        drawStaticFrame();
      }
    };

    const drawStaticFrame = () => {
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, width, height);

      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(${cNode.r}, ${cNode.g}, ${cNode.b}, 0.22)`;
      ctx.beginPath();
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (node.col < cols - 1) {
          const right = nodes[i + 1];
          ctx.moveTo(node.baseX, node.baseY);
          ctx.lineTo(right.baseX, right.baseY);
        }
        if (node.row < rows - 1) {
          const bottom = nodes[i + cols];
          ctx.moveTo(node.baseX, node.baseY);
          ctx.lineTo(bottom.baseX, bottom.baseY);
        }
      }
      ctx.stroke();

      if (showNodes) {
        ctx.fillStyle = `rgba(${cNode.r}, ${cNode.g}, ${cNode.b}, 0.5)`;
        for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i];
          ctx.beginPath();
          ctx.arc(node.baseX, node.baseY, 1.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      if (!isIntersecting || reducedMotion) return;

      const dt = Math.min(0.04, Math.max(0.001, (currentTime - lastTime) / 1000));
      lastTime = currentTime;

      const k = Math.max(0.01, Math.min(0.3, springTension));
      const damp = Math.max(0.7, Math.min(0.98, damping));
      const rMax = Math.max(40, reach);
      const rMaxSq = rMax * rMax;
      const imp = Math.max(0.1, Math.min(3, impulse));

      const pVx = pointer.active ? (pointer.x - pointer.prevX) * 0.4 : 0;
      const pVy = pointer.active ? (pointer.y - pointer.prevY) * 0.4 : 0;
      pointer.prevX = pointer.x;
      pointer.prevY = pointer.y;

      for (let s = shockwaves.length - 1; s >= 0; s--) {
        const wave = shockwaves[s];
        wave.radius += wave.speed * dt * 60;
        wave.strength *= Math.exp(-3 * dt);
        if (wave.radius > wave.maxRadius || wave.strength < 0.01) {
          wave.active = false;
          shockwaves.splice(s, 1);
        }
      }

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        const fBaseX = (node.baseX - node.x) * k;
        const fBaseY = (node.baseY - node.y) * k;
        node.vx += fBaseX;
        node.vy += fBaseY;

        if (pointer.active) {
          const dx = node.x - pointer.x;
          const dy = node.y - pointer.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < rMaxSq && distSq > 1) {
            const dist = Math.sqrt(distSq);
            const factor = (1 - dist / rMax) * imp;
            node.vx += (dx / dist) * factor * 14 + pVx * factor * 8;
            node.vy += (dy / dist) * factor * 14 + pVy * factor * 8;
          }
        }

        for (let s = 0; s < shockwaves.length; s++) {
          const wave = shockwaves[s];
          const wdx = node.x - wave.x;
          const wdy = node.y - wave.y;
          const wdist = Math.sqrt(wdx * wdx + wdy * wdy);
          const diff = Math.abs(wdist - wave.radius);
          if (diff < 36) {
            const pFactor = (1 - diff / 36) * wave.strength;
            const pushDirX = wdist > 0.001 ? wdx / wdist : 0;
            const pushDirY = wdist > 0.001 ? wdy / wdist : 0;
            node.vx += pushDirX * pFactor * 22;
            node.vy += pushDirY * pFactor * 22;
          }
        }

        node.vx *= damp;
        node.vy *= damp;

        const maxVel = 40;
        node.vx = Math.max(-maxVel, Math.min(maxVel, node.vx));
        node.vy = Math.max(-maxVel, Math.min(maxVel, node.vy));

        node.x += node.vx * dt * 60;
        node.y += node.vy * dt * 60;

        const maxDist = 48;
        const offX = node.x - node.baseX;
        const offY = node.y - node.baseY;
        const curDist = Math.sqrt(offX * offX + offY * offY);
        if (curDist > maxDist) {
          node.x = node.baseX + (offX / curDist) * maxDist;
          node.y = node.baseY + (offY / curDist) * maxDist;
        }
      }

      ctx.fillStyle = background;
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        if (node.col < cols - 1) {
          const right = nodes[i + 1];
          const dx = right.x - node.x;
          const dy = right.y - node.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          const strain = Math.abs(len - spacing) / spacing;
          const activeT = Math.min(1, strain * 3.5);

          const r = Math.round(cNode.r + (cActive.r - cNode.r) * activeT);
          const g = Math.round(cNode.g + (cActive.g - cNode.g) * activeT);
          const b = Math.round(cNode.b + (cActive.b - cNode.b) * activeT);
          const alpha = 0.2 + activeT * 0.65;

          ctx.lineWidth = 1 + activeT * 1.5;
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(right.x, right.y);
          ctx.stroke();
        }

        if (node.row < rows - 1) {
          const bottom = nodes[i + cols];
          const dx = bottom.x - node.x;
          const dy = bottom.y - node.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          const strain = Math.abs(len - spacing) / spacing;
          const activeT = Math.min(1, strain * 3.5);

          const r = Math.round(cNode.r + (cActive.r - cNode.r) * activeT);
          const g = Math.round(cNode.g + (cActive.g - cNode.g) * activeT);
          const b = Math.round(cNode.b + (cActive.b - cNode.b) * activeT);
          const alpha = 0.2 + activeT * 0.65;

          ctx.lineWidth = 1 + activeT * 1.5;
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(bottom.x, bottom.y);
          ctx.stroke();
        }
      }

      if (showNodes) {
        for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i];
          const speed = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
          const energy = Math.min(1, speed / 8);

          const r = Math.round(cNode.r + (cActive.r - cNode.r) * energy);
          const g = Math.round(cNode.g + (cActive.g - cNode.g) * energy);
          const b = Math.round(cNode.b + (cActive.b - cNode.b) * energy);
          const alpha = 0.45 + energy * 0.55;

          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(node.x, node.y, 1.8 + energy * 1.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      rafId = requestAnimationFrame(loop);
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      if (!pointer.active) {
        pointer.prevX = pointer.x;
        pointer.prevY = pointer.y;
      }
      pointer.active = true;
    };

    const onPointerLeave = () => {
      pointer.active = false;
    };

    const onPointerDown = (e: PointerEvent) => {
      if (!pulseOnClick) return;
      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      shockwaves.push({
        x: px,
        y: py,
        radius: 4,
        maxRadius: Math.max(width, height) * 0.85,
        strength: 1.2,
        speed: 9,
        active: true,
      });
      if (shockwaves.length > 5) {
        shockwaves.shift();
      }
    };

    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        isIntersecting = entry.isIntersecting;
        if (isIntersecting && !reducedMotion) {
          lastTime = performance.now();
          cancelAnimationFrame(rafId);
          rafId = requestAnimationFrame(loop);
        } else {
          cancelAnimationFrame(rafId);
        }
      }
    });
    io.observe(container);

    const onReduceMotionChange = (e: MediaQueryListEvent) => {
      reducedMotion = e.matches;
      if (reducedMotion) {
        cancelAnimationFrame(rafId);
        drawStaticFrame();
      } else {
        lastTime = performance.now();
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(loop);
      }
    };

    mediaQuery.addEventListener("change", onReduceMotionChange);
    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerleave", onPointerLeave);
    container.addEventListener("pointerdown", onPointerDown);

    resize();
    if (!reducedMotion) {
      rafId = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      io.disconnect();
      mediaQuery.removeEventListener("change", onReduceMotionChange);
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerleave", onPointerLeave);
      container.removeEventListener("pointerdown", onPointerDown);
    };
  }, [
    background,
    nodeColor,
    activeColor,
    spacing,
    springTension,
    damping,
    reach,
    impulse,
    pulseOnClick,
    showNodes,
  ]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        backgroundColor: background,
        ...style,
      }}
      className={className}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          display: "block",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
