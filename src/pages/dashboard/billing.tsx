// src/pages/dashboard/billing.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { useSession } from '@/contexts/SessionContext';
import { supabase } from '@/lib/supabase';

export default function BillingPage() {
  const router = useRouter();
  const { session, loading } = useSession();
  const [provider, setProvider] = useState<any>(null);
  const [loadingProvider, setLoadingProvider] = useState(true);
  const [creatingCheckout, setCreatingCheckout] = useState(false);
  const [creatingPortal, setCreatingPortal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !session) {
      router.push('/auth/signin');
    } else if (session) {
      fetchProvider();
    }
  }, [session, loading, router]);

  const fetchProvider = async () => {
    try {
      setLoadingProvider(true);
      const { data, error } = await supabase
        .from('healthcare_providers')
        .select('*')
        .eq('id', session?.user?.id)
        .single();

      if (error) throw error;
      setProvider(data);
    } catch (error: any) {
      console.error('Error fetching provider:', error.message);
      setError('Failed to load billing information');
    } finally {
      setLoadingProvider(false);
    }
  };

  const createCheckout = async (tier: 'base' | 'professional' | 'enterprise') => {
    try {
      setCreatingCheckout(true);
      setError(null);

      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tier,
          successUrl: `${window.location.origin}/dashboard/billing?success=true`,
          cancelUrl: `${window.location.origin}/dashboard/billing?canceled=true`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error: any) {
      console.error('Error creating checkout:', error.message);
      setError(error.message);
    } finally {
      setCreatingCheckout(false);
    }
  };

  const createPortal = async () => {
    try {
      setCreatingPortal(true);
      setError(null);

      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          returnUrl: `${window.location.origin}/dashboard/billing`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to create portal session');
      }

      // Redirect to Stripe Customer Portal
      window.location.href = data.url;
    } catch (error: any) {
      console.error('Error creating portal:', error.message);
      setError(error.message);
    } finally {
      setCreatingPortal(false);
    }
  };

  if (loading || loadingProvider) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!session) {
    return null; // Will redirect via useEffect
  }

  // Helper function to format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <DashboardLayout>
      <Head>
        <title>Billing & Subscription | Healthcare Newsletter Platform</title>
      </Head>
      <div className="p-4 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Billing & Subscription</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {router.query.success === 'true' && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
            Subscription successfully updated!
          </div>
        )}

        {router.query.canceled === 'true' && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded mb-6">
            Subscription update was canceled.
          </div>
        )}

        {/* Current Subscription */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Current Subscription</h2>

          {provider?.subscription_status === 'active' ? (
            <div>
              <div className="flex items-center mb-4">
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  Active
                </div>
              </div>

              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Plan</dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-900">
                    {provider.subscription_tier === 'base' && 'Base Tier ($299/month)'}
                    {provider.subscription_tier === 'professional' && 'Professional Tier ($699/month)'}
                    {provider.subscription_tier === 'enterprise' && 'Enterprise Tier ($1,500/month)'}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Patient Limit</dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-900">
                    {provider.max_patients.toLocaleString()} patients
                  </dd>
                </div>

                {provider.stripe_subscription_data?.current_period_end && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Next Billing Date</dt>
                    <dd className="mt-1 text-lg font-semibold text-gray-900">
                      {formatDate(provider.stripe_subscription_data.current_period_end)}
                    </dd>
                  </div>
                )}

                {provider.stripe_subscription_data?.cancel_at_period_end && (
                  <div className="col-span-2">
                    <p className="text-amber-600">
                      Your subscription will cancel at the end of the current billing period.
                    </p>
                  </div>
                )}
              </dl>

              <div className="mt-6">
                <button
                  onClick={createPortal}
                  disabled={creatingPortal}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                >
                  {creatingPortal ? 'Loading...' : 'Manage Subscription'}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center mb-4">
                <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                  {provider?.subscription_status === 'trial' ? 'Trial' : 'Inactive'}
                </div>
              </div>

              <p className="text-gray-600 mb-6">
                {provider?.subscription_status === 'trial'
                  ? 'You are currently on a trial plan. Subscribe to a paid plan to continue using all features after your trial ends.'
                  : 'You do not have an active subscription. Subscribe to a plan to access all features.'}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Base Tier */}
                <div className="border rounded-lg p-6 shadow-sm hover:shadow transition-shadow">
                  <h3 className="text-lg font-semibold mb-2">Base Tier</h3>
                  <p className="text-3xl font-bold mb-4">$299<span className="text-sm font-normal">/month</span></p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Enhanced analytics
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      A/B testing capabilities
                    </li>
                  </ul>
                  <button
                    onClick={() => createCheckout('professional')}
                    disabled={creatingCheckout}
                    className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                  >
                    {creatingCheckout ? 'Loading...' : 'Subscribe'}
                  </button>
                </div>

                {/* Enterprise Tier */}
                <div className="border rounded-lg p-6 shadow-sm hover:shadow transition-shadow">
                  <h3 className="text-lg font-semibold mb-2">Enterprise Tier</h3>
                  <p className="text-3xl font-bold mb-4">$1,500<span className="text-sm font-normal">/month</span></p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Unlimited patients
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Full personalization suite
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Custom EHR integration
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Advanced outcome tracking
                    </li>
                    <li className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Dedicated support
                    </li>
                  </ul>
                  <button
                    onClick={() => createCheckout('enterprise')}
                    disabled={creatingCheckout}
                    className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                  >
                    {creatingCheckout ? 'Loading...' : 'Subscribe'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Add-ons */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Available Add-ons</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Content Creation Services */}
            <div className="border rounded-lg p-6 shadow-sm hover:shadow transition-shadow">
              <h3 className="text-lg font-semibold mb-2">Content Creation Services</h3>
              <p className="text-2xl font-bold mb-2">$500<span className="text-sm font-normal">/month</span></p>
              <p className="text-gray-600 mb-4">Expert-written, compliant healthcare content delivered monthly.</p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Condition-specific educational materials
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Regular updates reflecting current guidelines
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Zero burden on your staff
                </li>
              </ul>
              <button
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => provider?.subscription_status === 'active' ? createPortal() : createCheckout('base')}
              >
                {provider?.subscription_status === 'active' ? 'Add to Subscription' : 'Subscribe First'}
              </button>
            </div>

            {/* Custom Outcome Reporting */}
            <div className="border rounded-lg p-6 shadow-sm hover:shadow transition-shadow">
              <h3 className="text-lg font-semibold mb-2">Custom Outcome Reporting</h3>
              <p className="text-2xl font-bold mb-2">$300<span className="text-sm font-normal">/month</span></p>
              <p className="text-gray-600 mb-4">Advanced analytics connecting engagement to patient outcomes.</p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Treatment adherence tracking
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Condition management improvement data
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Evidence for insurance negotiations
                </li>
              </ul>
              <button
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => provider?.subscription_status === 'active' ? createPortal() : createCheckout('base')}
              >
                {provider?.subscription_status === 'active' ? 'Add to Subscription' : 'Subscribe First'}
              </button>
            </div>
          </div>
        </div>

        {/* Billing History */}
        {provider?.subscription_status === 'active' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Billing History</h2>
            <p className="text-gray-600 mb-4">
              Access your complete billing history and download invoices from the Stripe Customer Portal.
            </p>
            <button
              onClick={createPortal}
              disabled={creatingPortal}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {creatingPortal ? 'Loading...' : 'View Billing History'}
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

