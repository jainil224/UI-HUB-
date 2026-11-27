/**
 * Black Friday — interactive sale landing page.
 *
 * Single-file template: the HoloMosaic WebGL2 holographic tile backdrop, scoped
 * stylesheet, countdown and every section live in this file so the Code tab is exact.
 * The countdown mirrors the real UI HUB offer window (Black Friday 00:00 UTC to
 * the next midnight) and falls back to a 24-hour demo loop outside that window
 * so the template always demonstrates a live timer.
 */
import React, { useEffect, useState } from 'react';
import { ArrowRight, Check, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import HoloMosaic from '../ui/HoloMosaic';

const BF_STYLES = `
#bf-sale {
  --bf-ink: #fff7ec;
  --bf-muted: #f3c9d6;
  --bf-gold: #ffd27a;
  --bf-rose: #ff5d8f;
  font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;
  color: var(--bf-ink);
  background: #12040d;
  overflow: hidden;
}
#bf-sale ::selection { background: rgba(255, 210, 122, 0.35); color: #fff; }
#bf-sale .bf-reveal { animation: bfRise 900ms cubic-bezier(0.16, 1, 0.3, 1) both; }
#bf-sale .bf-delay-1 { animation-delay: 90ms; }
#bf-sale .bf-delay-2 { animation-delay: 180ms; }
#bf-sale .bf-delay-3 { animation-delay: 270ms; }
#bf-sale .bf-pulse-dot { animation: bfPulse 1.7s ease-in-out infinite; }
#bf-sale .bf-sheen {
  background: linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.32) 48%, transparent 62%);
  background-size: 250% 100%;
  animation: bfSheen 4.5s ease-in-out infinite;
}
#bf-sale .bf-card { transition: transform 260ms cubic-bezier(0.16,1,0.3,1), border-color 260ms ease, box-shadow 260ms ease; }
#bf-sale .bf-card:hover { transform: translateY(-6px); border-color: rgba(255,210,122,0.5); box-shadow: 0 22px 60px rgba(255,93,143,0.18); }
#bf-sale .bf-btn { transition: transform 200ms ease, box-shadow 200ms ease, background-color 200ms ease; }
#bf-sale .bf-btn:hover { transform: translateY(-2px); }
@keyframes bfRise { from { opacity: 0; transform: translate3d(0, 22px, 0); } to { opacity: 1; transform: none; } }
@keyframes bfPulse { 0%,100% { opacity: 1; box-shadow: 0 0 0 rgba(255,210,122,0); } 50% { opacity: 0.6; box-shadow: 0 0 12px rgba(255,210,122,0.9); } }
@keyframes bfSheen { 0% { background-position: 160% 0; } 55%,100% { background-position: -60% 0; } }
@media (prefers-reduced-motion: reduce) {
  #bf-sale .bf-reveal, #bf-sale .bf-pulse-dot, #bf-sale .bf-sheen { animation: none !important; }
  #bf-sale .bf-card, #bf-sale .bf-btn { transition: none !important; }
}
`;

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const NOVEMBER = 10;
const THURSDAY = 4;
/** Stable demo deadline so the fallback clock actually counts down. */
const BF_DEMO_END = Date.now() + MS_PER_DAY;

type Remaining = { hours: string; minutes: string; seconds: string };

/** Black Friday 00:00 UTC -> next UTC midnight, mirroring the site's offer gate. */
function bfOfferEndUtc(reference: Date): number {
  const year = reference.getUTCFullYear();
  const firstOfNovember = new Date(Date.UTC(year, NOVEMBER, 1));
  const daysToFirstThursday = (THURSDAY - firstOfNovember.getUTCDay() + 7) % 7;
  const fourthThursdayDay = 1 + daysToFirstThursday + 21;
  return Date.UTC(year, NOVEMBER, fourthThursdayDay + 2);
}

const bfPad = (value: number): string => String(value).padStart(2, '0');

function bfReadRemaining(): Remaining {
  const now = Date.now();
  const realEnd = bfOfferEndUtc(new Date());
  const isLive = realEnd > now;
  const end = isLive ? realEnd : BF_DEMO_END;
  const totalSeconds = Math.max(0, Math.floor((end - now) / 1000));

  return {
    hours: bfPad(Math.floor(totalSeconds / 3600)),
    minutes: bfPad(Math.floor((totalSeconds % 3600) / 60)),
    seconds: bfPad(totalSeconds % 60),
  };
}

const BF_DEALS = [
    {
        name: 'All Access',
        price: '$24',
        was: '$49',
        tag: 'MOST WANTED',
        copy: 'Every animation, background and interaction component. One checkout, the whole library.',
        points: ['178+ production components', 'All 5 AI prompt systems', 'Lifetime updates'],
        featured: true,
    },
    {
        name: 'Component Bundle',
        price: '$14',
        was: '$29',
        tag: 'BUILD FASTER',
        copy: 'Drop-in TSX components with typed props, source code and copy-ready prompts.',
        points: ['Text + scroll animations', 'Interactive backgrounds', 'Responsive by default'],
        featured: false,
    },
    {
        name: 'Template Pack',
        price: '$9',
        was: '$19',
        tag: 'SHIP TODAY',
        copy: 'Complete landing pages you can restyle, preview and export in a single click.',
        points: ['25 full page templates', 'Live preview + code tab', 'Commercial use'],
        featured: false,
    },
] as const;

const BlackFriday: React.FC = () => {
    const [remaining, setRemaining] = useState<Remaining>(bfReadRemaining);

    useEffect(() => {
        const timer = window.setInterval(() => setRemaining(bfReadRemaining()), 1000);
        return () => window.clearInterval(timer);
    }, []);

    return (
        <div id="bf-sale" className="relative w-full bg-[#12040d] text-[#fff7ec]">
            <style>{BF_STYLES}</style>

            {/* HoloMosaic WebGL2 field: crimson base, full-spectrum diffraction, click flips. */}
            <div aria-hidden="true" className="absolute inset-0 z-0 h-full w-full">
                <HoloMosaic
                    color="#09090f"
                    metalColor="#FFC700"
                    spectrum="cool"
                    tileSize={1}
                    gap={0.08}
                    roundness={0.15}
                    bevel={0.35}
                    scatter={0.3}
                    tilt={0.35}
                    swirl={1}
                    ripple={0.6}
                    bands={1.3}
                    softness={0.5}
                    intensity={1.4}
                    saturation={0.55}
                    glitter={0.9}
                    sheen={0.8}
                    grain={0.08}
                    speed={0.5}
                    variation={11}
                    filter="none"
                    filterSize={1}
                    fade={0.25}
                    opacity={1}
                    intro={true}
                    mouseInteraction={true}
                    mouseStrength={1}
                    mouseRadius={0.25}
                    flipOnClick={true}
                    lightMode={false}
                />
            </div>

            {/* Readability vignettes — no full-cover scrim, the holographic tiles stay visible. */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_75%_55%_at_50%_42%,rgba(18,4,13,0.34)_0%,rgba(18,4,13,0)68%,rgba(18,4,13,0.55)_100%)]" />
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-40 bg-gradient-to-b from-[#12040d]/85 to-transparent" />

            <div className="relative z-10">
                {/* Navigation */}
                <header className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-8 py-7">
                    <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 rotate-45 items-center justify-center rounded-[10px] border border-[#ffd27a]/70 bg-[#ffd27a]/10 shadow-[0_0_24px_rgba(255,210,122,0.25)]">
                            <span className="-rotate-45 text-[15px] font-black text-[#ffd27a]">U</span>
                        </span>
                        <span className="text-[15px] font-extrabold tracking-[0.16em]">UI HUB</span>
                        <span className="hidden h-4 w-px bg-white/25 sm:block" />
                        <span className="hidden text-[10px] font-bold uppercase tracking-[0.24em] text-[#ffd27a] sm:block">Black Friday</span>
                    </div>
                    <nav aria-label="Sale navigation" className="hidden items-center gap-8 text-[12px] font-semibold text-white/75 md:flex">
                        <a href="#bf-deals" className="transition-colors hover:text-white">Deals</a>
                        <a href="#bf-perks" className="transition-colors hover:text-white">Perks</a>
                        <a href="#bf-faq" className="transition-colors hover:text-white">FAQ</a>
                    </nav>
                    <a href="#bf-deals" className="bf-btn inline-flex items-center gap-2 rounded-full bg-[#ffd27a] px-4 py-2 text-[11px] font-black uppercase tracking-[0.1em] text-[#2a0713] shadow-[0_8px_24px_rgba(255,158,90,0.35)]">
                        Get access <ArrowRight size={14} aria-hidden="true" />
                    </a>
                </header>

                {/* Hero */}
                <main>
                    <section className="mx-auto flex min-h-[620px] w-full max-w-[1120px] flex-col items-center justify-center px-8 pb-16 pt-10 text-center">
                        <div className="bf-reveal inline-flex items-center gap-2.5 rounded-full border border-[#ffd27a]/30 bg-[#1a0612]/70 px-4 py-2 backdrop-blur-md">
                            <span aria-hidden="true" className="bf-pulse-dot h-1.5 w-1.5 rounded-full bg-[#ffd27a]" />
                            <span className="text-[10px] font-black uppercase tracking-[0.28em] text-[#ffe6b8]">24 hours only · the big drop is live</span>
                        </div>

                        <h1 className="bf-reveal bf-delay-1 mt-7 max-w-[900px] text-[66px] font-black leading-[0.96] tracking-[-0.045em]">
                            Up to <span className="bg-gradient-to-r from-[#fff1d2] via-[#ffd27a] to-[#ff7aa8] bg-clip-text text-transparent">50% off</span>
                            <br />every single drop.
                        </h1>
                        <p className="bf-reveal bf-delay-2 mt-6 max-w-[620px] text-[15px] leading-relaxed text-[#f9dbe4]/90">
                            The whole UI HUB library — animations, backgrounds, templates and every AI prompt —
                            at the lowest price of the year. Build something worth shipping.
                        </p>

                        <div className="bf-reveal bf-delay-3 mt-8 flex flex-wrap items-center justify-center gap-3">
                            <a href="#bf-deals" className="bf-btn relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#fff4dc] to-[#ffc978] px-7 py-3.5 text-[12px] font-black uppercase tracking-[0.12em] text-[#2a0713] shadow-[0_12px_38px_rgba(255,160,90,0.35)]">
                                <span aria-hidden="true" className="bf-sheen pointer-events-none absolute inset-0" />
                                <span className="relative">Claim the deal</span>
                                <ArrowRight size={16} className="relative" aria-hidden="true" />
                            </a>
                            <a href="#bf-perks" className="bf-btn inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/[0.06] px-7 py-3.5 text-[12px] font-black uppercase tracking-[0.12em] text-white backdrop-blur-md hover:bg-white/15">
                                See what&apos;s inside
                            </a>
                        </div>

                        {/* Live offer clock */}
                        <div className="bf-reveal bf-delay-3 mt-10 w-full max-w-[520px] rounded-2xl border border-[#ffd27a]/25 bg-[#140510]/75 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl">
                            <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.26em] text-[#ffd27a]/85">
                                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#ff5d8f] shadow-[0_0_10px_#ff5d8f]" />
                                Offer ends in
                            </div>
                            <div role="timer" aria-label={`Offer ends in ${remaining.hours} hours, ${remaining.minutes} minutes, ${remaining.seconds} seconds`} className="mt-4 grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-3">
                                {[
                                    { label: 'Hours', value: remaining.hours },
                                    { label: 'Minutes', value: remaining.minutes },
                                    { label: 'Seconds', value: remaining.seconds },
                                ].map((unit, index) => (
                                    <React.Fragment key={unit.label}>
                                        {index > 0 && <span aria-hidden="true" className="pb-4 text-2xl font-black text-[#ffd27a]/40">:</span>}
                                        <div className="flex flex-col items-center">
                                            <span key={unit.value} className="bf-reveal w-full rounded-xl border border-[#ffd27a]/25 bg-black/45 py-3 text-center font-mono text-[34px] font-black leading-none tracking-tight text-[#ffe9c4] shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]">
                                                {unit.value}
                                            </span>
                                            <span className="mt-2 text-[9px] font-bold uppercase tracking-[0.22em] text-white/45">{unit.label}</span>
                                        </div>
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Deals */}
                    <section id="bf-deals" className="relative border-t border-white/10 bg-[#0e0309]/92 py-24">
                        <div className="mx-auto w-full max-w-[1120px] px-8">
                            <div className="flex flex-wrap items-end justify-between gap-6">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#ffd27a]">The drop</p>
                                    <h2 className="mt-3 text-[42px] font-black leading-tight tracking-[-0.035em]">Pick your shortcut.</h2>
                                </div>
                                <p className="max-w-[380px] text-[13px] leading-relaxed text-white/55">
                                    No subscriptions to juggle. One payment, immediate access, and the same source code you see in every preview.
                                </p>
                            </div>

                            <div className="mt-12 grid gap-5 md:grid-cols-3">
                                {BF_DEALS.map((deal) => (
                                    <article key={deal.name} className={`bf-card relative flex flex-col rounded-2xl border p-7 ${deal.featured ? 'border-[#ffd27a]/45 bg-gradient-to-b from-[#2a0a18]/95 to-[#14050e]/95 shadow-[0_18px_60px_rgba(255,93,143,0.16)]' : 'border-white/12 bg-white/[0.035]'}`}>
                                        {deal.featured && <span className="absolute -top-3 left-7 rounded-full bg-[#ffd27a] px-3 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-[#2a0713]">{deal.tag}</span>}
                                        {!deal.featured && <span className="text-[9px] font-black uppercase tracking-[0.22em] text-[#ff8fb4]">{deal.tag}</span>}
                                        <h3 className="mt-4 text-[19px] font-extrabold tracking-tight">{deal.name}</h3>
                                        <p className="mt-2 min-h-[58px] text-[12px] leading-relaxed text-white/55">{deal.copy}</p>
                                        <div className="mt-6 flex items-end gap-3">
                                            <span className="text-[38px] font-black leading-none tracking-tight text-[#ffd27a]">{deal.price}</span>
                                            <span className="pb-1 text-[14px] font-semibold text-white/35 line-through">{deal.was}</span>
                                        </div>
                                        <ul className="mt-6 space-y-3 border-t border-white/10 pt-6">
                                            {deal.points.map((point) => (
                                                <li key={point} className="flex items-center gap-2.5 text-[12px] text-white/75">
                                                    <Check size={14} className="shrink-0 text-[#ffd27a]" aria-hidden="true" />
                                                    {point}
                                                </li>
                                            ))}
                                        </ul>
                                        <a href="#bf-faq" className={`bf-btn mt-8 inline-flex items-center justify-center gap-2 rounded-full py-3 text-[11px] font-black uppercase tracking-[0.12em] ${deal.featured ? 'bg-[#ffd27a] text-[#2a0713]' : 'border border-white/20 text-white hover:bg-white/10'}`}>
                                            Get {deal.name.toLowerCase()} <ArrowRight size={14} aria-hidden="true" />
                                        </a>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Perks */}
                    <section id="bf-perks" className="border-t border-white/10 bg-[#12040d] py-20">
                        <div className="mx-auto grid w-full max-w-[1120px] gap-6 px-8 md:grid-cols-3">
                            {[
                                { icon: Zap, title: 'Copy. Paste. Ship.', copy: 'Typed TSX, exact source, zero setup guesswork.' },
                                { icon: Sparkles, title: 'Five AI prompt systems', copy: 'Advance, Antigravity, Claude Code, Cursor and Lovable.' },
                                { icon: ShieldCheck, title: 'Commercial use', copy: 'Every component is cleared for client work.' },
                            ].map((perk) => (
                                <div key={perk.title} className="rounded-2xl border border-white/10 bg-white/[0.035] p-6">
                                    <perk.icon size={20} className="text-[#ffd27a]" aria-hidden="true" />
                                    <h3 className="mt-4 text-[15px] font-extrabold">{perk.title}</h3>
                                    <p className="mt-2 text-[12px] leading-relaxed text-white/55">{perk.copy}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* FAQ + final CTA */}
                    <section id="bf-faq" className="border-t border-white/10 bg-[#0e0309]/92 py-20">
                        <div className="mx-auto flex w-full max-w-[1120px] flex-col items-center gap-10 px-8 text-center">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#ffd27a]">One question</p>
                                <h2 className="mt-3 text-[40px] font-black tracking-[-0.035em]">How long is this live?</h2>
                                <p className="mx-auto mt-4 max-w-[560px] text-[13px] leading-relaxed text-white/60">
                                    Twenty-four hours, from Black Friday midnight UTC to the next midnight. The clock above counts down the exact window — when it hits zero, the deal is gone.
                                </p>
                            </div>
                            <a href="#bf-deals" className="bf-btn inline-flex items-center gap-2 rounded-full bg-[#ffd27a] px-8 py-4 text-[12px] font-black uppercase tracking-[0.12em] text-[#2a0713] shadow-[0_14px_40px_rgba(255,160,90,0.35)]">
                                Take the deal <ArrowRight size={16} aria-hidden="true" />
                            </a>
                        </div>
                    </section>

                    <footer className="border-t border-white/10 bg-[#12040d] px-8 py-8 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-white/35">
                        UI HUB · Black Friday · Built with HoloMosaic
                    </footer>
                </main>
            </div>
        </div>
    );
};

export default BlackFriday;
