import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  List as MenuIcon,
  X as CloseIcon,
  Star,
  Brain,
  Users,
  CreditCard,
  SignIn,
  ArrowRight,
  PlayCircle,
  CheckCircle,
  FileText,
  Sparkle,
  PencilSimpleLine,
  Scroll,
  Lightning,
  ListChecks,
  SquaresFour,
  GridFour,
  UploadSimple,
  Check,
  Building,
  Cloud,
  RocketLaunch,
  Smiley,
  Globe,
  Briefcase,
  ChatCircle,
  Handshake,
  ShareNetwork
} from '@phosphor-icons/react'

export function LandingPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  useEffect(() => {
    // Simple scroll reveal effect
    const observerOptions = { threshold: 0.1 }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100', 'translate-y-0')
          entry.target.classList.remove('opacity-0', 'translate-y-10')
        }
      })
    }, observerOptions)

    // Select all sections to observe, excluding the Hero section (#product)
    // to improve LCP and avoid cumulative layout shifts on initial load
    document.querySelectorAll('section:not(#product)').forEach((section) => {
      section.classList.add('transition-all', 'duration-700', 'opacity-0', 'translate-y-10')
      observer.observe(section)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased overflow-x-hidden min-h-screen flex flex-col">
      
      {/* Header (Shared Component with Responsive Layout) */}
      <header className="bg-surface/80 dark:bg-surface-container-lowest/80 backdrop-blur-md sticky top-0 z-50 border-b border-outline-variant/30">
        <nav className="flex justify-between items-center px-gutter py-4 max-w-container-max mx-auto">
          <div className="flex items-center gap-3 md:gap-12">
            {/* Mobile Hamburger Toggle (minimum 44x44px touch target) */}
            <button 
              className="text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-colors rounded-full active:scale-95 duration-150 md:hidden w-11 h-11 flex items-center justify-center shrink-0"
              onClick={() => setIsDrawerOpen(true)}
              aria-label="Open navigation menu"
            >
              <MenuIcon size={24} />
            </button>
            
            <Link className="text-2xl font-display-lg font-bold text-on-surface" to="/">
              ApplyFlow
            </Link>
            
            {/* Desktop Navbar Links */}
            <div className="hidden md:flex gap-8 items-center">
              <a className="text-primary font-bold border-b-2 border-primary font-label-md text-label-md" href="#product">Product</a>
              <a className="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md" href="#features">Features</a>
              <a className="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md" href="#demo">Demo</a>
              <a className="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md" href="#community">Community</a>
              <a className="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md" href="#pricing">Pricing</a>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Link className="hidden md:block text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md" to="/auth/login">
              Log in
            </Link>
            <Link className="bg-primary-container text-on-primary-container px-4 py-2 md:px-6 md:py-2.5 rounded-lg font-label-md text-label-md font-bold hover:scale-95 transition-all min-h-[40px] flex items-center" to="/auth/register">
              Start Free
            </Link>
          </div>
        </nav>
      </header>

      {/* Navigation Drawer (Overlay Menu for Mobile with smooth transition) */}
      <div 
        className={`fixed inset-0 bg-black/40 z-[55] transition-opacity duration-300 ${
          isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsDrawerOpen(false)}
      />
      <aside 
        className={`fixed inset-y-0 left-0 z-[60] flex flex-col h-full w-4/5 max-w-sm rounded-r-xl bg-surface shadow-xl transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <span className="font-headline-md text-headline-md font-bold text-primary">ApplyFlow</span>
            {/* Close button (minimum 44x44px touch target) */}
            <button 
              className="rounded-full hover:bg-surface-container-low hover:text-primary w-11 h-11 flex items-center justify-center shrink-0 transition-colors" 
              onClick={() => setIsDrawerOpen(false)}
              aria-label="Close navigation menu"
            >
              <CloseIcon size={24} />
            </button>
          </div>
          <nav className="flex flex-col gap-2">
            {/* Drawer items with 44px min-height targets */}
            <a 
              className="text-on-surface-variant hover:bg-surface-container-low rounded-full px-4 flex items-center gap-3 font-label-md transition-colors min-h-[44px]" 
              href="#features"
              onClick={() => setIsDrawerOpen(false)}
            >
              <Star size={20} /> Features
            </a>
            <a 
              className="text-on-surface-variant hover:bg-surface-container-low rounded-full px-4 flex items-center gap-3 font-label-md transition-colors min-h-[44px]" 
              href="#demo"
              onClick={() => setIsDrawerOpen(false)}
            >
              <Brain size={20} /> Demo
            </a>
            <a 
              className="text-on-surface-variant hover:bg-surface-container-low rounded-full px-4 flex items-center gap-3 font-label-md transition-colors min-h-[44px]" 
              href="#community"
              onClick={() => setIsDrawerOpen(false)}
            >
              <Users size={20} /> Community
            </a>
            <a 
              className="text-on-surface-variant hover:bg-surface-container-low rounded-full px-4 flex items-center gap-3 font-label-md transition-colors min-h-[44px]" 
              href="#pricing"
              onClick={() => setIsDrawerOpen(false)}
            >
              <CreditCard size={20} /> Pricing
            </a>
            <Link 
              className="text-on-surface-variant hover:bg-surface-container-low rounded-full px-4 flex items-center gap-3 font-label-md transition-colors min-h-[44px]" 
              to="/auth/login"
              onClick={() => setIsDrawerOpen(false)}
            >
              <SignIn size={20} /> Log in
            </Link>
          </nav>
        </div>
      </aside>

      <main className="flex-1">
        
        {/* Hero Section (Loads immediately without reveal scroll transitions to optimize LCP) */}
        <section id="product" className="hero-gradient pt-[4px] pb-12 md:pb-16 overflow-hidden">
          <div className="max-w-container-max mx-auto px-gutter grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 flex flex-col items-center text-center lg:items-start lg:text-left lg:m-auto">
              <span className="inline-block px-4 py-1.5 bg-primary-fixed text-on-primary-fixed-variant rounded-full text-label-sm font-label-sm font-semibold">
                AI-Powered Job Search OS
              </span>
              <h1 className="font-display-lg text-headline-lg-mobile md:text-5xl lg:text-display-lg leading-tight">
                Apply Smarter.<br /><span className="text-primary">Not Harder.</span>
              </h1>
              <p className="text-on-surface-variant text-body-md md:text-body-lg max-w-xl">
                AI that tailors your resume, writes personalized cover letters, autofills applications, tracks every job, and helps you land interviews faster.
              </p>
              
              {/* Call to Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4 w-full sm:w-auto">
                <Link 
                  to="/auth/register" 
                  className="bg-primary-container text-on-primary-container px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:translate-y-[-2px] transition-all shadow-lg text-center"
                >
                  Start Free <ArrowRight size={20} weight="bold" />
                </Link>
                <button className="bg-surface text-primary border border-outline-variant px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-surface-container-low transition-all">
                  <PlayCircle size={20} weight="fill" /> Watch Demo
                </button>
              </div>
              
              {/* Trust Checkmarks */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-6 text-on-surface-variant text-label-sm pt-2">
                <div className="flex items-center gap-2">
                  <CheckCircle size={18} weight="fill" className="text-primary shrink-0" />
                  No credit card
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={18} weight="fill" className="text-primary shrink-0" />
                  Free forever plan
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={18} weight="fill" className="text-primary shrink-0" />
                  ATS Optimized
                </div>
              </div>
            </div>

            {/* Static Hero Illustration Area (no badges and no animation as requested) */}
            <div className="relative w-full max-w-[450px] lg:max-w-none mx-auto aspect-square mt-8 lg:mt-0 flex items-center justify-center lg:m-auto">
              <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl"></div>
              
              <div className="relative z-10 w-full h-full flex items-center justify-center">
                <img 
                  className="w-full h-full object-contain drop-shadow-2xl" 
                  alt="ApplyFlow AI Career Dashboard illustration" 
                  src="/images/hero.png"
                  fetchPriority="high"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof (Marquee on mobile, static on desktop) */}
        <section className="py-6 md:py-8 border-y border-outline-variant/30 overflow-hidden">
          <div className="max-w-container-max mx-auto px-gutter text-center">
            <p className="text-on-surface-variant font-label-sm text-label-sm mb-8 uppercase tracking-wider">
              Trusted by job seekers at top companies
            </p>
            
            {/* Mobile Marquee */}
            <div className="marquee block md:hidden">
              <div className="marquee-content flex items-center gap-12 grayscale opacity-40">
                <span className="font-headline-md font-bold text-on-surface">GOOGLE</span>
                <span className="font-headline-md font-bold text-on-surface">MICROSOFT</span>
                <span className="font-headline-md font-bold text-on-surface">AMAZON</span>
                <span className="font-headline-md font-bold text-on-surface">AIRBNB</span>
                <span className="font-headline-md font-bold text-on-surface">SLACK</span>
                <span className="font-headline-md font-bold text-on-surface">META</span>
              </div>
              <div className="marquee-content flex items-center gap-12 grayscale opacity-40">
                <span className="font-headline-md font-bold text-on-surface">GOOGLE</span>
                <span className="font-headline-md font-bold text-on-surface">MICROSOFT</span>
                <span className="font-headline-md font-bold text-on-surface">AMAZON</span>
                <span className="font-headline-md font-bold text-on-surface">AIRBNB</span>
                <span className="font-headline-md font-bold text-on-surface">SLACK</span>
                <span className="font-headline-md font-bold text-on-surface">META</span>
              </div>
            </div>

            {/* Desktop Cloud */}
            <div className="hidden md:flex flex-wrap justify-center items-center gap-10 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all">
              <span className="text-2xl font-bold">Google</span>
              <span className="text-2xl font-bold">Microsoft</span>
              <span className="text-2xl font-bold">amazon</span>
              <span className="text-2xl font-bold">airbnb</span>
              <span className="text-2xl font-bold">Meta</span>
              <span className="text-2xl font-bold">stripe</span>
              <span className="text-2xl font-bold">Spotify</span>
              <span className="text-2xl font-bold">NETFLIX</span>
            </div>
          </div>
        </section>

        {/* Problem Section */}
        <section className="pt-12 md:pt-16 pb-10 md:pb-12 bg-surface">
          <div className="max-w-container-max mx-auto px-gutter">
            <h2 className="font-headline-lg text-headline-lg text-center mb-16">Job hunting is broken.</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
              
              {/* Pain Point 1 */}
              <div className="bg-surface-container-low p-6 md:p-8 rounded-2xl hover:bg-white transition-all group border border-transparent hover:border-outline-variant hover:shadow-xl">
                <div className="w-full h-32 mb-6 bg-surface-container rounded-xl overflow-hidden">
                  <img 
                    className="w-full h-full object-cover" 
                    alt="Apply manually illustration" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCU7xxAzR7-4mpnyWFwdauieFmJKbLGMgUiqlSh4xaA9RnWPu9D2drIBB5bVN4Xv0vzeMfAG0bpeqC-cFZG6XLOwwf20QCgtHa1NgdXKUC7UFnRralyr_8LZuSwoJ7f9r_IJpNfYsDqxeKCiBd5EFYdlPWWJcxYi49ojU1WDPoFQ0_olB09x7N1MFxnVsrL5C69cPy0GXFgz9MIBWJFRSsUT8N3ZIlGlusy-oFkBwO1NtW96QtMGuwqO3YV2QQfWAPG18Pvy7sD2Gg5" 
                    loading="lazy"
                  />
                </div>
                <h3 className="font-bold text-lg mb-2">Apply manually</h3>
                <p className="text-on-surface-variant text-sm">Repeating the same information everywhere.</p>
              </div>

              {/* Pain Point 2 */}
              <div className="bg-surface-container-low p-6 md:p-8 rounded-2xl hover:bg-white transition-all group border border-transparent hover:border-outline-variant hover:shadow-xl">
                <div className="w-full h-32 mb-6 bg-surface-container rounded-xl overflow-hidden">
                  <img 
                    className="w-full h-full object-cover" 
                    alt="Tailor resumes repeatedly illustration" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB625W6c1FTuPpRLq7lBLEtmHJijwWXkOYmlWIqtKHHeZGVS-X8GfR7tf0w-py37rDjJvSe5dYZNcqrxR4j85i-oicfIUbjE7cT3nQldzOaGJb-hy-vmgTVPhkPnPWKMMQLcKmes60bH523sPEwkWwnu-Svw5k_1-AOAQcyCQmK-kY2YEx4Gh1UiJ6uTf_h-85gJuCk9Bav97FVQoq6JIYUwTaCLdSqC-kDVQYfA5Wc49ZjCWcLWjYVpx-GmFeYEheqqCWOwd5SypYE" 
                    loading="lazy"
                  />
                </div>
                <h3 className="font-bold text-lg mb-2">Tailor resumes</h3>
                <p className="text-on-surface-variant text-sm">Hours spent tweaking for every single job application.</p>
              </div>

              {/* Pain Point 3 */}
              <div className="bg-surface-container-low p-6 md:p-8 rounded-2xl hover:bg-white transition-all group border border-transparent hover:border-outline-variant hover:shadow-xl">
                <div className="w-full h-32 mb-6 bg-surface-container rounded-xl overflow-hidden">
                  <img 
                    className="w-full h-full object-cover" 
                    alt="Lost application tracker illustration" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhJtQaV0NrGZm2plc9ef4lzCWW3JidnIEsgPHm1fQOBIdE1elfsPv3yLrayYhd895ugRkVwvSL1UUoKPcXu-inY6eZKGi0lU-8maAa8Ns7oBPYMnEQhPoTzoyXb211LdCxVaEyJ5OgobVvYR_n4H_BLP1Sug7vkNXrcMEAy3NcjJ5Amn3djk7onK5rSKVOQB4keY6W42knwPuCvUqgDwOu9wsVmLItVIun8kZHTqjQHm1-zajnxw5vwOy2ZMuxM4q9rPqNzrW-xXpj" 
                    loading="lazy"
                  />
                </div>
                <h3 className="font-bold text-lg mb-2">Forget targets</h3>
                <p className="text-on-surface-variant text-sm">No unified dashboard to track application status.</p>
              </div>

              {/* Pain Point 4 */}
              <div className="bg-surface-container-low p-6 md:p-8 rounded-2xl hover:bg-white transition-all group border border-transparent hover:border-outline-variant hover:shadow-xl">
                <div className="w-full h-32 mb-6 bg-surface-container rounded-xl overflow-hidden">
                  <img 
                    className="w-full h-full object-cover" 
                    alt="Missed follow ups illustration" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuANvO9VgDemirfi3vfzckR3I6S_aiCxwmY-Yfq1IWRoB3HVV_S15iW_ySojRYpFjramkHL2Lhs5M3XE1jAGHg5Nh5oET-lR--zjBaZ_bQ6AnuiHLN3axPaZEkdeho3ircs1f86gTxZ0w8Z5_kq4hmzZA76NjhUc8i_nzqx4sFhtL-L2ha5H2NJUXSq-IVw_1SMnSoFWIpjfapuTdAMOQI-XWSQzTlUaZLYfLhcT2opjP8e6DHTYFnfhYF_d-OAgavYvfG_l9lVwjDrD" 
                    loading="lazy"
                  />
                </div>
                <h3 className="font-bold text-lg mb-2">Miss follow-ups</h3>
                <p className="text-on-surface-variant text-sm">Opportunities slip away without reminder setups.</p>
              </div>

              {/* Pain Point 5 */}
              <div className="bg-surface-container-low p-6 md:p-8 rounded-2xl hover:bg-white transition-all group border border-transparent hover:border-outline-variant hover:shadow-xl">
                <div className="w-full h-32 mb-6 bg-surface-container rounded-xl overflow-hidden">
                  <img 
                    className="w-full h-full object-cover" 
                    alt="Form filling illustration" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDXypl95_yWn6FeVbJAH9wMD14nHpWEIfBvpVr24nNVFKgKd_m1_PMqzbMG3WrDRSGzqjE-dwLmID0y8e9UFmuCHP0lWPHvvpGR5eqLyOoZlxO_guxD2jbfbTWb8FDwGwD7hVj2Hi__XUxMnCtmlItI27XOqiNERskj4f3cr52Fjnd9iHKW2uzCdzpLZylnqFtlJ693VBM3Qy4VlK6U2UmtDCkzcO2qTUXCPe29UGfEB02e0fu1kGywJBUhrxOb2RY3lsnTw6v8j_3_" 
                    loading="lazy"
                  />
                </div>
                <h3 className="font-bold text-lg mb-2">Spend hours</h3>
                <p className="text-on-surface-variant text-sm">Tedious forms slow down your daily output.</p>
              </div>

            </div>
          </div>
        </section>

        {/* Feature Journey / Workflow */}
        <section className="pt-10 md:pt-12 pb-10 md:pb-12 bg-surface-container-lowest">
          <div className="max-w-container-max mx-auto px-gutter text-center">
            <h2 className="font-headline-md text-headline-md mb-2">Meet ApplyFlow</h2>
            <p className="text-on-surface-variant mb-12">Your complete job search workflow – powered by AI.</p>
            
            {/* Mobile Layout (Grid, no arrows) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 md:hidden py-8 px-6 border border-outline-variant/30 rounded-[32px] glass-card">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-outline-variant/20">
                  <FileText size={32} className="text-primary-container" />
                </div>
                <span className="text-sm font-bold">Resume</span>
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-primary-container text-white shadow-lg flex items-center justify-center">
                  <Sparkle size={32} className="text-white" />
                </div>
                <span className="text-sm font-bold">AI Review</span>
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-outline-variant/20">
                  <PencilSimpleLine size={32} className="text-primary-container" />
                </div>
                <span className="text-sm font-bold">Optimizer</span>
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-outline-variant/20">
                  <Scroll size={32} className="text-primary-container" />
                </div>
                <span className="text-sm font-bold">Cover Letter</span>
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-outline-variant/20">
                  <Lightning size={32} className="text-primary-container" />
                </div>
                <span className="text-sm font-bold">Autofill</span>
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-outline-variant/20">
                  <ListChecks size={32} className="text-primary-container" />
                </div>
                <span className="text-sm font-bold">Tracker</span>
              </div>
            </div>

            {/* Desktop Layout (Horizontal row with arrows) */}
            <div className="hidden md:flex flex-wrap justify-between items-center gap-4 py-8 px-12 border border-outline-variant/30 rounded-[32px] glass-card">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-outline-variant/20">
                  <FileText size={32} className="text-primary-container" />
                </div>
                <span className="text-sm font-bold">Resume</span>
              </div>
              <ArrowRight size={24} className="text-outline-variant shrink-0" />
              
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-primary-container text-white shadow-lg flex items-center justify-center">
                  <Sparkle size={32} className="text-white" />
                </div>
                <span className="text-sm font-bold">AI Review</span>
              </div>
              <ArrowRight size={24} className="text-outline-variant shrink-0" />
              
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-outline-variant/20">
                  <PencilSimpleLine size={32} className="text-primary-container" />
                </div>
                <span className="text-sm font-bold">Optimizer</span>
              </div>
              <ArrowRight size={24} className="text-outline-variant shrink-0" />
              
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-outline-variant/20">
                  <Scroll size={32} className="text-primary-container" />
                </div>
                <span className="text-sm font-bold">Cover Letter</span>
              </div>
              <ArrowRight size={24} className="text-outline-variant shrink-0" />

              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-outline-variant/20">
                  <Lightning size={32} className="text-primary-container" />
                </div>
                <span className="text-sm font-bold">Autofill</span>
              </div>
              <ArrowRight size={24} className="text-outline-variant shrink-0" />

              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-outline-variant/20">
                  <ListChecks size={32} className="text-primary-container" />
                </div>
                <span className="text-sm font-bold">Tracker</span>
              </div>
            </div>
          </div>
        </section>

        {/* Complex Grid Features */}
        <section id="features" className="pt-12 md:pt-16 pb-12 md:pb-16">
          <div className="max-w-container-max mx-auto px-gutter">
            <h2 className="font-headline-lg text-headline-lg text-center mb-16">
              Everything you need to land more interviews
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Card 1: AI Resume Review */}
              <div className="col-span-1 glass-card p-6 rounded-2xl">
                <h3 className="font-bold mb-2">AI Resume Review</h3>
                <p className="text-sm text-on-surface-variant mb-6">Get instant feedback and improvement tips.</p>
                <div className="flex justify-center">
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90">
                      <circle className="text-surface-container-high" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeWidth="8"></circle>
                      <circle className="text-green-500" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeDasharray="364.42" strokeDashoffset="80" strokeWidth="8"></circle>
                    </svg>
                    <span className="absolute text-2xl font-bold">78</span>
                  </div>
                </div>
              </div>

              {/* Card 2: ATS Score */}
              <div className="col-span-1 glass-card p-6 rounded-2xl">
                <h3 className="font-bold mb-2">ATS Score</h3>
                <p className="text-sm text-on-surface-variant mb-6">See how well your resume passes ATS.</p>
                <div className="flex justify-center">
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90">
                      <circle className="text-surface-container-high" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeWidth="8"></circle>
                      <circle className="text-primary" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeDasharray="364.42" strokeDashoffset="40" strokeWidth="8"></circle>
                    </svg>
                    <span className="absolute text-2xl font-bold">92</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Resume Optimizer (Wide) */}
              <div className="col-span-1 md:col-span-2 glass-card p-6 rounded-2xl flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <h3 className="font-bold mb-2">Resume Optimizer</h3>
                  <p className="text-sm text-on-surface-variant">
                    AI optimizes your resume for each job automatically based on description.
                  </p>
                </div>
                <div className="flex-1 bg-surface-container rounded-xl p-4 space-y-3 min-h-[100px]">
                  <div className="h-2 w-3/4 bg-white rounded"></div>
                  <div className="h-2 w-full bg-white rounded"></div>
                  <div className="h-2 w-1/2 bg-white rounded"></div>
                  <div className="flex items-center gap-2 pt-2">
                    <div className="px-2 py-1 bg-green-100 text-green-700 text-[10px] rounded font-bold">MATCH</div>
                    <div className="px-2 py-1 bg-primary-fixed text-primary text-[10px] rounded font-bold">AI ENHANCED</div>
                  </div>
                </div>
              </div>

              {/* Card 4: Chrome Autofill */}
              <div className="col-span-1 glass-card p-6 rounded-2xl">
                <h3 className="font-bold mb-2">Chrome Autofill</h3>
                <p className="text-sm text-on-surface-variant mb-4">Auto-detect and fill job applications.</p>
                <div className="flex gap-2 justify-center py-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500 shadow-sm"></div>
                  <div className="w-8 h-8 rounded-full bg-green-500 shadow-sm"></div>
                  <div className="w-8 h-8 rounded-full bg-yellow-500 shadow-sm"></div>
                </div>
              </div>

              {/* Card 5: Application Tracker */}
              <div className="col-span-1 glass-card p-6 rounded-2xl">
                <h3 className="font-bold mb-2">Application Tracker</h3>
                <p className="text-sm text-on-surface-variant mb-4">Track every application in one place.</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] p-2 bg-surface rounded shadow-sm border border-outline-variant/30">
                    <span className="font-bold">Stripe</span>
                    <span className="text-blue-500 font-bold">Applied</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] p-2 bg-surface rounded shadow-sm border border-outline-variant/30">
                    <span className="font-bold">Google</span>
                    <span className="text-orange-500 font-bold">Interviewing</span>
                  </div>
                </div>
              </div>

              {/* Card 6: Analytics (Wide) */}
              <div className="col-span-1 md:col-span-2 glass-card p-6 rounded-2xl overflow-hidden">
                <h3 className="font-bold mb-2">Analytics</h3>
                <p className="text-sm text-on-surface-variant mb-4">Visualize your job search progress over time.</p>
                <div className="h-24 w-full flex items-end gap-1.5 pt-2">
                  <div className="bg-primary-container w-full rounded-t" style={{ height: "40%" }}></div>
                  <div className="bg-primary-container w-full rounded-t" style={{ height: "60%" }}></div>
                  <div className="bg-primary-container w-full rounded-t" style={{ height: "35%" }}></div>
                  <div className="bg-primary-container w-full rounded-t" style={{ height: "80%" }}></div>
                  <div className="bg-primary-container w-full rounded-t" style={{ height: "55%" }}></div>
                  <div className="bg-primary-container w-full rounded-t" style={{ height: "90%" }}></div>
                  <div className="bg-primary-container w-full rounded-t" style={{ height: "70%" }}></div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Interactive Preview / Mockup Section */}
        <section id="demo" className="pt-12 md:pt-16 pb-12 md:pb-16 bg-surface-container">
          <div className="max-w-container-max mx-auto px-gutter">
            <h2 className="font-headline-md text-headline-md text-center mb-4">See ApplyFlow in action</h2>
            <p className="text-body-md text-on-surface-variant text-center mb-16">The command center for your career growth.</p>
            
            {/* Desktop Dashboard Preview (Visible on large screens) */}
            <div className="hidden lg:flex bg-white rounded-[32px] shadow-2xl overflow-hidden border border-outline-variant/30 min-h-[600px]">
              {/* Sidebar */}
              <aside className="w-64 bg-on-surface text-white p-8 flex flex-col gap-6 shrink-0">
                <div className="text-xl font-bold mb-4">ApplyFlow</div>
                <nav className="space-y-4">
                  <div className="flex items-center gap-3 text-primary-fixed-dim font-bold"><SquaresFour size={20} /> Dashboard</div>
                  <div className="flex items-center gap-3 text-outline-variant"><GridFour size={20} /> Applications</div>
                  <div className="flex items-center gap-3 text-outline-variant"><FileText size={20} /> Resumes</div>
                  <div className="flex items-center gap-3 text-outline-variant"><Scroll size={20} /> Cover Letters</div>
                </nav>
              </aside>
              {/* Dashboard Content */}
              <div className="flex-1 p-12 bg-white flex flex-col justify-center">
                <div className="flex justify-center mb-12">
                  <div className="flex items-center gap-4 text-xs font-bold text-on-surface-variant">
                    <span className="flex items-center gap-2 text-primary">
                      <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center font-bold">1</span> 
                      Upload
                    </span>
                    <div className="w-12 h-[1px] bg-outline-variant"></div>
                    <span className="flex items-center gap-2 opacity-50">
                      <span className="w-6 h-6 rounded-full border border-outline-variant flex items-center justify-center">2</span> 
                      Analyze
                    </span>
                    <div className="w-12 h-[1px] bg-outline-variant"></div>
                    <span className="flex items-center gap-2 opacity-50">
                      <span className="w-6 h-6 rounded-full border border-outline-variant flex items-center justify-center">3</span> 
                      Optimize
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div className="p-8 border-2 border-dashed border-primary/30 rounded-2xl flex flex-col items-center justify-center bg-primary-fixed/20">
                    <UploadSimple size={40} className="text-primary mb-4" />
                    <p className="font-bold text-primary mb-2">Upload Resume</p>
                    <p className="text-xs text-on-surface-variant">Drag and drop or click to browse</p>
                  </div>
                  <div className="space-y-6">
                    <div className="p-6 bg-surface-container rounded-2xl border border-outline-variant/30">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-sm font-bold">ATS Score</span>
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] rounded-full font-bold">GOOD</span>
                      </div>
                      <div className="w-full bg-white h-2 rounded-full overflow-hidden">
                        <div className="bg-green-500 h-full w-[68%]"></div>
                      </div>
                      <p className="text-[10px] mt-2 text-on-surface-variant italic">"Try adding more keywords from the job description to improve matching."</p>
                    </div>
                    <div className="p-6 bg-surface-container rounded-2xl border border-outline-variant/30">
                      <p className="text-sm font-bold mb-4">AI Recommendations</p>
                      <ul className="space-y-2">
                        <li className="text-xs flex items-center gap-2"><Check size={16} weight="bold" className="text-green-500 shrink-0" /> Highlight leadership skills</li>
                        <li className="text-xs flex items-center gap-2"><Check size={16} weight="bold" className="text-green-500 shrink-0" /> Quantify achievements in roles</li>
                        <li className="text-xs flex items-center gap-2 text-on-surface-variant"><span className="w-4"></span> + 3 more</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile App Dashboard Preview (Visible on mobile/tablet) */}
            <div className="block lg:hidden max-w-[360px] mx-auto bg-white rounded-3xl overflow-hidden border-2 border-primary/20 shadow-2xl">
              <div className="bg-surface-container px-4 py-3 flex items-center justify-between">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                </div>
                <div className="bg-surface px-4 py-1 rounded-full text-[10px] text-on-surface-variant border border-outline-variant">
                  app.applyflow.ai
                </div>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-[14px]">Active Applications</p>
                  <span className="text-primary text-[12px] font-bold">View All</span>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-white rounded-xl border border-outline-variant flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                        <Building size={20} />
                      </div>
                      <div className="text-left">
                        <p className="text-[12px] font-bold">Meta</p>
                        <p className="text-[10px] text-on-surface-variant">Product Manager</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[8px] font-bold">Applied</span>
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-outline-variant flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                        <Cloud size={20} />
                      </div>
                      <div className="text-left">
                        <p className="text-[12px] font-bold">Adobe</p>
                        <p className="text-[10px] text-on-surface-variant">UX Engineer</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[8px] font-bold">Interview</span>
                    </div>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-primary/5 rounded-2xl border border-primary/10 flex flex-col items-center gap-2">
                  <div className="relative w-20 h-20 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle className="text-surface-variant" cx="40" cy="40" fill="transparent" r="34" stroke="currentColor" strokeWidth="8"></circle>
                      <circle className="text-primary" cx="40" cy="40" fill="transparent" r="34" stroke="currentColor" strokeDasharray="213.6" stroke-dashoffset="32" strokeWidth="8"></circle>
                    </svg>
                    <span className="absolute font-bold text-[16px]">85%</span>
                  </div>
                  <p className="text-[12px] font-bold text-on-surface">Average Match Score</p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Stats Section */}
        <section className="pt-10 md:pt-12 pb-10 md:pb-12 bg-surface">
          <div className="max-w-container-max mx-auto px-gutter grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center p-6 md:p-8 bg-surface-container-low rounded-2xl shadow-sm flex flex-col items-center">
              <RocketLaunch size={32} className="text-primary mb-4" />
              <h4 className="text-2xl md:text-4xl font-extrabold mb-1">500k+</h4>
              <p className="text-xs md:text-sm text-on-surface-variant font-medium">Applications Optimized</p>
            </div>
            <div className="text-center p-6 md:p-8 bg-surface-container-low rounded-2xl shadow-sm flex flex-col items-center">
              <FileText size={32} className="text-primary mb-4" />
              <h4 className="text-2xl md:text-4xl font-extrabold mb-1">2M+</h4>
              <p className="text-xs md:text-sm text-on-surface-variant font-medium">Resumes Reviewed</p>
            </div>
            <div className="text-center p-6 md:p-8 bg-surface-container-low rounded-2xl shadow-sm flex flex-col items-center">
              <Smiley size={32} className="text-primary mb-4" />
              <h4 className="text-2xl md:text-4xl font-extrabold mb-1">93%</h4>
              <p className="text-xs md:text-sm text-on-surface-variant font-medium">Interview Improvement</p>
            </div>
            <div className="text-center p-6 md:p-8 bg-surface-container-low rounded-2xl shadow-sm flex flex-col items-center">
              <Globe size={32} className="text-primary mb-4" />
              <h4 className="text-2xl md:text-4xl font-extrabold mb-1">35+</h4>
              <p className="text-xs md:text-sm text-on-surface-variant font-medium">Countries Worldwide</p>
            </div>
          </div>
        </section>

        {/* Chrome Extension Preview */}
        <section className="pt-12 md:pt-16 pb-12 md:pb-16 bg-white">
          <div className="max-w-container-max mx-auto px-gutter flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="flex-1 space-y-6 text-center lg:text-left flex flex-col items-center lg:items-start">
              <h2 className="font-headline-lg text-3xl md:text-headline-lg leading-tight">
                Smart Autofill with Chrome Extension
              </h2>
              <p className="text-body-md md:text-body-lg text-on-surface-variant max-w-xl">
                Never fill a form again. Our extension detects job boards and fills every field with your optimized data in one click.
              </p>
              <button className="bg-primary-container text-on-primary-container px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:scale-95 transition-all shadow-md">
                Add to Chrome — It's Free
              </button>
            </div>
            <div className="flex-1 w-full max-w-[500px] lg:max-w-none mx-auto">
              <div className="glass-card p-6 md:p-8 rounded-3xl relative">
                <img 
                  className="w-full h-auto rounded-xl shadow-lg" 
                  alt="Sleek Chrome extension sidebar autofilling a LinkedIn application form" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBvzT7VIt0HijXqFEcRkVyUsvUzjrM5VJMEm5Lb-wOzQodqOKvqlxFM4Yu7TAaV4iw2ulOyAvWeOTdLnXiMupDC6chvPf13nEhQ6nMl1kbiJrXPNajTu8UTYw8zIbcnNn3g63sv40pyxR4NLaRBkSKYd1G19MK72u0bfMOUBxuYdHUdCsgjOw9YrqN3g2RrQw_DCTK3S4oNvQ6ySHyWA_q6zep2Vg0z3c-Pq7Q8NOXtnqjZ73ynRq3hDt7-2YiZoizQfMOEYSnVAKLc" 
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Community Section (Preserved from existing code) */}
        <section id="community" className="pt-12 md:pt-16 pb-12 md:pb-16 bg-surface">
          <div className="max-w-container-max mx-auto px-gutter">
            <h2 className="font-headline-lg text-headline-lg text-center mb-4">You're not in this alone</h2>
            <p className="text-body-lg text-on-surface-variant text-center max-w-2xl mx-auto mb-16">
              Join a thriving network of job seekers. Discover hidden opportunities, exchange insights, and request referrals directly from peers at top companies.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="glass-card p-8 rounded-3xl flex flex-col items-center text-center group hover:-translate-y-1 transition-transform">
                <div className="w-16 h-16 rounded-2xl bg-primary-fixed text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Briefcase size={32} />
                </div>
                <h3 className="text-xl font-bold mb-3">Peer Opportunities</h3>
                <p className="text-on-surface-variant text-sm">Find and share hidden job postings before they hit the main job boards.</p>
              </div>

              {/* Feature 2 */}
              <div className="glass-card p-8 rounded-3xl flex flex-col items-center text-center group hover:-translate-y-1 transition-transform">
                <div className="w-16 h-16 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <ChatCircle size={32} />
                </div>
                <h3 className="text-xl font-bold mb-3">Discussions & Insights</h3>
                <p className="text-on-surface-variant text-sm">Connect with peers, discuss industry trends, and get advice on interviews.</p>
              </div>

              {/* Feature 3 */}
              <div className="glass-card p-8 rounded-3xl flex flex-col items-center text-center group hover:-translate-y-1 transition-transform">
                <div className="w-16 h-16 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Handshake size={32} />
                </div>
                <h3 className="text-xl font-bold mb-3">Referral Network</h3>
                <p className="text-on-surface-variant text-sm">Request referrals or offer them to other strong candidates in your field.</p>
              </div>
            </div>

            <div className="mt-12 text-center">
              <Link to="/community" className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-container transition-colors shadow-md">
                Explore the Community <ArrowRight size={16} weight="bold" />
              </Link>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section id="pricing" className="pt-12 md:pt-16 pb-12 md:pb-16">
          <div className="max-w-container-max mx-auto px-gutter">
            <div className="cta-gradient rounded-[32px] md:rounded-[48px] p-8 md:p-24 text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10"></div>
              <div className="relative z-10 max-w-3xl mx-auto space-y-8 flex flex-col items-center">
                <h2 className="text-white font-display-lg text-3xl md:text-5xl lg:text-display-lg leading-tight">
                  Your next interview starts with a better application.
                </h2>
                <p className="text-white/90 text-body-md md:text-body-lg max-w-lg">
                  Join thousands of job seekers landing roles at top tech companies.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto">
                  <Link 
                    to="/auth/register" 
                    className="bg-white text-primary px-10 py-5 rounded-2xl font-bold text-lg hover:scale-105 transition-all text-center w-full sm:w-auto"
                  >
                    Start Free Now
                  </Link>
                  <a 
                    href="#pricing" 
                    className="bg-primary-fixed-dim/20 text-white border border-white/30 px-10 py-5 rounded-2xl font-bold text-lg hover:bg-white/10 transition-all text-center w-full sm:w-auto"
                  >
                    View Pricing
                  </a>
                </div>
                <div className="flex flex-wrap justify-center gap-6 text-white/80 text-sm pt-2">
                  <div className="flex items-center gap-2"><Check size={16} weight="bold" className="text-white shrink-0" /> No credit card</div>
                  <div className="flex items-center gap-2"><Check size={16} weight="bold" className="text-white shrink-0" /> Free forever</div>
                  <div className="flex items-center gap-2"><Check size={16} weight="bold" className="text-white shrink-0" /> Cancel anytime</div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer (Shared Component with Responsive Grid and 44x44px touch targets) */}
      <footer className="bg-surface dark:bg-on-surface border-t border-outline-variant pt-12 md:pt-16 pb-8 mt-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 px-gutter max-w-container-max mx-auto">
          <div className="col-span-2 md:col-span-1 space-y-6 text-left">
            <div className="text-xl font-display-lg font-extrabold text-on-surface dark:text-surface">
              ApplyFlow
            </div>
            <p className="text-on-surface-variant text-label-sm font-label-sm leading-relaxed">
              The AI-powered job search OS that helps you apply smarter and land more interviews.
            </p>
            {/* Social icons with standard touch target sizing */}
            <div className="flex gap-2 -ml-2">
              <a 
                href="#" 
                className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-surface-container-low hover:text-primary transition-colors text-on-surface-variant shrink-0" 
                aria-label="Official Website"
              >
                <Globe size={20} />
              </a>
              <a 
                href="#" 
                className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-surface-container-low hover:text-primary transition-colors text-on-surface-variant shrink-0" 
                aria-label="Select Language"
              >
                <Globe size={20} />
              </a>
              <a 
                href="#" 
                className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-surface-container-low hover:text-primary transition-colors text-on-surface-variant shrink-0" 
                aria-label="Share ApplyFlow"
              >
                <ShareNetwork size={20} />
              </a>
            </div>
          </div>
          
          <div className="col-span-1 space-y-4 text-left">
            <h5 className="font-bold text-sm text-on-surface">Product</h5>
            <ul className="space-y-2 text-on-surface-variant text-label-sm font-label-sm">
              <li className="hover:translate-x-1 transition-transform cursor-pointer hover:text-primary">Features</li>
              <li className="hover:translate-x-1 transition-transform cursor-pointer hover:text-primary">Security</li>
              <li className="hover:translate-x-1 transition-transform cursor-pointer hover:text-primary">Roadmap</li>
              <li className="hover:translate-x-1 transition-transform cursor-pointer hover:text-primary">Changelog</li>
            </ul>
          </div>
          
          <div className="col-span-1 space-y-4 text-left">
            <h5 className="font-bold text-sm text-on-surface">Resources</h5>
            <ul className="space-y-2 text-on-surface-variant text-label-sm font-label-sm">
              <li className="hover:translate-x-1 transition-transform cursor-pointer hover:text-primary">Blog</li>
              <li className="hover:translate-x-1 transition-transform cursor-pointer hover:text-primary">Templates</li>
              <li className="hover:translate-x-1 transition-transform cursor-pointer hover:text-primary">Guides</li>
              <li className="hover:translate-x-1 transition-transform cursor-pointer hover:text-primary">Help Center</li>
            </ul>
          </div>
          
          <div className="col-span-1 space-y-4 text-left">
            <h5 className="font-bold text-sm text-on-surface">Legal</h5>
            <ul className="space-y-2 text-on-surface-variant text-label-sm font-label-sm">
              <li className="hover:translate-x-1 transition-transform cursor-pointer hover:text-primary">Privacy Policy</li>
              <li className="hover:translate-x-1 transition-transform cursor-pointer hover:text-primary">Terms of Service</li>
              <li className="hover:translate-x-1 transition-transform cursor-pointer hover:text-primary">Cookie Policy</li>
            </ul>
          </div>
          
          <div className="col-span-2 md:col-span-1 space-y-4 text-left">
            <h5 className="font-bold text-sm text-on-surface">Stay updated</h5>
            <div className="flex flex-col gap-2">
              <input 
                className="bg-surface-container border border-outline-variant px-4 py-2 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none" 
                placeholder="Enter your email" 
                type="email" 
              />
              <button className="bg-on-surface text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary transition-all min-h-[40px]">
                Subscribe
              </button>
            </div>
          </div>
        </div>
        
        <div className="max-w-container-max mx-auto px-gutter mt-16 pt-8 border-t border-outline-variant/30 text-center text-on-surface-variant text-label-sm">
          © 2024 ApplyFlow. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
