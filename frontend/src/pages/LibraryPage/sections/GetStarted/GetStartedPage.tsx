import React from 'react';
import { GET_STARTED_PAGES, GetStartedDoc } from './getStartedData';

interface Props {
    page: GetStartedDoc;
}

function CodeBlock({ lang, label, content }: { lang?: string; label?: string; content: string }) {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = () => {
        const write = () => {
            if (navigator.clipboard && window.isSecureContext) {
                return navigator.clipboard.writeText(content);
            }
            const ta = document.createElement('textarea');
            ta.value = content;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            return Promise.resolve();
        };
        write().then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="mt-4 overflow-hidden rounded-lg border border-brand-green/20 bg-[#0a0f0a]">
            <div className="flex items-center justify-between px-4 py-2 border-b border-brand-green/20 bg-[#0d130d]">
                <span className="font-mono text-xs text-brand-green/70">
                    {label ? label : lang ? lang : 'code'}
                </span>
                <button
                    onClick={handleCopy}
                    className="font-mono text-xs text-brand-green hover:text-brand-yellow transition-colors"
                >
                    {copied ? '✓ Copied' : '[ Copy ]'}
                </button>
            </div>
            <pre className="overflow-x-auto p-4 text-sm leading-relaxed text-white/90">
                <code>{content}</code>
            </pre>
        </div>
    );
}

export default function GetStartedPage({ page }: Props) {
    return (
        <div className="flex flex-col gap-6">
            <div className="rounded-lg border border-brand-green/30 bg-brand-surface p-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <div className="font-mono text-xs uppercase tracking-widest text-brand-green">
                            Get Started / {page.icon} {page.title}
                        </div>
                        <h1 className="mt-2 text-3xl font-bold text-brand-yellow sm:text-4xl">
                            {page.icon} {page.title}
                        </h1>
                        <p className="mt-2 text-base text-white/70">{page.tagline}</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-5">
                {page.blocks.map((block, i) => (
                    <section
                        key={i}
                        className="rounded-lg border border-white/10 bg-brand-surface p-6"
                    >
                        <h2 className="font-mono text-lg text-white">
                            <span className="text-brand-green">{String(i + 1).padStart(2, '0')}.</span>{' '}
                            {block.heading}
                        </h2>

                        {block.body ? (
                            <p className="mt-3 text-base leading-relaxed text-white/75">
                                {block.body}
                            </p>
                        ) : null}

                        {block.bullets && block.bullets.length > 0 ? (
                            <ul className="mt-3 flex flex-col gap-2">
                                {block.bullets.map((b, j) => (
                                    <li key={j} className="flex gap-2 text-base text-white/75">
                                        <span className="text-brand-green">▸</span>
                                        <span>{b}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : null}

                        {block.code ? (
                            <CodeBlock
                                lang={block.code.lang}
                                label={block.code.label}
                                content={block.code.content}
                            />
                        ) : null}
                    </section>
                ))}
            </div>
        </div>
    );
}
