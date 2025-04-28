// src/pages/api/admin/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import Connect from 'connect-pg-simple';
import session from 'express-session';
import express from 'express';
import { getAdminJSConfig } from '@/admin/adminjs';
import { supabase } from '@/lib/supabase';

// This file sets up the AdminJS server using API routes
// For production, you would typically use a custom server.js

const setup = async () => {
  const app = express();
  const config = await getAdminJSConfig();
  const admin = new AdminJS(config);
  
  // Set up session store
  const ConnectSession = Connect(session);
  
  // Ensure DATABASE_URL is available or use a default value
  const databaseUrl = process.env.DATABASE_URL || '';
  if (!databaseUrl) {
    console.warn('DATABASE_URL is not set. Admin sessions may not work properly.');
  }
  
  const sessionStore = new ConnectSession({
    conObject: {
      connectionString: databaseUrl,
      ssl: process.env.NODE_ENV === 'production',
    },
    tableName: 'admin_sessions',
  });
  
  // Configure admin router with authentication
  const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
    admin,
    {
      authenticate: async (email, password) => {
        // Authenticate against Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error || !data.user) {
          return false;
        }
        
        // Check if user exists as a healthcare provider
        const { data: provider, error: providerError } = await supabase
          .from('healthcare_providers')
          .select('*')
          .eq('id', data.user.id)
          .single();
          
        if (providerError || !provider) {
          return false;
        }
        
        // Return admin user data
        return {
          id: data.user.id,
          email: data.user.email,
          firstName: provider.name.split(' ')[0],
          lastName: provider.name.split(' ').slice(1).join(' '),
          avatar: null,
        };
      },
      cookieName: 'adminjs',
      cookiePassword: process.env.COOKIE_SECRET || 'complex-secure-cookie-password-at-least-32-characters',
    },
    null,
    {
      store: sessionStore,
      resave: false,
      saveUninitialized: false,
      secret: process.env.COOKIE_SECRET || 'complex-secure-cookie-password-at-least-32-characters',
      cookie: {
        httpOnly: process.env.NODE_ENV === 'production',
        secure: process.env.NODE_ENV === 'production',
      },
      name: 'adminjs',
    }
  );
  
  // Use the admin router
  app.use(admin.options.rootPath, adminRouter);
  
  return app;
};

// Define a proper type for the handler
let handler: express.Application | null = null;

export default async function adminHandler(req: NextApiRequest, res: NextApiResponse) {
  if (!handler) {
    const app = await setup();
    handler = app;
  }
  
  // Forward the request to the express app
  return handler(req, res);
}
