import React from 'react';
import Hero from './sections/Hero';
import VibePrompts from './sections/VibePrompts';
import ComponentGrid from './sections/ComponentGrid';
import Stats from './sections/Stats';

const HomePage = () => (
    <div className="flex flex-col">
        <Hero />
        <Stats />
        <ComponentGrid />
        <VibePrompts />
    </div>
);

export default HomePage;
