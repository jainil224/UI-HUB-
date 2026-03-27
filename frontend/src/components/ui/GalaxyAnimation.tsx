"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import styles from "./GalaxyAnimation.module.css";

// --- Shaders ---

const starVertexShader = `
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec2 vUv;
    void main(){
        vPosition=position;
        vNormal=normal;
        vUv=uv;
        gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
    }
`;

const starFragmentShader = `
    uniform float time;
    uniform float intensity;
    uniform vec3 color1;
    uniform vec3 color2;
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec2 vUv;
    float noise(vec3 p){return fract(sin(dot(p,vec3(12.9898,78.233,54.53)))*43758.5453);}
    void main(){
        vec3 pos=vPosition+time*0.1;
        float n1=noise(pos*3.0);
        float n2=noise(pos*6.0+vec3(100.0));
        float n3=noise(pos*12.0+vec3(200.0));
        float pattern=n1*0.5+n2*0.3+n3*0.2;
        pattern=pow(pattern,2.0);
        vec3 finalColor=mix(color1,color2,pattern);
        finalColor*=(1.0+intensity*pattern*2.0);
        float fresnel=pow(1.0-dot(vNormal,vec3(0.0,0.0,1.0)),2.0);
        finalColor+=fresnel*intensity*0.5;
        gl_FragColor=vec4(finalColor,1.0);
    }
`;

const planetVertexShader = `
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec2 vUv;
    void main(){
        vPosition=position;
        vNormal=normalize(normalMatrix*normal);
        vUv=uv;
        gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
    }
`;

const planetFragmentShader = `
    uniform float time;
    uniform vec3 baseColor;
    uniform vec3 accentColor;
    uniform float energy;
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec2 vUv;
    float noise(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
    void main(){
        vec2 uv=vUv+time*0.02;
        float n1=noise(uv*8.0);
        float n2=noise(uv*16.0);
        float pattern=n1*0.7+n2*0.3;
        vec3 color=mix(baseColor,accentColor,pattern);
        float fresnel=pow(1.0-abs(dot(vNormal,vec3(0.0,0.0,1.0))),1.5);
        color+=fresnel*accentColor*0.5;
        color*=(1.0+energy*0.8);
        gl_FragColor=vec4(color,1.0);
    }
`;

const arcVertexShader = `
    varying vec2 vUv;
    varying vec3 vPosition;
    void main(){
        vUv=uv;
        vPosition=position;
        gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
    }
`;

const arcFragmentShader = `
    uniform float time;
    uniform vec3 color;
    uniform float opacity;
    uniform float energy;
    varying vec2 vUv;
    varying vec3 vPosition;
    void main(){
        float flow=abs(sin(vUv.x*15.0-time*12.0));
        float pulse=sin(time*8.0)*0.5+0.5;
        float pattern=pow(flow,1.5)*(1.0+pulse*energy);
        float fade=sin(vUv.x*3.14159);
        vec3 finalColor=color*(pattern*2.0+0.3);
        float alpha=fade*opacity*(pattern+0.2)*(1.0+energy);
        gl_FragColor=vec4(finalColor,alpha);
    }
`;

// --- Themes ---

const themes = [
    {
        name: "Inferno",
        starColors: { color1: 0xffffff, color2: 0xffcc00 },
        planetData: [
            { baseColor: [0.8, 0.2, 0.1], accentColor: [1, 0.6, 0.2], trailColor: 0xff4400 },
            { baseColor: [0.6, 0.1, 0.1], accentColor: [1, 0.4, 0.1], trailColor: 0xff8800 },
            { baseColor: [0.9, 0.3, 0], accentColor: [1, 0.8, 0.3], trailColor: 0xffaa33 },
        ],
        ambientLightColor: 0x401008,
        starLightColor: 0xffcc88,
        directionalLights: { color1: 0xff6600, color2: 0xdd3300 },
        metalMaterialColor: 0x332222,
        ringColor: 0xff8866,
        arcColor: 0xffccaa,
    },
    {
        name: "Veridian",
        starColors: { color1: 0xccffee, color2: 0x66ffcc },
        planetData: [
            { baseColor: [0.2, 0.8, 0.5], accentColor: [0.8, 1, 0.9], trailColor: 0x00ffaa },
            { baseColor: [0.1, 0.6, 0.7], accentColor: [0.5, 0.9, 1], trailColor: 0x00ccff },
            { baseColor: [0.5, 0.8, 0.2], accentColor: [0.9, 1, 0.6], trailColor: 0xaaff00 },
        ],
        ambientLightColor: 0x0a3024,
        starLightColor: 0xccffdd,
        directionalLights: { color1: 0x33cc88, color2: 0x4488cc },
        metalMaterialColor: 0x779988,
        ringColor: 0x88ffcc,
        arcColor: 0xeeffee,
    },
    {
        name: "Celestial",
        starColors: { color1: 0xffe4b5, color2: 0xff8844 },
        planetData: [
            { baseColor: [1, 0.4, 0.4], accentColor: [1, 0.8, 0.2], trailColor: 0xff6644 },
            { baseColor: [0.3, 0.8, 0.3], accentColor: [0.6, 1, 0.8], trailColor: 0x44ff88 },
            { baseColor: [0.3, 0.4, 1], accentColor: [0.8, 0.6, 1], trailColor: 0x4488ff },
        ],
        ambientLightColor: 0x1a2440,
        starLightColor: 0xffe4b5,
        directionalLights: { color1: 0x4488ff, color2: 0x8844ff },
        metalMaterialColor: 0x4a6080,
        ringColor: 0x88ccff,
        arcColor: 0xffeebb,
    },
];

interface GalaxyAnimationProps {
    theme?: 'Inferno' | 'Veridian' | 'Celestial';
    particleCount?: number;
    speed?: number;
}

export const GalaxyAnimation: React.FC<GalaxyAnimationProps> = ({ 
    theme: initialTheme = 'Inferno',
    particleCount = 3000,
    speed = 1.0
}) => {

    const containerRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const composerRef = useRef<EffectComposer | null>(null);
    const clockRef = useRef(new THREE.Clock());

    // Refs for animation objects
    const starRef = useRef<THREE.Mesh | null>(null);
    const orreryRef = useRef<THREE.Group | null>(null);
    const starLightRef = useRef<THREE.PointLight | null>(null);
    const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
    const blueLightRef = useRef<THREE.DirectionalLight | null>(null);
    const purpleLightRef = useRef<THREE.DirectionalLight | null>(null);
    const metalMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);
    const ringMaterialRef = useRef<THREE.MeshBasicMaterial | null>(null);

    const planetsRef = useRef<any[]>([]);
    const activeEffectsRef = useRef<any[]>([]);
    const particleSystemsRef = useRef<any[]>([]);

    const [timeAcceleration, setTimeAcceleration] = useState(speed);
    const [isResonanceActive, setIsResonanceActive] = useState(false);
    const [currentThemeIndex, setCurrentThemeIndex] = useState(
        themes.findIndex(t => t.name === initialTheme) !== -1 
            ? themes.findIndex(t => t.name === initialTheme) 
            : 0
    );

    const timeAccelerationRef = useRef(speed);
    const currentThemeIndexRef = useRef(themes.findIndex(t => t.name === initialTheme) !== -1 ? themes.findIndex(t => t.name === initialTheme) : 0);


    const applyTheme = useCallback((index: number) => {
        const theme = themes[index];
        if (!starRef.current || !metalMaterialRef.current || !ringMaterialRef.current) return;

        const starMat = starRef.current.material as THREE.ShaderMaterial;
        starMat.uniforms.color1.value.set(theme.starColors.color1);
        starMat.uniforms.color2.value.set(theme.starColors.color2);

        planetsRef.current.forEach((p, idx) => {
            const pd = theme.planetData[idx];
            p.material.uniforms.baseColor.value.set(...pd.baseColor);
            p.material.uniforms.accentColor.value.set(...pd.accentColor);
        });

        particleSystemsRef.current.forEach((ps, idx) => {
            const c = new THREE.Color(theme.planetData[idx].trailColor);
            const col = ps.system.geometry.attributes.color;
            for (let j = 0; j < col.count; j++) col.setXYZ(j, c.r, c.g, c.b);
            col.needsUpdate = true;
        });

        ambientLightRef.current?.color.set(theme.ambientLightColor);
        starLightRef.current?.color.set(theme.starLightColor);
        blueLightRef.current?.color.set(theme.directionalLights.color1);
        purpleLightRef.current?.color.set(theme.directionalLights.color2);
        metalMaterialRef.current?.color.set(theme.metalMaterialColor);
        ringMaterialRef.current?.color.set(theme.ringColor);
    }, []);

    const createParticleTrail = useCallback((planet: THREE.Mesh, color: number, radius: number) => {
        const count = 50;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        const c = new THREE.Color(color);
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            positions[i * 3] = Math.cos(angle) * radius;
            positions[i * 3 + 1] = 0;
            positions[i * 3 + 2] = Math.sin(angle) * radius;
            colors[i * 3] = c.r;
            colors[i * 3 + 1] = c.g;
            colors[i * 3 + 2] = c.b;
            sizes[i] = Math.random() * 0.5 + 0.1;
        }
        const geom = new THREE.BufferGeometry();
        geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        geom.setAttribute("color", new THREE.BufferAttribute(colors, 3));
        geom.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
        const mat = new THREE.PointsMaterial({
            size: 0.3,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true,
        });
        const points = new THREE.Points(geom, mat);
        planet.parent?.add(points);
        particleSystemsRef.current.push({
            system: points,
            planet: planet,
            positions: positions,
            radius: radius,
            currentIndex: 0,
        });
    }, []);

    const createEnhancedArc = useCallback((obj1: THREE.Object3D, obj2: THREE.Object3D, duration: number) => {
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                color: { value: new THREE.Color(themes[currentThemeIndex].arcColor) },
                opacity: { value: 0 },
                energy: { value: 0 },
            },
            vertexShader: arcVertexShader,
            fragmentShader: arcFragmentShader,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });

        // Use a simple Line with BufferGeometry for performance
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(50 * 3);
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        // Setup UVs for shader
        const uvs = new Float32Array(50);
        for(let i=0; i<50; i++) uvs[i] = i/49;
        geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 1));

        const line = new THREE.Line(geometry, material);
        sceneRef.current?.add(line);

        const arcEffect = {
            type: "arc",
            mesh: line,
            material: material,
            startTime: clockRef.current.getElapsedTime(),
            duration: duration,
            obj1: obj1,
            obj2: obj2,
            update: (elapsed: number) => {
                const prog = elapsed / arcEffect.duration;
                if (prog > 1) return;
                const p1 = new THREE.Vector3(),
                    p2 = new THREE.Vector3();
                obj1.getWorldPosition(p1);
                obj2.getWorldPosition(p2);
                const mid = p1.clone().lerp(p2, 0.5);
                const ctrl = mid
                    .clone()
                    .add(new THREE.Vector3(0, p1.distanceTo(p2) * 0.5, 0));
                
                const curve = new THREE.QuadraticBezierCurve3(p1, ctrl, p2);
                const points = curve.getPoints(49);
                
                const posAttr = line.geometry.attributes.position as THREE.BufferAttribute;
                for(let i=0; i<50; i++) {
                    posAttr.setXYZ(i, points[i].x, points[i].y, points[i].z);
                }
                posAttr.needsUpdate = true;

                const intens = Math.sin(prog * Math.PI);
                material.uniforms.opacity.value = intens * 0.9;
                material.uniforms.energy.value = intens * 2;
                material.uniforms.time.value = clockRef.current.getElapsedTime();
            },
            end: () => {
                sceneRef.current?.remove(line);
                line.geometry.dispose();
                material.dispose();
            },
        };
        activeEffectsRef.current.push(arcEffect);
    }, []); // Removed currentThemeIndex dependency to avoid re-creation



    const activateResonance = () => {
        if (isResonanceActive) return;
        setIsResonanceActive(true);
        planetsRef.current.forEach(
            (p) => (p.body.userData.baseOrbitSpeed = p.group.userData.orbitSpeed),
        );
        const activationEffect = {
            type: "activation",
            startTime: clockRef.current.getElapsedTime(),
            duration: 8,
            update: (elapsed: number) => {
                const prog = elapsed / activationEffect.duration;
                const intens = Math.sin(prog * Math.PI) * 3;
                if (starLightRef.current) starLightRef.current.intensity = 3 + intens * 3;
                if (starRef.current) (starRef.current.material as THREE.ShaderMaterial).uniforms.intensity.value = 1 + intens * 2;
                if (metalMaterialRef.current) metalMaterialRef.current.emissiveIntensity = 0.4 + intens * 2;
                planetsRef.current.forEach((p) => {
                    p.group.userData.orbitSpeed =
                        p.body.userData.baseOrbitSpeed * (1 + intens * 1.5);
                    p.material.uniforms.energy.value = intens;
                });
            },
            end: () => {
                if (starLightRef.current) starLightRef.current.intensity = 3;
                if (starRef.current) (starRef.current.material as THREE.ShaderMaterial).uniforms.intensity.value = 1;
                if (metalMaterialRef.current) metalMaterialRef.current.emissiveIntensity = 0.4;
                planetsRef.current.forEach((p) => {
                    p.group.userData.orbitSpeed = p.body.userData.baseOrbitSpeed;
                    p.material.uniforms.energy.value = 0;
                });
                setIsResonanceActive(false);
            },
        };
        activeEffectsRef.current.push(activationEffect);
        for (let i = 0; i < planetsRef.current.length; i++) {
            createEnhancedArc(
                planetsRef.current[i].body,
                i === 0 ? starRef.current! : planetsRef.current[i - 1].body,
                6,
            );
        }
    };

    useEffect(() => {
        if (!containerRef.current) return;

        // --- HMR / Ghost Canvas Safeguard ---
        // Force cleanup any existing canvas elements inside the container
        while (containerRef.current.firstChild) {
            containerRef.current.removeChild(containerRef.current.firstChild);
        }

        // Clear refs to prevent duplicates in React Strict Mode double-mounts
        planetsRef.current = [];
        activeEffectsRef.current = [];
        particleSystemsRef.current = [];

        // Scene init
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        const clock = clockRef.current;

        const camera = new THREE.PerspectiveCamera(
            55,
            window.innerWidth / window.innerHeight,
            0.1,
            3000,
        );
        camera.position.set(25, 20, 25);
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({
            antialias: false, // Turn off antialias for better mobile performance
            powerPreference: "high-performance",
            alpha: true
        });

        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        containerRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.03;
        controls.minDistance = 8;
        controls.maxDistance = 150;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.15;
        controls.enablePan = false;
        controls.enableZoom = false; // Disable scroll-zoom to allow page scrolling
        
        // Disable manual rotation on small screens to allow native page scroll
        controls.enableRotate = window.innerWidth > 640;

        controlsRef.current = controls;

        // Apply initial theme
        applyTheme(currentThemeIndexRef.current);


        // Lighting
        const ambientLight = new THREE.AmbientLight(0x1a2440, 0.8);
        scene.add(ambientLight);
        ambientLightRef.current = ambientLight;

        const starLight = new THREE.PointLight(0xffe4b5, 3, 120, 1.8);
        starLight.castShadow = true;
        starLight.shadow.mapSize.width = 1024;
        starLight.shadow.mapSize.height = 1024;
        scene.add(starLight);
        starLightRef.current = starLight;

        const blueLight = new THREE.DirectionalLight(0x4488ff, 0.5);
        blueLight.position.set(-50, 30, -30);
        scene.add(blueLight);
        blueLightRef.current = blueLight;

        const purpleLight = new THREE.DirectionalLight(0x8844ff, 0.3);
        purpleLight.position.set(30, -20, 50);
        scene.add(purpleLight);
        purpleLightRef.current = purpleLight;

        // Orrery Group
        const orrery = new THREE.Group();
        scene.add(orrery);
        orreryRef.current = orrery;

        const metalMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a6080,
            metalness: 0.95,
            roughness: 0.2,
            emissive: 0x1a2540,
            emissiveIntensity: 0.4,
            envMapIntensity: 1.5,
        });
        metalMaterialRef.current = metalMaterial;

        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0x88ccff,
            wireframe: true,
            transparent: true,
            opacity: 0.4,
        });
        ringMaterialRef.current = ringMaterial;

        // Star
        const starGeo = new THREE.IcosahedronGeometry(2.2, 2);
        const starMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                intensity: { value: 1 },
                color1: { value: new THREE.Color(themes[0].starColors.color1) },
                color2: { value: new THREE.Color(themes[0].starColors.color2) },
            },
            vertexShader: starVertexShader,
            fragmentShader: starFragmentShader,
        });
        const star = new THREE.Mesh(starGeo, starMaterial);
        star.castShadow = false;
        star.receiveShadow = false;
        orrery.add(star);
        starRef.current = star;

        // Gears
        for (let i = 0; i < 7; i++) {
            const gearGeo = new THREE.TorusGeometry(2.8 + i * 0.5, 0.18, 12, 64);
            const gear = new THREE.Mesh(gearGeo, metalMaterial);
            gear.rotation.x = Math.PI / 2;
            gear.position.y = -2 - i * 0.25;
            gear.userData.rotationSpeed = (i % 2 === 0 ? 1 : -1) * (0.08 + i * 0.04);
            gear.castShadow = true;
            gear.receiveShadow = true;
            orrery.add(gear);
        }

        // Planets
        const planetGeometries = [
            new THREE.OctahedronGeometry(0.6, 1),
            new THREE.DodecahedronGeometry(0.9, 1),
            new THREE.IcosahedronGeometry(0.7, 1),
        ];
        const planetBaseData = [
            { size: 0.6, distance: 8, speed: 0.6 },
            { size: 0.9, distance: 14, speed: 0.35 },
            { size: 0.7, distance: 22, speed: 0.25 },
        ];

        planetBaseData.forEach((data, i) => {
            const planetGroup = new THREE.Group();
            planetGroup.userData.orbitSpeed = data.speed;
            planetGroup.rotation.y = Math.random() * Math.PI * 2;
            orrery.add(planetGroup);

            const ringGeo = new THREE.TorusGeometry(data.distance, 0.08, 20, 128);
            const ring = new THREE.Mesh(ringGeo, ringMaterial);
            ring.rotation.x = Math.PI / 2;
            planetGroup.add(ring);

            const planetMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    time: { value: 0 },
                    baseColor: { value: new THREE.Vector3(...themes[0].planetData[i].baseColor) },
                    accentColor: { value: new THREE.Vector3(...themes[0].planetData[i].accentColor) },
                    energy: { value: 0 },
                },
                vertexShader: planetVertexShader,
                fragmentShader: planetFragmentShader,
            });

            const planet = new THREE.Mesh(planetGeometries[i], planetMaterial);
            planet.position.x = data.distance;
            planet.userData.selfRotation = 0.6;
            planet.castShadow = true;
            planet.receiveShadow = true;
            planetGroup.add(planet);

            createParticleTrail(planet, themes[0].planetData[i].trailColor, data.distance);

            planetsRef.current.push({
                group: planetGroup,
                body: planet,
                material: planetMaterial,
            });
        });

        // Background Stars
        const layers = [
            { count: 3000, distance: [600, 1000], size: [0.8, 1.5], color: 0x6688bb },
            { count: 2000, distance: [1000, 1500], size: [1, 2], color: 0x88aadd },
            { count: 1000, distance: [1500, 2000], size: [1.5, 3], color: 0xaaccff },
        ];
        layers.forEach((layer) => {
            const positions = new Float32Array(layer.count * 3);
            const colors = new Float32Array(layer.count * 3);
            const sizes = new Float32Array(layer.count);
            const c = new THREE.Color(layer.color);
            for (let i = 0; i < layer.count; i++) {
                const u = Math.random(), v = Math.random();
                const theta = 2 * Math.PI * u;
                const phi = Math.acos(2 * v - 1);
                const r = layer.distance[0] + Math.random() * (layer.distance[1] - layer.distance[0]);
                positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
                positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
                positions[i * 3 + 2] = r * Math.cos(phi);
                colors[i * 3] = c.r;
                colors[i * 3 + 1] = c.g;
                colors[i * 3 + 2] = c.b;
                sizes[i] = layer.size[0] + Math.random() * (layer.size[1] - layer.size[0]);
            }
            const geom = new THREE.BufferGeometry();
            geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
            geom.setAttribute("color", new THREE.BufferAttribute(colors, 3));
            geom.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
            const mat = new THREE.PointsMaterial({
                size: 2,
                vertexColors: true,
                sizeAttenuation: true,
                transparent: true,
                opacity: 0.8,
            });
            const stars = new THREE.Points(geom, mat);
            scene.add(stars);
        });

        // Post Processing
        const composer = new EffectComposer(renderer);
        composer.addPass(new RenderPass(scene, camera));
        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(containerRef.current.clientWidth, containerRef.current.clientHeight),
            0.6,
            0.5,
            0.15
        );
        composer.addPass(bloomPass);
        composer.addPass(new OutputPass());
        composerRef.current = composer;

        // Resize handler
        const onResize = () => {
            if (!containerRef.current) return;
            const width = containerRef.current.clientWidth;
            const height = containerRef.current.clientHeight;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
            composer.setSize(width, height);
            
            // Re-evaluate mobile scrolling lock
            controls.enableRotate = window.innerWidth > 640;
        };
        window.addEventListener("resize", onResize);

        // Animation Loop
        let animationFrameId: number;
        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            const delta = clock.getDelta() * timeAccelerationRef.current;
            const t = clock.getElapsedTime();


            if (starRef.current) {
                starRef.current.rotation.y += delta * 0.3;
                starRef.current.rotation.x += delta * 0.15;
                (starRef.current.material as THREE.ShaderMaterial).uniforms.time.value = t;
            }

            if (orreryRef.current) {
                orreryRef.current.children.forEach((c) => {
                    if (c.userData.rotationSpeed)
                        c.rotation.z += delta * c.userData.rotationSpeed;
                });
            }

            planetsRef.current.forEach((p) => {
                p.group.rotation.y += delta * p.group.userData.orbitSpeed;
                p.body.rotation.y += delta * p.body.userData.selfRotation;
                p.body.rotation.z += delta * p.body.userData.selfRotation * 0.3;
                p.material.uniforms.time.value = t;
            });

            // particleSystemsRef.current.forEach(
            //     (ps) => (ps.system.geometry.attributes.position.needsUpdate = true),
            // );


            for (let i = activeEffectsRef.current.length - 1; i >= 0; i--) {
                const e = activeEffectsRef.current[i];
                const elapsed = t - e.startTime;
                if (elapsed > e.duration) {
                    e.end();
                    activeEffectsRef.current.splice(i, 1);
                } else {
                    e.update(elapsed, delta);
                }
            }

            controls.update();
            composer.render(delta);
        };
        animate();

        // Cleanup
        return () => {
            window.removeEventListener("resize", onResize);
            cancelAnimationFrame(animationFrameId);
            renderer.dispose();
            controls.dispose();
            
            if (containerRef.current && renderer.domElement) {
                try {
                    containerRef.current.removeChild(renderer.domElement);
                } catch (e) {
                    console.warn("Canvas already removed");
                }
            }
            
            // Comprehensive cleanup
            scene.traverse((object) => {
                if (object instanceof THREE.Mesh || object instanceof THREE.Points || object instanceof THREE.Line) {
                    object.geometry.dispose();
                    if (Array.isArray(object.material)) {
                        object.material.forEach(m => m.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            });
        };
    }, [particleCount]); // Only rebuild if particle count changes


    // Update time acceleration in state only for UI feedback, logic uses timeAcceleration ref
    useEffect(() => {
        timeAccelerationRef.current = speed;
        setTimeAcceleration(speed);
    }, [speed]);

    // Handle external theme prop changes
    useEffect(() => {
        const index = themes.findIndex(t => t.name === initialTheme);
        if (index !== -1 && index !== currentThemeIndexRef.current) {
            currentThemeIndexRef.current = index;
            setCurrentThemeIndex(index);
            applyTheme(index);
        }
    }, [initialTheme, applyTheme]);



    const handleResetView = () => {
        console.log("[GalaxyAnimation] handleResetView clicked");
        if (cameraRef.current && controlsRef.current) {
            cameraRef.current.position.set(25, 20, 25);
            controlsRef.current.target.set(0, 0, 0);
            controlsRef.current.update();
        }
    };

    const handleToggleTime = () => {
        const nextTime = (timeAccelerationRef.current === 1 ? 3 : timeAccelerationRef.current === 3 ? 0.5 : 1);
        timeAccelerationRef.current = nextTime;
        setTimeAcceleration(nextTime);
    };

    const handleToggleTheme = () => {
        const nextIndex = (currentThemeIndexRef.current + 1) % themes.length;
        currentThemeIndexRef.current = nextIndex;
        setCurrentThemeIndex(nextIndex);
        applyTheme(nextIndex);
    };



    return (
        <div className={styles.container}>
            <div ref={containerRef} className={styles.canvasContainer} />
            
            <div className={styles.stats}>
                <div>Systems: Active</div>
                <div>Resonance: Stable</div>
                <div>Phase: Nominal</div>
            </div>

            <div className={styles.controls}>
                <button className={styles.controlButton} onClick={handleResetView}>
                    <span></span><span></span><span></span><span></span><span>Reset View</span>
                </button>
                <button 
                    className={`${styles.controlButton} ${styles.activateButton}`} 
                    onClick={activateResonance}
                >
                    <span></span><span></span><span></span><span></span>
                    <span>{isResonanceActive ? "Resonance Active" : "Activate Resonance"}</span>
                </button>
                <button className={styles.controlButton} onClick={handleToggleTime}>
                    <span></span><span></span><span></span><span></span>
                    <span>Time: {timeAcceleration}x</span>
                </button>
                <button className={styles.controlButton} onClick={handleToggleTheme}>
                    <span></span><span></span><span></span><span></span>
                    <span>Theme: {themes[currentThemeIndex].name}</span>
                </button>
            </div>
        </div>
    );
};

export default GalaxyAnimation;
