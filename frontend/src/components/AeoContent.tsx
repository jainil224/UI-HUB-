import React from 'react';
import type { AeoBlock, ComponentAeo } from '../seo/aeo';

/**
 * Renders the answer-first content built by `componentAeo()`.
 *
 * The markup mirrors `renderAeoHtml()` in src/seo/aeo.ts line for line, so the
 * prerendered HTML a crawler reads and the DOM a visitor gets contain the same
 * questions, answers and tables. `check:seo` asserts that parity, so if one
 * side changes the build fails instead of silently drifting.
 *
 * Nothing here is hidden or collapsed: no `display: none`, no off-screen
 * positioning, no `aria-hidden` content. Every answer is in the rendered HTML.
 */
/**
 * Blocks that belong directly under the H1. The answer and the scannable facts
 * are what an answer engine extracts, so they must be the first content on the
 * page rather than sitting below the live preview.
 */
const LEAD_KINDS = new Set(['quickAnswer', 'quickFacts']);

interface AeoSectionProps {
    block: AeoBlock;
    index: number;
    /** React permits `key` in a props type; declared because this repo has no @types/react. */
    key?: string;
}

function headingId(block: AeoBlock, index: number): string {
    return `aeo-${block.kind}-${index}`;
}

/**
 * `part="lead"` renders only the quick answer and quick facts.
 * `part="detail"` renders the technical table, requirements, how-to and FAQ.
 * `part="all"` (default) renders everything in order.
 */
export default function AeoContent({
    aeo,
    part = 'all',
}: {
    aeo?: ComponentAeo;
    part?: 'lead' | 'detail' | 'all';
}) {
    if (!aeo || aeo.blocks.length === 0) return null;

    const blocks = aeo.blocks.filter((block) => {
        if (part === 'all') return true;
        return part === 'lead' ? LEAD_KINDS.has(block.kind) : !LEAD_KINDS.has(block.kind);
    });

    if (blocks.length === 0) return null;

    return (
        <>
            {blocks.map((block, index) => (
                <AeoSection
                    key={`${part}-${block.kind}-${index}`}
                    block={block}
                    index={aeo.blocks.indexOf(block)}
                />
            ))}
        </>
    );
}

function AeoSection({ block, index }: AeoSectionProps) {
    const id = headingId(block, index);
    const headingClass = 'text-sm font-black uppercase tracking-widest text-neutral-500 mb-3';
    const bodyClass = 'text-sm leading-relaxed text-neutral-300';

    switch (block.kind) {
        case 'quickAnswer':
            return (
                <section aria-labelledby={id} className="space-y-3">
                    <h2 id={id} className={headingClass}>
                        {block.heading}
                    </h2>
                    <p className={`${bodyClass} text-neutral-200`}>{block.text}</p>
                </section>
            );

        case 'paragraphs':
            return (
                <section aria-labelledby={id} className="space-y-3">
                    <h2 id={id} className={headingClass}>
                        {block.heading}
                    </h2>
                    {block.items.map((item, itemIndex) => (
                        <p key={itemIndex} className={bodyClass}>
                            {item}
                        </p>
                    ))}
                </section>
            );

        case 'quickFacts':
            return (
                <section aria-labelledby={id}>
                    <h2 id={id} className={headingClass}>
                        {block.heading}
                    </h2>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                        {block.items.map((fact) => (
                            <div key={fact.label} className="flex gap-2 border-b border-white/5 py-1.5">
                                <dt className="text-neutral-500 shrink-0">{fact.label}</dt>
                                <dd className="text-neutral-300 text-right ml-auto">{fact.value}</dd>
                            </div>
                        ))}
                    </dl>
                </section>
            );

        case 'table':
            return (
                <section aria-labelledby={id}>
                    <h2 id={id} className={headingClass}>
                        {block.heading}
                    </h2>
                    <div className="overflow-x-auto rounded-xl border border-white/10">
                        <table className="w-full text-left text-xs">
                            <tbody>
                                {block.rows.map((row) => (
                                    <tr key={row.label} className="border-t border-white/5 first:border-t-0 align-top">
                                        <th scope="row" className="px-4 py-2 font-bold text-neutral-500 whitespace-nowrap">
                                            {row.label}
                                        </th>
                                        <td className="px-4 py-2 text-neutral-300">{row.value}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            );

        case 'list': {
            const ListTag = block.ordered ? 'ol' : 'ul';
            return (
                <section aria-labelledby={id}>
                    <h2 id={id} className={headingClass}>
                        {block.heading}
                    </h2>
                    <ListTag className={`${bodyClass} space-y-2 pl-5 list-decimal`}>
                        {block.items.map((item, itemIndex) => (
                            <li key={itemIndex}>{item}</li>
                        ))}
                    </ListTag>
                </section>
            );
        }

        case 'faq':
            return (
                <section aria-labelledby={id}>
                    <h2 id={id} className={headingClass}>
                        {block.heading}
                    </h2>
                    <div className="space-y-2">
                        {block.items.map((item) => (
                            <details
                                key={item.question}
                                className="rounded-xl border border-white/10 px-4 py-3 text-sm"
                            >
                                <summary className="cursor-pointer font-semibold text-neutral-200">
                                    {item.question}
                                </summary>
                                <p className={`mt-2 ${bodyClass}`}>{item.answer}</p>
                            </details>
                        ))}
                    </div>
                </section>
            );

        default:
            return null;
    }
}