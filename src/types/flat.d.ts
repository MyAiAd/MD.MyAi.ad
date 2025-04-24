declare module 'flat' {
  interface FlattenOptions {
    delimiter?: string;
    maxDepth?: number;
    safe?: boolean;
    transformKey?: (key: string) => string;
  }

  interface UnflattenOptions {
    delimiter?: string;
    object?: boolean;
    overwrite?: boolean;
    transformKey?: (key: string) => string;
  }
  
  export function flatten(
    target: any,
    options?: FlattenOptions | string
  ): { [key: string]: any };
  
  export function unflatten(
    target: any,
    options?: UnflattenOptions | string
  ): { [key: string]: any };
  
  const flat: {
    flatten: typeof flatten;
    unflatten: typeof unflatten;
  };
  
  export default flat;
}
