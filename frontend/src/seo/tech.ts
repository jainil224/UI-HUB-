/**
 * Conservative technology inference for components that have no
 * `vibeMeta.libraries` entry in componentMetadata.ts.
 *
 * Only claims that are true of the whole library are inferred. Per-component
 * library claims come from real metadata, never from a guess.
 */
export function inferTechs(category: string, id: string): string[] {
    const techs = ['react'];

    if (category === '3d') {
        techs.push('three');
    }

    if (/spline/i.test(id)) {
        techs.push('@splinetool/react-spline');
    }

    return techs;
}