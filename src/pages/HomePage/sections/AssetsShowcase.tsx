import React from 'react';
import SectionHeader from '../../../components/ui/SectionHeader';

interface Asset {
    name: string;
    status?: string;
}

const AssetsShowcase = ({ onSelectItem }: { onSelectItem: (item: Asset) => void }) => {
    const assets: { category: string; items: Asset[] }[] = [
        {
            category: "Text Animations",
            items: [
                { name: "Split Text" },
                { name: "Blur Text" },
                { name: "Circular Text" },
                { name: "Text Type" },
                { name: "Shuffle" },
                { name: "Shiny Text", status: "Updated" },
                { name: "Text Pressure" },
                { name: "Curved Loop" },
                { name: "Fuzzy Text", status: "Updated" },
                { name: "Gradient Text", status: "Updated" },
                { name: "Falling Text" },
                { name: "Text Cursor" },
                { name: "Decrypted Text" },
                { name: "True Focus" },
            ]
        },
        {
            category: "Animations",
            items: [
                { name: "Animated Content" },
                { name: "Fade Content" },
                { name: "Electric Border", status: "Updated" },
                { name: "Orbit Images", status: "New" },
                { name: "Pixel Transition" },
                { name: "Glare Hover" },
                { name: "Antigravity", status: "New" },
                { name: "Logo Loop" },
                { name: "Target Cursor" },
                { name: "Laser Flow" },
                { name: "Magnet Lines" },
            ]
        },
        {
            category: "Backgrounds",
            items: [
                { name: "Liquid Ether" },
                { name: "Prism" },
                { name: "Dark Veil" },
                { name: "Light Pillar", status: "New" },
                { name: "Silk" },
                { name: "Floating Lines", status: "New" },
                { name: "Light Rays" },
                { name: "Pixel Blast" },
                { name: "Color Bends", status: "New" },
                { name: "Aurora" },
                { name: "Plasma" },
                { name: "Particles" },
                { name: "Gradient Blinds" },
                { name: "Grainient", status: "New" },
                { name: "Obsidian Orbit", status: "New" },
            ]
        }
    ];

    return (
        <section className="py-24 px-6 bg-brand-black">
            <div className="max-w-7xl mx-auto">
                <SectionHeader id="assets" title="Component Library" subtitle="Ready-to-use Assets" />
                <div className="flex flex-col gap-16 max-w-4xl mx-auto">
                    {assets.map((group, idx) => (
                        <div key={idx} className="flex flex-col gap-6">
                            <h3 className="text-xl font-heading font-bold text-white/90 border-l-2 border-brand-green pl-4">
                                {group.category}
                            </h3>
                            <ul className="space-y-3">
                                {group.items.map((item, i) => (
                                    <li
                                        key={i}
                                        onClick={() => onSelectItem(item)}
                                        className="group flex items-center justify-between py-1 cursor-pointer"
                                    >
                                        <span className="text-white/50 group-hover:text-brand-green transition-colors duration-300 font-medium">
                                            {item.name}
                                        </span>
                                        {item.status && (
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter ${item.status === 'New' ? 'bg-brand-green text-black' : 'border border-white/20 text-white/40'
                                                }`}>
                                                {item.status}
                                            </span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default AssetsShowcase;
