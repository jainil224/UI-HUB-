import React from 'react';
import Hero from './sections/Hero';
import FAQ from './sections/FAQ';
import ComponentGrid from './sections/ComponentGrid';
import Stats from './sections/Stats';
import Testimonials from './sections/Testimonials';

const HomePage = () => (
    <div className="flex flex-col bg-black">
        <Hero />
        <Stats />
        <ComponentGrid />
        <Testimonials />
        <FAQ />
    </div>
);

export default HomePage;
