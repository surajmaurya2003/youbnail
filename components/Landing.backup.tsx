import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export const Landing: React.FC = () => {
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('sending');
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    setFormStatus('sent');
    setContactForm({ name: '', email: '', message: '' });
    
    setTimeout(() => setFormStatus('idle'), 3000);
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col" style={{background: 'var(--bg-primary)'}}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50" style={{paddingTop: '1rem'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <img 
              src="https://ohbrdgolasejewtcbojt.supabase.co/storage/v1/object/public/internal/1.png" 
              alt="Youbnail" 
              className="h-10"
            />

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              <div className="flex items-center gap-1 rounded-full px-1 py-1 backdrop-blur-xl" 
                   style={{background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)'}}>
                <button onClick={() => scrollToSection('features')} 
                        className="px-3 py-2 text-sm font-medium transition-colors rounded-full hover:bg-white/5" 
                        style={{color: 'var(--text-secondary)'}}>
                  Features
                </button>
                <button onClick={() => scrollToSection('how-it-works')} 
                        className="px-3 py-2 text-sm font-medium transition-colors rounded-full hover:bg-white/5" 
                        style={{color: 'var(--text-secondary)'}}>
                  How It Works
                </button>
                <button onClick={() => scrollToSection('pricing')} 
                        className="px-3 py-2 text-sm font-medium transition-colors rounded-full hover:bg-white/5" 
                        style={{color: 'var(--text-secondary)'}}>
                  Pricing
                </button>
                <button onClick={() => scrollToSection('contact')} 
                        className="px-3 py-2 text-sm font-medium transition-colors rounded-full hover:bg-white/5" 
                        style={{color: 'var(--text-secondary)'}}>
                  Contact
                </button>
                <Link to="/login" 
                      className="ml-1 px-3 py-2 text-sm font-medium transition-colors rounded-full hover:bg-white/5" 
                      style={{color: 'var(--text-secondary)'}}>
                  Login
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

            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-xl" 
              style={{background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.15)'}}
              aria-label="Toggle menu">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: 'var(--text-primary)'}}>
                <path d="M4 5h16" />
                <path d="M4 12h16" />
                <path d="M4 19h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl" style={{background: 'var(--accent-primary)'}}></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl" style={{background: '#dc2626'}}></div>
        </div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-6" 
               style={{background: 'var(--accent-light)', color: 'var(--accent-primary)', border: '1px solid rgba(239, 68, 68, 0.2)'}}>
            <span className="animate-pulse">●</span> AI-Powered Thumbnail Generator
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight" style={{color: 'var(--text-primary)'}}>
            Create <span style={{background: 'linear-gradient(135deg, var(--accent-primary), #dc2626)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
              Stunning Thumbnails
            </span><br />in Seconds with AI
          </h1>
          
          <p className="text-xl sm:text-2xl mb-4 max-w-3xl mx-auto" style={{color: 'var(--text-secondary)'}}>
            Transform your YouTube channel with eye-catching, click-worthy thumbnails
          </p>
          
          <p className="text-base sm:text-lg mb-10 max-w-2xl mx-auto" style={{color: 'var(--text-muted)'}}>
            No design skills needed. Just describe what you want and let our AI create professional thumbnails instantly.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link to="/signup" className="btn-primary px-8 py-4 text-lg font-semibold w-full sm:w-auto">
              Start Creating Free →
            </Link>
            <button onClick={() => scrollToSection('how-it-works')} className="btn-secondary px-8 py-4 text-lg font-semibold w-full sm:w-auto">
              See How It Works
            </button>
          </div>

          {/* Social Proof */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm" style={{color: 'var(--text-muted)'}}>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold" 
                       style={{background: 'var(--bg-card)', borderColor: 'var(--border-primary)', color: 'var(--accent-primary)'}}>
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <span>10,000+ creators trust us</span>
            </div>
            <div>★★★★★ 4.9/5 rating</div>
            <div>No credit card required</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4" style={{background: 'var(--bg-secondary)'}}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4" style={{color: 'var(--text-primary)'}}>
              Everything You Need to Stand Out
            </h2>
            <p className="text-lg sm:text-xl" style={{color: 'var(--text-secondary)'}}>
              Professional tools designed for YouTube creators
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '🤖', title: 'AI-Powered Generation', desc: 'Advanced AI creates unique thumbnails from your text descriptions' },
              { icon: '⚡', title: 'Lightning Fast', desc: 'Generate professional thumbnails in seconds, not hours' },
              { icon: '🎨', title: 'Full Customization', desc: 'Edit colors, text, and style to match your brand' },
              { icon: '📐', title: 'Perfect Dimensions', desc: 'Optimized for YouTube (1280x720) with multiple aspect ratios' },
              { icon: '🖼️', title: 'Video Snapshots', desc: 'Extract perfect frames from your videos instantly' },
              { icon: '✨', title: 'Reference Images', desc: 'Upload inspiration and let AI match the style' }
            ].map((feature, i) => (
              <div key={i} className="card p-6 hover:scale-105 transition-transform duration-300">
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3" style={{color: 'var(--text-primary)'}}>
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{color: 'var(--text-secondary)'}}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4" style={{color: 'var(--text-primary)'}}>
              Create Thumbnails in 3 Simple Steps
            </h2>
            <p className="text-lg sm:text-xl" style={{color: 'var(--text-secondary)'}}>
              From idea to thumbnail in under a minute
            </p>
          </div>

          <div className="space-y-12">
            {[
              { num: '01', title: 'Describe Your Vision', desc: 'Simply type what you want your thumbnail to look like. Our AI understands natural language.' },
              { num: '02', title: 'AI Creates Magic', desc: 'Watch as our advanced AI generates multiple unique thumbnail variations for you to choose from.' },
              { num: '03', title: 'Customize & Download', desc: 'Fine-tune colors, add text, or use as-is. Download and upload to YouTube instantly.' }
            ].map((step, i) => (
              <div key={i} className="flex flex-col md:flex-row gap-6 items-center">
                <div className="flex-shrink-0 w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold" 
                     style={{background: 'linear-gradient(135deg, var(--accent-primary), #dc2626)', color: 'white'}}>
                  {step.num}
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-bold mb-2" style={{color: 'var(--text-primary)'}}>
                    {step.title}
                  </h3>
                  <p className="text-lg" style={{color: 'var(--text-secondary)'}}>
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/signup" className="btn-primary px-8 py-4 text-lg font-semibold inline-block">
              Try It Now - It's Free →
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4" style={{background: 'var(--bg-secondary)'}}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4" style={{color: 'var(--text-primary)'}}>
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg sm:text-xl" style={{color: 'var(--text-secondary)'}}>
              Start free, upgrade when you need more
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="card p-8 border-2" style={{borderColor: 'var(--border-primary)'}}>
              <h3 className="text-2xl font-bold mb-2" style={{color: 'var(--text-primary)'}}>Free</h3>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-5xl font-bold" style={{color: 'var(--text-primary)'}}>$0</span>
                <span style={{color: 'var(--text-muted)'}}>/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['2 free credits', 'AI thumbnail generation', 'Basic editing tools', 'Standard resolution'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <svg className="w-5 h-5 flex-shrink-0" style={{color: 'var(--accent-success)'}} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                    </svg>
                    <span style={{color: 'var(--text-secondary)'}}>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link to="/signup" className="btn-secondary w-full py-3 text-center font-semibold">
                Get Started Free
              </Link>
            </div>

            {/* Paid Plan */}
            <div className="card p-8 border-2 relative overflow-hidden" style={{borderColor: 'var(--accent-primary)', boxShadow: '0 0 40px rgba(239, 68, 68, 0.2)'}}>
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold" 
                   style={{background: 'var(--accent-primary)', color: 'white'}}>
                POPULAR
              </div>
              <h3 className="text-2xl font-bold mb-2" style={{color: 'var(--text-primary)'}}>Starter</h3>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-5xl font-bold" style={{color: 'var(--text-primary)'}}>$20</span>
                <span style={{color: 'var(--text-muted)'}}>/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['30 credits per month', 'Unlimited generations', 'Advanced AI features', 'HD resolution', 'Video snapshot tool', 'Reference image upload', 'Priority support'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <svg className="w-5 h-5 flex-shrink-0" style={{color: 'var(--accent-success)'}} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                    </svg>
                    <span style={{color: 'var(--text-secondary)'}}>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link to="/signup" className="btn-primary w-full py-3 text-center font-semibold">
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact" className="py-20 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4" style={{color: 'var(--text-primary)'}}>
              Get in Touch
            </h2>
            <p className="text-lg sm:text-xl" style={{color: 'var(--text-secondary)'}}>
              Have questions? We'd love to hear from you
            </p>
          </div>

          <form onSubmit={handleContactSubmit} className="card p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>Name</label>
              <input
                type="text"
                required
                value={contactForm.name}
                onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                className="w-full px-4 py-3 rounded-lg border outline-none transition-all"
                style={{background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)'}}
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>Email</label>
              <input
                type="email"
                required
                value={contactForm.email}
                onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                className="w-full px-4 py-3 rounded-lg border outline-none transition-all"
                style={{background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)'}}
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>Message</label>
              <textarea
                required
                rows={5}
                value={contactForm.message}
                onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                className="w-full px-4 py-3 rounded-lg border outline-none transition-all resize-none"
                style={{background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)'}}
                placeholder="Tell us what you're thinking..."
              />
            </div>
            <button 
              type="submit" 
              disabled={formStatus === 'sending' || formStatus === 'sent'}
              className="btn-primary w-full py-3 text-lg font-semibold disabled:opacity-50"
            >
              {formStatus === 'sending' ? 'Sending...' : formStatus === 'sent' ? 'Message Sent! ✓' : 'Send Message'}
            </button>
            {formStatus === 'sent' && (
              <p className="text-center text-sm" style={{color: 'var(--accent-success)'}}>
                Thanks! We'll get back to you soon.
              </p>
            )}
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t" style={{background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)'}}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <img 
                src="https://ohbrdgolasejewtcbojt.supabase.co/storage/v1/object/public/internal/1.png" 
                alt="Youbnail" 
                className="h-10 mb-4"
              />
              <p className="text-sm" style={{color: 'var(--text-muted)'}}>
                AI-powered YouTube thumbnail creator for modern content creators.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold mb-4" style={{color: 'var(--text-primary)'}}>Product</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => scrollToSection('features')} style={{color: 'var(--text-muted)'}}>Features</button></li>
                <li><button onClick={() => scrollToSection('pricing')} style={{color: 'var(--text-muted)'}}>Pricing</button></li>
                <li><Link to="/signup" style={{color: 'var(--text-muted)'}}>Sign Up</Link></li>
                <li><Link to="/login" style={{color: 'var(--text-muted)'}}>Login</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold mb-4" style={{color: 'var(--text-primary)'}}>Company</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => scrollToSection('contact')} style={{color: 'var(--text-muted)'}}>Contact</button></li>
                <li><Link to="/privacy" style={{color: 'var(--text-muted)'}}>Privacy Policy</Link></li>
                <li><Link to="/terms" style={{color: 'var(--text-muted)'}}>Terms of Service</Link></li>
                <li><Link to="/refund" style={{color: 'var(--text-muted)'}}>Refund Policy</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold mb-4" style={{color: 'var(--text-primary)'}}>Support</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => scrollToSection('how-it-works')} style={{color: 'var(--text-muted)'}}>How It Works</button></li>
                <li><a href="mailto:support@youbnail.com" style={{color: 'var(--text-muted)'}}>Email Support</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t text-center text-sm" style={{borderColor: 'var(--border-primary)', color: 'var(--text-muted)'}}>
            <p>© {new Date().getFullYear()} Youbnail. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
