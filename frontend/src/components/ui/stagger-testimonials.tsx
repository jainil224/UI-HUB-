"use client";

import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

const SQRT_5000 = Math.sqrt(5000);

interface Testimonial {
    tempId: number;
    testimonial: string;
    by: string;
    imgSrc: string;
}

const TESTIMONIALS: Testimonial[] = [
    {
        tempId: 0,
        testimonial: 'UI-HUB is my favorite shortcut for shipping interfaces. We build 5x faster now.',
        by: 'Alex, Frontend Lead at Northstar Labs',
        imgSrc: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&h=224&q=80&crop=faces',
    },
    {
        tempId: 1,
        testimonial: "Every vibe prompt just lands. I paste it and the component matches our design system.",
        by: 'Dan, Staff Engineer at SecureNet',
        imgSrc: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&h=224&q=80&crop=faces',
    },
    {
        tempId: 2,
        testimonial: 'We were reinventing buttons and backgrounds before UI-HUB. Now we start from a library.',
        by: 'Stephanie, Design Systems Lead at InnovateCo',
        imgSrc: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=160&h=224&q=80&crop=faces',
    },
    {
        tempId: 3,
        testimonial: "Planning a UI sprint is seamless when the components are already there.",
        by: 'Marie, Product Lead at FuturePlanning',
        imgSrc: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&h=224&q=80&crop=faces',
    },
    {
        tempId: 4,
        testimonial: "If I could give 11 stars for the prompt library, I'd give 12.",
        by: 'Andre, Design Director at CreativeSolutions',
        imgSrc: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&h=224&q=80&crop=faces',
    },
    {
        tempId: 5,
        testimonial: 'The copy-to-clipboard flow saved me more hours than I can count.',
        by: 'Jeremy, Product Manager at TimeWise',
        imgSrc: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&h=224&q=80&crop=faces',
    },
    {
        tempId: 6,
        testimonial: "It took one demo to convince the team. We're not going back to hand-rolled CSS.",
        by: 'Pam, Marketing Director at BrandBuilders',
        imgSrc: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=160&h=224&q=80&crop=faces',
    },
    {
        tempId: 7,
        testimonial: 'The component metadata makes it obvious which prompt fits. ROI is easy to defend.',
        by: 'Daniel, Data Lead at AnalyticsPro',
        imgSrc: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=160&h=224&q=80&crop=faces',
    },
    {
        tempId: 8,
        testimonial: "It's just the best component library for rapid UI work. Period.",
        by: 'Fernando, UX Designer at UserFirst',
        imgSrc: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=160&h=224&q=80&crop=faces',
    },
    {
        tempId: 9,
        testimonial: 'Switched five months ago and never looked back.',
        by: 'Andy, DevOps Engineer at CloudMasters',
        imgSrc: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&h=224&q=80&crop=faces',
    },
    {
        tempId: 10,
        testimonial: "I'd been searching for a prompt-to-component workflow for years. Glad I found UI-HUB.",
        by: 'Pete, Sales Engineer at RevenueRockets',
        imgSrc: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&w=160&h=224&q=80&crop=faces',
    },
    {
        tempId: 11,
        testimonial: 'Simple enough that the whole team was productive in ten minutes.',
        by: 'Marina, Design Ops at TalentForge',
        imgSrc: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&h=224&q=80&crop=faces',
    },
    {
        tempId: 12,
        testimonial: "Support is unreal — questions answered before we even finish typing them.",
        by: 'Olivia, Customer Success at ClientCare',
        imgSrc: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=160&h=224&q=80&crop=faces',
    },
    {
        tempId: 13,
        testimonial: "Our first prototype went from a week to an afternoon. That's the efficiency gain.",
        by: 'Raj, Operations Lead at StreamlineSolutions',
        imgSrc: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=160&h=224&q=80&crop=faces',
    },
    {
        tempId: 14,
        testimonial: "UI-HUB changed how we handle UI work. It's a genuine game-changer.",
        by: 'Lila, Workflow Specialist at ProcessPro',
        imgSrc: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=160&h=224&q=80&crop=faces',
    },
    {
        tempId: 15,
        testimonial: 'It scales with us — new components land faster than we can adopt them.',
        by: 'Trevor, Engineering Manager at GrowthGurus',
        imgSrc: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=160&h=224&q=80&crop=faces',
    },
    {
        tempId: 16,
        testimonial: "The AI prompts keep getting sharper. They're always a step ahead of our backlog.",
        by: 'Naomi, Innovation Lead at FutureTech',
        imgSrc: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&w=160&h=224&q=80&crop=faces',
    },
    {
        tempId: 17,
        testimonial: 'Great components, clear prompts, predictable output. Paid for itself many times over.',
        by: 'Victor, Finance Analyst at ProfitPeak',
        imgSrc: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=160&h=224&q=80&crop=faces',
    },
    {
        tempId: 18,
        testimonial: 'Robust enough for production, simple enough for a quick mock. Perfect balance.',
        by: 'Yuki, Tech Lead at BalancedTech',
        imgSrc: 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=160&h=224&q=80&crop=faces',
    },
    {
        tempId: 19,
        testimonial: 'We tried other libraries. UI-HUB wins on speed, consistency and reliability.',
        by: 'Zoe, Performance Manager at ReliableSystems',
        imgSrc: 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?auto=format&fit=crop&w=160&h=224&q=80&crop=faces',
    },
];

interface TestimonialCardProps {
    position: number;
    testimonial: Testimonial;
    handleMove: (steps: number) => void;
    cardSize: number;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
    position,
    testimonial,
    handleMove,
    cardSize,
}) => {
    const isCenter = position === 0;
    const isFocusable = Math.abs(position) <= 1;

    return (
        <div
            role="button"
            tabIndex={isFocusable ? 0 : -1}
            aria-label={`Show testimonial from ${testimonial.by.split(',')[0]}`}
            aria-current={isCenter ? 'true' : undefined}
            onClick={() => handleMove(position)}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handleMove(position);
                }
            }}
            className={cn(
                'absolute left-1/2 top-1/2 cursor-pointer border-2 p-6 transition-all duration-500 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-8',
                isCenter
                    ? 'z-10 border-brand-blue bg-brand-blue text-white'
                    : 'z-0 border-black bg-white text-black hover:border-brand-blue',
            )}
            style={{
                width: cardSize,
                height: cardSize,
                clipPath:
                    'polygon(50px 0%, calc(100% - 50px) 0%, 100% 50px, 100% 100%, calc(100% - 50px) 100%, 50px 100%, 0 100%, 0 0)',
                transform: `
                    translate(-50%, -50%)
                    translateX(${(cardSize / 1.5) * position}px)
                    translateY(${isCenter ? -65 : position % 2 ? 15 : -15}px)
                    rotate(${isCenter ? 0 : position % 2 ? 2.5 : -2.5}deg)
                `,
                boxShadow: isCenter
                    ? '0px 8px 0px 4px rgba(0,0,0,0.85), 0px 0px 34px 8px rgba(61,92,255,0.4)'
                    : '0px 0px 0px 0px transparent',
            }}
        >
            <span
                aria-hidden
                className="absolute block origin-top-right rotate-45"
                style={{
                    right: -2,
                    top: 48,
                    width: SQRT_5000,
                    height: 2,
                    backgroundColor: isCenter ? '#FFFFFF' : '#000000',
                }}
            />
            <img
                src={testimonial.imgSrc}
                alt={testimonial.by.split(',')[0]}
                loading="lazy"
                className="mb-4 h-14 w-12 bg-neutral-200 object-cover object-top"
                style={{
                    boxShadow: isCenter
                        ? '3px 3px 0px 0px #000000'
                        : '3px 3px 0px 0px #3D5CFF',
                }}
            />
            <h3
                className={cn(
                    'text-base font-medium leading-snug sm:text-xl',
                    isCenter ? 'text-white' : 'text-black',
                )}
            >
                "{testimonial.testimonial}"
            </h3>
            <p
                className={cn(
                    'absolute bottom-6 left-6 right-6 mt-2 text-sm italic sm:bottom-8 sm:left-8 sm:right-8',
                    isCenter ? 'text-white/80' : 'text-neutral-600',
                )}
            >
                - {testimonial.by}
            </p>
        </div>
    );
};

export const StaggerTestimonials: React.FC = () => {
    const [cardSize, setCardSize] = useState(365);
    const [testimonialsList, setTestimonialsList] = useState<Testimonial[]>(TESTIMONIALS);

    const handleMove = (steps: number) => {
        const newList = [...testimonialsList];
        if (steps > 0) {
            for (let i = steps; i > 0; i--) {
                const item = newList.shift();
                if (!item) return;
                newList.push({ ...item, tempId: Math.random() });
            }
        } else {
            for (let i = steps; i < 0; i++) {
                const item = newList.pop();
                if (!item) return;
                newList.unshift({ ...item, tempId: Math.random() });
            }
        }
        setTestimonialsList(newList);
    };

    useEffect(() => {
        const updateSize = () => {
            const { matches } = window.matchMedia('(min-width: 640px)');
            setCardSize(matches ? 365 : 290);
        };

        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    return (
        <div className="relative w-full overflow-hidden" style={{ height: 600 }}>
            {testimonialsList.map((testimonial, index) => {
                const position = testimonialsList.length % 2
                    ? index - (testimonialsList.length + 1) / 2
                    : index - testimonialsList.length / 2;
                return (
                    <TestimonialCard
                        key={testimonial.tempId}
                        testimonial={testimonial}
                        handleMove={handleMove}
                        position={position}
                        cardSize={cardSize}
                    />
                );
            })}
            <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
                <button
                    type="button"
                    onClick={() => handleMove(-1)}
                    className={cn(
                        'flex h-14 w-14 items-center justify-center border-2 border-black bg-white text-2xl text-black transition-colors brutal-shadow-blue',
                        'hover:border-white hover:bg-brand-blue hover:text-white',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-brand-bg',
                    )}
                    aria-label="Previous testimonial"
                >
                    <ChevronLeft />
                </button>
                <button
                    type="button"
                    onClick={() => handleMove(1)}
                    className={cn(
                        'flex h-14 w-14 items-center justify-center border-2 border-black bg-white text-2xl text-black transition-colors brutal-shadow-blue',
                        'hover:border-white hover:bg-brand-blue hover:text-white',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-brand-bg',
                    )}
                    aria-label="Next testimonial"
                >
                    <ChevronRight />
                </button>
            </div>
        </div>
    );
};

export default StaggerTestimonials;
