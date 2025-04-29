// src/lib/middleware/validate.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

export type ApiHandler = (
  req: NextApiRequest,
  res: NextApiResponse
) => Promise<void | NextApiResponse>;

export function validateRequest(schema: z.AnyZodObject) {
  return (handler: ApiHandler) => {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      try {
        // Validate the request body against the schema
        if (req.body) {
          req.body = schema.parse(req.body);
        }
        
        // Call the API handler
        return handler(req, res);
      } catch (error) {
        if (error instanceof z.ZodError) {
          // Return validation errors
          return res.status(400).json({
            error: {
              message: 'Validation failed',
              errors: error.errors,
            },
          });
        }
        
        // Other errors
        console.error('API validation error:', error);
        return res.status(500).json({
          error: {
            message: 'Internal server error during validation',
          },
        });
      }
    };
  };
}
