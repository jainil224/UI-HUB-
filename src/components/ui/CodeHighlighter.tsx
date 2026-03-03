import React from 'react';

const CodeHighlighter = ({ code }: { code: string }) => {
    const highlight = (text: string) => {
        let highlighted = text;

        // Strings (White)
        highlighted = highlighted.replace(/(['"].*?['"])/g, '<span class="text-white">$1</span>');

        // Keywords (Cyan/Teal)
        const keywords = ['import', 'from', 'const', 'export', 'default', 'interface', 'type', 'return', 'function', 'if', 'new', 'as', 'void', 'React', 'class', 'extends', 'useEffect', 'useRef', 'useState', 'gsap'];
        keywords.forEach(kw => {
            const reg = new RegExp(`\\b${kw}\\b`, 'g');
            highlighted = highlighted.replace(reg, `<span class="text-cyan-400">${kw}</span>`);
        });

        // Props (Lime Green) - words followed by =
        highlighted = highlighted.replace(/(\b[a-zA-Z0-9_-]+\b)(?==)/g, '<span class="text-lime-300">$1</span>');

        // Tags and Components (Teal)
        // Match <Something or </Something
        highlighted = highlighted.replace(/(&lt;\/?[a-zA-Z0-9]+)/g, '<span class="text-teal-400">$1</span>');
        // Match closing symbols /> or >
        highlighted = highlighted.replace(/(\/?&gt;)/g, '<span class="text-teal-400">$1</span>');

        return highlighted;
    };

    const escapedCode = code
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    return (
        <div
            className="font-mono text-white/60"
            dangerouslySetInnerHTML={{ __html: highlight(escapedCode) }}
        />
    );
};

export default CodeHighlighter;
