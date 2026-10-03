import React from 'react';
import CubeLoader from '../../components/ui/CubeLoader';

/**
 * Standalone demo route for the merged Cube Loader component.
 * The component ships its own variant switcher, so this page only supplies the
 * full-bleed dark stage. Uncontrolled state is used deliberately: the demo
 * exercises the component's built-in behaviour rather than the catalog page's
 * externally-owned variant state.
 */
export const CubeLoadersDemoPage: React.FC = () => {
    return (
        <main
            id="cube-loaders-section"
            className="relative w-full h-screen min-h-[380px] overflow-hidden bg-[#0A0A0A] flex items-center justify-center"
        >
            <div className="flex flex-col items-center justify-center gap-6 w-full px-6">
                <CubeLoader />
            </div>
        </main>
    );
};

export default CubeLoadersDemoPage;