export const EXIT = {
  OK: 0,
  TOOL: 1,
  USAGE: 2,
  AUTH: 3,
} as const;

export class CliError extends Error {
  readonly code: string;
  readonly exitCode: number;

  constructor(code: string, message: string, exitCode: number = EXIT.TOOL) {
    super(message);
    this.name = 'CliError';
    this.code = code;
    this.exitCode = exitCode;
  }
}

export function usage(message: string): never {
  throw new CliError('USAGE_ERROR', message, EXIT.USAGE);
}