// Minimal Node.js shims for the demo build environment.
declare var process: any;
declare var __dirname: string;
declare var module: any;
declare function require(path: string): any;
declare namespace require {
  const main: any;
}

declare class Buffer {
  static concat(list: Buffer[]): Buffer;
  toString(encoding?: string): string;
}

declare module "http" {
  import { EventEmitter } from "events";
  interface IncomingMessage extends EventEmitter {
    url?: string;
    method?: string;
    headers: Record<string, string | undefined>;
    on(event: string, listener: (...args: any[]) => void): this;
  }
  interface ServerResponse {
    writeHead(statusCode: number, headers?: Record<string, string>): void;
    end(chunk?: any): void;
  }
  interface Server extends EventEmitter {
    listen(port: number, host?: string, callback?: () => void): void;
    close(callback?: (err?: Error) => void): void;
    on(event: string, listener: (...args: any[]) => void): this;
  }
  function createServer(listener: (req: IncomingMessage, res: ServerResponse) => void): Server;
  export { IncomingMessage, ServerResponse, Server, createServer };
}

declare module "child_process" {
  import { EventEmitter } from "events";
  interface ChildProcess extends EventEmitter {
    kill(signal?: string): void;
    on(event: string, listener: (code?: number) => void): this;
  }
  function spawn(command: string, args?: string[], options?: any): ChildProcess;
  export { spawn, ChildProcess };
}

declare module "fs" {
  function existsSync(path: string): boolean;
  export { existsSync };
}

declare module "path" {
  function resolve(...paths: string[]): string;
  export { resolve };
}
