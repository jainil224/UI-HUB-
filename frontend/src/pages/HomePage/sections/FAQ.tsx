import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus } from 'lucide-react';

const faqs = [
    {
        question: 'What is UI HUB?',
        answer:
            'UI HUB is a curated library of production-ready UI components and AI prompts. Copy the code or prompt, paste it into your project or favorite AI tool, and ship pixel-perfect interfaces in seconds.',
    },
    {
        question: 'Are the components free to use?',
        answer:
            'Yes. All open components are free for personal and commercial projects. Pro and Elite plans unlock the full catalog, including exclusive 3D scenes and elite AI prompts.',
    },
    {
        question: 'Which frameworks are supported?',
        answer:
            'Components are built with React + TypeScript and styled with Tailwind CSS. Code snippets adapt easily to Next.js, Vite, or any React-based setup.',
    },
    {
        question: 'Which AI tools do the prompts work with?',
        answer:
            'Prompts are engineered to work with ChatGPT, Claude, Gemini, Cursor, Copilot, Lovable, and more. Each prompt includes model-specific tuning notes.',
    },
    {
        question: 'Can I contribute my own components?',
        answer:
            'Absolutely. Submit your component through the contribution form and our team will review it. Accepted contributors get featured on the homepage and free Pro access.',
    },
    {
        question: 'How do I get support if something breaks?',
        answer:
            'Join our Discord community for real-time help, or open an issue on GitHub. Pro members also get priority email support within 24 hours.',
    },
];

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section className="relative py-28 px-4 sm:px-6 overflow-hidden bg-brand-bg border-t-4 border-black">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16 flex flex-col items-center">
                    {/* Eyebrow Badge */}
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-6 border-2 border-white bg-brand-surface text-white rounded-md font-black text-xs uppercase tracking-widest brutal-shadow-black">
                        <span className="w-2.5 h-2.5 rounded-full bg-brand-blue border border-black" />
                        <span>GOT QUESTIONS</span>
                    </div>

                    <h2 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight text-white leading-none">
                        FREQUENTLY ASKED <span className="text-brand-blue">QUESTIONS</span>
                    </h2>
                    <p className="mt-4 text-neutral-400 font-medium text-base md:text-lg max-w-xl">
                        Everything you need to know about UI HUB. Can't find your answer? Join our Discord.
                    </p>
                </div>

                <div className="flex flex-col gap-4">
                    {faqs.map((faq, idx) => {
                        const isOpen = openIndex === idx;
                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: idx * 0.05 }}
                                className={`bg-brand-surface border-2 border-white rounded-lg transition-all duration-150 ${
                                    isOpen ? 'brutal-shadow-blue' : 'brutal-shadow-black hover:translate-x-0.5 hover:translate-y-0.5'
                                }`}
                            >
                                <button
                                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                                    className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                                >
                                    <span className="text-sm sm:text-base font-black uppercase tracking-wider text-white">
                                        {faq.question}
                                    </span>
                                    <motion.span
                                        animate={{ rotate: isOpen ? 45 : 0 }}
                                        transition={{ duration: 0.2 }}
                                        className={`shrink-0 w-8 h-8 rounded border-2 border-black flex items-center justify-center ${
                                            isOpen ? 'bg-brand-blue' : 'bg-brand-surface-alt'
                                        }`}
                                    >
                                        <Plus className="w-4 h-4 text-white" />
                                    </motion.span>
                                </button>

                                <AnimatePresence initial={false}>
                                    {isOpen && (
                                        <motion.div
                                            key="content"
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                                            className="overflow-hidden"
                                        >
                                            <p className="px-6 pb-6 text-neutral-400 text-sm sm:text-base leading-relaxed font-medium border-t-2 border-neutral-800 pt-5">
                                                {faq.answer}
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default FAQ;
