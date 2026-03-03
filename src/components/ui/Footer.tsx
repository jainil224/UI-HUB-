import React from 'react';
import { Github, Twitter, Linkedin, Instagram } from 'lucide-react';

const Footer = () => (
    <footer className="py-12 px-6 border-t border-white/5 bg-brand-black/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-brand-green rounded-sm flex items-center justify-center font-display text-xl text-black">U</div>
                <span className="font-heading font-bold text-xl tracking-tighter">UI HUB</span>
            </div>

            <div className="flex items-center gap-6">
                <a href="#" className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-brand-green"><Github size={20} /></a>
                <a href="#" className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-brand-green"><Twitter size={20} /></a>
                <a href="#" className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-brand-green"><Linkedin size={20} /></a>
                <a href="#" className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-brand-green"><Instagram size={20} /></a>
            </div>

            <p className="text-white/20 text-xs font-mono">© 2026 UI HUB. BUILT FOR VIBE CODERS.</p>
        </div>
    </footer>
);

export default Footer;
