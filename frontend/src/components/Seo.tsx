import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from '../seo/site';
import { NOINDEX_PATHS, NOINDEX_PREFIXES } from '../seo/routes';

export interface SeoJsonLd {
    [key: string]: unknown;
}

export interface SeoConfig {
    title: string;
    description: string;
    /** Absolute path or full URL. */
    canonicalPath: string;
    robots?: string;
    ogImage?: string;
    jsonLd?: SeoJsonLd[];
}

const MANAGED_ATTRIBUTE = 'data-seo-managed';

function upsertMeta(selector: string, attribute: 'name' | 'property', key: string, content: string) {
    let element = document.head.querySelector<HTMLMetaElement>(selector);
    if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, key);
        element.setAttribute(MANAGED_ATTRIBUTE, 'true');
        document.head.appendChild(element);
    }
    element.setAttribute('content', content);
}

function upsertCanonical(href: string) {
    let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', 'canonical');
        element.setAttribute(MANAGED_ATTRIBUTE, 'true');
        document.head.appendChild(element);
    }
    element.setAttribute('href', href);
}

function absolute(pathOrUrl: string): string {
    if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
    return `${SITE_URL}${pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`}`;
}

function removeManagedJsonLd() {
    for (const element of Array.from(document.head.querySelectorAll(`script[${MANAGED_ATTRIBUTE}]`))) {
        element.remove();
    }
}

/**
 * Applies per-route head metadata after client-side navigation, so the head
 * always matches the URL the visitor is on. The prerendered HTML already ships
 * the same values, so this keeps SPA navigation consistent with it.
 */
export function useSeo({ title, description, canonicalPath, robots, ogImage, jsonLd }: SeoConfig) {
    useEffect(() => {
        const canonical = absolute(canonicalPath);
        const image = absolute(ogImage ?? DEFAULT_OG_IMAGE);

        document.title = title;

        upsertMeta('meta[name="description"]', 'name', 'description', description);
        upsertCanonical(canonical);
        upsertMeta('meta[name="robots"]', 'name', 'robots', robots ?? 'index, follow');
        upsertMeta('meta[property="og:title"]', 'property', 'og:title', title);
        upsertMeta('meta[property="og:description"]', 'property', 'og:description', description);
        upsertMeta('meta[property="og:url"]', 'property', 'og:url', canonical);
        upsertMeta('meta[property="og:site_name"]', 'property', 'og:site_name', SITE_NAME);
        upsertMeta('meta[property="og:image"]', 'property', 'og:image', image);
        upsertMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title);
        upsertMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
        upsertMeta('meta[name="twitter:image"]', 'name', 'twitter:image', image);

        removeManagedJsonLd();
        for (const schema of jsonLd ?? []) {
            const script = document.createElement('script');
            script.type = 'application/ld+json';
            script.setAttribute(MANAGED_ATTRIBUTE, 'true');
            script.textContent = JSON.stringify(schema);
            document.head.appendChild(script);
        }
    }, [title, description, canonicalPath, robots, ogImage, jsonLd]);
}

export function Seo(_config: SeoConfig) {
    return null;
}

function isPrivatePath(pathname: string): boolean {
    const normalized = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
    if (NOINDEX_PATHS.some((rule) => rule.path === normalized)) return true;
    return NOINDEX_PREFIXES.some((rule) => pathname.startsWith(rule.prefix));
}

/**
 * Private routes (library, favorites, dashboard, admin, auth, demos) are served
 * through the SPA fallback, which resolves to the prerendered home document.
 * Without this guard they would inherit the home page's canonical URL, pointing
 * search engines at the wrong page. Mount once inside the Router.
 */
export function RouteSeoGuard() {
    const location = useLocation();

    useEffect(() => {
        if (!isPrivatePath(location.pathname)) return;

        upsertMeta('meta[name="robots"]', 'name', 'robots', 'noindex, nofollow');
        for (const element of Array.from(document.head.querySelectorAll('link[rel="canonical"]'))) {
            element.removeAttribute('href');
        }
    }, [location.pathname]);

    return null;
}