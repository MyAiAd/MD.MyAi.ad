// src/types/formidable.d.ts
declare module 'formidable' {
  import { IncomingMessage } from 'http';
  
  export interface Fields {
    [key: string]: string | string[];
  }
  
  export interface Files {
    [key: string]: {
      size: number;
      path: string;
      name: string;
      type: string;
      lastModifiedDate?: Date;
      hash?: string;
      [key: string]: any;
    };
  }
  
  export interface Options {
    encoding?: string;
    uploadDir?: string;
    keepExtensions?: boolean;
    maxFieldsSize?: number;
    maxFields?: number;
    maxFileSize?: number;
    hash?: boolean | string;
    multiples?: boolean;
    type?: string;
    [key: string]: any;
  }
  
  export class IncomingForm {
    constructor(options?: Options);
    
    parse(req: IncomingMessage, callback?: (err: Error | null, fields: Fields, files: Files) => void): void;
    
    parse(req: IncomingMessage): Promise<[Fields, Files]>;
    
    onPart?: (part: any) => void;
    
    handlePart?: (part: any) => void;
    
    on(event: string, handler: (...args: any[]) => void): this;
  }
  
  export function parse(req: IncomingMessage, options?: Options): Promise<{ fields: Fields, files: Files }>;
}
