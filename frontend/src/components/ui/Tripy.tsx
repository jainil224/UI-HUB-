import React, { useRef, useCallback, useState, useEffect } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';
import Logo from './Logo';
import './Tripy.css';


/* ══════════════════════════════════════════════════════ */
/*          SOUND — Playful Xylophone + Boing             */
/* ══════════════════════════════════════════════════════ */
const playTripy = (type: 'click' | 'think' | 'happy') => {
    try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const master = ctx.createGain();
        // Warm reverb delay
        const delay = ctx.createDelay(0.35);
        const dg = ctx.createGain();
        delay.delayTime.value = 0.18; dg.gain.value = 0.14;
        delay.connect(dg); dg.connect(master); master.connect(ctx.destination);
        const t = ctx.currentTime;

        // Xylophone bell tone
        const xyl = (freq: number, start: number, vol: number, dur: number) => {
            const o1 = ctx.createOscillator(), o2 = ctx.createOscillator();
            const g = ctx.createGain();
            o1.connect(g); o2.connect(g); g.connect(master); g.connect(delay);
            o1.type = 'triangle'; o1.frequency.value = freq;
            o2.type = 'sine';     o2.frequency.value = freq * 3.0; // bright overtone
            const g2 = ctx.createGain(); o2.connect(g2); g2.gain.value = 0.08;
            g.gain.setValueAtTime(0, t + start);
            g.gain.linearRampToValueAtTime(vol, t + start + 0.008);
            g.gain.exponentialRampToValueAtTime(0.001, t + start + dur);
            o1.start(t + start); o1.stop(t + start + dur);
            o2.start(t + start); o2.stop(t + start + dur);
        };

        if (type === 'click') {
            // Happy travel jingle — G major arp
            xyl(392.00, 0.00, 0.18, 0.7);  // G4
            xyl(493.88, 0.07, 0.16, 0.6);  // B4
            xyl(587.33, 0.14, 0.14, 0.6);  // D5
            xyl(783.99, 0.22, 0.13, 0.7);  // G5
            xyl(987.77, 0.30, 0.10, 0.6);  // B5
            // Boing accent
            const boing = ctx.createOscillator(), bg = ctx.createGain();
            boing.connect(bg); bg.connect(master);
            boing.type = 'sine';
            boing.frequency.setValueAtTime(80, t + 0.0);
            boing.frequency.exponentialRampToValueAtTime(320, t + 0.18);
            boing.frequency.exponentialRampToValueAtTime(180, t + 0.45);
            bg.gain.setValueAtTime(0.09, t); bg.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
            boing.start(t); boing.stop(t + 0.5);
            master.gain.setValueAtTime(0.75, t); master.gain.exponentialRampToValueAtTime(0.001, t + 0.95);
        } else if (type === 'happy') {
            xyl(523.25, 0, 0.12, 0.8); xyl(659.25, 0.05, 0.1, 0.8); xyl(783.99, 0.1, 0.09, 0.9);
            master.gain.setValueAtTime(0.6, t); master.gain.exponentialRampToValueAtTime(0.001, t + 1.0);
        } else {
            xyl(329.63, 0, 0.06, 0.7); // E4 soft hum
            master.gain.setValueAtTime(0.5, t); master.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
        }
    } catch (_) {}
};

/* ── Data ── */
const MSGS  = ["Let's go! 🧳", "Adventure awaits!", "Bon voyage! ✈️", "Click me again~", "Ready to travel!", "Where to next? 🗺️", "Pack your dreams!", "Tripy's here! 🌍"];
const THINKS = ["Planning trip...", "Checking routes...", "Packing bags...", "Finding deals...", "Loading map..."];
const FEATURES = [
    { icon: '🧳', title: 'Travel Buddy',    desc: 'Your AI companion for every journey, always by your side',  color: '#fbbf24' },
    { icon: '😊', title: 'CSS Expressions', desc: 'Arch eyes and curved smile built with pure CSS border tricks', color: '#f87171' },
    { icon: '🎵', title: 'Xylophone Audio', desc: 'Playful G-major arpeggio with boing accent on every click',   color: '#86efac' },
];

/* ══════════════════════════════════════════════════════ */
/*          TRIPY FIGURE – Framer Motion Driven           */
/* ══════════════════════════════════════════════════════ */
const TripyFigure: React.FC<{
    mouseX: number; mouseY: number;
    isClicked: boolean; mood: string; isWaving: boolean;
    wheelSpin: number;
}> = ({ mouseX, mouseY, isClicked, mood, isWaving, wheelSpin }) => {

    // Spring-smoothed mouse-driven rotation
    const rotY = useSpring(useMotionValue(mouseX * 18), { stiffness: 55, damping: 16 });
    const rotX = useSpring(useMotionValue(-mouseY * 10), { stiffness: 55, damping: 16 });
    const rotZ = useSpring(useMotionValue(mouseX * 4),   { stiffness: 48, damping: 18 });

    useEffect(() => {
        rotY.set(mouseX * 18);
        rotX.set(-mouseY * 10);
        rotZ.set(mouseX * 4);
    }, [mouseX, mouseY]);

    // Handle extends when clicked
    const handleHeight = isWaving ? 40 : 22;

    const eyeCol = mood === 'excited' ? '#fde047' : mood === 'thinking' ? '#86efac' : '#facc15';
    const bodyGlow = mood === 'excited' ? 'rgba(250,204,21,0.3)' : mood === 'thinking' ? 'rgba(134,239,172,0.2)' : 'rgba(239,68,68,0.25)';

    return (
        <div
            className="tp-root"
            style={{
                transform: isClicked ? 'scale(1.13) translateY(-6px)' : 'scale(1)',
                transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1)',
                filter: `drop-shadow(0 0 22px ${bodyGlow}) drop-shadow(0 28px 24px rgba(0,0,0,0.6))`,
            }}
        >
            {/* ── TELESCOPIC HANDLE ── */}
            <motion.div
                className="tp-handle-wrap"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
            >
                <div className="tp-grip" />
                <div className="tp-handle-bars">
                    <motion.div
                        className="tp-handle-bar"
                        animate={{ height: handleHeight }}
                        transition={{ duration: 0.35, ease: [0.34,1.56,0.64,1] }}
                    />
                    <motion.div
                        className="tp-handle-bar"
                        animate={{ height: handleHeight }}
                        transition={{ duration: 0.35, ease: [0.34,1.56,0.64,1] }}
                    />
                </div>
            </motion.div>

            {/* ── TOP CARRY HANDLE ── */}
            <div className="tp-carry-wrap">
                <div className="tp-carry" />
            </div>

            {/* ── MAIN BODY (mouse-driven 3-axis tilt) ── */}
            <motion.div
                className="tp-body"
                style={{
                    rotateY: rotY,
                    rotateX: rotX,
                    rotateZ: rotZ,
                    transformStyle: 'preserve-3d',
                    transformPerspective: 380,
                }}
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.15 }}
            >
                {/* Shines */}
                <div className="tp-body-shine" />
                <div className="tp-body-shine2" />

                {/* Ridges */}
                <div className="tp-ridges">
                    {Array.from({ length: 7 }).map((_, i) => (
                        <div key={i} className="tp-ridge" />
                    ))}
                </div>

                {/* Zipper border */}
                <div className="tp-zipper" />

                {/* Side clasps */}
                <div className="tp-clasp tp-clasp--l" />
                <div className="tp-clasp tp-clasp--r" />

                {/* ── FACE PANEL ── */}
                <div className="tp-face">
                    {/* Eyes — blinking */}
                    <motion.div
                        className="tp-eyes"
                        animate={{ scaleY: [1, 0.06, 1] }}
                        transition={{ duration: 4.5, repeat: Infinity, times: [0, 0.04, 0.09], ease: 'easeOut' }}
                    >
                        <motion.div
                            className="tp-eye"
                            animate={{
                                borderColor: [eyeCol, `${eyeCol}cc`, eyeCol],
                                boxShadow: [
                                    `0 0 6px ${eyeCol}88, 0 0 14px ${eyeCol}44`,
                                    `0 0 10px ${eyeCol}, 0 0 22px ${eyeCol}88`,
                                    `0 0 6px ${eyeCol}88, 0 0 14px ${eyeCol}44`,
                                ],
                            }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                            style={{ borderTopColor: eyeCol, borderLeftColor: eyeCol, borderRightColor: eyeCol, transition: 'border-color 0.3s' }}
                        />
                        <motion.div
                            className="tp-eye"
                            animate={{
                                boxShadow: [
                                    `0 0 6px ${eyeCol}88, 0 0 14px ${eyeCol}44`,
                                    `0 0 10px ${eyeCol}, 0 0 22px ${eyeCol}88`,
                                    `0 0 6px ${eyeCol}88, 0 0 14px ${eyeCol}44`,
                                ],
                            }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.12 }}
                            style={{ borderTopColor: eyeCol, borderLeftColor: eyeCol, borderRightColor: eyeCol, transition: 'border-color 0.3s' }}
                        />
                    </motion.div>

                    {/* Cute, reactive smile */}
                    <motion.div
                        className="tp-smile"
                        style={{ 
                            borderColor: eyeCol, 
                            transition: 'border-color 0.3s, transform 0.3s',
                            transform: (mood === 'excited' || mood === 'happy') ? 'scale(1.2)' : 'scale(1)',
                        }}
                        animate={{
                            boxShadow: [
                                `0 0 5px ${eyeCol}88`,
                                `0 1px 12px ${eyeCol}`,
                                `0 0 5px ${eyeCol}88`,
                            ],
                        }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                    />
                </div>
            </motion.div>

            {/* ── WHEELS ── */}
            <div className="tp-wheels">
                {[0, 1].map(i => (
                    <motion.div
                        key={i}
                        className="tp-wheel"
                        animate={{ rotate: wheelSpin }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                ))}
                {[0, 1].map(i => (
                    <motion.div
                        key={i + 2}
                        className="tp-wheel"
                        animate={{ rotate: wheelSpin }}
                        transition={{ duration: 0.5, ease: 'easeOut', delay: 0.06 }}
                    />
                ))}
            </div>

            {/* Ground shadow */}
            <div className="tp-shadow" />
        </div>
    );
};

/* ══════════════════════════════════════════════════════ */
/*                     MAIN PAGE                          */
/* ══════════════════════════════════════════════════════ */
const Tripy: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [mouseX, setMouseX]         = useState(0);
    const [mouseY, setMouseY]         = useState(0);
    const [isClicked, setIsClicked]   = useState(false);
    const [isWaving, setIsWaving]     = useState(false); // handle extends
    const [mood, setMood]             = useState<'idle'|'thinking'|'happy'|'excited'>('thinking');
    const [msgIndex, setMsgIndex]     = useState(0);
    const [showMsg, setShowMsg]       = useState(false);
    const [isThinking, setIsThinking] = useState(true);
    const [thinkIdx, setThinkIdx]     = useState(0);
    const [soundActive, setSoundActive] = useState(false);
    const [particles, setParticles]   = useState<{id:number;angle:number;color:string;dist:number}[]>([]);
    const [clickCount, setClickCount] = useState(0);
    const [wheelSpin, setWheelSpin]   = useState(0);
    const [isMobile, setIsMobile]     = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);


    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const r = containerRef.current?.getBoundingClientRect();
        if (!r) return;
        setMouseX(((e.clientX - r.left) / r.width  - 0.5) * 2);
        setMouseY(((e.clientY - r.top)  / r.height - 0.5) * 2);
    }, []);

    const handleMouseLeave = useCallback(() => { setMouseX(0); setMouseY(0); }, []);

    // Rotate thinking phrases
    useEffect(() => {
        const t = setInterval(() => setThinkIdx(p => (p + 1) % THINKS.length), 2100);
        return () => clearInterval(t);
    }, []);


    const spawnParticles = useCallback(() => {
        const cols = ['#facc15','#f87171','#86efac','#fde68a','#fff','#fbbf24'];
        const ps = Array.from({length:14},(_,i)=>({
            id: Date.now()+i,
            angle: (360/14)*i + Math.random()*18,
            color: cols[i % cols.length],
            dist: 40 + Math.random()*48,
        }));
        setParticles(ps);
        setTimeout(() => setParticles([]), 900);
    }, []);

    const handleClick = () => {
        setClickCount(c => c + 1);
        playTripy('click');
        setSoundActive(true); setTimeout(() => setSoundActive(false), 950);
        setIsClicked(true);
        setIsWaving(true);   // handle extends up
        setMood('excited');
        setIsThinking(false);
        setMsgIndex(p => (p + 1) % MSGS.length);
        setShowMsg(true);
        spawnParticles();
        setWheelSpin(w => w + 360); // wheels spin
        setTimeout(() => setIsClicked(false), 300);
        setTimeout(() => { setIsWaving(false); setMood('thinking'); setIsThinking(true); }, 2200);
        setTimeout(() => setShowMsg(false), 4200);
    };

    const handleCTA = () => {
        playTripy('happy');
        setIsWaving(true); setMood('happy'); setIsThinking(false);
        setMsgIndex(0); setShowMsg(true);
        setWheelSpin(w => w + 180);
        setTimeout(() => { setIsWaving(false); setMood('thinking'); setIsThinking(true); }, 2200);
        setTimeout(() => setShowMsg(false), 4200);
    };

    const acc = mood==='excited'?'#fde047': mood==='thinking'?'#86efac': mood==='happy'?'#fbbf24':'#f87171';

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                width:'100%', height: isMobile ? 'auto' : '100%', minHeight: isMobile ? '520px' : '100%',
                background:'radial-gradient(ellipse at 20% 45%, #1c0808 0%, #100506 40%, #07030a 100%)',
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
                <Logo className="w-6 h-6" showText={true} color="#fbbf24" />
            </div>

            <style>{`

                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Orbitron:wght@700;900&display=swap');
                @keyframes tp-orb  { 0%,100%{transform:translate(0,0);opacity:.08} 50%{transform:translate(14px,-10px);opacity:.16} }
                @keyframes tp-grid { 0%{background-position:0 0} 100%{background-position:48px 48px} }
                @keyframes tp-in   { from{opacity:0;transform:translateY(-14px)} to{opacity:1;transform:translateY(0)} }
                @keyframes tp-card { from{opacity:0;transform:translateY(16px)}  to{opacity:1;transform:translateY(0)} }
                @keyframes tp-bot  { from{opacity:0;transform:scale(0.4) translateY(50px)} to{opacity:1;transform:scale(1) translateY(0)} }
                @keyframes tp-msg  { from{opacity:0;transform:translateY(8px) scale(0.9)} to{opacity:1;transform:none} }
                @keyframes tp-think{ from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }
                @keyframes tp-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
                @keyframes tp-dot  { 0%,100%{transform:translateY(0);opacity:0.3} 50%{transform:translateY(-5px);opacity:1} }
                @keyframes tp-badge-dot {0%,100%{opacity:1} 50%{opacity:0.18}}
                @keyframes tp-ring { 0%{transform:scale(1);opacity:0.65} 100%{transform:scale(3.4);opacity:0} }
                @keyframes tp-part { 0%{transform:translate(0,0) scale(1.1);opacity:1} 100%{transform:translate(var(--tx),var(--ty)) scale(0);opacity:0} }
                @keyframes tp-wbar { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(0.22)} }
                @keyframes tp-glow { 0%,100%{text-shadow:none} 50%{text-shadow:0 0 28px rgba(251,191,36,0.35)} }
                @keyframes tp-bkt  { 0%,100%{opacity:0.3} 50%{opacity:0.82} }
                @keyframes tp-bubble-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
                @keyframes tp-dot-blink { 0%,60%,100%{opacity:0} 30%{opacity:1} }
                .tp2-card:hover { transform:translateY(-5px)!important; border-color:rgba(255,255,255,0.1)!important; }
                .tp2-btn:hover  { transform:translateY(-2px); }
            `}</style>

            {/* Ambient background */}
            <div style={{position:'absolute',inset:0,pointerEvents:'none',zIndex:0}}>
                <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(239,68,68,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(239,68,68,0.015) 1px,transparent 1px)',backgroundSize:'48px 48px',animation:'tp-grid 14s linear infinite'}} />
                {[
                    {top:'6%',   left:'2%',   w:280, col:'rgba(239,68,68,0.08)',   d:'7s'},
                    {top:'42%',  right:'3%',  w:180, col:'rgba(251,191,36,0.07)',  d:'6s 2s'},
                    {bottom:'8%',left:'18%',  w:220, col:'rgba(134,239,172,0.07)', d:'9s reverse'},
                ].map((o,i)=>(
                    <div key={i} style={{position:'absolute',top:(o as any).top,bottom:(o as any).bottom,left:(o as any).left,right:(o as any).right,width:o.w,height:o.w,borderRadius:'50%',background:`radial-gradient(circle,${o.col} 0%,transparent 70%)`,animation:`tp-orb ${o.d} ease-in-out infinite`}} />
                ))}
            </div>

            {/* ── Left content ── */}
            <div style={{
                flex:1, display:'flex', flexDirection:'column', justifyContent:'center',
                padding: isMobile ? '40px 20px' : 'clamp(24px,4vw,56px)',
                paddingBottom: isMobile ? 180 : 140,
                position:'relative', zIndex:1, maxWidth:720
            }}>


                {/* Badge */}
                <div style={{display:'inline-flex',alignItems:'center',gap:8,marginBottom:20,padding:'5px 14px',borderRadius:999,background:'rgba(251,191,36,0.08)',border:'1px solid rgba(251,191,36,0.22)',width:'fit-content',animation:'tp-in 0.5s ease-out both'}}>
                    <div style={{width:6,height:6,borderRadius:'50%',background:'#fbbf24',boxShadow:'0 0 8px #fbbf24',animation:'tp-badge-dot 1.5s ease-in-out infinite'}} />
                    <span style={{fontSize:10,fontWeight:800,color:'rgba(251,191,36,0.85)',letterSpacing:'0.18em',textTransform:'uppercase'}}>3D CHATBOT — TRIPY</span>
                </div>

                {/* Title */}
                <h1 style={{fontSize:'clamp(28px,4vw,52px)',fontWeight:900,color:'#fff',lineHeight:1.1,margin:'0 0 14px 0',letterSpacing:'-0.03em',animation:'tp-in 0.5s 0.08s ease-out both'}}>
                    Meet{' '}
                    <span style={{background:'linear-gradient(135deg,#f87171 0%,#fbbf24 50%,#fde68a 100%)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',animation:'tp-glow 3s ease-in-out infinite'}}>Tripy</span>
                    <br/>
                    <span style={{color:'rgba(255,255,255,0.3)',fontSize:'0.48em',fontWeight:600,letterSpacing:0}}>Move your mouse to see Tripy react in real-time</span>
                </h1>

                <p style={{fontSize:15,color:'rgba(255,255,255,0.42)',lineHeight:1.78,margin:'0 0 32px 0',maxWidth:440,animation:'tp-in 0.5s 0.16s ease-out both'}}>
                    A Framer Motion 3D travel suitcase chatbot with mouse-reactive tilting, animated telescopic handle, spinning wheels, and a joyful xylophone jingle on every click.
                </p>

                {/* Feature cards */}
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:12,animation:'tp-card 0.5s 0.26s ease-out both'}}>
                    {FEATURES.map((f,i)=>(
                        <div key={i} className="tp2-card" style={{padding:'16px 14px',borderRadius:14,background:'rgba(255,255,255,0.022)',border:'1px solid rgba(255,255,255,0.06)',cursor:'default',transition:'transform .24s ease,border-color .24s ease'}}>
                            <div style={{width:36,height:36,borderRadius:9,background:`${f.color}12`,border:`1px solid ${f.color}25`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,marginBottom:10}}>{f.icon}</div>
                            <div style={{fontSize:12.5,fontWeight:700,color:'#fff',marginBottom:5,letterSpacing:'-0.01em'}}>{f.title}</div>
                            <div style={{fontSize:11,color:'rgba(255,255,255,0.34)',lineHeight:1.55}}>{f.desc}</div>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div style={{display:'flex',alignItems:'center',gap:16,marginTop:28,animation:'tp-card 0.5s 0.38s ease-out both'}}>
                    <button className="tp2-btn" onClick={handleCTA} style={{display:'flex',alignItems:'center',gap:8,padding:'11px 26px',borderRadius:11,background:'linear-gradient(135deg,#ef4444,#f97316)',border:'none',color:'#fff',fontSize:13.5,fontWeight:800,cursor:'pointer',boxShadow:'0 4px 20px rgba(239,68,68,0.3)',transition:'transform .2s ease,box-shadow .2s ease'}}>
                        🧳 Chat with Tripy
                    </button>
                    <span style={{fontSize:11,color:'rgba(255,255,255,0.2)',letterSpacing:'0.08em'}}>or click the bot →</span>
                </div>
            </div>

            {/* ══════════════════════════════════════════════ */}
            {/*      BOTTOM-RIGHT  TRIPY WIDGET               */}
            {/* ══════════════════════════════════════════════ */}
            <motion.div
                initial={{ opacity: 0, scale: 0.4, y: 55 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.65, ease: [0.34,1.56,0.64,1] }}
                style={{
                    position:'absolute',
                    bottom: isMobile ? 15 : 16,
                    right: isMobile ? '50%' : 22,
                    transform: isMobile ? 'translateX(50%)' : 'none',
                    zIndex:50,
                    display:'flex',
                    flexDirection:'column',
                    alignItems: isMobile ? 'center' : 'flex-end',
                    gap:10
                }}
            >

                {/* Thinking / speech bubble — default visible */}
                {isThinking && !showMsg && (
                    <div style={{padding:'9px 14px',borderRadius:'14px 14px 4px 14px',background:'linear-gradient(135deg,#fde68a 0%,#fbbf24 100%)',boxShadow:'0 6px 18px rgba(251,191,36,0.35), 0 2px 6px rgba(0,0,0,0.3)',animation:'tp-think 0.3s ease-out both',display:'flex',alignItems:'center',gap:6,position:'relative'}}>
                        {/* Typing dots */}
                        {[0,1,2].map(i => (
                            <div key={i} style={{width:7,height:7,borderRadius:'50%',background:'#92400e',boxShadow:'0 1px 2px rgba(0,0,0,0.2)',animation:'tp-dot 1.1s ease-in-out infinite',animationDelay:`${i*0.22}s`}} />
                        ))}
                        {/* Tiny label */}
                        <span style={{fontSize:9,fontWeight:700,color:'#78350faa',letterSpacing:'0.08em',marginLeft:2}}>{THINKS[thinkIdx]}</span>
                        {/* Bubble tail */}
                        <div style={{position:'absolute',bottom:-8,right:12,width:0,height:0,borderLeft:'7px solid transparent',borderRight:'0px solid transparent',borderTop:'9px solid #fbbf24'}} />
                    </div>
                )}

                {/* Chat message */}
                {showMsg && (
                    <div style={{padding:'10px 15px',borderRadius:'13px 13px 4px 13px',background:'rgba(28,8,8,0.96)',border:`1px solid ${acc}55`,backdropFilter:'blur(16px)',color:'#fff',fontSize:12.5,fontWeight:600,whiteSpace:'nowrap',boxShadow:'0 8px 28px rgba(0,0,0,0.5)',animation:'tp-msg 0.3s ease-out both'}}>
                        {MSGS[msgIndex]}
                    </div>
                )}

                {/* Soundwave bars */}
                {soundActive && (
                    <div style={{display:'flex',alignItems:'center',gap:4,justifyContent:'flex-end'}}>
                        <span style={{fontSize:9,color:`${acc}88`,letterSpacing:'0.1em'}}>♪</span>
                        <div style={{display:'flex',alignItems:'center',gap:2.5,height:20}}>
                            {[4,7,12,15,12,8,13,9,5,10,14,8,4].map((h,i)=>(
                                <div key={i} style={{width:2.5,height:h*1.5,borderRadius:2,background:`linear-gradient(180deg,${acc},${acc}66)`,boxShadow:`0 0 4px ${acc}88`,animation:'tp-wbar 0.55s ease-in-out infinite',animationDelay:`${i*0.04}s`}} />
                            ))}
                        </div>
                        <span style={{fontSize:9,color:`${acc}88`,letterSpacing:'0.1em'}}>♪</span>
                    </div>
                )}

                {/* Click rings */}
                {isClicked && [0,1].map(i=>(
                    <div key={i} style={{position:'absolute',bottom:90,right:52,width:96,height:96,borderRadius:'50%',border:`1.5px solid ${acc}88`,animation:'tp-ring 0.8s ease-out forwards',animationDelay:`${i*0.2}s`,pointerEvents:'none'}} />
                ))}

                {/* Particles */}
                <div style={{position:'absolute',bottom:110,right:60,pointerEvents:'none',width:0,height:0}}>
                    {particles.map(p=>{
                        const rad=(p.angle*Math.PI)/180;
                        return <div key={p.id} style={{position:'absolute',width:8,height:8,borderRadius:'50%',background:p.color,boxShadow:`0 0 8px ${p.color}`,'--tx':`${Math.cos(rad)*p.dist}px`,'--ty':`${-Math.sin(rad)*p.dist}px`,animation:'tp-part 0.8s ease-out forwards'} as React.CSSProperties} />;
                    })}
                </div>

                {/* ── THE TRIPY SUITCASE ── */}
                <button onClick={handleClick} style={{background:'transparent',border:'none',cursor:'pointer',padding:0,outline:'none',WebkitTapHighlightColor:'transparent'}} title="Click Tripy!">
                    <TripyFigure
                        mouseX={mouseX}
                        mouseY={mouseY}
                        isClicked={isClicked}
                        isWaving={isWaving}
                        mood={mood}
                        wheelSpin={wheelSpin}
                    />
                    {/* Label */}
                    <div style={{textAlign:'center',marginTop:6,fontFamily:"'Orbitron',sans-serif",fontSize:9.5,fontWeight:900,letterSpacing:'0.24em',color:'rgba(255,255,255,0.88)',textShadow:`0 0 10px ${acc}99, 0 0 22px ${acc}44`,background:'rgba(255,255,255,0.02)',border:`1px solid ${acc}28`,borderRadius:6,padding:'4px 12px',backdropFilter:'blur(8px)',transition:'border-color 0.3s, text-shadow 0.3s'}}>
                        TRIPY
                    </div>
                </button>

                {clickCount > 0 && (
                    <div style={{textAlign:'center',fontSize:9,color:'rgba(251,191,36,0.3)',letterSpacing:'0.1em',fontFamily:'monospace'}}>
                        × {clickCount} interactions
                    </div>
                )}
            </motion.div>

            {/* Page corner decorations */}
            <div style={{position:'absolute',top:18,right:18,width:20,height:20,borderTop:'1.5px solid rgba(239,68,68,0.2)',borderRight:'1.5px solid rgba(239,68,68,0.2)',pointerEvents:'none',zIndex:2}} />
            <div style={{position:'absolute',bottom:18,left:18,width:20,height:20,borderBottom:'1.5px solid rgba(251,191,36,0.2)',borderLeft:'1.5px solid rgba(251,191,36,0.2)',pointerEvents:'none',zIndex:2}} />
            <div style={{position:'absolute',bottom:0,left:0,right:0,height:1,background:'linear-gradient(90deg,transparent,rgba(239,68,68,0.2),transparent)',pointerEvents:'none',zIndex:2}} />
        </div>
    );
};

export default Tripy;
