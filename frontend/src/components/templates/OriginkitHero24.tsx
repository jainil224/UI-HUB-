// Originkit "Hero 24" — Hirefy glass-card globe hero.
// Delivered via `npx originkit@latest add hero-24 --prompt`, then ported from the
// Next.js drop-in to this Vite app: "use client" directives, @/ alias imports,
// the Next inline-SSR scale script, the `desktop-sm:` theme breakpoint, and the
// section CSS file are all inlined so this stays one self-contained module.

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react';
import {
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    SphereGeometry,
    MeshBasicMaterial,
    Color,
    Mesh,
    Group,
    InstancedMesh,
    Matrix4,
    Raycaster,
    Vector2,
    TubeGeometry,
    CatmullRomCurve3,
    Vector3,
    CanvasTexture,
} from 'three';
import { geoEquirectangular, geoPath } from 'd3-geo';



const HERO_24_CSS = `
.animate-hero-reveal { animation: hero-reveal 300ms cubic-bezier(0.215, 0.61, 0.355, 1) both; }
.animate-hand-slide-in-left { animation: hand-slide-in-left 900ms cubic-bezier(0.16, 1, 0.3, 1) both; }
.animate-hand-slide-in-right { animation: hand-slide-in-right 900ms cubic-bezier(0.16, 1, 0.3, 1) both; }
@keyframes hero-reveal {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes hand-slide-in-left {
  from { opacity: 0; transform: translateX(-30%); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes hand-slide-in-right {
  from { opacity: 0; transform: translateX(30%); }
  to { opacity: 1; transform: translateX(0); }
}
@media (prefers-reduced-motion: reduce) {
  .animate-hero-reveal, .animate-hand-slide-in-left, .animate-hand-slide-in-right {
    animation-delay: 0ms;
    animation-duration: 1ms;
    animation-fill-mode: both;
  }
  @keyframes hero-reveal { from { opacity: 0; transform: none; } to { opacity: 1; transform: none; } }
  @keyframes hand-slide-in-left { from { opacity: 0; transform: none; } to { opacity: 1; transform: none; } }
  @keyframes hand-slide-in-right { from { opacity: 0; transform: none; } to { opacity: 1; transform: none; } }
}
`;



type Rgba = { r: number; g: number; b: number; a: number };

function parseColorToRgba(input: string): Rgba {
    if (!input || input.trim() === "") return { r: 0, g: 0, b: 0, a: 0 };
    const str = input.trim();
    const rgbaMatch = str.match(
        /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)/i
    );
    if (rgbaMatch) {
        const r = Math.max(0, Math.min(255, parseFloat(rgbaMatch[1]))) / 255;
        const g = Math.max(0, Math.min(255, parseFloat(rgbaMatch[2]))) / 255;
        const b = Math.max(0, Math.min(255, parseFloat(rgbaMatch[3]))) / 255;
        const a =
            rgbaMatch[4] !== undefined
                ? Math.max(0, Math.min(1, parseFloat(rgbaMatch[4])))
                : 1;
        return { r, g, b, a };
    }
    const hex = str.replace(/^#/, "");
    if (hex.length === 8) {
        return {
            r: parseInt(hex.slice(0, 2), 16) / 255,
            g: parseInt(hex.slice(2, 4), 16) / 255,
            b: parseInt(hex.slice(4, 6), 16) / 255,
            a: parseInt(hex.slice(6, 8), 16) / 255,
        };
    }
    if (hex.length === 6) {
        return {
            r: parseInt(hex.slice(0, 2), 16) / 255,
            g: parseInt(hex.slice(2, 4), 16) / 255,
            b: parseInt(hex.slice(4, 6), 16) / 255,
            a: 1,
        };
    }
    if (hex.length === 4) {
        return {
            r: parseInt(hex[0] + hex[0], 16) / 255,
            g: parseInt(hex[1] + hex[1], 16) / 255,
            b: parseInt(hex[2] + hex[2], 16) / 255,
            a: parseInt(hex[3] + hex[3], 16) / 255,
        };
    }
    if (hex.length === 3) {
        return {
            r: parseInt(hex[0] + hex[0], 16) / 255,
            g: parseInt(hex[1] + hex[1], 16) / 255,
            b: parseInt(hex[2] + hex[2], 16) / 255,
            a: 1,
        };
    }
    return { r: 0, g: 0, b: 0, a: 1 };
}

function mapLinear(
    value: number,
    inMin: number,
    inMax: number,
    outMin: number,
    outMax: number
): number {
    if (inMax === inMin) return outMin;
    const t = (value - inMin) / (inMax - inMin);
    return outMin + t * (outMax - outMin);
}

function mapSpeedUiToInternal(ui: number): number {
    if (ui === 0) return 0;
    const clamped = Math.max(0, Math.min(10, ui));
    return mapLinear(clamped, 0, 10, 0, 0.9);
}
function mapDensityUiToSpacing(ui: number): number {
    const clamped = Math.max(1, Math.min(10, ui));
    return mapLinear(clamped, 1, 10, 24, 8);
}
function mapScaleUiToMultiplier(ui: number): number {
    const clamped = Math.max(1, Math.min(20, ui));
    return mapLinear(clamped, 1, 20, 0.2, 2);
}
function mapDotSizeUiToMultiplier(ui: number): number {
    const clamped = Math.max(1, Math.min(10, ui));
    return mapLinear(clamped, 1, 10, 0.1, 0.5);
}
function mapMarkerDotSizeUiToMultiplier(ui: number): number {
    const clamped = Math.max(0, Math.min(100, ui));
    return mapLinear(clamped, 0, 100, 0.1, 2.5);
}
function normalizeSmoothing(ui: number): number {
    return Math.max(0, Math.min(1, ui / 10));
}
function mapDragSpeedUiToSensitivity(ui: number): number {
    return mapLinear(Math.max(0, Math.min(10, ui)), 0, 10, 0.001, 0.02);
}
function mapDetailToStepSize(ui: number): number {
    const clamped = Math.max(1, Math.min(10, ui));
    return mapLinear(clamped, 1, 10, 10, 1);
}

function simplifyRing(ring: number[][], detail: number): number[][] {
    if (ring.length < 2) return ring;
    if (detail >= 10) return ring;
    const stepSize = Math.max(1, Math.floor(mapDetailToStepSize(detail)));
    const simplified: number[][] = [];
    simplified.push(ring[0]);
    for (let i = stepSize; i < ring.length - 1; i += stepSize) {
        const idx = Math.min(i, ring.length - 1);
        simplified.push(ring[idx]);
    }
    const lastPoint = ring[ring.length - 1];
    const firstPoint = ring[0];
    const isClosed =
        Math.abs(lastPoint[0] - firstPoint[0]) < 1e-4 &&
        Math.abs(lastPoint[1] - firstPoint[1]) < 1e-4;
    if (!isClosed) {
        simplified.push(lastPoint);
    }
    return simplified.length >= 2 ? simplified : ring;
}

function latLngToPosition(
    lat: number,
    lng: number
): { x: number; y: number; z: number } {
    const latRad = lat * (Math.PI / 180);
    const lngRad = lng * (Math.PI / 180);
    const x = Math.cos(latRad) * Math.sin(lngRad);
    const y = Math.sin(latRad);
    const z = Math.cos(latRad) * Math.cos(lngRad);
    return { x, y, z };
}

interface Marker {
    lat: number;
    lng: number;
}
interface MarkerConfig {
    markers: Marker[];
    color: string;
    size: number;
}
interface DotsConfig {
    color: string;
    size: number;
    density: number;
    allDots: boolean;
}
interface GlobeProps {
    speed?: number;
    smoothing?: number;
    dots?: DotsConfig;
    fill?: "dots" | "solid";
    fillColor?: string;
    scale?: number;
    stopOnHover?: boolean;
    markerConfig?: MarkerConfig;
    direction?: "left" | "right";
    initialLatitude?: number;
    initialLongitude?: number;
    oceanColor?: string;
    outlineColor?: string;
    showOutline?: boolean;
    graticuleColor?: string;
    showGrid?: boolean;
    outlineWidth?: number;
    dragSpeed?: number;
    detail?: number;
    style?: CSSProperties;
}

const EMPTY_MARKER_CONFIG: MarkerConfig = { markers: [], color: "#00f7ff", size: 40 };
const DEFAULT_DOTS_CONFIG: DotsConfig = { color: "#ffffff", size: 5, density: 8, allDots: false };

function Globe({
    speed = 2,
    smoothing = 8,
    dots = DEFAULT_DOTS_CONFIG,
    fill = "dots",
    fillColor = "#ffffff",
    scale = 8,
    stopOnHover = true,
    markerConfig = EMPTY_MARKER_CONFIG,
    direction = "left",
    initialLatitude = 23,
    initialLongitude = -23,
    oceanColor = "#000000",
    outlineColor = "#ffffff",
    showOutline = true,
    graticuleColor = "#D4D4D4",
    showGrid = true,
    outlineWidth = 1,
    dragSpeed = 5,
    detail = 5,
    style,
}: GlobeProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);

    const dotColor = dots.color;
    const dotSize = dots.size;
    const density = dots.density;
    const allDots = dots.allDots;
    const gridWidth = 1;
    const smoothingN = normalizeSmoothing(smoothing);

    const baseRotationSpeed = mapSpeedUiToInternal(speed);
    const rotationSpeed =
        direction === "left" ? -baseRotationSpeed : baseRotationSpeed;
    const dotSpacing = mapDensityUiToSpacing(density);
    const dotSizeMultiplier = mapDotSizeUiToMultiplier(dotSize);
    const markerRadiusMultiplier = mapMarkerDotSizeUiToMultiplier(
        markerConfig.size
    );
    const scaleMultiplier = mapScaleUiToMultiplier(scale);

    useEffect(() => {
        if (!containerRef.current) return;
        const container = containerRef.current;
        let cancelled = false;
        const containerWidth =
            container.clientWidth || container.offsetWidth || 800;
        const containerHeight =
            container.clientHeight || container.offsetHeight || 600;

        const scene = new Scene();
        const camera = new PerspectiveCamera(
            50,
            containerWidth / containerHeight,
            0.1,
            1e3
        );
        const baseRadius = 1;
        const globeRadius = baseRadius * scaleMultiplier;
        const cameraDistance = 2.5 / scaleMultiplier;
        camera.position.set(0, 0, cameraDistance);
        camera.lookAt(0, 0, 0);

        let renderer: WebGLRenderer;
        try {
            renderer = new WebGLRenderer({ antialias: true, alpha: true });
        } catch {
            if (!cancelled) setError("WebGL is unavailable in this browser");
            return;
        }
        renderer.setSize(containerWidth, containerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.outputColorSpace = "srgb";
        const canvas = renderer.domElement;
        canvas.style.position = "absolute";
        canvas.style.inset = "0";
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.style.display = "block";
        canvas.style.opacity = "0";
        canvas.style.visibility = "hidden";
        container.appendChild(canvas);

        const resolvedOceanColor = oceanColor;
        const resolvedOutlineColor = outlineColor;
        const resolvedDotColor = dotColor;
        const resolvedMarkerColor = markerConfig.color;
        const resolvedGraticuleColor = graticuleColor;
        const resolvedFillColor = fillColor;
        const oceanRgba = parseColorToRgba(resolvedOceanColor);
        const outlineRgba = parseColorToRgba(resolvedOutlineColor);
        const dotRgba = parseColorToRgba(resolvedDotColor);
        const markerRgba = parseColorToRgba(resolvedMarkerColor);
        const graticuleRgba = parseColorToRgba(resolvedGraticuleColor);
        const fillRgba = parseColorToRgba(resolvedFillColor);
        void markerRgba;

        const oceanGeometry = new SphereGeometry(globeRadius, 64, 64);
        const oceanColorObj = resolvedOceanColor
            ? new Color(resolvedOceanColor)
            : new Color(0, 0, 0);
        const oceanMaterial = new MeshBasicMaterial({
            color: oceanColorObj,
            transparent: oceanRgba.a < 1 || oceanRgba.a === 0,
            opacity: oceanRgba.a,
        });
        const oceanMesh = new Mesh(oceanGeometry, oceanMaterial);
        scene.add(oceanMesh);

        let globeOutlineMesh: Mesh | null = null;
        if (showOutline && outlineColor && outlineRgba.a > 0) {
            const outlinePositions: number[] = [];
            const segments = 128;
            for (let i = 0; i <= segments; i++) {
                const angle = (i / segments) * Math.PI * 2;
                const x = Math.cos(angle) * globeRadius;
                const y = Math.sin(angle) * globeRadius;
                const z = 0;
                outlinePositions.push(x, y, z);
            }
            const outlinePoints: Vector3[] = [];
            for (let i = 0; i < outlinePositions.length; i += 3) {
                outlinePoints.push(
                    new Vector3(
                        outlinePositions[i],
                        outlinePositions[i + 1],
                        outlinePositions[i + 2]
                    )
                );
            }
            if (outlinePoints.length >= 2) {
                outlinePoints.push(outlinePoints[0].clone());
                const outlineColorObj = new Color(resolvedOutlineColor);
                const outlineMaterial = new MeshBasicMaterial({
                    color: outlineColorObj,
                    transparent: outlineRgba.a < 1,
                    opacity: outlineRgba.a,
                });
                const curve = new CatmullRomCurve3(outlinePoints);
                const radius = (outlineWidth / 10) * 0.01;
                const tubeGeometry = new TubeGeometry(
                    curve,
                    outlinePoints.length * 2,
                    radius,
                    8,
                    false
                );
                globeOutlineMesh = new Mesh(tubeGeometry, outlineMaterial);
            }
        }
        void globeOutlineMesh;

        const continentOutlineGroup = new Group();

        const graticuleGroup = new Group();
        if (showGrid && resolvedGraticuleColor && graticuleRgba.a > 0) {
            const graticuleColorObj = resolvedGraticuleColor
                ? new Color(resolvedGraticuleColor)
                : new Color(1, 1, 1);
            const graticuleMaterial = new MeshBasicMaterial({
                color: graticuleColorObj,
                transparent: graticuleRgba.a < 1 || graticuleRgba.a === 0,
                opacity: graticuleRgba.a,
            });
            const gridSpacing = 15;
            for (let lat = -90; lat <= 90; lat += gridSpacing) {
                const positions: number[] = [];
                const segments = 64;
                for (let i = 0; i <= segments; i++) {
                    const lng = (i / segments) * 360 - 180;
                    const pos = latLngToPosition(lat, lng);
                    positions.push(
                        pos.x * globeRadius,
                        pos.y * globeRadius,
                        pos.z * globeRadius
                    );
                }
                if (positions && positions.length >= 6) {
                    const points: Vector3[] = [];
                    for (let i = 0; i < positions.length; i += 3) {
                        points.push(
                            new Vector3(
                                positions[i],
                                positions[i + 1],
                                positions[i + 2]
                            )
                        );
                    }
                    if (points.length >= 2) {
                        const curve = new CatmullRomCurve3(points);
                        const radius = (gridWidth / 10) * 0.01;
                        const tubeGeometry = new TubeGeometry(
                            curve,
                            points.length * 2,
                            radius,
                            8,
                            false
                        );
                        const tubeMesh = new Mesh(
                            tubeGeometry,
                            graticuleMaterial
                        );
                        tubeMesh.renderOrder = 0;
                        graticuleGroup.add(tubeMesh);
                    }
                }
            }
            for (let lng = -180; lng < 180; lng += gridSpacing) {
                const positions: number[] = [];
                const segments = 64;
                for (let i = 0; i <= segments; i++) {
                    const lat = (i / segments) * 180 - 90;
                    const pos = latLngToPosition(lat, lng);
                    positions.push(
                        pos.x * globeRadius,
                        pos.y * globeRadius,
                        pos.z * globeRadius
                    );
                }
                if (positions && positions.length >= 6) {
                    const points: Vector3[] = [];
                    for (let i = 0; i < positions.length; i += 3) {
                        points.push(
                            new Vector3(
                                positions[i],
                                positions[i + 1],
                                positions[i + 2]
                            )
                        );
                    }
                    if (points.length >= 2) {
                        const curve = new CatmullRomCurve3(points);
                        const radius = (gridWidth / 10) * 0.01;
                        const tubeGeometry = new TubeGeometry(
                            curve,
                            points.length * 2,
                            radius,
                            8,
                            false
                        );
                        const tubeMesh = new Mesh(
                            tubeGeometry,
                            graticuleMaterial
                        );
                        tubeMesh.renderOrder = 0;
                        graticuleGroup.add(tubeMesh);
                    }
                }
            }
        }

        let dotInstances: InstancedMesh | Mesh | null = null;
        let markerMeshes: Mesh[] = [];

        const buildDotField = (
            onLand: ((lng: number, lat: number) => boolean) | null
        ) => {
            const dotCoordinates: number[][] = [];
            const baseStep = dotSpacing * 0.08;
            for (let lat = -90; lat <= 90; lat += baseStep) {
                const latRad = (Math.abs(lat) * Math.PI) / 180;
                const cosLat = Math.cos(latRad);
                const lngStep =
                    cosLat > 0.01
                        ? baseStep / Math.max(0.3, cosLat)
                        : 360;
                for (let lng = -180; lng < 180; lng += lngStep) {
                    if (allDots || onLand === null || onLand(lng, lat)) {
                        dotCoordinates.push([lng, lat]);
                    }
                }
            }

            if (dotCoordinates.length > 0) {
                const dotGeometry = new SphereGeometry(
                    0.01 * dotSizeMultiplier,
                    4,
                    4
                );
                const dotColorObj = resolvedDotColor
                    ? new Color(resolvedDotColor)
                    : new Color(0.6, 0.6, 0.6);
                const dotMaterial = new MeshBasicMaterial({
                    color: dotColorObj,
                    transparent: dotRgba.a < 1 || dotRgba.a === 0,
                    opacity: dotRgba.a,
                });
                const instanced = new InstancedMesh(
                    dotGeometry,
                    dotMaterial,
                    dotCoordinates.length
                );
                const matrix = new Matrix4();
                for (let i = 0; i < dotCoordinates.length; i++) {
                    const [lng, lat] = dotCoordinates[i];
                    const pos = latLngToPosition(lat, lng);
                    matrix.makeScale(1, 1, 1);
                    matrix.setPosition(
                        pos.x * globeRadius,
                        pos.y * globeRadius,
                        pos.z * globeRadius
                    );
                    instanced.setMatrixAt(i, matrix);
                }
                instanced.instanceMatrix.needsUpdate = true;
                dotInstances = instanced;
                globeGroup.add(dotInstances);
            }
        };

        const loadWorldData = async () => {
            try {
                let response: Response;
                try {
                    response = await fetch("/data/ne_50m_land.json");
                    if (!response.ok) throw new Error("Local data not found");
                } catch {
                    response = await fetch(
                        "https://raw.githubusercontent.com/martynafford/natural-earth-geojson/refs/heads/master/50m/physical/ne_50m_land.json"
                    );
                }
                if (cancelled) return;
                if (!response.ok) throw new Error("Failed to load land data");
                const landFeatures = await response.json();
                if (cancelled) return;

                while (continentOutlineGroup.children.length > 0) {
                    continentOutlineGroup.remove(
                        continentOutlineGroup.children[0]
                    );
                }
                if (showOutline && outlineColor && outlineRgba.a > 0) {
                    const outlineColorObj = new Color(resolvedOutlineColor);
                    const outlineMaterial = new MeshBasicMaterial({
                        color: outlineColorObj,
                        transparent: outlineRgba.a < 1,
                        opacity: outlineRgba.a,
                        depthTest: true,
                        depthWrite: true,
                    });
                    const projection = geoEquirectangular();
                    const pathGenerator = geoPath().projection(projection);
                    landFeatures.features.forEach((feature: any) => {
                        const featureType =
                            feature.properties?.featurecla ||
                            feature.properties?.type ||
                            "";
                        const featureName = feature.properties?.name || "";
                        if (
                            featureType.toLowerCase().includes("graticule") ||
                            featureType.toLowerCase().includes("grid") ||
                            featureType.toLowerCase().includes("line") ||
                            featureName.toLowerCase().includes("graticule") ||
                            featureName.toLowerCase().includes("grid") ||
                            featureName.toLowerCase().includes("line")
                        ) {
                            return;
                        }
                        const pathString = pathGenerator(feature);
                        if (!pathString) return;
                        const commands = pathString.match(/[ML][^MLZ]*/g) || [];
                        if (commands.length === 0) return;

                        const geometry = feature.geometry;
                        if (!geometry || !geometry.coordinates) return;

                        const processRing = (ring: number[][]) => {
                            if (ring.length < 2) return;
                            const simplifiedRing = simplifyRing(ring, detail);
                            const positions: number[] = [];
                            simplifiedRing.forEach((coord) => {
                                const [lng, lat] = coord;
                                const pos = latLngToPosition(lat, lng);
                                positions.push(
                                    pos.x * globeRadius,
                                    pos.y * globeRadius,
                                    pos.z * globeRadius
                                );
                            });
                            if (positions && positions.length >= 6) {
                                const points: Vector3[] = [];
                                for (let i = 0; i < positions.length; i += 3) {
                                    points.push(
                                        new Vector3(
                                            positions[i],
                                            positions[i + 1],
                                            positions[i + 2]
                                        )
                                    );
                                }
                                if (
                                    points.length > 0 &&
                                    points[0].distanceTo(
                                        points[points.length - 1]
                                    ) > 0.001
                                ) {
                                    points.push(points[0].clone());
                                }
                                if (points.length >= 2) {
                                    const curve = new CatmullRomCurve3(points);
                                    const radius = (outlineWidth / 10) * 0.01;
                                    const tubeGeometry = new TubeGeometry(
                                        curve,
                                        points.length * 2,
                                        radius,
                                        8,
                                        false
                                    );
                                    const tubeMesh = new Mesh(
                                        tubeGeometry,
                                        outlineMaterial
                                    );
                                    tubeMesh.renderOrder = 0;
                                    continentOutlineGroup.add(tubeMesh);
                                }
                            }
                        };
                        if (
                            geometry.type === "Polygon" &&
                            geometry.coordinates.length > 0
                        ) {
                            processRing(geometry.coordinates[0]);
                        } else if (geometry.type === "MultiPolygon") {
                            geometry.coordinates.forEach((polygon: any) => {
                                if (polygon.length > 0) {
                                    processRing(polygon[0]);
                                }
                            });
                        }
                    });
                }

                const bitmapWidth = 2048;
                const bitmapHeight = 1024;
                const offscreenCanvas = document.createElement("canvas");
                offscreenCanvas.width = bitmapWidth;
                offscreenCanvas.height = bitmapHeight;
                const ctx = offscreenCanvas.getContext("2d", {
                    willReadFrequently: true,
                });
                if (!ctx) throw new Error("Canvas not supported");
                const projection = geoEquirectangular().fitSize(
                    [bitmapWidth, bitmapHeight],
                    { type: "Sphere" } as any
                );
                const pathGenerator = geoPath()
                    .projection(projection)
                    .context(ctx);
                ctx.fillStyle = "#000";
                ctx.fillRect(0, 0, bitmapWidth, bitmapHeight);
                ctx.fillStyle = "#fff";
                ctx.beginPath();
                landFeatures.features.forEach((feature: any) => {
                    pathGenerator(feature);
                });
                ctx.fill();
                const imageData = ctx.getImageData(
                    0,
                    0,
                    bitmapWidth,
                    bitmapHeight
                );
                const pixels = imageData.data;
                const isOnLand = (lng: number, lat: number) => {
                    const x =
                        Math.round(((lng + 180) / 360) * bitmapWidth) %
                        bitmapWidth;
                    const y = Math.round(((90 - lat) / 180) * bitmapHeight);
                    const clampedY = Math.max(0, Math.min(bitmapHeight - 1, y));
                    const idx = (clampedY * bitmapWidth + x) * 4;
                    return pixels[idx] > 128;
                };

                if (fill === "solid") {
                    const texW = 1024;
                    const texH = 512;
                    const fillCanvas = document.createElement("canvas");
                    fillCanvas.width = texW;
                    fillCanvas.height = texH;
                    const fctx = fillCanvas.getContext("2d")!;
                    const img = fctx.createImageData(texW, texH);
                    const data = img.data;
                    const fr = Math.round(fillRgba.r * 255);
                    const fg = Math.round(fillRgba.g * 255);
                    const fb = Math.round(fillRgba.b * 255);
                    const fa = Math.round((fillRgba.a || 1) * 255);
                    for (let ty = 0; ty < texH; ty++) {
                        for (let tx = 0; tx < texW; tx++) {
                            const u = tx / texW;
                            const v = ty / texH;
                            let lng = (u - 0.25) * 360;
                            lng = ((((lng + 180) % 360) + 360) % 360) - 180;
                            const lat = (v - 0.5) * 180;
                            const onLand = allDots || isOnLand(lng, lat);
                            const idx = (ty * texW + tx) * 4;
                            if (onLand) {
                                data[idx] = fr;
                                data[idx + 1] = fg;
                                data[idx + 2] = fb;
                                data[idx + 3] = fa;
                            } else {
                                data[idx + 3] = 0;
                            }
                        }
                    }
                    fctx.putImageData(img, 0, 0);
                    const fillTexture = new CanvasTexture(fillCanvas);
                    fillTexture.flipY = false;
                    fillTexture.needsUpdate = true;
                    const fillGeometry = new SphereGeometry(
                        globeRadius * 1.002,
                        64,
                        64
                    );
                    const fillMaterial = new MeshBasicMaterial({
                        map: fillTexture,
                        transparent: true,
                    });
                    dotInstances = new Mesh(fillGeometry, fillMaterial);
                    globeGroup.add(dotInstances);
                } else {
                    buildDotField(isOnLand);
                }

                updateMarkers();
                renderer.render(scene, camera);
                canvas.style.opacity = "1";
                canvas.style.visibility = "visible";
            } catch (err) {
                console.warn("[Globe] Land data fallback to full-sphere dots", err);
                if (cancelled) return;
                buildDotField(null);
                updateMarkers();
                renderer.render(scene, camera);
                canvas.style.opacity = "1";
                canvas.style.visibility = "visible";
            }
        };

        const updateMarkers = () => {
            markerMeshes.forEach((mesh) => globeGroup.remove(mesh));
            markerMeshes = [];
            if (markerConfig.markers && markerConfig.markers.length > 0) {
                const markerSize = 0.01 * markerRadiusMultiplier;
                const markerGeometry = new SphereGeometry(markerSize, 16, 16);
                const markerColorObj = resolvedMarkerColor
                    ? new Color(resolvedMarkerColor)
                    : new Color(1, 1, 1);
                const markerMaterial = new MeshBasicMaterial({
                    color: markerColorObj,
                });
                markerConfig.markers.forEach((marker) => {
                    if (
                        !marker ||
                        typeof marker.lat !== "number" ||
                        typeof marker.lng !== "number"
                    )
                        return;
                    const pos = latLngToPosition(marker.lat, marker.lng);
                    const markerMesh = new Mesh(
                        markerGeometry,
                        markerMaterial.clone()
                    );
                    markerMesh.position.set(
                        pos.x * globeRadius,
                        pos.y * globeRadius,
                        pos.z * globeRadius
                    );
                    globeGroup.add(markerMesh);
                    markerMeshes.push(markerMesh);
                });
            }
        };

        const initialLongitudeRad = (initialLongitude * Math.PI) / 180;
        const initialLatitudeRad = (initialLatitude * Math.PI) / 180;
        const rotation = { x: initialLongitudeRad, y: initialLatitudeRad };
        const targetRotation = {
            x: initialLongitudeRad,
            y: initialLatitudeRad,
        };
        const velocity = { x: 0, y: 0 };
        let isDragging = false;
        let isHovering = false;
        let lastMouseX = 0;
        let lastMouseY = 0;
        let animationFrameId: number | null = null;
        const lerpFactor =
            smoothingN === 0 ? 1 : mapLinear(smoothingN, 0, 1, 0.4, 0.03);
        const velocityDecay = mapLinear(smoothingN, 0, 1, 0.7, 0.96);

        const globeGroup = new Group();
        globeGroup.rotation.y = initialLongitudeRad;
        globeGroup.rotation.x = initialLatitudeRad;
        scene.add(globeGroup);
        globeGroup.add(oceanMesh);
        if (showGrid && graticuleColor && graticuleRgba.a > 0) {
            globeGroup.add(graticuleGroup);
        }
        globeGroup.add(continentOutlineGroup);
        markerMeshes.forEach((mesh) => globeGroup.add(mesh));

        const animate = () => {
            let needsRender = false;
            const threshold = 0.01;
            if (
                !isDragging &&
                rotationSpeed !== 0 &&
                (!stopOnHover || !isHovering)
            ) {
                targetRotation.x += rotationSpeed * 0.01;
            }
            if (!isDragging && smoothingN > 0) {
                if (
                    Math.abs(velocity.x) > threshold ||
                    Math.abs(velocity.y) > threshold
                ) {
                    targetRotation.x += velocity.x;
                    targetRotation.y += velocity.y;
                    targetRotation.y = Math.max(
                        -Math.PI / 2,
                        Math.min(Math.PI / 2, targetRotation.y)
                    );
                    velocity.x *= velocityDecay;
                    velocity.y *= velocityDecay;
                } else {
                    velocity.x = 0;
                    velocity.y = 0;
                }
            }
            const dx = targetRotation.x - rotation.x;
            const dy = targetRotation.y - rotation.y;
            if (
                Math.abs(dx) > threshold ||
                Math.abs(dy) > threshold ||
                rotationSpeed !== 0 ||
                isDragging
            ) {
                rotation.x += dx * lerpFactor;
                rotation.y += dy * lerpFactor;
                rotation.y = Math.max(
                    -Math.PI / 2,
                    Math.min(Math.PI / 2, rotation.y)
                );
                needsRender = true;
            }
            if (needsRender || rotationSpeed !== 0 || isDragging) {
                globeGroup.rotation.y = rotation.x;
                globeGroup.rotation.x = rotation.y;
                renderer.render(scene, camera);
            }
            const hasVelocity =
                Math.abs(velocity.x) > threshold ||
                Math.abs(velocity.y) > threshold;
            const hasLerpDelta =
                Math.abs(dx) > threshold || Math.abs(dy) > threshold;
            const needsContinue =
                isDragging || rotationSpeed !== 0 || hasVelocity || hasLerpDelta;
            if (needsContinue) {
                animationFrameId = requestAnimationFrame(animate);
            } else {
                animationFrameId = null;
            }
        };

        const startAnimation = () => {
            if (animationFrameId === null) {
                animationFrameId = requestAnimationFrame(animate);
            }
        };
        if (rotationSpeed !== 0) {
            startAnimation();
        }

        const handleMouseDown = (event: MouseEvent) => {
            isDragging = true;
            velocity.x = 0;
            velocity.y = 0;
            lastMouseX = event.clientX;
            lastMouseY = event.clientY;
            startAnimation();
            const handleMouseMoveDrag = (moveEvent: MouseEvent) => {
                const sensitivity = mapDragSpeedUiToSensitivity(dragSpeed);
                const dx = moveEvent.clientX - lastMouseX;
                const dy = moveEvent.clientY - lastMouseY;
                targetRotation.x += dx * sensitivity;
                targetRotation.y += dy * sensitivity;
                targetRotation.y = Math.max(
                    -Math.PI / 2,
                    Math.min(Math.PI / 2, targetRotation.y)
                );
                velocity.x = dx * sensitivity * 0.3;
                velocity.y = dy * sensitivity * 0.3;
                lastMouseX = moveEvent.clientX;
                lastMouseY = moveEvent.clientY;
            };
            const handleMouseUp = () => {
                document.removeEventListener("mousemove", handleMouseMoveDrag);
                document.removeEventListener("mouseup", handleMouseUp);
                isDragging = false;
            };
            document.addEventListener("mousemove", handleMouseMoveDrag);
            document.addEventListener("mouseup", handleMouseUp);
        };
        canvas.addEventListener("mousedown", handleMouseDown);

        const raycaster = new Raycaster();
        const mouse = new Vector2();
        const handleMouseMove = (event: MouseEvent) => {
            if (!stopOnHover) return;
            const rect = canvas.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObject(oceanMesh);
            isHovering = intersects.length > 0;
        };
        canvas.addEventListener("mousemove", handleMouseMove);

        const resizeObserver = new ResizeObserver(() => {
            const newWidth =
                container.clientWidth || container.offsetWidth || 800;
            const newHeight =
                container.clientHeight || container.offsetHeight || 600;
            camera.aspect = newWidth / newHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(newWidth, newHeight);
            const newCameraDistance = 2.5 / scaleMultiplier;
            camera.position.set(0, 0, newCameraDistance);
            camera.lookAt(0, 0, 0);
            renderer.render(scene, camera);
        });
        resizeObserver.observe(container);

        loadWorldData();

        return () => {
            cancelled = true;
            if (animationFrameId !== null)
                cancelAnimationFrame(animationFrameId);
            canvas.removeEventListener("mousedown", handleMouseDown);
            canvas.removeEventListener("mousemove", handleMouseMove);
            resizeObserver.disconnect();
            renderer.dispose();
            if (canvas.parentNode === container) container.removeChild(canvas);
        };
    }, [
        speed,
        smoothing,
        dots,
        fill,
        fillColor,
        allDots,
        density,
        dotSize,
        dotColor,
        scale,
        stopOnHover,
        markerConfig,
        direction,
        initialLatitude,
        initialLongitude,
        oceanColor,
        outlineColor,
        showOutline,
        graticuleColor,
        showGrid,
        outlineWidth,
        dragSpeed,
        detail,
        rotationSpeed,
        dotSpacing,
        dotSizeMultiplier,
        markerRadiusMultiplier,
        scaleMultiplier,
    ]);

    const containerStyle: CSSProperties = {
        ...style,
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    };

    if (error) {
        return (
            <div style={containerStyle}>
                <div
                    role="img"
                    aria-label="Static globe preview. Interactive rendering is unavailable in this browser."
                    style={{
                        position: "relative",
                        width: "min(72vw, 360px)",
                        aspectRatio: "1",
                        overflow: "hidden",
                        border: "1px solid rgba(34, 211, 238, 0.34)",
                        borderRadius: "50%",
                        backgroundColor: "#101216",
                        backgroundImage: [
                            "radial-gradient(circle at 35% 30%, rgba(34,211,238,0.34) 0, rgba(34,211,238,0.08) 34%, transparent 66%)",
                            "radial-gradient(circle, rgba(112,231,255,0.72) 1px, transparent 1.7px)",
                            "repeating-linear-gradient(90deg, transparent 0 27px, rgba(34,211,238,0.12) 28px 29px, transparent 30px 56px)",
                            "repeating-linear-gradient(0deg, transparent 0 27px, rgba(34,211,238,0.12) 28px 29px, transparent 30px 56px)",
                            "radial-gradient(circle at 50% 50%, #16313b 0%, #101216 68%)",
                        ].join(", "),
                        backgroundSize: "auto, 10px 10px, auto, auto, auto",
                        boxShadow: "inset -24px -10px 52px rgba(0,0,0,0.78), 0 0 50px rgba(0,161,219,0.18)",
                    }}
                >
                    <span
                        aria-hidden="true"
                        style={{
                            position: "absolute",
                            inset: "12% 25%",
                            border: "1px solid rgba(103,232,249,0.24)",
                            borderRadius: "50%",
                        }}
                    />
                    <span
                        aria-hidden="true"
                        style={{
                            position: "absolute",
                            inset: "0 34%",
                            borderRight: "1px solid rgba(103,232,249,0.2)",
                            borderLeft: "1px solid rgba(103,232,249,0.2)",
                            borderRadius: "50%",
                        }}
                    />
                </div>
            </div>
        );
    }
    return <div ref={containerRef} style={containerStyle} />;
}


const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

const ScaleFrame = ({
  frameWidth,
  className,
  children,
}: {
  frameWidth: number;
  className?: string;
  children: ReactNode;
}) => {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  const baseDprRef = useRef<number | null>(null);

  useIsomorphicLayoutEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    const measure = () => {
      const width = outer.clientWidth;
      if (!width) return;

      if (baseDprRef.current === null) {
        baseDprRef.current = window.devicePixelRatio || 1;
      }
      const zoom = (window.devicePixelRatio || 1) / baseDprRef.current;

      const scale = (width / frameWidth) * zoom;
      inner.style.transform = `scale(${scale})`;

      inner.style.setProperty("--frame-scale", String(scale));
      outer.style.height = `${inner.offsetHeight * scale}px`;

      const scaledWidth = frameWidth * scale;
      outer.style.overflowX = scaledWidth > width + 1 ? "auto" : "";
      inner.style.marginLeft =
        scaledWidth < width - 1 ? `${(width - scaledWidth) / 2}px` : "";
    };

    const observer = new ResizeObserver(measure);
    observer.observe(outer);
    observer.observe(inner);
    measure();

    const dprWatch = window.matchMedia(
      `(resolution: ${window.devicePixelRatio || 1}dppx)`,
    );
    dprWatch.addEventListener("change", measure);

    return () => {
      observer.disconnect();
      dprWatch.removeEventListener("change", measure);
    };
  }, [frameWidth]);

  return (
    <div ref={outerRef} className={className}>
      <div
        ref={innerRef}
        style={
          {
            width: frameWidth,
            transformOrigin: "top left",
            "--frame-scale": 1,
          } as React.CSSProperties
        }
      >
        {children}
      </div>
    </div>
  );
};

const GLOBE_ACCENT = "#00A1DB";

// Hoisted so the Globe effect deps keep a stable identity. A new object literal
// on every render would re-run the effect, tearing down and rebuilding the
// WebGL context each pass and leaving the canvas permanently blank.
const GLOBE_DOTS = {
    color: GLOBE_ACCENT,
    size: 5,
    density: 8,
    allDots: false,
};

// Only the breakpoint-matched stage is laid out, but a `display: none` ancestor
// still mounts and runs effects, so all three stages would otherwise each build
// a WebGL context and re-fetch the land GeoJSON. Gating on measured size keeps
// exactly one globe alive, and unlike a viewport media query it is correct
// inside the 1280px scaled preview canvas.
const useHasLayoutSize = (ref: RefObject<HTMLElement>) => {
    const [hasSize, setHasSize] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const measure = () => {
            setHasSize(el.clientWidth > 0 && el.clientHeight > 0);
        };
        measure();
        const ro = new ResizeObserver(measure);
        ro.observe(el);
        return () => ro.disconnect();
    }, [ref]);
    return hasSize;
};

const MediaGlobe = () => {
    const ref = useRef<HTMLDivElement>(null);
    const hasSize = useHasLayoutSize(ref);
    return (
        <div ref={ref} className="h-full w-full">
            {hasSize && (
                <Globe
                    scale={9.7}
                    stopOnHover
                    initialLatitude={23}
                    initialLongitude={-23}
                    fill="dots"
                    dots={GLOBE_DOTS}
                    showOutline
                    outlineColor={GLOBE_ACCENT}
                    showGrid
                    graticuleColor={GLOBE_ACCENT}
                    oceanColor="#101216"
                    style={{ width: "100%", height: "100%" }}
                />
            )}
        </div>
    );
};



const A = "/originkit/hero-24";

const HELVETICA = '"Helvetica Neue", Helvetica, Arial, sans-serif';

const NAV_LINKS = ["Home", "Pricing", "About", "Tools"];

const REVEAL = "animate-hero-reveal";
const delay = (ms: number) => ({ animationDelay: `${ms}ms` });

const Backdrop = ({ src, className }: { src: string; className: string }) => (
  <img
    alt=""
    aria-hidden
    className={`pointer-events-none absolute left-0 top-0 h-full w-full max-w-none object-cover ${className}`}
    src={`${A}/${src}`}
  />
);

const GetStartedButton = ({ className }: { className: string }) => (
  <a
    href="#start"
    className={`relative flex shrink-0 cursor-pointer items-center justify-center rounded-[999px] transition-opacity duration-200 hover:opacity-80 drop-shadow-[0px_53px_7.5px_rgba(0,0,0,0),0px_34px_7px_rgba(0,0,0,0.01),0px_19px_6px_rgba(0,0,0,0.05),0px_9px_4.5px_rgba(0,0,0,0.09),0px_2px_2.5px_rgba(0,0,0,0.1)] ${className}`}
  >
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 rounded-[999px]"
      style={{
        backgroundImage:
          "linear-gradient(180deg, rgba(255, 255, 255, 0.33) 0%, rgba(255, 255, 255, 0) 100%), linear-gradient(90deg, rgb(240, 240, 240) 0%, rgb(240, 240, 240) 100%)",
      }}
    />
    <p className="relative shrink-0 whitespace-nowrap text-[16px] leading-[1.15] tracking-[-0.32px] text-[#060e08]">
      Get started
    </p>
    <div className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0px_1px_1px_0px_white,inset_0px_-1.5px_0px_0px_rgba(0,0,0,0.1)]" />
  </a>
);

const EDGE_FADE = {
  left: "linear-gradient(to right, transparent 0%, #000 18%, #000 100%)",
  right: "linear-gradient(to left, transparent 0%, #000 18%, #000 100%)",
} as const;

const HAND_SLIDE = {
  left: "animate-hand-slide-in-left",
  right: "animate-hand-slide-in-right",
} as const;

const HandCutout = ({
  box,
  mask,
  maskSize,
  image,
  from,
  step,
}: {
  box: string;
  mask: string;
  maskSize: string;
  image: string;
  from: "left" | "right";
  step: number;
}) => (
  <div
    className={`absolute ${HAND_SLIDE[from]} ${box}`}
    style={{
      ...delay(step),
      maskImage: `url("${A}/${mask}"), ${EDGE_FADE[from]}`,
      WebkitMaskImage: `url("${A}/${mask}"), ${EDGE_FADE[from]}`,
      maskMode: "alpha",
      maskComposite: "intersect",
      WebkitMaskComposite: "source-in",
      maskRepeat: "no-repeat",
      WebkitMaskRepeat: "no-repeat",
      maskSize: `${maskSize}, 100% 100%`,
      WebkitMaskSize: `${maskSize}, 100% 100%`,
    }}
  >
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <img alt="" className={`absolute max-w-none ${image}`} src={`${A}/hands.png`} />
    </div>
  </div>
);

const GlassCard = ({
  className,
  plate,
  step,
  children,
}: {
  className: string;
  plate: string;
  step: number;
  children: ReactNode;
}) => (
  <div
    className={`absolute flex flex-col items-start overflow-clip border-solid border-[rgba(255,255,255,0.1)] backdrop-blur-sm ${className}`}
  >
    <div
      className={`absolute h-[166px] w-[301px] -translate-x-1/2 -translate-y-1/2 blur-[20px] ${plate}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[rgba(255,255,255,0.1)] backdrop-blur-[2px]"
      />
    </div>
    {children}
  </div>
);

const PhoneFrame = () => (
  <div className="relative h-[836px] w-[402px] overflow-clip">

        <div
      style={delay(0)}
      className={`${REVEAL} absolute left-0 top-0 flex w-[402px] items-center justify-center border border-solid border-[rgba(255,255,255,0.1)] p-[16px]`}
    >
      <div className="relative flex min-w-px flex-[1_0_0] items-center justify-between">
        <a href="#home" className="relative shrink-0 whitespace-nowrap text-[22px] leading-[1.15] tracking-[-0.66px] text-white">
          Hirefy
        </a>
        <div className="relative size-[24px] shrink-0 cursor-pointer transition-opacity duration-200 hover:opacity-70">
          <img alt="Menu" className="absolute inset-0 block size-full max-w-none" src={`${A}/menu.svg`} />
        </div>
      </div>
    </div>

        <div className="absolute left-1/2 top-[90px] flex w-[370px] -translate-x-1/2 flex-col items-center gap-[24px]">
      <div className="relative flex w-full shrink-0 flex-col items-center gap-[8px] text-center text-white">
        <h1
          style={delay(80)}
          className={`${REVEAL} relative w-[320px] shrink-0 text-[35px] leading-[40px] tracking-[-1.4px]`}
        >
          Build Your Global Team. Effortlessly.
        </h1>
        <p
          style={delay(160)}
          className={`${REVEAL} relative w-full shrink-0 text-[14px] leading-[1.5] text-[rgba(255,255,255,0.7)]`}
        >
          Hire exceptional talent across 180+ countries, automate compliance, and manage
          international payroll.
        </p>
      </div>
      <div
        style={delay(240)}
        className={`${REVEAL} relative flex w-full shrink-0 flex-col items-start justify-center gap-[8px]`}
      >
        <GetStartedButton className="w-full px-[24px] py-[14px]" />
        <a
          href="#book"
          className="relative flex w-full shrink-0 cursor-pointer items-center justify-center rounded-[999px] border border-solid border-[rgba(255,255,255,0.1)] bg-[#252525] px-[24px] py-[14px] transition-opacity duration-200 hover:opacity-80"
        >
          <p className="relative shrink-0 whitespace-nowrap text-[16px] leading-[1.15] tracking-[-0.32px] text-white">
            Book a Call
          </p>
        </a>
      </div>
    </div>

        <div style={delay(320)} className={`${REVEAL} absolute left-[calc(50%_+_0.5px)] top-[418px] h-[324px] w-[323px] -translate-x-1/2 overflow-clip rounded-[999px]`}>
      <MediaGlobe />
    </div>

    <HandCutout
      box="left-[172px] top-[344.46px] h-[177.31px] w-[230px]"
      mask="hand-mask-top.svg"
      maskSize="230px 177.309px"
      image="left-[-97.68%] top-[-17.2%] h-[170.95%] w-[197.68%]"
      from="right"
      step={360}
    />

    <HandCutout
      box="left-[-27px] top-[571.65px] h-[212.8px] w-[224px]"
      mask="hand-mask-bottom.svg"
      maskSize="224px 212.801px"
      image="left-[-15.3%] top-[-63.32%] h-[163.32%] w-[232.73%]"
      from="left"
      step={440}
    />

        <GlassCard
      className="left-[20px] top-[445px] w-[136px] gap-[4px] rounded-[6px] border p-[12px]"
      plate="left-[calc(50%_-_0.5px)] top-[calc(50%_+_0.5px)]"
      step={400}
    >
      <p className="relative w-full shrink-0 text-[16px] font-bold italic leading-[1.4] text-white">
        95%
      </p>
      <p className="relative w-full shrink-0 text-[12px] leading-[1.4] text-white opacity-70">
        Faster Global Hiring
      </p>
    </GlassCard>

        <GlassCard
      className="left-[calc(50%_+_79px)] top-[667px] w-[212px] -translate-x-1/2 gap-[12px] rounded-[4.729px] border-[0.788px] p-[12px]"
      plate="left-[calc(50%_+_25.5px)] top-[calc(50%_+_4.21px)]"
      step={480}
    >
      <p className="relative w-full shrink-0 text-[12px] leading-[1.4] text-white">
        We expanded into 12 new markets in under 60 days without hiring.
      </p>
      <div className="relative flex w-full shrink-0 items-center gap-[6px]">
        <div className="relative size-[28px] shrink-0">
          <img
            alt=""
            className="absolute inset-0 block size-full max-w-none"
            height="28"
            width="28"
            src={`${A}/avatar.png`}
          />
        </div>
        <div className="relative flex min-w-px flex-[1_0_0] flex-col items-start text-[11px] leading-[1.3] text-white">
          <p className="relative w-full shrink-0 font-bold italic">Sarah Kim</p>
          <p className="relative w-full shrink-0 opacity-70">VP People at NovaTech</p>
        </div>
      </div>
    </GlassCard>
  </div>
);

const TabletFrame = () => (
  <div className="relative h-[994px] w-[744px] overflow-clip">

        <div
      style={delay(0)}
      className={`${REVEAL} absolute left-0 top-0 flex h-[64px] w-[744px] items-center justify-center border border-solid border-[rgba(255,255,255,0.1)] px-[32px] py-[16px]`}
    >
      <div className="relative flex min-w-px flex-[1_0_0] items-center justify-between">
        <a href="#home" className="relative shrink-0 whitespace-nowrap text-[28px] leading-[1.15] tracking-[-0.84px] text-white">
          Hirefy
        </a>
        <div className="relative size-[24px] shrink-0 cursor-pointer transition-opacity duration-200 hover:opacity-70">
          <img alt="Menu" className="absolute inset-0 block size-full max-w-none" src={`${A}/menu.svg`} />
        </div>
      </div>
    </div>

        <div className="absolute left-[149px] top-[120px] flex w-[446px] flex-col items-center gap-[32px]">
      <div className="relative flex w-full shrink-0 flex-col items-center gap-[16px] text-center text-white">
        <h1
          style={delay(80)}
          className={`${REVEAL} relative w-full shrink-0 text-[48px] leading-[55px] tracking-[-1.92px]`}
        >
          Build Your Global Team. Effortlessly.
        </h1>
        <p
          style={delay(160)}
          className={`${REVEAL} relative w-full shrink-0 text-[16px] leading-[1.5] text-[rgba(255,255,255,0.7)]`}
        >
          Hire exceptional talent across 180+ countries, automate compliance, and manage
          international payroll.
        </p>
      </div>
      <div
        style={delay(240)}
        className={`${REVEAL} relative flex shrink-0 items-center gap-[12px]`}
      >
        <GetStartedButton className="px-[24px] py-[16px]" />
        <a
          href="#book"
          className="relative flex shrink-0 cursor-pointer items-center justify-center rounded-[999px] border border-solid border-[rgba(255,255,255,0.1)] bg-[#252525] px-[24px] py-[16px] transition-opacity duration-200 hover:opacity-80"
        >
          <p className="relative shrink-0 whitespace-nowrap text-[16px] leading-[1.15] tracking-[-0.32px] text-white">
            Book a Call
          </p>
        </a>
      </div>
    </div>

        <div style={delay(320)} className={`${REVEAL} absolute left-[163px] top-[432px] h-[420px] w-[418px] overflow-clip rounded-[999px]`}>
      <MediaGlobe />
    </div>

    <HandCutout
      box="left-[401px] top-[383.289px] h-[264.423px] w-[343px]"
      mask="ipad-mask-top.svg"
      maskSize="343px 264.423px"
      image="left-[-97.68%] top-[-17.2%] h-[170.95%] w-[197.68%]"
      from="right"
      step={360}
    />

    <HandCutout
      box="left-0 top-[692.875px] h-[267.9px] w-[282px]"
      mask="ipad-mask-bottom.svg"
      maskSize="282px 267.9px"
      image="left-[-15.3%] top-[-63.32%] h-[163.32%] w-[232.73%]"
      from="left"
      step={440}
    />

        <GlassCard
      className="left-[113px] top-[473px] w-[169px] gap-[4px] rounded-[6px] border p-[16px]"
      plate="left-1/2 top-1/2"
      step={400}
    >
      <p className="relative w-full shrink-0 text-[20px] font-bold italic leading-[1.4] text-white">
        95%
      </p>
      <p className="relative w-full shrink-0 text-[14px] leading-[1.4] text-white opacity-70">
        Faster Global Hiring
      </p>
    </GlassCard>

        <GlassCard
      className="left-[441px] top-[740px] w-[246px] gap-[16px] rounded-[6px] border p-[14px]"
      plate="left-[calc(50%_-_0.5px)] top-1/2"
      step={480}
    >
      <p className="relative w-full shrink-0 text-[14px] leading-[1.4] text-white">
        We expanded into 12 new markets in under 60 days without hiring.
      </p>
      <div className="relative flex w-full shrink-0 items-center gap-[6px]">
        <div className="relative size-[32px] shrink-0">
          <img
            alt=""
            className="absolute inset-0 block size-full max-w-none"
            height="32"
            width="32"
            src={`${A}/avatar.png`}
          />
        </div>
        <div className="relative flex w-[127px] shrink-0 flex-col items-start text-[12px] leading-[1.3] text-white">
          <p className="relative w-full shrink-0 font-bold italic">Sarah Kim</p>
          <p className="relative w-full shrink-0 opacity-70">VP People at NovaTech</p>
        </div>
      </div>
    </GlassCard>
  </div>
);

const DesktopNav = () => (
  <div
    style={delay(0)}
    className={`${REVEAL} absolute left-0 top-0 z-10 hidden h-[90px] w-full items-center justify-center border-b border-solid border-[rgba(255,255,255,0.18)] px-[32px] min-[1280px]:flex`}
  >
    <div className="relative flex w-full max-w-300 items-center justify-between">
      <a href="#home" className="relative shrink-0 whitespace-nowrap text-[32px] leading-[1.15] tracking-[-0.96px] text-white">
        Hirefy
      </a>
      <GetStartedButton className="px-[20px] py-[14px]" />
      <div className="absolute left-1/2 top-[calc(50%_-_0.5px)] flex -translate-x-1/2 -translate-y-1/2 items-center gap-[28px] whitespace-nowrap text-[17px] leading-[1.15] text-white">
        {NAV_LINKS.map((link) => (
          <a
            key={link}
            href={`#${link.toLowerCase()}`}
            className="relative shrink-0 cursor-pointer transition-opacity duration-200 hover:opacity-70"
          >
            {link}
          </a>
        ))}
      </div>
    </div>
  </div>
);

const DesktopFrame = () => (
  <div className="relative h-[913px] w-[1280px] overflow-clip">

        <div className="absolute left-[417px] top-[144px] flex w-[446px] flex-col items-center gap-[32px]">
      <div className="relative flex w-full shrink-0 flex-col items-center gap-[16px] text-center text-white">
        <h1
          style={delay(80)}
          className={`${REVEAL} relative w-full shrink-0 text-[48px] leading-[55px] tracking-[-1.92px]`}
        >
          Build Your Global Team. Effortlessly.
        </h1>
        <p
          style={delay(160)}
          className={`${REVEAL} relative w-full shrink-0 text-[16px] leading-[1.5] text-[rgba(255,255,255,0.7)]`}
        >
          Hire exceptional talent across 180+ countries, automate compliance, and manage
          international payroll.
        </p>
      </div>
      <div
        style={delay(240)}
        className={`${REVEAL} relative flex shrink-0 items-center gap-[12px]`}
      >
        <GetStartedButton className="px-[24px] py-[16px]" />
        <a
          href="#book"
          className="relative flex shrink-0 cursor-pointer items-center justify-center rounded-[999px] border border-solid border-[rgba(255,255,255,0.1)] bg-[#252525] px-[24px] py-[16px] transition-opacity duration-200 hover:opacity-80"
        >
          <p className="relative shrink-0 whitespace-nowrap text-[16px] leading-[1.15] tracking-[-0.32px] text-white">
            Book a Call
          </p>
        </a>
      </div>
    </div>

        <div style={delay(320)} className={`${REVEAL} absolute left-[431px] top-[448px] h-[420px] w-[418px] overflow-clip rounded-[999px]`}>
      <MediaGlobe />
    </div>

    <HandCutout
      box="left-[794px] top-[269.169px] h-[374.664px] w-[486px]"
      mask="desk-mask-top.svg"
      maskSize="486px 374.664px"
      image="left-[-97.68%] top-[-17.2%] h-[170.95%] w-[197.68%]"
      from="right"
      step={360}
    />

    <HandCutout
      box="left-0 top-[592.398px] h-[420.85px] w-[443px]"
      mask="desk-mask-bottom.svg"
      maskSize="443px 420.85px"
      image="left-[-15.3%] top-[-63.32%] h-[163.32%] w-[232.73%]"
      from="left"
      step={440}
    />

        <GlassCard
      className="left-[339px] top-[504px] w-[169px] gap-[4px] rounded-[6px] border p-[16px]"
      plate="left-1/2 top-1/2"
      step={400}
    >
      <p className="relative w-full shrink-0 text-[20px] font-bold italic leading-[1.4] text-white">
        95%
      </p>
      <p className="relative w-full shrink-0 text-[14px] leading-[1.4] text-white opacity-70">
        Faster Global Hiring
      </p>
    </GlassCard>

        <GlassCard
      className="left-[803px] top-[685px] w-[246px] gap-[16px] rounded-[6px] border p-[14px]"
      plate="left-[calc(50%_-_0.5px)] top-1/2"
      step={480}
    >
      <p className="relative w-full shrink-0 text-[14px] leading-[1.4] text-white">
        We expanded into 12 new markets in under 60 days without hiring.
      </p>
      <div className="relative flex w-full shrink-0 items-center gap-[6px]">
        <div className="relative size-[32px] shrink-0">
          <img
            alt=""
            className="absolute inset-0 block size-full max-w-none"
            height="32"
            width="32"
            src={`${A}/avatar.png`}
          />
        </div>
        <div className="relative flex w-[127px] shrink-0 flex-col items-start text-[12px] leading-[1.3] text-white">
          <p className="relative w-full shrink-0 font-bold italic">Sarah Kim</p>
          <p className="relative w-full shrink-0 opacity-70">VP People at NovaTech</p>
        </div>
      </div>
    </GlassCard>
  </div>
);

const Sec2Hero = ({ className = "" }: { className?: string }) => (
  <main
    className={`relative w-full overflow-hidden bg-[#101216] ${className}`}
    style={{ fontFamily: HELVETICA }}
  >
    <style>{HERO_24_CSS}</style>
    <Backdrop src="bg.png" className="min-[640px]:hidden" />
    <Backdrop src="bg-ipad.png" className="hidden min-[640px]:block min-[1280px]:hidden" />
    <Backdrop src="bg-desktop.png" className="hidden min-[1280px]:block" />

    <ScaleFrame frameWidth={402} className="relative w-full overflow-hidden min-[640px]:hidden">
      <PhoneFrame />
    </ScaleFrame>
    <ScaleFrame
      frameWidth={744}
      className="relative hidden w-full overflow-hidden min-[640px]:block min-[1280px]:hidden"
    >
      <TabletFrame />
    </ScaleFrame>
    <DesktopNav />
    <ScaleFrame
      frameWidth={1280}
      className="relative hidden w-full overflow-hidden min-[1280px]:block"
    >
      <DesktopFrame />
    </ScaleFrame>
  </main>
);


export interface OriginkitHero24Props {
    className?: string;
}

export default function OriginkitHero24({ className = '' }: OriginkitHero24Props) {
    return <Sec2Hero className={className} />;
}
