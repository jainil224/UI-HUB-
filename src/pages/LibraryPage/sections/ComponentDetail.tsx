const COMPONENT_CONFIG: Record<string, { props: { name: string; type: string; default: string; description: string }[] }> = {
    "blur-text": {
        props: [
            { name: "text", type: "string", default: '"BLUR IN TEXT"', description: "The text content to display with blur-in effect" },
            { name: "className", type: "string", default: '""', description: "Additional CSS classes to apply to the component" },
            { name: "delay", type: "number", default: "0", description: "Delay before animation starts in seconds" },
            { name: "duration", type: "number", default: "0.8", description: "Animation duration in seconds" }
        ]
    },
    "dock-text": {
        props: [
            { name: "text", type: "string", default: '"DOCK TEXT"', description: "Text content for the dock animation" },
            { name: "className", type: "string", default: '""', description: "Custom classes for the container" },
            { name: "duration", type: "number", default: "0.5", description: "Spring transition duration" },
            { name: "delay", type: "number", default: "0", description: "Start delay" }
        ]
    },
    "fade-text": {
        props: [
            { name: "text", type: "string", default: '"FADE TEXT"', description: "Content to fade in" },
            { name: "duration", type: "number", default: "1.5", description: "Fade duration" },
            { name: "className", type: "string", default: '""', description: "Custom styling classes" }
        ]
    },
    "font-weight": {
        props: [
            { name: "text", type: "string", default: '"VARIABLE WEIGHT"', description: "Text for weight animation" },
            { name: "duration", type: "number", default: "1", description: "Transition speed between weights" },
            { name: "weights", type: "number[]", default: "[400, 900]", description: "Range of weights to animate" }
        ]
    },
    "gradual-spacing": {
        props: [
            { name: "text", type: "string", default: '"GRADUAL SPACING"', description: "Text content to animate" },
            { name: "duration", type: "number", default: "1.5", description: "Animation speed per character" },
            { name: "delay", type: "number", default: "0.05", description: "Stagger delay between characters" }
        ]
    },
    "letter-pull-up": {
        props: [
            { name: "text", type: "string", default: '"LETTER PULL UP"', description: "Text content" },
            { name: "duration", type: "number", default: "0.6", description: "Pull up duration" },
            { name: "delay", type: "number", default: "0.05", description: "Stagger delay" }
        ]
    },
    "multi-direction-slide": {
        props: [
            { name: "text", type: "string", default: '"MULTI DIRECTION"', description: "Text content" },
            { name: "duration", type: "number", default: "0.8", description: "Slide duration" },
            { name: "delay", type: "number", default: "0.05", description: "Stagger delay" }
        ]
    },
    "scale-letter": {
        props: [
            { name: "text", type: "string", default: '"SCALE LETTER"', description: "Text content" },
            { name: "duration", type: "number", default: "0.5", description: "Scale animation duration" },
            { name: "delay", type: "number", default: "0.05", description: "Stagger delay" }
        ]
    },
    "separate-away": {
        props: [
            { name: "text", type: "string", default: '"SEPARATE AWAY"', description: "Text content" },
            { name: "duration", type: "number", default: "0.8", description: "Separation duration" },
            { name: "delay", type: "number", default: "0.2", description: "Initial delay" }
        ]
    },
    "wavy-text": {
        props: [
            { name: "text", type: "string", default: '"WAVY TEXT"', description: "Text content" },
            { name: "duration", type: "number", default: "1.5", description: "Wave loop duration" },
            { name: "delay", type: "number", default: "0.1", description: "Wave propagation delay" }
        ]
    },
    "word-pull-up": {
        props: [
            { name: "text", type: "string", default: '"WORD PULL UP"', description: "Text content" },
            { name: "duration", type: "number", default: "0.8", description: "Pull up duration per word" },
            { name: "delay", type: "number", default: "0.2", description: "Stagger delay between words" }
        ]
    }
};

const PropsTable = ({ props }: { props: { name: string; type: string; default: string; description: string }[] }) => (
    <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="border-b border-white/5 text-[10px] uppercase tracking-[0.2em] text-white/40">
                    <th className="py-6 px-4 font-bold">Prop</th>
                    <th className="py-6 px-4 font-bold">Type</th>
                    <th className="py-6 px-4 font-bold">Default</th>
                    <th className="py-6 px-4 font-bold">Description</th>
                </tr>
            </thead>
            <tbody className="text-sm">
                {props.map((p, i) => (
                    <tr key={i} className="border-b border-white/5 group hover:bg-white/[0.02] transition-colors">
                        <td className="py-6 px-4 font-mono">
                            <span className="px-2 py-1 rounded-md bg-white/5 text-brand-green border border-white/10">{p.name}</span>
                        </td>
                        <td className="py-6 px-4 font-mono">
                            <span className="px-2 py-1 rounded-md bg-white/5 text-blue-400 border border-white/10">{p.type}</span>
                        </td>
                        <td className="py-6 px-4 font-mono text-white/60">
                            <span className="px-2 py-1 rounded-md bg-white/5 text-white/40 border border-white/10">{p.default}</span>
                        </td>
                        <td className="py-6 px-4 text-white/60 leading-relaxed">{p.description}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const ComponentDetail = ({ item, onBack }: { item: any; onBack: () => void }) => {
    const [tab, setTab] = React.useState<'preview' | 'code'>('preview');
    const [copied, setCopied] = React.useState<string | null>(null);
    const [resetKey, setResetKey] = React.useState(0);

    // Dynamic states
    const [installMethod, setInstallMethod] = React.useState<'cli' | 'manual'>('cli');
    const [pkgManager, setPkgManager] = React.useState<'npm' | 'pnpm' | 'yarn' | 'bun'>('npm');
    const [lang, setLang] = React.useState<'js' | 'ts'>('ts');
    const [styling, setStyling] = React.useState<'tailwind' | 'css'>('tailwind');

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    const getInstallCommand = (mgr: string, method: string) => {
        if (method === 'cli') return `npx ui-hub add ${item.id}`;
        const cmd: Record<string, string> = {
            npm: 'npm install gsap @gsap/react framer-motion',
            pnpm: 'pnpm add gsap @gsap/react framer-motion',
            yarn: 'yarn add gsap @gsap/react framer-motion',
            bun: 'bun add gsap @gsap/react framer-motion'
        };
        return cmd[mgr];
    };

    const sourceCode = getComponentCode(item.id, { lang, styling });
    const usageCode = `// Usage for ${item.name}
<${item.name.replace(/\s+/g, '')} />`;
    const componentConfig = COMPONENT_CONFIG[item.id] || { props: [] };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col gap-8 pb-24"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-white/40 hover:text-brand-green transition-colors text-sm font-bold uppercase tracking-widest"
                >
                    <ChevronLeft size={16} />
                    Back to Library
                </button>
                <div className="flex gap-4">
                    <button
                        onClick={() => setResetKey(prev => prev + 1)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white transition-all text-sm font-bold uppercase tracking-widest group"
                    >
                        <RotateCcw key={resetKey} size={14} className={`${resetKey > 0 ? 'animate-spin-once' : ''} group-hover:text-brand-green transition-colors`} />
                        Reset
                    </button>
                </div>
            </div>

            <div className="flex flex-col">
                <h2 className="text-4xl md:text-8xl font-display uppercase tracking-tighter text-white mb-8">
                    {item.name}
                </h2>
                <div className="flex gap-4 mb-12">
                    <button
                        onClick={() => setTab('preview')}
                        className={`flex items-center gap-2 px-8 py-3 rounded-full text-sm font-bold uppercase tracking-widest transition-all ${tab === 'preview' ? 'bg-white/10 text-white border border-white/20' : 'text-white/40 hover:text-white'}`}
                    >
                        <Eye size={16} />
                        Preview
                    </button>
                    <button
                        onClick={() => setTab('code')}
                        className={`flex items-center gap-2 px-8 py-3 rounded-full text-sm font-bold uppercase tracking-widest transition-all ${tab === 'code' ? 'bg-white/10 text-white border border-white/20' : 'text-white/40 hover:text-white'}`}
                    >
                        <Code size={16} />
                        Code
                    </button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {tab === 'preview' ? (
                    <motion.div
                        key="preview-content"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-12"
                    >
                        <div className="aspect-video w-full glass rounded-[3rem] relative overflow-hidden flex items-center justify-center group bg-black/20 border border-white/5">
                            <div className="text-center w-full px-8">
                                <div className="flex justify-center">
                                    {(() => {
                                        const CompName = item.id.split('-').map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join('') + 'Text';
                                        const Comp = (Animations as any)[CompName] || (Animations as any)[item.id === 'font-weight' ? 'FontWeightText' : ''];
                                        return Comp ? <Comp key={`${item.id}-${resetKey}`} /> : <div className="text-6xl md:text-9xl font-display font-bold uppercase tracking-normal opacity-20">PREVIEW</div>;
                                    })()}
                                </div>
                            </div>
                        </div>

                        {/* Props Table */}
                        {componentConfig.props.length > 0 && (
                            <section className="space-y-8">
                                <h3 className="text-3xl font-display uppercase tracking-tight text-white px-2">Props</h3>
                                <div className="glass rounded-[2rem] border border-white/5 overflow-hidden bg-black/20 p-4">
                                    <PropsTable props={componentConfig.props} />
                                </div>
                            </section>
                        )}

                        <div className="flex items-center justify-between p-8 glass rounded-3xl border border-white/5 bg-black/20">
                            <div className="flex items-center gap-6">
                                <div className="w-12 h-12 rounded-full bg-brand-green/20 flex items-center justify-center text-brand-green">
                                    <Zap size={24} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-1">Component Prompt</p>
                                    <p className="text-base text-white/80 font-medium font-sans">Use this prompt to generate this component in your project.</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleCopy(item.prompt || `Prompt for ${item.name}`, 'prompt')}
                                className={`flex items-center gap-3 px-8 py-4 rounded-xl transition-all text-sm font-bold uppercase tracking-widest ${copied === 'prompt' ? 'bg-brand-green text-black' : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'}`}
                            >
                                {copied === 'prompt' ? <Check size={18} /> : <Copy size={18} />}
                                {copied === 'prompt' ? 'Copied!' : 'Copy Prompt'}
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="code-content"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-16"
                    >
                        {/* Install Section */}
                        <section>
                            <h3 className="text-3xl font-display uppercase tracking-tight text-white mb-8">Install</h3>
                            <div className="flex gap-4 mb-8">
                                <button
                                    onClick={() => setInstallMethod('cli')}
                                    className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest border transition-all ${installMethod === 'cli' ? 'bg-white/10 border-white/20 text-white' : 'border-white/5 text-white/40 hover:text-white'}`}
                                >CLI</button>
                                <button
                                    onClick={() => setInstallMethod('manual')}
                                    className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest border transition-all ${installMethod === 'manual' ? 'bg-white/10 border-white/20 text-white' : 'border-white/5 text-white/40 hover:text-white'}`}
                                >Manual</button>
                            </div>

                            <div className="glass rounded-3xl overflow-hidden border border-white/5 bg-black/20">
                                <AnimatePresence mode="wait">
                                    {installMethod === 'manual' && (
                                        <motion.div
                                            key="manual-tabs"
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="flex border-b border-white/5 bg-black/20"
                                        >
                                            {(['npm', 'pnpm', 'yarn', 'bun'] as const).map(m => (
                                                <button
                                                    key={m}
                                                    onClick={() => setPkgManager(m)}
                                                    className={`px-8 py-4 text-xs font-bold uppercase tracking-widest relative ${pkgManager === m ? 'text-white' : 'text-white/40 hover:text-white'}`}
                                                >
                                                    {m}
                                                    {pkgManager === m && (
                                                        <motion.div layoutId="pkg-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-green" />
                                                    )}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                <div className="p-8 flex items-center justify-between bg-black/40">
                                    <code className="text-brand-green font-mono text-sm">{getInstallCommand(pkgManager, installMethod)}</code>
                                    <button
                                        onClick={() => handleCopy(getInstallCommand(pkgManager, installMethod), 'install')}
                                        className={`flex items-center gap-2 p-3 rounded-xl transition-all ${copied === 'install' ? 'bg-brand-green/20 text-brand-green' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                                    >
                                        {copied === 'install' ? <Check size={18} /> : <Copy size={18} />}
                                    </button>
                                </div>
                            </div>
                        </section>

                        {/* Usage Section */}
                        <section>
                            <h3 className="text-3xl font-display uppercase tracking-tight text-white mb-2">Usage <span className="text-sm font-sans tracking-normal text-white/30 lowercase">(with your settings)</span></h3>
                            <div className="glass rounded-3xl overflow-hidden border border-white/5 relative bg-black/40">
                                <button
                                    onClick={() => handleCopy(usageCode, 'usage')}
                                    className={`absolute top-6 right-6 p-3 rounded-lg transition-all z-10 ${copied === 'usage' ? 'bg-brand-green/20 text-brand-green' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                                >
                                    {copied === 'usage' ? <Check size={18} /> : <Copy size={18} />}
                                </button>
                                <div className="p-8 leading-relaxed overflow-auto">
                                    <pre className="font-sans"><CodeHighlighter code={usageCode} /></pre>
                                </div>
                            </div>
                        </section>

                        {/* Code Section */}
                        <section>
                            <h3 className="text-3xl font-display uppercase tracking-tight text-white mb-8">Code</h3>
                            <div className="flex flex-wrap gap-4 mb-8">
                                <CustomSelect
                                    label="Language"
                                    value={lang}
                                    onChange={setLang}
                                    options={[
                                        { id: 'ts', name: 'TypeScript' },
                                        { id: 'js', name: 'JavaScript' }
                                    ]}
                                />

                                <CustomSelect
                                    label="Styling"
                                    value={styling}
                                    onChange={setStyling}
                                    options={[
                                        { id: 'tailwind', name: 'Tailwind' },
                                        { id: 'css', name: 'CSS' }
                                    ]}
                                />
                            </div>

                            <div className="glass rounded-[2.5rem] overflow-hidden border border-white/5 relative bg-black/40">
                                <button
                                    onClick={() => handleCopy(sourceCode, 'source')}
                                    className={`absolute top-6 right-6 p-3 rounded-lg transition-all z-10 ${copied === 'source' ? 'bg-brand-green/20 text-brand-green' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                                >
                                    {copied === 'source' ? <Check size={18} /> : <Copy size={18} />}
                                </button>
                                <div className="p-8 text-xs leading-relaxed max-h-[600px] overflow-auto">
                                    <pre className="font-sans"><CodeHighlighter code={sourceCode} /></pre>
                                </div>
                            </div>
                        </section>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ComponentDetail;

export default ComponentDetail;
