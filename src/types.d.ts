declare module 'jsonwebtoken' {
  export function sign(payload: string | object | Buffer, secretOrPrivateKey: string, options?: SignOptions): string;
  export function verify(token: string, secretOrPublicKey: string): any;
  export function decode(token: string, options?: DecodeOptions): any;

  export interface SignOptions {
    algorithm?: string;
    expiresIn?: string | number;
    notBefore?: string | number;
    audience?: string | string[];
    issuer?: string;
    jwtid?: string;
    subject?: string;
    noTimestamp?: boolean;
    header?: object;
    encoding?: string;
    keyid?: string;
  }

  export interface DecodeOptions {
    complete?: boolean;
    json?: boolean;
  }
}

declare module 'ws' {
  export class WebSocket {
    constructor(address: string, options?: WebSocket.ClientOptions);
    on(event: string, listener: (...args: any[]) => void): this;
    send(data: any, cb?: (err?: Error) => void): void;
    close(code?: number, data?: string): void;
  }

  export namespace WebSocket {
    interface ClientOptions {
      protocol?: string | string[];
      handshakeTimeout?: number;
      perMessageDeflate?: boolean | PerMessageDeflateOptions;
      maxPayload?: number;
      followRedirects?: boolean;
      headers?: { [key: string]: string };
    }

    interface PerMessageDeflateOptions {
      serverNoContextTakeover?: boolean;
      clientNoContextTakeover?: boolean;
      serverMaxWindowBits?: number;
      clientMaxWindowBits?: number;
      zlibDeflateOptions?: {
        level?: number;
      };
      zlibInflateOptions?: {
        chunkSize?: number;
      };
      threshold?: number;
      concurrencyLimit?: number;
    }
  }
}

declare module 'eslint' {
  export interface Linter {
    verify(code: string, config: any): LintMessage[];
  }

  export interface LintMessage {
    ruleId: string | null;
    severity: number;
    message: string;
    line: number;
    column: number;
    nodeType: string;
    messageId: string;
    endLine?: number;
    endColumn?: number;
    fix?: Fix;
  }

  export interface Fix {
    range: [number, number];
    text: string;
  }
} 