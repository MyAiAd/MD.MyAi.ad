// src/types/express-session.d.ts
declare module 'express-session' { 
  import { Store } from 'express-session';
  import { EventEmitter } from 'events';
  
  interface SessionData {
    cookie: SessionCookieData;
    [key: string]: any;
  }
  
  interface SessionCookieData {
    originalMaxAge: number;
    path: string;
    maxAge: number | null;
    secure?: boolean;
    httpOnly?: boolean;
    domain?: string;
    expires?: Date | null;
    sameSite?: boolean | 'lax' | 'strict' | 'none';
  }
  
  interface SessionCookieOptions {
    path?: string;
    maxAge?: number;
    secure?: boolean;
    httpOnly?: boolean;
    domain?: string;
    expires?: Date | null;
    sameSite?: boolean | 'lax' | 'strict' | 'none';
  }
  
  interface SessionOptions {
    secret: string | string[];
    name?: string;
    store?: Store;
    cookie?: SessionCookieOptions;
    genid?: (req: any) => string;
    rolling?: boolean;
    resave?: boolean;
    proxy?: boolean;
    saveUninitialized?: boolean;
    unset?: 'destroy' | 'keep';
  }
  
  class Session {
    id: string;
    cookie: SessionCookieData;
    
    constructor(req: any, data?: SessionData);
    
    regenerate(callback: (err?: any) => void): void;
    destroy(callback: (err?: any) => void): void;
    reload(callback: (err?: any) => void): void;
    save(callback: (err?: any) => void): void;
    touch(): void;
  }
  
  abstract class Store extends EventEmitter {
    constructor(options?: any);
    
    regenerate(req: any, fn: (err?: any, session?: Session) => void): void;
    load(sid: string, fn: (err: any, session?: Session) => void): void;
    createSession(req: any, session: SessionData): Session;
    
    get(sid: string, callback: (err: any, session?: SessionData | null) => void): void;
    set(sid: string, session: SessionData, callback?: (err?: any) => void): void;
    destroy(sid: string, callback?: (err?: any) => void): void;
    touch(sid: string, session: SessionData, callback?: (err?: any) => void): void;
    all?(callback: (err: any, obj?: { [sid: string]: SessionData } | null) => void): void;
    length?(callback: (err: any, length?: number) => void): void;
    clear?(callback?: (err?: any) => void): void;
  }
  
  interface SessionRequest {
    session: Session & SessionData;
    sessionID: string;
  }
  
  function session(options: SessionOptions): (req: any, res: any, next: any) => void;
  
  namespace session {
    var Store: typeof Store;
  }
  
  export = session;
}
