/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * MagUSD - Beyond Stablecoin
 * Exact recreation of the supplied AI Studio project. All original component
 * source, Tailwind class strings, colours, timings and interaction logic are
 * preserved verbatim, consolidated into one default-exported component for
 * UI HUB single-file preview + Code tab fidelity.
 */
import React, { useEffect, useState } from 'react';
import { Menu, X, RotateCcw, Check, Copy, CheckCircle2, ArrowRight } from 'lucide-react';

const MAGUSD_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300..700;1,9..40,300..700&family=JetBrains+Mono:wght@400;500&display=swap');

#top {
  --font-sans: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}
#top ::selection { background: rgba(22, 123, 255, 0.30); color: #ffffff; }

@keyframes magusd-pulse-center {
  0%, 100% { transform: translate3d(-50%, 0, 0) scale(1); opacity: 0.92; }
  50% { transform: translate3d(-50%, -8px, 0) scale(1.06); opacity: 1; }
}
@keyframes magusd-drift-left {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.78; }
  50% { transform: translate3d(26px, -10px, 0) scale(1.05); opacity: 0.95; }
}
@keyframes magusd-drift-right {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.76; }
  50% { transform: translate3d(-26px, -12px, 0) scale(1.06); opacity: 0.94; }
}
@keyframes magusd-pulse-halo {
  0%, 100% { transform: translate3d(-50%, 0, 0) scale(0.985); opacity: 0.78; }
  50% { transform: translate3d(-50%, -4px, 0) scale(1.03); opacity: 0.96; }
}
@keyframes magusd-cursor-blink {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
}
@keyframes magusd-terminal-enter {
  0% { opacity: 0; transform: translate3d(0, 18px, 0); }
  100% { opacity: 1; transform: translate3d(0, 0, 0); }
}
.animate-magusd-center { animation: magusd-pulse-center 15s ease-in-out infinite; will-change: transform, opacity; }
.animate-magusd-left { animation: magusd-drift-left 18s ease-in-out infinite; will-change: transform, opacity; }
.animate-magusd-right { animation: magusd-drift-right 21s ease-in-out infinite; will-change: transform, opacity; }
.animate-magusd-halo { animation: magusd-pulse-halo 12s ease-in-out infinite; will-change: transform, opacity; }
.animate-magusd-cursor { animation: magusd-cursor-blink 1s steps(2, start) infinite; }
.animate-magusd-terminal { animation: magusd-terminal-enter 800ms cubic-bezier(0.16, 1, 0.3, 1) forwards; }
.terminal-mask-fade {
  -webkit-mask-image: linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 52%, rgba(0,0,0,0.55) 74%, rgba(0,0,0,0.14) 90%, rgba(0,0,0,0) 100%);
  mask-image: linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 52%, rgba(0,0,0,0.55) 74%, rgba(0,0,0,0.14) 90%, rgba(0,0,0,0) 100%);
}
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
@media (prefers-reduced-motion: reduce) {
  .animate-magusd-center, .animate-magusd-left, .animate-magusd-right,
  .animate-magusd-halo, .animate-magusd-cursor, .animate-magusd-terminal {
    animation: none !important; transform: none !important; opacity: 1 !important;
  }
}
`;

/* /src/components/AnimatedBackground.tsx */
interface AnimatedBackgroundProps { parallax: { x: number; y: number }; reducedMotion: boolean; }

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ parallax, reducedMotion }) => {
  const bgTransform = reducedMotion ? 'translate3d(0, 0, 0)' : `translate3d(${parallax.x}px, ${parallax.y}px, 0)`;
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden bg-[#020711]">
      <div className="absolute inset-[-24px] transition-transform duration-300 ease-out will-change-transform" style={{ transform: bgTransform }}>
        <div className="absolute inset-x-0 top-0 h-[260px]" style={{ background: 'linear-gradient(180deg, #01040B 0%, #020814 48%, rgba(2, 10, 26, 0) 100%)' }} />
        <div className={`absolute left-1/2 top-[13%] h-[560px] w-[1120px] ${reducedMotion ? '-translate-x-1/2' : 'animate-magusd-center'}`} style={{ background: 'radial-gradient(ellipse 56% 52% at 50% 44%, rgba(16, 106, 240, 0.44) 0%, rgba(8, 72, 185, 0.34) 38%, rgba(5, 45, 113, 0.18) 66%, rgba(2, 7, 17, 0) 100%)', filter: 'blur(36px)' }} />
        <div className={`absolute left-1/2 top-[18%] h-[360px] w-[760px] ${reducedMotion ? '-translate-x-1/2' : 'animate-magusd-halo'}`} style={{ background: 'radial-gradient(ellipse 58% 55% at 50% 45%, rgba(22, 123, 255, 0.32) 0%, rgba(8, 100, 232, 0.16) 52%, rgba(2, 7, 17, 0) 100%)', filter: 'blur(42px)' }} />
        <div className={`absolute -left-[6%] bottom-[-6%] h-[520px] w-[680px] ${reducedMotion ? '' : 'animate-magusd-left'}`} style={{ background: 'radial-gradient(ellipse 58% 54% at 44% 58%, rgba(122, 182, 255, 0.42) 0%, rgba(30, 124, 255, 0.36) 36%, rgba(7, 56, 145, 0.22) 66%, rgba(2, 7, 17, 0) 100%)', filter: 'blur(54px)' }} />
        <div className={`absolute -right-[6%] bottom-[-6%] h-[520px] w-[680px] ${reducedMotion ? '' : 'animate-magusd-right'}`} style={{ background: 'radial-gradient(ellipse 58% 54% at 56% 58%, rgba(126, 186, 255, 0.4) 0%, rgba(30, 124, 255, 0.35) 36%, rgba(7, 56, 145, 0.22) 66%, rgba(2, 7, 17, 0) 100%)', filter: 'blur(54px)' }} />
        <div className="absolute bottom-[-8%] left-1/2 h-[440px] w-[960px] -translate-x-1/2" style={{ background: 'radial-gradient(ellipse 62% 58% at 50% 60%, rgba(14, 108, 246, 0.56) 0%, rgba(8, 72, 185, 0.34) 48%, rgba(2, 7, 17, 0) 100%)', filter: 'blur(46px)' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 92% 85% at 50% 56%, rgba(2, 7, 17, 0) 46%, rgba(2, 6, 16, 0.55) 82%, rgba(1, 4, 10, 0.88) 100%)' }} />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-[150px]" style={{ background: 'linear-gradient(180deg, rgba(2, 10, 26, 0) 0%, rgba(5, 19, 46, 0.48) 58%, rgba(4, 15, 38, 0.78) 100%)' }} />
    </div>
  );
};

/* /src/components/Navigation.tsx */
export type ModalTopic = 'Product' | 'Docs' | 'Customers' | 'Resources' | 'Partners' | 'Pricing' | 'Sign in' | 'Request Demo' | 'Try for Free' | 'MagUSD Portal' | 'Try MagUSD' | 'How it works';
interface NavigationProps { onSelectAction: (topic: ModalTopic) => void; }
const NAV_LINKS: Array<Extract<ModalTopic, 'Product' | 'Docs' | 'Customers' | 'Resources' | 'Partners' | 'Pricing'>> = ['Product', 'Docs', 'Customers', 'Resources', 'Partners', 'Pricing'];

export const Navigation: React.FC<NavigationProps> = ({ onSelectAction }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>, topic: ModalTopic) => {
    e.preventDefault(); setMobileOpen(false); onSelectAction(topic);
  };
  return (
    <header className="relative z-30 w-full px-4 pt-[12px]">
      <div className="mx-auto flex h-[42px] w-full max-w-[840px] items-center justify-between gap-4">
        <a href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="flex shrink-0 items-center gap-[7px] whitespace-nowrap rounded-md py-1 text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#75AEFF]" aria-label="MagUSD Home">
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="shrink-0">
            <path d="M2.2 2.4L6.4 1.2L6.4 11.4L2.2 12.6V2.4Z" fill="#E8F54A" />
            <path d="M7.6 4.6L11.8 3.4L11.8 13.6L7.6 14.8V4.6Z" fill="#E8F54A" />
          </svg>
          <span className="text-[12.5px] font-semibold tracking-[-0.01em] text-white">MagUSD</span>
        </a>
        <nav aria-label="Primary" className="hidden items-center gap-[26px] lg:gap-[28px] md:flex">
          {NAV_LINKS.map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} onClick={(e) => handleLinkClick(e, item)} className="whitespace-nowrap shrink-0 text-[11px] font-normal tracking-[0.005em] text-[#E6ECF6]/90 transition-colors duration-200 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#75AEFF]">{item}</a>
          ))}
        </nav>
        <div className="hidden shrink-0 items-center gap-[14px] md:flex">
          <a href="#signin" onClick={(e) => handleLinkClick(e, 'Sign in')} className="whitespace-nowrap shrink-0 text-[11px] font-normal text-[#E6ECF6]/90 transition-colors duration-200 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#75AEFF]">Sign in</a>
          <button type="button" onClick={(e) => handleLinkClick(e, 'Request Demo')} className="inline-flex h-[31px] w-[95px] shrink-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-full bg-white text-[11px] font-medium text-[#070B14] transition-all duration-200 hover:scale-[1.02] hover:bg-[#F0F4FC] active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#75AEFF]">Request Demo</button>
          <button type="button" onClick={(e) => handleLinkClick(e, 'Try for Free')} className="inline-flex h-[31px] w-[86px] shrink-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-full border border-white/[0.16] bg-[#0B101D]/75 text-[11px] font-medium text-white transition-all duration-200 hover:scale-[1.02] hover:border-white/[0.28] hover:bg-[#131C30]/85 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#75AEFF]">Try for Free</button>
        </div>
        <div className="flex items-center gap-2 md:hidden">
          <button type="button" onClick={(e) => handleLinkClick(e, 'Try for Free')} className="inline-flex h-[30px] shrink-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-full bg-white px-3 text-[11px] font-medium text-[#070B14]">Try for Free</button>
          <button type="button" onClick={() => setMobileOpen((prev) => !prev)} aria-expanded={mobileOpen} aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'} className="inline-flex h-[32px] w-[32px] cursor-pointer items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-white">{mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}</button>
        </div>
      </div>
      {mobileOpen && (
        <div className="mx-auto mt-2 w-full max-w-[840px] rounded-2xl border border-white/15 bg-[#060E20]/95 p-4 backdrop-blur-xl md:hidden">
          <nav aria-label="Mobile" className="grid grid-cols-2 gap-2">
            {NAV_LINKS.map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} onClick={(e) => handleLinkClick(e, item)} className="rounded-lg px-3 py-2 text-[13px] text-[#E6ECF6] transition-colors hover:bg-white/10 hover:text-white">{item}</a>
            ))}
          </nav>
          <div className="mt-3 flex items-center gap-2 border-t border-white/10 pt-3">
            <button type="button" onClick={(e) => handleLinkClick(e, 'Sign in')} className="flex-1 cursor-pointer rounded-full border border-white/15 py-2 text-[12px] text-white">Sign in</button>
            <button type="button" onClick={(e) => handleLinkClick(e, 'Request Demo')} className="flex-1 cursor-pointer rounded-full bg-white py-2 text-[12px] font-medium text-[#070B14]">Request Demo</button>
          </div>
        </div>
      )}
    </header>
  );
};

/* /src/components/AnnouncementBadge.tsx */
interface AnnouncementBadgeProps { onSelectAction: (topic: ModalTopic) => void; }
export const AnnouncementBadge: React.FC<AnnouncementBadgeProps> = ({ onSelectAction }) => {
  return (
    <div className="flex justify-center">
      <button type="button" onClick={() => onSelectAction('MagUSD Portal')} className="group inline-flex h-[23px] min-w-[160px] cursor-pointer items-center gap-[7px] rounded-full border border-[#75AEFF]/[0.22] bg-[#10295A]/55 pl-[3px] pr-[10px] backdrop-blur-md transition-all duration-200 hover:border-[#75AEFF]/40 hover:bg-[#14336E]/70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#75AEFF]" style={{ boxShadow: '0 0 22px rgba(22, 123, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.08)' }}>
        <span className="inline-flex h-[17px] items-center justify-center rounded-full bg-[#3A68B8]/75 px-[7px] text-[9.5px] font-medium leading-none tracking-[0.01em] text-[#EDF3FF] transition-colors group-hover:bg-[#4679D1]">New</span>
        <span className="whitespace-nowrap text-[10px] font-normal leading-none tracking-[0.005em] text-[#DCE6F7]">Earn with MagUSD Portal!</span>
      </button>
    </div>
  );
};

/* /src/components/HeroContent.tsx */
interface HeroContentProps { parallax: { x: number; y: number }; reducedMotion: boolean; }
export const HeroContent: React.FC<HeroContentProps> = ({ parallax, reducedMotion }) => {
  const textTransform = reducedMotion ? 'translate3d(0, 0, 0)' : `translate3d(${parallax.x}px, ${parallax.y}px, 0)`;
  return (
    <div className="mx-auto flex flex-col items-center px-4 text-center transition-transform duration-300 ease-out will-change-transform" style={{ transform: textTransform }}>
      <h1 className="mt-[13px] text-[38px] font-light leading-[1.0] tracking-[-0.028em] text-white sm:text-[52px] md:whitespace-nowrap md:text-[66px]">Beyond Stablecoin</h1>
      <p className="mt-[22px] max-w-[590px] text-[12.5px] font-normal leading-[19px] tracking-[0.004em] text-[#B1B8C6] sm:text-[13px]">Integrate MagUSD effortlessly with our developer-friendly SDK. Perfect for treasury management, sweep accounts, or customer yield&#8212;get started quickly and easily.</p>
    </div>
  );
};

/* /src/components/CTAButtons.tsx */
interface CTAButtonsProps { onSelectAction: (topic: ModalTopic) => void; }
export const CTAButtons: React.FC<CTAButtonsProps> = ({ onSelectAction }) => {
  return (
    <div className="mt-[27px] flex items-center justify-center gap-[10px]">
      <button type="button" onClick={() => onSelectAction('Try MagUSD')} className="inline-flex h-[31px] w-[98px] shrink-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-full bg-white text-[11px] font-medium text-[#070B14] transition-all duration-200 hover:scale-[1.025] hover:bg-[#F2F6FF] active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#75AEFF]">Try MagUSD</button>
      <button type="button" onClick={() => onSelectAction('How it works')} className="inline-flex h-[31px] w-[92px] shrink-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-full border border-[#75AEFF]/30 bg-[#1B55B5]/40 text-[11px] font-medium text-[#F4F8FF] backdrop-blur-sm transition-all duration-200 hover:scale-[1.025] hover:border-[#75AEFF]/50 hover:bg-[#2365CE]/55 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#75AEFF]">How it works</button>
    </div>
  );
};

/* /src/components/TerminalLineNumbers.tsx */
export interface TerminalRowSpec { id: string; lineNumber: number | null; revealAtStep: number; }
export const TERMINAL_ROWS: TerminalRowSpec[] = [
  { id: 'login', lineNumber: 1, revealAtStep: 1 },
  { id: 'gap-1', lineNumber: null, revealAtStep: 1 },
  { id: 'npm-cmd', lineNumber: 2, revealAtStep: 2 },
  { id: 'npm-pkg', lineNumber: 3, revealAtStep: 3 },
  { id: 'npm-audit', lineNumber: 4, revealAtStep: 4 },
  { id: 'gap-2', lineNumber: null, revealAtStep: 4 },
  { id: 'account-init', lineNumber: 5, revealAtStep: 5 },
  { id: 'priv-key', lineNumber: 6, revealAtStep: 6 },
  { id: 'chain-id', lineNumber: 7, revealAtStep: 7 },
  { id: 'config', lineNumber: 8, revealAtStep: 8 },
  { id: 'account-end', lineNumber: 9, revealAtStep: 9 },
  { id: 'blank-10', lineNumber: 10, revealAtStep: 10 },
  { id: 'principal-decl', lineNumber: 11, revealAtStep: 11 },
  { id: 'lend-call', lineNumber: 12, revealAtStep: 12 },
  { id: 'lend-arg', lineNumber: 13, revealAtStep: 13 },
  { id: 'lend-rest', lineNumber: 14, revealAtStep: 14 },
];
interface TerminalLineNumbersProps { visibleStep: number; }
export const TerminalLineNumbers: React.FC<TerminalLineNumbersProps> = ({ visibleStep }) => {
  return (
    <div aria-hidden="true" className="select-none pr-[18px] text-right font-mono text-[10.5px] leading-[22px] text-[#5B616E] tabular-nums" style={{ fontFamily: 'var(--font-mono)' }}>
      {TERMINAL_ROWS.map((row) => {
        const isVisible = visibleStep >= row.revealAtStep;
        return (
          <div key={row.id} className={`h-[22px] transition-opacity duration-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            {row.lineNumber !== null ? row.lineNumber : ''}
          </div>
        );
      })}
    </div>
  );
};

/* /src/components/TerminalCursor.tsx */
interface TerminalCursorProps { reducedMotion: boolean; }
export const TerminalCursor: React.FC<TerminalCursorProps> = ({ reducedMotion }) => {
  return (
    <span aria-hidden="true" className={`ml-[1px] inline-block h-[13px] w-[6.5px] translate-y-[2px] rounded-[1px] bg-[#75AEFF]/90 ${reducedMotion ? '' : 'animate-magusd-cursor'}`} />
  );
};

/* /src/components/SyntaxHighlightedCode.tsx */
export const NPM_COMMAND_TEXT = '* npm install @magsadfi/core';
interface SyntaxHighlightedCodeProps { visibleStep: number; typedChars: number; isDone: boolean; reducedMotion: boolean; }
export const SyntaxHighlightedCode: React.FC<SyntaxHighlightedCodeProps> = ({ visibleStep, typedChars, isDone, reducedMotion }) => {
  const renderNpmCommand = (chars: number) => {
    const slice = NPM_COMMAND_TEXT.slice(0, chars);
    const prefixEnd = Math.min(slice.length, 14);
    const prefix = slice.slice(0, prefixEnd);
    const pkg = slice.slice(prefixEnd);
    return (
      <>
        {prefix && <span className="text-[#D3A7E9]">{prefix}</span>}
        {pkg && <span className="text-[#D8A8EF]">{pkg}</span>}
        {visibleStep === 2 && !isDone && (<TerminalCursor reducedMotion={reducedMotion} />)}
      </>
    );
  };
  const renderRowContent = (id: string) => {
    switch (id) {
      case 'login': return (<span className="text-[#D6D8DE]">Last login: Fri May 23, 2025 22:15:47 on console</span>);
      case 'gap-1':
      case 'gap-2':
      case 'blank-10': return null;
      case 'npm-cmd': return renderNpmCommand(typedChars);
      case 'npm-pkg': return (<span className="text-[#8BE6C1]">+ @magsadfi/core@1.1.15.5</span>);
      case 'npm-audit': return (<span className="text-[#D9C58D]">added 23 packages, and audited 25 packages</span>);
      case 'account-init': return (
        <>
          <span className="text-[#D3A7E9]">const </span>
          <span className="text-[#D7E2E8]">magsdfAccount</span>
          <span className="text-[#D6D8DE]"> = </span>
          <span className="text-[#D3A7E9]">await </span>
          <span className="text-[#D7E2E8]">magsdfAccount.fromPrivateKey(&#123;</span>
        </>
      );
      case 'priv-key': return (<span className="text-[#D7E2E8]">    privateKey,</span>);
      case 'chain-id': return (<span className="text-[#D7E2E8]">    chainId,</span>);
      case 'config': return (<span className="text-[#D7E2E8]">    config</span>);
      case 'account-end': return (<span className="text-[#D6D8DE]">&#125;);</span>);
      case 'principal-decl': return (
        <>
          <span className="text-[#D3A7E9]">const </span>
          <span className="text-[#D7E2E8]">principal</span>
          <span className="text-[#D6D8DE]"> = </span>
          <span className="text-[#B9D89D]">&quot;500&quot;</span>
          <span className="text-[#D6D8DE]">; </span>
          <span className="text-[#747983]">// 500 magUSD</span>
        </>
      );
      case 'lend-call': return (
        <>
          <span className="text-[#D3A7E9]">const </span>
          <span className="text-[#D7E2E8]">txHash</span>
          <span className="text-[#D6D8DE]"> = </span>
          <span className="text-[#D3A7E9]">await </span>
          <span className="text-[#D7E2E8]">magsdfAccount.lend(&#123;</span>
        </>
      );
      case 'lend-arg': return (
        <>
          <span className="text-[#D7E2E8]">    principal</span>
          {isDone && <TerminalCursor reducedMotion={reducedMotion} />}
        </>
      );
      case 'lend-rest': return (<span className="text-[#747983]">    // recipient,</span>);
      default: return null;
    }
  };
  return (
    <pre className="no-scrollbar m-0 min-w-0 flex-1 overflow-x-auto font-mono text-[11.5px] leading-[22px] tracking-[0.005em] text-[#D6D8DE] select-text sm:text-[12px]" style={{ fontFamily: 'var(--font-mono)' }}>
      <code>
        {TERMINAL_ROWS.map((row) => {
          const isVisible = visibleStep >= row.revealAtStep;
          return (
            <div key={row.id} className={`h-[22px] whitespace-pre transition-opacity duration-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
              {isVisible ? renderRowContent(row.id) : ''}
            </div>
          );
        })}
      </code>
    </pre>
  );
};

/* /src/components/TerminalWindow.tsx */
interface TerminalWindowProps { parallax: { x: number; y: number }; reducedMotion: boolean; }
const SNIPPET_TO_COPY = `npm install @magsadfi/core

const magsdfAccount = await magsdfAccount.fromPrivateKey({
  privateKey,
  chainId,
  config
});

const principal = "500"; // 500 magUSD
const txHash = await magsdfAccount.lend({
  principal
});`;

export const TerminalWindow: React.FC<TerminalWindowProps> = ({ parallax, reducedMotion }) => {
  const [runId, setRunId] = useState(0);
  const [visibleStep, setVisibleStep] = useState(reducedMotion ? 14 : 0);
  const [typedChars, setTypedChars] = useState(reducedMotion ? NPM_COMMAND_TEXT.length : 0);
  const [isDone, setIsDone] = useState(reducedMotion);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (reducedMotion) {
      setVisibleStep(14); setTypedChars(NPM_COMMAND_TEXT.length); setIsDone(true); return;
    }
    setVisibleStep(0); setTypedChars(0); setIsDone(false);
    const timers: number[] = [];
    timers.push(window.setTimeout(() => setVisibleStep(1), 450));
    timers.push(window.setTimeout(() => {
      setVisibleStep(2);
      const total = NPM_COMMAND_TEXT.length;
      for (let i = 1; i <= total; i++) {
        timers.push(window.setTimeout(() => { setTypedChars(i); }, i * 38));
      }
    }, 950));
    timers.push(window.setTimeout(() => setVisibleStep(3), 2250));
    timers.push(window.setTimeout(() => setVisibleStep(4), 2600));
    const codeStart = 3000;
    for (let step = 5; step <= 14; step++) {
      timers.push(window.setTimeout(() => {
        setVisibleStep(step);
        if (step === 13) { setIsDone(true); }
      }, codeStart + (step - 5) * 145));
    }
    return () => { timers.forEach((t) => window.clearTimeout(t)); };
  }, [runId, reducedMotion]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(SNIPPET_TO_COPY);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard might be blocked in non-secure contexts
    }
  };
  const terminalTransform = reducedMotion ? 'translate3d(0, 0, 0)' : `translate3d(${parallax.x}px, ${parallax.y}px, 0)`;
  return (
    <section aria-label="MagUSD SDK terminal example" className="relative z-20 mx-auto mt-[30px] w-full max-w-[552px] px-4 sm:px-0">
      <div aria-hidden="true" className="pointer-events-none absolute -inset-x-16 -top-12 bottom-[-40px] -z-10">
        <div className="absolute left-[4%] top-[2%] h-[220px] w-[260px]" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(28, 128, 255, 0.48) 0%, rgba(8, 100, 232, 0.18) 52%, rgba(2, 7, 17, 0) 100%)', filter: 'blur(36px)' }} />
        <div className="absolute right-[4%] top-[2%] h-[220px] w-[260px]" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(28, 128, 255, 0.48) 0%, rgba(8, 100, 232, 0.18) 52%, rgba(2, 7, 17, 0) 100%)', filter: 'blur(36px)' }} />
        <div className="absolute inset-x-[6%] top-[6%] bottom-0" style={{ background: 'radial-gradient(ellipse 68% 64% at 50% 42%, rgba(20, 110, 255, 0.42) 0%, rgba(10, 82, 206, 0.24) 55%, rgba(2, 7, 17, 0) 100%)', filter: 'blur(42px)' }} />
      </div>
      <div className="group relative">
        <div className="pointer-events-none absolute right-5 top-4 z-30 flex items-center gap-1.5 opacity-0 transition-opacity duration-200 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
          {!reducedMotion && (
            <button type="button" onClick={() => setRunId((n) => n + 1)} aria-label="Replay terminal animation" title="Replay animation" className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border border-white/10 bg-[#141720]/90 text-[#AAB5C8] transition-colors hover:border-[#75AEFF]/40 hover:text-white focus-visible:outline-2 focus-visible:outline-[#75AEFF]">
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}
          <button type="button" onClick={handleCopy} aria-label="Copy SDK code snippet" title="Copy snippet" className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border border-white/10 bg-[#141720]/90 text-[#AAB5C8] transition-colors hover:border-[#75AEFF]/40 hover:text-white focus-visible:outline-2 focus-visible:outline-[#75AEFF]">
            {copied ? (<Check className="h-3.5 w-3.5 text-[#8BE6C1]" />) : (<Copy className="h-3.5 w-3.5" />)}
          </button>
        </div>
        <div className={`transition-transform duration-300 ease-out will-change-transform ${reducedMotion ? '' : 'animate-magusd-terminal'}`} style={{ transform: terminalTransform }}>
          <div className="terminal-mask-fade relative h-[410px] overflow-hidden rounded-[23px] p-[6px] sm:h-[435px] md:h-[max(435px,calc(100vh-360px))]" style={{ background: 'linear-gradient(180deg, rgba(42, 130, 255, 0.56) 0%, rgba(20, 110, 255, 0.36) 38%, rgba(16, 86, 210, 0.16) 72%, rgba(12, 60, 150, 0.02) 100%)', boxShadow: '0 0 42px rgba(20, 110, 255, 0.3), 0 0 85px rgba(8, 100, 232, 0.22)' }}>
            <div className="relative h-full w-full overflow-hidden rounded-[18px] bg-[#0B0C0F] px-[22px] pt-[30px] pb-[24px] sm:px-[30px] sm:pt-[34px]" style={{ boxShadow: 'inset 0 1px 0 rgba(125, 185, 255, 0.26), inset 0 24px 48px rgba(20, 48, 105, 0.08)' }}>
              <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[1px]" style={{ background: 'linear-gradient(90deg, rgba(117,174,255,0) 0%, rgba(117,174,255,0.45) 50%, rgba(117,174,255,0) 100%)' }} />
              <div className="flex items-start">
                <TerminalLineNumbers visibleStep={visibleStep} />
                <SyntaxHighlightedCode visibleStep={visibleStep} typedChars={typedChars} isDone={isDone} reducedMotion={reducedMotion} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* /src/components/PartnerLogoStrip.tsx */
export const PartnerLogoStrip: React.FC = () => {
  return (
    <footer aria-label="Trusted by engineering teams" className="pointer-events-auto relative z-30 w-full px-5 pb-[16px] pt-4 md:absolute md:inset-x-0 md:bottom-[14px] md:px-[36px] md:py-0">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 -bottom-[14px] -top-12 -z-10" style={{ background: 'linear-gradient(180deg, rgba(2, 10, 26, 0) 0%, rgba(4, 15, 38, 0.58) 56%, rgba(3, 12, 32, 0.84) 100%)' }} />
      <div className="no-scrollbar mx-auto flex w-full max-w-[1128px] items-center justify-start gap-8 overflow-x-auto text-white/90 sm:justify-between sm:gap-4 md:px-[42px]">
        <div className="flex shrink-0 items-center gap-[5px] opacity-90 transition-opacity duration-200 hover:opacity-100" aria-label="Git">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M21.62 11.108l-8.731-8.729a1.292 1.292 0 0 0-1.823 0L9.257 4.19l2.299 2.3a1.532 1.532 0 0 1 1.939 1.95l2.214 2.217a1.53 1.53 0 0 1 1.583 2.531 1.534 1.534 0 0 1-2.12 0 1.53 1.53 0 0 1-.333-1.662l-2.069-2.067v5.442a1.533 1.533 0 1 1-1.26-.044V9.36a1.533 1.533 0 0 1-.833-2.011L8.404 5.075l-6.025 6.026a1.292 1.292 0 0 0 0 1.823l8.73 8.729a1.29 1.29 0 0 0 1.822 0l8.689-8.69a1.292 1.292 0 0 0 0-1.855z" fill="currentColor" /></svg>
          <span className="text-[14px] font-bold tracking-[-0.03em]">git</span>
        </div>
        <div className="flex shrink-0 items-center opacity-90 transition-opacity duration-200 hover:opacity-100" aria-label="npm">
          <svg width="38" height="15" viewBox="0 0 540 210" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M0 0h540v180H270v30H150v-30H0V0zm30 150h60V60h30v90h30V30H30v120zm150-120v150h60v-30h60V30H180zm60 30h30v60h-30V60zm90-30v120h60V60h30v90h30V60h30v90h30V30H330z" fill="currentColor" /></svg>
        </div>
        <div className="flex shrink-0 items-center gap-[5px] opacity-90 transition-opacity duration-200 hover:opacity-100" aria-label="Lucidchart">
          <svg width="11" height="14" viewBox="0 0 14 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M1 1.5L5.5 4.2V13.8L1 11.2V1.5Z" fill="currentColor" /><path d="M1 11.2L5.5 13.8H13L8.8 16.5H1V11.2Z" fill="currentColor" fillOpacity="0.82" /></svg>
          <span className="text-[12.5px] font-semibold tracking-[-0.02em]">Lucidchart</span>
        </div>
        <div className="flex shrink-0 items-center gap-[5px] opacity-90 transition-opacity duration-200 hover:opacity-100" aria-label="Wrike">
          <svg width="18" height="14" viewBox="0 0 24 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M1.5 6.8L6.2 14.5L9.4 10.2L5.5 4.5L1.5 6.8Z" fill="currentColor" /><path d="M10.2 14.5L14.5 14.5L22.5 3.5L17.6 3.5L10.2 14.5Z" fill="currentColor" /></svg>
          <span className="text-[14px] font-bold tracking-[-0.025em]">wrike</span>
        </div>
        <div className="flex shrink-0 items-center gap-[4px] opacity-90 transition-opacity duration-200 hover:opacity-100" aria-label="jQuery">
          <svg width="16" height="15" viewBox="0 0 24 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M4.2 7.5C2.5 12.2 5.4 17.8 11 19.6C15.2 21 19.4 19.8 21.5 17.2C18.5 19.1 14.4 19.4 10.8 17.9C6.2 16 3.9 11.4 4.2 7.5Z" fill="currentColor" /><path d="M8.5 4.5C7.1 8.4 9.5 13 14 14.5C17.4 15.6 20.8 14.7 22.5 12.6C20 14.1 16.7 14.3 13.8 13C10.1 11.4 8.2 7.7 8.5 4.5Z" fill="currentColor" /><path d="M13.2 2C12.2 4.8 13.9 8.1 17.1 9.2C19.5 10 21.9 9.3 23.1 7.8C21.3 8.9 19 9 16.9 8.1C14.3 7 13 4.3 13.2 2Z" fill="currentColor" /></svg>
          <span className="text-[13.5px] font-semibold italic tracking-[-0.02em]">jQuery</span>
        </div>
        <div className="flex shrink-0 items-center gap-[5px] opacity-90 transition-opacity duration-200 hover:opacity-100" aria-label="OpenStack">
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M2.5 3.5C2.5 2.67 3.17 2 4 2H16C16.83 2 17.5 2.67 17.5 3.5V6.5H14V5.2H6V6.5H2.5V3.5Z" fill="currentColor" /><rect x="2.5" y="8.2" width="3.5" height="3.6" fill="currentColor" /><rect x="14" y="8.2" width="3.5" height="3.6" fill="currentColor" /><path d="M2.5 16.5C2.5 17.33 3.17 18 4 18H16C16.83 18 17.5 17.33 17.5 16.5V13.5H14V14.8H6V13.5H2.5V16.5Z" fill="currentColor" /></svg>
          <span className="text-[12.5px] font-semibold tracking-[-0.015em]">openstack</span>
        </div>
        <div className="flex shrink-0 items-center opacity-90 transition-opacity duration-200 hover:opacity-100" aria-label="ServiceNow">
          <span className="inline-flex items-center text-[13px] font-bold tracking-[-0.025em]">service<span className="mx-[0.5px] inline-flex items-center justify-center">n</span><svg width="10" height="10" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="mx-[0.5px] translate-y-[0.5px]"><path d="M8 2.2C4.7 2.2 2 4.9 2 8.2C2 10.3 3.1 12.1 4.7 13.1C5.4 13.5 6.1 13.2 6.5 12.7C6.9 12.2 7.4 11.9 8 11.9C8.6 11.9 9.1 12.2 9.5 12.7C9.9 13.2 10.6 13.5 11.3 13.1C12.9 12.1 14 10.3 14 8.2C14 4.9 11.3 2.2 8 2.2ZM8 10.1C6.8 10.1 5.9 9.2 5.9 8C5.9 6.8 6.8 5.9 8 5.9C9.2 5.9 10.1 6.8 10.1 8C10.1 9.2 9.2 10.1 8 10.1Z" fill="currentColor" /></svg>w</span>
        </div>
        <div className="flex shrink-0 items-center opacity-90 transition-opacity duration-200 hover:opacity-100" aria-label="Paysafe">
          <span className="text-[13.5px] font-bold tracking-[-0.025em]">Paysafe:</span>
        </div>
      </div>
    </footer>
  );
};

/* /src/components/ActionModal.tsx */
const TOPIC_COPY: Record<ModalTopic, { subtitle: string; description: string; mode: 'form' | 'quickstart' | 'info' }> = {
  'Request Demo': { subtitle: 'Treasury & Sweep Infrastructure', description: 'Schedule a technical walkthrough with our solutions engineering team for enterprise custody, yield routing, and multi-chain treasury settlement.', mode: 'form' },
  'Try for Free': { subtitle: 'Developer Sandbox', description: 'Spin up an API key and test @magsadfi/core on testnet in under two minutes.', mode: 'quickstart' },
  'Try MagUSD': { subtitle: 'SDK Quickstart', description: 'Install the core SDK, initialize a programmable account, and route principal into automated yield pools.', mode: 'quickstart' },
  'How it works': { subtitle: 'Architecture Overview', description: 'MagUSD pairs institutional-grade short-duration treasury reserves with a single-call TypeScript SDK for automated sweep accounts and programmable customer yield.', mode: 'info' },
  'MagUSD Portal': { subtitle: 'MagUSD Portal', description: 'Monitor treasury balances, configure automated sweep thresholds, and track real-time settlement yield from a unified console.', mode: 'form' },
  'Sign in': { subtitle: 'Console Access', description: 'Enter your work email to receive a one-time authentication link.', mode: 'form' },
  Product: { subtitle: 'Programmable Dollar Rail', description: 'Built for fintech treasuries, neo-banks, and global platforms embedding automated dollar yield directly into user balances.', mode: 'info' },
  Docs: { subtitle: 'SDK Reference', description: 'Explore TypeScript SDK guides, webhook verification, custody adapters, and deterministic settlement flows.', mode: 'quickstart' },
  Customers: { subtitle: 'Production Deployments', description: 'Engineering and finance teams use MagUSD to automate idle balance sweeps and programmable treasury allocation.', mode: 'info' },
  Resources: { subtitle: 'Integration Guides', description: 'Access security architecture briefs, audit reports, and reference implementations for @magsadfi/core.', mode: 'info' },
  Partners: { subtitle: 'Ecosystem & Custody Partners', description: 'Connect MagUSD with regulated custodians, payment processors, and institutional liquidity venues.', mode: 'form' },
  Pricing: { subtitle: 'Transparent Usage Tiers', description: 'Start free in sandbox environments with zero setup fees and volume-aligned institutional treasury pricing.', mode: 'info' },
};
interface ActionModalProps { topic: ModalTopic | null; onClose: () => void; }
export const ActionModal: React.FC<ActionModalProps> = ({ topic, onClose }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);
  useEffect(() => { setEmail(''); setError(''); setSubmitted(false); setCopiedCmd(false); }, [topic]);
  useEffect(() => {
    if (!topic) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [topic, onClose]);
  if (!topic) return null;
  const content = TOPIC_COPY[topic];
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) { setError('Please enter a valid work email address.'); return; }
    setError(''); setSubmitted(true);
  };
  const handleCopyInstall = async () => {
    try {
      await navigator.clipboard.writeText('npm install @magsadfi/core');
      setCopiedCmd(true); window.setTimeout(() => setCopiedCmd(false), 1800);
    } catch {
      // Ignore clipboard failures
    }
  };
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="magusd-modal-title" className="fixed inset-0 z-50 flex items-center justify-center bg-[#01040B]/75 px-4 backdrop-blur-md" onClick={onClose}>
      <div className="relative w-full max-w-[440px] rounded-[20px] border border-[#75AEFF]/25 bg-[#080D18]/95 p-6 text-white shadow-[0_24px_80px_rgba(8,100,232,0.28)]" onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={onClose} aria-label="Close modal" className="absolute right-4 top-4 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[#AAB5C8] transition-colors hover:border-white/25 hover:text-white"><X className="h-4 w-4" /></button>
        <p className="text-[11px] font-medium tracking-[0.02em] text-[#75AEFF]">{content.subtitle}</p>
        <h2 id="magusd-modal-title" className="mt-1.5 text-[22px] font-normal tracking-[-0.02em] text-white">{topic}</h2>
        <p className="mt-2 text-[13px] leading-[20px] text-[#B1B8C6]">{content.description}</p>
        {content.mode === 'quickstart' && (
          <div className="mt-5 rounded-xl border border-[#75AEFF]/20 bg-[#0B0C0F] p-3.5">
            <div className="flex items-center justify-between gap-2">
              <code className="text-[12px] text-[#D8A8EF]" style={{ fontFamily: 'var(--font-mono)' }}>npm install @magsadfi/core</code>
              <button type="button" onClick={handleCopyInstall} className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[11px] text-white transition-colors hover:bg-white/[0.12]">
                {copiedCmd ? (<><Check className="h-3 w-3 text-[#8BE6C1]" />Copied</>) : (<><Copy className="h-3 w-3" />Copy</>)}
              </button>
            </div>
          </div>
        )}
        {content.mode === 'form' && (
          <div className="mt-5">
            {submitted ? (
              <div className="flex items-start gap-2.5 rounded-xl border border-[#8BE6C1]/25 bg-[#8BE6C1]/[0.08] p-3.5 text-[12.5px] text-[#E6FFF5]">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#8BE6C1]" />
                <span>Confirmation sent to <strong className="font-medium">{email}</strong>. Check your inbox to continue.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-3">
                <div>
                  <label htmlFor="magusd-email" className="block text-[11.5px] text-[#AAB5C8]">Work email</label>
                  <input id="magusd-email" type="email" value={email} onChange={(e) => { setEmail(e.target.value); if (error) setError(''); }} placeholder="name@company.com" className="mt-1.5 h-10 w-full rounded-lg border border-white/15 bg-[#040812] px-3 text-[13px] text-white placeholder:text-[#5B6374] focus:border-[#167BFF] focus:outline-none" />
                  {error && (<p className="mt-1.5 text-[11.5px] text-[#FCA5A5]">{error}</p>)}
                </div>
                <button type="submit" className="inline-flex h-9 w-full cursor-pointer items-center justify-center gap-1.5 rounded-full bg-white text-[12px] font-medium text-[#070B14] transition-colors hover:bg-[#F0F4FC]">Continue<ArrowRight className="h-3.5 w-3.5" /></button>
              </form>
            )}
          </div>
        )}
        {content.mode === 'info' && (
          <div className="mt-5 grid grid-cols-3 gap-2.5 border-t border-white/10 pt-4 text-left">
            <div><p className="text-[11px] text-[#747983]">Settlement</p><p className="mt-0.5 text-[13px] font-medium text-white tabular-nums">Instant</p></div>
            <div><p className="text-[11px] text-[#747983]">SDK Setup</p><p className="mt-0.5 text-[13px] font-medium text-white tabular-nums">4 lines</p></div>
            <div><p className="text-[11px] text-[#747983]">Custody</p><p className="mt-0.5 text-[13px] font-medium text-white">Multi-chain</p></div>
          </div>
        )}
      </div>
    </div>
  );
};

/* /src/components/MagUSDHero.tsx (default export) */
export default function MagUSD() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [parallax, setParallax] = useState({ bg: { x: 0, y: 0 }, text: { x: 0, y: 0 }, terminal: { x: 0, y: 0 } });
  const [activeModal, setActiveModal] = useState<ModalTopic | null>(null);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setReducedMotion(media.matches);
    updatePreference();
    media.addEventListener('change', updatePreference);
    return () => media.removeEventListener('change', updatePreference);
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      setParallax({ bg: { x: 0, y: 0 }, text: { x: 0, y: 0 }, terminal: { x: 0, y: 0 } });
      return;
    }
    const isDesktopPointer = window.matchMedia('(min-width: 768px) and (pointer: fine)').matches;
    if (!isDesktopPointer) return;
    let rafId = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const normX = (e.clientX / window.innerWidth - 0.5) * 2;
      const normY = (e.clientY / window.innerHeight - 0.5) * 2;
      targetX = normX; targetY = normY;
    };
    const tick = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      setParallax({
        bg: { x: currentX * 10, y: currentY * 8 },
        terminal: { x: currentX * 2.5, y: currentY * 2 },
        text: { x: currentX * 1.4, y: currentY * 1 },
      });
      rafId = window.requestAnimationFrame(tick);
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    rafId = window.requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.cancelAnimationFrame(rafId);
    };
  }, [reducedMotion]);

  return (
    <>
      <style>{MAGUSD_STYLES}</style>
      <div id="top" className="relative flex min-h-screen w-full flex-col justify-between overflow-hidden bg-[#020711] md:h-screen md:min-h-[760px]">
        <AnimatedBackground parallax={parallax.bg} reducedMotion={reducedMotion} />
        <Navigation onSelectAction={setActiveModal} />
        <main className="relative z-20 flex flex-1 flex-col items-center pt-[64px] sm:pt-[84px] md:pt-[101px]">
          <AnnouncementBadge onSelectAction={setActiveModal} />
          <HeroContent parallax={parallax.text} reducedMotion={reducedMotion} />
          <CTAButtons onSelectAction={setActiveModal} />
          <TerminalWindow parallax={parallax.terminal} reducedMotion={reducedMotion} />
        </main>
        <PartnerLogoStrip />
        <ActionModal topic={activeModal} onClose={() => setActiveModal(null)} />
      </div>
    </>
  );
}
