import React from 'react';
import { Link } from 'react-router-dom';

export const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen py-20 px-4" style={{background: 'var(--bg-primary)'}}>
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 mb-8 text-sm" style={{color: 'var(--text-muted)'}}>
          ← Back to Home
        </Link>
        
        <h1 className="text-4xl font-bold mb-8" style={{color: 'var(--text-primary)'}}>Terms of Service</h1>
        <p className="text-sm mb-8" style={{color: 'var(--text-muted)'}}>Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-8 text-base leading-relaxed" style={{color: 'var(--text-secondary)'}}>
          <section>
            <h2 className="text-2xl font-bold mb-4" style={{color: 'var(--text-primary)'}}>1. Acceptance of Terms</h2>
            <p>By accessing and using Youbnail, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these terms, please do not use our services.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{color: 'var(--text-primary)'}}>2. Use of Services</h2>
            <p>You agree to use Youbnail only for lawful purposes and in accordance with these Terms. You agree not to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Use the service in any way that violates any applicable law or regulation</li>
              <li>Generate content that is illegal, harmful, or infringes on others' rights</li>
              <li>Attempt to circumvent any security measures or access restrictions</li>
              <li>Use automated systems to access the service without authorization</li>
              <li>Resell or redistribute generated content without proper rights</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{color: 'var(--text-primary)'}}>3. User Accounts</h2>
            <p>When you create an account with us, you must provide accurate and complete information. You are responsible for maintaining the security of your account and password. You agree to accept responsibility for all activities that occur under your account.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{color: 'var(--text-primary)'}}>4. Subscriptions and Payments</h2>
            <p>Some features require a paid subscription. By subscribing, you agree to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Pay all fees associated with your subscription</li>
              <li>Automatic renewal unless cancelled before renewal date</li>
              <li>Our refund policy as outlined separately</li>
              <li>Price changes with 30 days notice</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{color: 'var(--text-primary)'}}>5. Content and Intellectual Property</h2>
            <p>You retain ownership of the content you create using our service. However, you grant us a license to use, store, and display your content as necessary to provide the service. All AI-generated thumbnails are provided "as is" and you are responsible for ensuring they comply with your usage requirements.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{color: 'var(--text-primary)'}}>6. Service Availability</h2>
            <p>We strive to maintain service availability but cannot guarantee uninterrupted access. We reserve the right to modify, suspend, or discontinue any part of the service with or without notice.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{color: 'var(--text-primary)'}}>7. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, Youbnail shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{color: 'var(--text-primary)'}}>8. Termination</h2>
            <p>We may terminate or suspend your account and access to the service immediately, without prior notice, for any breach of these Terms. Upon termination, your right to use the service will immediately cease.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{color: 'var(--text-primary)'}}>9. Changes to Terms</h2>
            <p>We reserve the right to modify these terms at any time. We will notify users of any material changes. Your continued use of the service after changes constitutes acceptance of the new terms.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{color: 'var(--text-primary)'}}>10. Contact Information</h2>
            <p>For questions about these Terms, please contact us at:</p>
            <p className="mt-2"><a href="mailto:support@youbnail.com" style={{color: 'var(--accent-primary)'}}>support@youbnail.com</a></p>
          </section>
        </div>
      </div>
    </div>
  );
};
