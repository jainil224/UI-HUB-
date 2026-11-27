import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import HoloMosaic from './HoloMosaic';
import { getBlackFridayOfferEndMs } from '../../utils/blackFridayOffer';

type Countdown = { hours: string; minutes: string; seconds: string };

const pad = (value: number) => String(value).padStart(2, '0');

/** Derive the live remaining time from the same UTC window that gates the offer. */
const getRemainingTime = (): Countdown => {
  const endMs = getBlackFridayOfferEndMs(new Date());
  const remainingMs = Number.isNaN(endMs) ? 0 : Math.max(0, endMs - Date.now());
  const totalSeconds = Math.floor(remainingMs / 1000);

  return {
    hours: pad(Math.floor(totalSeconds / 3600)),
    minutes: pad(Math.floor((totalSeconds % 3600) / 60)),
    seconds: pad(totalSeconds % 60),
  };
};

/**
 * Fixed Black Friday promotional strip rendered above the site Navbar.
 *
 * Fixed at `top-0`, height `h-14`, `z-[70]`, full width. A UI HUB blue/violet/cyan
 * WebGL2 `HoloMosaic` holographic tile field with gold glints renders at full opacity behind the copy, with a
 * light sweep and a live pulse layered on top. A live countdown reads directly
 * from the UTC offer window in `blackFridayOffer.ts`. All CSS animations honor
 * `prefers-reduced-motion`. No new dependencies and no dismiss control.
 * Navbar offset is kept in sync via `hasPromoBanner` in App.tsx.
 */
const BlackFridayBanner = () => {
  const [countdown, setCountdown] = useState<Countdown>(getRemainingTime);

  useEffect(() => {
    const intervalId = window.setInterval(() => setCountdown(getRemainingTime()), 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <div
      role="region"
      aria-label="Black Friday promotion"
      className="fixed inset-x-0 top-0 z-[70] h-14 w-full overflow-hidden border-b border-[#1F4BFF]/35 bg-[#09090f] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_8px_28px_rgba(0,0,0,0.6)]"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <HoloMosaic
          color="#09090f"
          metalColor="#FFC700"
          spectrum="cool"
          tileSize={0.8}
          gap={0.08}
          roundness={0.18}
          bevel={0.45}
          scatter={0.35}
          tilt={0.45}
          swirl={1.2}
          ripple={0.6}
          bands={1.3}
          softness={0.45}
          intensity={1.45}
          saturation={0.55}
          glitter={0.9}
          sheen={0.9}
          grain={0.06}
          speed={0.5}
          variation={7}
          filter="none"
          fade={0}
          opacity={1}
          intro={true}
          mouseInteraction={true}
          mouseStrength={1}
          mouseRadius={0.25}
          flipOnClick={true}
          lightMode={false}
        />
      </div>

      <span
        aria-hidden="true"
        className="bf-sweep pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-[#7EA6FF]/30 to-transparent"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#050507]/40 to-transparent"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(5,5,8,0.45),transparent_18%,transparent_82%,rgba(5,5,8,0.45))]"
      />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-[1600px] items-center justify-between gap-2 px-3 sm:gap-5 sm:px-6">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <span
            aria-hidden="true"
            className="bf-live-dot hidden h-1.5 w-1.5 shrink-0 rounded-full bg-[#FFC700] sm:block"
          />
          <span className="hidden shrink-0 text-[10px] font-black uppercase tracking-[0.28em] text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)] md:inline">
            Black Friday
          </span>
          <span aria-hidden="true" className="hidden h-4 w-px shrink-0 bg-[#1F4BFF]/50 md:block" />
          <span className="flex flex-col leading-none sm:block">
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#8FB4FF] drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)] md:hidden">
              Black Friday
            </span>
            <span className="animate-holo-text whitespace-nowrap text-[12px] font-black uppercase tracking-[0.1em] sm:hidden">
              50% off
            </span>
            <span className="animate-holo-text hidden whitespace-nowrap text-[14px] font-black uppercase tracking-[0.1em] sm:inline">
              Up to 50% off
            </span>
          </span>
          <span aria-hidden="true" className="hidden h-4 w-px shrink-0 bg-[#1F4BFF]/50 lg:block" />
          <span className="hidden whitespace-nowrap text-[11px] font-semibold tracking-wide text-white/80 drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)] lg:inline">
            Premium components · limited time only
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <div
            role="timer"
            aria-label={`Offer ends in ${countdown.hours} hours, ${countdown.minutes} minutes, ${countdown.seconds} seconds`}
            className="flex items-center gap-1 sm:gap-1.5"
          >
            <span className="hidden whitespace-nowrap text-[9px] font-black uppercase tracking-[0.18em] text-[#8FB4FF] drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)] xl:inline">
              Ends in
            </span>
            <span aria-hidden="true" key={`h-${countdown.hours}`} className="bf-digit">
              {countdown.hours}
            </span>
            <span aria-hidden="true" className="text-[11px] font-black text-[#FFC700]/70">:</span>
            <span aria-hidden="true" key={`m-${countdown.minutes}`} className="bf-digit">
              {countdown.minutes}
            </span>
            <span aria-hidden="true" className="text-[11px] font-black text-[#FFC700]/70">:</span>
            <span aria-hidden="true" key={`s-${countdown.seconds}`} className="bf-digit">
              {countdown.seconds}
            </span>
          </div>

          <Link
            to="/pricing"
            className="group inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#7EA6FF]/60 bg-gradient-to-r from-[#1F4BFF] to-[#8B5CF6] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-white shadow-[0_2px_10px_rgba(31,75,255,0.5)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_5px_18px_rgba(31,75,255,0.7)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7EA6FF] sm:px-4 sm:text-[11px]"
          >
            Claim deal
            <ArrowRight
              className="h-3 w-3 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BlackFridayBanner;
