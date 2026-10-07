export interface ComponentCustomization {
    auto: boolean;
    level: number;
    speed: number;
    amp: number;
    lock?: boolean;
}

type Transform = (source: string, v: ComponentCustomization) => string;

const fmt = (n: number) => (Object.is(n, -0) && n === 0 ? "0" : String(n));

const hexaSphereTransform: Transform = (source, v) => {
    let next = source;
    const banner = `// Customized in the UI HUB preview: Wave=${fmt(v.level)} Speed=${fmt(v.speed)} Power=${fmt(v.amp)} Auto=${v.auto ? "on" : "off"}`;

    const defaultsLine = /const W = \{\s*auto: true,\s*level: -0\.2,\s*speed: 0\.42,\s*amp: 1\s*\};/;
    const nextLine = `const W = { auto: ${v.auto}, level: ${fmt(v.level)}, speed: ${fmt(v.speed)}, amp: ${fmt(v.amp)} };`;
    if (defaultsLine.test(next)) {
        next = next.replace(defaultsLine, `${banner}\n        ${nextLine}`);
    } else {
        next = `${banner}\n${next}`;
    }

    const waveInput = /\bdefaultValue="-0\.2"\s+className="hx-lvl flex-1 min-w-0 accent-sky-400"/;
    if (waveInput.test(next)) {
        next = next.replace(waveInput, `defaultValue="${fmt(v.level)}" className="hx-lvl flex-1 min-w-0 accent-sky-400"`);
    }
    const speedInput = /\bdefaultValue="0\.42"\s+className="hx-spd flex-1 min-w-0 accent-sky-400"/;
    if (speedInput.test(next)) {
        next = next.replace(speedInput, `defaultValue="${fmt(v.speed)}" className="hx-spd flex-1 min-w-0 accent-sky-400"`);
    }
    const ampInput = /\bdefaultValue="1"\s+className="hx-amp flex-1 min-w-0 accent-sky-400"/;
    if (ampInput.test(next)) {
        next = next.replace(ampInput, `defaultValue="${fmt(v.amp)}" className="hx-amp flex-1 min-w-0 accent-sky-400"`);
    }
    const autoText = /(>\s*Auto:\s*)(on|off)(\s*<\/button>)/;
    if (autoText.test(next)) {
        next = next.replace(autoText, `$1${v.auto ? "on" : "off"}$3`);
    }

    return next;
};

const TRANSFORMS: Record<string, Transform> = {
    "hexa-sphere": hexaSphereTransform,
};

/**
 * Rewrites a component's source so its tunable defaults reflect the values
 * the visitor customized live in the preview. Falls back to the original
 * source when the component has no registered transform or no customization.
 */
export const applyComponentCustomization = (
    source: string,
    componentId: string,
    values: ComponentCustomization | null | undefined
): string => {
    const transform = TRANSFORMS[componentId];
    if (!transform || !values) return source;
    return transform(source, values);
};