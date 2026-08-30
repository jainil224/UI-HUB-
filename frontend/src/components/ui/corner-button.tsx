"use client"

import type React from "react"
import { useId } from "react"
import { cn } from "../../lib/utils"
import { Pencil } from "lucide-react"
import uiHubLogo from "../../Assets/webiste logo.svg"

export interface CornerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /**
     * The button label shown next to the UI HUB title image.
     */
    children?: React.ReactNode
    /**
     * Icon rendered on the right side of the label.
     */
    icon?: React.ReactNode
    /**
     * Accent color used for the corner brackets and glow.
     */
    accentColor?: string
    /**
     * Show the UI HUB logo image on the left side of the button text.
     */
    showTitleImage?: boolean
    /**
     * Override the title image source.
     */
    titleImage?: string
    /**
     * Override the title image alt text.
     */
    titleImageAlt?: string
    /**
     * Extra classes applied to the title image.
     */
    titleImageClassName?: string
    /**
     * Optional custom inline styles.
     */
    style?: React.CSSProperties
}

export const CornerButton = ({
    children = "Start designing",
    icon = <Pencil color="#0f172a" size={18} />,
    accentColor = "#FF3B4D",
    showTitleImage = true,
    titleImage = uiHubLogo,
    titleImageAlt = "UI HUB",
    titleImageClassName = "",
    className,
    style,
    ...props
}: CornerButtonProps) => {
    const styleId = useId().replace(/[^a-zA-Z0-9]/g, "")
    const accentVar = { "--accent-color": accentColor } as React.CSSProperties

    return (
        <div className="corner-btn-root">
            <style>{`
                .corner-btn-${styleId} {
                    position: relative;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    padding: 14px 30px;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    background: #ffffff;
                    color: #0f172a;
                    font-size: 15px;
                    font-weight: 600;
                    letter-spacing: 0.3px;
                    white-space: nowrap;
                    cursor: pointer;
                    isolation: isolate;
                    overflow: hidden;
                    transition: border-color 0.3s ease, background-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
                }
                .corner-btn-${styleId}:hover {
                    border-color: var(--accent-color);
                    background-color: #fffafb;
                    transform: translateY(-2px);
                    box-shadow: 0 14px 30px -14px color-mix(in srgb, var(--accent-color) 55%, transparent);
                }
                .corner-btn-${styleId}:focus-visible {
                    outline: 2px solid var(--accent-color);
                    outline-offset: 3px;
                }

                .corner-btn-${styleId} .cb {
                    position: absolute;
                    width: 30px;
                    height: 30px;
                    pointer-events: none;
                    z-index: 0;
                }
                .corner-btn-${styleId} .cb::before,
                .corner-btn-${styleId} .cb::after {
                    content: "";
                    position: absolute;
                    background: var(--accent-color);
                    border-radius: 999px;
                    box-shadow: 0 0 10px var(--accent-color);
                    transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
                }

                .corner-btn-${styleId} .cb.tl { top: 0; left: 0; }
                .corner-btn-${styleId} .cb.tl::before { top: 0; left: 0; height: 2px; width: 0; }
                .corner-btn-${styleId} .cb.tl::after { top: 0; left: 0; width: 2px; height: 0; }
                .corner-btn-${styleId}:hover .cb.tl::before { width: 30px; }
                .corner-btn-${styleId}:hover .cb.tl::after { height: 30px; }

                .corner-btn-${styleId} .cb.tr { top: 0; right: 0; }
                .corner-btn-${styleId} .cb.tr::before { top: 0; right: 0; height: 2px; width: 0; }
                .corner-btn-${styleId} .cb.tr::after { top: 0; right: 0; width: 2px; height: 0; }
                .corner-btn-${styleId}:hover .cb.tr::before { width: 30px; }
                .corner-btn-${styleId}:hover .cb.tr::after { height: 30px; }

                .corner-btn-${styleId} .cb.bl { bottom: 0; left: 0; }
                .corner-btn-${styleId} .cb.bl::before { bottom: 0; left: 0; height: 2px; width: 0; }
                .corner-btn-${styleId} .cb.bl::after { bottom: 0; left: 0; width: 2px; height: 0; }
                .corner-btn-${styleId}:hover .cb.bl::before { width: 30px; }
                .corner-btn-${styleId}:hover .cb.bl::after { height: 30px; }

                .corner-btn-${styleId} .cb.br { bottom: 0; right: 0; }
                .corner-btn-${styleId} .cb.br::before { bottom: 0; right: 0; height: 2px; width: 0; }
                .corner-btn-${styleId} .cb.br::after { bottom: 0; right: 0; width: 2px; height: 0; }
                .corner-btn-${styleId}:hover .cb.br::before { width: 30px; }
                .corner-btn-${styleId}:hover .cb.br::after { height: 30px; }

                .corner-btn-${styleId} .cb .glow {
                    position: absolute;
                    width: 64px;
                    height: 64px;
                    border-radius: 50%;
                    background: radial-gradient(circle, color-mix(in srgb, var(--accent-color) 55%, transparent) 0%, transparent 70%);
                    filter: blur(6px);
                    opacity: 0;
                    transform: scale(0.4);
                    transition: opacity 0.5s ease, transform 0.5s ease;
                }
                .corner-btn-${styleId} .cb.tl .glow { top: -16px; left: -16px; }
                .corner-btn-${styleId} .cb.tr .glow { top: -16px; right: -16px; }
                .corner-btn-${styleId} .cb.bl .glow { bottom: -16px; left: -16px; }
                .corner-btn-${styleId} .cb.br .glow { bottom: -16px; right: -16px; }
                .corner-btn-${styleId}:hover .cb .glow { opacity: 1; transform: scale(1); }

                .corner-btn-${styleId} .cb-title-img {
                    position: relative;
                    z-index: 1;
                    width: 26px;
                    height: 26px;
                    object-fit: contain;
                    flex-shrink: 0;
                }
                .corner-btn-${styleId} .cb-label {
                    position: relative;
                    z-index: 1;
                }
                .corner-btn-${styleId} .cb-icon {
                    position: relative;
                    z-index: 1;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                }

                @media (max-width: 480px) {
                    .corner-btn-${styleId} {
                        gap: 8px;
                        padding: 12px 20px;
                        font-size: 13.5px;
                    }
                    .corner-btn-${styleId} .cb-title-img {
                        width: 22px;
                        height: 22px;
                    }
                    .corner-btn-${styleId} .cb {
                        width: 24px;
                        height: 24px;
                    }
                    .corner-btn-${styleId} .cb .glow {
                        width: 52px;
                        height: 52px;
                    }
                    .corner-btn-${styleId}:hover .cb.tl::before,
                    .corner-btn-${styleId}:hover .cb.tr::before,
                    .corner-btn-${styleId}:hover .cb.bl::before,
                    .corner-btn-${styleId}:hover .cb.br::before { width: 24px; }
                    .corner-btn-${styleId}:hover .cb.tl::after,
                    .corner-btn-${styleId}:hover .cb.tr::after,
                    .corner-btn-${styleId}:hover .cb.bl::after,
                    .corner-btn-${styleId}:hover .cb.br::after { height: 24px; }
                }
            `}</style>

            <button
                className={cn("corner-btn", `corner-btn-${styleId}`, className)}
                style={{ ...accentVar, ...style } as React.CSSProperties}
                {...props}
            >
                <span className="cb tl"><span className="glow" /></span>
                <span className="cb tr"><span className="glow" /></span>
                <span className="cb bl"><span className="glow" /></span>
                <span className="cb br"><span className="glow" /></span>

                {showTitleImage && (
                    <img
                        src={titleImage}
                        alt={titleImageAlt}
                        className={cn("cb-title-img", titleImageClassName)}
                    />
                )}

                <span className="cb-label">{children}</span>
                <span className="cb-icon">{icon}</span>
            </button>
        </div>
    )
}

export default CornerButton