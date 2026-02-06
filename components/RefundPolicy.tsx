import React from 'react';
import { Link } from 'react-router-dom';

export const RefundPolicy: React.FC = () => {
  return (
    <div className="min-h-screen py-20 px-4" style={{background: 'var(--bg-primary)'}}>
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 mb-8 text-sm" style={{color: 'var(--text-muted)'}}>
          ← Back to Home
        </Link>
        
        <h1 className="text-4xl font-bold mb-8" style={{color: 'var(--text-primary)'}}>Payment and Cancellation Policy</h1>
        <p className="text-sm mb-8" style={{color: 'var(--text-muted)'}}>Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-8 text-base leading-relaxed" style={{color: 'var(--text-secondary)'}}>
          <section>
            <h2 className="text-2xl font-bold mb-4" style={{color: 'var(--text-primary)'}}>1. Payment Terms</h2>
            <p>Youbnail operates on a paid subscription model. We offer premium AI-powered thumbnail generation services through monthly and annual subscription plans.</p>
            <p className="mt-2">All payments are processed securely through our payment processor and are charged in advance for the subscription period.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{color: 'var(--text-primary)'}}>2. No Refund Policy</h2>
            <p className="font-semibold text-red-600">All sales are final. We do not provide refunds for any subscription plans, regardless of usage or circumstances.</p>
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p><strong>This includes but is not limited to:</strong></p>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li>Unused subscription time</li>
                <li>Unused credits</li>
                <li>Change of mind</li>
                <li>Dissatisfaction with service</li>
                <li>Technical issues on user's end</li>
                <li>Accidental purchases</li>
                <li>Subscription renewals</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{color: 'var(--text-primary)'}}>3. Subscription Management</h2>
            <p>You can manage your subscription at any time through your account dashboard:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li><strong>Cancellation:</strong> You may cancel your subscription to prevent future charges</li>
              <li><strong>Access:</strong> Cancelled subscriptions remain active until the end of the current billing period</li>
              <li><strong>No Partial Refunds:</strong> Cancelling will not result in refunds for the current billing period</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{color: 'var(--text-primary)'}}>4. Service Availability</h2>
            <p>We strive to maintain 99.9% uptime. However, by subscribing to our service, you acknowledge that:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Temporary service interruptions may occur</li>
              <li>No compensation or refunds will be provided for brief outages</li>
              <li>Extended outages (over 24 hours) may be considered for service credits on a case-by-case basis</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{color: 'var(--text-primary)'}}>5. Contact Information</h2>
            <p>If you have questions about payments or subscriptions, please contact us:</p>
            <p className="mt-2"><a href="mailto:support@youbnail.com" style={{color: 'var(--accent-primary)'}}>support@youbnail.com</a></p>
            <p className="mt-4 text-sm" style={{color: 'var(--text-muted)'}}>
              By subscribing to Youbnail, you acknowledge and agree to these payment and cancellation terms.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
