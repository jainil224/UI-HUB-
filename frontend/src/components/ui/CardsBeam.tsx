import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import './CardsBeam.css';
import Logo from './Logo';

const codeChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789(){}[]<>;:,._-+=!@#$%^&*|\\/\"'`~?";

export const CardsBeam = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const cardStreamRef = useRef<HTMLDivElement>(null);
    const cardLineRef = useRef<HTMLDivElement>(null);
    const particleCanvasRef = useRef<HTMLCanvasElement>(null);
    const scannerCanvasRef = useRef<HTMLCanvasElement>(null);
    const [speed, setSpeed] = useState(120);
    const [isPaused, setIsPaused] = useState(false);

    // Controller references to be cleanup up
    const controllers = useRef<{
        cardStream: any;
        particleSystem: any;
        particleScanner: any;
    }>({ cardStream: null, particleSystem: null, particleScanner: null });

    useEffect(() => {
        if (!containerRef.current || !cardStreamRef.current || !cardLineRef.current || !particleCanvasRef.current || !scannerCanvasRef.current) return;

        // --- CardStreamController ---
        class CardStreamController {
            container: HTMLElement;
            cardLine: HTMLElement;
            position: number;
            velocity: number;
            direction: number;
            isAnimating: boolean;
            isDragging: boolean;
            lastTime: number;
            lastMouseX: number;
            mouseVelocity: number;
            friction: number;
            minVelocity: number;
            containerWidth: number;
            cardLineWidth: number;
            animationFrame: number | null = null;
            updateInterval: any = null;

            constructor(container: HTMLElement, cardLine: HTMLElement, setSpeed: (s: number) => void) {
                this.container = container;
                this.cardLine = cardLine;
                this.position = 0;
                this.velocity = 120;
                this.direction = -1;
                this.isAnimating = true;
                this.isDragging = false;
                this.lastTime = 0;
                this.lastMouseX = 0;
                this.mouseVelocity = 0;
                this.friction = 0.95;
                this.minVelocity = 30;
                this.containerWidth = 0;
                this.cardLineWidth = 0;
                this.init();
            }

            init() {
                this.populateCardLine();
                this.calculateDimensions();
                this.setupEventListeners();
                this.updateCardPosition();
                this.animate();
                this.startPeriodicUpdates();
            }

            calculateDimensions() {
                this.containerWidth = this.container.offsetWidth;
                const cardWidth = 400;
                const cardGap = 20; // Matches CSS gap
                const cardCount = this.cardLine.children.length;
                this.cardLineWidth = (cardWidth + cardGap) * cardCount;
            }

            setupEventListeners() {
                const onMouseDown = (e: MouseEvent) => this.startDrag(e);
                const onMouseMove = (e: MouseEvent) => this.onDrag(e);
                const onMouseUp = () => this.endDrag();
                const onTouchStart = (e: TouchEvent) => this.startDrag(e.touches[0] as any);
                const onTouchMove = (e: TouchEvent) => this.onDrag(e.touches[0] as any);
                const onTouchEnd = () => this.endDrag();
                const onWheel = (e: WheelEvent) => this.onWheel(e);
                const onResize = () => this.calculateDimensions();

                this.cardLine.addEventListener("mousedown", onMouseDown as any);
                document.addEventListener("mousemove", onMouseMove as any);
                document.addEventListener("mouseup", onMouseUp);
                this.cardLine.addEventListener("touchstart", onTouchStart as any, { passive: false });
                document.addEventListener("touchmove", onTouchMove as any, { passive: false });
                document.addEventListener("touchend", onTouchEnd);
                this.cardLine.addEventListener("wheel", onWheel as any);
                window.addEventListener("resize", onResize);

                (this as any)._cleanup = () => {
                    this.cardLine.removeEventListener("mousedown", onMouseDown as any);
                    document.removeEventListener("mousemove", onMouseMove as any);
                    document.removeEventListener("mouseup", onMouseUp);
                    this.cardLine.removeEventListener("touchstart", onTouchStart as any);
                    document.removeEventListener("touchmove", onTouchMove as any);
                    document.removeEventListener("touchend", onTouchEnd);
                    this.cardLine.removeEventListener("wheel", onWheel as any);
                    window.removeEventListener("resize", onResize);
                };
            }

            startDrag(e: MouseEvent) {
                this.isDragging = true;
                this.isAnimating = false;
                this.lastMouseX = e.clientX;
                this.mouseVelocity = 0;
                this.cardLine.classList.add("dragging");
            }

            onDrag(e: MouseEvent) {
                if (!this.isDragging) return;
                const deltaX = e.clientX - this.lastMouseX;
                this.position += deltaX;
                this.mouseVelocity = deltaX * 60;
                this.lastMouseX = e.clientX;
                this.updateCardPosition();
            }

            endDrag() {
                if (!this.isDragging) return;
                this.isDragging = false;
                this.cardLine.classList.remove("dragging");
                if (Math.abs(this.mouseVelocity) > this.minVelocity) {
                    this.velocity = Math.abs(this.mouseVelocity);
                    this.direction = this.mouseVelocity > 0 ? 1 : -1;
                } else {
                    this.velocity = 120;
                }
                this.isAnimating = true;
                setSpeed(Math.round(this.velocity));
            }

            animate() {
                const currentTime = performance.now();
                const deltaTime = (currentTime - this.lastTime) / 1000;
                this.lastTime = currentTime;

                if (this.isAnimating && !this.isDragging) {
                    if (this.velocity > this.minVelocity) {
                        this.velocity *= this.friction;
                    } else {
                        this.velocity = Math.max(this.minVelocity, this.velocity);
                    }
                    this.position += this.velocity * this.direction * deltaTime;
                    this.updateCardPosition();
                    setSpeed(Math.round(this.velocity));
                }
                this.animationFrame = requestAnimationFrame(() => this.animate());
            }

            updateCardPosition() {
                if (this.position < -this.cardLineWidth) {
                    this.position = this.containerWidth;
                } else if (this.position > this.containerWidth) {
                    this.position = -this.cardLineWidth;
                }
                this.cardLine.style.transform = `translateX(${this.position}px)`;
                this.updateCardClipping();
            }

            updateCardClipping() {
                if (!this.container) return;
                
                const containerRect = this.container.getBoundingClientRect();
                const scannerX = containerRect.left + containerRect.width / 2;
                const scannerWidth = 8;
                const scannerLeft = scannerX - scannerWidth / 2;
                const scannerRight = scannerX + scannerWidth / 2;
                let anyScanningActive = false;

                this.cardLine.querySelectorAll(".card-wrapper").forEach((wrapper: any) => {
                    const rect = wrapper.getBoundingClientRect();
                    const cardLeft = rect.left;
                    const cardRight = rect.right;
                    const cardWidth = rect.width;
                    const normalCard = wrapper.querySelector(".card-normal");
                    const asciiCard = wrapper.querySelector(".card-ascii");

                    if (cardLeft < scannerRight && cardRight > scannerLeft) {
                        anyScanningActive = true;
                        
                        // Calculate intersection relative to the card's left edge
                        const scannerIntersectLeft = Math.max(scannerLeft - cardLeft, 0);
                        const scannerIntersectRight = Math.min(scannerRight - cardLeft, cardWidth);
                        
                        // We want the part to the LEFT of the scanner to be ASCII
                        // and the part to the RIGHT of the scanner to be Normal.
                        
                        // Normal card should be clipped from its LEFT side up to the scanner position
                        const normalClipLeft = (scannerIntersectRight / cardWidth) * 100;
                        
                        // ASCII card should be clipped from its RIGHT side starting from the scanner position
                        const asciiClipRight = (1 - (scannerIntersectLeft / cardWidth)) * 100;

                        normalCard.style.setProperty("--clip-left", `${normalClipLeft}%`);
                        asciiCard.style.setProperty("--clip-right", `${asciiClipRight}%`);

                        if (!wrapper.hasAttribute("data-scanned") && scannerIntersectLeft > 0) {
                            wrapper.setAttribute("data-scanned", "true");
                            const scanEffect = document.createElement("div");
                            scanEffect.className = "scan-effect";
                            wrapper.appendChild(scanEffect);
                            setTimeout(() => scanEffect.remove(), 600);
                        }
                    } else {
                        // Fully to the left of scanner -> should be pure ASCII
                        if (cardRight < scannerLeft) {
                            normalCard.style.setProperty("--clip-left", "100%");
                            asciiCard.style.setProperty("--clip-right", "0%");
                        } 
                        // Fully to the right of scanner -> should be pure Normal
                        else {
                            normalCard.style.setProperty("--clip-left", "0%");
                            asciiCard.style.setProperty("--clip-right", "100%");
                        }
                        wrapper.removeAttribute("data-scanned");
                    }
                });
                if ((window as any).setScannerScanning) (window as any).setScannerScanning(anyScanningActive);
            }

            onWheel(e: WheelEvent) {
                e.preventDefault();
                const scrollSpeed = 0.5;
                const delta = e.deltaY * scrollSpeed;
                this.position -= delta;
                this.updateCardPosition();
            }

            generateCode(width: number, height: number) {
                let out = "";
                for (let i = 0; i < height; i++) {
                    let line = "";
                    for (let j = 0; j < width; j++) {
                        line += codeChars[Math.floor(Math.random() * codeChars.length)];
                    }
                    out += line + (i < height - 1 ? "\n" : "");
                }
                return out;
            }

            populateCardLine() {
                this.cardLine.innerHTML = "";
                const cardImages = [
                    "https://cdn.prod.website-files.com/68789c86c8bc802d61932544/689f20b55e654d1341fb06f8_4.1.png",
                    "https://cdn.prod.website-files.com/68789c86c8bc802d61932544/689f20b5a080a31ee7154b19_1.png",
                    "https://cdn.prod.website-files.com/68789c86c8bc802d61932544/689f20b5c1e4919fd69672b8_3.png",
                    "https://cdn.prod.website-files.com/68789c86c8bc802d61932544/689f20b5f6a5e232e7beb4be_2.png",
                    "https://cdn.prod.website-files.com/68789c86c8bc802d61932544/689f20b5bea2f1b07392d936_4.png",
                ];
                for (let i = 0; i < 20; i++) {
                    const wrapper = document.createElement("div");
                    wrapper.className = "card-wrapper";
                    wrapper.innerHTML = `
                        <div class="card card-normal">
                            <img class="card-image" src="${cardImages[i % cardImages.length]}" alt="Card" />
                        </div>
                        <div class="card card-ascii">
                            <div class="ascii-content" style="font-size:11px; line-height:13px;">${this.generateCode(60, 20)}</div>
                        </div>
                    `;
                    this.cardLine.appendChild(wrapper);
                }
            }

            startPeriodicUpdates() {
                this.updateInterval = setInterval(() => {
                    this.cardLine.querySelectorAll(".ascii-content").forEach((el: any) => {
                        if (Math.random() < 0.15) el.textContent = this.generateCode(60, 20);
                    });
                }, 200);
            }

            destroy() {
                if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
                if (this.updateInterval) clearInterval(this.updateInterval);
                if ((this as any)._cleanup) (this as any)._cleanup();
            }
        }

        // --- ParticleSystem (Three.js) ---
        class ParticleSystem {
            scene: THREE.Scene;
            camera: THREE.OrthographicCamera;
            renderer: THREE.WebGLRenderer;
            particles: THREE.Points | null = null;
            particleCount = 200;
            velocities: Float32Array;
            alphas: Float32Array;
            animationFrame: number | null = null;

            constructor(canvas: HTMLCanvasElement) {
                this.scene = new THREE.Scene();
                this.camera = new THREE.OrthographicCamera(-window.innerWidth / 2, window.innerWidth / 2, 125, -125, 1, 1000);
                this.camera.position.z = 100;
                this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
                this.renderer.setSize(window.innerWidth, 250);
                this.renderer.setClearColor(0x000000, 0);
                this.velocities = new Float32Array(this.particleCount);
                this.alphas = new Float32Array(this.particleCount);
                this.init();
            }

            init() {
                const geometry = new THREE.BufferGeometry();
                const positions = new Float32Array(this.particleCount * 3);
                for (let i = 0; i < this.particleCount; i++) {
                    positions[i * 3] = (Math.random() - 0.5) * window.innerWidth * 2;
                    positions[i * 3 + 1] = (Math.random() - 0.5) * 250;
                    positions[i * 3 + 2] = 0;
                    this.velocities[i] = Math.random() * 60 + 30;
                    this.alphas[i] = (Math.random() * 8 + 2) / 10;
                }
                geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
                geometry.setAttribute("alpha", new THREE.BufferAttribute(this.alphas, 1));
                const material = new THREE.ShaderMaterial({
                    uniforms: { size: { value: 4.0 } },
                    vertexShader: `
                        attribute float alpha;
                        varying float vAlpha;
                        void main() {
                            vAlpha = alpha;
                            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                            gl_PointSize = size;
                            gl_Position = projectionMatrix * mvPosition;
                        }
                    `,
                    fragmentShader: `
                        varying float vAlpha;
                        void main() {
                            gl_FragColor = vec4(0.5, 0.7, 1.0, vAlpha);
                        }
                    `,
                    transparent: true,
                    blending: THREE.AdditiveBlending,
                    depthWrite: false,
                });
                this.particles = new THREE.Points(geometry, material);
                this.scene.add(this.particles);
                this.animate();
            }

            animate() {
                if (this.particles) {
                    const positions = this.particles.geometry.attributes.position.array as Float32Array;
                    const alphas = this.particles.geometry.attributes.alpha.array as Float32Array;
                    for (let i = 0; i < this.particleCount; i++) {
                        positions[i * 3] += this.velocities[i] * 0.016;
                        if (positions[i * 3] > window.innerWidth / 2 + 100) {
                            positions[i * 3] = -window.innerWidth / 2 - 100;
                        }
                        if (Math.random() < 0.01) alphas[i] = Math.random();
                    }
                    this.particles.geometry.attributes.position.needsUpdate = true;
                    this.particles.geometry.attributes.alpha.needsUpdate = true;
                }
                this.renderer.render(this.scene, this.camera);
                this.animationFrame = requestAnimationFrame(() => this.animate());
            }

            destroy() {
                if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
                this.renderer.dispose();
                if (this.particles) {
                    this.particles.geometry.dispose();
                    (this.particles.material as THREE.Material).dispose();
                }
            }
        }

        // --- ParticleScanner (Canvas 2D) ---
        class ParticleScanner {
            canvas: HTMLCanvasElement;
            ctx: CanvasRenderingContext2D;
            particles: any[] = [];
            w: number;
            h: number;
            animationFrame: number | null = null;
            scanningActive = false;

            constructor(canvas: HTMLCanvasElement) {
                this.canvas = canvas;
                this.ctx = canvas.getContext("2d")!;
                this.w = window.innerWidth;
                this.h = 300;
                this.canvas.width = this.w;
                this.canvas.height = this.h;
                this.init();
            }

            init() {
                for (let i = 0; i < 100; i++) this.particles.push(this.createParticle());
                this.animate();
                (window as any).setScannerScanning = (active: boolean) => this.scanningActive = active;
            }

            createParticle() {
                return {
                    x: this.w / 2 + (Math.random() - 0.5) * 4,
                    y: Math.random() * this.h,
                    vx: Math.random() * 2 + 1,
                    vy: (Math.random() - 0.5) * 0.5,
                    life: Math.random(),
                    alpha: Math.random(),
                };
            }

            animate() {
                this.ctx.clearRect(0, 0, this.w, this.h);
                if (this.scanningActive) {
                    this.ctx.fillStyle = "rgba(0, 255, 255, 0.5)";
                    this.particles.forEach(p => {
                        p.x += p.vx;
                        p.y += p.vy;
                        p.life -= 0.01;
                        if (p.life < 0 || p.x > this.w) Object.assign(p, this.createParticle());
                        this.ctx.globalAlpha = p.life;
                        this.ctx.fillRect(p.x, p.y, 2, 2);
                    });
                }
                this.animationFrame = requestAnimationFrame(() => this.animate());
            }

            destroy() {
                if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
            }
        }

        controllers.current.cardStream = new CardStreamController(cardStreamRef.current, cardLineRef.current, setSpeed);
        controllers.current.particleSystem = new ParticleSystem(particleCanvasRef.current);
        controllers.current.particleScanner = new ParticleScanner(scannerCanvasRef.current);

        return () => {
            controllers.current.cardStream?.destroy();
            controllers.current.particleSystem?.destroy();
            controllers.current.particleScanner?.destroy();
        };
    }, []);

    const togglePause = () => {
        setIsPaused(!isPaused);
        if (controllers.current.cardStream) {
            controllers.current.cardStream.isAnimating = isPaused;
        }
    };

    const resetPosition = () => {
        if (controllers.current.cardStream) {
            controllers.current.cardStream.resetPosition();
        }
    };

    const changeDirection = () => {
        if (controllers.current.cardStream) {
            controllers.current.cardStream.direction *= -1;
        }
    };

    return (
        <div className="cards-beam-container" ref={containerRef}>
            <div className="controls">
                <button className="control-btn" onClick={togglePause}>
                    {isPaused ? "▶️ Play" : "⏸️ Pause"}
                </button>
                <button className="control-btn" onClick={resetPosition}>🔄 Reset</button>
                <button className="control-btn" onClick={changeDirection}>↔️ Direction</button>
            </div>

            <div className="speed-indicator">
                Speed: <span>{speed}</span> px/s
            </div>

            <div className="card-stream" ref={cardStreamRef}>
                <div className="card-line" ref={cardLineRef}></div>
            </div>

            <canvas id="particleCanvas" ref={particleCanvasRef}></canvas>
            <canvas id="scannerCanvas" ref={scannerCanvasRef}></canvas>
            <div className="scanner" style={{ display: 'block' }}></div>
            
            <div className="cards-beam-branding">
                <Logo showText={true} className="w-6 h-6" />
            </div>
        </div>
    );
};

export default CardsBeam;

