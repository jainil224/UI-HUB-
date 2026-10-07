import React from 'react';
import HexaSphere from '../../components/ui/HexaSphere';

const HexaSphereDemoPage: React.FC = () => {
    return (
        <main className="relative w-full h-screen overflow-hidden bg-black">
            <HexaSphere />
        </main>
    );
};

export default HexaSphereDemoPage;