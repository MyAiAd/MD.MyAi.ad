// src/pages/api/auth/register.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { providerAuthSchema, providerSchema } from '@/lib/validations/provider';

// Combined schema for registration
const registerSchema = providerAuthSchema.merge(providerSchema);
type RegisterInput = z.infer<typeof registerSchema>;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: 'Method not allowed' } });
  }

  try {
    // Validate request body
    const validatedData = registerSchema.parse(req.body);
    const { email, password, ...providerData } = validatedData;

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      throw authError;
    }

    if (!authData.user) {
      throw new Error('Failed to create user');
    }

    // Create provider profile in the database
    const { data: provider, error: providerError } = await supabase
      .from('healthcare_providers')
      .insert({
        id: authData.user.id,
        email: authData.user.email,
        ...providerData,
      })
      .select()
      .single();

    if (providerError) {
      // Attempt to clean up the auth user if provider creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw providerError;
    }

    return res.status(201).json({ data: { provider } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: { message: 'Validation failed', details: error.errors } });
    }

    if (error instanceof Error) {
      return res.status(400).json({ error: { message: error.message } });
    }

    return res.status(500).json({ error: { message: 'Internal server error' } });
  }
}
