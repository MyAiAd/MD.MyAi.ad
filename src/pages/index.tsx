// src/pages/index.tsx
import Head from 'next/head';
import Link from 'next/link';
import { useSession } from '@/contexts/SessionContext';

export default function Home() {
  const { session } = useSession();

  return (
    <>
      <Head>
        <title>Healthcare Newsletter Platform</title>
        <meta name="description" content="Personalized healthcare newsletters for patients" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold text-blue-800 mb-8">
            Healthcare Newsletter Platform
          </h1>
          <p className="text-xl text-gray-700 mb-8">
            A personalized newsletter solution for healthcare providers.
          </p>
          
          {session ? (
            <div className="space-y-4">
              <p className="text-green-600">
                Welcome back, {session.user?.email}
              </p>
              <Link
                href="/dashboard"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
              >
                Go to Dashboard
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <Link
                href="/auth/signin"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 mr-4"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="inline-block bg-white text-blue-600 border border-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
