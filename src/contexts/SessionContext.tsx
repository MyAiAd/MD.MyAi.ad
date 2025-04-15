// src/contexts/SessionContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type SessionContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  refreshSession: () => Promise<void>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionContextType>({
  session: null,
  user: null,
  loading: true,
  refreshSession: async () => {},
  signOut: async () => {},
});

export const SessionProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }

        setSession(data.session);
        setUser(data.session?.user ?? null);
      } catch (error) {
        console.error('Error fetching session:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      authListener.subscription?.unsubscribe();
    };
  }, []);

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        throw error;
      }

      setSession(data.session);
      setUser(data.session?.user ?? null);
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <SessionContext.Provider value={{ session, user, loading, refreshSession, signOut }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);

// src/pages/dashboard/index.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useSession } from '@/contexts/SessionContext';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, Metric, Text } from '@tremor/react';

export default function Dashboard() {
  const { session, loading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !session) {
      router.push('/auth/signin');
    }
  }, [session, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect via useEffect
  }

  return (
    <DashboardLayout>
      <Head>
        <title>Dashboard | Healthcare Newsletter Platform</title>
      </Head>
      <div className="p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Provider Dashboard
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <Text>Total Patients</Text>
            <Metric>0</Metric>
          </Card>
          <Card>
            <Text>Active Newsletters</Text>
            <Metric>0</Metric>
          </Card>
          <Card>
            <Text>Open Rate</Text>
            <Metric>0%</Metric>
          </Card>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Add Patients
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Create Newsletter
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              View Analytics
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Newsletters</h2>
            <div className="space-y-4">
              <p className="text-gray-500 italic">No newsletters created yet.</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Patient Growth</h2>
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-500 italic">Patient data will appear here</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

