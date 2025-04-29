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

// We'll use a singleton pattern to avoid recreating the admin instance on each request
let admin: AdminJS | null = null;
let adminRouter: any = null;

const getAdminRouter = async () => {
  if (adminRouter) {
    return adminRouter;
  }
  
  // Set up AdminJS
  const config = await getAdminJSConfig();
  admin = new AdminJS(config);
  
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
  adminRouter = AdminJSExpress.buildAuthenticatedRouter(
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
  
  return adminRouter;
};

export default async function adminHandler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const router = await getAdminRouter();
    
    // Here we manually handle the request
    // We need to adapt NextJS req/res to Express req/res
    
    // Adapted from: https://github.com/vercel/next.js/discussions/9419#discussioncomment-217258
    
    // Create a simple middleware runner
    const runMiddleware = (middleware: Function) => {
      return new Promise((resolve, reject) => {
        middleware(req, res, (result: Error | null) => {
          if (result instanceof Error) {
            return reject(result);
          }
          return resolve(result);
        });
      });
    };
    
    // Get the path that should be passed to the admin router
    const adminPath = req.url?.replace(/^\/api\/admin/, '') || '/';
    
    // Modify the URL for the admin router
    req.url = adminPath;
    
    // Run the admin router as middleware
    await runMiddleware(router);
    
  } catch (error) {
    console.error('Admin API error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
