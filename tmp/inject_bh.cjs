const fs = require('fs');

const dataPath = 'c:\\Users\\Admin\\Documents\\GitHub\\UI-HUB-\\src\\data\\componentData.tsx';
const bhPath = 'c:\\Users\\Admin\\Documents\\GitHub\\UI-HUB-\\src\\components\\ui\\BlackHoleCursor.tsx';

let data = fs.readFileSync(dataPath, 'utf-8');
const bhCode = fs.readFileSync(bhPath, 'utf-8');

const newEntry = `
    {
        id: "black-hole-cursor",
        title: "Black Hole Cursor",
        category: "cursor",
        preview: () => <BlackHoleCursorPreview />,
        code: \`${bhCode.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`,
        vibePrompt: "Create a stunning black hole gravity cursor effect using Canvas particles that spiral into a central dark core."
    },`;

if (!data.includes('id: "black-hole-cursor"')) {
    data = data.replace('export const componentList: ComponentItem[] = [', 'export const componentList: ComponentItem[] = [' + newEntry);
    fs.writeFileSync(dataPath, data);
    console.log("Injected Black Hole Cursor!");
} else {
    console.log("Already injected.");
}
