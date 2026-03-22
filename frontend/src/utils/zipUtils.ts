import JSZip from 'jszip';

/**
 * Downloads a ZIP file containing the component's React code, Vanilla code, and assets.
 * @param componentId The ID of the component.
 * @param title The title of the component.
 * @param assets An array of asset URLs to include in the ZIP.
 * @param reactCode The React source code.
 * @param vanillaCode The Vanilla HTML/CSS/JS code.
 */
export const downloadComponentZip = async (
    componentId: string,
    title: string,
    assets: { url: string; fileName: string }[],
    reactCode: string,
    vanillaCode: string
) => {
    const zip = new JSZip();

    // Add source code
    zip.file('README.md', `# ${title}\n\nThis ZIP contains the React and Vanilla versions of the ${title} component from UI HUB.\n\n## Contents\n- \`Component.tsx\`: React version of the component.\n- \`index.html\`: Standalone Vanilla HTML/CSS/JS version.\n- \`assets/\`: Required images and assets.`);
    zip.file('Component.tsx', reactCode);
    zip.file('index.html', vanillaCode);

    // Add assets folder
    const assetsFolder = zip.folder('assets');
    
    // Fetch and add assets
    const assetPromises = assets.map(async (asset) => {
        try {
            const response = await fetch(asset.url);
            const blob = await response.blob();
            assetsFolder?.file(asset.fileName, blob);
        } catch (error) {
            console.error(`Failed to fetch asset: ${asset.url}`, error);
        }
    });

    await Promise.all(assetPromises);

    // Generate ZIP
    const content = await zip.generateAsync({ type: 'blob' });
    
    // Download using a hidden <a> tag
    const url = URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${componentId}-ui-hub.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
