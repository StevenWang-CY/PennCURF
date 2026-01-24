'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeSection, setActiveSection] = useState(0);

  // Scroll spy to update active dot
  useEffect(() => {
    const handleScroll = (e: Event) => {
      const container = e.target as HTMLElement;
      const scrollPosition = container.scrollTop;
      const height = container.clientHeight;
      const index = Math.round(scrollPosition / height);
      setActiveSection(index);
    };

    const container = document.getElementById('snap-container');
    container?.addEventListener('scroll', handleScroll);
    return () => container?.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (index: number) => {
    const container = document.getElementById('snap-container');
    if (container) {
      container.scrollTo({
        top: index * container.clientHeight,
        behavior: 'smooth'
      });
    }
  };

  const primaryCTA = isAuthenticated ? '/search' : '/search';
  const primaryCTAText = isAuthenticated ? 'Browse Opportunities' : 'Get Started';

  return (
    <div className="relative h-[100dvh]">


      {/* Scroll Snap Container */}
      <div id="snap-container" className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide scroll-smooth">

        {/* SECTION 1: HERO */}
        <section className="min-h-[100dvh] w-full snap-start flex flex-col items-center justify-center relative overflow-hidden bg-[var(--color-surface)] pt-24 pb-32">
          {/* Dynamic Background Elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 mix-blend-overlay"></div>
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(1, 31, 91, 0.05) 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>

            {/* Animated Blobs */}
            <div className="absolute top-1/4 left-1/4 w-[550px] h-[550px] bg-[#011F5B] rounded-full mix-blend-multiply filter blur-[100px] opacity-[0.07] animate-blob"></div>
            <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] bg-[#990000] rounded-full mix-blend-multiply filter blur-[80px] opacity-[0.06] animate-blob animation-delay-2000"></div>
          </div>

          <div className="relative z-10 max-w-5xl mx-auto space-y-8 text-center px-4 flex-1 flex flex-col justify-center">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/60 border border-[var(--border-subtle)] text-[#011F5B] text-xs font-bold tracking-widest uppercase mb-4 backdrop-blur-xl shadow-sm transition-transform hover:scale-105 cursor-default mx-auto">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#990000] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#990000]"></span>
              </span>
              Spring 2026 Research Cycle Open
            </div>

            <h1 className="text-4xl md:text-7xl font-bold tracking-tighter leading-[1.1] text-[#011F5B] drop-shadow-sm">
              Find Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#011F5B] via-[#011F5B] to-[#990000]">Penn Research</span>
            </h1>

            <p className="text-xl md:text-2xl text-[var(--color-text-secondary)] leading-relaxed font-light max-w-2xl mx-auto tracking-wide">
              Discover 700+ undergraduate research positions.
              <br className="hidden md:block" />
              Connect with faculty instantly using smart tools.
            </p>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-6 pt-6">
              {isLoading ? (
                <div className="px-10 py-5 bg-gray-50 rounded-full">
                  <div className="w-5 h-5 border-[3px] border-gray-200 border-t-[#011F5B] rounded-full animate-spin"></div>
                </div>
              ) : (
                <>
                  <Link
                    href={primaryCTA}
                    className="group relative px-10 py-4 bg-[#011F5B] text-white rounded-full font-bold text-base hover:bg-[#003366] transition-all duration-500 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 overflow-hidden ring-4 ring-transparent hover:ring-[#011F5B]/10"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      {primaryCTAText}
                      <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

        {/* SECTION 2: HOW IT WORKS */}
        <section className="min-h-[100dvh] w-full snap-start flex flex-col items-center justify-center bg-[#fdfdfd] relative px-4 md:px-12 pt-24 pb-40">
          <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col justify-center">
            <div className="text-center mb-10 space-y-2">
              <h2 className="text-3xl md:text-4xl font-bold text-[#011F5B] tracking-tight">
                How It Works
              </h2>
              <p className="text-[var(--color-text-secondary)] max-w-xl mx-auto text-lg font-light leading-relaxed">
                Four simple steps to launch your research journey at Penn.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { step: 1, title: 'Create Account', desc: 'Sign up with your Penn credentials.' },
                { step: 2, title: 'Build Profile', desc: 'Tell us about your interests and skills.' },
                { step: 3, title: 'Search Naturally', desc: 'Describe what you want in plain English.' },
                { step: 4, title: 'Connect', desc: 'Generate personalized emails to faculty.' },
              ].map((item, idx) => (
                <div key={idx} className="group relative bg-white p-6 md:p-8 rounded-[2rem] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-layered-hover transition-all duration-500 hover:-translate-y-1 border border-[var(--border-subtle)] text-center ring-1 ring-black/[0.02] hover:ring-black/[0.04]">
                  <div className="w-14 h-14 bg-blue-50/50 text-[#011F5B] rounded-2xl flex items-center justify-center mx-auto mb-6 text-xl font-bold group-hover:bg-[#011F5B] group-hover:text-white transition-colors duration-500 shadow-sm">
                    {item.step}
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2 tracking-tight">{item.title}</h3>
                  <p className="text-[var(--color-text-secondary)] text-base leading-relaxed font-light">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 3: FEATURES */}
        <section className="min-h-[100dvh] w-full snap-start flex flex-col items-center justify-center bg-white relative overflow-hidden px-6 md:px-12 pt-24 pb-40">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-b from-blue-50/40 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-t from-red-50/20 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>

          <div className="max-w-7xl mx-auto relative z-10 w-full flex-1 flex flex-col justify-center">
            <div className="text-center mb-10">
              <span className="text-[#990000] font-bold tracking-widest text-sm uppercase mb-2 block opacity-80">Powerful Tools</span>
              <h2 className="text-3xl md:text-5xl font-bold text-[#011F5B] tracking-tight">
                Designed for students
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {[
                { title: 'Natural Language Search', desc: 'Use plain English to find opportunities.', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
                { title: 'Smart Filters', desc: 'Drill down by year, category, and compensation.', icon: 'M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z' },
                { title: 'Personalized Results', desc: 'Ranking algorithm learns from your profile.', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                { title: 'Email Generator', desc: 'Generate professional cold emails tailored to each professor.', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' }
              ].map((feature, idx) => (
                <div key={idx} className="flex gap-6 items-start p-6 hover:bg-gray-50/50 rounded-[2rem] transition-colors border border-transparent hover:border-[var(--border-subtle)] group">
                  <div className="flex-shrink-0 w-14 h-14 bg-red-50 text-[#990000] rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-500">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={feature.icon} />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-[#011F5B] mb-2 tracking-tight">{feature.title}</h3>
                    <p className="text-[var(--color-text-secondary)] leading-relaxed text-base font-light">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 4: CTA & FOOTER */}
        <section className="min-h-[100dvh] w-full snap-start flex flex-col items-center justify-center relative overflow-hidden bg-[#011F5B] text-white text-center px-4 pt-24 pb-8">
          {/* Dynamic Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#011F5B] via-[#003366] to-[#4a0000] opacity-100"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-150 mix-blend-overlay"></div>

          {/* Animated Orbs for Depth - Larger to fill voids */}
          <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-[#990000] rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] bg-blue-400 rounded-full mix-blend-screen filter blur-[100px] opacity-15 animate-blob animation-delay-4000"></div>

          <div className="relative z-10 max-w-5xl mx-auto space-y-8 flex-1 flex flex-col justify-center">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight drop-shadow-md leading-tight">
              Ready to find <br /> your research group?
            </h2>
            <p className="text-blue-100/80 text-lg md:text-xl font-light tracking-wide max-w-2xl mx-auto leading-relaxed">
              Join hundreds of students who found their academic home through Penn CURF Finder.
            </p>
            {!isLoading && (
              <div className="pt-4">
                <Link
                  href={primaryCTA}
                  className="inline-block px-10 py-4 bg-white text-[#011F5B] rounded-full font-bold text-lg transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(255,255,255,0.4)] hover:bg-gray-50 hover:-translate-y-1 hover:scale-105 active:scale-95"
                >
                  {primaryCTAText}
                </Link>
              </div>
            )}
          </div>

          {/* Footer Anchor */}
          <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-blue-200/40 text-xs px-6 gap-4">
            <span>© 2026 Penn CURF Finder</span>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
