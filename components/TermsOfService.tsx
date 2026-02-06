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
            <h2 className="text-2xl font-bold mb-4" style={{color: 'var(--text-primary)'}}>1. About Youbnail</h2>
            <p>Youbnail is an AI-powered YouTube thumbnail generation platform that provides subscription-based services for content creators. Our platform uses artificial intelligence to generate custom thumbnails based on user prompts and preferences.</p>
            <p className="mt-2">By accessing and using Youbnail, you accept and agree to be bound by these terms and provisions. If you do not agree, please discontinue use immediately.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{color: 'var(--text-primary)'}}>2. Service Model</h2>
            <p>Youbnail operates exclusively on a paid subscription model:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li><strong>No Free Plans:</strong> We do not offer free accounts or trial periods</li>
              <li><strong>Paid Subscriptions Only:</strong> All features require an active paid subscription</li>
              <li><strong>Credit System:</strong> Subscribers receive monthly/yearly credit allocations for thumbnail generation</li>
              <li><strong>Premium Service:</strong> All users receive the same high-quality AI generation capabilities</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{color: 'var(--text-primary)'}}>3. Payment Terms</h2>
            <p>All subscriptions require upfront payment:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li><strong>No Refunds:</strong> All sales are final with no refunds under any circumstances</li>
              <li><strong>Auto-Renewal:</strong> Subscriptions automatically renew unless cancelled</li>
              <li><strong>Price Changes:</strong> We may modify prices with 30 days advance notice</li>
              <li><strong>Payment Security:</strong> All payments processed through secure, PCI-compliant providers</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{color: 'var(--text-primary)'}}>4. Acceptable Use</h2>
            <p>You agree to use Youbnail responsibly and legally:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Generate only legal, non-harmful content</li>
              <li>Respect copyright and intellectual property rights</li>
              <li>Do not create content that promotes hate, violence, or illegal activities</li>
              <li>Do not attempt to reverse engineer or circumvent our systems</li>
              <li>Do not share account credentials or resell access</li>
              <li>Do not use automated tools to bulk-generate content without authorization</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{color: 'var(--text-primary)'}}>5. AI Content and Intellectual Property</h2>
            <p>Understanding the nature of AI-generated content:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li><strong>Your Content:</strong> You own the thumbnails generated through your prompts and inputs</li>
              <li><strong>AI Generated:</strong> Content is created by artificial intelligence, not human designers</li>
              <li><strong>No Guarantee:</strong> We cannot guarantee uniqueness or copyright-free status</li>
              <li><strong>Your Responsibility:</strong> You are responsible for ensuring generated content meets your needs and complies with applicable laws</li>
              <li><strong>Commercial Use:</strong> You may use generated thumbnails for commercial purposes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{color: 'var(--text-primary)'}}>6. Data and Privacy</h2>
            <p>We take your privacy seriously:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>We collect only necessary data to provide our services</li>
              <li>Your generated thumbnails and prompts are stored securely</li>
              <li>We do not sell your personal data to third parties</li>
              <li>See our Privacy Policy for detailed information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{color: 'var(--text-primary)'}}>7. Service Limitations and Disclaimers</h2>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
              <p className="font-semibold">Important Disclaimers:</p>
            </div>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Service "As Is":</strong> Youbnail is provided without warranties of any kind</li>
              <li><strong>No Uptime Guarantees:</strong> While we strive for reliability, we cannot guarantee 100% uptime</li>
              <li><strong>AI Limitations:</strong> AI-generated content may not always meet your exact specifications</li>
              <li><strong>No Professional Advice:</strong> Our service does not constitute professional design advice</li>
              <li><strong>Technical Issues:</strong> You are responsible for your internet connection and device compatibility</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{color: 'var(--text-primary)'}}>8. Limitation of Liability</h2>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="font-semibold text-gray-800">IMPORTANT LEGAL NOTICE:</p>
              <p className="mt-2">To the maximum extent permitted by law, Youbnail and its operators shall not be liable for:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Any indirect, incidental, special, or consequential damages</li>
                <li>Loss of profits, revenue, or business opportunities</li>
                <li>Service interruptions or data loss</li>
                <li>Issues arising from AI-generated content usage</li>
                <li>Third-party actions based on your use of generated content</li>
              </ul>
              <p className="mt-2 font-semibold">Maximum liability is limited to the amount paid for your current subscription period.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{color: 'var(--text-primary)'}}>9. Account Termination</h2>
            <p>We reserve the right to terminate accounts for:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Violation of these terms or acceptable use policies</li>
              <li>Fraudulent payment activity</li>
              <li>Abuse of our support systems</li>
              <li>Generating prohibited or illegal content</li>
              <li>Attempting to circumvent security measures</li>
            </ul>
            <p className="mt-2"><strong>No refunds will be provided for terminated accounts.</strong></p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{color: 'var(--text-primary)'}}>10. Legal Jurisdiction and Compliance</h2>
            <p>These terms are governed by applicable laws. You agree that:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>You will comply with all applicable local, state, and federal laws</li>
              <li>Any disputes will be resolved through appropriate legal channels</li>
              <li>You are legally authorized to enter into this agreement</li>
              <li>You are at least 18 years old or have parental consent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{color: 'var(--text-primary)'}}>11. Changes and Updates</h2>
            <p>We may update these terms periodically:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Material changes will be announced via email or platform notifications</li>
              <li>Continued use after changes constitutes acceptance</li>
              <li>If you disagree with changes, you must cancel your subscription</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{color: 'var(--text-primary)'}}>12. Contact Information</h2>
            <p>For questions about these Terms of Service, please contact us at:</p>
            <p className="mt-2"><a href="mailto:support@youbnail.com" style={{color: 'var(--accent-primary)'}}>support@youbnail.com</a></p>
            
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="font-semibold text-blue-800">By using Youbnail, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
