import React from 'react';
import Hero from './sections/Hero';
import VibePrompts from './sections/VibePrompts';
import ComponentGrid from './sections/ComponentGrid';
import Stats from './sections/Stats';
import Testimonials from './sections/Testimonials';

const HomePage = () => (
    <div className="flex flex-col bg-black">
        <Hero />
        <Stats />
        <ComponentGrid />
        <Testimonials />
        <VibePrompts />
    </div>
);

export default HomePage;
