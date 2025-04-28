// src/pages/admin/[[...path]].tsx
// This page serves as a client-side wrapper for the AdminJS dashboard
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useSession } from '@/contexts/SessionContext';

// This component renders the AdminJS interface by loading the scripts provided by the API
const AdminPage: React.FC = () => {
  const router = useRouter();
  const { session, loading } = useSession();
  
  useEffect(() => {
    // Redirect if not authenticated
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
    <>
      <Head>
        <title>Admin Dashboard | Healthcare Newsletter Platform</title>
        {/* AdminJS assets */}
        <link rel="stylesheet" href="/api/admin/assets/styles.css" />
        <script src="/api/admin/assets/scripts.js" defer></script>
      </Head>
      <div id="adminjs-root"></div>
    </>
  );
};

export default AdminPage;
