"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export interface CollageImage {
  src: string;
  x: number;
  y: number;
  rotate: number;
  alt?: string;
}

export interface ImageCollageProps extends React.HTMLAttributes<HTMLDivElement> {
  images?: CollageImage[];
  containerClassName?: string;
  imageClassName?: string;
}

const DEFAULT_COLLAGE_IMAGES: CollageImage[] = [
  { src: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=600&auto=format&fit=crop', x: -60, y: -25, rotate: -16, alt: 'Sneakers 01' },
  { src: 'https://images.unsplash.com/photo-1620002130389-9db8a5e3782d?q=80&w=600&auto=format&fit=crop', x: -20, y: 20, rotate: -6, alt: 'Sneakers 02' },
  { src: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=600&auto=format&fit=crop', x: 25, y: -18, rotate: 12, alt: 'Sneakers 03' },
  { src: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?q=80&w=600&auto=format&fit=crop', x: 65, y: 15, rotate: 22, alt: 'Sneakers 04' },
];

export const ImageCollage = React.forwardRef<HTMLDivElement, ImageCollageProps>(
  (
    { images = DEFAULT_COLLAGE_IMAGES, className, containerClassName, imageClassName, ...props },
    ref
  ) => {
    const [isOrganized, setIsOrganized] = useState(false);

    const toggleLayout = () => {
      setIsOrganized((prev) => !prev);
    };

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center gap-10 select-none w-full min-h-[460px] cursor-pointer text-white p-8",
          className
        )}
        onClick={toggleLayout}
        {...props}
      >
        <div className="text-center">
          <span className="px-3.5 py-1 rounded-full bg-brand-blue/20 text-brand-blue border border-brand-blue/30 font-mono text-[11px] uppercase tracking-widest font-bold inline-block mb-3">
            {isOrganized ? "ORGANIZED ROW VIEW" : "DYNAMIC COLLAGE CLUSTER"}
          </span>
          <h3 className="text-2xl md:text-3xl font-black font-display text-white tracking-tight uppercase">
            Click anywhere to toggle layout
          </h3>
          <p className="text-xs font-mono text-neutral-400 uppercase tracking-widest mt-1">
            Tap to switch between stacked cluster and organized grid
          </p>
        </div>
        
        <motion.div className={cn("h-48 flex items-center justify-center -space-x-4 md:-space-x-6", containerClassName)}>
          {images.map((img, i) => (
            <motion.div
              key={i}
              className={cn(
                "w-28 sm:w-36 md:w-44 shrink-0 aspect-[4/5] rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl bg-neutral-900",
                !isOrganized && "shadow-[0_20px_50px_rgba(0,0,0,0.8)]",
                imageClassName
              )}
              initial={{ opacity: 0, scale: 0.7 }}
              transition={{ type: "spring", stiffness: 350, damping: 25, bounce: 0.4 }}
              animate={{
                opacity: 1,
                scale: 1,
                x: isOrganized ? 0 : img.x,
                y: isOrganized ? 0 : img.y,
                rotate: isOrganized ? 0 : img.rotate,
                zIndex: isOrganized ? 1 : i + 1,
              }}
            >
              <img
                src={img.src}
                alt={img.alt || `Collage image ${i}`}
                className="w-full h-full object-cover select-none pointer-events-none"
                draggable={false}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    );
  }
);

ImageCollage.displayName = "ImageCollage";

export default ImageCollage;
