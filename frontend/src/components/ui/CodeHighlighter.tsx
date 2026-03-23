import React, { useMemo } from 'react';

const CodeHighlighter = React.memo(({ code }: { code: string }) => {
    const highlightedCode = useMemo(() => {
        const highlight = (text: string) => {
            // Escaping happens first
            const escaped = text
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");

            let highlighted = escaped;

            // 1. Strings (White) - Match everything between quotes
            highlighted = highlighted.replace(/(['"].*?['"])/g, '<span class="text-white">$1</span>');

            // 2. Keywords (Cyan/Teal) - Use a lookahead to ensure we aren't inside an HTML tag attribute
            const keywords = ['import', 'from', 'const', 'export', 'default', 'interface', 'type', 'return', 'function', 'if', 'new', 'as', 'void', 'React', 'class', 'extends', 'useEffect', 'useRef', 'useState', 'gsap', 'Role', 'Task', 'Behavior', 'Dynamics', 'Aesthetics', 'Framework', 'Core', 'Animation', 'Dependencies', 'Rules', 'Output'];

            keywords.forEach(kw => {
                const reg = new RegExp(`\\b${kw}\\b(?![^<]*>)`, 'g');
                highlighted = highlighted.replace(reg, `<span class="text-cyan-400">${kw}</span>`);
            });

            // 3. Props (Lime Green) - words followed by =
            highlighted = highlighted.replace(/(\b[a-zA-Z0-9_-]+\b)(?==)(?![^<]*>)/g, '<span class="text-lime-300">$1</span>');

            // 4. Tags and Components (Teal)
            highlighted = highlighted.replace(/(&lt;\/?[a-zA-Z0-9]+)(?![^<]*>)/g, '<span class="text-teal-400">$1</span>');
            highlighted = highlighted.replace(/(\/?&gt;)(?![^<]*>)/g, '<span class="text-teal-400">$1</span>');

            return highlighted;
        };

        return highlight(code);
    }, [code]);

    return (
        <div
            className="font-mono text-white/60"
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
        />
    );
});

export default CodeHighlighter;
