import React from 'react';
import { motion } from 'motion/react';
import { Quote } from 'lucide-react';

const reports = [
    {
        quote: "Before UI HUB, I was spending hours tweaking CSS for simple animations. This library gives me the exact premium structure I need on the first try.",
        author: "SARAH J.",
        role: "CREATIVE DIRECTOR",
        roleBg: "bg-brand-blue text-white",
        quoteColor: "text-brand-blue",
        shadow: "brutal-shadow-blue"
    },
    {
        quote: "The component logic here is basically a superpower. It turns basic prototypes into high-end, deterministic interfaces that stakeholders love.",
        author: "MARCUS T.",
        role: "LEAD DEVELOPER",
        roleBg: "bg-brand-yellow text-black",
        quoteColor: "text-brand-yellow",
        shadow: "brutal-shadow-yellow"
    },
    {
        quote: "Our landing pages used to feel static. Now, we get consistent premium motion across all our products because the components are airtight.",
        author: "ELENA R.",
        role: "GROWTH MARKETER",
        roleBg: "bg-brand-red text-white",
        quoteColor: "text-brand-red",
        shadow: "brutal-shadow-red"
    }
];

const Testimonials = () => {
    return (
        <section className="relative py-28 px-4 sm:px-6 overflow-hidden bg-brand-bg border-t-4 border-black">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-20 relative flex flex-col items-center">
                    {/* Eyebrow Badge */}
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-6 border-2 border-white bg-brand-surface text-white rounded-md font-black text-xs uppercase tracking-widest brutal-shadow-black">
                        <span className="w-2.5 h-2.5 rounded-full bg-brand-blue border border-black" />
                        <span>COMMUNITY REVIEWS</span>
                    </div>

                    <h2 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight text-white leading-none">
                        ENGINEERS WHO DEMAND <span className="text-brand-blue">PRECISION</span>
                    </h2>
                    <p className="mt-4 text-neutral-400 font-medium text-base md:text-lg max-w-xl">
                        Trusted by frontend architects and creative teams building state-of-the-art web apps.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {reports.map((report, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            className={`relative h-full bg-brand-surface border-2 border-white rounded-lg p-8 flex flex-col justify-between transition-transform duration-150 hover:translate-x-0.5 hover:translate-y-0.5 ${report.shadow}`}
                        >
                            {/* Card Content */}
                            <div>
                                <Quote className={`w-10 h-10 ${report.quoteColor} mb-6`} />
                                <p className="text-base sm:text-lg text-neutral-200 leading-relaxed font-semibold mb-8">
                                    "{report.quote}"
                                </p>
                            </div>

                            {/* Author Footer */}
                            <div className="pt-6 border-t-2 border-neutral-800 flex items-center justify-between">
                                <div>
                                    <h4 className="text-sm font-black text-white tracking-wider uppercase">{report.author}</h4>
                                </div>
                                <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider border border-black shadow-[1px_1px_0px_0px_#000] ${report.roleBg}`}>
                                    {report.role}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
