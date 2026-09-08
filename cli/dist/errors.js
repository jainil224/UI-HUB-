export const EXIT = {
    OK: 0,
    TOOL: 1,
    USAGE: 2,
    AUTH: 3,
};
export class CliError extends Error {
    code;
    exitCode;
    constructor(code, message, exitCode = EXIT.TOOL) {
        super(message);
        this.name = 'CliError';
        this.code = code;
        this.exitCode = exitCode;
    }
}
export function usage(message) {
    throw new CliError('USAGE_ERROR', message, EXIT.USAGE);
}
