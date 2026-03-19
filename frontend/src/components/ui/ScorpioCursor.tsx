import React, { useEffect, useRef, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface ScorpioCursorProps {
    /** Color of the scorpion lines */
    color?: string;
    /** Scale factor for the scorpion size */
    size?: number;
    /** Optional ref to the container for local tracking */
    containerRef?: React.RefObject<HTMLElement>;
    /** Background color of the canvas (usually transparent to see content) */
    backgroundColor?: string;
    /** Whether the component is interactive (follows mouse) */
    interactive?: boolean;
    /** Optional class name for the canvas container */
    className?: string;
}

// ─── Logic Classes (Ported from reference) ───────────────────────────────────

class Segment {
    parent: any;
    children: Segment[];
    size: number;
    relAngle: number;
    defAngle: number;
    absAngle: number;
    range: number;
    stiffness: number;
    x: number = 0;
    y: number = 0;
    isSegment: boolean = true;

    constructor(parent: any, size: number, angle: number, range: number, stiffness: number) {
        this.parent = parent;
        if (typeof parent.children === 'object') {
            parent.children.push(this);
        }
        this.children = [];
        this.size = size;
        this.relAngle = angle;
        this.defAngle = angle;
        this.absAngle = (parent.absAngle || 0) + angle;
        this.range = range;
        this.stiffness = stiffness;
        this.updateRelative(false, true);
    }

    updateRelative(iter: boolean, flex: boolean) {
        this.relAngle =
            this.relAngle -
            2 *
            Math.PI *
            Math.floor((this.relAngle - this.defAngle) / 2 / Math.PI + 1 / 2);
        if (flex) {
            this.relAngle = Math.min(
                this.defAngle + this.range / 2,
                Math.max(
                    this.defAngle - this.range / 2,
                    (this.relAngle - this.defAngle) / this.stiffness + this.defAngle
                )
            );
        }
        this.absAngle = (this.parent.absAngle || 0) + this.relAngle;
        this.x = this.parent.x + Math.cos(this.absAngle) * this.size;
        this.y = this.parent.y + Math.sin(this.absAngle) * this.size;
        if (iter) {
            for (let i = 0; i < this.children.length; i++) {
                this.children[i].updateRelative(iter, flex);
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D, iter: boolean) {
        ctx.beginPath();
        ctx.moveTo(this.parent.x, this.parent.y);
        ctx.lineTo(this.x, this.y);
        ctx.stroke();
        if (iter) {
            for (let i = 0; i < this.children.length; i++) {
                this.children[i].draw(ctx, true);
            }
        }
    }

    follow(iter: boolean) {
        const x = this.parent.x;
        const y = this.parent.y;
        const dX = this.x - x;
        const dY = this.y - y;
        const dist = Math.sqrt(dX * dX + dY * dY);
        if (dist > 0) {
            this.x = x + (this.size * dX) / dist;
            this.y = y + (this.size * dY) / dist;
        }
        this.absAngle = Math.atan2(this.y - y, this.x - x);
        this.relAngle = this.absAngle - (this.parent.absAngle || 0);
        this.updateRelative(false, true);
        if (iter) {
            for (let i = 0; i < this.children.length; i++) {
                this.children[i].follow(true);
            }
        }
    }
}

class LimbSystem {
    end: Segment;
    length: number;
    creature: any;
    speed: number;
    nodes: Segment[];
    hip: any;

    constructor(end: Segment, length: number, speed: number, creature: any) {
        this.end = end;
        this.length = Math.max(1, length);
        this.creature = creature;
        this.speed = speed;
        creature.systems.push(this);
        this.nodes = [];
        let node: any = end;
        for (let i = 0; i < length; i++) {
            this.nodes.unshift(node);
            node = node.parent;
            if (!node || !node.isSegment) {
                this.length = i + 1;
                break;
            }
        }
        this.hip = this.nodes[0] ? this.nodes[0].parent : null;
    }

    moveTo(x: number, y: number) {
        this.nodes[0].updateRelative(true, true);
        const dX = x - this.end.x;
        const dY = y - this.end.y;
        const dist = Math.sqrt(dX * dX + dY * dY);
        let len = Math.max(0, dist - this.speed);
        for (let i = this.nodes.length - 1; i >= 0; i--) {
            const node = this.nodes[i];
            const ang = Math.atan2(node.y - y, node.x - x);
            node.x = x + len * Math.cos(ang);
            node.y = y + len * Math.sin(ang);
            x = node.x;
            y = node.y;
            len = node.size;
        }
        for (let i = 0; i < this.nodes.length; i++) {
            const node = this.nodes[i];
            node.absAngle = Math.atan2(node.y - node.parent.y, node.x - node.parent.x);
            node.relAngle = node.absAngle - node.parent.absAngle;
            for (let ii = 0; ii < node.children.length; ii++) {
                const childNode = node.children[ii];
                if (!this.nodes.includes(childNode)) {
                    childNode.updateRelative(true, false);
                }
            }
        }
    }

    update(x: number, y: number) {
        this.moveTo(x, y);
    }
}

class LegSystem extends LimbSystem {
    goalX: number;
    goalY: number;
    step: number;
    forwardness: number;
    reach: number;
    swing: number;
    swingOffset: number;

    constructor(end: Segment, length: number, speed: number, creature: any) {
        super(end, length, speed, creature);
        this.goalX = end.x;
        this.goalY = end.y;
        this.step = 0;
        this.forwardness = 0;

        const dX = this.end.x - this.hip.x;
        const dY = this.end.y - this.hip.y;
        this.reach = 0.9 * Math.sqrt(dX * dX + dY * dY);
        let relAngle = this.creature.absAngle - Math.atan2(this.end.y - this.hip.y, this.end.x - this.hip.x);
        relAngle -= 2 * Math.PI * Math.floor(relAngle / 2 / Math.PI + 1 / 2);
        this.swing = -relAngle + (2 * (relAngle < 0 ? 1 : 0) - 1) * (Math.PI / 2);
        this.swingOffset = this.creature.absAngle - this.hip.absAngle;
    }

    update(x: number, y: number) {
        this.moveTo(this.goalX, this.goalY);
        if (this.step === 0) {
            const dX = this.end.x - this.goalX;
            const dY = this.end.y - this.goalY;
            const dist = Math.sqrt(dX * dX + dY * dY);
            if (dist > 1) {
                this.step = 1;
                this.goalX =
                    this.hip.x +
                    this.reach * Math.cos(this.swing + this.hip.absAngle + this.swingOffset) +
                    (2 * Math.random() - 1) * (this.reach / 2);
                this.goalY =
                    this.hip.y +
                    this.reach * Math.sin(this.swing + this.hip.absAngle + this.swingOffset) +
                    (2 * Math.random() - 1) * (this.reach / 2);
            }
        } else if (this.step === 1) {
            const theta = Math.atan2(this.end.y - this.hip.y, this.end.x - this.hip.x) - this.hip.absAngle;
            const dX = this.end.x - this.hip.x;
            const dY = this.end.y - this.hip.y;
            const dist = Math.sqrt(dX * dX + dY * dY);
            const forwardness2 = dist * Math.cos(theta);
            const dF = this.forwardness - forwardness2;
            this.forwardness = forwardness2;
            if (dF * dF < 1) {
                this.step = 0;
                this.goalX = this.hip.x + (this.end.x - this.hip.x);
                this.goalY = this.hip.y + (this.end.y - this.hip.y);
            }
        }
    }
}

class Creature {
    x: number;
    y: number;
    absAngle: number;
    children: Segment[];
    systems: any[];
    speed: number = 0;

    constructor(x: number, y: number, angle: number) {
        this.x = x;
        this.y = y;
        this.absAngle = angle;
        this.children = [];
        this.systems = [];
    }

    follow(x: number, y: number, ctx: CanvasRenderingContext2D, strikeActive: boolean, strikePos: { x: number, y: number }) {
        // Direct follow with smoothing (lerp)
        let lerpFactor = strikeActive ? 0.6 : 0.25;
        let targetX = strikeActive ? strikePos.x : x;
        let targetY = strikeActive ? strikePos.y : y;

        const dX = targetX - this.x;
        const dY = targetY - this.y;
        
        this.x += dX * lerpFactor;
        this.y += dY * lerpFactor;

        const angle = Math.atan2(dY, dX);
        
        // Rotation smoothing
        let dif = this.absAngle - angle;
        dif -= 2 * Math.PI * Math.floor(dif / (2 * Math.PI) + 1 / 2);
        this.absAngle -= dif * (strikeActive ? 0.3 : 0.1);

        this.absAngle -= 2 * Math.PI * Math.floor(this.absAngle / (2 * Math.PI) + 1 / 2);
        
        this.absAngle += Math.PI;
        for (let i = 0; i < this.children.length; i++) {
            this.children[i].follow(true);
        }
        for (let i = 0; i < this.systems.length; i++) {
            this.systems[i].update(targetX, targetY);
        }
        this.absAngle -= Math.PI;
        this.draw(ctx, true);
    }

    draw(ctx: CanvasRenderingContext2D, iter: boolean) {
        const r = 4;
        ctx.beginPath();
        ctx.arc(
            this.x,
            this.y,
            r,
            Math.PI / 4 + this.absAngle,
            (7 * Math.PI) / 4 + this.absAngle
        );
        ctx.moveTo(
            this.x + r * Math.cos((7 * Math.PI) / 4 + this.absAngle),
            this.y + r * Math.sin((7 * Math.PI) / 4 + this.absAngle)
        );
        ctx.lineTo(
            this.x + r * Math.cos(this.absAngle) * Math.sqrt(2),
            this.y + r * Math.sin(this.absAngle) * Math.sqrt(2)
        );
        ctx.lineTo(
            this.x + r * Math.cos(Math.PI / 4 + this.absAngle),
            this.y + r * Math.sin(Math.PI / 4 + this.absAngle)
        );
        ctx.stroke();
        if (iter) {
            for (let i = 0; i < this.children.length; i++) {
                this.children[i].draw(ctx, true);
            }
        }
    }
}

// ─── Component ────────────────────────────────────────────────────────────────

export const ScorpioCursor: React.FC<ScorpioCursorProps> = ({
    color = '#ffffff',
    size = 2.5,
    containerRef,
    backgroundColor = 'transparent',
    interactive = true,
    className = '',
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mousePos = useRef({ x: 0, y: 0 });
    const strikePos = useRef({ x: 0, y: 0 });
    const strikeTime = useRef(0);
    const creatureRef = useRef<Creature | null>(null);

    // Track mouse
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (containerRef?.current) {
                const rect = containerRef.current.getBoundingClientRect();
                mousePos.current = { 
                    x: e.clientX - rect.left, 
                    y: e.clientY - rect.top 
                };
            } else {
                mousePos.current = { x: e.clientX, y: e.clientY };
            }
        };

        const handleMouseDown = (e: MouseEvent) => {
            if (containerRef?.current) {
                const rect = containerRef.current.getBoundingClientRect();
                strikePos.current = { 
                    x: e.clientX - rect.left, 
                    y: e.clientY - rect.top 
                };
            } else {
                strikePos.current = { x: e.clientX, y: e.clientY };
            }
            strikeTime.current = performance.now();
        };

        const target = containerRef?.current || window;
        target.addEventListener('mousemove', handleMouseMove as any);
        target.addEventListener('mousedown', handleMouseDown as any);
        return () => {
            target.removeEventListener('mousemove', handleMouseMove as any);
            target.removeEventListener('mousedown', handleMouseDown as any);
        };
    }, [containerRef]);

    // Setup and Animation
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resize = () => {
            if (containerRef?.current) {
                canvas.width = containerRef.current.clientWidth;
                canvas.height = containerRef.current.clientHeight;
            } else {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            }
        };
        resize();
        
        const resizeObserver = containerRef?.current 
            ? new ResizeObserver(resize) 
            : null;
        
        if (resizeObserver && containerRef?.current) {
            resizeObserver.observe(containerRef.current);
        } else {
            window.addEventListener('resize', resize);
        }

        // Initialize Scorpion
        const s = size;
        const tailCount = 20;
        
        const critter = new Creature(
            canvas.width / 2,
            canvas.height / 2,
            0
        );
        
        let spinal: any = critter;
        for (let i = 0; i < 6; i++) {
            spinal = new Segment(spinal, s * 4, 0, (Math.PI * 2) / 3, 1.1);
            for (let ii = -1; ii <= 1; ii += 2) {
                let node: any = new Segment(spinal, s * 3, ii, 0.1, 2);
                for (let iii = 0; iii < 3; iii++) {
                    node = new Segment(node, s * 1, -ii * 0.1, 0.1, 2);
                }
            }
        }

        for (let i = 0; i < 2; i++) {
            if (i > 0) {
                for (let ii = 0; ii < 6; ii++) {
                    spinal = new Segment(spinal, s * 4, 0, 1.571, 1.5);
                    for (let iii = -1; iii <= 1; iii += 2) {
                        let node: any = new Segment(spinal, s * 3, iii * 1.571, 0.1, 1.5);
                        for (let iv = 0; iv < 3; iv++) {
                            node = new Segment(node, s * 3, -iii * 0.3, 0.1, 2);
                        }
                    }
                }
            }

            for (let ii = -1; ii <= 1; ii += 2) {
                let node: any = new Segment(spinal, s * 12, ii * 0.785, 0, 8);
                node = new Segment(node, s * 16, -ii * 0.785, 6.28, 1);
                node = new Segment(node, s * 16, ii * 1.571, 3.1415, 2);
                for (let iii = 0; iii < 4; iii++) {
                    new Segment(node, s * 4, (iii / 3 - 0.5) * 1.571, 0.1, 4);
                }
                new LegSystem(node, 3, s * 12, critter);
            }
        }

        for (let i = 0; i < tailCount; i++) {
            spinal = new Segment(spinal, s * 4, 0, (Math.PI * 2) / 3, 1.1);
            for (let ii = -1; ii <= 1; ii += 2) {
                let node: any = new Segment(spinal, s * 3, ii, 0.1, 2);
                for (let iii = 0; iii < 3; iii++) {
                    node = new Segment(node, s * 3 * (tailCount - i) / tailCount, -ii * 0.1, 0.1, 2);
                }
            }
        }

        creatureRef.current = critter;

        let rafId: number;
        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = color;
            ctx.lineWidth = 1.5;

            const now = performance.now();
            const strikeDuration = 250; // ms
            const strikeActive = now - strikeTime.current < strikeDuration;
            
            if (creatureRef.current) {
                creatureRef.current.follow(mousePos.current.x, mousePos.current.y, ctx, strikeActive, strikePos.current);
            }

            // Draw Impact Pulse
            if (strikeActive) {
                const progress = (now - strikeTime.current) / strikeDuration;
                const radius = progress * 40;
                const opacity = 1 - progress;
                ctx.beginPath();
                ctx.arc(strikePos.current.x, strikePos.current.y, radius, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(${parseInt(color.slice(1,3),16) || 255}, ${parseInt(color.slice(3,5),16) || 255}, ${parseInt(color.slice(5,7),16) || 255}, ${opacity})`;
                ctx.lineWidth = 2 * (1 - progress);
                ctx.stroke();
            }
            
            rafId = requestAnimationFrame(render);
        };

        rafId = requestAnimationFrame(render);

        return () => {
            if (resizeObserver) resizeObserver.disconnect();
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(rafId);
        };
    }, [color, size, containerRef]);

    return (
        <canvas
            ref={canvasRef}
            className={className}
            style={{
                position: containerRef ? 'absolute' : 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: containerRef ? 1 : 9999,
                backgroundColor: backgroundColor,
            }}
        />
    );
};

export default ScorpioCursor;
