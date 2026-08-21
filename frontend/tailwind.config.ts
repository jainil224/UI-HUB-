import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        './index.html',
        './src/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                'brand-bg': '#0A0A0A',
                'brand-surface': '#141414',
                'brand-surface-alt': '#1C1C1C',
                'brand-blue': '#3D5CFF',
                'brand-blue-dark': '#2540D6',
                'brand-red': '#FF3B30',
                'brand-yellow': '#FFC700',
                'brand-green': '#3D5CFF', // Re-route legacy brand-green to primary blue
                'brand-black': '#000000',
                'neon-bright': '#3D5CFF',
                'neon-mid': '#3D5CFF',
                'neon-deep': '#2540D6',
                'neon-glow': '#141414',
                'text-primary': '#FFFFFF',
                'text-secondary': '#A3A3A3',
                'text-muted': '#6B6B6B',
            },
            boxShadow: {
                'brutal-blue': '4px 4px 0px 0px #3D5CFF',
                'brutal-blue-sm': '2px 2px 0px 0px #3D5CFF',
                'brutal-white': '4px 4px 0px 0px #FFFFFF',
                'brutal-white-sm': '2px 2px 0px 0px #FFFFFF',
                'brutal-red': '4px 4px 0px 0px #FF3B30',
                'brutal-red-sm': '2px 2px 0px 0px #FF3B30',
                'brutal-yellow': '4px 4px 0px 0px #FFC700',
                'brutal-yellow-sm': '2px 2px 0px 0px #FFC700',
                'brutal-black': '4px 4px 0px 0px #000000',
                'brutal-black-sm': '2px 2px 0px 0px #000000',
                // Keep backward-compatible names mapped to hard shadows
                'glow-green': '4px 4px 0px 0px #3D5CFF',
                'glow-green-md': '4px 4px 0px 0px #3D5CFF',
                'glow-green-lg': '6px 6px 0px 0px #3D5CFF',
                'neon': '4px 4px 0px 0px #3D5CFF',
            },
            fontFamily: {
                display: ['Orbitron', 'sans-serif'],
                heading: ['Space+Grotesk', 'sans-serif'],
                serif: ['"Source Serif 4"', 'Georgia', 'serif'],
            },
            backgroundColor: {
                'black-rgb': 'rgb(10, 10, 10)',
            },
        },
    },
    plugins: [],
}

export default config
