// src/types/express.d.ts
declare module 'express' {
  import * as http from 'http';
  import * as events from 'events';

  export interface Request extends http.IncomingMessage {
    app: Application;
    baseUrl: string;
    body: any;
    cookies: { [key: string]: string };
    fresh: boolean;
    hostname: string;
    ip: string;
    ips: string[];
    method: string;
    originalUrl: string;
    params: { [key: string]: string };
    path: string;
    protocol: string;
    query: { [key: string]: string | string[] };
    route: any;
    secure: boolean;
    signedCookies: { [key: string]: string };
    stale: boolean;
    subdomains: string[];
    xhr: boolean;
    accepts(types: string[]): string | false;
    accepts(...types: string[]): string | false;
    acceptsCharsets(charset?: string[]): string | false;
    acceptsEncodings(encoding?: string[]): string | false;
    acceptsLanguages(lang?: string[]): string | false;
    get(name: string): string;
    is(type: string): boolean;
    range(size: number): any[];
  }

  export interface Response extends http.ServerResponse {
    app: Application;
    headersSent: boolean;
    locals: any;
    append(field: string, value: string | string[]): this;
    attachment(filename?: string): this;
    cookie(name: string, val: string, options?: any): this;
    clearCookie(name: string, options?: any): this;
    download(path: string, filename?: string, callback?: (err?: Error) => void): void;
    format(obj: any): this;
    get(field: string): string;
    json(body?: any): this;
    jsonp(body?: any): this;
    links(links: { [key: string]: string }): this;
    location(url: string): this;
    redirect(url: string): void;
    redirect(status: number, url: string): void;
    render(view: string, options?: object, callback?: (err: Error, html: string) => void): void;
    send(body?: any): this;
    sendFile(path: string, options?: object, callback?: (err?: Error) => void): void;
    sendStatus(statusCode: number): this;
    set(field: string, value: string | string[]): this;
    status(code: number): this;
    type(type: string): this;
    vary(field: string): this;
  }

  export interface NextFunction {
    (err?: any): void;
  }

  export interface RequestHandler {
    (req: Request, res: Response, next: NextFunction): any;
  }

  export interface ErrorRequestHandler {
    (err: any, req: Request, res: Response, next: NextFunction): any;
  }

  export interface Application extends events.EventEmitter {
    locals: any;
    mountpath: string;
    listen(port: number, hostname?: string, callback?: Function): http.Server;
    listen(port: number, callback?: Function): http.Server;
    listen(path: string, callback?: Function): http.Server;
    listen(handle: any, callback?: Function): http.Server;
    disable(name: string): this;
    disabled(name: string): boolean;
    enable(name: string): this;
    enabled(name: string): boolean;
    engine(ext: string, fn: Function): this;
    get(name: string): any;
    get(path: string, ...handlers: RequestHandler[]): this;
    set(name: string, value: any): this;
    path(): string;
    render(name: string, options?: object, callback?: (err: Error, html: string) => void): void;
    route(path: string): any;
    use(path: string, ...handlers: RequestHandler[]): this;
    use(...handlers: RequestHandler[]): this;
    all(path: string, ...handlers: RequestHandler[]): this;
    post(path: string, ...handlers: RequestHandler[]): this;
    put(path: string, ...handlers: RequestHandler[]): this;
    delete(path: string, ...handlers: RequestHandler[]): this;
    patch(path: string, ...handlers: RequestHandler[]): this;
    options(path: string, ...handlers: RequestHandler[]): this;
    head(path: string, ...handlers: RequestHandler[]): this;
  }

  export function Router(options?: any): Application;
  export function static(root: string, options?: any): RequestHandler;
  export function json(options?: any): RequestHandler;
  export function urlencoded(options?: any): RequestHandler;
  export function raw(options?: any): RequestHandler;
  export function text(options?: any): RequestHandler;

  export interface Express {
    (): Application;
    application: Application;
    request: Request;
    response: Response;
    static: typeof static;
    Router: typeof Router;
  }

  const e: Express;
  export default e;
}
