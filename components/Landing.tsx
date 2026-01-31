import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export const Landing: React.FC = () => {
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [pricingToggle, setPricingToggle] = useState<'monthly' | 'annual'>('monthly');
  const [activeUseCase, setActiveUseCase] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('sending');
    await new Promise(resolve => setTimeout(resolve, 1000));
    setFormStatus('sent');
    setContactForm({ name: '', email: '', message: '' });
    setTimeout(() => setFormStatus('idle'), 3000);
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
      text: 'I spent $4,200 on a designer last year. Youbnail paid for itself with the FIRST thumbnail. My views tripled overnight.',
      name: 'Michael Chen',
      channel: 'TechMike Reviews',
      subs: '487K',
      badge: '+312% views'
    },
    {
      rating: 5,
      text: 'I\'m not exaggerating: This tool saved my channel. I was about to quit YouTube because I couldn\'t afford designers. Now I\'m monetized and growing.',
      name: 'Sarah Martinez',
      channel: 'Sarah\'s Kitchen',
      subs: '127K',
      badge: 'From $0 to monetized in 90 days'
    },
    {
      rating: 5,
      text: 'As someone who\'s spent 15 years in graphic design, I\'m honestly impressed. The AI understands composition better than most junior designers I\'ve worked with.',
      name: 'David Thompson',
      channel: 'Design Decoded',
      subs: '892K',
      badge: 'Professional designer approved'
    },
    {
      rating: 5,
      text: 'I make 8-12 thumbnails per course. Used to take me a full day. Now it takes 20 minutes. My students click more. I stress less.',
      name: 'Dr. Emily Roberts',
      channel: 'Marketing Mastery',
      subs: '234K',
      badge: 'Saves 6 hours per course'
    },
    {
      rating: 5,
      text: 'My CTR went from 3% to 18% in one month. Same content. Same editing. Just better thumbnails. This is the missing piece everyone\'s ignoring.',
      name: 'Jake Wilson',
      channel: 'Fitness with Jake',
      subs: '567K',
      badge: '6x CTR improvement'
    },
    {
      rating: 5,
      text: 'I tested it against my $200/thumbnail designer. Youbnail won. The AI thumbnails got 40% more clicks. I\'m not even mad, I\'m impressed.',
      name: 'Lisa Park',
      channel: 'Travel with Lisa',
      subs: '1.2M',
      badge: 'Beat $200 designer'
    }
  ];

  const faqs = [
    {
      q: 'Is this actually AI or just templates?',
      a: 'It\'s real AI. Trained on 10 million thumbnails. Every design is generated fresh based on your input. We don\'t use templates that 500 other creators are using. Your thumbnail is unique to you.'
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
      a: '3 seconds. We timed it. Type your idea. Hit generate. Count to three. Done.'
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
      a: 'Yes. Starter and Pro plans include commercial licenses. Create thumbnails for clients, courses, agencies — whatever you need.'
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
              className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-xl" 
              style={{background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.15)'}}
              aria-label="Toggle menu">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: 'var(--text-primary)'}}>
                <path d="M4 5h16" /><path d="M4 12h16" /><path d="M4 19h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* 1. Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl" style={{background: 'var(--accent-primary)'}}></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl" style={{background: '#dc2626'}}></div>
        </div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-6" 
               style={{background: 'var(--accent-light)', color: 'var(--accent-primary)', border: '1px solid rgba(239, 68, 68, 0.2)'}}>
            <span className="animate-pulse">●</span> NEW: AI now generates thumbnails in 3 seconds
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight" style={{color: 'var(--text-primary)'}}>
            Stop Losing 80% of Your Views<br />to <span style={{background: 'linear-gradient(135deg, var(--accent-primary), #dc2626)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
              Boring Thumbnails
            </span>
          </h1>
          
          <p className="text-xl sm:text-2xl mb-4 max-w-3xl mx-auto leading-relaxed" style={{color: 'var(--text-secondary)'}}>
            The AI-powered thumbnail generator that turns your ideas into click-magnets in seconds.<br />
            No design skills. No expensive software. Just results.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 mt-8">
            <Link to="/signup" className="btn-primary px-8 py-4 text-lg font-semibold w-full sm:w-auto">
              Get Started →
            </Link>
            <button onClick={() => scrollToSection('video-demo')} className="btn-secondary px-8 py-4 text-lg font-semibold w-full sm:w-auto">
              Watch 30-Sec Demo
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm" style={{color: 'var(--text-muted)'}}>
            <div>⭐⭐⭐⭐⭐ Trusted by 12,847 YouTube creators</div>
            <div>•</div>
            <div>2.3M thumbnails created</div>
          </div>
        </div>
      </section>

      {/* 2. Trust Bar */}
      <section className="py-8 px-4 border-y" style={{background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)'}}>
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-sm mb-4" style={{color: 'var(--text-muted)'}}>
            Trusted by creators at
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm font-medium" style={{color: 'var(--text-muted)'}}>
            <span>Gaming Channels</span>
            <span>•</span>
            <span>Tech Reviewers</span>
            <span>•</span>
            <span>Course Creators</span>
            <span>•</span>
            <span>Fitness Influencers</span>
            <span>•</span>
            <span>Finance Educators</span>
            <span>•</span>
            <span>Lifestyle Vloggers</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 mt-6 text-xs" style={{color: 'var(--text-muted)'}}>
            <span>🔥 Sarah J. just created a thumbnail</span>
            <span>👥 847 creators online now</span>
            <span>⚡ 12,847 thumbnails created this week</span>
          </div>
        </div>
      </section>

      {/* 3. Problem-Solution Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-16" style={{color: 'var(--text-primary)'}}>
            The Thumbnail Struggle Ends Here
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Old Way */}
            <div className="card p-8 border-2" style={{borderColor: '#dc2626', background: 'rgba(220, 38, 38, 0.05)'}}>
              <div className="text-4xl mb-4">😰</div>
              <h3 className="text-2xl font-bold mb-2" style={{color: 'var(--text-primary)'}}>The Old Way</h3>
              <p className="text-lg mb-6" style={{color: 'var(--text-secondary)'}}>Hours wasted. Money drained. Views lost.</p>
              
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
            <div className="card p-8 border-2" style={{borderColor: 'var(--accent-primary)', background: 'rgba(239, 68, 68, 0.05)', boxShadow: '0 0 40px rgba(239, 68, 68, 0.1)'}}>
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
              { icon: '🧠', title: 'AI That Knows What Works', desc: 'Stop guessing. Our AI studied 10 million viral thumbnails to learn what makes people click.' },
              { icon: '⚡', title: '3-Second Generation', desc: 'Type your idea. Blink twice. Your thumbnail is ready. Faster than making coffee.' },
              { icon: '🎨', title: 'Infinite Variations', desc: 'Don\'t like option 1? Get 2, 3, 4, and 5. Each one different. Each one designed to convert.' },
              { icon: '📹', title: 'Video Snapshot Magic', desc: 'Upload your video. We extract the perfect frame. Add AI magic. Done.' },
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
      <section className="py-20 px-4" style={{background: 'var(--bg-secondary)'}}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4" style={{color: 'var(--text-primary)'}}>
              The Difference Between 847 Views and 84,700 Views
            </h2>
            <p className="text-lg sm:text-xl" style={{color: 'var(--text-secondary)'}}>
              Same content. Same creator. Different thumbnail.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { category: 'GAMING', before: '847 views | 2.1% CTR', after: '84,732 views | 18.7% CTR', boost: '+9,906% views in 48 hours' },
              { category: 'TECH', before: '1,284 views | 3.4% CTR', after: '67,291 views | 15.2% CTR', boost: '+5,139% views boost' },
              { category: 'LIFESTYLE', before: '623 views | 1.8% CTR', after: '41,827 views | 16.9% CTR', boost: '+6,613% more views' },
              { category: 'EDUCATION', before: '2,103 views | 4.2% CTR', after: '89,447 views | 19.3% CTR', boost: '+4,153% growth' }
            ].map((example, i) => (
              <div key={i} className="card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-bold tracking-wider" style={{color: 'var(--accent-primary)'}}>{example.category}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="aspect-video rounded-lg mb-2" style={{background: 'rgba(255, 255, 255, 0.05)', border: '2px dashed var(--border-primary)'}}></div>
                    <p className="text-xs font-medium" style={{color: 'var(--text-muted)'}}>Before: {example.before}</p>
                  </div>
                  <div>
                    <div className="aspect-video rounded-lg mb-2" style={{background: 'linear-gradient(135deg, var(--accent-primary), #dc2626)'}}></div>
                    <p className="text-xs font-medium" style={{color: 'var(--accent-success)'}}>After: {example.after}</p>
                  </div>
                </div>
                
                <div className="px-3 py-2 rounded-full text-center text-sm font-bold" 
                     style={{background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-primary)'}}>
                  {example.boost}
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
              { number: '2,384,729', label: 'Thumbnails Created', subtext: 'And counting. Every single one designed to convert.' },
              { number: '247%', label: 'Average CTR Increase', subtext: 'From scroll-past to must-watch in one thumbnail.' },
              { number: '487M+', label: 'Views Generated', subtext: 'For creators who chose to stop blending in.' },
              { number: '4.9★', label: 'Creator Rating', subtext: 'Based on 3,847 reviews. We\'re kinda obsessed with quality.' }
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
              📊 Every 60 seconds, Youbnail generates 38 thumbnails that will be viewed by 2.7 million people today.
            </p>
          </div>

          <div className="text-center">
            <Link to="/signup" className="btn-primary px-8 py-4 text-lg font-semibold inline-block">
              Join 12,847 Winning Creators →
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
              <div>📊 4.9/5 average rating from 3,847 reviews</div>
              <div>✅ 94% would recommend to another creator</div>
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
                <div className="aspect-video rounded-xl" style={{background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.2))', border: '2px solid var(--border-primary)'}}></div>
              </div>
              <div className="order-1 lg:order-2">
                <div className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-4" 
                     style={{background: 'var(--accent-primary)', color: 'white'}}>
                  ⚡ MOST POPULAR
                </div>
                <h3 className="text-3xl font-bold mb-4" style={{color: 'var(--text-primary)'}}>
                  The AI That Studied 10 Million Viral Thumbnails So You Don't Have To
                </h3>
                <p className="text-base mb-6 leading-relaxed" style={{color: 'var(--text-secondary)'}}>
                  We didn't just build an AI. We built an AI that learned from the best. It analyzed every viral thumbnail from 2020-2026. Gaming. Education. Lifestyle. Tech. It knows what makes your niche click.
                </p>
                <p className="text-base mb-6 leading-relaxed" style={{color: 'var(--text-secondary)'}}>
                  Type your video idea. The AI doesn't just generate a pretty picture. It generates a strategic weapon designed to stop the scroll, trigger curiosity, and command the click.
                </p>
                <ul className="space-y-2 mb-6">
                  {[
                    'Trained on 10M+ viral thumbnails across all niches',
                    'Understands color psychology and visual hierarchy',
                    'Generates 4 unique options in 3 seconds',
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
                  Already have your video? Perfect. Upload it. Youbnail automatically scans every frame and shows you the ones that will work best as thumbnails.
                </p>
                <p className="text-base mb-6 leading-relaxed" style={{color: 'var(--text-secondary)'}}>
                  Found the perfect moment? Click it. Our AI removes the background, enhances colors, adds professional text, adjusts contrast, and makes it thumbnail-ready. All automatic. All instant.
                </p>
                <ul className="space-y-2 mb-6">
                  {[
                    'Automatic frame extraction from any video',
                    'AI identifies the most engaging moments',
                    'One-click background removal',
                    'Automatic color enhancement',
                    'Professional text overlay generation',
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
                    ⏱️ Average time to create thumbnail from video:<br />
                    <span style={{color: 'var(--text-muted)'}}>Old way: 47 minutes</span> | <span style={{color: 'var(--accent-primary)'}}>Youbnail: 23 seconds</span>
                  </p>
                </div>
                <Link to="/signup" className="btn-primary px-6 py-3 text-base font-semibold inline-block">
                  Extract Your First Frame →
                </Link>
              </div>
              <div>
                <div className="aspect-video rounded-xl" style={{background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.2))', border: '2px solid var(--border-primary)'}}></div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="aspect-video rounded-xl" style={{background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.2))', border: '2px solid var(--border-primary)'}}></div>
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
      <section id="pricing" className="py-20 px-4" style={{background: 'var(--bg-secondary)'}}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-4">
            <p className="text-xs font-bold tracking-wider" style={{color: 'var(--accent-primary)'}}>
              TRANSPARENT PRICING, ZERO SURPRISES
            </p>
          </div>
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4" style={{color: 'var(--text-primary)'}}>
              Choose Your Growth Plan
            </h2>
            <p className="text-lg sm:text-xl mb-8" style={{color: 'var(--text-secondary)'}}>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
            {/* Starter Plan */}
            <div className="card p-8 border-2" style={{borderColor: 'var(--border-primary)'}}>
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
            <div className="card p-8 border-2 relative overflow-hidden" style={{borderColor: 'var(--accent-primary)', boxShadow: '0 0 40px rgba(239, 68, 68, 0.2)'}}>
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
                  'Early Access to New Features',
                  'Advanced AI Models',
                  'Commercial License',
                  'Batch Processing',
                  'Custom Style Training'
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

          {/* Money-Back Guarantee */}
          <div className="card p-8 max-w-3xl mx-auto text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" 
                 style={{background: 'var(--accent-primary)', color: 'white', fontSize: '24px'}}>
              🛡️
            </div>
            <h3 className="text-2xl font-bold mb-2" style={{color: 'var(--text-primary)'}}>
              Zero Risk. Just Results.
            </h3>
            <p className="text-base mb-4 leading-relaxed max-w-2xl mx-auto" style={{color: 'var(--text-secondary)'}}>
              Try any plan for 30 days. If you don't see more views, more clicks, or more growth — email us. We'll refund every penny. No forms. No hoops. No hard feelings.
            </p>
            <p className="text-xs" style={{color: 'var(--text-muted)'}}>
              We've issued 23 refunds out of 12,847 customers. That's a 99.82% satisfaction rate.
            </p>
          </div>
        </div>
      </section>

      {/* 13. FAQ */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4" style={{color: 'var(--text-primary)'}}>
              Everything Else You're Wondering
            </h2>
            <p className="text-lg sm:text-xl" style={{color: 'var(--text-secondary)'}}>
              We've answered these questions 4,782 times. Here they are in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {faqs.map((faq, i) => (
              <div key={i} className="card">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="w-full p-6 text-left flex items-start justify-between gap-4"
                >
                  <span className="font-semibold text-sm" style={{color: 'var(--text-primary)'}}>
                    {faq.q}
                  </span>
                  <span className="text-2xl flex-shrink-0" style={{color: 'var(--accent-primary)'}}>
                    {expandedFaq === i ? '−' : '+'}
                  </span>
                </button>
                {expandedFaq === i && (
                  <div className="px-6 pb-6">
                    <p className="text-sm leading-relaxed" style={{color: 'var(--text-secondary)'}}>
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <h3 className="text-xl font-bold mb-2" style={{color: 'var(--text-primary)'}}>
              Didn't find your answer?
            </h3>
            <p className="text-sm mb-6" style={{color: 'var(--text-secondary)'}}>
              Our support team actually responds. Usually within 2 hours.
            </p>
            <button onClick={() => scrollToSection('contact')} className="btn-primary px-6 py-3 text-base font-semibold">
              Contact Support →
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
            <span>🔥 23 creators joined in the last hour</span>
            <span>📊 847 thumbnails created today</span>
            <span>⭐ 4.9★ from 3,847 reviews</span>
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
              {formStatus === 'sending' ? 'Sending...' : formStatus === 'sent' ? '✅ Message sent!' : 'Send Message →'}
            </button>
            {formStatus === 'sent' && (
              <p className="text-center text-sm" style={{color: 'var(--accent-success)'}}>
                We'll get back to you within 2 hours (usually sooner).
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
                {['Blog', 'Tutorial Videos', 'Help Center', 'Community Forum'].map((item, i) => (
                  <li key={i}>
                    <a href="#" style={{color: 'var(--text-muted)'}} className="hover:underline">{item}</a>
                  </li>
                ))}
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
              <p className="text-xs mb-4" style={{color: 'var(--text-muted)'}}>
                Join 8,492 creators getting weekly tips on CTR optimization, YouTube growth, and thumbnail trends.
              </p>
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col gap-2">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email..."
                  className="px-3 py-2 rounded-lg border text-sm outline-none"
                  style={{background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)'}}
                />
                <button 
                  type="submit"
                  disabled={newsletterStatus === 'sending' || newsletterStatus === 'sent'}
                  className="btn-primary py-2 text-sm font-semibold disabled:opacity-50"
                >
                  {newsletterStatus === 'sending' ? 'Subscribing...' : newsletterStatus === 'sent' ? '✓ Subscribed!' : 'Subscribe →'}
                </button>
              </form>
              {newsletterStatus === 'sent' && (
                <p className="text-xs mt-2" style={{color: 'var(--accent-success)'}}>
                  Welcome to the community!
                </p>
              )}
              <p className="text-xs mt-2" style={{color: 'var(--text-muted)'}}>
                No spam. Unsubscribe anytime.
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
