import React, { useRef, useEffect, useCallback, useState } from 'react';
import { motion, useMotionValue, useTransform, useSpring, animate } from 'framer-motion';
import Logo from './Logo';
import './Smilo.css';


/* ══════════════════════════════════════════════════════ */
/*                  SOUND – Warm Bell Chimes              */
/* ══════════════════════════════════════════════════════ */
const playChime = (type: 'click' | 'think' | 'happy') => {
    try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const master = ctx.createGain();
        const delay  = ctx.createDelay(0.4);
        const dGain  = ctx.createGain();
        delay.delayTime.value = 0.22;
        dGain.gain.value      = 0.16;
        delay.connect(dGain); dGain.connect(master); master.connect(ctx.destination);
        const t = ctx.currentTime;

        const bell = (freq: number, start: number, vol: number, dur: number) => {
            const o1 = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain();
            o1.connect(g); o2.connect(g); g.connect(master); g.connect(delay);
            o1.type = 'sine'; o1.frequency.value = freq;
            o2.type = 'sine'; o2.frequency.value = freq * 2.756;
            const g2 = ctx.createGain(); o2.connect(g2); g2.gain.value = 0.1;
            g.gain.setValueAtTime(0, t + start);
            g.gain.linearRampToValueAtTime(vol, t + start + 0.012);
            g.gain.exponentialRampToValueAtTime(0.001, t + start + dur);
            o1.start(t + start); o1.stop(t + start + dur);
            o2.start(t + start); o2.stop(t + start + dur);
        };

        if (type === 'click') {
            [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => bell(f, i * 0.07, 0.16, 0.85));
            master.gain.setValueAtTime(0.7, t); master.gain.exponentialRampToValueAtTime(0.001, t + 1.05);
        } else if (type === 'happy') {
            [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => bell(f, i * 0.04, 0.1, 0.9));
            master.gain.setValueAtTime(0.6, t); master.gain.exponentialRampToValueAtTime(0.001, t + 1.1);
        } else {
            bell(293.66, 0, 0.06, 0.8); bell(369.99, 0.1, 0.05, 0.7);
            master.gain.setValueAtTime(0.5, t); master.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
        }
    } catch (_) {}
};

/* ── Data ── */
const MSGS   = ["Hi! I'm Smilo 😊", "Hello! ✨", "How can I help?", "Click me again~", "Let's build UI!", "Ready to go! ⚡", "UI HUB is 💙", "Beep boop~ 🤖"];
const THINKS = ["Thinking...", "Processing...", "Analyzing...", "Computing...", "Loading AI..."];
const FEATURES = [
    { icon: '◎', title: 'Framer Motion', desc: 'Mouse-reactive head, arm swing, eye blink — all via motion.div', color: '#7dd3fc' },
    { icon: '◈', title: 'Minimal Beauty', desc: 'Precise CSS class structure identical to production Robot3D', color: '#86efac' },
    { icon: '◉', title: 'Bell Audio', desc: 'Warm harmonic bell chimes with reverb delay on every click', color: '#c4b5fd' },
];

/* ══════════════════════════════════════════════════════ */
/*            SMILO ROBOT – Framer Motion driven          */
/* ══════════════════════════════════════════════════════ */
const SmiloRobot: React.FC<{
    mouseX: number; mouseY: number;
    isWaving: boolean; isClicked: boolean;
    mood: string;
}> = ({ mouseX, mouseY, isWaving, isClicked, mood }) => {

    // Spring-smoothed mouse-driven head rotation
    const rotY = useSpring(useMotionValue(mouseX * 20), { stiffness: 60, damping: 18 });
    const rotX = useSpring(useMotionValue(-mouseY * 14), { stiffness: 60, damping: 18 });
    const rotZ = useSpring(useMotionValue(mouseX * 5),  { stiffness: 50, damping: 20 });

    // Update springs on mouse change
    useEffect(() => {
        rotY.set(mouseX * 22);
        rotX.set(-mouseY * 14);
        rotZ.set(mouseX * 5);
    }, [mouseX, mouseY]);

    // Dynamic eye glow color by mood
    const eyeColor =
        mood === 'excited' ? '#facc15' :
        mood === 'thinking' ? '#67e8f9' :
        mood === 'happy'    ? '#4ade80' : '#a3e635';

    const antOrb =
        mood === 'excited' ? '#facc15' :
        mood === 'thinking' ? '#67e8f9' : '#a3e635';

    return (
        <div className="sm-root" style={{ transform: isClicked ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.22s cubic-bezier(0.34,1.56,0.64,1)' }}>

            {/* ── ANTENNA (floats with head) ── */}
            <div className="sm-antenna-wrap">
                <motion.div
                    className="sm-antenna-orb"
                    animate={{
                        scale: [1, 1.4, 1],
                        boxShadow: [
                            `0 0 10px ${antOrb}, 0 0 22px ${antOrb}88`,
                            `0 0 16px ${antOrb}, 0 0 36px ${antOrb}bb`,
                            `0 0 10px ${antOrb}, 0 0 22px ${antOrb}88`,
                        ],
                    }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ background: `radial-gradient(circle at 35% 30%, #fff 0%, ${antOrb} 55%, ${antOrb}88 100%)` }}
                />
                <div className="sm-antenna-stem" />
            </div>

            {/* ── HEAD (mouse-driven 3-axis rotation) ── */}
            <motion.div
                className="sm-head"
                style={{
                    rotateY: rotY,
                    rotateX: rotX,
                    rotateZ: rotZ,
                    transformStyle: 'preserve-3d',
                    transformPerspective: 320,
                }}
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
            >
                {/* Ears */}
                <div className="sm-ear sm-ear--l">
                    {[0,1,2,3].map(i => <div key={i} className="sm-ear-slat" />)}
                </div>
                <div className="sm-ear sm-ear--r">
                    {[0,1,2,3].map(i => <div key={i} className="sm-ear-slat" />)}
                </div>

                <div className="sm-head-shine" />
                <div className="sm-head-shine2" />

                {/* Visor */}
                <div className="sm-visor">
                    <div className="sm-visor-shine" />
                    <div className="sm-visor-scan" />

                    <div className="sm-pixel-face">
                        {/* Eyes — blink every 4s */}
                        <motion.div
                            className="sm-eyes"
                            animate={{ scaleY: [1, 0.07, 1] }}
                            transition={{ duration: 4.2, repeat: Infinity, times: [0, 0.04, 0.09], ease: 'easeOut' }}
                        >
                            <motion.div
                                className="sm-eye"
                                style={{ background: eyeColor, transition: 'background 0.35s ease' }}
                                animate={{
                                    boxShadow: [
                                        `0 0 6px ${eyeColor}, 0 0 14px ${eyeColor}88`,
                                        `0 0 10px ${eyeColor}, 0 0 22px ${eyeColor}`,
                                        `0 0 6px ${eyeColor}, 0 0 14px ${eyeColor}88`,
                                    ]
                                }}
                                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                            />
                            <motion.div
                                className="sm-eye"
                                style={{ background: eyeColor, transition: 'background 0.35s ease' }}
                                animate={{
                                    boxShadow: [
                                        `0 0 6px ${eyeColor}, 0 0 14px ${eyeColor}88`,
                                        `0 0 10px ${eyeColor}, 0 0 22px ${eyeColor}`,
                                        `0 0 6px ${eyeColor}, 0 0 14px ${eyeColor}88`,
                                    ]
                                }}
                                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: 0.15 }}
                            />
                        </motion.div>

                        {/* Pixel smile */}
                        <div className="sm-smile">
                            <div className="sm-smile-row">
                                <span /><span className="px" /><span className="px" /><span />
                            </div>
                            <div className="sm-smile-row">
                                <span className="px" /><span /><span /><span className="px" />
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* ── NECK ── */}
            <div className="sm-neck" />

            {/* ── ACCENT RING ── */}
            <motion.div
                className="sm-accent-ring"
                animate={{
                    boxShadow: [
                        `0 0 10px ${eyeColor}88, 0 0 24px ${eyeColor}33`,
                        `0 0 16px ${eyeColor}cc, 0 0 36px ${eyeColor}66`,
                        `0 0 10px ${eyeColor}88, 0 0 24px ${eyeColor}33`,
                    ],
                    background: [
                        `linear-gradient(90deg, transparent, ${eyeColor}cc, ${eyeColor}, ${eyeColor}cc, transparent)`,
                    ],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* ── TORSO + ARMS ── */}
            <motion.div
                className="sm-torso-wrap"
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
            >
                {/* LEFT ARM */}
                <motion.div
                    className="sm-arm sm-arm--l"
                    animate={{ rotate: [0, -9, 0, 9, 0] }}
                    transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ transformOrigin: '80% 5%' }}
                >
                    <div className="sm-arm-upper" />
                    <div className="sm-arm-joint" />
                    <div className="sm-arm-lower">
                        <div className="sm-fingers">
                            <div className="sm-finger" />
                            <div className="sm-finger" />
                            <div className="sm-finger" />
                        </div>
                    </div>
                </motion.div>

                {/* TORSO */}
                <div className="sm-torso">
                    <div className="sm-torso-shine" />
                    <div className="sm-ring sm-ring--top" />
                    <div className="sm-ring sm-ring--bot" />
                    <div className="sm-chest">
                        <motion.div
                            className="sm-chest-orb"
                            animate={{
                                boxShadow: [
                                    `0 0 6px ${eyeColor}, 0 0 14px ${eyeColor}88`,
                                    `0 0 16px ${eyeColor}, 0 0 32px ${eyeColor}`,
                                    `0 0 6px ${eyeColor}, 0 0 14px ${eyeColor}88`,
                                ],
                                background: eyeColor,
                            }}
                            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                        />
                        <div className="sm-chest-bars">
                            <div style={{ width: '100%' }} />
                            <div style={{ width: '70%' }} />
                            <div style={{ width: '85%' }} />
                        </div>
                    </div>
                </div>

                {/* RIGHT ARM — waves on click */}
                <motion.div
                    className="sm-arm sm-arm--r"
                    animate={isWaving
                        ? { rotate: [0, -55, -10, -55, -15, 0] }
                        : { rotate: [0, 9, 0, -9, 0] }
                    }
                    transition={isWaving
                        ? { duration: 1.6, ease: 'easeInOut' }
                        : { duration: 3.6, repeat: Infinity, ease: 'easeInOut', delay: 0.28 }
                    }
                    style={{ transformOrigin: '20% 5%' }}
                >
                    <div className="sm-arm-upper" />
                    <div className="sm-arm-joint" />
                    <div className="sm-arm-lower">
                        <div className="sm-fingers">
                            <div className="sm-finger" />
                            <div className="sm-finger" />
                            <div className="sm-finger" />
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            {/* Ground glow shadow */}
            <div className="sm-shadow" />
        </div>
    );
};

/* ══════════════════════════════════════════════════════ */
/*                     MAIN PAGE                          */
/* ══════════════════════════════════════════════════════ */
const Smilo: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [mouseX, setMouseX]       = useState(0);
    const [mouseY, setMouseY]       = useState(0);
    const [isWaving, setIsWaving]   = useState(false);
    const [isClicked, setIsClicked] = useState(false);
    const [mood, setMood]           = useState<'idle'|'thinking'|'happy'|'excited'>('thinking');
    const [msgIndex, setMsgIndex]   = useState(0);
    const [showMsg, setShowMsg]     = useState(false);
    const [isThinking, setIsThinking] = useState(true);
    const [thinkIdx, setThinkIdx]   = useState(0);
    const [soundActive, setSoundActive] = useState(false);
    const [particles, setParticles] = useState<{id:number;angle:number;color:string;dist:number}[]>([]);
    const [clickCount, setClickCount] = useState(0);
    const [isMobile, setIsMobile]     = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);


    // Normalize mouse position -1 to +1 relative to container
    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const r = containerRef.current?.getBoundingClientRect();
        if (!r) return;
        setMouseX(((e.clientX - r.left) / r.width  - 0.5) * 2);
        setMouseY(((e.clientY - r.top)  / r.height - 0.5) * 2);
    }, []);

    // Reset when mouse leaves
    const handleMouseLeave = useCallback(() => {
        setMouseX(0); setMouseY(0);
    }, []);

    // Eye blink — handled inside SmiloRobot via Framer Motion

    // Rotate thinking phrases
    useEffect(() => {
        const t = setInterval(() => setThinkIdx(p => (p + 1) % THINKS.length), 2100);
        return () => clearInterval(t);
    }, []);


    const spawnParticles = useCallback(() => {
        const cols = ['#86efac','#7dd3fc','#c4b5fd','#facc15','#f9a8d4','#ffffff'];
        const ps = Array.from({length:14},(_,i)=>({
            id: Date.now()+i,
            angle: (360/14)*i + Math.random()*18,
            color: cols[i % cols.length],
            dist: 36 + Math.random()*46,
        }));
        setParticles(ps);
        setTimeout(() => setParticles([]), 900);
    }, []);

    const handleClick = () => {
        setClickCount(c => c + 1);
        playChime('click');
        setSoundActive(true); setTimeout(() => setSoundActive(false), 900);
        setIsClicked(true);
        setIsWaving(true);
        setMood('excited');
        setIsThinking(false);
        setMsgIndex(p => (p + 1) % MSGS.length);
        setShowMsg(true);
        spawnParticles();
        setTimeout(() => setIsClicked(false), 280);
        setTimeout(() => { setIsWaving(false); setMood('thinking'); setIsThinking(true); }, 2200);
        setTimeout(() => setShowMsg(false), 4000);
    };

    const handleCTA = () => {
        playChime('happy');
        setIsWaving(true); setMood('happy'); setIsThinking(false);
        setMsgIndex(0); setShowMsg(true);
        setTimeout(() => { setIsWaving(false); setMood('thinking'); setIsThinking(true); }, 2200);
        setTimeout(() => setShowMsg(false), 4200);
    };

    const acc = mood==='excited'?'#facc15': mood==='thinking'?'#67e8f9': mood==='happy'?'#4ade80':'#a3e635';

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                width:'100%', height: isMobile ? 'auto' : '100%', minHeight: isMobile ? '520px' : '100%',
                background:'radial-gradient(ellipse at 22% 48%,#08102a 0%,#060810 55%,#030410 100%)',
                position:'relative', overflowX:'hidden', overflowY: isMobile ? 'auto' : 'hidden',
                fontFamily:"'Inter','Segoe UI',sans-serif",
                display:'flex', flexDirection:'column',
                scrollBehavior: 'smooth'
            }}

        >
            <div style={{
                position: 'absolute',
                top: isMobile ? 12 : 24,
                right: isMobile ? 12 : 24,
                zIndex: 100
            }}>
                <Logo className="w-6 h-6" showText={true} color="#86efac" />
            </div>

            <style>{`

                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Orbitron:wght@700;900&display=swap');
                @keyframes sm-orb { 0%,100%{transform:translate(0,0);opacity:.08} 50%{transform:translate(14px,-10px);opacity:.16} }
                @keyframes sm-grid{ 0%{background-position:0 0} 100%{background-position:48px 48px} }
                @keyframes sm-in  { from{opacity:0;transform:translateY(-14px)} to{opacity:1;transform:translateY(0)} }
                @keyframes sm-card{ from{opacity:0;transform:translateY(16px)}  to{opacity:1;transform:translateY(0)} }
                @keyframes sm-bot { from{opacity:0;transform:scale(0.45) translateY(45px)} to{opacity:1;transform:scale(1) translateY(0)} }
                @keyframes sm-msg { from{opacity:0;transform:translateY(8px) scale(0.9)} to{opacity:1;transform:none} }
                @keyframes sm-think-bbl { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }
                @keyframes sm-spin{ from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
                @keyframes sm-dot { 0%,100%{transform:translateY(0);opacity:0.28} 50%{transform:translateY(-5px);opacity:1} }
                @keyframes sm-badge-dot { 0%,100%{opacity:1} 50%{opacity:0.18} }
                @keyframes sm-ring-out { 0%{transform:scale(1);opacity:0.65} 100%{transform:scale(3.4);opacity:0} }
                @keyframes sm-particle  { 0%{transform:translate(0,0) scale(1.1);opacity:1} 100%{transform:translate(var(--tx),var(--ty)) scale(0);opacity:0} }
                @keyframes sm-wbar { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(0.25)} }
                @keyframes sm-glow{ 0%,100%{text-shadow:none} 50%{text-shadow:0 0 28px rgba(134,239,172,0.3)} }
                @keyframes sm-bracket { 0%,100%{opacity:0.3} 50%{opacity:0.8} }
                .sm2-card:hover { transform:translateY(-5px)!important; border-color:rgba(255,255,255,0.11)!important; }
                .sm2-btn:hover  { transform:translateY(-2px); }
            `}</style>

            {/* Ambient grid + orbs */}
            <div style={{position:'absolute',inset:0,pointerEvents:'none',zIndex:0}}>
                <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(134,239,172,0.014) 1px,transparent 1px),linear-gradient(90deg,rgba(134,239,172,0.014) 1px,transparent 1px)',backgroundSize:'48px 48px',animation:'sm-grid 14s linear infinite'}} />
                {[
                    {top:'8%',   left:'2%',   w:260, col:'rgba(134,239,172,0.07)', d:'7s'},
                    {top:'38%',  right:'4%',  w:180, col:'rgba(196,181,253,0.07)', d:'6s 2s'},
                    {bottom:'10%',left:'20%', w:210, col:'rgba(103,232,249,0.07)', d:'9s reverse'},
                ].map((o,i)=>(
                    <div key={i} style={{position:'absolute',top:o.top,bottom:(o as any).bottom,left:(o as any).left,right:(o as any).right,width:o.w,height:o.w,borderRadius:'50%',background:`radial-gradient(circle,${o.col} 0%,transparent 70%)`,animation:`sm-orb ${o.d} ease-in-out infinite`}} />
                ))}
            </div>

            {/* ── Left content ── */}
            <div style={{
                flex:1, display:'flex', flexDirection:'column', justifyContent:'center',
                padding: isMobile ? '40px 20px' : 'clamp(24px,4vw,56px)',
                paddingBottom: isMobile ? 180 : 130,
                position:'relative', zIndex:1, maxWidth:720
            }}>


                {/* Badge */}
                <div style={{display:'inline-flex',alignItems:'center',gap:8,marginBottom:20,padding:'5px 14px',borderRadius:999,background:'rgba(134,239,172,0.07)',border:'1px solid rgba(134,239,172,0.2)',width:'fit-content',animation:'sm-in 0.5s ease-out both'}}>
                    <div style={{width:6,height:6,borderRadius:'50%',background:'#86efac',boxShadow:'0 0 8px #86efac',animation:'sm-badge-dot 1.5s ease-in-out infinite'}} />
                    <span style={{fontSize:10,fontWeight:800,color:'rgba(134,239,172,0.8)',letterSpacing:'0.18em',textTransform:'uppercase'}}>3D CHATBOT — SMILO</span>
                </div>

                {/* Title */}
                <h1 style={{fontSize:'clamp(28px,4vw,52px)',fontWeight:900,color:'#fff',lineHeight:1.1,margin:'0 0 14px 0',letterSpacing:'-0.03em',animation:'sm-in 0.5s 0.08s ease-out both'}}>
                    Meet{' '}
                    <span style={{background:'linear-gradient(135deg,#86efac 0%,#67e8f9 45%,#c4b5fd 100%)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',animation:'sm-glow 3s ease-in-out infinite'}}>Smilo</span>
                    <br/>
                    <span style={{color:'rgba(255,255,255,0.32)',fontSize:'0.48em',fontWeight:600,letterSpacing:0}}>Move your mouse over Smilo to see it react</span>
                </h1>

                <p style={{fontSize:15,color:'rgba(255,255,255,0.42)',lineHeight:1.78,margin:'0 0 32px 0',maxWidth:440,animation:'sm-in 0.5s 0.16s ease-out both'}}>
                    A Framer Motion 3D robot with mouse-reactive head rotation. Smilo's eyes glow, arms swing, and it plays warm bell chimes on click — always watching from the corner.
                </p>

                {/* Feature cards */}
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:12,animation:'sm-card 0.5s 0.26s ease-out both'}}>
                    {FEATURES.map((f,i)=>(
                        <div key={i} className="sm2-card" style={{padding:'16px 14px',borderRadius:14,background:'rgba(255,255,255,0.022)',border:'1px solid rgba(255,255,255,0.06)',cursor:'default',transition:'transform .24s ease,border-color .24s ease'}}>
                            <div style={{width:36,height:36,borderRadius:9,background:`${f.color}12`,border:`1px solid ${f.color}25`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,marginBottom:10,color:f.color}}>{f.icon}</div>
                            <div style={{fontSize:12.5,fontWeight:700,color:'#fff',marginBottom:5,letterSpacing:'-0.01em'}}>{f.title}</div>
                            <div style={{fontSize:11,color:'rgba(255,255,255,0.34)',lineHeight:1.55}}>{f.desc}</div>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div style={{display:'flex',alignItems:'center',gap:16,marginTop:28,animation:'sm-card 0.5s 0.38s ease-out both'}}>
                    <button className="sm2-btn" onClick={handleCTA} style={{display:'flex',alignItems:'center',gap:8,padding:'11px 26px',borderRadius:11,background:'linear-gradient(135deg,#86efac,#67e8f9)',border:'none',color:'#041a0a',fontSize:13.5,fontWeight:800,cursor:'pointer',boxShadow:'0 4px 20px rgba(134,239,172,0.28)',transition:'transform .2s ease,box-shadow .2s ease'}}>
                        😊 Chat with Smilo
                    </button>
                    <span style={{fontSize:11,color:'rgba(255,255,255,0.2)',letterSpacing:'0.08em'}}>or click the bot →</span>
                </div>
            </div>

            {/* ══════════════════════════════════════════ */}
            {/*     BOTTOM-RIGHT  SMILO WIDGET            */}
            {/* ══════════════════════════════════════════ */}
            <motion.div
                initial={{ opacity: 0, scale: 0.4, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6, ease: [0.34,1.56,0.64,1] }}
                style={{
                    position:'absolute',
                    bottom: isMobile ? 15 : 18,
                    right: isMobile ? '50%' : 24,
                    transform: isMobile ? 'translateX(50%)' : 'none',
                    zIndex:50,
                    display:'flex',
                    flexDirection:'column',
                    alignItems: isMobile ? 'center' : 'flex-end',
                    gap: 8
                }}
            >

                {/* Corner brackets */}
                {[{t:true,r:true},{b:true,l:true}].map((pos,i) => (
                    <div key={i} style={{position:'absolute',[pos.t?'top':'bottom']:'-18px',[pos.r?'right':'left']:'-18px',width:20,height:20,[pos.t?'borderTop':'borderBottom']:`1.5px solid ${acc}88`,[pos.r?'borderRight':'borderLeft']:`1.5px solid ${acc}88`,animation:`sm-bracket 2.5s ease-in-out infinite`,animationDelay:`${i*1.2}s`,transition:'border-color 0.35s'}} />
                ))}

                {/* Thinking bubble — always on by default */}
                {isThinking && !showMsg && (
                    <div style={{padding:'8px 14px',borderRadius:'12px 12px 4px 12px',background:'rgba(6,8,22,0.92)',border:`1px solid ${acc}33`,backdropFilter:'blur(14px)',boxShadow:'0 4px 20px rgba(0,0,0,0.45)',animation:'sm-think-bbl 0.3s ease-out both',display:'flex',alignItems:'center',gap:8}}>
                        <div style={{fontSize:13,animation:'sm-spin 1.6s linear infinite',display:'inline-block'}}>⚙️</div>
                        <span style={{fontSize:11,color:`${acc}cc`,fontWeight:600,letterSpacing:'0.05em'}}>{THINKS[thinkIdx]}</span>
                        <div style={{display:'flex',gap:2.5}}>
                            {[0,1,2].map(i=><div key={i} style={{width:4,height:4,borderRadius:'50%',background:acc,boxShadow:`0 0 5px ${acc}`,animation:'sm-dot 1s ease-in-out infinite',animationDelay:`${i*0.18}s`}} />)}
                        </div>
                    </div>
                )}

                {/* Chat message */}
                {showMsg && (
                    <div style={{padding:'10px 15px',borderRadius:'13px 13px 4px 13px',background:'rgba(6,8,22,0.96)',border:`1px solid ${acc}44`,backdropFilter:'blur(16px)',color:'#fff',fontSize:12.5,fontWeight:600,whiteSpace:'nowrap',boxShadow:'0 8px 28px rgba(0,0,0,0.5)',animation:'sm-msg 0.3s ease-out both'}}>
                        {MSGS[msgIndex]}
                    </div>
                )}

                {/* Soundwave bars */}
                {soundActive && (
                    <div style={{display:'flex',alignItems:'center',gap:4,justifyContent:'flex-end'}}>
                        <span style={{fontSize:9,color:`${acc}88`,letterSpacing:'0.1em'}}>♪</span>
                        <div style={{display:'flex',alignItems:'center',gap:2.5,height:20}}>
                            {[4,7,11,14,11,8,12,9,5,10,13,8,4].map((h,i)=>(
                                <div key={i} style={{width:2.5,height:h*1.5,borderRadius:2,background:`linear-gradient(180deg,${acc},${acc}66)`,boxShadow:`0 0 4px ${acc}88`,animation:'sm-wbar 0.55s ease-in-out infinite',animationDelay:`${i*0.04}s'`}} />
                            ))}
                        </div>
                        <span style={{fontSize:9,color:`${acc}88`,letterSpacing:'0.1em'}}>♪</span>
                    </div>
                )}

                {/* Click rings */}
                {isClicked && [0,1].map(i=>(
                    <div key={i} style={{position:'absolute',bottom:80,right:50,width:88,height:88,borderRadius:'50%',border:`1.5px solid ${acc}88`,animation:'sm-ring-out 0.75s ease-out forwards',animationDelay:`${i*0.18}s`,pointerEvents:'none'}} />
                ))}

                {/* Particles */}
                <div style={{position:'absolute',bottom:100,right:58,pointerEvents:'none',width:0,height:0}}>
                    {particles.map(p=>{
                        const rad=(p.angle*Math.PI)/180;
                        return <div key={p.id} style={{position:'absolute',width:7,height:7,borderRadius:'50%',background:p.color,boxShadow:`0 0 8px ${p.color}`,'--tx':`${Math.cos(rad)*p.dist}px`,'--ty':`${-Math.sin(rad)*p.dist}px`,animation:'sm-particle 0.75s ease-out forwards'} as React.CSSProperties} />;
                    })}
                </div>

                {/* ── THE ROBOT ── */}
                <button onClick={handleClick} style={{background:'transparent',border:'none',cursor:'pointer',padding:0,outline:'none',WebkitTapHighlightColor:'transparent'}} title="Click Smilo!">
                    <SmiloRobot
                        mouseX={mouseX}
                        mouseY={mouseY}
                        isWaving={isWaving}
                        isClicked={isClicked}
                        mood={mood}
                    />
                    {/* Label */}
                    <div style={{textAlign:'center',marginTop:6,fontFamily:"'Orbitron',sans-serif",fontSize:9.5,fontWeight:900,letterSpacing:'0.24em',color:'rgba(255,255,255,0.88)',textShadow:`0 0 10px ${acc}99,0 0 22px ${acc}44`,background:'rgba(255,255,255,0.02)',border:`1px solid ${acc}28`,borderRadius:6,padding:'4px 12px',backdropFilter:'blur(8px)',transition:'border-color 0.3s'}}>
                        SMILO
                    </div>
                </button>

                {clickCount > 0 && (
                    <div style={{textAlign:'center',fontSize:9,color:'rgba(134,239,172,0.3)',letterSpacing:'0.1em',fontFamily:'monospace'}}>
                        × {clickCount} interactions
                    </div>
                )}
            </motion.div>

            {/* Page corners */}
            <div style={{position:'absolute',top:18,right:18,width:20,height:20,borderTop:'1.5px solid rgba(134,239,172,0.2)',borderRight:'1.5px solid rgba(134,239,172,0.2)',pointerEvents:'none',zIndex:2}} />
            <div style={{position:'absolute',bottom:18,left:18,width:20,height:20,borderBottom:'1.5px solid rgba(103,232,249,0.2)',borderLeft:'1.5px solid rgba(103,232,249,0.2)',pointerEvents:'none',zIndex:2}} />
            <div style={{position:'absolute',bottom:0,left:0,right:0,height:1,background:'linear-gradient(90deg,transparent,rgba(134,239,172,0.2),transparent)',pointerEvents:'none',zIndex:2}} />
        </div>
    );
};

export default Smilo;
