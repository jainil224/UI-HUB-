import React from 'react';
import BuildWithUIHubSection from '../HomePage/sections/BuildWithUIHubSection';
import { useSeo } from '../../components/Seo';
import { buildIndexSeoConfig } from '../../seo/runtime';

const BuildWithUIHubPage = () => {
    useSeo(buildIndexSeoConfig());

    return (
        <div className="min-h-screen flex flex-col bg-black text-white pt-16">
            <BuildWithUIHubSection />
        </div>
    );
};

export default BuildWithUIHubPage;
