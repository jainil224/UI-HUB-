export const CINEMATIC_NAVBAR_SOURCE = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Vesper.ai — Navbar</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  :root{
    --bg:#000000;
    --text:#ffffff;
    --border: rgba(255,255,255,0.16);
    --logo:15.5px;
    --logo-mark:22px;
    --nav:14px;
    --nav-h:40px;
    --btn:13.5px;
    --btn-h:40px;
    --header-y:22px;
    --header-x:40px;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }
  a { color: inherit; text-decoration: none; }
  button { font-family: inherit; }

  body{
    font-family:"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    overflow-x: hidden;
    position: relative;
    min-height: 100vh;
    background:#000;
    color:#fff;
  }
  html{ scroll-behavior: smooth; }

  /* ---------- Grain texture ---------- */
  .grain{
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    opacity: 0.5;
    mix-blend-mode: screen;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.05 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  }

  /* ---------- Header ---------- */
  .header{
    display:grid;
    grid-template-columns: 1fr auto 1fr;
    align-items:center;
    padding: var(--header-y) var(--header-x) 10px;
    z-index:50;
    position:relative;
    background: radial-gradient(120% 220% at 50% -60%, #232323 0%, #101010 45%, #000000 100%);
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }

  /* Logo */
  .logo{
    display:inline-flex;
    align-items:center;
    gap:9px;
    justify-self:start;
    font-size: var(--logo);
    font-weight:600;
    letter-spacing:-0.03em;
    color:#fff;
  }
  .logo svg{ width:var(--logo-mark); height:var(--logo-mark); }
  .logo-suffix{ font-weight:400; }

  /* Nav */
  .site-nav{
    display:flex;
    align-items:center;
    gap:8px;
    justify-self:center;
  }
  .nav-pill{
    height: var(--nav-h);
    padding: 0 18px;
    border-radius: 7px;
    overflow: hidden;
    position: relative;
    display:inline-flex;
    align-items:center;
    border: 1px solid rgba(255,255,255,0.14);
    background: #232323;
    color: #e6e6e6;
    font-size: var(--nav);
    font-weight:400;
    letter-spacing:-0.01em;
    white-space:nowrap;
    transition: background 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease;
  }
  .nav-pill::before{
    content:"";
    position:absolute;
    inset:0;
    background: linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.16) 50%, transparent 70%);
    transform: translateX(-120%);
    transition: transform 0.6s ease;
  }
  .nav-pill:hover::before{ transform: translateX(120%); }
  .nav-pill:hover{
    border-color: rgba(255,255,255,0.28);
    background: #2e2e2e;
    box-shadow: 0 0 18px rgba(200,210,230,0.12);
  }

  /* Buttons (shared liquid-glass language) */
  .btn{
    position: relative;
    isolation: isolate;
    overflow: hidden;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: var(--btn-h);
    padding: 0 16px;
    border-radius: 6px;
    font-size: var(--btn);
    font-weight: 500;
    letter-spacing: -0.02em;
    line-height: 1;
    white-space: nowrap;
    cursor: pointer;
    transition: background 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease, color 0.35s ease, filter 0.35s ease;
  }
  .btn::after{
    content:"";
    position:absolute;
    inset:0;
    background: linear-gradient(115deg, transparent 20%, rgba(255,255,255,0.45) 48%, transparent 76%);
    transform: translateX(-130%);
    transition: transform 0.65s ease;
  }
  .btn:hover::after{ transform: translateX(130%); }

  .btn-solid{
    background: linear-gradient(180deg, #ffffff 0%, #e7e7e7 48%, #cfcfcf 100%);
    color:#111;
    border:1px solid #fff;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.95);
  }
  .btn-solid:hover{
    background: linear-gradient(180deg, #fff 0%, #f3f6ff 42%, #d5def2 100%);
    border-color:#f2f6ff;
    box-shadow: inset 0 1px 0 #fff, 0 0 22px rgba(186,208,255,0.35), 0 8px 18px rgba(255,255,255,0.12);
  }

  .header-cta{ justify-self:end; }

  /* Burger (mobile) */
  .burger{
    display:none;
    width:42px;
    height:42px;
    border-radius:6px;
    border:1px solid var(--border);
    background: rgba(8,8,8,0.55);
    z-index:60;
    align-items:center;
    justify-content:center;
    cursor:pointer;
    position:relative;
    flex-direction:column;
    gap:5px;
    transition: border-color 0.25s ease, background 0.25s ease;
  }
  .burger:hover{
    border-color: rgba(255,255,255,0.32);
    background: rgba(255,255,255,0.05);
  }
  .burger .bar{
    width:16px;
    height:1.5px;
    background:#fff;
    border-radius:1px;
    transition: transform 0.25s ease, opacity 0.2s ease;
  }
  body.menu-open .burger .bar:nth-child(1){ transform: translateY(6.5px) rotate(45deg); }
  body.menu-open .burger .bar:nth-child(2){ opacity: 0; }
  body.menu-open .burger .bar:nth-child(3){ transform: translateY(-6.5px) rotate(-45deg); }

  /* Full-screen mobile menu */
  .menu-backdrop{
    display:block;
    position:fixed;
    inset:0;
    z-index:40;
    background: rgba(8,8,8,0.42);
    opacity:0;
    visibility:hidden;
    transition: opacity 0.28s ease, backdrop-filter 0.28s ease;
  }
  body.menu-open .menu-backdrop{
    opacity:1;
    visibility:visible;
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
  }
  body.menu-open{ overflow:hidden; }

  @media (max-width: 900px){
    .burger{ display:flex; }
    .header{
      grid-template-columns: 1fr auto auto;
      gap:8px;
      padding: 16px 16px 10px;
    }
    .logo, .header-cta, .burger{ z-index:80; position:relative; }
    .header-cta{ display:none; }

    .site-nav{
      display: none;
      position: fixed;
      inset:0;
      z-index:45;
      background: transparent;
      flex-direction:column;
      align-items:center;
      justify-content:center;
      gap:12px;
      padding: max(96px, calc(env(safe-area-inset-top) + 88px)) 22px 32px;
    }
    body.menu-open .site-nav{ display:flex; }
    .nav-pill{
      width:auto;
      min-width:200px;
      height:56px;
      font-size:19px;
      border-radius:10px;
      justify-content:center;
    }
  }

  @media (min-width: 901px) and (min-width: 1600px){
    :root{
      --logo:17px; --logo-mark:24px; --nav:15px; --nav-h:44px;
      --btn:15px; --btn-h:44px; --header-x:64px; --header-y:28px;
    }
  }
  @media (min-width: 1920px){
    :root{
      --logo:18px; --logo-mark:26px; --nav:16px; --nav-h:48px;
      --btn:16px; --btn-h:48px; --header-x:80px; --header-y:32px;
    }
  }
  @media (min-width: 901px) and (max-width: 1279px){
    :root{
      --logo:15px; --nav:13px; --nav-h:36px; --btn:13px; --btn-h:38px;
      --header-x:16px; --header-y:16px;
    }
  }

  @media (prefers-reduced-motion: reduce){
    *, *::before, *::after{ transition:none !important; animation:none !important; }
  }
</style>
</head>
<body style="background:#000;color:#fff">

<div class="grain"></div>
<div class="menu-backdrop" id="menuBackdrop"></div>

<header class="header">
  <a class="logo" href="#top" aria-label="Vesper.ai">
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <g transform="rotate(-30 12 12)">
        <circle cx="7.3" cy="3.2" r="1.45"/>
        <rect x="5.5" y="4.7" width="3.6" height="14.6" rx="1.8"/>
        <rect x="14.9" y="4.7" width="3.6" height="14.6" rx="1.8"/>
        <circle cx="16.7" cy="20.8" r="1.45"/>
      </g>
    </svg>
    Vesper<span class="logo-suffix">.ai</span>
  </a>

  <nav class="site-nav" id="site-nav" aria-label="Primary">
    <a class="nav-pill" href="#benefits">Benefits</a>
    <a class="nav-pill" href="#how-it-works">How It Works</a>
    <a class="nav-pill" href="#faqs">FAQs</a>
    <a class="nav-pill" href="#pricing">Pricing</a>
  </nav>

  <a class="btn btn-solid header-cta" href="#start">Start for Free</a>

  <button class="burger" id="burger" aria-controls="site-nav" aria-expanded="false" aria-label="Open menu">
    <span class="bar"></span>
    <span class="bar"></span>
    <span class="bar"></span>
  </button>
</header>

<script>
(function(){
  var burger = document.getElementById('burger');
  var backdrop = document.getElementById('menuBackdrop');
  var navLinks = document.querySelectorAll('#site-nav a');

  function closeMenu(){
    document.body.classList.remove('menu-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open menu');
  }
  function openMenu(){
    document.body.classList.add('menu-open');
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Close menu');
  }

  burger.addEventListener('click', function(){
    document.body.classList.contains('menu-open') ? closeMenu() : openMenu();
  });

  navLinks.forEach(function(link){
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape') closeMenu();
  });

  window.addEventListener('resize', function(){
    if (window.matchMedia('(min-width: 901px)').matches) closeMenu();
  });
})();
</script>

</body>
</html>`;
