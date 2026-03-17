"use client";

import React from "react";

interface InteractiveWebGLSceneProps {
    className?: string;
    overlayColor?: string;
    overlayOpacity?: number;
    showDownloadLink?: boolean;
}

export const InteractiveWebGLScene: React.FC<InteractiveWebGLSceneProps> = ({
    className = "",
    overlayColor = "rgba(0,0,0,0.5)",
    overlayOpacity = 0.4,
    showDownloadLink = false,
}) => {
    const videoSrc = `${import.meta.env.BASE_URL}assets/videos/Interactive%20WebGL%20Scene.mp4`;


    const handleDownload = async (e: React.MouseEvent) => {
        e.preventDefault();
        try {
            const response = await fetch(videoSrc);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = "Interactive_WebGL_Scene_UI_HUB_Background.mp4";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Download failed:", error);
            window.open(videoSrc, '_blank');
        }
    };

    return (
        <div className={`relative w-full h-full overflow-hidden ${className}`}>
            {/* Video Content */}
            <video
                autoPlay
                loop
                muted
                defaultMuted
                playsInline
                className="absolute top-1/2 left-1/2 min-w-full min-h-full object-cover"
                style={{
                    transform: 'translate(-50%, -50%)'
                }}
            >
                <source src={videoSrc} type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            {/* Download Link Overlay */}
            {showDownloadLink && (
                <div className="absolute top-6 right-8 z-[100] pointer-events-auto">
                    <button
                        onClick={handleDownload}
                        className="group relative flex items-center gap-2.5 px-6 py-2.5 bg-black/40 hover:bg-black/60 backdrop-blur-xl border border-indigo-500/20 hover:border-indigo-500/50 rounded-full text-white transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(0,0,0,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.2)]"
                    >
                        <div className="absolute inset-0 rounded-full overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                        </div>

                        <div className="relative flex items-center justify-center">
                            <div className="absolute inset-0 bg-indigo-500/50 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                            <svg className="relative w-5 h-5 text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                        </div>

                        <span className="relative text-sm font-bold tracking-tight bg-clip-text text-white group-hover:text-indigo-400 transition-colors">
                            Download <span className="text-indigo-400">4K</span> Scene
                        </span>

                        <div className="absolute -inset-[1px] rounded-full border border-indigo-500/0 group-hover:border-indigo-500/30 transition-colors pointer-events-none" />
                    </button>

                    <style dangerouslySetInnerHTML={{
                        __html: `
                        @keyframes shimmer {
                            0% { transform: translateX(-100%); }
                            100% { transform: translateX(100%); }
                        }
                    `}} />
                </div>
            )}

            {/* Watermark Branding */}
            <div className="absolute bottom-6 left-8 z-[80] pointer-events-none flex items-center gap-3 select-none opacity-60">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                    <span className="text-indigo-400 font-black text-xs">U</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-white font-black text-sm tracking-widest leading-none">UI HUB</span>
                    <span className="text-indigo-400 text-[8px] font-bold tracking-[0.3em] uppercase opacity-80">Premium Scene</span>
                </div>
            </div>

            {/* Overlay for Premium Feel */}
            <div
                className="absolute inset-0 z-10 pointer-events-none"
                style={{
                    backgroundColor: overlayColor,
                    opacity: overlayOpacity,
                    background: `radial-gradient(circle at center, transparent 0%, ${overlayColor} 100%)`
                }}
            />

            {/* Subtle Scanline Effect */}
            <div className="absolute inset-0 z-20 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
        </div>
    );
};

export default InteractiveWebGLScene;
