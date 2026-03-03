import React from 'react';

const SectionHeader = ({ title, subtitle, id }: { title: string; subtitle: string; id: string }) => (
    <div id={id} className="mb-12 px-4 md:px-0">
        <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-[1px] bg-brand-green" />
            <span className="text-brand-green text-[10px] md:text-xs font-bold uppercase tracking-widest">{subtitle}</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-display uppercase tracking-tight">{title}</h2>
    </div>
);

export default SectionHeader;
