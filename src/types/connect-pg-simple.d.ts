// src/types/connect-pg-simple.d.ts
declare module 'connect-pg-simple' {
  import session from 'express-session';
  
  interface ConnectPgSimpleOptions {
    conObject: {
      connectionString: string;
      ssl?: boolean;
    };
    tableName?: string;
    schemaName?: string;
    ttl?: number;
    pruneSessionInterval?: boolean | number;
    errorLog?: (error: Error) => void;
  }
  
  function ConnectPgSimple(session: typeof import('express-session')): new (options: ConnectPgSimpleOptions) => session.Store;
  
  export = ConnectPgSimple;
}
