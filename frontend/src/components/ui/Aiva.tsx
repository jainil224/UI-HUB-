import React, { useRef, useCallback, useState, useEffect } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';
import Logo from './Logo';
import './Aiva.css';


/* ══════════════════════════════════════════════════════ */
/*          SOUND — Warm AI Harmonic Chords               */
/* ══════════════════════════════════════════════════════ */
const playAiva = (type: 'click' | 'think' | 'happy') => {
    try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const master = ctx.createGain();
        // Soft reverb tail
        const delay = ctx.createDelay(0.4);
        const dg = ctx.createGain();
        delay.delayTime.value = 0.2; dg.gain.value = 0.15;
        delay.connect(dg); dg.connect(master); master.connect(ctx.destination);
        const t = ctx.currentTime;

        // Warm sine tone with slight harmonic
        const tone = (freq: number, start: number, vol: number, dur: number, type2: OscillatorType = 'sine') => {
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.connect(g); g.connect(master); g.connect(delay);
            o.type = type2; o.frequency.value = freq;
            g.gain.setValueAtTime(0, t + start);
            g.gain.linearRampToValueAtTime(vol, t + start + 0.018);
            g.gain.exponentialRampToValueAtTime(0.001, t + start + dur);
            o.start(t + start); o.stop(t + start + dur);
        };

        if (type === 'click') {
            // C major 7th chord — warm & intelligent
            tone(523.25, 0.00, 0.14, 0.90);  // C5
            tone(659.25, 0.06, 0.12, 0.80);  // E5
            tone(783.99, 0.12, 0.11, 0.80);  // G5
            tone(987.77, 0.18, 0.09, 0.90);  // B5
            tone(1046.5, 0.28, 0.07, 0.70);  // C6
            // Gentle sub warmth
            tone(130.81, 0.00, 0.05, 0.55, 'triangle'); // C3 warm sub
            master.gain.setValueAtTime(0.72, t);
            master.gain.exponentialRampToValueAtTime(0.001, t + 1.1);
        } else if (type === 'happy') {
            // Rising glide + bright arpeggio
            tone(523.25, 0.00, 0.11, 0.85);
            tone(659.25, 0.04, 0.10, 0.80);
            tone(783.99, 0.08, 0.09, 0.85);
            tone(1046.5, 0.14, 0.08, 0.90);
            master.gain.setValueAtTime(0.65, t);
            master.gain.exponentialRampToValueAtTime(0.001, t + 1.1);
        } else {
            // Soft two-note hum
            tone(329.63, 0.00, 0.05, 0.75); // E4
            tone(392.00, 0.08, 0.04, 0.70); // G4
            master.gain.setValueAtTime(0.48, t);
            master.gain.exponentialRampToValueAtTime(0.001, t + 0.85);
        }
    } catch (_) {}
};

/* ── Data ── */
const MSGS   = ["How can I help? 💙", "I'm Aiva, your AI! 🤖", "Ask me anything! ✨", "Processing... done! ⚡", "Ready to assist! 🚀", "Let's build cool UI!", "UI HUB rocks! 💫", "Click me again~ 👋"];
const THINKS = ["How can I help you?", "Ready to assist...", "Analyzing...", "Processing query...", "Loading AI model..."];
const FEATURES = [
    { icon: '🤖', title: 'Floating 3D',       desc: 'Premium humanoid assistant with shoulders, waist & articulated arms', color: '#67e8f9' },
    { icon: '💡', title: 'Holo Display',        desc: 'Animated cyan chest screen with live data stream bars',            color: '#818cf8' },
    { icon: '🎵', title: 'AI Chord Sound',      desc: 'Warm C-major 7th harmonic chords with reverb on every click',     color: '#86efac' },
];

/* ══════════════════════════════════════════════════════ */
/*          AIVA FIGURE – Framer Motion Driven            */
/* ══════════════════════════════════════════════════════ */
const AivaFigure: React.FC<{
    mouseX: number; mouseY: number;
    isClicked: boolean; mood: string; isWaving: boolean;
    screenActive: boolean;
}> = ({ mouseX, mouseY, isClicked, mood, isWaving, screenActive }) => {

    // Spring-smoothed mouse-driven head rotation
    const rotY = useSpring(useMotionValue(mouseX * 20), { stiffness: 58, damping: 16 });
    const rotX = useSpring(useMotionValue(-mouseY * 12), { stiffness: 58, damping: 16 });
    const rotZ = useSpring(useMotionValue(mouseX * 4.5), { stiffness: 50, damping: 18 });

    useEffect(() => {
        rotY.set(mouseX * 20);
        rotX.set(-mouseY * 12);
        rotZ.set(mouseX * 4.5);
    }, [mouseX, mouseY]);

    const eyeCol = mood === 'excited' ? '#a5f3fc' : mood === 'thinking' ? '#67e8f9' : '#22d3ee';
    const eyeGlow = `0 0 8px ${eyeCol}, 0 0 18px ${eyeCol}99, 0 0 32px ${eyeCol}44`;
    const bodyScale = isClicked ? 'scale(1.08) translateY(-5px)' : 'scale(1)';

    // Screen bar widths cycle when active
    const barWidths = screenActive
        ? ['100%', '72%', '88%', '60%']
        : ['100%', '70%', '85%', '55%'];

    return (
        <div className="av-root" style={{ transform: bodyScale, transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1)' }}>

            {/* ══ HEAD (mouse-driven 3-axis rotation) ══ */}
            <motion.div
                className="av-head"
                style={{
                    rotateY: rotY,
                    rotateX: rotX,
                    rotateZ: rotZ,
                    transformStyle: 'preserve-3d',
                    transformPerspective: 340,
                }}
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
            >
                <div className="av-head-shine" />
                <div className="av-head-shine2" />

                {/* Top detail dots */}
                <div className="av-head-dots">
                    {[0, 1, 2].map(i => (
                        <motion.div
                            key={i}
                            className="av-head-dot"
                            animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.3, 1] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.35 }}
                        />
                    ))}
                </div>

                {/* Ear panels with LEDs */}
                <div className="av-ear av-ear--l">
                    <motion.div
                        className="av-ear-led"
                        animate={{ boxShadow: [`0 0 5px ${eyeCol}`, `0 0 12px ${eyeCol}`, `0 0 5px ${eyeCol}`] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                    />
                </div>
                <div className="av-ear av-ear--r">
                    <motion.div
                        className="av-ear-led"
                        animate={{ boxShadow: [`0 0 5px ${eyeCol}`, `0 0 12px ${eyeCol}`, `0 0 5px ${eyeCol}`] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                    />
                </div>

                {/* Face visor */}
                <div className="av-visor">
                    <div className="av-visor-shine" />
                    {/* Eyes — blink every 4.5s */}
                    <motion.div
                        className="av-eyes"
                        animate={{ scaleY: [1, 0.05, 1] }}
                        transition={{ duration: 4.5, repeat: Infinity, times: [0, 0.04, 0.09], ease: 'easeOut' }}
                    >
                        <motion.div
                            className="av-eye"
                            animate={{ boxShadow: [eyeGlow, `0 0 14px ${eyeCol}, 0 0 28px ${eyeCol}bb`, eyeGlow] }}
                            style={{ background: `radial-gradient(circle at 38% 32%, #ffffff 0%, #a5f3fc 25%, ${eyeCol} 65%, #0ea5e9 100%)` }}
                            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                        />
                        <motion.div
                            className="av-eye"
                            animate={{ boxShadow: [eyeGlow, `0 0 14px ${eyeCol}, 0 0 28px ${eyeCol}bb`, eyeGlow] }}
                            style={{ background: `radial-gradient(circle at 38% 32%, #ffffff 0%, #a5f3fc 25%, ${eyeCol} 65%, #0ea5e9 100%)` }}
                            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: 0.18 }}
                        />
                    </motion.div>

                    {/* Cute, reactive smile */}
                    <motion.div
                        className="av-smile"
                        animate={{
                            boxShadow: [
                                `0 2px 5px ${eyeCol}55`,
                                `0 2px 14px ${eyeCol}`,
                                `0 2px 5px ${eyeCol}55`,
                            ]
                        }}
                        style={{ 
                            borderColor: eyeCol, 
                            transition: 'border-color 0.3s, transform 0.3s',
                            transform: (mood === 'excited' || mood === 'happy') ? 'scale(1.2)' : 'scale(1)',
                        }}
                        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                    />
                </div>
            </motion.div>

            {/* ══ NECK ══ */}
            <div className="av-neck" />

            {/* ══ BODY: Shoulders + Torso + Arms + Waist + Legs (all float together) ══ */}
            <motion.div
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut', delay: 0.22 }}
            >
                {/* Torso Row: ARM-L + TORSO (w/ shoulder pads) + ARM-R */}
                <div className="av-torso-wrap">

                    {/* LEFT ARM */}
                    <motion.div
                        className="av-arm av-arm--l"
                        animate={{ rotate: [0, -9, 0, 9, 0] }}
                        transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
                        style={{ transformOrigin: '80% 5%' }}
                    >
                        <div className="av-arm-upper" />
                        <div className="av-arm-joint" />
                        <div className="av-arm-lower" />
                        <div className="av-hand">
                            <div className="av-fingers">
                                <div className="av-finger" />
                                <div className="av-finger" />
                                <div className="av-finger" />
                            </div>
                        </div>
                    </motion.div>

                    {/* TORSO (contains shoulder pads + chest screen) */}
                    <div className="av-torso">
                        {/* Shoulder pads float on top sides */}
                        <div className="av-shoulder-pad av-shoulder-pad--l" />
                        <div className="av-shoulder-pad av-shoulder-pad--r" />

                        <div className="av-torso-shine" />

                        {/* Chest holographic screen */}
                        <div className="av-chest-screen">
                            {barWidths.map((w, i) => (
                                <motion.div
                                    key={i}
                                    className="av-screen-bar"
                                    animate={{ width: [w, `${parseInt(w) * 0.65}%`, w] }}
                                    transition={{
                                        duration: 1.4 + i * 0.3,
                                        repeat: Infinity,
                                        ease: 'easeInOut',
                                        delay: i * 0.2
                                    }}
                                    style={{ width: w }}
                                />
                            ))}
                            {/* Blinking cursor */}
                            <motion.div
                                className="av-screen-cursor"
                                animate={{ opacity: [1, 0, 1] }}
                                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                            />
                        </div>
                    </div>

                    {/* RIGHT ARM — waves on click */}
                    <motion.div
                        className="av-arm av-arm--r"
                        animate={isWaving
                            ? { rotate: [0, -60, -10, -55, -15, 0] }
                            : { rotate: [0, 9, 0, -9, 0] }
                        }
                        transition={isWaving
                            ? { duration: 1.6, ease: 'easeInOut' }
                            : { duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }
                        }
                        style={{ transformOrigin: '20% 5%' }}
                    >
                        <div className="av-arm-upper" />
                        <div className="av-arm-joint" />
                        <div className="av-arm-lower" />
                        <div className="av-hand">
                            <div className="av-fingers">
                                <div className="av-finger" />
                                <div className="av-finger" />
                                <div className="av-finger" />
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* WAIST (Floating base) */}
                <div className="av-waist" />
            </motion.div>

            {/* Ground glow shadow */}
            <div className="av-shadow" />
        </div>
    );
};

/* ══════════════════════════════════════════════════════ */
/*                     MAIN PAGE                          */
/* ══════════════════════════════════════════════════════ */
const Aiva: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [mouseX, setMouseX]           = useState(0);
    const [mouseY, setMouseY]           = useState(0);
    const [isClicked, setIsClicked]     = useState(false);
    const [isWaving, setIsWaving]       = useState(false);
    const [mood, setMood]               = useState<'idle' | 'thinking' | 'happy' | 'excited'>('thinking');
    const [msgIndex, setMsgIndex]       = useState(0);
    const [showMsg, setShowMsg]         = useState(false);
    const [isThinking, setIsThinking]   = useState(true);
    const [thinkIdx, setThinkIdx]       = useState(0);
    const [soundActive, setSoundActive] = useState(false);
    const [screenActive, setScreenActive] = useState(false);
    const [particles, setParticles]     = useState<{ id: number; angle: number; color: string; dist: number }[]>([]);
    const [clickCount, setClickCount]   = useState(0);
    const [isMobile, setIsMobile]       = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
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

    // Cycle thinking phrases
    useEffect(() => {
        const t = setInterval(() => setThinkIdx(p => (p + 1) % THINKS.length), 2200);
        return () => clearInterval(t);
    }, []);

    const spawnParticles = useCallback(() => {
        const cols = ['#22d3ee', '#67e8f9', '#818cf8', '#a5f3fc', '#86efac', '#ffffff'];
        const ps = Array.from({ length: 14 }, (_, i) => ({
            id: Date.now() + i,
            angle: (360 / 14) * i + Math.random() * 18,
            color: cols[i % cols.length],
            dist: 40 + Math.random() * 50,
        }));
        setParticles(ps);
        setTimeout(() => setParticles([]), 900);
    }, []);

    const handleClick = () => {
        setClickCount(c => c + 1);
        playAiva('click');
        setSoundActive(true); setTimeout(() => setSoundActive(false), 950);
        setIsClicked(true);
        setIsWaving(true);
        setMood('excited');
        setIsThinking(false);
        setScreenActive(true);
        setMsgIndex(p => (p + 1) % MSGS.length);
        setShowMsg(true);
        spawnParticles();
        setTimeout(() => setIsClicked(false), 300);
        setTimeout(() => setScreenActive(false), 2000);
        setTimeout(() => { setIsWaving(false); setMood('thinking'); setIsThinking(true); }, 2400);
        setTimeout(() => setShowMsg(false), 4500);
    };

    const handleCTA = () => {
        playAiva('happy');
        setIsWaving(true); setMood('happy'); setIsThinking(false);
        setScreenActive(true);
        setMsgIndex(0); setShowMsg(true);
        setTimeout(() => setScreenActive(false), 2000);
        setTimeout(() => { setIsWaving(false); setMood('thinking'); setIsThinking(true); }, 2400);
        setTimeout(() => setShowMsg(false), 4500);
    };

    const acc = mood === 'excited' ? '#a5f3fc' : mood === 'thinking' ? '#67e8f9' : mood === 'happy' ? '#86efac' : '#22d3ee';

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                width: '100%', height: isMobile ? 'auto' : '100%', minHeight: isMobile ? '520px' : '100%',
                background: 'radial-gradient(ellipse at 18% 45%, #060d1f 0%, #040912 50%, #020408 100%)',
                position: 'relative', overflowX: 'hidden', overflowY: isMobile ? 'auto' : 'hidden',
                fontFamily: "'Inter','Segoe UI',sans-serif",
                display: 'flex', flexDirection: 'column',
                scrollBehavior: 'smooth'
            }}

        >
            <div style={{
                position: 'absolute',
                top: isMobile ? 12 : 24,
                right: isMobile ? 12 : 24,
                zIndex: 100
            }}>
                <Logo className="w-6 h-6" showText={true} color="#67e8f9" />
            </div>

            <style>{`

                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Orbitron:wght@700;900&display=swap');
                @keyframes av-orb  { 0%,100%{transform:translate(0,0);opacity:.07} 50%{transform:translate(14px,-10px);opacity:.15} }
                @keyframes av-grid { 0%{background-position:0 0} 100%{background-position:48px 48px} }
                @keyframes av-in   { from{opacity:0;transform:translateY(-14px)} to{opacity:1;transform:translateY(0)} }
                @keyframes av-card { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
                @keyframes av-bot  { from{opacity:0;transform:scale(0.38) translateY(55px)} to{opacity:1;transform:scale(1) translateY(0)} }
                @keyframes av-msg  { from{opacity:0;transform:translateY(8px) scale(0.9)} to{opacity:1;transform:none} }
                @keyframes av-think{ from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }
                @keyframes av-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
                @keyframes av-dot  { 0%,100%{transform:translateY(0);opacity:0.3} 50%{transform:translateY(-5px);opacity:1} }
                @keyframes av-badge{ 0%,100%{opacity:1} 50%{opacity:0.2} }
                @keyframes av-ring { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(3.6);opacity:0} }
                @keyframes av-part { 0%{transform:translate(0,0) scale(1.1);opacity:1} 100%{transform:translate(var(--tx),var(--ty)) scale(0);opacity:0} }
                @keyframes av-wbar { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(0.22)} }
                @keyframes av-glow { 0%,100%{text-shadow:none} 50%{text-shadow:0 0 30px rgba(34,211,238,0.38)} }
                @keyframes av-bkt  { 0%,100%{opacity:0.28} 50%{opacity:0.85} }
                @keyframes av-scan { 0%,100%{transform:translateY(-30px);opacity:0} 30%{opacity:0.55} 70%{opacity:0.55} 99%{transform:translateY(26px)} }
                .av2-card:hover { transform:translateY(-5px)!important; border-color:rgba(34,211,238,0.18)!important; }
                .av2-btn:hover  { transform:translateY(-2px); }
            `}</style>

            {/* ── Ambient BG ── */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(34,211,238,0.014) 1px,transparent 1px),linear-gradient(90deg,rgba(34,211,238,0.014) 1px,transparent 1px)', backgroundSize: '48px 48px', animation: 'av-grid 16s linear infinite' }} />
                {[
                    { top: '6%',    left: '2%',   w: 290, col: 'rgba(34,211,238,0.07)',  d: '8s' },
                    { top: '40%',   right: '3%',  w: 180, col: 'rgba(129,140,248,0.07)', d: '6s 2s' },
                    { bottom: '8%', left: '20%',  w: 220, col: 'rgba(103,232,249,0.06)', d: '10s reverse' },
                ].map((o, i) => (
                    <div key={i} style={{ position: 'absolute', top: (o as any).top, bottom: (o as any).bottom, left: (o as any).left, right: (o as any).right, width: o.w, height: o.w, borderRadius: '50%', background: `radial-gradient(circle,${o.col} 0%,transparent 70%)`, animation: `av-orb ${o.d} ease-in-out infinite` }} />
                ))}
            </div>

            {/* ── Left content ── */}
            <div style={{
                flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
                padding: isMobile ? '40px 20px' : 'clamp(24px,4vw,56px)',
                paddingBottom: isMobile ? 180 : 150,
                position: 'relative', zIndex: 1, maxWidth: 720
            }}>


                {/* Badge */}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 20, padding: '5px 14px', borderRadius: 999, background: 'rgba(34,211,238,0.07)', border: '1px solid rgba(34,211,238,0.2)', width: 'fit-content', animation: 'av-in 0.5s ease-out both' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22d3ee', boxShadow: '0 0 8px #22d3ee', animation: 'av-badge 1.5s ease-in-out infinite' }} />
                    <span style={{ fontSize: 10, fontWeight: 800, color: 'rgba(103,232,249,0.85)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>3D CHATBOT — AIVA</span>
                </div>

                {/* Title */}
                <h1 style={{ fontSize: 'clamp(28px,4vw,52px)', fontWeight: 900, color: '#fff', lineHeight: 1.1, margin: '0 0 14px 0', letterSpacing: '-0.03em', animation: 'av-in 0.5s 0.08s ease-out both' }}>
                    Meet{' '}
                    <span style={{ background: 'linear-gradient(135deg,#67e8f9 0%,#22d3ee 40%,#818cf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'av-glow 3s ease-in-out infinite' }}>Aiva</span>
                    <br />
                    <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.48em', fontWeight: 600, letterSpacing: 0 }}>Move your mouse — she follows every move</span>
                </h1>

                <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.42)', lineHeight: 1.78, margin: '0 0 32px 0', maxWidth: 450, animation: 'av-in 0.5s 0.16s ease-out both' }}>
                    A floating Framer Motion AI assistant with mouse-reactive head, animated holographic chest display, shoulder armor, and warm harmonic chord tones on every interaction.
                </p>

                {/* Feature cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12, animation: 'av-card 0.5s 0.26s ease-out both' }}>
                    {FEATURES.map((f, i) => (
                        <div key={i} className="av2-card" style={{ padding: '16px 14px', borderRadius: 14, background: 'rgba(255,255,255,0.022)', border: '1px solid rgba(255,255,255,0.06)', cursor: 'default', transition: 'transform .24s ease,border-color .24s ease' }}>
                            <div style={{ width: 36, height: 36, borderRadius: 9, background: `${f.color}12`, border: `1px solid ${f.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: 10 }}>{f.icon}</div>
                            <div style={{ fontSize: 12.5, fontWeight: 700, color: '#fff', marginBottom: 5, letterSpacing: '-0.01em' }}>{f.title}</div>
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.34)', lineHeight: 1.55 }}>{f.desc}</div>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 28, animation: 'av-card 0.5s 0.38s ease-out both' }}>
                    <button className="av2-btn" onClick={handleCTA} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 26px', borderRadius: 11, background: 'linear-gradient(135deg,#22d3ee,#818cf8)', border: 'none', color: '#fff', fontSize: 13.5, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 20px rgba(34,211,238,0.3)', transition: 'transform .2s ease,box-shadow .2s ease' }}>
                        💙 Chat with Aiva
                    </button>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.08em' }}>or click the bot →</span>
                </div>
            </div>

            {/* ══════════════════════════════════════════════ */}
            {/*        BOTTOM-RIGHT  AIVA WIDGET              */}
            {/* ══════════════════════════════════════════════ */}
            <motion.div
                initial={{ opacity: 0, scale: 0.36, y: 60 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.75, duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
                style={{
                    position: 'absolute',
                    bottom: isMobile ? 15 : 12,
                    right: isMobile ? '50%' : 22,
                    transform: isMobile ? 'translateX(50%)' : 'none',
                    zIndex: 50,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isMobile ? 'center' : 'flex-end',
                    gap: 8
                }}
            >


                {/* Thinking bubble — always on by default */}
                {isThinking && !showMsg && (
                    <div style={{ padding: '8px 14px', borderRadius: '12px 12px 4px 12px', background: 'rgba(4,7,22,0.94)', border: `1px solid ${acc}33`, backdropFilter: 'blur(14px)', boxShadow: '0 4px 20px rgba(0,0,0,0.5)', animation: 'av-think 0.3s ease-out both', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ fontSize: 12, animation: 'av-spin 1.8s linear infinite', display: 'inline-block' }}>⚙️</div>
                        <span style={{ fontSize: 11, color: `${acc}cc`, fontWeight: 600, letterSpacing: '0.05em' }}>{THINKS[thinkIdx]}</span>
                        <div style={{ display: 'flex', gap: 2.5 }}>
                            {[0, 1, 2].map(i => (
                                <div key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: acc, boxShadow: `0 0 5px ${acc}`, animation: 'av-dot 1.1s ease-in-out infinite', animationDelay: `${i * 0.18}s` }} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Chat message */}
                {showMsg && (
                    <div style={{ padding: '10px 15px', borderRadius: '13px 13px 4px 13px', background: 'rgba(4,7,22,0.97)', border: `1px solid ${acc}44`, backdropFilter: 'blur(16px)', color: '#fff', fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap', boxShadow: '0 8px 28px rgba(0,0,0,0.55)', animation: 'av-msg 0.3s ease-out both' }}>
                        {MSGS[msgIndex]}
                    </div>
                )}

                {/* Soundwave bars */}
                {soundActive && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                        <span style={{ fontSize: 9, color: `${acc}88`, letterSpacing: '0.1em' }}>♪</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 2.5, height: 20 }}>
                            {[4, 7, 11, 15, 11, 8, 13, 9, 5, 11, 14, 8, 4].map((h, i) => (
                                <div key={i} style={{ width: 2.5, height: h * 1.5, borderRadius: 2, background: `linear-gradient(180deg,${acc},${acc}66)`, boxShadow: `0 0 4px ${acc}88`, animation: 'av-wbar 0.55s ease-in-out infinite', animationDelay: `${i * 0.04}s` }} />
                            ))}
                        </div>
                        <span style={{ fontSize: 9, color: `${acc}88`, letterSpacing: '0.1em' }}>♪</span>
                    </div>
                )}

                {/* Click rings */}
                {isClicked && [0, 1].map(i => (
                    <div key={i} style={{ position: 'absolute', bottom: 110, right: 54, width: 100, height: 100, borderRadius: '50%', border: `1.5px solid ${acc}88`, animation: 'av-ring 0.82s ease-out forwards', animationDelay: `${i * 0.22}s`, pointerEvents: 'none' }} />
                ))}

                {/* Particles */}
                <div style={{ position: 'absolute', bottom: 130, right: 62, pointerEvents: 'none', width: 0, height: 0 }}>
                    {particles.map(p => {
                        const rad = (p.angle * Math.PI) / 180;
                        return (
                            <div key={p.id} style={{ position: 'absolute', width: 7, height: 7, borderRadius: '50%', background: p.color, boxShadow: `0 0 8px ${p.color}`, '--tx': `${Math.cos(rad) * p.dist}px`, '--ty': `${-Math.sin(rad) * p.dist}px`, animation: 'av-part 0.8s ease-out forwards' } as React.CSSProperties} />
                        );
                    })}
                </div>

                {/* ── THE ROBOT ── */}
                <button
                    onClick={handleClick}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, outline: 'none', WebkitTapHighlightColor: 'transparent' }}
                    title="Click Aiva!"
                >
                    <AivaFigure
                        mouseX={mouseX}
                        mouseY={mouseY}
                        isClicked={isClicked}
                        isWaving={isWaving}
                        mood={mood}
                        screenActive={screenActive}
                    />
                    {/* Label */}
                    <div style={{ textAlign: 'center', marginTop: 6, fontFamily: "'Orbitron',sans-serif", fontSize: 9.5, fontWeight: 900, letterSpacing: '0.24em', color: 'rgba(255,255,255,0.9)', textShadow: `0 0 10px ${acc}99, 0 0 22px ${acc}44`, background: 'rgba(255,255,255,0.02)', border: `1px solid ${acc}28`, borderRadius: 6, padding: '4px 12px', backdropFilter: 'blur(8px)', transition: 'border-color 0.3s, text-shadow 0.3s' }}>
                        AIVA
                    </div>
                </button>

                {clickCount > 0 && (
                    <div style={{ textAlign: 'center', fontSize: 9, color: 'rgba(103,232,249,0.3)', letterSpacing: '0.1em', fontFamily: 'monospace' }}>
                        × {clickCount} interactions
                    </div>
                )}
            </motion.div>

            {/* Page corner decorations */}
            <div style={{ position: 'absolute', top: 18, right: 18, width: 20, height: 20, borderTop: '1.5px solid rgba(34,211,238,0.2)', borderRight: '1.5px solid rgba(34,211,238,0.2)', pointerEvents: 'none', zIndex: 2 }} />
            <div style={{ position: 'absolute', bottom: 18, left: 18, width: 20, height: 20, borderBottom: '1.5px solid rgba(129,140,248,0.2)', borderLeft: '1.5px solid rgba(129,140,248,0.2)', pointerEvents: 'none', zIndex: 2 }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(34,211,238,0.2),transparent)', pointerEvents: 'none', zIndex: 2 }} />
        </div>
    );
};

export default Aiva;
