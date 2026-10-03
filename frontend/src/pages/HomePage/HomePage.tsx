import React from 'react';
import Hero from './sections/Hero';
import FAQ from './sections/FAQ';
import ComponentGrid from './sections/ComponentGrid';
import Stats from './sections/Stats';
import CategoryShowcase from './sections/CategoryShowcase';
import AdSlot from '../../components/ui/AdSlot';

const HomePage = () => (
    <div className="flex flex-col bg-black">
        <Hero />
        <Stats />
        <AdSlot slot="home-after-stats" className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 py-8" />
        <ComponentGrid />
        <CategoryShowcase />
        <AdSlot slot="home-after-categories" className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 py-8" />
        <FAQ />
    </div>
);

export default HomePage;
