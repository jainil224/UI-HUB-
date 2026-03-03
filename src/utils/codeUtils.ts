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
      default:
        return vanillaBoilerplateLocal(`<h1>Coming Soon</h1>`, ``, ``);
    }
  }

  // React/Tailwind/TS or JS Version
  const reactImports = isTS ?
    `import React, { useState, useEffect } from 'react';\nimport { motion } from 'framer-motion';` :
    `import React, { useState, useEffect } from 'react';\nimport { motion } from 'framer-motion';`;

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
      <div key={key}>
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
    default:
      return reactOutput(`
        <div className="text-white text-4xl font-black uppercase opacity-20">
          Coming Soon
        </div>`);
  }
};
