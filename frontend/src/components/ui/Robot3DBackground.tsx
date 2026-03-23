"use client";

import React from "react";
import { useAuth } from "../../context/AuthContext";

interface Robot3DBackgroundProps {
    className?: string;
    overlayColor?: string;
    overlayOpacity?: number;
    showDownloadLink?: boolean;
}

export const Robot3DBackground: React.FC<Robot3DBackgroundProps> = ({
    className = "",
    overlayColor = "rgba(0,0,0,0.5)",
    overlayOpacity = 0.4,
    showDownloadLink = false,
}) => {
    const { isPro } = useAuth();
    const videoSrc = `${import.meta.env.BASE_URL}assets/videos/Robots_sliding_on_neon_platform_16a422a842.mp4`;

    const handleDownload = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!isPro) return;

        try {
            const response = await fetch(videoSrc);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = "Robot_Sliding_3D_UI HUB_Background.mp4";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Download failed:", error);
            // Fallback to direct link if fetch fails
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
                    transform: 'translate(-48%, -47%) scale(1.1)'
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
                        className={`group relative flex items-center gap-2.5 px-6 py-2.5 bg-black/40 hover:bg-black/60 backdrop-blur-xl border ${isPro ? 'border-[#00ff22]/20 hover:border-[#00ff22]/50' : 'border-amber-500/20 opacity-80 cursor-not-allowed'} rounded-full text-white transition-all duration-300 ${isPro ? 'hover:scale-105 active:scale-95' : ''} shadow-[0_0_20px_rgba(0,0,0,0.3)] ${isPro ? 'hover:shadow-[0_0_30px_rgba(0,255,34,0.2)]' : ''}`}
                    >
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 rounded-full overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                        </div>

                        {/* Glow behind icon */}
                        <div className="relative flex items-center justify-center">
                            <div className={`absolute inset-0 ${isPro ? 'bg-[#00ff22]/50' : 'bg-amber-500/50'} blur-md opacity-0 group-hover:opacity-100 transition-opacity`} />
                            {isPro ? (
                                <svg className="relative w-5 h-5 text-[#00ff22] drop-shadow-[0_0_8px_rgba(0,255,34,0.8)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                            ) : (
                                <svg className="relative w-5 h-5 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            )}
                        </div>

                        <span className="relative text-sm font-bold tracking-tight bg-clip-text text-white">
                            {isPro ? (
                                <>Download <span className="text-[#00ff22]">4K</span> Video</>
                            ) : (
                                <>Pro <span className="text-amber-500">Upgrade</span> required</>
                            )}
                        </span>

                        {/* Outer beam-like edge */}
                        <div className={`absolute -inset-[1px] rounded-full border ${isPro ? 'border-[#00ff22]/0 group-hover:border-[#00ff22]/30' : 'border-amber-500/30'} transition-colors pointer-events-none`} />
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
                <div className="w-8 h-8 rounded-lg bg-[#00ff22]/20 border border-[#00ff22]/40 flex items-center justify-center shadow-[0_0_15px_rgba(0,255,34,0.3)]">
                    <span className="text-[#00ff22] font-black text-xs">U</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-white font-black text-sm tracking-widest leading-none">UI HUB</span>
                    <span className="text-[#00ff22] text-[8px] font-bold tracking-[0.3em] uppercase opacity-80">Future of UI</span>
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

export default Robot3DBackground;
