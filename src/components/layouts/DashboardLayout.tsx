// src/components/layouts/DashboardLayout.tsx
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from '@/contexts/SessionContext';

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { signOut, user } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  // Close sidebar when route changes (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [router.pathname]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-blue-800 transition duration-300 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:static md:inset-0`}
      >
        <div className="flex items-center justify-center h-16 bg-blue-900 px-4">
          <span className="text-white font-semibold text-lg">Healthcare Newsletter</span>
        </div>
        <nav className="mt-8">
          <div className="px-2 space-y-1">
            <Link
              href="/dashboard"
              className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                router.pathname === '/dashboard'
                  ? 'bg-blue-900 text-white'
                  : 'text-blue-100 hover:bg-blue-700'
              }`}
            >
              <svg
                className="mr-4 h-6 w-6 text-blue-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Dashboard
            </Link>

            <Link
              href="/dashboard/patients"
              className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                router.pathname.startsWith('/dashboard/patients')
                  ? 'bg-blue-900 text-white'
                  : 'text-blue-100 hover:bg-blue-700'
              }`}
            >
              <svg
                className="mr-4 h-6 w-6 text-blue-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              Patients
            </Link>

            <Link
              href="/dashboard/newsletters"
              className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                router.pathname.startsWith('/dashboard/newsletters')
                  ? 'bg-blue-900 text-white'
                  : 'text-blue-100 hover:bg-blue-700'
              }`}
            >
              <svg
                className="mr-4 h-6 w-6 text-blue-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
              Newsletters
            </Link>

            <Link
              href="/dashboard/campaigns"
              className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                router.pathname.startsWith('/dashboard/campaigns')
                  ? 'bg-blue-900 text-white'
                  : 'text-blue-100 hover:bg-blue-700'
              }`}
            >
              <svg
                className="mr-4 h-6 w-6 text-blue-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                />
              </svg>
              Campaigns
            </Link>

            <Link
              href="/dashboard/analytics"
              className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                router.pathname.startsWith('/dashboard/analytics')
                  ? 'bg-blue-900 text-white'
                  : 'text-blue-100 hover:bg-blue-700'
              }`}
            >
              <svg
                className="mr-4 h-6 w-6 text-blue-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              Analytics
            </Link>

            <Link
              href="/dashboard/billing"
              className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                router.pathname === '/dashboard/billing'
                  ? 'bg-blue-900 text-white'
                  : 'text-blue-100 hover:bg-blue-700'
              }`}
            >
              <svg
                className="mr-4 h-6 w-6 text-blue-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
              Billing
            </Link>

            <Link
              href="/dashboard/settings"
              className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                router.pathname.startsWith('/dashboard/settings')
                  ? 'bg-blue-900 text-white'
                  : 'text-blue-100 hover:bg-blue-700'
              }`}
            >
              <svg
                className="mr-4 h-6 w-6 text-blue-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Settings
            </Link>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col md:pl-64">
        {/* Top header */}
        <div className="sticky top-0 z-10 bg-white md:flex-shrink-0 flex h-16 bg-white shadow">
          {/* Mobile menu button */}
          <button
            type="button"
            className="px-4 md:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <svg
              className="h-6 w-6 text-gray-700"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>

          <div className="flex-1 flex justify-between px-4">
            <div className="flex-1"></div>
            <div className="ml-4 flex items-center md:ml-6">
              <div className="relative">
                <button
                  type="button"
                  className="max-w-xs flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  id="user-menu"
                  aria-expanded="false"
                  aria-haspopup="true"
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="h-8 w-8 rounded-full bg-blue-200 flex items-center justify-center">
                    <span className="font-medium text-blue-600">
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                </button>
              </div>
              <button
                className="ml-3 text-sm text-gray-700 hover:text-gray-900"
                onClick={handleSignOut}
              >
                Sign out
              </button>
            </div>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
