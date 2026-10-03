import { CATEGORY_BY_SLUG, categoryLabel, categorySingular } from './taxonomy';
import {
    SITE_NAME,
    clampDescription,
    clampTitle,
    indefiniteArticle,
    lowerPhrase,
} from './site';

export interface ComponentSeoInput {
    id: string;
    title: string;
    category: string;
    description?: string;
    imageUrl?: string;
    isPremium?: boolean;
    addedAt?: string;
    techs: string[];
    behavior?: string;
    requirements?: string[];
    propNames: string[];
    propCount: number;
}

export interface TemplateSeoInput {
    id: string;
    title: string;
    description: string;
    category: string;
    framework: string;
    styling: string;
    animation: string;
    isPro: boolean;
    imageUrl?: string;
    features: string[];
}

const TECH_LABELS: Record<string, string> = {
    react: 'React',
    'framer-motion': 'Framer Motion',
    'motion/react': 'Motion',
    gsap: 'GSAP',
    '@gsap/react': 'GSAP',
    'lucide-react': 'Lucide React',
    'react-icons': 'React Icons',
    three: 'Three.js',
    '@splinetool/react-spline': 'Spline',
    'd3-geo': 'D3',
    'tailwind-merge': 'Tailwind CSS',
    clsx: '',
};

export function techLabels(techs: string[]): string[] {
    const mapped = techs.map((tech) => TECH_LABELS[tech] ?? tech.trim()).filter(Boolean);
    return Array.from(new Set(mapped));
}

export function technologyPhrase(techs: string[]): string {
    const labels = techLabels(techs);
    if (labels.length === 0) return 'React';
    if (labels.length === 1) return labels[0];
    return `${labels.slice(0, -1).join(', ')} and ${labels[labels.length - 1]}`;
}

export function componentPath(component: Pick<ComponentSeoInput, 'category' | 'id'>): string {
    return `/components/${component.category}/${component.id}`;
}

function firstMatching(candidates: string[]): string {
    for (const candidate of candidates) {
        if (candidate.length <= 60) return candidate;
    }
    return clampTitle(candidates[candidates.length - 1]);
}

export function componentTitle(component: ComponentSeoInput): string {
    const singular = categorySingular(component.category);
    const tech = techLabels(component.techs);
    const head = tech.length > 0 ? `${component.title} – ${singular} in ${tech[0]}` : `${component.title} – ${singular}`;

    return firstMatching([
        `${head} | ${SITE_NAME}`,
        `${component.title} – ${singular} | ${SITE_NAME}`,
        `${component.title} | ${SITE_NAME}`,
    ]);
}

function firstSentence(value: string, limit = 220): string {
    const clean = value.trim().replace(/\s+/g, ' ');
    if (clean.length <= limit) return clean;
    const cut = clean.slice(0, limit);
    const boundary = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '));
    return boundary > 60 ? cut.slice(0, boundary + 1) : `${cut.trimEnd()}…`;
}

export function componentDescription(component: ComponentSeoInput): string {
    if (component.description && component.description.trim().length > 30) {
        return clampDescription(component.description.trim());
    }
    if (component.behavior && component.behavior.trim().length > 30) {
        const singular = lowerPhrase(categorySingular(component.category));
        const behaviour = firstSentence(component.behavior, 150);
        return clampDescription(
            `${component.title} is ${indefiniteArticle(singular)} ${singular} built with ${technologyPhrase(component.techs)}. ${behaviour}`,
        );
    }
    const singular = lowerPhrase(categorySingular(component.category));
    return clampDescription(
        `${component.title} is a copy-and-paste ${singular} built with ${technologyPhrase(component.techs)}. Preview it live, read the documented props, then copy it into your project.`,
    );
}

export function componentIntro(component: ComponentSeoInput): string {
    const label = categoryLabel(component.category);
    const singular = lowerPhrase(categorySingular(component.category));
    const article = indefiniteArticle(singular);
    const tech = technologyPhrase(component.techs);
    const paragraphs: string[] = [];

    if (component.behavior && component.behavior.trim().length > 30) {
        paragraphs.push(`**${component.title}** is ${article} ${singular} in the UI HUB ${lowerPhrase(label)} collection. ${firstSentence(component.behavior, 320)}`);
    } else {
        paragraphs.push(
            `**${component.title}** is ${article} ${singular} in the UI HUB ${lowerPhrase(label)} collection. It is built with ${tech} and ships as a self-contained component you can copy into an existing project without pulling in a component library.`,
        );
    }

    if (component.propCount > 0) {
        const names = component.propNames.slice(0, 6).map((name) => `\`${name}\``);
        const more = component.propCount > names.length ? ` and ${component.propCount - names.length} more` : '';
        paragraphs.push(
            `The component is driven by ${component.propCount} documented prop${component.propCount === 1 ? '' : 's'} (${names.join(', ')}${more}), so colours, intensity, timing and density can be tuned from the call site instead of being hard-coded.`,
        );
    } else {
        paragraphs.push(
            'The component works without configuration, and can be restyled through its own class names and CSS custom properties.',
        );
    }

    if (component.requirements && component.requirements.length > 0) {
        const requirements = component.requirements.slice(0, 3).map((item) => item.replace(/\.$/, ''));
        paragraphs.push(`Implementation notes: ${requirements.join('; ')}.`);
    }

    paragraphs.push(
        `Preview the ${singular} in the browser above, copy the source, and paste it into your project. ${label} components in UI HUB are grouped by category so you can compare effects side by side before choosing one.`,
    );

    return paragraphs.join('\n\n');
}

export function categoryTitle(slug: string, itemCount: number): string {
    const category = CATEGORY_BY_SLUG[slug];
    const label = category?.label ?? categoryLabel(slug);
    return firstMatching([
        `${label} for Websites – Free React Code | ${SITE_NAME}`,
        `${label} – Free React Code | ${SITE_NAME}`,
        `${label} | ${SITE_NAME}`,
    ]);
}

export function categoryDescription(slug: string, itemCount: number): string {
    const category = CATEGORY_BY_SLUG[slug];
    if (!category) return '';
    const secondary = category.secondaryKeywords[0] ?? category.primaryKeyword;

    const withSecondary = `Browse ${itemCount} free ${category.primaryKeyword} examples built with React and Tailwind CSS. Live preview, documented props and copy-paste code for ${secondary}.`;
    if (withSecondary.length <= 160) return withSecondary;

    const withoutSecondary = `Browse ${itemCount} free ${category.primaryKeyword} examples built with React and Tailwind CSS. Live preview, documented props and copy-paste code.`;
    return clampDescription(withoutSecondary);
}

export function categoryIntro(slug: string, itemCount: number, sampleTitles: string[]): string {
    const category = CATEGORY_BY_SLUG[slug];
    if (!category) return '';
    const paragraphs = [category.intro];
    if (sampleTitles.length > 0) {
        const sample = sampleTitles.slice(0, 5).join(', ');
        paragraphs.push(
            `This category currently contains ${itemCount} component${itemCount === 1 ? '' : 's'}, including ${sample}. Each one opens on its own page with a live preview, a documented props table and the full source.`,
        );
    } else {
        paragraphs.push(
            `This category currently contains ${itemCount} component${itemCount === 1 ? '' : 's'}. Each one opens on its own page with a live preview, a documented props table and the full source.`,
        );
    }
    paragraphs.push(
        `Looking for a different effect? Browse the other UI HUB component categories, or use site search to filter every component by name.`,
    );
    return paragraphs.join('\n\n');
}

export function templateTitle(template: TemplateSeoInput): string {
    const type = template.category && template.category !== 'All' ? template.category : 'Website';
    return firstMatching([
        `${template.title} – Free ${type} Template | ${SITE_NAME}`,
        `${template.title} – ${type} Template | ${SITE_NAME}`,
        `${template.title} Template | ${SITE_NAME}`,
        `${template.title} | ${SITE_NAME}`,
    ]);
}

export function templateDescription(template: TemplateSeoInput): string {
    if (template.description && template.description.trim().length > 40) {
        return clampDescription(template.description.trim());
    }
    return clampDescription(
        `${template.title} is a ${template.framework} template styled with ${template.styling}. Preview the live site and inspect the animation approach before you use it.`,
    );
}

export function templateIntro(template: TemplateSeoInput): string {
    const paragraphs = [
        `**${template.title}** is a complete ${template.category !== 'All' ? template.category.toLowerCase() : 'website'} template built with ${template.framework} and ${template.styling}. ${template.description}`,
    ];
    paragraphs.push(
        `The animation system uses ${template.animation}, which is documented here so you can judge the motion before wiring the template into a project.`,
    );
    if (template.features.length > 0) {
        const features = template.features.slice(0, 5).map((feature) => feature.replace(/\.$/, ''));
        paragraphs.push(`Included in this template: ${features.join('; ')}.`);
    }
    paragraphs.push(
        `Open the live preview to browse the sections, then use the source and deployment details on the template page. Templates are grouped by category on the UI HUB templates index so you can compare similar layouts directly.`,
    );
    return paragraphs.join('\n\n');
}