import React, { useState, useEffect, useRef, useCallback } from 'react';
import Logo from './Logo';


/* ─── Web Audio API – Robotic sound synthesizer ─── */
const playRobotSound = (type: 'click' | 'wave' | 'think') => {
    try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const now = ctx.currentTime;

        if (type === 'click') {
            // Sci-fi boop-beep click sound
            const notes = [523, 659, 784, 1046];
            notes.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain); gain.connect(ctx.destination);
                osc.type = i % 2 === 0 ? 'square' : 'sine';
                osc.frequency.setValueAtTime(freq, now + i * 0.07);
                gain.gain.setValueAtTime(0.12, now + i * 0.07);
                gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.12);
                osc.start(now + i * 0.07);
                osc.stop(now + i * 0.07 + 0.15);
            });
            // Extra bass punch
            const bass = ctx.createOscillator();
            const bassGain = ctx.createGain();
            bass.connect(bassGain); bassGain.connect(ctx.destination);
            bass.type = 'sawtooth'; bass.frequency.setValueAtTime(80, now);
            bassGain.gain.setValueAtTime(0.09, now); bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
            bass.start(now); bass.stop(now + 0.2);
        } else if (type === 'wave') {
            // Happy ascending arpeggio
            [523, 659, 784, 1046, 1318].forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain); gain.connect(ctx.destination);
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + i * 0.08);
                gain.gain.setValueAtTime(0.1, now + i * 0.08);
                gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.2);
                osc.start(now + i * 0.08); osc.stop(now + i * 0.08 + 0.2);
            });
        } else {
            // Soft thinking hum
            const osc = ctx.createOscillator();
            const lfo = ctx.createOscillator();
            const lfoGain = ctx.createGain();
            const gain = ctx.createGain();
            lfo.connect(lfoGain); lfoGain.connect(osc.frequency);
            osc.connect(gain); gain.connect(ctx.destination);
            osc.type = 'sine'; osc.frequency.setValueAtTime(220, now);
            lfo.type = 'sine'; lfo.frequency.setValueAtTime(4, now);
            lfoGain.gain.setValueAtTime(30, now);
            gain.gain.setValueAtTime(0.05, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
            lfo.start(now); osc.start(now);
            lfo.stop(now + 0.6); osc.stop(now + 0.6);
        }
    } catch (_) { /* AudioContext unavailable */ }
};

/* ─── Messages pool ─── */
const BOT_MESSAGES = [
    "Beep boop! Hello! 👋",
    "I'm HoodieBot 🤖",
    "Need UI help?",
    "Let's build something! ✨",
    "Click me again! 😄",
    "Processing... done! ⚡",
    "UI HUB powers me 💚",
    "Happy to assist! 🚀",
];

/* ─── Thinking phrases ─── */
const THINK_PHRASES = ["Thinking...", "Processing...", "Analyzing...", "Computing...", "Loading AI..."];

/* ─── Features ─── */
const FEATURES = [
    { icon: '⚡', title: 'Instant Preview', desc: 'Live rendering with zero setup required', color: '#60a5fa' },
    { icon: '🎨', title: 'Design System', desc: 'Premium UI tokens — colors, fonts, animations', color: '#a78bfa' },
    { icon: '🤖', title: 'AI-Powered', desc: 'HoodieBot assists your UI workflow', color: '#34d399' },
];

/* ══════════════════════════════════════════ */
/*             SOUND WAVE VISUAL             */
/* ══════════════════════════════════════════ */
const SoundWave: React.FC<{ active: boolean }> = ({ active }) => {
    if (!active) return null;
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 24, padding: '0 4px' }}>
            {[3, 5, 8, 5, 3, 6, 9, 6, 3, 5, 8, 5, 3].map((h, i) => (
                <div key={i} style={{
                    width: 2.5,
                    height: h * 2,
                    borderRadius: 2,
                    background: 'linear-gradient(180deg, #ff4444, #ff8800)',
                    boxShadow: '0 0 4px rgba(255,68,68,0.6)',
                    animation: `hb-wave-bar 0.5s ease-in-out infinite`,
                    animationDelay: `${i * 0.05}s`,
                }} />
            ))}
        </div>
    );
};

/* ══════════════════════════════════════════ */
/*           THINKING INDICATOR              */
/* ══════════════════════════════════════════ */
const ThinkingBubble: React.FC<{ phrase: string }> = ({ phrase }) => (
    <div style={{
        padding: '8px 14px',
        borderRadius: '12px 12px 4px 12px',
        background: 'rgba(15,15,30,0.9)',
        border: '1px solid rgba(255,68,68,0.2)',
        backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', gap: 8,
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        animation: 'hb-think-bubble 0.3s ease-out both',
    }}>
        {/* Spinning gear */}
        <div style={{ fontSize: 13, animation: 'hb-spin 1.5s linear infinite', display: 'inline-block' }}>⚙️</div>
        <span style={{ fontSize: 11, color: 'rgba(255,200,200,0.8)', fontWeight: 600, letterSpacing: '0.05em' }}>
            {phrase}
        </span>
        {/* Dot animation */}
        <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {[0, 1, 2].map(i => (
                <div key={i} style={{
                    width: 4, height: 4, borderRadius: '50%',
                    background: '#ff4444',
                    boxShadow: '0 0 6px #ff4444',
                    animation: `hb-dot-jump 1s ease-in-out infinite`,
                    animationDelay: `${i * 0.18}s`,
                }} />
            ))}
        </div>
    </div>
);

/* ══════════════════════════════════════════ */
/*              ROBOT FIGURE                 */
/* ══════════════════════════════════════════ */
const RobotFigure: React.FC<{
    isWaving: boolean;
    eyeBlink: boolean;
    mood: 'idle' | 'happy' | 'excited' | 'thinking';
    isClicked: boolean;
    isThinking: boolean;
    size?: number;
}> = ({ isWaving, eyeBlink, mood, isClicked, isThinking, size = 1 }) => {
    const s = (v: number) => v * size;

    const eyeColor = mood === 'excited' ? '#ffcc00'
        : mood === 'thinking' ? '#60a5fa'
        : '#ff4444';
    const eyeGlow = mood === 'excited' ? '0 0 8px #ffcc00, 0 0 18px #ff8800'
        : mood === 'thinking' ? '0 0 8px #60a5fa, 0 0 18px #3b82f6'
        : '0 0 6px #ff4444, 0 0 14px #ff2222';

    return (
        <div style={{
            position: 'relative',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            transform: isClicked ? 'scale(1.18) rotate(-3deg)' : 'scale(1)',
            transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1)',
        }}>
            {/* Thinking brain particles */}
            {isThinking && (
                <div style={{ position: 'absolute', top: s(-20), left: '50%', pointerEvents: 'none' }}>
                    {['💭', '⚡', '✨'].map((em, i) => (
                        <div key={i} style={{
                            position: 'absolute', fontSize: s(10),
                            animation: `hb-think-particle 2s ease-in-out infinite`,
                            animationDelay: `${i * 0.65}s`,
                            left: `${(i - 1) * s(24)}px`,
                        }}>{em}</div>
                    ))}
                </div>
            )}

            <div style={{ animation: 'hb-float 3.2s ease-in-out infinite' }}>
                <div style={{ animation: isThinking ? 'hb-think-tilt 1.5s ease-in-out infinite' : 'hb-body-tilt 4s ease-in-out infinite' }}>

                    {/* HEAD + HOOD */}
                    <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 10 }}>
                        <div style={{
                            position: 'absolute', top: s(-3), width: s(72), height: s(78),
                            borderRadius: '50% 50% 40% 40%',
                            background: 'linear-gradient(180deg,#555 0%,#3a3a3a 100%)',
                            boxShadow: `0 ${s(6)}px ${s(20)}px rgba(0,0,0,0.6),inset ${s(-6)}px ${s(-3)}px ${s(14)}px rgba(0,0,0,0.4)`,
                        }} />
                        <div style={{
                            position: 'relative', width: s(66), height: s(72),
                            borderRadius: '50% 50% 38% 38%',
                            background: 'linear-gradient(155deg,#888 0%,#666 30%,#555 65%,#444 100%)',
                            boxShadow: `0 ${s(5)}px ${s(18)}px rgba(0,0,0,0.5),inset ${s(-5)}px ${s(-3)}px ${s(12)}px rgba(0,0,0,0.35),inset ${s(3)}px ${s(3)}px ${s(10)}px rgba(255,255,255,0.07)`,
                            zIndex: 2,
                        }}>
                            <div style={{ position: 'absolute', top: s(6), left: s(9), width: s(20), height: s(13), borderRadius: '50%', background: 'rgba(255,255,255,0.09)', transform: 'rotate(-18deg)' }} />
                            {/* Face visor */}
                            <div style={{
                                position: 'absolute', bottom: s(4), left: '50%', transform: 'translateX(-50%)',
                                width: s(44), height: s(38),
                                borderRadius: '40% 40% 35% 35%',
                                background: 'linear-gradient(160deg,#0a0a0a 0%,#111 50%,#080808 100%)',
                                boxShadow: `inset 0 ${s(2)}px ${s(8)}px rgba(0,0,0,0.8),0 ${s(2)}px ${s(6)}px rgba(0,0,0,0.6)`,
                                zIndex: 4, overflow: 'hidden',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: s(7),
                            }}>
                                {/* Scan line */}
                                <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: 'inherit' }}>
                                    <div style={{ position: 'absolute', left: 0, right: 0, height: s(1.5), background: `linear-gradient(90deg,transparent,${eyeColor}80,transparent)`, animation: 'hb-scan 2.5s ease-in-out infinite', animationDelay: '1s', transition: 'background 0.3s' }} />
                                </div>
                                {/* Eyes */}
                                {[0, 1].map(i => (
                                    <div key={i} style={{
                                        width: eyeBlink ? s(10) : s(11),
                                        height: eyeBlink ? s(1.5) : s(8),
                                        borderRadius: eyeBlink ? '50%' : s(2.5),
                                        background: `linear-gradient(135deg,${eyeColor}99,${eyeColor})`,
                                        boxShadow: eyeGlow,
                                        animation: `hb-eye-glow ${1.5 + i * 0.3}s ease-in-out infinite`,
                                        transition: 'all 0.15s ease, background 0.3s, box-shadow 0.3s',
                                    }} />
                                ))}
                                {/* Added cute smile */}
                                <div style={{ position: 'absolute', bottom: s(6), left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: s(3) }}>
                                    <div style={{ width: s(2.5), height: s(2.5), borderRadius: '50%', background: eyeColor, boxShadow: eyeGlow, opacity: 0.8 }} />
                                    <div style={{ width: s(2.5), height: s(2.5), borderRadius: '50%', background: eyeColor, boxShadow: eyeGlow, opacity: 0.8, marginTop: s(1.5) }} />
                                    <div style={{ width: s(2.5), height: s(2.5), borderRadius: '50%', background: eyeColor, boxShadow: eyeGlow, opacity: 0.8 }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* BODY */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: s(-6), position: 'relative', zIndex: 5 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                            {/* Left arm */}
                            <div style={{ width: s(15), height: s(44), borderRadius: `${s(8)}px ${s(8)}px ${s(10)}px ${s(10)}px`, background: 'linear-gradient(180deg,#666 0%,#555 40%,#444 100%)', boxShadow: `${s(2)}px ${s(2)}px ${s(8)}px rgba(0,0,0,0.5)`, marginTop: s(8), animation: isThinking ? 'hb-think-arm 1.5s ease-in-out infinite' : 'hb-idle-l 3s ease-in-out infinite', transformOrigin: 'top center', position: 'relative' }}>
                                <div style={{ position: 'absolute', bottom: s(-7), left: '50%', transform: 'translateX(-50%)', width: s(14), height: s(11), borderRadius: `${s(4)}px ${s(4)}px ${s(6)}px ${s(6)}px`, background: 'linear-gradient(180deg,#1a1a1a,#0d0d0d)' }} />
                            </div>
                            {/* Torso */}
                            <div style={{ width: s(58), height: s(56), borderRadius: `${s(10)}px ${s(10)}px ${s(13)}px ${s(13)}px`, background: 'linear-gradient(155deg,#777 0%,#666 25%,#555 60%,#444 100%)', boxShadow: `0 ${s(6)}px ${s(20)}px rgba(0,0,0,0.6),inset ${s(-6)}px ${s(-3)}px ${s(16)}px rgba(0,0,0,0.3),inset ${s(3)}px ${s(3)}px ${s(10)}px rgba(255,255,255,0.07)`, position: 'relative' }}>
                                <div style={{ position: 'absolute', bottom: s(10), left: '50%', transform: 'translateX(-50%)', width: s(32), height: s(17), borderRadius: `${s(7)}px ${s(7)}px ${s(11)}px ${s(11)}px`, background: 'linear-gradient(180deg,#4a4a4a 0%,#3a3a3a 100%)', boxShadow: `inset 0 ${s(2)}px ${s(6)}px rgba(0,0,0,0.4)` }} />
                                <div style={{ position: 'absolute', top: s(4), left: '33%', width: s(1.5), height: s(22), background: 'rgba(0,0,0,0.28)', borderRadius: s(2), transform: 'rotate(5deg)' }} />
                                <div style={{ position: 'absolute', top: s(4), right: '33%', width: s(1.5), height: s(22), background: 'rgba(0,0,0,0.28)', borderRadius: s(2), transform: 'rotate(-5deg)' }} />
                                {/* Chest LED - pulses when thinking */}
                                <div style={{ position: 'absolute', top: s(13), left: '50%', transform: 'translateX(-50%)', width: s(6), height: s(6), borderRadius: '50%', background: eyeColor, boxShadow: eyeGlow, transition: 'all 0.3s ease', animation: isThinking ? 'hb-chest-think 0.8s ease-in-out infinite' : undefined }} />
                                <div style={{ position: 'absolute', top: 0, right: 0, width: s(14), height: '100%', borderRadius: `0 ${s(10)}px ${s(13)}px 0`, background: 'linear-gradient(90deg,transparent,rgba(0,0,0,0.22))' }} />
                            </div>
                            {/* Right arm */}
                            <div style={{ width: s(15), height: s(44), borderRadius: `${s(8)}px ${s(8)}px ${s(10)}px ${s(10)}px`, background: 'linear-gradient(180deg,#666 0%,#555 40%,#444 100%)', boxShadow: `${s(-2)}px ${s(2)}px ${s(8)}px rgba(0,0,0,0.5)`, marginTop: s(8), animation: isWaving ? 'hb-wave-arm 1.8s ease-in-out' : isThinking ? 'hb-think-arm-r 1.5s ease-in-out infinite' : 'hb-idle-r 3s ease-in-out infinite', transformOrigin: 'top center', position: 'relative' }}>
                                <div style={{ position: 'absolute', bottom: s(-7), left: '50%', transform: 'translateX(-50%)', width: s(14), height: s(11), borderRadius: `${s(4)}px ${s(4)}px ${s(6)}px ${s(6)}px`, background: 'linear-gradient(180deg,#1a1a1a,#0d0d0d)' }} />
                            </div>
                        </div>
                    </div>

                    {/* LEGS */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: s(5), marginTop: s(3), position: 'relative', zIndex: 4 }}>
                        {[0, 1].map(i => (
                            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'hb-leg 1.5s ease-in-out infinite', animationDelay: `${i * 0.75}s` }}>
                                <div style={{ width: s(20), height: s(28), borderRadius: `${s(5)}px ${s(5)}px ${s(3)}px ${s(3)}px`, background: 'linear-gradient(180deg,#1a1a1a 0%,#111 100%)', boxShadow: `0 ${s(4)}px ${s(10)}px rgba(0,0,0,0.7)` }} />
                                <div style={{ width: s(27), height: s(11), borderRadius: s(4), background: 'linear-gradient(135deg,#f0e8e0 0%,#d8cfc8 50%,#b8b0a8 100%)', boxShadow: `0 ${s(3)}px ${s(10)}px rgba(0,0,0,0.6)`, marginLeft: i === 0 ? s(-3) : s(3), overflow: 'hidden', position: 'relative' }}>
                                    <div style={{ position: 'absolute', bottom: s(2), left: s(3), right: s(3), height: s(2.5), borderRadius: s(2), background: 'rgba(255,100,100,0.5)' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {/* Ground shadow */}
            <div style={{ width: s(56), height: s(10), borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(0,0,0,0.55) 0%,transparent 70%)', animation: 'hb-pulse-shadow 3.2s ease-in-out infinite', marginTop: s(4) }} />
        </div>
    );
};

/* ══════════════════════════════════════════ */
/*               MAIN COMPONENT              */
/* ══════════════════════════════════════════ */
const HoodieBot: React.FC = () => {
    const [isWaving, setIsWaving] = useState(false);
    const [eyeBlink, setEyeBlink] = useState(false);
    const [mood, setMood] = useState<'idle' | 'happy' | 'excited' | 'thinking'>('thinking');
    const [isClicked, setIsClicked] = useState(false);
    const [msgIndex, setMsgIndex] = useState(0);
    const [showMsg, setShowMsg] = useState(false);
    const [isThinking, setIsThinking] = useState(true); // ON by default
    const [thinkPhrase, setThinkPhrase] = useState(0);
    const [soundActive, setSoundActive] = useState(false);
    const [particles, setParticles] = useState<{ id: number; angle: number; color: string; dist: number }[]>([]);
    const [clickCount, setClickCount] = useState(0);
    const [isMobile, setIsMobile]     = useState(false);
    const thinkRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);


    // Eye blink
    useEffect(() => {
        const blink = setInterval(() => {
            setEyeBlink(true);
            setTimeout(() => setEyeBlink(false), 140);
        }, 3000);
        return () => clearInterval(blink);
    }, []);

    // Cycle thinking phrases
    useEffect(() => {
        const t = setInterval(() => {
            setThinkPhrase(p => (p + 1) % THINK_PHRASES.length);
        }, 1800);
        return () => clearInterval(t);
    }, []);


    // Particle burst on click
    const spawnParticles = useCallback(() => {
        const colors = ['#ff4444', '#ff8800', '#ffcc00', '#60a5fa', '#a78bfa', '#34d399', '#f472b6'];
        const newP = Array.from({ length: 12 }, (_, i) => ({
            id: Date.now() + i,
            angle: (360 / 12) * i + Math.random() * 20,
            color: colors[i % colors.length],
            dist: 40 + Math.random() * 40,
        }));
        setParticles(newP);
        setTimeout(() => setParticles([]), 900);
    }, []);

    const handleBotClick = () => {
        const count = clickCount + 1;
        setClickCount(count);

        // Play sound
        playRobotSound('click');
        setSoundActive(true);
        setTimeout(() => setSoundActive(false), 800);

        // Visual effects
        setIsClicked(true);
        setIsWaving(true);
        setMood('excited');
        setIsThinking(false);
        setMsgIndex(prev => (prev + 1) % BOT_MESSAGES.length);
        setShowMsg(true);
        spawnParticles();

        setTimeout(() => setIsClicked(false), 300);
        setTimeout(() => {
            setIsWaving(false);
            setMood('thinking');
            setIsThinking(true);
        }, 2200);
        setTimeout(() => setShowMsg(false), 3800);
    };

    return (
        <div style={{
            width: '100%', height: isMobile ? 'auto' : '100%', minHeight: isMobile ? '520px' : '100%',
            background: 'radial-gradient(ellipse at 18% 55%,#0e1525 0%,#090c18 55%,#050508 100%)',
            position: 'relative', overflowX: 'hidden', overflowY: isMobile ? 'auto' : 'hidden',
            fontFamily: "'Inter','Segoe UI',sans-serif",
            display: 'flex', flexDirection: 'column',
            scrollBehavior: 'smooth'
        }}>

            <div style={{
                position: 'absolute',
                top: isMobile ? 12 : 24,
                right: isMobile ? 12 : 24,
                zIndex: 100
            }}>
                <Logo className="w-6 h-6" showText={true} color="#ff4444" />
            </div>

            {/* ── All keyframe animations ── */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Orbitron:wght@700;900&display=swap');

                @keyframes hb-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
                @keyframes hb-wave-arm { 0%{transform:rotate(0deg)} 20%{transform:rotate(-45deg)} 40%{transform:rotate(-5deg)} 60%{transform:rotate(-45deg)} 80%{transform:rotate(-12deg)} 100%{transform:rotate(0deg)} }
                @keyframes hb-idle-r { 0%,100%{transform:rotate(8deg)} 50%{transform:rotate(14deg)} }
                @keyframes hb-idle-l { 0%,100%{transform:rotate(-8deg)} 50%{transform:rotate(-14deg)} }
                @keyframes hb-think-arm { 0%,100%{transform:rotate(-20deg)} 50%{transform:rotate(-8deg)} }
                @keyframes hb-think-arm-r { 0%,100%{transform:rotate(20deg)} 50%{transform:rotate(8deg)} }
                @keyframes hb-eye-glow { 0%,100%{opacity:1} 50%{opacity:0.7} }
                @keyframes hb-scan { 0%,100%{transform:translateY(-30px);opacity:0} 20%{opacity:0.55} 80%{opacity:0.55} 99%{transform:translateY(30px)} }
                @keyframes hb-pulse-shadow { 0%,100%{transform:scaleX(1);opacity:0.4} 50%{transform:scaleX(0.6);opacity:0.18} }
                @keyframes hb-leg { 0%,100%{transform:translateY(0)} 50%{transform:translateY(2px)} }
                @keyframes hb-body-tilt { 0%,100%{transform:rotate(0deg)} 25%{transform:rotate(1.5deg)} 75%{transform:rotate(-1.5deg)} }
                @keyframes hb-think-tilt { 0%,100%{transform:rotate(-3deg)} 50%{transform:rotate(3deg)} }
                @keyframes hb-chest-think { 0%,100%{opacity:1;transform:translateX(-50%) scale(1)} 50%{opacity:0.3;transform:translateX(-50%) scale(0.6)} }
                @keyframes hb-think-particle { 0%{transform:translate(0,0) scale(0);opacity:0} 20%{opacity:1;transform:translate(0,-8px) scale(1)} 100%{transform:translate(0,-28px) scale(0.4);opacity:0} }
                @keyframes hb-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
                @keyframes hb-dot-jump { 0%,100%{transform:translateY(0);opacity:0.4} 50%{transform:translateY(-4px);opacity:1} }
                @keyframes hb-think-bubble { from{opacity:0;transform:translateY(6px) scale(0.95)} to{opacity:1;transform:translateY(0) scale(1)} }
                @keyframes hb-msg-in { from{opacity:0;transform:translateY(8px) scale(0.9)} to{opacity:1;transform:translateY(0) scale(1)} }
                @keyframes hb-bot-in { from{opacity:0;transform:scale(0.5) translateY(40px)} to{opacity:1;transform:scale(1) translateY(0)} }
                @keyframes hb-particle-burst { 0%{transform:translate(0,0) scale(1.2);opacity:1} 100%{transform:translate(var(--tx),var(--ty)) scale(0);opacity:0} }
                @keyframes hb-ring-out { 0%{transform:scale(1);opacity:0.7} 100%{transform:scale(2.8);opacity:0} }
                @keyframes hb-wave-bar { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(0.35)} }
                @keyframes hb-orb { 0%,100%{transform:translate(0,0) scale(1);opacity:.1} 50%{transform:translate(18px,-12px) scale(1.2);opacity:.18} }
                @keyframes hb-grid-drift { 0%{background-position:0 0} 100%{background-position:44px 44px} }
                @keyframes hb-title-glow { 0%,100%{text-shadow:none} 50%{text-shadow:0 0 30px rgba(255,68,68,0.4)} }
                @keyframes hb-bracket-flash { 0%,100%{opacity:0.3} 50%{opacity:0.8;box-shadow:0 0 8px rgba(255,68,68,0.5)} }
                @keyframes hb-dot-blink { 0%,100%{opacity:1} 50%{opacity:0.25} }
                @keyframes hb-title-in { from{opacity:0;transform:translateY(-18px)} to{opacity:1;transform:translateY(0)} }
                @keyframes hb-card-in { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }

                .hb-feature-card { transition:transform 0.25s ease,border-color 0.25s ease,box-shadow 0.25s ease; }
                .hb-feature-card:hover { transform:translateY(-5px) !important; border-color:rgba(255,255,255,0.12) !important; box-shadow:0 12px 28px rgba(0,0,0,0.4) !important; }
                .hb-cta-btn { transition:transform 0.2s ease,box-shadow 0.2s ease; }
                .hb-cta-btn:hover { transform:translateY(-2px); box-shadow:0 8px 30px rgba(255,68,68,0.45) !important; }
                .hb-bot-wrap { transition:transform 0.2s cubic-bezier(0.34,1.56,0.64,1); }
                .hb-bot-wrap:hover { transform:scale(1.04); }
            `}</style>

            {/* ── Ambient BG ── */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,68,68,0.022) 1px,transparent 1px),linear-gradient(90deg,rgba(255,68,68,0.022) 1px,transparent 1px)', backgroundSize: '44px 44px', animation: 'hb-grid-drift 10s linear infinite' }} />
                <div style={{ position: 'absolute', top: '8%', left: '3%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle,rgba(96,165,250,0.07) 0%,transparent 70%)', animation: 'hb-orb 7s ease-in-out infinite' }} />
                <div style={{ position: 'absolute', bottom: '10%', left: '25%', width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle,rgba(167,139,250,0.07) 0%,transparent 70%)', animation: 'hb-orb 9s ease-in-out infinite reverse' }} />
                <div style={{ position: 'absolute', top: '35%', right: '3%', width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,68,68,0.07) 0%,transparent 70%)', animation: 'hb-orb 6s ease-in-out infinite 2s' }} />
            </div>

            {/* ── Main left content ── */}
            <div style={{
                flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
                padding: isMobile ? '40px 20px' : 'clamp(24px, 4vw, 60px)',
                paddingBottom: isMobile ? 180 : 120,
                position: 'relative', zIndex: 1, maxWidth: 760
            }}>


                {/* Status badge */}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 20, padding: '5px 14px', borderRadius: 999, background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.18)', width: 'fit-content', animation: 'hb-title-in 0.5s ease-out both' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff4444', boxShadow: '0 0 8px #ff4444', animation: 'hb-dot-blink 1.4s ease-in-out infinite' }} />
                    <span style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,120,120,0.8)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>3D CHATBOT — SERIES 01</span>
                </div>

                {/* Title */}
                <h1 style={{ fontSize: 'clamp(26px,3.8vw,52px)', fontWeight: 900, color: '#fff', lineHeight: 1.1, margin: '0 0 14px 0', letterSpacing: '-0.03em', animation: 'hb-title-in 0.5s 0.08s ease-out both' }}>
                    Meet{' '}
                    <span style={{ background: 'linear-gradient(135deg,#ff7b7b 0%,#ff9f45 40%,#ff4444 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'hb-title-glow 3s ease-in-out infinite' }}>HoodieBot</span>
                    <br />
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.54em', fontWeight: 600, letterSpacing: '0' }}>Your 3D AI companion, always thinking</span>
                </h1>

                {/* Description */}
                <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.48)', lineHeight: 1.75, margin: '0 0 36px 0', maxWidth: 460, fontWeight: 400, animation: 'hb-title-in 0.5s 0.16s ease-out both' }}>
                    A premium CSS-animated 3D robot with thinking mode, sound effects, and click reactions. Click the bot in the corner to hear it — it waves, beeps, and reacts to every tap.
                </p>

                {/* Feature cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12, animation: 'hb-card-in 0.5s 0.26s ease-out both' }}>
                    {FEATURES.map((f, i) => (
                        <div key={i} className="hb-feature-card" style={{ padding: '16px 14px', borderRadius: 14, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.065)', cursor: 'default' }}>
                            <div style={{ width: 36, height: 36, borderRadius: 9, background: `${f.color}14`, border: `1px solid ${f.color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, marginBottom: 10 }}>{f.icon}</div>
                            <div style={{ fontSize: 12.5, fontWeight: 700, color: '#fff', marginBottom: 5, letterSpacing: '-0.01em' }}>{f.title}</div>
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', lineHeight: 1.5 }}>{f.desc}</div>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 28, animation: 'hb-card-in 0.5s 0.38s ease-out both' }}>
                    <button className="hb-cta-btn" onClick={handleBotClick} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 26px', borderRadius: 11, background: 'linear-gradient(135deg,#ff4444,#ff7800)', border: 'none', color: '#fff', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 20px rgba(255,68,68,0.28)', letterSpacing: '0.01em' }}>
                        🤖 Chat with HoodieBot
                    </button>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)', letterSpacing: '0.08em' }}>or click the bot →</span>
                </div>
            </div>

            {/* ════════════════════════════════════════ */}
            {/*   BOTTOM-RIGHT FLOATING BOT WIDGET      */}
            {/* ════════════════════════════════════════ */}
            <div style={{
                position: 'absolute',
                bottom: isMobile ? 15 : 20,
                right: isMobile ? '50%' : 24,
                transform: isMobile ? 'translateX(50%)' : 'none',
                zIndex: 50,
                display: 'flex',
                flexDirection: 'column',
                alignItems: isMobile ? 'center' : 'flex-end',
                gap: 8,
                animation: 'hb-bot-in 0.6s 0.6s cubic-bezier(0.34,1.56,0.64,1) both'
            }}>



                {/* Thinking bubble — visible by default */}
                {isThinking && !showMsg && (
                    <ThinkingBubble phrase={THINK_PHRASES[thinkPhrase]} />
                )}

                {/* Chat message on click */}
                {showMsg && (
                    <div style={{ padding: '10px 15px', borderRadius: '13px 13px 4px 13px', background: 'rgba(18,18,32,0.95)', border: '1px solid rgba(255,68,68,0.28)', backdropFilter: 'blur(16px)', color: '#fff', fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap', boxShadow: '0 8px 28px rgba(0,0,0,0.45)', animation: 'hb-msg-in 0.3s ease-out both' }}>
                        {BOT_MESSAGES[msgIndex]}
                    </div>
                )}

                {/* Sound wave bars */}
                {soundActive && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'flex-end' }}>
                        <span style={{ fontSize: 9, color: 'rgba(255,68,68,0.6)', letterSpacing: '0.1em', marginRight: 4 }}>♪</span>
                        <SoundWave active={soundActive} />
                        <span style={{ fontSize: 9, color: 'rgba(255,68,68,0.6)', letterSpacing: '0.1em', marginLeft: 4 }}>♪</span>
                    </div>
                )}

                {/* Click burst rings */}
                {isClicked && [0, 1].map(i => (
                    <div key={i} style={{ position: 'absolute', bottom: 60, right: 44, width: 70, height: 70, borderRadius: '50%', border: '2px solid rgba(255,68,68,0.6)', animation: 'hb-ring-out 0.7s ease-out forwards', animationDelay: `${i * 0.18}s`, pointerEvents: 'none' }} />
                ))}

                {/* Particle burst */}
                <div style={{ position: 'absolute', bottom: 80, right: 50, pointerEvents: 'none', width: 0, height: 0 }}>
                    {particles.map(p => {
                        const rad = (p.angle * Math.PI) / 180;
                        const tx = Math.cos(rad) * p.dist;
                        const ty = -Math.sin(rad) * p.dist;
                        return (
                            <div key={p.id} style={{
                                position: 'absolute',
                                width: 7, height: 7, borderRadius: '50%',
                                background: p.color,
                                boxShadow: `0 0 8px ${p.color}`,
                                '--tx': `${tx}px`,
                                '--ty': `${ty}px`,
                                animation: 'hb-particle-burst 0.75s ease-out forwards',
                            } as React.CSSProperties} />
                        );
                    })}
                </div>

                {/* THE ROBOT */}
                <button className="hb-bot-wrap" onClick={handleBotClick} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, outline: 'none', WebkitTapHighlightColor: 'transparent' }} title="Click HoodieBot!">
                    <RobotFigure isWaving={isWaving} eyeBlink={eyeBlink} mood={mood} isClicked={isClicked} isThinking={isThinking} size={0.82} />
                    {/* HOODIEBOT label */}
                    <div style={{ textAlign: 'center', marginTop: 5, fontFamily: "'Orbitron',sans-serif", fontSize: 9.5, fontWeight: 900, letterSpacing: '0.24em', color: 'rgba(255,255,255,0.88)', textShadow: '0 0 10px rgba(255,68,68,0.65),0 0 22px rgba(255,68,68,0.35)', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,68,68,0.2)', borderRadius: 6, padding: '4px 10px', backdropFilter: 'blur(8px)' }}>
                        HOODIEBOT
                    </div>
                </button>

                {/* Click count badge */}
                {clickCount > 0 && (
                    <div style={{ textAlign: 'center', fontSize: 9, color: 'rgba(255,68,68,0.5)', letterSpacing: '0.1em', fontFamily: 'monospace' }}>
                        × {clickCount} interactions
                    </div>
                )}
            </div>

            {/* Corner decorations */}
            <div style={{ position: 'absolute', top: 18, right: 18, pointerEvents: 'none', zIndex: 2, width: 22, height: 22, borderTop: '2px solid rgba(255,68,68,0.3)', borderRight: '2px solid rgba(255,68,68,0.3)' }} />
            <div style={{ position: 'absolute', bottom: 18, left: 18, pointerEvents: 'none', zIndex: 2, width: 22, height: 22, borderBottom: '2px solid rgba(96,165,250,0.3)', borderLeft: '2px solid rgba(96,165,250,0.3)' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(255,68,68,0.3),transparent)', pointerEvents: 'none', zIndex: 2 }} />
        </div>
    );
};

export default HoodieBot;
