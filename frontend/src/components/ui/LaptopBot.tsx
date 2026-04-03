import React, { useRef, useEffect, useCallback, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import Logo from './Logo';
import './LaptopBot.css';

/* ══════════════════════════════════════════════════════ */
/*                  SOUND – Cute Synth Beeps              */
/* ══════════════════════════════════════════════════════ */
const playBeep = (type: 'click' | 'think' | 'happy') => {
    try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const master = ctx.createGain();
        const delay  = ctx.createDelay(0.4);
        const dGain  = ctx.createGain();
        delay.delayTime.value = 0.15;
        dGain.gain.value      = 0.15;
        delay.connect(dGain); dGain.connect(master); master.connect(ctx.destination);
        const t = ctx.currentTime;

        const beep = (freq: number, start: number, vol: number, dur: number, synthType: OscillatorType = 'sine') => {
            const o1 = ctx.createOscillator(), g = ctx.createGain();
            o1.connect(g); g.connect(master); g.connect(delay);
            o1.type = synthType; o1.frequency.value = freq;
            g.gain.setValueAtTime(0, t + start);
            g.gain.linearRampToValueAtTime(vol, t + start + 0.01);
            g.gain.exponentialRampToValueAtTime(0.001, t + start + dur);
            o1.start(t + start); o1.stop(t + start + dur);
        };

        if (type === 'click') {
            [880, 1108.73, 1318.51].forEach((f, i) => beep(f, i * 0.08, 0.12, 0.4, 'triangle'));
            master.gain.setValueAtTime(0.6, t); master.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
        } else if (type === 'happy') {
            [659.25, 880, 1046.5, 1318.51].forEach((f, i) => beep(f, i * 0.05, 0.1, 0.5, 'sine'));
            master.gain.setValueAtTime(0.6, t); master.gain.exponentialRampToValueAtTime(0.001, t + 1.0);
        } else {
            beep(440, 0, 0.05, 0.3, 'square'); beep(554.37, 0.1, 0.05, 0.3, 'square');
            master.gain.setValueAtTime(0.4, t); master.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
        }
    } catch (_) {}
};

/* ── Data ── */
const MSGS   = ["Hey! I'm LAPTOP 👋", "Systems online 🟢", "Let's code!", "AI Assistant ready~", "Processing...", "UI HUB is blazing fast ⚡", "Compiling styles..."];
const THINKS = ["Analyzing...", "Booting up...", "Computing...", "Running scripts...", "Loading AI models..."];
const FEATURES = [
    { icon: '💻', title: '3D Laptop Base', desc: 'Glossy soft-rounded laptop chassis with animated treads', color: '#22d3ee' },
    { icon: '👁️', title: 'Framer Motion Eyes', desc: 'Digital LCD face with cursor-tracking eyes and expressions', color: '#a78bfa' },
    { icon: '🎵', title: 'Synth Audio', desc: 'Digital synth beeps and blips triggered on interaction', color: '#4ade80' },
];

/* ══════════════════════════════════════════════════════ */
/*                 LAPTOP ROBOT CHARACTER                 */
/* ══════════════════════════════════════════════════════ */
const LaptopRobot: React.FC<{
    mouseX: number; mouseY: number;
    isGreeting: boolean; isClicked: boolean;
    mood: string;
}> = ({ mouseX, mouseY, isGreeting, isClicked, mood }) => {

    // Spring-smoothed head / screen tilt
    const rotY = useSpring(useMotionValue(mouseX * 15), { stiffness: 60, damping: 15 });
    const rotX = useSpring(useMotionValue(-mouseY * 10), { stiffness: 60, damping: 15 });
    const eyeX = useSpring(useMotionValue(mouseX * 10), { stiffness: 70, damping: 12 });
    const eyeY = useSpring(useMotionValue(mouseY * 8), { stiffness: 70, damping: 12 });

    useEffect(() => {
        if (!isGreeting) {
            rotY.set(mouseX * 25);
            rotX.set(-mouseY * 15);
            eyeX.set(mouseX * 12);
            eyeY.set(mouseY * 8);
        } else {
            rotY.set(0);
            rotX.set(-15);
            eyeX.set(0);
            eyeY.set(0);
        }
    }, [mouseX, mouseY, isGreeting, rotY, rotX, eyeX, eyeY]);

    const accColor = 
        mood === 'excited' ? '#fbbf24' : 
        mood === 'happy' ? '#34d399' : 
        mood === 'thinking' ? '#a78bfa' : '#22d3ee'; // default cyan

    return (
        <div className="lb-root" style={{ transform: isClicked ? 'scale(1.05)' : 'scale(1)', transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1)' }}>
            
            {/* Floats up and down slightly */}
            <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
                {/* ── SCREEN / HEAD ── */}
                <motion.div
                    className="lb-screen-wrap"
                    style={{
                        rotateY: rotY,
                        rotateX: rotX,
                        transformOrigin: 'bottom center',
                    }}
                >
                    {/* Glass screen */}
                    <div className="lb-glass">
                        <div className="lb-shine" />
                        
                        {/* Face UI */}
                        <div className="lb-face">
                            <motion.div 
                                className="lb-eyes"
                                style={{ x: eyeX, y: eyeY }}
                                animate={isGreeting ? { scaleY: [1, 0.1, 1, 1, 0.1, 1] } : { scaleY: [1, 0.1, 1] }}
                                transition={isGreeting 
                                    ? { duration: 1.5, ease: 'easeOut' }
                                    : { duration: 4.5, repeat: Infinity, times: [0, 0.03, 0.06], ease: 'easeOut', delay: 1 }
                                }
                            >
                                <motion.div className="lb-eye" style={{ background: accColor, boxShadow: `0 0 10px ${accColor}, 0 0 20px ${accColor}aa` }} />
                                <motion.div className="lb-eye" style={{ background: accColor, boxShadow: `0 0 10px ${accColor}, 0 0 20px ${accColor}aa` }} />
                            </motion.div>
                            
                            {/* Mouth */}
                            <motion.div 
                                className="lb-mouth"
                                style={{ borderColor: accColor, boxShadow: `0 4px 6px -2px ${accColor}88` }}
                                animate={
                                    mood === 'excited' ? { height: 16, borderRadius: '2px 2px 20px 20px', borderBottomWidth: 6, width: 24 } :
                                    mood === 'happy' ? { height: 12, borderRadius: '50%', borderBottomWidth: 4 } :
                                    mood === 'thinking' ? { height: 2, borderRadius: '2px', borderBottomWidth: 4, width: 14 } :
                                    { height: 10, borderRadius: '50%', borderBottomWidth: 3 }
                                }
                                transition={{ duration: 0.3 }}
                            />
                        </div>

                        {/* Neon accent lines */}
                        <div className="lb-neon-line lb-neon-left" style={{ background: accColor, boxShadow: `0 0 8px ${accColor}, 0 0 15px ${accColor}aa` }} />
                        <div className="lb-neon-line lb-neon-right" style={{ background: accColor, boxShadow: `0 0 8px ${accColor}, 0 0 15px ${accColor}aa` }} />
                    </div>
                </motion.div>

                {/* ── HINGE ── */}
                <div className="lb-hinge" />

                {/* ── BASE (Keyboard area) ── */}
                <div className="lb-base">
                    <div className={`lb-keyboard ${isGreeting ? 'active' : ''}`}>
                        {[
                            [1,1,1,1,1,1,1,1,1,1,1,1,1],
                            [1.5,1,1,1,1,1,1,1,1,1,1,1.5],
                            [1.8,1,1,1,1,1,1,1,1,1,1.8],
                            [2.2,1,1,1,1,1,1,1,1,2.2],
                            [1.2,1.2,1.2,5,1.2,1.2,1.2]
                        ].map((row, r) => (
                            <div key={r} className="lb-row">
                                {row.map((w, i) => (
                                    <div key={i} className="lb-key" style={{ flex: w }} />
                                ))}
                            </div>
                        ))}
                    </div>
                    <div className="lb-touchpad" />
                </div>

                {/* ── WHEELS ── */}
                <div className="lb-wheels-wrap">
                    <div className="lb-wheel"><div className="lb-wheel-tread"></div></div>
                    <div className="lb-wheel"><div className="lb-wheel-tread"></div></div>
                </div>
            </motion.div>

            {/* ── SHADOW ── */}
            <div className="lb-shadow" style={{ background: `radial-gradient(ellipse, ${accColor}33 0%, transparent 70%)` }} />
        </div>
    );
};

/* ══════════════════════════════════════════════════════ */
/*                     MAIN PAGE                          */
/* ══════════════════════════════════════════════════════ */
const LaptopBot: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [mouseX, setMouseX]       = useState(0);
    const [mouseY, setMouseY]       = useState(0);
    const [isGreeting, setIsGreeting] = useState(false);
    const [isClicked, setIsClicked] = useState(false);
    const [mood, setMood]           = useState<'idle'|'thinking'|'happy'|'excited'>('idle');
    const [msgIndex, setMsgIndex]   = useState(0);
    const [showMsg, setShowMsg]     = useState(true); // startup message
    const [isThinking, setIsThinking] = useState(false);
    const [thinkIdx, setThinkIdx]   = useState(0);
    const [soundActive, setSoundActive] = useState(false);
    const [clickCount, setClickCount] = useState(0);
    const [isMobile, setIsMobile]     = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        // Hide startup msg after 3s
        setTimeout(() => setShowMsg(false), 3000);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Normalize mouse position -1 to +1
    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const r = containerRef.current?.getBoundingClientRect();
        if (!r) return;
        setMouseX(((e.clientX - r.left) / r.width  - 0.5) * 2);
        setMouseY(((e.clientY - r.top)  / r.height - 0.5) * 2);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setMouseX(0); setMouseY(0);
    }, []);

    // Rotate thinking phrases
    useEffect(() => {
        const t = setInterval(() => setThinkIdx(p => (p + 1) % THINKS.length), 2000);
        return () => clearInterval(t);
    }, []);

    const handleClick = () => {
        setClickCount(c => c + 1);
        playBeep('click');
        setSoundActive(true); setTimeout(() => setSoundActive(false), 800);
        setIsClicked(true);
        setIsGreeting(true);
        setMood('excited');
        setIsThinking(false);
        setMsgIndex(p => (p + 1) % MSGS.length);
        setShowMsg(true);
        
        setTimeout(() => setIsClicked(false), 200);
        setTimeout(() => { setIsGreeting(false); setMood('idle'); setIsThinking(true); }, 2000);
        setTimeout(() => { setShowMsg(false); }, 3500);
        setTimeout(() => { setIsThinking(false); }, 7500); // stop thinking after a while
    };

    const handleCTA = () => {
        playBeep('happy');
        setIsGreeting(true); setMood('happy'); setIsThinking(false);
        setMsgIndex(0); setShowMsg(true);
        setTimeout(() => { setIsGreeting(false); setMood('idle'); }, 2500);
        setTimeout(() => setShowMsg(false), 4000);
    };

    const accColor = mood === 'excited' ? '#fbbf24' : mood === 'happy' ? '#34d399' : mood === 'thinking' ? '#a78bfa' : '#22d3ee';

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                width:'100%', height: isMobile ? 'auto' : '100%', minHeight: isMobile ? '520px' : '100%',
                background:'radial-gradient(ellipse at 80% 20%, #08122a 0%, #050a14 50%, #020408 100%)',
                position:'relative', overflowX:'hidden', overflowY: isMobile ? 'auto' : 'hidden',
                fontFamily:"'Inter','Segoe UI',sans-serif",
                display:'flex', flexDirection:'column',
                scrollBehavior: 'smooth'
            }}
        >
            <div style={{ position: 'absolute', top: isMobile ? 12 : 24, right: isMobile ? 12 : 24, zIndex: 100 }}>
                <Logo className="w-6 h-6" showText={true} color="#22d3ee" />
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Orbitron:wght@700;900&display=swap');
                @keyframes lb-in { from{opacity:0;transform:translateY(15px)} to{opacity:1;transform:translateY(0)} }
                @keyframes lb-type { 0%,100%{transform:scale(0.8);opacity:0.5} 50%{transform:scale(1.2);opacity:1} }
                @keyframes lb-bbl-in { from{opacity:0;transform:translateY(10px) scale(0.9)} to{opacity:1;transform:translateY(0) scale(1)} }
                .lb2-card:hover { transform:translateY(-5px)!important; border-color:rgba(34, 211, 238, 0.3)!important; }
                .lb2-btn:hover  { transform:translateY(-2px); box-shadow: 0 6px 20px rgba(34, 211, 238, 0.4)!important; }
            `}</style>

            {/* Ambient bg elements */}
            <div style={{position:'absolute',inset:0,pointerEvents:'none',zIndex:0}}>
                <div style={{position:'absolute',inset:0,backgroundImage:'radial-gradient(rgba(34,211,238,0.05) 1px,transparent 1px)',backgroundSize:'40px 40px'}} />
                <div style={{position:'absolute',top:'20%',right:'10%',width:300,height:300,borderRadius:'50%',background:'radial-gradient(circle, rgba(34,211,238,0.05) 0%, transparent 60%)',filter:'blur(40px)'}} />
                <div style={{position:'absolute',bottom:'10%',left:'20%',width:250,height:250,borderRadius:'50%',background:'radial-gradient(circle, rgba(167,139,250,0.05) 0%, transparent 60%)',filter:'blur(40px)'}} />
            </div>

            {/* ── Left content ── */}
            <div style={{
                flex:1, display:'flex', flexDirection:'column', justifyContent:'center',
                padding: isMobile ? '40px 20px' : 'clamp(24px,4vw,56px)',
                paddingBottom: isMobile ? 180 : 130,
                position:'relative', zIndex:1, maxWidth:720
            }}>
                <div style={{display:'inline-flex',alignItems:'center',gap:8,marginBottom:20,padding:'5px 14px',borderRadius:999,background:'rgba(34,211,238,0.1)',border:'1px solid rgba(34,211,238,0.2)',width:'fit-content',animation:'lb-in 0.5s ease-out both'}}>
                    <div style={{width:6,height:6,borderRadius:'50%',background:'#22d3ee',boxShadow:'0 0 8px #22d3ee'}} />
                    <span style={{fontSize:10,fontWeight:800,color:'#22d3ee',letterSpacing:'0.15em',textTransform:'uppercase'}}>3D CHATBOT — LAPTOP</span>
                </div>

                <h1 style={{fontSize:'clamp(28px,4vw,52px)',fontWeight:900,color:'#fff',lineHeight:1.1,margin:'0 0 14px 0',letterSpacing:'-0.03em',animation:'lb-in 0.5s 0.1s ease-out both'}}>
                    Meet{' '}
                    <span style={{background:'linear-gradient(135deg,#22d3ee 0%,#a78bfa 100%)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Laptop</span>
                    <br/>
                    <span style={{color:'rgba(255,255,255,0.3)',fontSize:'0.45em',fontWeight:600,letterSpacing:0}}>A cute, interactive desktop companion.</span>
                </h1>

                <p style={{fontSize:15,color:'rgba(255,255,255,0.4)',lineHeight:1.75,margin:'0 0 32px 0',maxWidth:480,animation:'lb-in 0.5s 0.2s ease-out both'}}>
                    A futuristic AI interface embedded in a glossy 3D laptop chassis. Features an animated LCD face, mouse-tracking, and synthesizer audio responses for a premium interaction experience.
                </p>

                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:12,animation:'lb-in 0.5s 0.3s ease-out both'}}>
                    {FEATURES.map((f,i)=>(
                        <div key={i} className="lb2-card" style={{padding:'16px',borderRadius:12,background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.05)',cursor:'default',transition:'transform .2s ease,border-color .2s ease'}}>
                            <div style={{fontSize:20,marginBottom:8}}>{f.icon}</div>
                            <div style={{fontSize:13,fontWeight:700,color:'#fff',marginBottom:4}}>{f.title}</div>
                            <div style={{fontSize:11,color:'rgba(255,255,255,0.4)',lineHeight:1.5}}>{f.desc}</div>
                        </div>
                    ))}
                </div>

                <div style={{display:'flex',alignItems:'center',gap:16,marginTop:30,animation:'lb-in 0.5s 0.4s ease-out both'}}>
                    <button className="lb2-btn" onClick={handleCTA} style={{display:'flex',alignItems:'center',gap:8,padding:'12px 24px',borderRadius:8,background:'linear-gradient(135deg,#22d3ee,#3b82f6)',border:'none',color:'#fff',fontSize:13.5,fontWeight:700,cursor:'pointer',boxShadow:'0 4px 15px rgba(34,211,238,0.25)',transition:'all .2s ease'}}>
                        💻 Initialize Chat
                    </button>
                    <span style={{fontSize:11,color:'rgba(255,255,255,0.25)'}}>Try clicking the laptop!</span>
                </div>
            </div>

            {/* ══════════════════════════════════════════ */}
            {/*          BOTTOM-RIGHT LAPTOP BOT           */}
            {/* ══════════════════════════════════════════ */}
            <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6, type: 'spring', damping: 15 }}
                style={{
                    position:'absolute',
                    bottom: isMobile ? 15 : 24,
                    right: isMobile ? '50%' : 40,
                    transform: isMobile ? 'translateX(50%)' : 'none',
                    zIndex:50,
                    display:'flex',
                    flexDirection:'column',
                    alignItems: isMobile ? 'center' : 'flex-end',
                    gap: 12
                }}
            >
                {/* Chat Message / Thinking Bubble */}
                <div style={{ height: 45, display: 'flex', alignItems: 'flex-end', justifyContent: isMobile ? 'center' : 'flex-end', width: '100%', paddingRight: isMobile ? 0 : 20 }}>
                    {showMsg ? (
                        <div className="lb-chat-bubble" style={{ animation: 'lb-bbl-in 0.3s cubic-bezier(0.34,1.56,0.64,1) both' }}>
                            {MSGS[msgIndex]}
                        </div>
                    ) : isThinking ? (
                        <div className="lb-chat-bubble" style={{ animation: 'lb-bbl-in 0.3s cubic-bezier(0.34,1.56,0.64,1) both', color: '#a78bfa', borderColor: 'rgba(167, 139, 250, 0.3)' }}>
                            <div style={{display:'flex', gap: 4, marginRight: 4}}>
                                {[0,1,2].map(i => <div key={i} className="lb-type-dot" style={{ background: '#a78bfa', boxShadow: '0 0 5px #a78bfa', animation: `lb-type 1.2s infinite ${i*0.2}s` }} />)}
                            </div>
                            {THINKS[thinkIdx]}
                        </div>
                    ) : null}
                </div>

                {soundActive && (
                    <div style={{ position: 'absolute', top: -10, right: 0, display: 'flex', gap: 3 }}>
                         {[1,2,3,4].map(i => (
                             <div key={i} style={{ width: 2, height: 10 + Math.random()*10, background: accColor, borderRadius: 2, animation: `lb-type 0.3s infinite alternate ${i*0.1}s` }} />
                         ))}
                    </div>
                )}

                {/* THE LAPTOP */}
                <button onClick={handleClick} style={{background:'transparent',border:'none',cursor:'pointer',padding:0,outline:'none',WebkitTapHighlightColor:'transparent'}} title="Click me!">
                    <LaptopRobot
                        mouseX={mouseX}
                        mouseY={mouseY}
                        isGreeting={isGreeting}
                        isClicked={isClicked}
                        mood={mood}
                    />
                    {/* Floating label */}
                    <div style={{textAlign:'center',marginTop:12,fontFamily:"'Orbitron',sans-serif",fontSize:10,fontWeight:800,letterSpacing:'0.2em',color:'rgba(255,255,255,0.7)',textShadow:`0 0 10px ${accColor}aa`, padding:'2px 10px'}}>
                        LAPTOP_OS
                    </div>
                </button>

            </motion.div>
        </div>
    );
};

export default LaptopBot;
