import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import Logo from './Logo';
import WaveBackground from './WaveBackground';

interface AuthBrandPanelProps {
    tagline?: string;
    bullets?: string[];
    useWave?: boolean;
}

const DEFAULT_BULLETS = ['60+ Animated Components', 'Drop-in React + Tailwind', '5 AI Vibe Prompts'];

const AuthBrandPanel = ({
    tagline = 'Premium Component Library',
    bullets = DEFAULT_BULLETS,
    useWave = false,
}: AuthBrandPanelProps) => {
    return (
        <div className={`relative w-full md:w-[45%] md:min-h-[580px] min-h-[92px] flex items-center justify-center px-6 py-4 md:p-10 overflow-hidden ${useWave ? 'bg-brand-black/70' : 'bg-gradient-to-br from-[#2540D6] via-[#3D5CFF] to-[#050A14]'}`}>
            {/* Wave Animated Background (left panel of the login card) */}
            {useWave && (
                <>
                    <WaveBackground />
                    <div className="absolute inset-0 z-[1] bg-black/30 backdrop-blur-sm pointer-events-none" />
                </>
            )}

            {/* Decorative Gradient Blobs */}
            {!useWave && (
                <>
                    <div className="absolute -top-16 -right-12 w-64 h-64 rounded-full bg-brand-yellow/25 blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-16 -left-12 w-72 h-72 rounded-full bg-[#3D5CFF]/50 blur-3xl pointer-events-none" />
                    <div className="absolute top-1/3 -left-16 w-40 h-40 rounded-full bg-brand-red/20 blur-3xl pointer-events-none" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.14),transparent_55%)] pointer-events-none" />
                </>
            )}

            {/* Curved Divider Into Form Panel */}
            <svg viewBox="0 0 60 600" preserveAspectRatio="none" className="absolute top-0 right-0 hidden md:block h-full w-14 text-brand-surface pointer-events-none">
                <path d="M60 0 C18 90 18 510 60 600 Z" fill="currentColor" />
            </svg>

            <div className="relative z-10 flex flex-row items-center justify-center gap-3 md:flex-col md:gap-5">
                <Link to="/" className="hover:opacity-90 transition-opacity shrink-0">
                    <Logo className="w-9 h-9 md:w-14 md:h-14" showText={false} color="#FFFFFF" />
                </Link>
                <div className="space-y-2">
                    <h2 className="text-xl md:text-3xl font-heading font-black text-white uppercase tracking-tight">UI HUB</h2>
                    <p className="hidden md:block text-[10px] font-bold text-white/80 uppercase tracking-[0.25em]">{tagline}</p>
                </div>
                <div className="hidden md:flex h-px w-16 bg-white/25" />
                <ul className="hidden md:flex flex-col items-start space-y-2.5">
                    {bullets.map(feat => (
                        <li key={feat} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/90">
                            <span className="w-5 h-5 rounded bg-white/15 border border-white/30 flex items-center justify-center shrink-0">
                                <Check size={11} strokeWidth={3} />
                            </span>
                            {feat}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default AuthBrandPanel;