import React from 'react';
import Hero from './sections/Hero';
import VibePrompts from './sections/VibePrompts';
import ComponentGrid from './sections/ComponentGrid';
import Stats from './sections/Stats';
import Testimonials from './sections/Testimonials';
import ScrollShowcase from './sections/ScrollShowcase';

const HomePage = () => (
    <div className="flex flex-col">
        <Hero />
        <Stats />
        <ComponentGrid />
        <ScrollShowcase />
        <Testimonials />
        <VibePrompts />
    </div>
);

export default HomePage;
