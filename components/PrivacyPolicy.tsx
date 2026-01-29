import React from 'react';
import { Link } from 'react-router-dom';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen py-20 px-4" style={{background: 'var(--bg-primary)'}}>
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 mb-8 text-sm" style={{color: 'var(--text-muted)'}}>
          ← Back to Home
        </Link>
        
        <h1 className="text-4xl font-bold mb-8" style={{color: 'var(--text-primary)'}}>Privacy Policy</h1>
        <p className="text-sm mb-8" style={{color: 'var(--text-muted)'}}>Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-8 text-base leading-relaxed" style={{color: 'var(--text-secondary)'}}>
          <section>
            <h2 className="text-2xl font-bold mb-4" style={{color: 'var(--text-primary)'}}>1. Information We Collect</h2>
            <p>We collect information you provide directly to us when you create an account, use our services, or communicate with us. This includes:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Account information (email, name)</li>
              <li>Payment information (processed securely through our payment provider)</li>
              <li>Content you create (thumbnails, prompts)</li>
              <li>Usage data and analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{color: 'var(--text-primary)'}}>2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Process your payments and manage your subscription</li>
              <li>Send you technical notices and support messages</li>
              <li>Respond to your comments and questions</li>
              <li>Analyze usage patterns to improve user experience</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{color: 'var(--text-primary)'}}>3. Data Security</h2>
            <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. Your payment information is processed through secure, PCI-compliant payment providers.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{color: 'var(--text-primary)'}}>4. Data Retention</h2>
            <p>We retain your information for as long as your account is active or as needed to provide you services. You may delete your account at any time, and we will delete your personal information within 30 days.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{color: 'var(--text-primary)'}}>5. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Export your data</li>
              <li>Opt-out of marketing communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{color: 'var(--text-primary)'}}>6. Third-Party Services</h2>
            <p>We use third-party services to help us operate our business, including:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Payment processing (Stripe/DodoPayments)</li>
              <li>Cloud hosting (Supabase, Railway)</li>
              <li>Analytics services</li>
            </ul>
            <p className="mt-2">These services have their own privacy policies and we encourage you to review them.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{color: 'var(--text-primary)'}}>7. Contact Us</h2>
            <p>If you have questions about this Privacy Policy, please contact us at:</p>
            <p className="mt-2"><a href="mailto:support@youbnail.com" style={{color: 'var(--accent-primary)'}}>support@youbnail.com</a></p>
          </section>
        </div>
      </div>
    </div>
  );
};
