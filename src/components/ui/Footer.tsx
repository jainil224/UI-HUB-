import React from 'react';
import { Github, Twitter, Linkedin, Instagram } from 'lucide-react';

const Footer = () => (
    <footer className="fixed bottom-0 w-full z-50 py-12 px-6 border-t border-white/5 bg-brand-black/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-brand-green rounded-sm flex items-center justify-center font-display text-xl text-black">U</div>
                <span className="font-heading font-bold text-xl tracking-tighter">UI HUB</span>
            </div>

            <div className="flex items-center gap-6">
                <a href="https://github.com/jainil224" target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-brand-green"><Github size={20} /></a>
                <a href="#" className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-brand-green"><Twitter size={20} /></a>
                <a href="https://www.linkedin.com/in/jainil-patel2224" target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-brand-green"><Linkedin size={20} /></a>
                <a href="https://www.instagram.com/jainilll_2208/" target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-brand-green"><Instagram size={20} /></a>
            </div>

            <p className="text-white/20 text-xs font-mono">
                <span className="animate-lightning-blink">© 2026 UI HUB. BUILT FOR VIBE CODERS.</span> <br className="md:hidden" />
                <span className="md:ml-2 animate-lightning-blink-purple">Made with ❤️ by Jainil Patel</span>
            </p>
        </div>
    </footer>
);

export default Footer;
