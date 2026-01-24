'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function HomePage() {
  const { isAuthenticated, user, isLoading } = useAuth();

  // Determine CTA destinations based on auth state
  const primaryCTA = isAuthenticated
    ? user?.has_profile
      ? '/search'
      : '/profile'
    : '/auth/register';

  const primaryCTAText = isAuthenticated
    ? user?.has_profile
      ? 'Start Searching'
      : 'Complete Profile'
    : 'Get Started';

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-[var(--color-surface)] text-[var(--color-primary)] py-32 px-8 text-center shadow-layered ring-1 ring-black/5">
        {/* Dynamic Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          {/* Grid Pattern Overlay for Texture */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 mix-blend-overlay"></div>
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(1, 31, 91, 0.05) 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>

          {/* Animated Blobs */}
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#011F5B] rounded-full mix-blend-multiply filter blur-[128px] opacity-[0.07] animate-blob"></div>
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#990000] rounded-full mix-blend-multiply filter blur-[100px] opacity-[0.06] animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-32 left-1/3 w-[600px] h-[600px] bg-blue-100 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto space-y-10">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/60 border border-[var(--border-subtle)] text-[#011F5B] text-xs font-bold tracking-widest uppercase mb-4 backdrop-blur-xl shadow-sm transition-transform hover:scale-105 cursor-default">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#990000] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#990000]"></span>
            </span>
            Spring 2026 Research Cycle Open
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[1.1] text-[#011F5B] drop-shadow-sm">
            Find Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#011F5B] via-[#011F5B] to-[#990000]">Penn Research</span>
          </h1>

          <p className="text-lg md:text-xl text-[var(--color-text-secondary)] leading-relaxed font-light max-w-3xl mx-auto tracking-wide">
            Discover 700+ undergraduate research positions.
            <br className="hidden md:block" />
            Connect with faculty instantly using smart tools.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-8 pt-8">
            {isLoading ? (
              <div className="px-12 py-6 bg-gray-50 rounded-full">
                <div className="w-6 h-6 border-[3px] border-gray-200 border-t-[#011F5B] rounded-full animate-spin"></div>
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
                {!isAuthenticated && (
                  <Link
                    href="/auth/login"
                    className="group px-10 py-4 bg-white/50 border border-[var(--border-subtle)] text-[#011F5B] rounded-full font-bold text-base hover:bg-white hover:text-[#011F5B] hover:border-[#011F5B]/20 transition-all shadow-md hover:shadow-lg backdrop-blur-sm hover:scale-105 active:scale-95"
                  >
                    Sign In
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-24 space-y-6">
          <h2 className="text-4xl font-bold text-[#011F5B] tracking-tight">
            How It Works
          </h2>
          <p className="text-[var(--color-text-secondary)] max-w-2xl mx-auto text-xl font-light leading-relaxed">
            Four simple steps to launch your research journey at Penn.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-10">
          {[
            { step: 1, title: 'Create Account', desc: 'Sign up with your Penn credentials.' },
            { step: 2, title: 'Build Profile', desc: 'Tell us about your interests and skills.' },
            { step: 3, title: 'Search Naturally', desc: 'Describe what you want in plain English.' },
            { step: 4, title: 'Connect', desc: 'Generate personalized emails to faculty.' },
          ].map((item, idx) => (
            <div key={idx} className="group relative bg-white p-12 rounded-[2rem] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-layered-hover transition-all duration-500 hover:-translate-y-2 border border-[var(--border-subtle)] text-center ring-1 ring-black/[0.02] hover:ring-black/[0.04]">
              <div className="w-20 h-20 bg-blue-50/50 text-[#011F5B] rounded-3xl flex items-center justify-center mx-auto mb-10 text-3xl font-bold group-hover:bg-[#011F5B] group-hover:text-white transition-colors duration-500 shadow-sm">
                {item.step}
              </div>
              <h3 className="font-bold text-xl text-gray-900 mb-4 tracking-tight">{item.title}</h3>
              <p className="text-[var(--color-text-secondary)] text-base leading-relaxed font-light">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-white rounded-[3rem] p-16 md:p-28 shadow-sm border border-[var(--border-subtle)] overflow-hidden relative ring-1 ring-black/[0.02]">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-b from-blue-50/40 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-t from-red-50/20 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>

        <div className="text-center mb-28 relative z-10">
          <span className="text-[#990000] font-bold tracking-widest text-sm uppercase mb-4 block opacity-80">Powerful Tools</span>
          <h2 className="text-5xl md:text-6xl font-bold text-[#011F5B] tracking-tight">
            Designed for students
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-x-16 gap-y-16 relative z-10">
          {[
            {
              title: 'Natural Language Search',
              desc: 'Use plain English to find opportunities. "Machine learning in healthcare" works better than keywords.',
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              )
            },
            {
              title: 'Smart Filters',
              desc: 'Drill down by year, category, and compensation type to find exactly what fits your schedule.',
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              )
            },
            {
              title: 'Personalized Results',
              desc: 'Our ranking algorithm learns from your profile to bring the most relevant research to the top.',
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              )
            },
            {
              title: 'Email Generator',
              desc: 'Stop staring at a blank screen. Generate professional cold emails tailored to each professor.',
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              )
            }
          ].map((feature, idx) => (
            <div key={idx} className="flex gap-10 items-start p-10 hover:bg-gray-50/50 rounded-[2.5rem] transition-colors border border-transparent hover:border-[var(--border-subtle)] group">
              <div className="flex-shrink-0 w-20 h-20 bg-red-50 text-[#990000] rounded-3xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-500">
                <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {feature.icon}
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-2xl text-[#011F5B] mb-4 tracking-tight">{feature.title}</h3>
                <p className="text-[var(--color-text-secondary)] leading-loose text-base font-light">
                  {feature.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      {/* CTA */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-[#011F5B] text-white py-32 px-8 text-center shadow-layered ring-1 ring-white/10">
        {/* Dynamic Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#011F5B] via-[#003366] to-[#4a0000] opacity-100"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-150 mix-blend-overlay"></div>

        {/* Animated Orbs for Depth */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#990000] rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-400 rounded-full mix-blend-screen filter blur-[100px] opacity-10 animate-blob animation-delay-4000"></div>

        <div className="relative z-10 max-w-3xl mx-auto space-y-10">
          <h2 className="text-5xl md:text-6xl font-bold tracking-tight drop-shadow-md">
            Ready to find your research group?
          </h2>
          <p className="text-blue-100/90 text-xl font-light tracking-wide max-w-2xl mx-auto leading-relaxed">
            Join hundreds of students who found their academic home through Penn CURF Finder.
          </p>
          {!isLoading && (
            <Link
              href={primaryCTA}
              className="inline-block px-12 py-5 bg-white text-[#011F5B] rounded-full font-bold text-lg transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] hover:bg-gray-50 hover:-translate-y-1 hover:scale-105 active:scale-95"
            >
              {primaryCTAText}
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
