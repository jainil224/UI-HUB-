/**
 * Visionary Orb Hero — UI HUB
 *
 * Luxury cinematic wellness hero on a deep obsidian stage. A dusty-rose particle
 * orb rests inside a photographic cupped hand under a single confined top-center
 * horizon filament, framed by editorial serif typography, a floating glass nav,
 * and a static frosted-glass recommendation HUD.
 *
 * Fully self-contained: the spec's `Hero/` module folder is collapsed into this
 * one file so the single-file Code tab can ship the exact production source, and
 * the WebGL orb is inlined rather than imported for the same reason. It exposes
 * the same prop surface the spec's `ParticleSphere` does, so the call site below
 * reads exactly as the design calls for.
 */

import * as React from "react";
import * as THREE from "three";
import {
  Circle,
  CheckCircle2,
  Droplets,
  Footprints,
  Moon,
  Sparkles,
} from "lucide-react";

/* ------------------------------------------------------------------ *
 * Types
 * ------------------------------------------------------------------ */

interface HeroBackgroundProps {
  className?: string;
}

interface HeroNavbarProps {
  className?: string;
  onOpenAuth?: () => void;
}

interface HeroContentProps {
  className?: string;
}

interface RecommendationCardProps {
  className?: string;
}

interface HeroProps {
  className?: string;
}

interface ParticleSphereProps {
  particlesCount?: number;
  particleScale?: number;
  speed?: number;
  scale?: number;
  drag?: boolean;
  dragSpeed?: number;
  smoothing?: number;
  cursorOn?: boolean;
  cursorRadiusUI?: number;
  cursorStrengthUI?: number;
  clickForce?: number;
  sphereColor?: string;
  className?: string;
}

interface HabitItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  completed: boolean;
}

/* ------------------------------------------------------------------ *
 * Assets
 * ------------------------------------------------------------------ */

const HAND_IMAGE =
  "https://res.cloudinary.com/dgqd54pbl/image/upload/v1790671314/ChatGPT_Image_Sep_29_2026_02_07_08_PM_vshk0k.png";

/* ------------------------------------------------------------------ *
 * HeroBackground
 * ------------------------------------------------------------------ */

const HeroBackground: React.FC<HeroBackgroundProps> = ({ className }) => {
  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none select-none bg-[#080305] ${className ?? ""}`}
    >
      {/* 1. Base Dark Obsidian Background */}
      <div className="absolute inset-0 bg-[#080305]" />

      {/* 2. Top Center Architectural Glowing Light Bar & Downward Curtain */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center z-10 pointer-events-none">
        {/* Compact horizontal core light line strictly centered above the ball */}
        <div
          className="w-[240px] sm:w-[300px] md:w-[360px] h-[3px] rounded-full"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(226, 180, 189, 0.5) 20%, #FFFFFF 50%, rgba(226, 180, 189, 0.5) 80%, transparent 100%)",
            boxShadow:
              "0 0 14px #FFFFFF, 0 0 28px #E2B4BD, 0 0 55px rgba(226, 180, 189, 0.8), 0 0 85px rgba(183, 109, 126, 0.5)",
          }}
        />

        {/* Downward focused spotlight beam concentrated above the ball */}
        <div
          className="w-[260px] sm:w-[320px] md:w-[380px] h-[280px] blur-2xl opacity-80 -mt-1"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, rgba(255, 235, 240, 0.85) 0%, rgba(226, 180, 189, 0.5) 35%, rgba(183, 109, 126, 0.15) 65%, transparent 85%)",
          }}
        />

        {/* Atmospheric soft cone directly above the ball */}
        <div
          className="w-[300px] sm:w-[380px] md:w-[440px] h-72 blur-[70px] opacity-40 -mt-20"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, rgba(226, 180, 189, 0.45) 0%, transparent 75%)",
          }}
        />
      </div>

      {/* 3. Central Ambient Lighting Behind Sphere */}
      <div className="absolute inset-0">
        <div
          className="absolute top-[32%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[580px] h-[580px] sm:w-[720px] sm:h-[720px] rounded-full pointer-events-none blur-[95px] opacity-70"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(226, 180, 189, 0.3) 0%, rgba(183, 109, 126, 0.14) 40%, transparent 72%)",
          }}
        />
        <div
          className="absolute top-[65%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[620px] h-[480px] rounded-full pointer-events-none blur-[100px] opacity-45"
          style={{
            background:
              "radial-gradient(ellipse at 50% 50%, rgba(183, 109, 126, 0.22) 0%, rgba(8, 3, 5, 0.05) 50%, transparent 80%)",
          }}
        />
      </div>

      {/* 4. Film Grain Texture */}
      <div
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.7) 1px, transparent 0)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* 5. Edge Vignette keeping corners cinematic black */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, transparent 45%, rgba(8, 3, 5, 0.8) 85%, #080305 100%)",
        }}
      />
    </div>
  );
};

/* ------------------------------------------------------------------ *
 * Orb depth ramp
 * ------------------------------------------------------------------ */

const ORB_TOP = new THREE.Color("#FFF0F3");
const ORB_BASE = new THREE.Color("#C27586");

/* ------------------------------------------------------------------ *
 * ParticleSphere — instanced orb, inlined
 * ------------------------------------------------------------------ */

/**
 * The orb runs four forces per particle, summed into the final position:
 *
 *   1. Hover repulsion — screen-space, ported from the Interactive Background
 *      Particle Sphere. Every particle is projected into canvas pixels; if it
 *      lands within `cursorRadiusUI` px of the pointer and sits on the camera-
 *      facing hemisphere (`worldPos.z > 0`), it is pushed radially away from the
 *      cursor in the view plane. The pointer carves a soft void rather than
 *      swelling the surface. A click still fires a one-shot radial velocity
 *      burst inside 1.5 x the sphere radius that decays by 0.95 per frame.
 *   2. Cursor physics — displacement is bled off by friction (0.94) and a
 *      spring return (0.015 * speed) per frame, exactly as the Particle Sphere
 *      does, so the void relaxes smoothly when the pointer leaves.
 *   3. Idle rotation — `speed` advances the target yaw every frame while not
 *      dragging, with a 0.94 velocity decay carrying the throw momentum, and
 *      `smoothing` sets how fast the mesh chases the target orientation.
 *
 * Camera and sizing are deliberately plain: fov 45, camera z 24, and
 * sphereRadius = scale * 0.45. The projected sphere diameter as a fraction of
 * its box is tan(asin(R / 24)) / tan(fov / 2), so `scale` is the size knob and
 * the box stays an honest proxy for the orb's on-screen size. At this
 * component's own default (scale 9) that fraction is 41%, which is why a
 * container that frames the orb tightly wants a higher `scale` passed in — the
 * hero here solves 16.9 for its 325px box. There is no overflow canvas and no
 * FOV compensation; the sphere is drawn at the container's exact pixel size, so
 * `cursorRadiusUI` is read directly in container pixels.
 */
const ParticleSphere: React.FC<ParticleSphereProps> = ({
  particlesCount = 8500,
  particleScale = 4.0,
  speed = 22,
  scale = 9.0,
  drag = true,
  dragSpeed = 6,
  smoothing = 7.5,
  cursorOn = true,
  cursorRadiusUI = 75,
  cursorStrengthUI = 12,
  clickForce = 6,
  sphereColor = "#E2B4BD",
  className = "",
}) => {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const width = container.clientWidth || 300;
    const height = container.clientHeight || 300;

    // 1. Scene & camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 24;

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 3. Fibonacci spherical lattice
    const sphereRadius = scale * 0.45;
    const particleSize = particleScale * 0.055;
    const basePositions: THREE.Vector3[] = new Array(particlesCount);
    const displacements: THREE.Vector3[] = new Array(particlesCount);
    const scatterVelocities: THREE.Vector3[] = new Array(particlesCount);

    for (let i = 0; i < particlesCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / particlesCount);
      const theta = Math.sqrt(particlesCount * Math.PI) * phi;
      const posX = Math.cos(theta) * Math.sin(phi) * sphereRadius;
      const posY = Math.sin(theta) * Math.sin(phi) * sphereRadius;
      const posZ = Math.cos(phi) * sphereRadius;
      basePositions[i] = new THREE.Vector3(posX, posY, posZ);
      displacements[i] = new THREE.Vector3(0, 0, 0);
      scatterVelocities[i] = new THREE.Vector3(0, 0, 0);
    }

    // 4. Instanced particles with additive glow
    const geometry = new THREE.SphereGeometry(particleSize * 0.16, 6, 6);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.95,
    });
    const particles = new THREE.InstancedMesh(
      geometry,
      material,
      particlesCount
    );

    const matrix = new THREE.Matrix4();
    for (let i = 0; i < particlesCount; i++) {
      const base = basePositions[i];
      matrix.setPosition(base.x, base.y, base.z);
      particles.setMatrixAt(i, matrix);
    }
    particles.instanceMatrix.needsUpdate = true;

    // 5. Depth ramp: #FFF0F3 at the top pole, sphereColor at the equator,
    // #C27586 at the base.
    const baseColorObj = new THREE.Color(sphereColor);
    const instanceColors = new Float32Array(particlesCount * 3);
    const tempCol = new THREE.Color();
    for (let i = 0; i < particlesCount; i++) {
      const base = basePositions[i];
      const t = Math.max(0, Math.min(1, (base.y / sphereRadius + 1) / 2));
      if (t > 0.5) {
        tempCol.lerpColors(baseColorObj, ORB_TOP, (t - 0.5) * 2);
      } else {
        tempCol.lerpColors(ORB_BASE, baseColorObj, t * 2);
      }
      instanceColors[i * 3] = tempCol.r;
      instanceColors[i * 3 + 1] = tempCol.g;
      instanceColors[i * 3 + 2] = tempCol.b;
    }
    const colorAttr = new THREE.InstancedBufferAttribute(instanceColors, 3);
    particles.instanceColor = colorAttr;
    colorAttr.needsUpdate = true;

    const group = new THREE.Group();
    group.add(particles);
    scene.add(group);

    // 6. Interaction state
    const rotation = { x: 0, y: 0 };
    const targetRotation = { x: 0, y: 0 };
    const velocity = { x: 0, y: 0 };
    let isDragging = false;
    let previousPointer = { x: 0, y: 0 };

    // Pointer position in canvas pixels (for the screen-space hover void).
    const cursorPx = { x: 0, y: 0 };
    let cursorActive = false;

    const raycaster = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const localCursor = new THREE.Vector3(9999, 9999, 9999);

    const updateCursor3DPosition = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      cursorPx.x = clientX - rect.left;
      cursorPx.y = clientY - rect.top;
      cursorActive = true;
      const ndcX = ((clientX - rect.left) / rect.width) * 2 - 1;
      const ndcY = -(((clientY - rect.top) / rect.height) * 2 - 1);
      raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);
      const worldIntersection = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, worldIntersection);
      if (worldIntersection) {
        localCursor.copy(worldIntersection);
        group.worldToLocal(localCursor);
      }
    };

    // 7. Pointer listeners
    const onPointerDown = (e: PointerEvent) => {
      if (!drag) return;
      updateCursor3DPosition(e.clientX, e.clientY);
      isDragging = true;
      previousPointer = { x: e.clientX, y: e.clientY };
      canvas.setPointerCapture(e.pointerId);

      const clickPush = clickForce * 0.2;
      for (let i = 0; i < particlesCount; i++) {
        const base = basePositions[i];
        const dx = base.x - localCursor.x;
        const dy = base.y - localCursor.y;
        const dz = base.z - localCursor.z;
        const distSq = dx * dx + dy * dy + dz * dz;
        if (distSq < sphereRadius * sphereRadius * 1.5) {
          const dist = Math.max(0.1, Math.sqrt(distSq));
          scatterVelocities[i].add(
            new THREE.Vector3(
              (dx / dist) * clickPush,
              (dy / dist) * clickPush,
              (dz / dist) * clickPush
            )
          );
        }
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      updateCursor3DPosition(e.clientX, e.clientY);
      if (isDragging) {
        const deltaX = e.clientX - previousPointer.x;
        const deltaY = e.clientY - previousPointer.y;
        previousPointer = { x: e.clientX, y: e.clientY };
        const factor = (dragSpeed * 0.001) / Math.max(1, smoothing * 0.2);
        targetRotation.y += deltaX * factor;
        targetRotation.x += deltaY * factor;
        velocity.x = deltaY * factor;
        velocity.y = deltaX * factor;
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      isDragging = false;
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {
        /* pointer already released */
      }
    };

    const onPointerLeave = () => {
      cursorActive = false;
      isDragging = false;
      localCursor.set(9999, 9999, 9999);
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    canvas.addEventListener("pointerleave", onPointerLeave);

    // 8. Animation loop
    const tempMatrix = new THREE.Matrix4();
    const cameraRight = new THREE.Vector3();
    const cameraUp = new THREE.Vector3();
    const inverseGroupMatrix = new THREE.Matrix4();
    const worldPos = new THREE.Vector3();
    const projectedVec = new THREE.Vector3();
    const localRepulsion = new THREE.Vector3();

    // Particle Sphere cursor physics, in the same units it uses.
    const CURSOR_RETURN = 0.015;
    const speedN = speed / 10;
    const cursorRadiusPx = Math.max(0, Math.min(600, cursorRadiusUI));
    const cursorRadSq = cursorRadiusPx * cursorRadiusPx;
    const cursorStrength =
      Math.min(1, Math.max(0, cursorStrengthUI / 10)) * 15;
    const dampingSpeed = Math.min(0.15, Math.max(0.03, 1 / (smoothing + 1)));

    // Canvas size in CSS pixels, cached for the screen-space projection.
    let boxWidth = width;
    let boxHeight = height;

    let lastFrameTime = performance.now();
    let animFrameId: number | null = null;

    const animate = () => {
      const now = performance.now();
      const deltaFactor = Math.min(3, (now - lastFrameTime) / (1000 / 60));
      lastFrameTime = now;

      if (!isDragging) {
        targetRotation.y += speed * 0.0001;
        velocity.x *= 0.94;
        velocity.y *= 0.94;
        targetRotation.x += velocity.x;
        targetRotation.y += velocity.y;
      }

      rotation.x += (targetRotation.x - rotation.x) * dampingSpeed;
      rotation.y += (targetRotation.y - rotation.y) * dampingSpeed;
      group.rotation.x = rotation.x;
      group.rotation.y = rotation.y;
      group.updateMatrixWorld(true);

      const frictionFactor = Math.pow(0.94, deltaFactor);
      const returnForce = 1 - CURSOR_RETURN * speedN * deltaFactor;
      const scatterFriction = Math.pow(0.95, deltaFactor);
      const interact = cursorOn && cursorActive;

      if (interact) {
        cameraRight.setFromMatrixColumn(camera.matrixWorld, 0).normalize();
        cameraUp.setFromMatrixColumn(camera.matrixWorld, 1).normalize();
        inverseGroupMatrix.copy(group.matrixWorld).invert();
      }

      for (let i = 0; i < particlesCount; i++) {
        const base = basePositions[i];
        const curDisp = displacements[i];
        const scatter = scatterVelocities[i];

        if (interact) {
          worldPos.set(
            base.x + curDisp.x,
            base.y + curDisp.y,
            base.z + curDisp.z
          );
          worldPos.applyMatrix4(group.matrixWorld);
          projectedVec.copy(worldPos).project(camera);
          const screenX = (projectedVec.x * 0.5 + 0.5) * boxWidth;
          const screenY = (-projectedVec.y * 0.5 + 0.5) * boxHeight;
          const dx = cursorPx.x - screenX;
          const dy = cursorPx.y - screenY;
          const distSq = dx * dx + dy * dy;

          if (distSq < cursorRadSq && distSq > 0 && worldPos.z > 0) {
            const dist = Math.sqrt(distSq);
            const force = (cursorRadiusPx - dist) / cursorRadiusPx;
            const angle = Math.atan2(dy, dx);
            const repulsion2D = force * cursorStrength * speedN * deltaFactor;

            localRepulsion.set(0, 0, 0);
            localRepulsion.addScaledVector(
              cameraRight,
              -Math.cos(angle) * repulsion2D * 0.01
            );
            localRepulsion.addScaledVector(
              cameraUp,
              Math.sin(angle) * repulsion2D * 0.01
            );
            localRepulsion.applyMatrix4(inverseGroupMatrix);
            curDisp.add(localRepulsion);
          }
        }

        curDisp.multiplyScalar(frictionFactor);
        curDisp.multiplyScalar(returnForce);

        scatter.multiplyScalar(scatterFriction);
        scatter.multiplyScalar(returnForce);
        curDisp.addScaledVector(scatter, deltaFactor * 0.1);

        tempMatrix.setPosition(
          base.x + curDisp.x,
          base.y + curDisp.y,
          base.z + curDisp.z
        );
        particles.setMatrixAt(i, tempMatrix);
      }

      particles.instanceMatrix.needsUpdate = true;
      renderer.render(scene, camera);
      animFrameId = requestAnimationFrame(animate);
    };

    animFrameId = requestAnimationFrame(animate);

    const handleResize = () => {
      const w = container.clientWidth || 300;
      const h = container.clientHeight || 300;
      boxWidth = w;
      boxHeight = h;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animFrameId) cancelAnimationFrame(animFrameId);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [
    particlesCount,
    particleScale,
    speed,
    scale,
    drag,
    dragSpeed,
    smoothing,
    cursorOn,
    cursorRadiusUI,
    cursorStrengthUI,
    clickForce,
    sphereColor,
  ]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full flex items-center justify-center select-none ${className}`}
      style={{ touchAction: "none" }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing outline-none"
      />
    </div>
  );
};


/* ------------------------------------------------------------------ *
 * HeroNavbar
 * ------------------------------------------------------------------ */

const NAV_LINKS = ["Home", "Service", "Product", "About Us"] as const;

const HeroNavbar: React.FC<HeroNavbarProps> = ({ className, onOpenAuth }) => {
  const [active, setActive] = React.useState<string>("Home");

  return (
    <nav
      className={`pt-6 px-6 sm:px-10 lg:px-14 flex items-center justify-between w-full z-30 ${className ?? ""}`}
    >
      {/* Left Brand */}
      <div className="group pointer-events-auto flex items-center gap-2.5">
        <span
          className="text-base sm:text-lg text-[#E2B4BD] transition-transform duration-500 ease-out group-hover:rotate-45"
          style={{ textShadow: "0 0 8px rgba(226, 180, 189, 0.7)" }}
        >
          ✦
        </span>
        <span className="text-white text-base sm:text-lg font-medium tracking-tight font-sans">
          Visionary
        </span>
      </div>

      {/* Center Floating Glass Pill */}
      <div className="hidden md:flex items-center gap-1 px-1.5 py-1 rounded-xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md pointer-events-auto">
        {NAV_LINKS.map((link) => {
          const isActive = active === link;
          return (
            <button
              key={link}
              type="button"
              onClick={() => setActive(link)}
              aria-current={isActive ? "page" : undefined}
              className={
                isActive
                  ? "text-white bg-white/[0.08] shadow-[0_0_12px_rgba(226,180,189,0.2)] border border-white/[0.06] text-xs px-3.5 py-1.5 rounded-lg transition-colors"
                  : "text-slate-300 hover:text-white transition-colors text-xs px-3.5 py-1.5 rounded-lg"
              }
            >
              {link}
            </button>
          );
        })}
      </div>

      {/* Right Action Buttons */}
      <div className="flex items-center gap-2.5 pointer-events-auto">
        <button
          type="button"
          onClick={onOpenAuth}
          className="text-xs font-medium text-white px-4 py-1.5 rounded-lg border border-white/10 hover:bg-white/[0.08] transition-colors"
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={onOpenAuth}
          className="bg-white text-[#080305] px-4 py-1.5 text-xs font-semibold rounded-lg shadow-[0_0_20px_rgba(255,255,255,0.35)] hover:bg-slate-100 active:scale-95 transition-all"
        >
          Join
        </button>
      </div>
    </nav>
  );
};

/* ------------------------------------------------------------------ *
 * HeroContent
 * ------------------------------------------------------------------ */

const PARTNERS = [
  { glyph: "✦", name: "Typely" },
  { glyph: "✱", name: "Framex" },
  { glyph: "❄", name: "Webora" },
  { glyph: "✳", name: "Logiqo" },
  { glyph: "❖", name: "Designo" },
] as const;

const HeroContent: React.FC<HeroContentProps> = ({ className }) => {
  return (
    <div className={className}>
      <h1 className="font-serif text-white font-normal tracking-tight text-balance leading-[1.1] drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)] text-[34px] sm:text-[44px] lg:text-[54px]">
        Your Everyday
        <br />
        <span className="italic font-light text-slate-100">Wellness</span>{" "}
        Partner
      </h1>

      <p className="text-[13.5px] sm:text-[14.5px] leading-[1.72] text-slate-300/85 font-light max-w-[400px] mt-5">
        Stay on top of your health with a trusted partner by your
        side&mdash;track habits, monitor progress, and receive personalized
        guidance for a balanced, healthier life every day.
      </p>

      <div className="mt-8 sm:mt-10 pt-4 border-t border-white/[0.08] flex items-center flex-wrap gap-x-5 gap-y-2.5">
        {PARTNERS.map((p) => (
          <span
            key={p.name}
            className="group inline-flex items-center gap-1.5"
          >
            <span className="text-[#E2B4BD] text-xs leading-none">
              {p.glyph}
            </span>
            <span className="text-xs text-slate-400 group-hover:text-white transition-colors">
              {p.name}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ *
 * RecommendationCard
 * ------------------------------------------------------------------ */

const RecommendationCard: React.FC<RecommendationCardProps> = ({
  className,
}) => {
  const [items, setItems] = React.useState<HabitItem[]>([
    {
      id: "walk",
      label: "20 min walk",
      icon: <Footprints className="w-3.5 h-3.5 text-[#E2B4BD]" />,
      completed: false,
    },
    {
      id: "water",
      label: "Drink 600ml water",
      icon: <Droplets className="w-3.5 h-3.5 text-[#FFCCD5]" />,
      completed: true,
    },
    {
      id: "sleep",
      label: "Sleep before 10 PM",
      icon: <Moon className="w-3.5 h-3.5 text-[#E2B4BD]" />,
      completed: false,
    },
  ]);

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const completedCount = items.filter((i) => i.completed).length;

  return (
    <div
      className={`relative select-none pointer-events-auto ${className ?? ""}`}
    >
      <div
        className="w-[210px] sm:w-[230px] p-4 rounded-2xl"
        style={{
          background: "rgba(20, 8, 12, 0.75)",
          border: "1px solid rgba(226, 180, 189, 0.18)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow:
            "0 8px 32px 0 rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)",
        }}
      >
        {/* Top Header Badge */}
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-[#E2B4BD]/15 flex items-center justify-center border border-[#E2B4BD]/30">
              <Sparkles className="w-2.5 h-2.5 text-[#E2B4BD]" />
            </div>
            <span className="text-[11px] font-semibold tracking-wider text-slate-200">
              Recommendation
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#E2B4BD]/85 tabular-nums">
            {completedCount}/{items.length}
          </span>
        </div>

        {/* Habit List */}
        <ul className="space-y-2.5">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => toggleItem(item.id)}
                role="checkbox"
                aria-checked={item.completed}
                className="group/item w-full flex items-center justify-between text-left p-1 -mx-1 rounded-md transition-colors hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#E2B4BD]"
              >
                <div className="flex items-center gap-2.5">
                  <div className="opacity-85 group-hover/item:opacity-100 transition-opacity">
                    {item.icon}
                  </div>
                  <span
                    className={`text-xs font-normal transition-all duration-200 ${
                      item.completed
                        ? "text-slate-400 line-through opacity-70"
                        : "text-slate-200 group-hover/item:text-white"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>

                <div className="text-slate-500 group-hover/item:text-[#E2B4BD] transition-colors">
                  {item.completed ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#E2B4BD]" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 opacity-40 group-hover/item:opacity-80" />
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>

        {/* Ambient indicator pill */}
        <div className="mt-3 pt-2 flex items-center justify-between text-[10px] text-slate-400 border-t border-white/[0.06]">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E2B4BD] animate-pulse" />
            Live Sync
          </span>
          <span className="text-slate-500">Today</span>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ *
 * Hero
 * ------------------------------------------------------------------ */

/**
 * The preview stage renders every template inside a fixed 1280x720
 * overflow-hidden box (see TemplatePreviewStage). A min-h-screen hero is taller
 * than that and would clip the wrist fade and the HUD footer, so the height is
 * pinned to the stage and the AI prompts still specify 100vh for a real page.
 */
const STAGE_HEIGHT = 720;

/**
 * Orb / hand arrangement, measured against the 1280x720 stage:
 *
 *   hand container   y 380 -> 680   (bottom-anchored, so ORB_OVERLAP moves the
 *                                   orb down without moving the hand)
 *   orb box          y 115 -> 440
 *   orb sphere       262.0px, centred at y 277.5, so y 147 -> 409
 *   nestle           the sphere's lowest 28.6px sit inside the hand container
 *   orb sphere       x 509 -> 771   (headline text ends at 456, card starts at 970)
 *
 * There is no overflow canvas: the renderer is sized to the box exactly. The
 * repulsion radius is derived from the sphere radius (0.75 * 0.85 * R) and peaks
 * at 0.3 world units of push, which grows the silhouette to 137px from centre
 * against a 162.5px half-box, so displaced particles never reach the element edge.
 *
 * STAGE_LIFT raises the whole hand + orb column off the stage floor. The hand
 * photo is masked to fully transparent by 76% of its own box and its visible
 * content already ended around y 608, so lifting it does not expose a cut-off
 * forearm: it only moves the wrist fade up.
 */
const ORB_BOX = 325;
const HAND_HEIGHT = 300;
const ORB_OVERLAP = 60;
/**
 * `scale` is the orb's only size knob: sphereRadius = scale * 0.45, and the
 * projected diameter as a fraction of ORB_BOX is tan(asin(R / 24)) / tan(fov/2)
 * with fov 45. The component's own default (9) is only 41% of the box and would
 * float clear of the palm, so the hero solves the scale for its box instead:
 *
 *   scale 9.0  ->  R 4.05  ->  134.3px  = 41.3% of the box   (props default)
 *   scale 16.9 ->  R 7.605 ->  262.0px  = 80.6% of the box   (this hero)
 */
const ORB_SCALE = 16.9;
const STAGE_LIFT = 40;

const Hero: React.FC<HeroProps> = ({ className }) => {
  return (
    <div
      className={`visionary-orb-root relative w-full overflow-hidden bg-[#080305] text-white flex flex-col justify-between selection:bg-[#E2B4BD]/30 selection:text-white ${className ?? ""}`}
      style={{ height: STAGE_HEIGHT }}
    >
      {/* 1. Atmospheric Ambient Lighting */}
      <HeroBackground />

      {/* 2. Top Floating Navigation Header */}
      <HeroNavbar onOpenAuth={() => {}} />

      {/* 3. Center Hand & Glowing Particle Sphere Anchor */}
      <div
        className="absolute inset-x-0 z-10 flex justify-center pointer-events-none"
        style={{ bottom: STAGE_LIFT }}
      >
        <div className="relative w-full max-w-[440px] flex flex-col items-center">
          {/* Ambient warm glow washing behind the pair */}
          <div
            className="absolute left-1/2 top-10 -translate-x-1/2 w-[390px] h-[390px] rounded-full blur-3xl pointer-events-none opacity-70"
            style={{
              background:
                "radial-gradient(circle, rgba(226, 180, 189, 0.5) 0%, rgba(183, 109, 126, 0.25) 45%, transparent 75%)",
            }}
          />

          {/* Interactive Particle Sphere, pulled up so it nests in the palm */}
          <div
            className="relative z-20 pointer-events-auto cursor-grab active:cursor-grabbing"
            style={{
              width: ORB_BOX,
              height: ORB_BOX,
              marginBottom: -ORB_OVERLAP,
              filter:
                "drop-shadow(0 0 16px #E2B4BD) drop-shadow(0 0 35px rgba(226, 180, 189, 0.7)) drop-shadow(0 0 75px rgba(183, 109, 126, 0.4))",
            }}
          >
            {/* Luminous corona ring / halo around the sphere */}
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[363px] h-[363px] rounded-full blur-lg pointer-events-none opacity-75"
              style={{
                background:
                  "radial-gradient(circle, transparent 58%, rgba(226, 180, 189, 0.6) 72%, rgba(255, 235, 240, 0.85) 86%, transparent 96%)",
              }}
            />

            {/* Direct spotlight ray falling from above onto the top of the ball */}
            <div
              className="absolute -top-16 left-1/2 -translate-x-1/2 w-[260px] h-[173px] blur-xl pointer-events-none opacity-85"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 0%, rgba(255, 240, 245, 0.85) 0%, rgba(226, 180, 189, 0.45) 45%, transparent 75%)",
              }}
            />

            {/* Core highlight glow */}
            <div
              className="absolute -top-2 left-1/2 -translate-x-1/2 w-[191px] h-[191px] rounded-full blur-xl pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle at 50% 30%, rgba(255, 220, 228, 0.6) 0%, rgba(226, 180, 189, 0.3) 50%, transparent 75%)",
              }}
            />

            <ParticleSphere
              particlesCount={8500}
              particleScale={4.0}
              speed={22}
              scale={ORB_SCALE}
              drag={true}
              dragSpeed={6}
              smoothing={7.5}
              cursorOn={true}
              cursorRadiusUI={75}
              cursorStrengthUI={12}
              clickForce={6}
              sphereColor="#E2B4BD"
            />
          </div>

          {/* User Hand Image — completely static, bottom-anchored */}
          <div
            className="relative z-10 w-full pointer-events-none"
            style={{ height: HAND_HEIGHT }}
          >
            <div className="absolute inset-0 [mask-image:linear-gradient(to_bottom,black_76%,transparent_99%)]">
              <img
                src={HAND_IMAGE}
                alt="Cupped hand cradling the glowing particle sphere"
                className="h-full w-full object-contain object-bottom drop-shadow-[0_4px_30px_rgba(226,180,189,0.35)] brightness-105 contrast-105"
                referrerPolicy="no-referrer"
                loading="eager"
                draggable={false}
              />
            </div>

            {/* Seamless dark blend at the bottom wrist */}
            <div
              className="absolute inset-x-0 bottom-0 h-20"
              style={{
                background:
                  "linear-gradient(to top, #080305 25%, transparent 100%)",
              }}
            />
          </div>
        </div>
      </div>

      {/* 4. Foreground Content Stage */}
      <main className="relative z-20 flex-1 flex flex-col justify-between px-6 sm:px-10 lg:px-14 py-8 lg:py-12 pointer-events-none">
        {/* Left Column: Editorial Headline & Brand Grid */}
        <div className="w-full lg:w-7/12 pointer-events-auto mt-auto mb-10 sm:mb-14 lg:mb-16">
          <HeroContent />
        </div>

        {/* Right Column: Recommendation HUD Card (completely static) */}
        <div className="hidden lg:flex w-full lg:w-5/12 justify-end self-end mb-48 pr-2 xl:pr-6 pointer-events-auto">
          <RecommendationCard />
        </div>

        {/* Mobile View Card Placement */}
        <div className="block lg:hidden w-full flex justify-center mt-6 pb-8 pointer-events-auto">
          <RecommendationCard />
        </div>
      </main>

      <style>{`
        /* Tailwind v4 resolves font-serif / font-sans through these theme
           variables. index.css imports tailwindcss without an @config, so the
           repo's tailwind.config.ts is inert and these would otherwise fall back
           to the default ui-serif / ui-sans stacks. Scoping the override to the
           hero root realises the intended Cormorant Garamond + Plus Jakarta Sans
           pairing without touching the global theme. */
        .visionary-orb-root {
          --font-serif: 'Cormorant Garamond', 'Playfair Display', Georgia, serif;
          --font-sans: 'Plus Jakarta Sans', Inter, ui-sans-serif, system-ui, sans-serif;
        }
      `}</style>
    </div>
  );
};

/* ------------------------------------------------------------------ *
 * Export
 * ------------------------------------------------------------------ */

export default function VisionaryOrbHero({ className }: HeroProps) {
  return <Hero className={className} />;
}
