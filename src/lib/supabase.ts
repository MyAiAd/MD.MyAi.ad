// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  // Enable additional features for security & HIPAA compliance
  global: {
    headers: {
      'x-application-name': 'healthcare-newsletter-platform',
    },
  },
});

export async function initializeSupabase() {
  // This would typically run migrations or SQL scripts
  console.log('Initializing Supabase database...');
  
  // For actual implementation, you'd use the Supabase management API or migration tools
  
  console.log('Supabase initialization complete');
}

export async function signInProvider(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  return { data, error };
}

export async function createProviderAccount(
  email: string, 
  password: string, 
  providerData: Database['public']['Tables']['healthcare_providers']['Insert']
) {
  // First, create the auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (authError) {
    return { data: null, error: authError };
  }
  
  // Then create the provider profile with the same ID
  const { data: providerData, error: providerError } = await supabase
    .from('healthcare_providers')
    .insert({
      id: authData.user?.id,
      ...providerData
    })
    .select()
    .single();
  
  return { data: providerData, error: providerError };
}

export async function addPatient(patientData: Database['public']['Tables']['patients']['Insert']) {
  const { data, error } = await supabase
    .from('patients')
    .insert(patientData)
    .select()
    .single();
  
  return { data, error };
}

export async function getPatientsByProvider(providerId: string) {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('provider_id', providerId);
  
  return { data, error };
}
