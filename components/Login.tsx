import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/supabaseService';

export const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [email, setEmail] = useState('');

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await authService.signInWithGoogle();
      // Note: OAuth redirects, so we don't need to navigate manually
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google.');
      setLoading(false);
    }
  };

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setError(null);
    setMessage(null);
    setLoading(true);
    
    try {
      await authService.signInWithMagicLink(email);
      setMessage('Check your email for a magic link to sign in!');
      setEmail('');
    } catch (err: any) {
      setError(err.message || 'Failed to send magic link.');
    } finally {
      setLoading(false);
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{background: 'var(--bg-primary)'}}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50" style={{paddingTop: '1rem'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link to="/">
              <img 
                src="https://wawfgjzpwykvjgmuaueb.supabase.co/storage/v1/object/public/internal/1.png" 
                alt="Youbnail" 
                className="h-10"
              />
            </Link>
            <nav className="hidden md:flex items-center gap-2">
              <div className="flex items-center gap-1 rounded-full px-1 py-1 backdrop-blur-xl" 
                   style={{background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)'}}>
                <Link to="/" className="px-3 py-2 text-sm font-medium transition-colors rounded-full hover:bg-white/5" style={{color: 'var(--text-secondary)'}}>
                  Home
                </Link>
                <Link to="/signup" className="ml-1 btn-primary px-4 py-2 text-sm font-semibold inline-flex items-center gap-2">
                  Sign Up Free
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 7h10v10" />
                    <path d="M7 17 17 7" />
                  </svg>
                </Link>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center pt-20 pb-12 px-4">
        <div className="card p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-lg flex items-center justify-center font-semibold text-white mx-auto mb-4" 
               style={{background: 'linear-gradient(135deg, var(--accent-primary), #dc2626)', boxShadow: '0 0 20px rgba(239, 68, 68, 0.4)'}}>
            <img 
              src="https://wawfgjzpwykvjgmuaueb.supabase.co/storage/v1/object/public/internal/youbnail%20favicon%20(1).png" 
              alt="Youbnail" 
              className="w-10 h-10"
            />
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{color: 'var(--text-primary)'}}>
            Welcome Back
          </h1>
          <p className="text-sm" style={{color: 'var(--text-secondary)'}}>
            Sign in to your account
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm" style={{background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-primary)', border: '1px solid rgba(239, 68, 68, 0.3)'}}>
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 rounded-lg text-sm" style={{background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)'}}>
            {message}
          </div>
        )}

        {/* Magic Link Form */}
        <form onSubmit={handleMagicLinkLogin} className="mb-4">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full py-3 px-4 rounded-lg border transition-colors"
              style={{
                borderColor: 'var(--border-primary)',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)'
              }}
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="w-full py-3 px-4 rounded-lg font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{
              background: 'var(--accent-primary)',
              color: '#fff'
            }}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Sending...
              </div>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Send Magic Link
              </>
            )}
          </button>
        </form>

        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" style={{borderColor: 'var(--border-primary)'}}></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2" style={{background: 'var(--bg-card)', color: 'var(--text-secondary)'}}>
              Or continue with
            </span>
          </div>
        </div>

        {/* Google Sign In Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-3 px-4 rounded-lg border font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          style={{
            borderColor: 'var(--border-primary)',
            background: 'var(--bg-card)',
            color: 'var(--text-primary)'
          }}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {loading ? 'Signing in...' : 'Continue with Google'}
        </button>
        
        {/* Navigation to Signup */}
        <div className="mt-6 text-center">
          <p className="text-sm" style={{color: 'var(--text-secondary)'}}>
            Don't have an account?{' '}
            <button
              onClick={() => window.location.href = '/signup'}
              className="font-medium transition-colors hover:underline"
              style={{color: 'var(--accent-primary)'}}
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
      </div>

      {/* Footer */}
      <footer className="py-8 px-4 border-t" style={{background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)'}}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-sm" style={{color: 'var(--text-muted)'}}>
              <Link to="/privacy" className="hover:underline">Privacy</Link>
              <Link to="/terms" className="hover:underline">Terms</Link>
              <Link to="/refund" className="hover:underline">Refund Policy</Link>
            </div>
            <p className="text-sm" style={{color: 'var(--text-muted)'}}>© {new Date().getFullYear()} Youbnail. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
