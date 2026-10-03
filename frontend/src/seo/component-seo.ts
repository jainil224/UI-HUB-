import type { ComponentConfig } from '../data/componentMetadata';
import type { ComponentItem } from '../data/componentData';
import { inferTechs } from './tech';
import type { ComponentSeoInput } from './metadata';
import type { ComponentAeoInput } from './aeo';

export type { ComponentConfig };

/**
 * Assembles the same SEO input the postbuild generator uses, so the prerendered
 * HTML and the client-rendered route always produce identical metadata.
 *
 * `config` is the entry from COMPONENT_CONFIG. It is passed in rather than
 * imported directly because that module is ~1.2 MB and must stay off the
 * critical path; callers load it lazily.
 */
export function toComponentSeoInput(
    item: Pick<ComponentItem, 'id' | 'title' | 'category' | 'description' | 'imageUrl' | 'isPremium' | 'addedAt'>,
    config?: ComponentConfig,
): ComponentSeoInput {
    const vibe = config?.vibeMeta;
    const props = Array.isArray(config?.props) ? config.props : [];

    return {
        id: item.id,
        title: item.title,
        category: item.category,
        description: item.description ?? vibe?.description,
        imageUrl: item.imageUrl,
        isPremium: item.isPremium,
        addedAt: item.addedAt,
        behavior: vibe?.behavior ?? '',
        requirements: Array.isArray(vibe?.requirements) ? vibe.requirements : [],
        propNames: props.map((prop) => prop?.name).filter(Boolean),
        propCount: props.length,
        techs:
            Array.isArray(vibe?.libraries) && vibe.libraries.length > 0
                ? vibe.libraries
                : inferTechs(item.category, item.id),
    };
}

export interface ComponentPropRow {
    name: string;
    type: string;
    default: string;
    description: string;
}

/**
 * Gathers everything `componentAeo()` needs into one plain object.
 *
 * Like `toComponentSeoInput`, this receives `config` rather than importing it,
 * because componentMetadata.ts is ~1.2 MB and must stay off the critical path.
 * The `itemDescription` field is passed through unfiltered on purpose:
 * `componentAeo()` is responsible for rejecting testimonial copy.
 */
export function toComponentAeoInput(
    item: Pick<ComponentItem, 'id' | 'title' | 'category' | 'description' | 'isPremium' | 'vibePrompt' | 'code'>,
    config?: ComponentConfig,
): ComponentAeoInput {
    const vibe = config?.vibeMeta;

    return {
        id: item.id,
        title: item.title,
        category: item.category,
        isPremium: item.isPremium,
        code: item.code,
        vibePrompt: item.vibePrompt,
        itemDescription: item.description,
        vibeDescription: vibe?.description,
        behavior: vibe?.behavior,
        requirements: Array.isArray(vibe?.requirements) ? vibe.requirements : [],
        libraries: Array.isArray(vibe?.libraries) ? vibe.libraries : [],
        cssProperties: Array.isArray(vibe?.cssProperties) ? vibe.cssProperties : [],
        states: vibe?.states,
        props: propRows(config),
    };
}

/** Flattens a COMPONENT_CONFIG entry into rows for the props table. */
export function propRows(config?: ComponentConfig): ComponentPropRow[] {
    const props = Array.isArray(config?.props) ? config.props : [];
    return props
        .filter((prop) => Boolean(prop?.name))
        .map((prop) => ({
            name: String(prop.name),
            type: String(prop.type ?? 'unknown'),
            default: prop.default ? String(prop.default) : '-',
            description: String(prop.description ?? ''),
        }));
}