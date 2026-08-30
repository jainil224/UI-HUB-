import React from 'react';

/**
 * PixelBounce
 * A retro pixel-art ghost made from a CSS grid of 14x14 cells. The full body
 * bobs up and down on a 0.5s loop, its eye holds two animated pupils that
 * scan sideways, the eye area flickers between red and transparent in a
 * staggered pattern (flicker0/flicker1 alternate), and a blurred shadow under
 * the ghost pulses in sync with the bob.
 */
export const PixelBounce: React.FC = () => {
    return (
        <div
            className="w-full h-full min-h-[380px] flex items-center justify-center overflow-hidden select-none"
            style={{
                background: 'radial-gradient(120% 120% at 50% 40%, #2a2e36 0%, #17181d 55%, #0d0e12 100%)',
            }}
        >
            <style>{`
                .pb-ghost {
                    position: relative;
                    scale: 0.8;
                }

                .pb-red {
                    animation: pb-upNDown infinite 0.5s;
                    position: relative;
                    width: 140px;
                    height: 140px;
                    display: grid;
                    grid-template-columns: repeat(14, 1fr);
                    grid-template-rows: repeat(14, 1fr);
                    grid-column-gap: 0px;
                    grid-row-gap: 0px;
                    grid-template-areas:
                        "a1  a2  a3  a4  a5  top0  top0  top0  top0  a10 a11 a12 a13 a14"
                        "b1  b2  b3  top1 top1 top1 top1 top1 top1 top1 top1 b12 b13 b14"
                        "c1 c2 top2 top2 top2 top2 top2 top2 top2 top2 top2 top2 c13 c14"
                        "d1 top3 top3 top3 top3 top3 top3 top3 top3 top3 top3 top3 top3 d14"
                        "e1 top3 top3 top3 top3 top3 top3 top3 top3 top3 top3 top3 top3 e14"
                        "f1 top3 top3 top3 top3 top3 top3 top3 top3 top3 top3 top3 top3 f14"
                        "top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4"
                        "top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4"
                        "top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4"
                        "top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4"
                        "top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4"
                        "top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4"
                        "st0 st0 an4 st1 an7 st2 an10 an10 st3 an13 st4 an16 st5 st5"
                        "an1 an2 an3 an5 an6 an8 an9 an9 an11 an12 an14 an15 an17 an18";
                }

                @keyframes pb-upNDown {
                    0%,
                    49% {
                        transform: translateY(0px);
                    }
                    50%,
                    100% {
                        transform: translateY(-10px);
                    }
                }

                .pb-top0,
                .pb-top1,
                .pb-top2,
                .pb-top3,
                .pb-top4,
                .pb-st0,
                .pb-st1,
                .pb-st2,
                .pb-st3,
                .pb-st4,
                .pb-st5 {
                    background-color: red;
                }

                .pb-top0 {
                    grid-area: top0;
                }

                .pb-top1 {
                    grid-area: top1;
                }

                .pb-top2 {
                    grid-area: top2;
                }

                .pb-top3 {
                    grid-area: top3;
                }

                .pb-top4 {
                    grid-area: top4;
                }

                .pb-st0 {
                    grid-area: st0;
                }

                .pb-st1 {
                    grid-area: st1;
                }

                .pb-st2 {
                    grid-area: st2;
                }

                .pb-st3 {
                    grid-area: st3;
                }

                .pb-st4 {
                    grid-area: st4;
                }

                .pb-st5 {
                    grid-area: st5;
                }

                .pb-an1 {
                    grid-area: an1;
                    animation: pb-flicker0 infinite 0.5s;
                }

                .pb-an18 {
                    grid-area: an18;
                    animation: pb-flicker0 infinite 0.5s;
                }

                .pb-an2 {
                    grid-area: an2;
                    animation: pb-flicker1 infinite 0.5s;
                }

                .pb-an17 {
                    grid-area: an17;
                    animation: pb-flicker1 infinite 0.5s;
                }

                .pb-an3 {
                    grid-area: an3;
                    animation: pb-flicker1 infinite 0.5s;
                }

                .pb-an16 {
                    grid-area: an16;
                    animation: pb-flicker1 infinite 0.5s;
                }

                .pb-an4 {
                    grid-area: an4;
                    animation: pb-flicker1 infinite 0.5s;
                }

                .pb-an15 {
                    grid-area: an15;
                    animation: pb-flicker1 infinite 0.5s;
                }

                .pb-an6 {
                    grid-area: an6;
                    animation: pb-flicker0 infinite 0.5s;
                }

                .pb-an12 {
                    grid-area: an12;
                    animation: pb-flicker0 infinite 0.5s;
                }

                .pb-an7 {
                    grid-area: an7;
                    animation: pb-flicker0 infinite 0.5s;
                }

                .pb-an13 {
                    grid-area: an13;
                    animation: pb-flicker0 infinite 0.5s;
                }

                .pb-an9 {
                    grid-area: an9;
                    animation: pb-flicker1 infinite 0.5s;
                }

                .pb-an10 {
                    grid-area: an10;
                    animation: pb-flicker1 infinite 0.5s;
                }

                .pb-an8 {
                    grid-area: an8;
                    animation: pb-flicker0 infinite 0.5s;
                }

                .pb-an11 {
                    grid-area: an11;
                    animation: pb-flicker0 infinite 0.5s;
                }

                @keyframes pb-flicker0 {
                    0%,
                    49% {
                        background-color: red;
                    }
                    50%,
                    100% {
                        background-color: transparent;
                    }
                }

                @keyframes pb-flicker1 {
                    0%,
                    49% {
                        background-color: transparent;
                    }
                    50%,
                    100% {
                        background-color: red;
                    }
                }

                .pb-eye {
                    width: 40px;
                    height: 50px;
                    position: absolute;
                    top: 30px;
                    left: 10px;
                }

                .pb-eye::before {
                    content: "";
                    background-color: white;
                    width: 20px;
                    height: 50px;
                    transform: translateX(10px);
                    display: block;
                    position: absolute;
                }

                .pb-eye::after {
                    content: "";
                    background-color: white;
                    width: 40px;
                    height: 30px;
                    transform: translateY(10px);
                    display: block;
                    position: absolute;
                }

                .pb-eye1 {
                    width: 40px;
                    height: 50px;
                    position: absolute;
                    top: 30px;
                    right: 30px;
                }

                .pb-eye1::before {
                    content: "";
                    background-color: white;
                    width: 20px;
                    height: 50px;
                    transform: translateX(10px);
                    display: block;
                    position: absolute;
                }

                .pb-eye1::after {
                    content: "";
                    background-color: white;
                    width: 40px;
                    height: 30px;
                    transform: translateY(10px);
                    display: block;
                    position: absolute;
                }

                .pb-pupil {
                    width: 20px;
                    height: 20px;
                    background-color: blue;
                    position: absolute;
                    top: 50px;
                    left: 10px;
                    z-index: 1;
                    animation: pb-eyesMovement infinite 3s;
                }

                .pb-pupil1 {
                    width: 20px;
                    height: 20px;
                    background-color: blue;
                    position: absolute;
                    top: 50px;
                    right: 50px;
                    z-index: 1;
                    animation: pb-eyesMovement infinite 3s;
                }

                @keyframes pb-eyesMovement {
                    0%,
                    49% {
                        transform: translateX(0px);
                    }
                    50%,
                    99% {
                        transform: translateX(10px);
                    }
                    100% {
                        transform: translateX(0px);
                    }
                }

                .pb-shadow {
                    background-color: black;
                    width: 140px;
                    height: 140px;
                    position: absolute;
                    border-radius: 50%;
                    transform: rotateX(80deg);
                    filter: blur(20px);
                    top: 80%;
                    animation: pb-shadowMovement infinite 0.5s;
                }

                @keyframes pb-shadowMovement {
                    0%,
                    49% {
                        opacity: 0.5;
                    }
                    50%,
                    100% {
                        opacity: 0.2;
                    }
                }
            `}</style>

            <div className="pb-ghost">
                <div className="pb-red">
                    <div className="pb-pupil" />
                    <div className="pb-pupil1" />
                    <div className="pb-eye" />
                    <div className="pb-eye1" />
                    <div className="pb-top0" />
                    <div className="pb-top1" />
                    <div className="pb-top2" />
                    <div className="pb-top3" />
                    <div className="pb-top4" />
                    <div className="pb-st0" />
                    <div className="pb-st1" />
                    <div className="pb-st2" />
                    <div className="pb-st3" />
                    <div className="pb-st4" />
                    <div className="pb-st5" />
                    <div className="pb-an1" />
                    <div className="pb-an2" />
                    <div className="pb-an3" />
                    <div className="pb-an4" />
                    <div className="pb-an5" />
                    <div className="pb-an6" />
                    <div className="pb-an7" />
                    <div className="pb-an8" />
                    <div className="pb-an9" />
                    <div className="pb-an10" />
                    <div className="pb-an11" />
                    <div className="pb-an12" />
                    <div className="pb-an13" />
                    <div className="pb-an14" />
                    <div className="pb-an15" />
                    <div className="pb-an16" />
                    <div className="pb-an17" />
                    <div className="pb-an18" />
                </div>
                <div className="pb-shadow" />
            </div>
        </div>
    );
};

export default PixelBounce;