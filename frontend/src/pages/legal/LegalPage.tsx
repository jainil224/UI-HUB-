import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, Home, ShieldCheck, FileText, CreditCard, Cookie } from 'lucide-react';

export interface LegalSection {
    id: string;
    heading: string;
    body: string[];
}

export const LegalSectionBlock: React.FC<{ section: LegalSection; index: number }> = ({ section, index }) => (
    <motion.div
        id={section.id}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.2) }}
        className="bg-brand-surface border-2 border-white rounded-lg p-6 sm:p-8 brutal-shadow-black"
    >
        <h2 className="flex items-center gap-3 text-lg sm:text-xl font-black uppercase tracking-wider text-white mb-4">
            <span className="flex items-center justify-center w-8 h-8 shrink-0 bg-brand-blue border-2 border-black rounded text-sm font-mono text-white">
                {String(index + 1).padStart(2, '0')}
            </span>
            {section.heading}
        </h2>
        <div className="flex flex-col gap-3">
            {section.body.map((paragraph, pIdx) => (
                <p key={pIdx} className="text-neutral-400 text-sm sm:text-base leading-relaxed font-medium">
                    {paragraph}
                </p>
            ))}
        </div>
    </motion.div>
);

export const LegalContent: React.FC<{ sections: LegalSection[] }> = ({ sections }) => (
    <>
        {sections.map((section, index) => (
            <LegalSectionBlock key={section.id} section={section} index={index} />
        ))}
    </>
);

interface LegalPageProps {
    eyebrow: string;
    title: string;
    subtitle: string;
    updatedLabel: string;
    updatedDate: string;
    children?: React.ReactNode;
}

const navLinks = [
    { to: '/privacy', label: 'Privacy Policy', icon: ShieldCheck },
    { to: '/terms', label: 'Terms & Conditions', icon: FileText },
    { to: '/payment-policy', label: 'Payment Policy', icon: CreditCard },
    { to: '/cookies', label: 'Cookie Settings', icon: Cookie },
];

const LegalPage: React.FC<LegalPageProps> = ({ eyebrow, title, subtitle, updatedLabel, updatedDate, children }) => {
    return (
        <section className="relative py-16 sm:py-24 px-4 sm:px-6 overflow-hidden bg-brand-bg">
            <div className="max-w-4xl mx-auto">
                <div className="text-left mb-12 flex flex-col items-start">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-6 border-2 border-white bg-brand-surface text-white rounded-md font-black text-xs uppercase tracking-widest brutal-shadow-blue"
                    >
                        <span className="w-2.5 h-2.5 rounded-full bg-brand-blue border border-black" />
                        <span>{eyebrow}</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.05 }}
                        className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-white leading-none"
                    >
                        {title.split(' ').map((word, i) => (
                            <span key={i} className={i % 2 === 1 ? 'text-brand-blue' : ''}>{word}{' '}</span>
                        ))}
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="mt-4 text-neutral-400 font-medium text-base md:text-lg max-w-2xl"
                    >
                        {subtitle}
                    </motion.p>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.15 }}
                        className="mt-3 inline-flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-widest text-neutral-500 border border-neutral-800 px-3 py-1.5 rounded"
                    >
                        <span className="w-2 h-2 rounded-full bg-brand-yellow border border-black" />
                        {updatedLabel}: {updatedDate}
                    </motion.p>
                </div>

                <div className="flex flex-wrap gap-2 mb-12">
                    {navLinks.map(({ to, label, icon: Icon }) => (
                        <Link
                            key={to}
                            to={to}
                            className="group inline-flex items-center gap-2 px-4 py-2 border-2 border-white bg-brand-surface text-white rounded-md font-black text-[11px] uppercase tracking-widest brutal-shadow-black hover:bg-brand-blue hover:border-black hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
                        >
                            <Icon size={13} className="group-hover:rotate-12 transition-transform" />
                            {label}
                        </Link>
                    ))}
                </div>

                <div className="flex flex-col gap-6">
                    {children}
                </div>

                <Link
                    to="/"
                    className="group mt-14 inline-flex items-center gap-2 w-fit px-5 py-2.5 bg-brand-blue text-white border-2 border-black text-[11px] font-black uppercase tracking-widest brutal-shadow-white hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
                >
                    <Home size={13} className="group-hover:-translate-y-0.5 transition-transform" />
                    Back to Home
                    <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
            </div>
        </section>
    );
};

export default LegalPage;