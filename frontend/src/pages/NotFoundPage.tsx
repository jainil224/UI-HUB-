import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSeo } from '../components/Seo';
import { CATEGORY_SEO } from '../seo/taxonomy';

export default function NotFoundPage() {
    const location = useLocation();

    useSeo({
        title: 'Page Not Found | UI Hub',
        description:
            'That page does not exist on UI Hub. Browse free React UI components, animated backgrounds, templates and full page sections instead.',
        canonicalPath: '/404',
        robots: 'noindex, follow',
        jsonLd: [],
    });

    return (
        <div className="min-h-screen bg-[#0A0B0D] text-white px-6 py-24 flex items-center">
            <div className="mx-auto w-full max-w-3xl">
                <p className="text-xs font-black uppercase tracking-widest text-neutral-500 mb-4">404</p>
                <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-5">Page not found</h1>
                <p className="text-neutral-400 text-sm sm:text-base mb-8">
                    <code className="text-neutral-300">{location.pathname}</code> does not exist on UI Hub. It may
                    have been renamed, or the link that brought you here may be out of date.
                </p>

                <div className="flex flex-wrap gap-3 mb-12">
                    <Link
                        to="/"
                        className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-black hover:bg-neutral-200 transition-colors"
                    >
                        Go to the home page
                    </Link>
                    <Link
                        to="/library"
                        className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-bold hover:border-white/40 transition-colors"
                    >
                        Browse components
                    </Link>
                    <Link
                        to="/templates"
                        className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-bold hover:border-white/40 transition-colors"
                    >
                        Website templates
                    </Link>
                </div>

                <section aria-labelledby="not-found-categories">
                    <h2 id="not-found-categories" className="text-xs font-black uppercase tracking-widest text-neutral-500 mb-3">
                        Component categories
                    </h2>
                    <ul className="flex flex-wrap gap-2">
                        {CATEGORY_SEO.map((category) => (
                            <li key={category.slug}>
                                <Link
                                    to={`/components/${category.slug}`}
                                    className="inline-block rounded-full border border-white/10 px-3 py-1.5 text-xs text-neutral-300 hover:border-white/30 hover:text-white transition-colors"
                                >
                                    {category.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>
        </div>
    );
}