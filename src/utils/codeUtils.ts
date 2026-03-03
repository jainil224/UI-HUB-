export const getComponentCode = (id: string, options: { lang: 'js' | 'ts', styling: 'tailwind' | 'css' }) => {
  const { lang, styling } = options;
  const isTS = lang === 'ts';
  const isTailwind = styling === 'tailwind';

  const vanillaBoilerplate = (html: string, css: string, js: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { background: #000; color: #fff; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; font-family: sans-serif; }
    ${css}
  </style>
</head>
<body>
  ${html}
  <script>
    ${js}
  </script>
</body>
</html>`;

  // For React/Tailwind/TS versions
  const reactBoilerplate = (imports: string, content: string) => `
${imports}

export const Component = () => {
  return (
    ${content}
  );
};`;

  if (!isTailwind) {
    // Return Vanilla Version when CSS is selected
    const vanillaBoilerplateLocal = (html: string, css: string, js: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${id} Animation</title>
    <style>
        body { 
            background: #000; 
            color: #fff; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            min-height: 100vh; 
            margin: 0; 
            font-family: 'Inter', sans-serif;
            overflow: hidden;
        }
        ${css}
    </style>
</head>
<body>
    ${html}
    <script>
        ${isTS ? '// TypeScript' : '// JavaScript'}
        ${js}
    </script>
</body>
</html>`;

    const tsTypeChars = isTS ? ': HTMLElement' : '';
    const tsArrayType = isTS ? ': HTMLElement[]' : '';

    switch (id) {
      case "blur-text":
        return vanillaBoilerplateLocal(
          `<h1 class="blur-text">BLUR IN TEXT</h1>`,
          `.blur-text { font-size: 5rem; font-weight: 800; filter: blur(10px); opacity: 0; transition: all 0.8s ease-out; cursor: pointer; }
           .blur-text.animate { filter: blur(0px); opacity: 1; }`,
          `const el${tsTypeChars} = document.querySelector('.blur-text');
           const run = () => {
             el.classList.remove('animate');
             void el.offsetWidth; // Force reflow
             el.classList.add('animate');
           };
           el.addEventListener('click', run);
           setTimeout(run, 100);`
        );
      case "gradual-spacing":
        return vanillaBoilerplateLocal(
          `<div class="gradual-spacing" id="text">GRADUAL SPACING</div>`,
          `.gradual-spacing { font-size: 5rem; font-weight: 800; display: flex; cursor: pointer; }
           .char { opacity: 0; letter-spacing: 1em; transition: all 1.5s ease-out; }
           .char.animate { opacity: 1; letter-spacing: 0.1em; }`,
          `const el${tsTypeChars} = document.getElementById('text');
           const chars${tsArrayType} = el.innerText.split('').map((c, i) => {
             const span = document.createElement('span');
             span.className = 'char';
             span.innerText = c === ' ' ? '\\u00A0' : c;
             span.style.transitionDelay = (i * 0.05) + 's';
             return span;
           });
           el.innerHTML = '';
           chars.forEach(c => el.appendChild(c));
           const run = () => {
             chars.forEach(c => c.classList.remove('animate'));
             void el.offsetWidth;
             chars.forEach(c => c.classList.add('animate'));
           };
           el.addEventListener('click', run);
           setTimeout(run, 100);`
        );
      case "letter-pull-up":
        return vanillaBoilerplateLocal(
          `<div class="letter-pull-up" id="text">LETTER PULL UP</div>`,
          `.letter-pull-up { font-size: 5rem; font-weight: 800; display: flex; overflow: hidden; cursor: pointer; }
           .char { display: inline-block; transform: translateY(100%); opacity: 0; transition: all 0.6s ease-out; }
           .char.animate { transform: translateY(0); opacity: 1; }`,
          `const el${tsTypeChars} = document.getElementById('text');
           const chars${tsArrayType} = el.innerText.split('').map((c, i) => {
             const span = document.createElement('span');
             span.className = 'char';
             span.innerText = c === ' ' ? '\\u00A0' : c;
             span.style.transitionDelay = (i * 0.05) + 's';
             return span;
           });
           el.innerHTML = '';
           chars.forEach(c => el.appendChild(c));
           const run = () => {
             chars.forEach(c => c.classList.remove('animate'));
             void el.offsetWidth;
             chars.forEach(c => c.classList.add('animate'));
           };
           el.addEventListener('click', run);
           setTimeout(run, 100);`
        );
      case "multi-direction-slide":
        return vanillaBoilerplateLocal(
          `<div class="multi-direction" id="text">MULTI DIRECTION</div>`,
          `.multi-direction { font-size: 5rem; font-weight: 800; display: flex; overflow: hidden; cursor: pointer; }
           .char { display: inline-block; opacity: 0; transition: all 0.8s ease-out; }
           .char.animate { opacity: 1; transform: translate(0, 0) !important; }`,
          `const el${tsTypeChars} = document.getElementById('text');
           const dirs = ['translateY(-100px)', 'translateY(100px)', 'translateX(-100px)', 'translateX(100px)'];
           const chars${tsArrayType} = el.innerText.split('').map((c, i) => {
             const span = document.createElement('span');
             span.className = 'char';
             span.innerText = c === ' ' ? '\\u00A0' : c;
             span.style.transform = dirs[i % 4];
             span.style.transitionDelay = (i * 0.05) + 's';
             return span;
           });
           el.innerHTML = '';
           chars.forEach(c => el.appendChild(c));
           const run = () => {
             chars.forEach(c => c.classList.remove('animate'));
             void el.offsetWidth;
             chars.forEach(c => c.classList.add('animate'));
           };
           el.addEventListener('click', run);
           setTimeout(run, 100);`
        );
      case "word-pull-up":
        return vanillaBoilerplateLocal(
          `<div class="word-pull-up" id="text">WORD PULL UP</div>`,
          `.word-pull-up { font-size: 5rem; font-weight: 800; display: flex; overflow: hidden; gap: 0.5em; cursor: pointer; }
           .word { display: inline-block; transform: translateY(100%); opacity: 0; transition: all 0.8s ease-out; }
           .word.animate { transform: translateY(0); opacity: 1; }`,
          `const el${tsTypeChars} = document.getElementById('text');
           const words${tsArrayType} = el.innerText.split(' ').map((w, i) => {
             const span = document.createElement('span');
             span.className = 'word';
             span.innerText = w;
             span.style.transitionDelay = (i * 0.2) + 's';
             return span;
           });
           el.innerHTML = '';
           words.forEach(w => el.appendChild(w));
           const run = () => {
             words.forEach(w => w.classList.remove('animate'));
             void el.offsetWidth;
             words.forEach(w => w.classList.add('animate'));
           };
           el.addEventListener('click', run);
           setTimeout(run, 100);`
        );
      case "wavy-text":
        return vanillaBoilerplateLocal(
          `<div class="wavy-text" id="text">WAVY TEXT</div>`,
          `.wavy-text { font-size: 5rem; font-weight: 800; display: flex; cursor: pointer; }
           .char { display: inline-block; }
           .char.animate { animation: wave 1.5s ease-in-out infinite; }
           @keyframes wave { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }`,
          `const el${tsTypeChars} = document.getElementById('text');
           const chars${tsArrayType} = el.innerText.split('').map((c, i) => {
             const span = document.createElement('span');
             span.className = 'char animate';
             span.innerText = c === ' ' ? '\\u00A0' : c;
             span.style.animationDelay = (i * 0.1) + 's';
             return span;
           });
           el.innerHTML = '';
           chars.forEach(c => el.appendChild(c));
           el.addEventListener('click', () => {
             chars.forEach(c => c.classList.remove('animate'));
             void el.offsetWidth;
             chars.forEach(c => c.classList.add('animate'));
           });`
        );
      case "scale-letter":
        return vanillaBoilerplateLocal(
          `<div class="scale-letter" id="text">SCALE LETTER</div>`,
          `.scale-letter { font-size: 5rem; font-weight: 800; display: flex; cursor: pointer; }
           .char { display: inline-block; scale: 0; opacity: 0; transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
           .char.animate { scale: 1; opacity: 1; }`,
          `const el${tsTypeChars} = document.getElementById('text');
           const chars${tsArrayType} = el.innerText.split('').map((c, i) => {
             const span = document.createElement('span');
             span.className = 'char';
             span.innerText = c === ' ' ? '\\u00A0' : c;
             span.style.transitionDelay = (i * 0.05) + 's';
             return span;
           });
           el.innerHTML = '';
           chars.forEach(c => el.appendChild(c));
           const run = () => {
             chars.forEach(c => c.classList.remove('animate'));
             void el.offsetWidth;
             chars.forEach(c => c.classList.add('animate'));
           };
           el.addEventListener('click', run);
           setTimeout(run, 100);`
        );
      case "separate-away":
        return vanillaBoilerplateLocal(
          `<div class="separate-away" id="text">SEPARATE AWAY</div>`,
          `.separate-away { font-size: 5rem; font-weight: 800; display: flex; cursor: pointer; }
           .char { display: inline-block; opacity: 0; transition: all 0.8s ease-out; }
           .char.animate { opacity: 1; transform: translateX(0) !important; }`,
          `const el${tsTypeChars} = document.getElementById('text');
           const chars${tsArrayType} = el.innerText.split('').map((c, i, arr) => {
             const span = document.createElement('span');
             span.className = 'char';
             span.innerText = c === ' ' ? '\\u00A0' : c;
             const mid = arr.length / 2;
             span.style.transform = 'translateX(' + ((i - mid) * 20) + 'px)';
             span.style.transitionDelay = '0.2s';
             return span;
           });
           el.innerHTML = '';
           chars.forEach(c => el.appendChild(c));
           const run = () => {
             chars.forEach(c => c.classList.remove('animate'));
             void el.offsetWidth;
             chars.forEach(c => c.classList.add('animate'));
           };
           el.addEventListener('click', run);
           setTimeout(run, 100);`
        );
      case "dock-text":
        return vanillaBoilerplateLocal(
          `<h1 class="dock-text">DOCK TEXT</h1>`,
          `.dock-text { font-size: 5rem; font-weight: 800; scale: 0.8; opacity: 0; transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); cursor: pointer; }
           .dock-text.animate { scale: 1; opacity: 1; }`,
          `const el${tsTypeChars} = document.querySelector('.dock-text');
           const run = () => {
             el.classList.remove('animate');
             void el.offsetWidth;
             el.classList.add('animate');
           };
           el.addEventListener('click', run);
           setTimeout(run, 100);`
        );
      case "fade-text":
        return vanillaBoilerplateLocal(
          `<h1 class="fade-text">FADE TEXT</h1>`,
          `.fade-text { font-size: 5rem; font-weight: 800; opacity: 0; transition: opacity 1.5s ease-in; cursor: pointer; }
           .fade-text.animate { opacity: 1; }`,
          `const el${tsTypeChars} = document.querySelector('.fade-text');
           const run = () => {
             el.classList.remove('animate');
             void el.offsetWidth;
             el.classList.add('animate');
           };
           el.addEventListener('click', run);
           setTimeout(run, 100);`
        );
      case "font-weight":
        return vanillaBoilerplateLocal(
          `<h1 class="font-weight-text">VARIABLE WEIGHT</h1>`,
          `.font-weight-text { font-size: 5rem; font-weight: 400; transition: font-weight 1s ease-in-out; cursor: pointer; }`,
          `const el${tsTypeChars} = document.querySelector('.font-weight-text');
           const run = () => {
             el.style.fontWeight = el.style.fontWeight === '900' ? '400' : '900';
           };
           el.addEventListener('click', run);
           setInterval(run, 1000);`
        );
      case "liquid-glass":
        return vanillaBoilerplateLocal(
          `<div class="liquid-glass"></div>`,
          `.liquid-glass { width: 300px; height: 300px; border-radius: 20px; backdrop-filter: blur(20px); background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); position: relative; overflow: hidden; }
           .liquid-glass::before { content: ''; position: absolute; top: -50%; left: -50%; width: 100%; height: 100%; background: radial-gradient(circle, rgba(0, 255, 0, 0.2) 0%, transparent 70%); animation: drift 5s infinite linear; }
           @keyframes drift { from { transform: translate(0, 0); } to { transform: translate(20px, -20px); } }`,
          ``
        );
      case "noise":
        return vanillaBoilerplateLocal(
          `<div class="noise-container"><div class="noise"></div><h1>NOISE</h1></div>`,
          `.noise-container { width: 300px; height: 300px; background: #0a0a0a; border-radius: 20px; position: relative; overflow: hidden; display: flex; center; }
           .noise { position: absolute; inset: 0; opacity: 0.05; pointer-events: none; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); }`,
          ``
        );
      case "blur-vignette":
        return vanillaBoilerplateLocal(
          `<div class="blur-vignette"><h1>VIGNETTE</h1></div>`,
          `.blur-vignette { width: 300px; height: 300px; border-radius: 20px; position: relative; overflow: hidden; background: #0a0a0a; display: flex; center; }
           .blur-vignette::after { content: ''; position: absolute; inset: 0; backdrop-filter: blur(10px); mask-image: radial-gradient(circle, transparent 30%, black 100%); }`,
          ``
        );
      case "liquid-gradient":
        return vanillaBoilerplateLocal(
          `<div class="liquid-gradient"></div>`,
          `.liquid-gradient { width: 300px; height: 300px; border-radius: 20px; background: #000; overflow: hidden; position: relative; }
           .liquid-gradient::before { content: ''; position: absolute; inset: 0; background: radial-gradient(at 0% 0%, #00FF00 0%, transparent 50%); animation: move 10s infinite alternate; opacity: 0.3; }
           @keyframes move { 0% { transform: scale(1); } 100% { transform: scale(1.5); } }`,
          ``
        );
      case "spotlight-cards":
        return vanillaBoilerplateLocal(
          `<div class="spotlight-card">SPOTLIGHT</div>`,
          `.spotlight-card { width: 300px; height: 300px; background: #111; border-radius: 20px; border: 1px solid #222; position: relative; overflow: hidden; display: flex; center; cursor: none; }
           .spotlight { position: absolute; inset: 0; background: radial-gradient(600px circle at var(--x) var(--y), rgba(0, 255, 0, 0.1), transparent 40%); opacity: 0; transition: opacity 0.3s; }
           .spotlight-card:hover .spotlight { opacity: 1; }`,
          `const card${tsTypeChars} = document.querySelector('.spotlight-card');
           const light = document.createElement('div');
           light.className = 'spotlight';
           card.appendChild(light);
           card.addEventListener('mousemove', (e) => {
             const rect = card.getBoundingClientRect();
             card.style.setProperty('--x', (e.clientX - rect.left) + 'px');
             card.style.setProperty('--y', (e.clientY - rect.top) + 'px');
           });`
        );
      case "image-reveal":
        return vanillaBoilerplateLocal(
          `<div class="reveal-container"><div class="reveal-content">REVEALED</div><div class="reveal-mask">HOVER</div></div>`,
          `.reveal-container { width: 300px; height: 300px; border-radius: 20px; background: #111; position: relative; overflow: hidden; cursor: pointer; }
           .reveal-content { position: absolute; inset: 0; background: #00FF0022; display: flex; center; color: #00FF00; font-weight: 900; }
           .reveal-mask { position: absolute; inset: 0; background: #111; display: flex; center; transition: transform 0.5s ease; }
           .reveal-container:hover .reveal-mask { transform: translateX(100%); }`,
          ``
        );
      case "blocks":
        return vanillaBoilerplateLocal(
          `<div class="blocks-grid"></div>`,
          `.blocks-grid { width: 300px; height: 300px; background: #000; display: grid; grid-template-columns: repeat(4, 1fr); border-radius: 20px; overflow: hidden; border: 1px solid #222; }
           .block { background: #111; border: 0.5px solid #222; transition: background 0.3s; }
           .block:hover { background: #00FF0022; }`,
          `const grid${tsTypeChars} = document.querySelector('.blocks-grid');
           for(let i=0; i<16; i++) {
             const b = document.createElement('div');
             b.className = 'block';
             grid.appendChild(b);
           }`
        );
      case "animated-beam":
        return vanillaBoilerplateLocal(
          `<div class="beam-container"><div class="beam"></div></div>`,
          `.beam-container { width: 300px; height: 300px; background: #0a0a0a; border-radius: 20px; border: 1px solid #222; position: relative; overflow: hidden; }
           .beam { position: absolute; height: 2px; width: 100px; background: linear-gradient(90deg, transparent, #00FF00, transparent); transform: rotate(-45deg); animation: beam-move 2s infinite linear; top: -100px; left: -100px; }
           @keyframes beam-move { from { transform: translate(0, 0) rotate(-45deg); } to { transform: translate(400px, 400px) rotate(-45deg); } }`,
          ``
        );
      default:
        return vanillaBoilerplateLocal(`<h1>Coming Soon</h1>`, ``, ``);
    }
  }

  // React/Tailwind/TS or JS Version
  const reactImports = isTS ?
    `import React, { useState, useEffect, useRef } from 'react';\nimport { motion, AnimatePresence } from 'framer-motion';\nimport { Cloud, CloudSun, CloudRain, Sun, MapPin, CloudSunRain } from 'lucide-react';` :
    `import React, { useState, useEffect, useRef } from 'react';\nimport { motion, AnimatePresence } from 'framer-motion';\nimport { Cloud, CloudSun, CloudRain, Sun, MapPin, CloudSunRain } from 'lucide-react';`;

  const componentHeader = isTS ?
    `export const Component: React.FC = () => {` :
    `export const Component = () => {`;

  const reactOutput = (content: string) => `
${reactImports}

${componentHeader}
  const [key, setKey] = useState(0);
  const reset = () => setKey(prev => prev + 1);

  return (
    <div className="flex items-center justify-center min-h-[400px] bg-black cursor-pointer" onClick={reset}>
      <div key={key} className="w-full flex justify-center">
        ${content}
      </div>
    </div>
  );
};`;

  switch (id) {
    case "blur-text":
      return reactOutput(`
        <motion.h1
          initial={{ filter: "blur(10px)", opacity: 0 }}
          animate={{ filter: "blur(0px)", opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-6xl md:text-8xl font-black text-white tracking-tighter text-center"
        >
          BLUR IN TEXT
        </motion.h1>`);
    case "dock-text":
      return reactOutput(`
        <motion.h1
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 10 }}
          className="text-6xl md:text-8xl font-black text-brand-green tracking-tighter"
        >
          DOCK TEXT
        </motion.h1>`);
    case "fade-text":
      return reactOutput(`
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeIn" }}
          className="text-6xl md:text-8xl font-black text-white italic"
        >
          FADE TEXT
        </motion.h1>`);
    case "font-weight":
      return reactOutput(`
        <motion.h1
          animate={{ fontWeight: [400, 900, 400] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter"
        >
          VARIABLE WEIGHT
        </motion.h1>`);
    case "gradual-spacing":
      return reactOutput(`
        <div className="flex overflow-hidden">
          {"GRADUAL SPACING".split("").map((char, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, letterSpacing: "1em" }}
              animate={{ opacity: 1, letterSpacing: "0.1em" }}
              transition={{ duration: 1.5, delay: i * 0.05, ease: "easeOut" }}
              className="text-6xl md:text-8xl font-black text-white tracking-tighter"
            >
              {char === " " ? "\\u00A0" : char}
            </motion.span>
          ))}
        </div>`);
    case "letter-pull-up":
      return reactOutput(`
        <div className="flex overflow-hidden">
          {"LETTER PULL UP".split("").map((char, i) => (
            <motion.span
              key={i}
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: i * 0.05, ease: "easeOut" }}
              className="inline-block text-6xl md:text-8xl font-black text-white tracking-tighter"
            >
              {char === " " ? "\\u00A0" : char}
            </motion.span>
          ))}
        </div>`);
    case "multi-direction-slide":
      return reactOutput(`
        <div className="flex overflow-hidden">
          {"MULTI DIRECTION".split("").map((char, i) => {
            const dirs = [{ y: -100 }, { y: 100 }, { x: -100 }, { x: 100 }];
            return (
              <motion.span
                key={i}
                initial={{ ...dirs[i % 4], opacity: 0 }}
                animate={{ x: 0, y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: i * 0.05, ease: "easeOut" }}
                className="inline-block text-6xl md:text-8xl font-black text-white tracking-tighter"
              >
                {char === " " ? "\\u00A0" : char}
              </motion.span>
            );
          })}
        </div>`);
    case "scale-letter":
      return reactOutput(`
        <div className="flex">
          {"SCALE LETTER".split("").map((char, i) => (
            <motion.span
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: i * 0.05, type: "spring", stiffness: 200 }}
              className="inline-block text-6xl md:text-8xl font-black text-brand-green tracking-tighter"
            >
              {char === " " ? "\\u00A0" : char}
            </motion.span>
          ))}
        </div>`);
    case "separate-away":
      return reactOutput(`
        <div className="flex">
          {"SEPARATE AWAY".split("").map((char, i, arr) => {
            const mid = arr.length / 2;
            const offset = (i - mid) * 20;
            return (
              <motion.span
                key={i}
                initial={{ x: offset, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                className="inline-block text-6xl md:text-8xl font-black text-white tracking-tighter"
              >
                {char === " " ? "\\u00A0" : char}
              </motion.span>
            );
          })}
        </div>`);
    case "wavy-text":
      return reactOutput(`
        <div className="flex">
          {"WAVY TEXT".split("").map((char, i) => (
            <motion.span
              key={i}
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1, ease: "easeInOut" }}
              className="inline-block text-6xl md:text-8xl font-black text-white tracking-tighter"
            >
              {char === " " ? "\\u00A0" : char}
            </motion.span>
          ))}
        </div>`);
    case "word-pull-up":
      return reactOutput(`
        <div className="flex overflow-hidden gap-6">
          {"WORD PULL UP".split(" ").map((word, i) => (
            <motion.span
              key={i}
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: i * 0.2, ease: "easeOut" }}
              className="inline-block text-6xl md:text-8xl font-black text-white tracking-tighter"
            >
              {word}
            </motion.span>
          ))}
        </div>`);
    case "liquid-glass":
      return reactOutput(`
        <div className="p-8 relative z-30 w-full max-w-xl gap-8 py-16 rounded-xl overflow-hidden" style={{ background: 'url("https://images.unsplash.com/photo-1590867286251-8e26d9f255c0?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D") center / cover no-repeat' }}>
          <div className="grid w-full grid-cols-2 gap-4 mx-auto">
            <div className="col-span-2 p-6 text-white backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl relative overflow-hidden">
               <div className="flex justify-between relative z-30 text-sm font-medium">
                  {/* Hourly slots... */}
                  <div className="flex flex-col items-center gap-2"><span>16:00</span><Cloud className="h-6 w-6 fill-white" /><span>+18°</span></div>
                  <div className="flex flex-col items-center gap-2"><span>17:00</span><Cloud className="h-6 w-6 fill-white" /><span>+18°</span></div>
                  <div className="flex flex-col items-center gap-2"><span>18:00</span><CloudRain className="h-6 w-6" /><span>+16°</span></div>
                  <div className="flex flex-col items-center gap-2"><span>19:00</span><CloudRain className="h-6 w-6" /><span>+14°</span></div>
                  <div className="flex flex-col items-center gap-2"><span>20:00</span><CloudSun className="h-6 w-6 fill-white" /><span>+15°</span></div>
               </div>
            </div>
            <div className="p-6 text-white backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl relative overflow-hidden">
              <div className="text-4xl font-bold">+18°C</div>
              <div className="text-sm opacity-70">Cloudy</div>
            </div>
            <div className="p-6 text-white backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl relative overflow-hidden transition-all hover:scale-[1.02] hover:-translate-y-1 hover:bg-white/20">
              <div className="text-4xl font-bold">17:32</div>
              <div className="text-sm opacity-70">Sun, Nov 19</div>
              <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-black/20 px-2 py-0.5 text-xs">Surat</div>
            </div>
          </div>
        </div>
      `);
    case "noise":
      return reactOutput(`
         const [opacity, setOpacity] = useState(0.05);
 
         return (
           <div className="relative border border-white/10 rounded-xl w-full max-w-2xl overflow-hidden bg-neutral-950">
             <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
               <label className="text-[10px] font-bold uppercase tracking-wider text-white/60">Noise:</label>
               <input type="range" min="0" max="0.2" step="0.01" value={opacity} onChange={(e) => setOpacity(parseFloat(e.target.value))} className="w-20 accent-cyan-400" />
               <span className="text-[10px] font-mono text-cyan-400 w-8">{opacity.toFixed(2)}</span>
             </div>
             <div className="absolute inset-0 z-10 pointer-events-none mix-blend-overlay" style={{ opacity, backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"n\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.65\" numOctaves=\"3\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23n)\"/%3E%3C/svg%3E')" }} />
             <div className="h-[300px] flex flex-col items-center justify-center text-white relative z-0">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
                <h1 className="text-3xl font-display font-bold text-center tracking-tight leading-tight uppercase">
                  Noise Overlay<br/>
                  <span className="text-cyan-400">Effect</span>
                </h1>
             </div>
           </div>
         );`);
    case "blur-vignette":
      return reactOutput(`
        <div className="w-full max-w-2xl mx-auto flex gap-4 justify-center p-4 bg-neutral-900/50 rounded-2xl border border-white/5">
          <BlurVignette radius="16px" transitionLength="100px" blur="12px" className="flex-1 aspect-square">
            <img src="https://images.unsplash.com/photo-1614728263952-84ea256f9679?auto=format&fit=crop" className="w-full h-full object-cover" />
            <BlurVignetteArticle classname="absolute inset-x-2 bottom-2 p-4 border border-white/10 rounded-xl bg-black/20 backdrop-blur-md text-white">
                <h3 className="text-lg font-bold">Cosmos</h3>
                <p className="text-xs text-white/60 line-clamp-2">Exploring cosmic patterns.</p>
            </BlurVignetteArticle>
          </BlurVignette>
        </div>`);
    case "liquid-gradient":
      return reactOutput(`
         <div className="w-80 h-80 rounded-[2.5rem] overflow-hidden border border-white/10 relative bg-neutral-950">
           <motion.div
             animate={{
               background: [
                 "radial-gradient(at 0% 0%, #ff0080 0px, transparent 50%)",
                 "radial-gradient(at 100% 100%, #ff0080 0px, transparent 50%)",
                 "radial-gradient(at 0% 100%, #ff0080 0px, transparent 50%)",
                 "radial-gradient(at 0% 0%, #ff0080 0px, transparent 50%)",
               ]
             }}
             transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
             className="absolute inset-0 opacity-40"
           />
         </div>`);
    case "spotlight-cards":
      return reactOutput(`
         const containerRef = useRef<HTMLDivElement>(null);
         const scrollRef = useRef<HTMLDivElement>(null);
         const overlayScrollRef = useRef<HTMLDivElement>(null);
         const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
         const [isHovered, setIsHovered] = useState(false);
 
         const handleMouseMove = (e: React.MouseEvent) => {
             if (!containerRef.current) return;
             const rect = containerRef.current.getBoundingClientRect();
             setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
         };
         
         const handleScroll = () => {
             if (scrollRef.current && overlayScrollRef.current) overlayScrollRef.current.scrollLeft = scrollRef.current.scrollLeft;
         };
         const scrollLeft = () => scrollRef.current?.scrollBy({ left: -350, behavior: "smooth" });
         const scrollRight = () => scrollRef.current?.scrollBy({ left: 350, behavior: "smooth" });
 
         const cards = [
             { title: "Performance", icon: Zap, color: "#10b981", hex: "rgba(16, 185, 129, 0.4)", border: "rgba(16, 185, 129, 0.8)", bg: "rgba(16, 185, 129, 0.1)" },
             { title: "Design", icon: Sparkles, color: "#6366f1", hex: "rgba(99, 102, 241, 0.4)", border: "rgba(99, 102, 241, 0.8)", bg: "rgba(99, 102, 241, 0.1)" },
             { title: "Premium", icon: Crown, color: "#f59e0b", hex: "rgba(245, 158, 11, 0.4)", border: "rgba(245, 158, 11, 0.8)", bg: "rgba(245, 158, 11, 0.1)" }
         ];

         return (
           <div 
               ref={containerRef}
               onMouseMove={handleMouseMove}
               onMouseEnter={() => setIsHovered(true)}
               onMouseLeave={() => setIsHovered(false)}
               className="w-full max-w-5xl relative group"
           >
               <button onClick={scrollLeft} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-30 p-3 bg-neutral-900/80 border border-white/10 rounded-full text-white/50 hover:text-white hover:bg-neutral-800 transition-colors backdrop-blur-md opacity-0 group-hover:opacity-100 shadow-xl"><ChevronLeft size={24} /></button>
               <button onClick={scrollRight} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-30 p-3 bg-neutral-900/80 border border-white/10 rounded-full text-white/50 hover:text-white hover:bg-neutral-800 transition-colors backdrop-blur-md opacity-0 group-hover:opacity-100 shadow-xl"><ChevronRight size={24} /></button>
               
               <div ref={scrollRef} onScroll={handleScroll} className="flex gap-6 p-6 overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden scroll-smooth">
                   {cards.map((card, i) => (
                       <div key={i} className="relative flex-shrink-0 w-[calc(100vw-3rem)] sm:w-[350px] snap-center p-8 rounded-[2.5rem] bg-neutral-900 border border-white/5 overflow-hidden backdrop-blur-sm transition-all duration-400 ease-out">
                           <div className="relative z-20 flex flex-col h-full">
                               <div className="flex justify-between items-start mb-6">
                                   <div className="w-12 h-12 rounded-2xl flex items-center justify-center border border-white/10" style={{ backgroundColor: card.bg }}>
                                        <card.icon size={24} style={{ color: card.color }} />
                                   </div>
                                   <span className="text-xs font-black uppercase tracking-[0.2em] text-white/40">UILAYOUT</span>
                               </div>
                               <h3 className="text-3xl font-black mb-3 text-white tracking-tight">{card.title}</h3>
                               <p className="text-sm text-white/50 mb-6 font-medium">Premium interactive component.</p>
                           </div>
                       </div>
                   ))}
               </div>
               
               {/* Global Overlay */}
               <div className="absolute inset-0 pointer-events-none transition-opacity duration-500 z-10" style={{ opacity: isHovered ? 1 : 0, WebkitMaskImage: \`radial-gradient(400px circle at \${mousePos.x}px \${mousePos.y}px, black, transparent)\`, maskImage: \`radial-gradient(400px circle at \${mousePos.x}px \${mousePos.y}px, black, transparent)\` }}>
                   <div ref={overlayScrollRef} className="flex gap-6 p-6 overflow-x-hidden w-full h-full">
                       {cards.map((card, i) => (
                           <div key={\`glow-\${i}\`} className={\`flex-shrink-0 w-[calc(100vw-3rem)] sm:w-[350px] rounded-[2.5rem] relative transition-all duration-400 ease-out \${hoveredIndex === i ? 'scale-[1.03] -translate-y-2' : ''}\`} style={{ border: \`2px solid \${card.border}\`, boxShadow: \`inset 0 0 20px \${card.hex}, 0 0 20px \${card.hex}\` }}>
                               <div className="absolute inset-0 rounded-[2.5rem] opacity-30 blur-2xl mix-blend-screen transition-colors duration-400 w-full h-full" style={{ backgroundColor: hoveredIndex === i ? card.border : card.hex }} />
                           </div>
                       ))}
                   </div>
               </div>
           </div>
         );`);
    case "image-reveal":
      return reactOutput(`
        <div className="w-80 h-80 rounded-[2.5rem] bg-neutral-900 border border-white/10 relative overflow-hidden group">
          <motion.div
            initial={{ clipPath: "polygon(0 0, 0 0, 0 100%, 0% 100%)" }}
            whileHover={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 bg-rose-500/20 flex items-center justify-center z-10"
          >
            <div className="text-rose-500 font-display text-4xl font-black">REVEALED</div>
          </motion.div>
          <div className="flex justify-center items-center h-full text-white/20 font-bold uppercase">Hover Me</div>
        </div>`);
    case "blocks":
      return reactOutput(`
        <div className="w-80 h-80 rounded-[2.5rem] border border-white/10 overflow-hidden grid grid-cols-4 grid-rows-4 bg-neutral-950">
          {Array.from({ length: 16 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="border-[0.5px] border-white/5 hover:bg-violet-500/20 transition-colors"
            />
          ))}
        </div>`);
    case "animated-beam":
      return reactOutput(`
        <div className="w-80 h-80 rounded-[2.5rem] bg-neutral-900 border border-white/10 relative overflow-hidden">
          <motion.div
            animate={{ x: [-100, 400], y: [-100, 400] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute h-[2px] w-32 bg-gradient-to-r from-transparent via-brand-green to-transparent -rotate-45"
          />
        </div>`);
    default:
      return reactOutput(`
        <div className="text-white text-4xl font-black uppercase opacity-20">
          Coming Soon
        </div>`);
  }
};
