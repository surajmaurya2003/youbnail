import React from 'react';
import { Link } from 'react-router-dom';

export const RefundPolicy: React.FC = () => {
  return (
    <div className="min-h-screen py-20 px-4" style={{background: 'var(--bg-primary)'}}>
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 mb-8 text-sm" style={{color: 'var(--text-muted)'}}>
          ← Back to Home
        </Link>
        
        <h1 className="text-4xl font-bold mb-8" style={{color: 'var(--text-primary)'}}>Refund Policy</h1>
        <p className="text-sm mb-8" style={{color: 'var(--text-muted)'}}>Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-8 text-base leading-relaxed" style={{color: 'var(--text-secondary)'}}>
          <section>
            <h2 className="text-2xl font-bold mb-4" style={{color: 'var(--text-primary)'}}>1. Our Commitment</h2>
            <p>We want you to be completely satisfied with Youbnail. If you're not happy with our service, we're here to help.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{color: 'var(--text-primary)'}}>2. 7-Day Money Back Guarantee</h2>
            <p>We offer a 7-day money-back guarantee for all new subscriptions. If you're not satisfied within the first 7 days of your initial subscription, contact us for a full refund.</p>
            <p className="mt-2"><strong>Conditions:</strong></p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Applies to first-time subscribers only</li>
              <li>Must be requested within 7 days of initial payment</li>
              <li>Applies to monthly and annual plans</li>
              <li>Does not apply to subscription renewals</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{color: 'var(--text-primary)'}}>3. Renewal Refunds</h2>
            <p>Subscription renewals are generally non-refundable. However, we may consider refund requests on a case-by-case basis if:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>There was a technical error with the renewal</li>
              <li>You cancelled but were still charged due to system error</li>
              <li>You experienced service outages affecting your usage</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{color: 'var(--text-primary)'}}>4. How to Request a Refund</h2>
            <p>To request a refund:</p>
            <ol className="list-decimal pl-6 mt-2 space-y-2">
              <li>Contact us at <a href="mailto:support@youbnail.com" style={{color: 'var(--accent-primary)'}}>support@youbnail.com</a></li>
              <li>Include your account email and reason for refund</li>
              <li>Allow 3-5 business days for processing</li>
              <li>Refunds will be issued to the original payment method</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{color: 'var(--text-primary)'}}>5. Cancellation Policy</h2>
            <p>You can cancel your subscription at any time from your account settings. Upon cancellation:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>You retain access until the end of your billing period</li>
              <li>No further charges will be made</li>
              <li>Your unused credits will expire at period end</li>
              <li>You can reactivate anytime</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{color: 'var(--text-primary)'}}>6. Non-Refundable Items</h2>
            <p>The following are not eligible for refunds:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Used credits or generated thumbnails</li>
              <li>Partial month/year subscriptions (no pro-rating)</li>
              <li>Accounts suspended or terminated for violations</li>
              <li>Additional credit purchases (add-ons)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{color: 'var(--text-primary)'}}>7. Service Disruptions</h2>
            <p>If our service experiences significant downtime or disruptions, we will:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Extend your subscription period accordingly</li>
              <li>Provide additional credits as compensation</li>
              <li>Consider refund requests for extended outages</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{color: 'var(--text-primary)'}}>8. Questions?</h2>
            <p>If you have any questions about our refund policy, please don't hesitate to contact us:</p>
            <p className="mt-2"><a href="mailto:support@youbnail.com" style={{color: 'var(--accent-primary)'}}>support@youbnail.com</a></p>
          </section>
        </div>
      </div>
    </div>
  );
};
