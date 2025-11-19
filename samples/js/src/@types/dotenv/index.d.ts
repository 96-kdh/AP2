export interface DotenvConfigOutput { parsed?: Record<string, string>; }
export interface DotenvConfigOptions { path?: string; }
export function config(options?: DotenvConfigOptions): DotenvConfigOutput;
const dotenv: { config: typeof config };
export default dotenv;
