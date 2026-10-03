import React from 'react';
import TemplatesSection from '../HomePage/sections/TemplatesSection';
import AdSlot from '../../components/ui/AdSlot';

const TemplatesPage = () => {
    return (
        <div className="min-h-screen flex flex-col bg-black text-white pt-16">
            <AdSlot slot="templates-top" className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 py-8" />
            <TemplatesSection />
        </div>
    );
};

export default TemplatesPage;
