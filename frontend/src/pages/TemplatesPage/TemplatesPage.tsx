import React from 'react';
import TemplatesSection from '../HomePage/sections/TemplatesSection';
import { useSeo } from '../../components/Seo';
import { templatesIndexSeoConfig } from '../../seo/runtime';

const TemplatesPage = () => {
    useSeo(templatesIndexSeoConfig());

    return (
        <div className="min-h-screen flex flex-col bg-black text-white pt-16">
            <TemplatesSection />
        </div>
    );
};

export default TemplatesPage;
