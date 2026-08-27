declare module "threejs-components" {
    const cursors: {
        particles1: (canvas: HTMLCanvasElement, opts?: Record<string, unknown>) => any;
    };
    const threejsComponents: {
        cursors: typeof cursors;
    };
    export default threejsComponents;
}
