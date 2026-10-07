import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';

import './MostarCinematicScroll.css';

const SKY_URL = 'https://raft-blast-61784561.figma.site/_assets/v11/16b5007d9c93971e26ffe4e0e3e37946f6bd538c.png';
const BACK_FOUR_URL = 'https://raft-blast-61784561.figma.site/_assets/v11/8a7f8af50e0ce92ec2e228e7b0b4112178c51cf1.png';
const BAZAAR_URL = 'https://raft-blast-61784561.figma.site/_assets/v11/864afe00e41e2fa20a5aa546e15cb807e0f81384.png';
const SPLIT_LEFT_URL = 'https://raft-blast-61784561.figma.site/_assets/v11/7536d7b60a1fce482cf6edf3f0bffd3bad5d0f8a.png';
const SPLIT_RIGHT_URL = 'https://raft-blast-61784561.figma.site/_assets/v11/392db6a6a6b98e868bd7f8d3f55bb719d51e5028.png';
const BRIDGE_URL = 'https://raft-blast-61784561.figma.site/_assets/v11/c6a6d8ef49bca43f708aa852692942c45ec950d4.png';
const FRAME_TWO_URL = 'https://raft-blast-61784561.figma.site/_assets/v11/ba75252bab2b1c510987b74837770f7bc8a6b2d4.png';
const ICON_1_URL = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260730_230438_d526b8b6-8a2e-4e3b-9993-3908acae03a7.png';
const ICON_2_URL = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260730_230442_140bc25b-b165-4249-904a-f708bff6970e.png';
const ICON_3_URL = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260730_230448_825949c9-ccdb-4857-b4a6-e349eccc9010.png';

const SIGHTS = [
  {
    ariaLabel: 'Open Stari Most card',
    kicker: 'Old Bridge',
    title: 'Stari Most',
    text: "The stone arch over the Neretva and Mostar's main landmark.",
    pin: ICON_1_URL,
  },
  {
    ariaLabel: 'Open Kujundziluk card',
    kicker: 'Bazaar Street',
    title: 'Kujundziluk',
    text: 'Copper shops, souvenirs, and the old bazaar lane by the bridge.',
    pin: ICON_2_URL,
  },
  {
    ariaLabel: 'Open Koski Mehmed Pasha Mosque card',
    kicker: 'Viewpoint',
    title: 'Koski Mehmed Pasha Mosque',
    text: 'A classic minaret view back toward Stari Most and the river.',
    pin: ICON_3_URL,
  },
  {
    ariaLabel: 'Open Kajtaz House card',
    kicker: 'Ottoman House',
    title: 'Kajtaz House',
    text: "A preserved residential house showing Mostar's Ottoman layers.",
    pin: ICON_1_URL,
  },
  {
    ariaLabel: 'Open War Photo Exhibition card',
    kicker: 'Museum',
    title: 'War Photo Exhibition',
    text: "A compact, moving stop for context on the city's recent history.",
    pin: ICON_2_URL,
  },
];

export interface MostarCinematicScrollProps {
  compact?: boolean;
  showDemoButton?: boolean;
  className?: string;
}

export const MostarCinematicScroll: React.FC<MostarCinematicScrollProps> = ({
  compact = false,
  showDemoButton = false,
  className,
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const shell = shellRef.current;
    if (!root || !shell) return;
    const h = compact ? shell.clientHeight : window.innerHeight;
    root.style.setProperty('--mc-vh', `${h / 100}px`);
  }, [compact]);

  useEffect(() => {
    const root = rootRef.current;
    const shell = shellRef.current;
    const section = sectionRef.current;
    const track = trackRef.current;
    const controls = controlsRef.current;
    const prevBtn = prevRef.current;
    const nextBtn = nextRef.current;
    if (!root || !shell || !section || !track || !controls || !prevBtn || !nextBtn) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const scroller: HTMLElement | Window = compact ? shell : window;

    let targetMouseX = 0;
    let targetMouseY = 0;
    let mouseX = 0;
    let mouseY = 0;
    let targetScroll = 0;
    let smoothScroll = 0;
    let initialized = false;
    let rafPending = false;
    let rafId = 0;
    let sightCards: HTMLElement[] = [];
    let originalSightCount = 1;
    let activeSight = 1;

    const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
    const smoothstep = (e0: number, e1: number, v: number) => {
      const x = clamp((v - e0) / (e1 - e0));
      return x * x * (3 - 2 * x);
    };
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const segmentInOut = (s: number, a: number, b: number, c: number, d: number) => {
      const enter = smoothstep(a, b, s);
      const exit = smoothstep(c, d, s);
      return { enter, exit, active: enter * (1 - exit) };
    };

    const getViewHeight = () => (compact ? shell.clientHeight : window.innerHeight);

    const getScrollDistance = () => {
      if (compact) {
        return clamp(shell.scrollTop, 0, section.offsetHeight - shell.clientHeight);
      }
      return clamp(-section.getBoundingClientRect().top, 0, section.offsetHeight - window.innerHeight);
    };

    const set = (name: string, value: string) => root.style.setProperty(name, value);

    const updateSightSlider = () => {
      if (!sightCards.length) return;
      const cardWidth = sightCards[0].offsetWidth;
      const gap = parseFloat(getComputedStyle(track).columnGap || '0');
      set('--sights-shift', `${-(cardWidth + gap) * activeSight}px`);
      sightCards.forEach((card, index) => card.classList.toggle('is-active', index === activeSight));
    };

    const moveSightSlider = (dir: number) => {
      activeSight += dir;
      updateSightSlider();
    };

    const selectSightCard = (card: HTMLElement) => {
      const index = Number(card.dataset.sightIndex);
      if (Number.isFinite(index)) {
        activeSight = index;
        updateSightSlider();
      }
    };

    const jumpSightSlider = (index: number) => {
      track.classList.add('is-jumping');
      activeSight = index;
      updateSightSlider();
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          track.classList.remove('is-jumping');
        });
      });
    };

    const normalizeSightSlider = () => {
      if (activeSight >= originalSightCount * 2) {
        jumpSightSlider(activeSight - originalSightCount);
      } else if (activeSight < originalSightCount) {
        jumpSightSlider(activeSight + originalSightCount);
      }
    };

    const onCardClick = (event: Event) => selectSightCard(event.currentTarget as HTMLElement);
    const onCardKeyDown = (event: Event) => {
      const e = event as KeyboardEvent;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectSightCard(e.currentTarget as HTMLElement);
      }
    };
    const onPrev = () => moveSightSlider(-1);
    const onNext = () => moveSightSlider(1);

    const setupSightSlider = () => {
      sightCards = Array.from(track.querySelectorAll<HTMLElement>('.sight-card'));
      originalSightCount = Math.max(1, Math.round(sightCards.length / 3));
      activeSight = originalSightCount;
      sightCards.forEach((card) => {
        card.addEventListener('click', onCardClick);
        card.addEventListener('keydown', onCardKeyDown);
      });
      track.addEventListener('transitionend', normalizeSightSlider);
      updateSightSlider();
    };

    const requestTick = () => {
      if (!rafPending) {
        rafPending = true;
        rafId = requestAnimationFrame(update);
      }
    };

    const update = () => {
      rafPending = false;
      const viewH = getViewHeight();
      set('--mc-vh', `${viewH / 100}px`);

      targetScroll = getScrollDistance();
      if (!initialized || reduceMotion.matches) {
        smoothScroll = targetScroll;
        initialized = true;
      } else {
        smoothScroll = lerp(smoothScroll, targetScroll, 0.14);
      }
      if (Math.abs(smoothScroll - targetScroll) < 0.08) smoothScroll = targetScroll;

      mouseX = lerp(mouseX, targetMouseX, 0.12);
      mouseY = lerp(mouseY, targetMouseY, 0.12);

      const frame2 = segmentInOut(smoothScroll, 560, 900, 1300, 1620);
      const frame3 = segmentInOut(smoothScroll, 1760, 2140, 2540, 2700);
      const progress = clamp(smoothScroll / 2700);
      const introExit = smoothstep(90, 650, smoothScroll);
      const sightsEnterRaw = smoothstep(2760, 3560, smoothScroll);
      const sightsEnter = Math.pow(sightsEnterRaw, 1.55);
      const sightsControlsEnter = smoothstep(3360, 3660, smoothScroll);
      const blurActive = clamp(frame2.active + frame3.active);
      const frame2Opacity = frame2.active * (1 - frame3.enter);
      const splitDrift = Math.pow(frame2.enter, 1.5);
      const panel2Opacity = frame2.active * (1 - frame2.exit);
      const panel3Opacity = frame3.active * (1 - frame3.exit);
      const backScale = 0.76 + progress * 0.2 + frame2.enter * 0.18 + frame3.enter * 0.16;
      const sharedHeroY = progress * -74;
      const sharedHeroScale = progress * 0.23;
      const sightsScreenTop = Math.min(220, Math.max(112, viewH * 0.19)) - 50;
      const sightsParentTop = viewH - (viewH - sightsScreenTop) / backScale;

      set('--mx', reduceMotion.matches ? '0' : mouseX.toFixed(4));
      set('--my', reduceMotion.matches ? '0' : mouseY.toFixed(4));

      set('--back-opacity', `${1 - frame2.active * 0.06}`);
      set('--back-x', `${mouseX * -12}px`);
      set('--back-y', `${mouseY * -4}px`);
      set('--back-scale', `${backScale}`);
      set('--four-y', `${((10 + progress * 10) * viewH) / 100}px`);
      set('--four-scale', `${0.78 + progress * 0.16}`);
      set('--bazaar-y', `${((20 - progress * 8) * viewH) / 100}px`);
      set('--blur-px', `${blurActive * 14}px`);
      set('--back-brightness', `${1 - blurActive * 0.255}`);
      set('--bazaar-blur-px', `${frame2.active * 14}px`);
      set('--bazaar-brightness', `${1 - frame2.active * 0.255 - frame3.active * 0.06}`);
      set('--bazaar-saturation', `${1 + frame3.active * 0.18}`);
      set('--shade-opacity', '1');
      set('--shade-z', frame2.active > 0.02 ? '2' : '0');
      set('--shade-top-alpha', `${blurActive * 0.465}`);
      set('--shade-mid-alpha', `${blurActive * 0.42}`);
      set('--shade-bottom-alpha', `${blurActive * 0.51}`);

      set('--title-y', `${introExit * -210}px`);
      set('--title-scale', `${1 - introExit * 0.08}`);
      set('--title-opacity', `${1 - introExit}`);

      set('--bridge-x', `calc(-50% + ${mouseX * 18}px)`);
      set('--bridge-y', `${mouseY * 8 + sharedHeroY - frame2.exit * 760}px`);
      set('--bridge-bottom', `${((5 - frame2.enter * 13) * viewH) / 100}px`);
      set('--bridge-width', `${67.2 + frame2.enter * 37.8}cqw`);
      set('--bridge-scale', `${1.02 + sharedHeroScale + frame2.exit * 0.46}`);

      set('--split-left-x', `calc(-50% + ${-splitDrift * 46}cqw + ${mouseX * 22}px)`);
      set('--split-left-y', `${mouseY * 10 + sharedHeroY - splitDrift * 180}px`);
      set('--split-left-scale', `${1 + sharedHeroScale + frame2.enter * 0.74}`);
      set('--split-right-x', `calc(-50% + ${splitDrift * 46}cqw + ${mouseX * 22}px)`);
      set('--split-right-y', `${mouseY * 10 + sharedHeroY - splitDrift * 180}px`);
      set('--split-right-scale', `${1 + sharedHeroScale + frame2.enter * 0.74}`);

      set('--frame2-opacity', `${frame2Opacity}`);
      set('--frame2-x', `calc(-50% + ${mouseX * 10}px)`);
      set('--frame2-y', `calc(-50% + ${mouseY * 8 - frame2.exit * 150}px)`);
      set('--frame2-scale', `${1.06 + frame2.enter * 0.08 + frame2.exit * 0.08}`);

      set('--intro-copy-y', `${introExit * 90}px`);
      set('--intro-copy-opacity', `${1 - introExit}`);
      set('--panel2-opacity', `${panel2Opacity}`);
      set('--panel2-y', `calc(-50% + ${-frame2.exit * 86 + (1 - frame2.enter) * 58}px)`);
      set('--panel3-opacity', `${panel3Opacity}`);
      set('--panel3-y', `calc(-50% + ${-frame3.exit * 86 + (1 - frame3.enter) * 58}px)`);

      set('--sights-opacity', `${sightsEnter}`);
      set('--sights-controls-opacity', `${sightsControlsEnter}`);
      controls.classList.toggle('is-ready', sightsControlsEnter > 0.98);
      set('--sights-visibility', sightsEnter > 0.01 ? 'visible' : 'hidden');
      set('--sights-y', '0px');
      set('--sights-enter-x', `${(1 - sightsEnter) * 420}cqw`);
      set('--sights-scale', `${1 / backScale}`);
      set('--sights-top', `${sightsParentTop}px`);
      set('--sights-screen-top', `${sightsScreenTop}px`);

      if (
        Math.abs(smoothScroll - targetScroll) > 0.08 ||
        Math.abs(mouseX - targetMouseX) > 0.001 ||
        Math.abs(mouseY - targetMouseY) > 0.001
      ) {
        requestTick();
      }
    };

    const onScroll = () => requestTick();
    const onResize = () => {
      updateSightSlider();
      requestTick();
    };
    const onPointerMove = (event: PointerEvent) => {
      targetMouseX = event.clientX / window.innerWidth - 0.5;
      targetMouseY = event.clientY / window.innerHeight - 0.5;
      requestTick();
    };

    const docEl = document.documentElement;
    const previousScrollBehavior = docEl.style.scrollBehavior;
    if (!compact && !reduceMotion.matches) {
      docEl.style.scrollBehavior = 'smooth';
    }

    const observer = new ResizeObserver(() => {
      updateSightSlider();
      requestTick();
    });

    setupSightSlider();
    scroller.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    prevBtn.addEventListener('click', onPrev);
    nextBtn.addEventListener('click', onNext);
    observer.observe(shell);
    requestTick();

    return () => {
      scroller.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointerMove);
      prevBtn.removeEventListener('click', onPrev);
      nextBtn.removeEventListener('click', onNext);
      observer.disconnect();
      track.removeEventListener('transitionend', normalizeSightSlider);
      sightCards.forEach((card) => {
        card.removeEventListener('click', onCardClick);
        card.removeEventListener('keydown', onCardKeyDown);
      });
      docEl.style.scrollBehavior = previousScrollBehavior;
      if (rafPending) cancelAnimationFrame(rafId);
    };
  }, [compact]);

  return (
    <div
      ref={rootRef}
      className={'mc-root' + (compact ? ' mc-compact' : '') + (className ? ' ' + className : '')}
    >
      {showDemoButton && compact && (
        <Link to="/demo/mostar-cinematic-scroll" className="mc-demo-btn">
          <ExternalLink size={12} /> Live Demo
        </Link>
      )}
      <main className="site-shell" ref={shellRef}>
        <section className="cinema-scroll" id="cinema" aria-label="Mostar cinematic scroll story" ref={sectionRef}>
          <div className="stage">
            <div className="world">
              <img className="scene-img sky-img" src={SKY_URL} alt="" />
              <header className="site-header" aria-label="Primary navigation">
                <a className="site-logo" href="#cinema">
                  Bosnia and Herzegovina
                </a>
                <nav className="site-nav" aria-label="Main menu">
                  <a href="#cinema">Intro</a>
                  <a href="#bridge">Bridge</a>
                  <a href="#bazaar">Bazaar</a>
                  <a href="#routes">Routes</a>
                </nav>
                <button className="language-switcher" type="button" aria-label="Change language">
                  <span>EN</span>
                  <span aria-hidden="true">⌄</span>
                </button>
              </header>
              <div className="back-stack">
                <img className="scene-img back-img back-four" src={BACK_FOUR_URL} alt="" />
                <section className="sights-slider" aria-label="Mostar sights slider">
                  <div className="sights-track" ref={trackRef}>
                    {[0, 1, 2].flatMap((setIndex) =>
                      SIGHTS.map((sight, index) => (
                        <article
                          key={`${setIndex}-${index}`}
                          className="sight-card"
                          data-sight-index={setIndex * SIGHTS.length + index}
                          tabIndex={0}
                          role="button"
                          aria-label={sight.ariaLabel}
                        >
                          <span className="sight-kicker">{sight.kicker}</span>
                          <img className="sight-pin" src={sight.pin} alt="" />
                          <h3>{sight.title}</h3>
                          <p>{sight.text}</p>
                        </article>
                      ))
                    )}
                  </div>
                </section>
                <img className="scene-img back-img back-bazaar" src={BAZAAR_URL} alt="" />
              </div>
              <div className="sights-controls" aria-label="Slider controls" ref={controlsRef}>
                <button className="sight-nav sight-prev" type="button" aria-label="Previous sight" ref={prevRef}>
                  ←
                </button>
                <button className="sight-nav sight-next" type="button" aria-label="Next sight" ref={nextRef}>
                  →
                </button>
              </div>
              <h1 className="hero-title">MOSTAR</h1>
              <img className="scene-img splitframe-img splitframe-left" src={SPLIT_LEFT_URL} alt="" />
              <img className="scene-img splitframe-img splitframe-right" src={SPLIT_RIGHT_URL} alt="" />
              <img className="scene-img bridge-img" src={BRIDGE_URL} alt="" />
              <img className="scene-img frame-two-img" src={FRAME_TWO_URL} alt="" />
              <div className="shade" />
            </div>
            <section className="intro-copy" aria-label="Mostar overview">
              <p>
                A stone arch, emerald water, and a compact old city made for slow mornings, late light, and one
                unforgettable crossing.
              </p>
              <div className="hero-tags" aria-label="Mostar highlights">
                <span>Old Bridge</span>
                <span>Neretva River</span>
                <span>UNESCO old city</span>
              </div>
            </section>
            <section className="story-panel story-panel-bridge" aria-label="Old Bridge details">
              <h2>The bridge is the city's compass.</h2>
              <p>
                Stari Most links the banks of the Neretva and anchors a historic quarter shaped by Ottoman,
                Mediterranean, and European layers.
              </p>
              <dl className="facts">
                <div>
                  <dt>1566</dt>
                  <dd>Original bridge completed</dd>
                </div>
                <div>
                  <dt>2005</dt>
                  <dd>Old Bridge Area inscribed by UNESCO</dd>
                </div>
              </dl>
            </section>
            <section className="story-panel story-panel-bazaar" aria-label="Old town details">
              <h2>The bazaar keeps Mostar close.</h2>
              <p>
                Stone lanes, mosque courtyards, copper stalls, and riverside coffee stay within a short walk of
                Stari Most.
              </p>
              <button className="note-button" type="button">
                <span aria-hidden="true">↗</span>
                <span>Open old town notes</span>
              </button>
            </section>
          </div>
        </section>
      </main>
    </div>
  );
};

export default MostarCinematicScroll;
