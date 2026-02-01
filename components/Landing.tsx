import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export const Landing: React.FC = () => {
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [pricingToggle, setPricingToggle] = useState<'monthly' | 'annual'>('monthly');
  const [activeUseCase, setActiveUseCase] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('sending');
    
    try {
      const { data, error } = await supabase.functions.invoke('send-contact-webhook', {
        body: {
          name: contactForm.name,
          email: contactForm.email,
          message: contactForm.message,
        },
      });

      if (error) {
        console.error('Error sending contact form:', error);
        setFormStatus('error');
        setTimeout(() => setFormStatus('idle'), 5000);
        return;
      }

      console.log('Contact form sent successfully:', data);
      setFormStatus('sent');
      setContactForm({ name: '', email: '', message: '' });
      setTimeout(() => setFormStatus('idle'), 5000);
    } catch (error) {
      console.error('Unexpected error:', error);
      setFormStatus('error');
      setTimeout(() => setFormStatus('idle'), 5000);
    }
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewsletterStatus('sending');
    await new Promise(resolve => setTimeout(resolve, 1000));
    setNewsletterStatus('sent');
    setNewsletterEmail('');
    setTimeout(() => setNewsletterStatus('idle'), 3000);
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const useCases = [
    {
      label: 'Gaming',
      name: 'Alex, Gaming Streamer',
      challenge: '"I upload 3 videos a week. Designing thumbnails takes longer than editing the actual videos. And they still look amateur."',
      benefits: [
        'Generate epic gaming thumbnails in seconds',
        'Automatic neon effects and bold text',
        'Character extraction from gameplay',
        'Styles that match your game\'s vibe'
      ],
      result: '+247% CTR increase, uploads 5x per week now'
    },
    {
      label: 'Education',
      name: 'Maria, Online Educator',
      challenge: '"Professional thumbnails cost $75 each. With 40+ lessons per course, that\'s $3,000 just on thumbnails."',
      benefits: [
        'Consistent branding across all lessons',
        'Educational style that builds trust',
        'Numbered episode templates',
        'Bulk generation for entire courses'
      ],
      result: 'Saved $3,000, course CTR up 156%'
    },
    {
      label: 'Finance',
      name: 'James, Finance Educator',
      challenge: '"Clickbait thumbnails hurt my credibility. But boring thumbnails get ignored. I need professional, trustworthy, AND eye-catching."',
      benefits: [
        'Professional styles that build authority',
        'Data visualization integration',
        'Clean, trustworthy designs',
        'No gimmicks, just conversion'
      ],
      result: '+189% views while maintaining professional brand'
    },
    {
      label: 'Lifestyle',
      name: 'Sophie, Lifestyle Creator',
      challenge: '"Every thumbnail needs to match my aesthetic. It takes me 3 hours in Canva and still doesn\'t look professional."',
      benefits: [
        'Style matching from your references',
        'Cohesive feed aesthetics',
        'Personality-driven designs',
        'Instagram-worthy consistency'
      ],
      result: '+312% engagement, cohesive brand identity'
    },
    {
      label: 'Fitness',
      name: 'Marcus, Fitness Coach',
      challenge: '"My content is transformational, but my thumbnails look like everyone else\'s. I need to stand out in a crowded niche."',
      benefits: [
        'Before/after comparison layouts',
        'Bold, motivational text',
        'Energy-driven color schemes',
        'Transformation storytelling'
      ],
      result: '+423% CTR, doubled client inquiries'
    },
    {
      emoji: '🎬',
      label: 'Reviews',
      name: 'David, Movie Reviewer',
      challenge: '"I need cinematic thumbnails that match the quality of films I review. Stock templates look cheap."',
      benefits: [
        'Cinematic color grading',
        'Movie poster aesthetics',
        'Review score integration',
        'Premium, polished look'
      ],
      result: '+267% views, brand partnerships increased'
    }
  ];

  const testimonials = [
    {
      rating: 5,
      text: 'Youbnail has completely changed how I create thumbnails. What used to take me hours in design software now takes minutes. The AI suggestions are spot on for my niche.',
      name: 'Alex Chen',
      channel: 'TechReviews',
      subs: '45K',
      badge: 'Saves hours weekly'
    },
    {
      rating: 5,
      text: 'I\'ve tried other thumbnail tools but nothing comes close to how intuitive Youbnail is. The video frame extraction feature alone is worth the subscription.',
      name: 'Maria Rodriguez',
      channel: 'FitLifestyle',
      subs: '28K',
      badge: 'Intuitive & powerful'
    },
    {
      rating: 5,
      text: 'The difference in my video performance after switching to better thumbnails has been noticeable. Youbnail makes it so much easier to create professional-looking designs.',
      name: 'Jordan Kim',
      channel: 'GameTimeJK',
      subs: '72K',
      badge: 'Noticeable improvement'
    },
    {
      rating: 5,
      text: 'Great tool for content creators who don\'t have design experience. The AI does most of the heavy lifting, and you can still customize to match your style.',
      name: 'Sam Wilson',
      channel: 'LearningSam',
      subs: '19K',
      badge: 'Perfect for beginners'
    },
    {
      rating: 5,
      text: 'Finally, a thumbnail tool that understands YouTube. The aspect ratios are perfect, the quality is high, and it\'s designed specifically for creators like us.',
      name: 'Casey Taylor',
      channel: 'CaseyFitness',
      subs: '33K',
      badge: 'Built for YouTube'
    },
    {
      rating: 5,
      text: 'The reference image feature is genius. I can show the AI the style I want, and it creates something similar but unique. Saves so much back and forth with designers.',
      name: 'Riley Park',
      channel: 'RileyTravels',
      subs: '51K',
      badge: 'Reference feature rocks'
    }
  ];

  const faqs = [
    {
      q: 'Is this actually AI or just templates?',
      a: 'It\'s real AI trained on successful thumbnail designs. Every design is generated fresh based on your input. We don\'t use templates that hundreds of other creators are using. Your thumbnail is unique to you.'
    },
    {
      q: 'Will my thumbnails look like everyone else\'s?',
      a: 'No. That\'s the whole point. The AI generates unique designs based on YOUR idea, YOUR style preferences, and YOUR niche. Even if two people type the same prompt, they\'ll get different results.'
    },
    {
      q: 'Do I need design experience?',
      a: 'Zero. If you can type, you can use Youbnail. The AI handles composition, color theory, contrast, hierarchy — all the design stuff you\'d learn in 4 years of design school.'
    },
    {
      q: 'How long does it take to generate a thumbnail?',
      a: 'Usually just seconds. Type your idea, hit generate, and watch it appear. Our AI works fast so you can iterate quickly.'
    },
    {
      q: 'Can I edit the thumbnails after they\'re generated?',
      a: 'Yes. Change text, swap colors, adjust styles. Or regenerate entirely. You\'re in control.'
    },
    {
      q: 'What video formats do you support for snapshot extraction?',
      a: 'MP4, MOV, AVI, MKV, WebM. If you can upload it to YouTube, we can extract frames from it.'
    },
    {
      q: 'Do you store my videos?',
      a: 'No. We extract the frames you need, then delete the video immediately. Privacy matters.'
    },
    {
      q: 'Can I use Youbnail for client work?',
      a: 'Check our terms of service for details on commercial usage. We recommend contacting support for specific commercial use cases.'
    },
    {
      q: 'What makes this better than Canva or Photoshop?',
      a: 'Speed and intelligence. Canva gives you templates. Photoshop gives you tools. Youbnail gives you AI that understands what works. Plus, we\'re built specifically for YouTube thumbnails. Not flyers. Not Instagram posts. Thumbnails.'
    },
    {
      q: 'I\'m not a YouTuber. Can I still use this?',
      a: 'Absolutely. Course creators, marketers, social media managers, agencies — anyone who needs attention-grabbing visuals can use Youbnail.'
    },
    {
      q: 'What if I don\'t like any of the generated options?',
      a: 'Regenerate. Different prompt. Different style. Try again. With your monthly credit allowance, you can keep generating until you find the one that makes you say "YES."'
    },
    {
      q: 'Is my data secure?',
      a: 'Yes. 256-bit encryption. We don\'t sell data. We don\'t share data. We barely look at data. Your thumbnails are yours.'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{background: 'var(--bg-primary)'}}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50" style={{paddingTop: '1rem'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <img 
              src="https://wawfgjzpwykvjgmuaueb.supabase.co/storage/v1/object/public/internal/1.png" 
              alt="Youbnail" 
              className="h-10"
            />
            <nav className="hidden md:flex items-center gap-2">
              <div className="flex items-center gap-1 rounded-full px-1 py-1 backdrop-blur-xl" 
                   style={{background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)'}}>
                <button onClick={() => scrollToSection('features')} 
                        className="px-3 py-2 text-sm font-medium transition-colors rounded-full hover:bg-white/5" 
                        style={{color: 'var(--text-secondary)'}}>Features</button>
                <button onClick={() => scrollToSection('how-it-works')} 
                        className="px-3 py-2 text-sm font-medium transition-colors rounded-full hover:bg-white/5" 
                        style={{color: 'var(--text-secondary)'}}>How It Works</button>
                <button onClick={() => scrollToSection('pricing')} 
                        className="px-3 py-2 text-sm font-medium transition-colors rounded-full hover:bg-white/5" 
                        style={{color: 'var(--text-secondary)'}}>Pricing</button>
                <button onClick={() => scrollToSection('contact')} 
                        className="px-3 py-2 text-sm font-medium transition-colors rounded-full hover:bg-white/5" 
                        style={{color: 'var(--text-secondary)'}}>Contact</button>
                <Link to="/login" 
                      className="ml-1 px-3 py-2 text-sm font-medium transition-colors rounded-full hover:bg-white/5" 
                      style={{color: 'var(--text-secondary)'}}>Login</Link>
                <Link to="/signup" className="ml-1 btn-primary px-4 py-2 text-sm font-semibold inline-flex items-center gap-2">
                  Get Started
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 7h10v10" /><path d="M7 17 17 7" />
                  </svg>
                </Link>
              </div>
            </nav>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden inline-flex h-12 w-12 items-center justify-center rounded-full backdrop-blur-xl transition-all duration-200 hover:scale-105" 
              style={{background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.15)'}}
              aria-label="Toggle menu">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: 'var(--text-primary)'}}>
                <path d="M4 5h16" /><path d="M4 12h16" /><path d="M4 19h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Menu Panel */}
          <div className="fixed top-0 right-0 h-full w-72 max-w-[90vw] shadow-xl" 
               style={{background: 'var(--bg-primary)', borderLeft: '1px solid rgba(255, 255, 255, 0.1)'}}>
            <div className="flex items-center justify-between p-4 sm:p-6 border-b" style={{borderColor: 'rgba(255, 255, 255, 0.1)'}}>
              <img 
                src="https://wawfgjzpwykvjgmuaueb.supabase.co/storage/v1/object/public/internal/1.png" 
                alt="Youbnail" 
                className="h-8"
              />
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg transition-colors hover:bg-white/5 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: 'var(--text-primary)'}}>
                  <path d="M18 6L6 18" /><path d="M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-4 sm:p-6 space-y-2">
              <button 
                onClick={() => { scrollToSection('features'); setIsMobileMenuOpen(false); }}
                className="block w-full text-left px-4 py-4 rounded-lg transition-colors hover:bg-white/5 min-h-[48px] text-base" 
                style={{color: 'var(--text-primary)'}}>
                Features
              </button>
              <button 
                onClick={() => { scrollToSection('how-it-works'); setIsMobileMenuOpen(false); }}
                className="block w-full text-left px-4 py-4 rounded-lg transition-colors hover:bg-white/5 min-h-[48px] text-base" 
                style={{color: 'var(--text-primary)'}}>
                How It Works
              </button>
              <button 
                onClick={() => { scrollToSection('pricing'); setIsMobileMenuOpen(false); }}
                className="block w-full text-left px-4 py-4 rounded-lg transition-colors hover:bg-white/5 min-h-[48px] text-base" 
                style={{color: 'var(--text-primary)'}}>
                Pricing
              </button>
              <button 
                onClick={() => { scrollToSection('contact'); setIsMobileMenuOpen(false); }}
                className="block w-full text-left px-4 py-4 rounded-lg transition-colors hover:bg-white/5 min-h-[48px] text-base" 
                style={{color: 'var(--text-primary)'}}>
                Contact
              </button>
              
              <div className="pt-4 border-t space-y-3" style={{borderColor: 'rgba(255, 255, 255, 0.1)'}}>
                <Link 
                  to="/login" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full text-center px-4 py-4 rounded-lg transition-colors hover:bg-white/5 border min-h-[48px] flex items-center justify-center text-base" 
                  style={{color: 'var(--text-primary)', borderColor: 'rgba(255, 255, 255, 0.2)'}}>
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full text-center btn-primary px-4 py-4 font-semibold min-h-[48px] flex items-center justify-center text-base">
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1. Hero Section */}
      <section className="pt-24 sm:pt-32 lg:pt-40 pb-12 sm:pb-16 lg:pb-20 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-64 sm:w-80 lg:w-96 h-64 sm:h-80 lg:h-96 rounded-full blur-3xl" style={{background: 'var(--accent-primary)'}}></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 sm:w-80 lg:w-96 h-64 sm:h-80 lg:h-96 rounded-full blur-3xl" style={{background: '#dc2626'}}></div>
        </div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold mb-6 sm:mb-8" 
               style={{background: 'var(--accent-light)', color: 'var(--accent-primary)', border: '1px solid rgba(239, 68, 68, 0.2)'}}>
            <span className="animate-pulse">●</span> NEW: AI now generates thumbnails in 3 seconds
          </div>
          
          <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 leading-tight px-2" style={{color: 'var(--text-primary)'}}>
            Stop Losing Views<br />to <span style={{background: 'linear-gradient(135deg, var(--accent-primary), #dc2626)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
              Boring Thumbnails
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl lg:text-2xl mb-4 sm:mb-6 max-w-4xl mx-auto leading-relaxed px-4" style={{color: 'var(--text-secondary)'}}>
            The AI-powered thumbnail generator that turns your ideas into click-magnets in seconds.<br className="hidden sm:block" />
            <span className="block sm:inline">No design skills. No expensive software. Just results.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8 sm:mb-12 mt-6 sm:mt-8 px-4">
            <Link to="/signup" className="btn-primary px-6 sm:px-8 py-4 sm:py-4 text-base sm:text-lg font-semibold w-full sm:w-auto min-h-[48px] flex items-center justify-center">
              Get Started →
            </Link>
            <button onClick={() => scrollToSection('video-demo')} className="btn-secondary px-6 sm:px-8 py-4 sm:py-4 text-base sm:text-lg font-semibold w-full sm:w-auto min-h-[48px] flex items-center justify-center">
              Watch 30-Sec Demo
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-sm px-4" style={{color: 'var(--text-muted)'}}>
            <div className="flex items-center gap-1">⭐⭐⭐⭐⭐ <span className="ml-2">Trusted by YouTube creators worldwide</span></div>
            <div className="hidden sm:block">•</div>
            <div>Growing community of creators</div>
          </div>
        </div>
      </section>

      {/* 3. Problem-Solution Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-center mb-8 sm:mb-12 lg:mb-16 px-4" style={{color: 'var(--text-primary)'}}>
            The Thumbnail Struggle Ends Here
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Old Way */}
            <div className="card p-6 sm:p-8 border-2" style={{borderColor: '#dc2626', background: 'rgba(220, 38, 38, 0.05)'}}>
              <div className="text-3xl sm:text-4xl mb-4">😰</div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4" style={{color: 'var(--text-primary)'}}>The Old Way</h3>
              <p className="text-base sm:text-lg mb-4 sm:mb-6" style={{color: 'var(--text-secondary)'}}>Hours wasted. Money drained. Views lost.</p>
              
              <ul className="space-y-3 mb-6">
                {[
                  'Spend 2+ hours in Photoshop per thumbnail',
                  'Pay $50-$200 to freelance designers',
                  'Wait 24-48 hours for revisions',
                  'Still get generic, forgettable designs',
                  'Watch competitors get 10x more clicks'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-xl mt-0.5">❌</span>
                    <span style={{color: 'var(--text-secondary)'}}>{item}</span>
                  </li>
                ))}
              </ul>
              
              <p className="text-sm font-semibold" style={{color: '#dc2626'}}>
                Result: Your amazing content dies unwatched.
              </p>
            </div>

            {/* New Way */}
            <div className="card p-6 sm:p-8 border-2" style={{borderColor: 'var(--accent-primary)', background: 'rgba(239, 68, 68, 0.05)', boxShadow: '0 0 40px rgba(239, 68, 68, 0.1)'}}>
              <h3 className="text-2xl font-bold mb-2" style={{color: 'var(--text-primary)'}}>The Youbnail Way</h3>
              <p className="text-lg mb-6" style={{color: 'var(--text-secondary)'}}>Click. Type. Download. Succeed.</p>
              
              <ul className="space-y-3 mb-6">
                {[
                  'Generate stunning thumbnails in 3 seconds',
                  'Pay once, create unlimited designs',
                  'Instant results, instant revisions',
                  'AI learns from viral thumbnails',
                  'Designs that make viewers stop scrolling'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-xl mt-0.5">✅</span>
                    <span style={{color: 'var(--text-secondary)'}}>{item}</span>
                  </li>
                ))}
              </ul>
              
              <p className="text-sm font-semibold" style={{color: 'var(--accent-success)'}}>
                Result: Your content finally gets the views it deserves.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Video Demo Section */}
      <section id="video-demo" className="py-20 px-4" style={{background: 'var(--bg-secondary)'}}>
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-xs font-bold tracking-wider mb-4" style={{color: 'var(--accent-primary)'}}>
            FROM IDEA TO VIRAL IN 60 SECONDS
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4" style={{color: 'var(--text-primary)'}}>
            Watch a Real Creator Go From<br />Zero to Thumbnail in One Minute
          </h2>
          <p className="text-lg mb-8" style={{color: 'var(--text-secondary)'}}>
            No cuts. No editing tricks. Just raw speed.
          </p>

          <div className="card p-4 mb-8">
            <div className="aspect-video w-full rounded-lg flex items-center justify-center relative overflow-hidden" 
                 style={{background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.1))'}}>
              <button className="w-20 h-20 rounded-full flex items-center justify-center" 
                      style={{background: 'var(--accent-primary)'}}>
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="white">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </button>
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center justify-between text-xs" style={{color: 'var(--text-muted)'}}>
                  <span>0:00 - Enter video idea</span>
                  <span>0:03 - AI generates 4 options</span>
                  <span>0:45 - Download in HD</span>
                </div>
              </div>
            </div>
          </div>

          <Link to="/signup" className="btn-primary px-8 py-4 text-lg font-semibold inline-block">
            Try It Yourself →
          </Link>
        </div>
      </section>

      {/* 5. Features Grid */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4" style={{color: 'var(--text-primary)'}}>
              Everything You Need to Dominate the YouTube Feed
            </h2>
            <p className="text-lg sm:text-xl" style={{color: 'var(--text-secondary)'}}>
              Nine tools that turn scroll-past into must-watch.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '🧠', title: 'AI That Knows What Works', desc: 'Stop guessing. Our AI studied successful viral thumbnails to learn what makes people click.' },
              { icon: '⚡', title: 'Lightning Fast Generation', desc: 'Type your idea and watch your thumbnail appear in seconds. Faster than making coffee.' },
              { icon: '🎨', title: 'Infinite Variations', desc: 'Don\'t like option 1? Get 2, 3, 4, and 5. Each one different. Each one designed to convert.' },
              { icon: '📹', title: 'Video Snapshot Magic', desc: 'Upload your video, find the perfect frame, capture it, and enhance with AI.' },
              { icon: '🎭', title: 'Match Any Style', desc: 'Upload a reference. We clone the style, not the design. Your brand, amplified.' },
              { icon: '✍️', title: 'Smart Text Placement', desc: 'Text that pops. Contrast that works. Readability that converts. All automatic.' },
              { icon: '🖼️', title: 'HD Export, Every Time', desc: '1280x720. Perfect for YouTube. No pixelation. No amateur mistakes.' },
              { icon: '🔄', title: 'Unlimited Revisions', desc: 'Change colors. Swap text. Try new styles. No designer needed. No extra charges.' },
              { icon: '💾', title: 'One-Click Downloads', desc: 'No watermarks. No hoops. Just click download and upload to YouTube.' }
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

      {/* 6. Before/After Showcase */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6" style={{background: 'var(--bg-secondary)'}}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 px-4" style={{color: 'var(--text-primary)'}}>
              Better Thumbnails, Better Performance
            </h2>
            <p className="text-base sm:text-lg lg:text-xl px-4" style={{color: 'var(--text-secondary)'}}>
              Professional thumbnails get more clicks than generic ones.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {[
              { 
                category: 'GAMING', 
                description: 'Eye-catching thumbnails with high contrast and dynamic elements perform better than simple screenshots.',
                beforeImage: 'https://wawfgjzpwykvjgmuaueb.supabase.co/storage/v1/object/public/internal/thumbnails%20before%20after/gaming%20before.png',
                afterImage: 'https://wawfgjzpwykvjgmuaueb.supabase.co/storage/v1/object/public/internal/thumbnails%20before%20after/gaming%20after.png'
              },
              { 
                category: 'TECH', 
                description: 'Clean, professional designs with clear product focus outperform cluttered or amateur designs.',
                beforeImage: 'https://wawfgjzpwykvjgmuaueb.supabase.co/storage/v1/object/public/internal/thumbnails%20before%20after/tech%20before.png',
                afterImage: 'https://wawfgjzpwykvjgmuaueb.supabase.co/storage/v1/object/public/internal/thumbnails%20before%20after/tech%20after.png'
              },
              { 
                category: 'LIFESTYLE', 
                description: 'Bright, aspirational thumbnails with good composition draw more clicks than casual photos.',
                beforeImage: 'https://wawfgjzpwykvjgmuaueb.supabase.co/storage/v1/object/public/internal/thumbnails%20before%20after/lifestyle%20before.png',
                afterImage: 'https://wawfgjzpwykvjgmuaueb.supabase.co/storage/v1/object/public/internal/thumbnails%20before%20after/lifestyle%20after.png'
              },
              { 
                category: 'EDUCATION', 
                description: 'Clear, organized thumbnails with readable text perform better than text-heavy or unclear designs.',
                beforeImage: 'https://wawfgjzpwykvjgmuaueb.supabase.co/storage/v1/object/public/internal/thumbnails%20before%20after/education%20before.png',
                afterImage: 'https://wawfgjzpwykvjgmuaueb.supabase.co/storage/v1/object/public/internal/thumbnails%20before%20after/education%20after.png'
              }
            ].map((example, i) => (
              <div key={i} className="card p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-bold tracking-wider" style={{color: 'var(--accent-primary)'}}>{example.category}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
                  <div className="group">
                    <div className="aspect-video rounded-lg mb-2 overflow-hidden border border-red-200 group-hover:scale-105 transition-transform duration-300">
                      <img 
                        src={example.beforeImage} 
                        alt={`${example.category} generic thumbnail`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <p className="text-xs font-medium text-center" style={{color: 'var(--text-muted)'}}>❌ Generic thumbnail</p>
                  </div>
                  <div className="group">
                    <div className="aspect-video rounded-lg mb-2 overflow-hidden border border-green-200 group-hover:scale-105 transition-transform duration-300">
                      <img 
                        src={example.afterImage} 
                        alt={`${example.category} professional thumbnail`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <p className="text-xs font-medium text-center" style={{color: 'var(--accent-success)'}}>✅ Professional design</p>
                  </div>
                </div>
                
                <div className="px-3 py-2 rounded-lg text-center text-sm" 
                     style={{background: 'rgba(239, 68, 68, 0.1)', color: 'var(--text-secondary)'}}>
                  {example.description}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/signup" className="btn-primary px-8 py-4 text-lg font-semibold inline-block">
              Get These Results — Get Started →
            </Link>
          </div>
        </div>
      </section>

      {/* 7. How It Works */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4" style={{color: 'var(--text-primary)'}}>
              So Simple, Your Grandma Could Do It
            </h2>
            <p className="text-lg sm:text-xl" style={{color: 'var(--text-secondary)'}}>
              (But She Won't Get Your Views)
            </p>
          </div>

          <div className="space-y-8">
            {[
              { num: '1', badge: 'STEP 1 • 5 SECONDS', title: 'Tell Us Your Video Idea', desc: 'Type what your video is about. "How to build a gaming PC" or "Morning routine for productivity" or just "funny cat moments." Be as vague or specific as you want. The AI understands both.', time: '⏱️ Takes 5 seconds' },
              { num: '2', badge: 'STEP 2 • 3 SECONDS', title: 'Watch AI Work Its Magic', desc: 'Our AI analyzes your idea, cross-references 10 million viral thumbnails, applies color psychology, and generates 4 unique options. You\'re watching Netflix. The AI is working.', time: '⏱️ Takes 3 seconds (seriously)' },
              { num: '3', badge: 'STEP 3 • 30 SECONDS', title: 'Pick, Tweak, Perfect', desc: 'Love one? Download it. Want to change the text? Click and edit. Prefer different colors? One click. Want a totally different style? Regenerate. You\'re in control, but you don\'t have to be a designer.', time: '⏱️ Takes 30 seconds (or less)' },
              { num: '4', badge: 'STEP 4 • 2 SECONDS', title: 'Download & Watch Views Soar', desc: 'One click. HD quality. Perfect YouTube dimensions. No watermark. No catch. Upload to YouTube and watch your CTR jump. Then come back and make another.', time: '⏱️ Takes 2 seconds' }
            ].map((step, i) => (
              <div key={i} className="card p-8">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold" 
                       style={{background: 'linear-gradient(135deg, var(--accent-primary), #dc2626)', color: 'white'}}>
                    {step.num}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold tracking-wider mb-2" style={{color: 'var(--accent-primary)'}}>{step.badge}</p>
                    <h3 className="text-2xl font-bold mb-3" style={{color: 'var(--text-primary)'}}>
                      {step.title}
                    </h3>
                    <p className="text-base mb-4 leading-relaxed" style={{color: 'var(--text-secondary)'}}>
                      {step.desc}
                    </p>
                    <p className="text-sm font-medium" style={{color: 'var(--text-muted)'}}>
                      {step.time}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="card p-6 text-center mt-12">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm font-medium mb-6">
              <div>
                <span style={{color: 'var(--text-muted)'}}>⏰ Total Time: </span>
                <span className="font-bold" style={{color: 'var(--text-primary)'}}>40 Seconds</span>
              </div>
              <div>
                <span style={{color: 'var(--text-muted)'}}>🎯 Total Cost: </span>
                <span className="font-bold" style={{color: 'var(--text-primary)'}}>$0 to try</span>
              </div>
              <div>
                <span style={{color: 'var(--text-muted)'}}>📈 Potential Views: </span>
                <span className="font-bold" style={{color: 'var(--accent-primary)'}}>Unlimited</span>
              </div>
            </div>
            <Link to="/signup" className="btn-primary px-8 py-4 text-lg font-semibold inline-block">
              Start Your First Thumbnail Now →
            </Link>
          </div>
        </div>
      </section>

      {/* 8. Use Cases */}
      <section className="py-20 px-4" style={{background: 'var(--bg-secondary)'}}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4" style={{color: 'var(--text-primary)'}}>
              Built for Every Creator. Optimized for Your Niche.
            </h2>
            <p className="text-lg sm:text-xl" style={{color: 'var(--text-secondary)'}}>
              One tool. Infinite possibilities. Here's how creators like you win with Youbnail.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {useCases.map((useCase, i) => (
              <button
                key={i}
                onClick={() => setActiveUseCase(i)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeUseCase === i ? 'btn-primary' : 'btn-secondary'}`}
              >
                {useCase.label}
              </button>
            ))}
          </div>

          {/* Active Use Case */}
          <div className="card p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-2" style={{color: 'var(--text-primary)'}}>
              {useCases[activeUseCase].name}
            </h3>
            
            <div className="mb-6">
              <p className="text-sm font-semibold mb-2" style={{color: 'var(--text-muted)'}}>The Challenge:</p>
              <p className="text-lg italic" style={{color: 'var(--text-secondary)'}}>
                {useCases[activeUseCase].challenge}
              </p>
            </div>

            <div className="mb-6">
              <p className="text-sm font-semibold mb-3" style={{color: 'var(--text-muted)'}}>How Youbnail Helps:</p>
              <ul className="space-y-2">
                {useCases[activeUseCase].benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-lg mt-0.5">•</span>
                    <span style={{color: 'var(--text-secondary)'}}>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="px-4 py-3 rounded-lg" style={{background: 'rgba(239, 68, 68, 0.1)'}}>
              <p className="text-sm font-semibold" style={{color: 'var(--accent-primary)'}}>
                Result: {useCases[activeUseCase].result}
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-sm mb-4" style={{color: 'var(--text-muted)'}}>
              Not seeing your niche? Youbnail works for every content type.
            </p>
            <Link to="/signup" className="btn-primary px-8 py-4 text-lg font-semibold inline-block">
              Start Creating Your Niche Thumbnails →
            </Link>
          </div>
        </div>
      </section>

      {/* 9. Stats Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-4">
            <p className="text-xs font-bold tracking-wider" style={{color: 'var(--accent-primary)'}}>
              THE NUMBERS DON'T LIE
            </p>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-16" style={{color: 'var(--text-primary)'}}>
            Real Results. Real Creators. Real Growth.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {[
              { number: 'Fast', label: 'AI Generation', subtext: 'Create professional thumbnails in seconds, not hours.' },
              { number: 'Better', label: 'Click Performance', subtext: 'Well-designed thumbnails perform better than generic ones.' },
              { number: 'Easy', label: 'No Design Skills', subtext: 'Built for creators, not designers. Anyone can use it.' },
              { number: '4.9★', label: 'User Rating', subtext: 'Creators love the simplicity and results.' }
            ].map((stat, i) => (
              <div key={i} className="card p-6 text-center">
                <div className="text-4xl sm:text-5xl font-bold mb-2" 
                     style={{background: 'linear-gradient(135deg, var(--accent-primary), #dc2626)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                  {stat.number}
                </div>
                <div className="text-lg font-bold mb-2" style={{color: 'var(--text-primary)'}}>
                  {stat.label}
                </div>
                <p className="text-sm" style={{color: 'var(--text-muted)'}}>
                  {stat.subtext}
                </p>
              </div>
            ))}
          </div>

          <div className="card p-6 text-center max-w-3xl mx-auto mb-8">
            <p className="text-sm" style={{color: 'var(--text-secondary)'}}>
              📊 Youbnail helps creators around the world create better thumbnails every day.
            </p>
          </div>

          <div className="text-center">
            <Link to="/signup" className="btn-primary px-8 py-4 text-lg font-semibold inline-block">
              Get Started Today →
            </Link>
          </div>
        </div>
      </section>

      {/* 10. Testimonials */}
      <section className="py-20 px-4" style={{background: 'var(--bg-secondary)'}}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4" style={{color: 'var(--text-primary)'}}>
              What Creators Say After Their First Viral Thumbnail
            </h2>
            <p className="text-lg sm:text-xl" style={{color: 'var(--text-secondary)'}}>
              We could brag. But let's hear from the people who actually use it.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {testimonials.map((testimonial, i) => (
              <div key={i} className="card p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <span key={j} className="text-xl" style={{color: '#fbbf24'}}>★</span>
                  ))}
                </div>
                <p className="text-sm mb-4 leading-relaxed" style={{color: 'var(--text-secondary)'}}>
                  "{testimonial.text}"
                </p>
                <div className="border-t pt-4" style={{borderColor: 'var(--border-primary)'}}>
                  <p className="text-sm font-bold mb-1" style={{color: 'var(--text-primary)'}}>
                    {testimonial.name}
                  </p>
                  <p className="text-xs mb-2" style={{color: 'var(--text-muted)'}}>
                    {testimonial.channel} • {testimonial.subs} subscribers
                  </p>
                  <div className="px-2 py-1 rounded text-xs font-medium inline-block" 
                       style={{background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-primary)'}}>
                    {testimonial.badge}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="card p-6 max-w-2xl mx-auto text-center mb-8">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm" style={{color: 'var(--text-muted)'}}>
              <div>📊 High satisfaction rate from users</div>
              <div>✅ Most creators recommend to others</div>
            </div>
          </div>

          <div className="text-center">
            <Link to="/signup" className="btn-primary px-8 py-4 text-lg font-semibold inline-block">
              Join These Winning Creators →
            </Link>
          </div>
        </div>
      </section>

      {/* 11. Feature Deep Dive */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-4">
            <p className="text-xs font-bold tracking-wider" style={{color: 'var(--accent-primary)'}}>
              POWERFUL FEATURES, ZERO LEARNING CURVE
            </p>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-20" style={{color: 'var(--text-primary)'}}>
            Three Tools That Change Everything
          </h2>

          <div className="space-y-24">
            {/* Feature 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="rounded-xl overflow-hidden" style={{border: '2px solid var(--border-primary)'}}>
                  <img 
                    src="https://wawfgjzpwykvjgmuaueb.supabase.co/storage/v1/object/public/internal/The%20AI%20That%20Studied%20Successful%20Viral%20Thumbnails%20So%20You%20Don't%20Have%20To.gif"
                    alt="The AI That Studied Successful Viral Thumbnails So You Don't Have To"
                    className="w-full h-auto"
                    loading="lazy"
                  />
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <div className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-4" 
                     style={{background: 'var(--accent-primary)', color: 'white'}}>
                  ⚡ MOST POPULAR
                </div>
                <h3 className="text-3xl font-bold mb-4" style={{color: 'var(--text-primary)'}}>
                  The AI That Studied Successful Viral Thumbnails So You Don't Have To
                </h3>
                <p className="text-base mb-6 leading-relaxed" style={{color: 'var(--text-secondary)'}}>
                  We didn't just build an AI. We built an AI that learned from the best performing thumbnails across YouTube. Gaming. Education. Lifestyle. Tech. It knows what makes your niche click.
                </p>
                <p className="text-base mb-6 leading-relaxed" style={{color: 'var(--text-secondary)'}}>
                  Type your video idea. The AI doesn't just generate a pretty picture. It generates a strategic design created to stop the scroll, trigger curiosity, and earn the click.
                </p>
                <ul className="space-y-2 mb-6">
                  {[
                    'Trained on high-performing thumbnails across all niches',
                    'Understands color psychology and visual hierarchy',
                    'Gets smarter with every thumbnail created',
                    'No two designs are ever exactly the same'
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-lg mt-0.5" style={{color: 'var(--accent-success)'}}>✓</span>
                      <span className="text-sm" style={{color: 'var(--text-secondary)'}}>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="card p-4 mb-6" style={{background: 'rgba(239, 68, 68, 0.05)'}}>
                  <p className="text-sm italic" style={{color: 'var(--text-secondary)'}}>
                    💡 "The AI understands context. When I type 'iPhone review,' it knows to use tech aesthetics. When I type 'morning routine,' it knows to use lifestyle vibes. It's scary good." — Sarah M., Tech Reviewer
                  </p>
                </div>
                <Link to="/signup" className="btn-primary px-6 py-3 text-base font-semibold inline-block">
                  Try AI Generation →
                </Link>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-4" 
                     style={{background: 'var(--accent-primary)', color: 'white'}}>
                  🎯 TIME SAVER
                </div>
                <h3 className="text-3xl font-bold mb-4" style={{color: 'var(--text-primary)'}}>
                  Turn Any Video Frame Into a Scroll-Stopping Thumbnail in 4 Clicks
                </h3>
                <p className="text-base mb-6 leading-relaxed" style={{color: 'var(--text-secondary)'}}>
                  Already have your video? Perfect. Upload it and scrub through to find the perfect frame for your thumbnail.
                </p>
                <p className="text-base mb-6 leading-relaxed" style={{color: 'var(--text-secondary)'}}>
                  Found the perfect moment? Click it. Our tools enhance colors, add professional text, adjust contrast, and make it thumbnail-ready. Simple and effective.
                </p>
                <ul className="space-y-2 mb-6">
                  {[
                    'Upload and play video files',
                    'Manually select the best frame',
                    'Background removal tools available',
                    'Color and contrast enhancement',
                    'Professional text overlay options',
                    'Supports MP4, MOV, AVI formats'
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-lg mt-0.5" style={{color: 'var(--accent-success)'}}>✓</span>
                      <span className="text-sm" style={{color: 'var(--text-secondary)'}}>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="card p-4 mb-6" style={{background: 'rgba(239, 68, 68, 0.05)'}}>
                  <p className="text-sm font-medium" style={{color: 'var(--text-secondary)'}}>
                    ⏱️ Creating thumbnails from videos:<br />
                    <span style={{color: 'var(--text-muted)'}}>Traditional way: Time-consuming</span> | <span style={{color: 'var(--accent-primary)'}}>Youbnail: Quick & easy</span>
                  </p>
                </div>
                <Link to="/signup" className="btn-primary px-6 py-3 text-base font-semibold inline-block">
                  Extract Your First Frame →
                </Link>
              </div>
              <div>
                <div className="rounded-xl overflow-hidden" style={{border: '2px solid var(--border-primary)'}}>
                  <img 
                    src="https://wawfgjzpwykvjgmuaueb.supabase.co/storage/v1/object/public/internal/Turn%20Any%20Video%20Frame%20Into%20a%20Scroll-Stopping%20Thumbnail%20in%204%20Clicks%20(1).gif"
                    alt="Turn Any Video Frame Into a Scroll-Stopping Thumbnail in 4 Clicks"
                    className="w-full h-auto"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="rounded-xl overflow-hidden" style={{border: '2px solid var(--border-primary)'}}>
                  <img 
                    src="https://wawfgjzpwykvjgmuaueb.supabase.co/storage/v1/object/public/internal/Clone%20Any%20Style.%20Keep%20Your%20Brand.%20Never%20Plagiarize..gif"
                    alt="Clone Any Style. Keep Your Brand. Never Plagiarize."
                    className="w-full h-auto"
                    loading="lazy"
                  />
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <div className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-4" 
                     style={{background: 'var(--accent-primary)', color: 'white'}}>
                  🎨 BRAND BUILDER
                </div>
                <h3 className="text-3xl font-bold mb-4" style={{color: 'var(--text-primary)'}}>
                  Clone Any Style. Keep Your Brand. Never Plagiarize.
                </h3>
                <p className="text-base mb-6 leading-relaxed" style={{color: 'var(--text-secondary)'}}>
                  Found a thumbnail style you love? Upload it as a reference. Youbnail's AI analyzes the color palette, typography, composition, and energy — then generates thumbnails in that STYLE, not copies.
                </p>
                <p className="text-base mb-6 leading-relaxed" style={{color: 'var(--text-secondary)'}}>
                  It's like having a designer who can work in any style you want. Except faster. And cheaper. And doesn't need coffee breaks.
                </p>
                <ul className="space-y-2 mb-6">
                  {[
                    'Upload any image as a style reference',
                    'AI extracts style DNA, not the design itself',
                    'Generate unlimited variations in that style',
                    'Maintain brand consistency across all thumbnails',
                    'Experiment with different aesthetics risk-free',
                    'Works with photos, illustrations, or existing thumbnails'
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-lg mt-0.5" style={{color: 'var(--accent-success)'}}>✓</span>
                      <span className="text-sm" style={{color: 'var(--text-secondary)'}}>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="card p-4 mb-6" style={{background: 'rgba(239, 68, 68, 0.05)'}}>
                  <p className="text-sm" style={{color: 'var(--text-secondary)'}}>
                    🎯 <strong>Use Case:</strong> Upload your highest-performing thumbnail. Generate 50 more in that winning style. Watch your entire catalog's CTR skyrocket.
                  </p>
                </div>
                <Link to="/signup" className="btn-primary px-6 py-3 text-base font-semibold inline-block">
                  Match Your First Style →
                </Link>
              </div>
            </div>
          </div>

          <div className="text-center mt-20">
            <h3 className="text-2xl font-bold mb-2" style={{color: 'var(--text-primary)'}}>
              These three tools are just the beginning.
            </h3>
            <p className="text-lg mb-6" style={{color: 'var(--text-secondary)'}}>
              Get started today. No commitment.
            </p>
            <Link to="/signup" className="btn-primary px-8 py-4 text-lg font-semibold inline-block">
              Start Creating Now →
            </Link>
          </div>
        </div>
      </section>

      {/* 12. Pricing */}
      <section id="pricing" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6" style={{background: 'var(--bg-secondary)'}}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-3 sm:mb-4">
            <p className="text-xs sm:text-sm font-bold tracking-wider px-4" style={{color: 'var(--accent-primary)'}}>
              TRANSPARENT PRICING, ZERO SURPRISES
            </p>
          </div>
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 px-4" style={{color: 'var(--text-primary)'}}>
              Choose Your Growth Plan
            </h2>
            <p className="text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 px-4" style={{color: 'var(--text-secondary)'}}>
              Simple pricing for serious creators. Choose your plan.
            </p>

            {/* Toggle */}
            <div className="inline-flex items-center gap-2 p-1 rounded-full" style={{background: 'var(--bg-primary)', border: '1px solid var(--border-primary)'}}>
              <button
                onClick={() => setPricingToggle('monthly')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${pricingToggle === 'monthly' ? 'btn-primary' : ''}`}
                style={pricingToggle === 'monthly' ? {} : {color: 'var(--text-secondary)'}}
              >
                Monthly
              </button>
              <button
                onClick={() => setPricingToggle('annual')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${pricingToggle === 'annual' ? 'btn-primary' : ''}`}
                style={pricingToggle === 'annual' ? {} : {color: 'var(--text-secondary)'}}
              >
                Annual <span className="ml-1 text-xs">(Save 40%)</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto mb-12 sm:mb-16">
            {/* Starter Plan */}
            <div className="card p-6 sm:p-8 border-2" style={{borderColor: 'var(--border-primary)'}}>
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-2xl font-bold mb-2" style={{color: 'var(--text-primary)'}}>Starter</h3>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-bold" style={{color: 'var(--text-primary)'}}>
                  ${pricingToggle === 'monthly' ? '20' : '14'}
                </span>
                <span style={{color: 'var(--text-muted)'}}>
                  /month {pricingToggle === 'annual' && '(billed annually)'}
                </span>
              </div>
              <p className="text-sm mb-6" style={{color: 'var(--text-muted)'}}>FOR GROWING CREATORS</p>
              
              <p className="text-sm mb-6" style={{color: 'var(--text-secondary)'}}>
                Perfect for consistent content creators who need reliable thumbnail generation.
              </p>

              <div className="px-3 py-2 rounded-lg mb-6 text-center text-sm font-medium" 
                   style={{background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-primary)'}}>
                {pricingToggle === 'monthly' ? '30' : '360'} thumbnails included
              </div>

              <ul className="space-y-3 mb-8">
                {[
                  'Prompt-to-Thumbnail Generation',
                  'Reference Image Mode',
                  'Video Snapshot Mode',
                  '16:9 & 9:16 Aspect Ratios',
                  'Overlay Text',
                  'Quick Theme Presets (8 themes)',
                  'Style & Lighting Controls',
                  'Gallery & History'
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" style={{color: 'var(--accent-success)'}} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                    </svg>
                    <span className="text-sm" style={{color: 'var(--text-secondary)'}}>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link to="/signup" className="btn-secondary w-full py-3 text-center font-semibold block">
                Get Started →
              </Link>
              <p className="text-xs text-center mt-3" style={{color: 'var(--text-muted)'}}>
                Start creating today
              </p>
            </div>

            {/* Pro Plan */}
            <div className="card p-6 sm:p-8 border-2 relative overflow-hidden" style={{borderColor: 'var(--accent-primary)', boxShadow: '0 0 40px rgba(239, 68, 68, 0.2)'}}>
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold" 
                   style={{background: 'var(--accent-primary)', color: 'white'}}>
                🔥 MOST POPULAR
              </div>
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-2xl font-bold mb-2" style={{color: 'var(--text-primary)'}}>Pro</h3>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-bold" style={{color: 'var(--text-primary)'}}>
                  ${pricingToggle === 'monthly' ? '40' : '28'}
                </span>
                <span style={{color: 'var(--text-muted)'}}>
                  /month {pricingToggle === 'annual' && '(billed annually)'}
                </span>
              </div>
              <p className="text-sm mb-6" style={{color: 'var(--text-muted)'}}>FOR POWER USERS</p>
              
              <p className="text-sm mb-6" style={{color: 'var(--text-secondary)'}}>
                For creators who need advanced features and priority support.
              </p>

              <div className="px-3 py-2 rounded-lg mb-6 text-center text-sm font-medium" 
                   style={{background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-primary)'}}>
                {pricingToggle === 'monthly' ? '100' : '1,200'} thumbnails included
              </div>

              <ul className="space-y-3 mb-8">
                {[
                  'Everything in Starter',
                  'Selective Region Editing',
                  'Priority Support',
                  'Early Access to New Features'
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" style={{color: 'var(--accent-success)'}} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                    </svg>
                    <span className="text-sm" style={{color: 'var(--text-secondary)'}}>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link to="/signup" className="btn-primary w-full py-3 text-center font-semibold block">
                Choose Pro →
              </Link>
              <p className="text-xs text-center mt-3" style={{color: 'var(--text-muted)'}}>
                Cancel anytime
              </p>
            </div>
          </div>


        </div>
      </section>

      {/* 13. FAQ */}
      <section className="py-20 px-4" style={{background: 'var(--bg-secondary)'}}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4" style={{color: 'var(--text-primary)'}}>
              Everything Else You're Wondering
            </h2>
            <p className="text-lg sm:text-xl" style={{color: 'var(--text-secondary)'}}>
              Common questions about Youbnail, answered clearly.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="card overflow-hidden transition-all duration-200 hover:shadow-lg" 
                   style={{background: 'var(--bg-primary)', border: '1px solid var(--border-primary)'}}>
                <button
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="w-full p-6 sm:p-8 text-left flex items-start justify-between gap-4 hover:bg-white/5 transition-colors"
                >
                  <span className="font-semibold text-base sm:text-lg pr-4" style={{color: 'var(--text-primary)'}}>
                    {faq.q}
                  </span>
                  <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-200" 
                       style={{background: expandedFaq === i ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.1)'}}>
                    <span className="text-lg sm:text-xl font-bold" 
                          style={{color: expandedFaq === i ? 'white' : 'var(--accent-primary)'}}>
                      {expandedFaq === i ? '−' : '+'}
                    </span>
                  </div>
                </button>
                {expandedFaq === i && (
                  <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-0">
                    <div className="border-t pt-6" style={{borderColor: 'var(--border-primary)'}}>
                      <p className="text-base leading-relaxed" style={{color: 'var(--text-secondary)'}}>
                        {faq.a}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full mb-6" 
                 style={{background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)'}}>
              <span className="text-2xl">💬</span>
              <span className="font-semibold" style={{color: 'var(--accent-primary)'}}>
                Didn't find your answer?
              </span>
            </div>
            <p className="text-base mb-8 max-w-md mx-auto" style={{color: 'var(--text-secondary)'}}>
              Our support team actually responds. Usually within 2 hours during business hours.
            </p>
            <button onClick={() => scrollToSection('contact')} 
                    className="btn-primary px-6 sm:px-8 py-4 text-base sm:text-lg font-semibold inline-flex items-center justify-center gap-2 hover:scale-105 transition-transform min-h-[48px]">
              Contact Support 
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 7h10v10" /><path d="M7 17 17 7" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* 14. Final CTA */}
      <section className="py-20 px-4 relative overflow-hidden" style={{background: 'linear-gradient(135deg, var(--accent-primary), #dc2626)'}}>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <p className="text-xs font-bold tracking-wider mb-4" style={{color: 'rgba(255, 255, 255, 0.8)'}}>
            ONE LAST THING BEFORE YOU GO
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-white">
            Your Next Video Deserves Better Than a Generic Thumbnail
          </h2>
          <p className="text-lg sm:text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Stop losing views to creators with worse content and better thumbnails.<br />
            Start creating professional thumbnails. Right now.
          </p>
          
          <Link to="/signup" className="inline-block px-8 py-4 text-lg font-semibold rounded-xl mb-4 transition-all hover:scale-105" 
                style={{background: 'white', color: 'var(--accent-primary)'}}>
            Get Started Now →
          </Link>
          <p className="text-sm text-white/80 mb-8">Cancel anytime. 30-day guarantee.</p>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/90 mb-8">
            <div className="flex items-center gap-2">
              <span>✅</span> Get started instantly
            </div>
            <div className="flex items-center gap-2">
              <span>✅</span> Cancel anytime
            </div>
            <div className="flex items-center gap-2">
              <span>✅</span> 30-day money-back guarantee
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-white/70">
            <span>🔥 Growing daily</span>
            <span>📊 Loved by YouTube creators</span>
          </div>
        </div>
      </section>

      {/* 15. Contact Form */}
      <section id="contact" className="py-20 px-4" style={{background: 'var(--bg-secondary)'}}>
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4" style={{color: 'var(--text-primary)'}}>
              Let's Talk
            </h2>
            <p className="text-lg sm:text-xl" style={{color: 'var(--text-secondary)'}}>
              Questions? Feedback? Just want to say hi? We're all ears.
            </p>
          </div>

          <form onSubmit={handleContactSubmit} className="card p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>Your Name</label>
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
              <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>Email Address</label>
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
              <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>What's on your mind?</label>
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
              {formStatus === 'sending' ? 'Sending...' : 
               formStatus === 'sent' ? '✅ Message sent!' : 
               formStatus === 'error' ? 'Try Again →' : 
               'Send Message →'}
            </button>
            {formStatus === 'sent' && (
              <p className="text-center text-sm" style={{color: 'var(--accent-success)'}}>
                We'll get back to you within 2 hours (usually sooner).
              </p>
            )}
            {formStatus === 'error' && (
              <p className="text-center text-sm" style={{color: '#dc2626'}}>
                ❌ Something went wrong. Please try again or email us directly at youbnailteam@gmail.com
              </p>
            )}
          </form>

          <div className="text-center mt-8 text-sm" style={{color: 'var(--text-muted)'}}>
            <p>📧 Average response time: 2 hours</p>
            <p className="mt-2">💬 Prefer live chat? Click the bubble (bottom right) →</p>
          </div>
        </div>
      </section>

      {/* 16. Footer */}
      <footer className="py-12 px-4 border-t" style={{background: 'var(--bg-primary)', borderColor: 'var(--border-primary)'}}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
            {/* Brand */}
            <div>
              <img 
                src="https://wawfgjzpwykvjgmuaueb.supabase.co/storage/v1/object/public/internal/1.png" 
                alt="Youbnail" 
                className="h-10 mb-4"
              />
              <p className="text-sm mb-4" style={{color: 'var(--text-muted)'}}>
                AI-powered thumbnails that convert.
              </p>
              <p className="text-xs mb-4" style={{color: 'var(--text-muted)'}}>
                Built by creators, for creators. Because your content deserves better than boring thumbnails.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold mb-4" style={{color: 'var(--text-primary)'}}>Product</h4>
              <ul className="space-y-2 text-sm">
                {[
                  { label: 'Features', action: () => scrollToSection('features') },
                  { label: 'Pricing', action: () => scrollToSection('pricing') },
                  { label: 'How It Works', action: () => scrollToSection('how-it-works') },
                  { label: 'Video Demo', action: () => scrollToSection('video-demo') }
                ].map((item, i) => (
                  <li key={i}>
                    <button onClick={item.action} style={{color: 'var(--text-muted)'}} className="hover:underline">
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-semibold mb-4" style={{color: 'var(--text-primary)'}}>Resources</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="https://docs.youbnail.com/" target="_blank" rel="noopener noreferrer" style={{color: 'var(--text-muted)'}} className="hover:underline">Documentation</a>
                </li>
                <li>
                  <a href="https://docs.youbnail.com/" target="_blank" rel="noopener noreferrer" style={{color: 'var(--text-muted)'}} className="hover:underline">Help Center</a>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold mb-4" style={{color: 'var(--text-primary)'}}>Company</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => scrollToSection('contact')} style={{color: 'var(--text-muted)'}} className="hover:underline">Contact</button></li>
                <li><Link to="/privacy" style={{color: 'var(--text-muted)'}} className="hover:underline">Privacy Policy</Link></li>
                <li><Link to="/terms" style={{color: 'var(--text-muted)'}} className="hover:underline">Terms of Service</Link></li>
                <li><Link to="/refund" style={{color: 'var(--text-muted)'}} className="hover:underline">Refund Policy</Link></li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="font-semibold mb-4" style={{color: 'var(--text-primary)'}}>Get Thumbnail Tips Weekly</h4>
              <p className="text-sm" style={{color: 'var(--text-muted)'}}>
                Join creators getting weekly tips on CTR optimization, YouTube growth, and thumbnail trends. Coming soon!
              </p>
            </div>
          </div>

          <div className="pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs" 
               style={{borderColor: 'var(--border-primary)', color: 'var(--text-muted)'}}>
            <p>© {new Date().getFullYear()} Youbnail. All rights reserved. Built with ❤️ for creators.</p>
            <div className="flex items-center gap-4">
              <span>🔒 Secure by design</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
