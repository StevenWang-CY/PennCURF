'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const primaryCTA = isAuthenticated ? '/search' : '/search';
  const primaryCTAText = isAuthenticated ? 'Browse Opportunities' : 'Start Searching';

  return (
    <div className="relative min-h-screen bg-[var(--background)] selection:bg-[#011F5B] selection:text-white">
      
      {/* Hyper-delicate background noise */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.015] mix-blend-overlay" style={{backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")'}}></div>

      <main className="relative z-10 flex flex-col items-center w-full overflow-hidden">
        
        {/* --- HERO SECTION --- */}
        <section className="relative w-full min-h-[100svh] flex flex-col items-center justify-center pt-20 pb-32 px-4 sm:px-6 lg:px-8">
          
          {/* Subtle soft washes of color instead of heavy orbs */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full overflow-hidden pointer-events-none -z-10">
            <div className="absolute top-[-5%] left-[5%] w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] bg-[#011F5B] rounded-full mix-blend-multiply filter blur-[140px] opacity-[0.04] animate-blob"></div>
            <div className="absolute top-[10%] right-[5%] w-[35vw] h-[35vw] max-w-[500px] max-h-[500px] bg-[#990000] rounded-full mix-blend-multiply filter blur-[120px] opacity-[0.03] animate-blob animation-delay-2000"></div>
          </div>

          <div className="max-w-4xl mx-auto w-full text-center space-y-10 mt-8">
            
            {/* Delicate Cycle Badge */}
            <div className="animate-fade-in-up inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-gray-200/60 bg-white/50 text-[#011F5B] text-[10px] font-semibold tracking-[0.2em] uppercase backdrop-blur-md">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#990000] opacity-80"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#990000]"></span>
              </span>
              Spring 2026 Cycle Open
            </div>

            {/* Editorial Typography */}
            <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <h1 className="text-5xl sm:text-7xl lg:text-[7rem] leading-[1.05] tracking-tight text-[#011F5B] font-serif">
                Find Your <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#011F5B] via-[#0b2c73] to-[#990000]">Penn Research</span>
              </h1>
            </div>

            <p className="max-w-xl mx-auto text-lg sm:text-xl text-[var(--color-text-secondary)] leading-relaxed font-light animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Discover elite opportunities across 700+ labs. Connect with faculty instantly using highly curated discovery tools.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              {isLoading ? (
                <div className="w-10 h-10 rounded-full border-[3px] border-gray-100 border-t-[#011F5B] animate-spin"></div>
              ) : (
                <Link
                  href={primaryCTA}
                  className="group relative inline-flex items-center justify-center px-8 py-3.5 bg-[#011F5B] text-white rounded-full font-medium text-base tracking-wide overflow-hidden shadow-[0_4px_14px_0_rgba(1,31,91,0.2)] transition-all duration-300 hover:shadow-[0_6px_20px_rgba(1,31,91,0.25)] hover:-translate-y-0.5"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {primaryCTAText}
                    <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </span>
                </Link>
              )}
            </div>

            {/* Extremely delicate mock search UI */}
            <div className="mt-20 relative w-full max-w-2xl mx-auto h-20 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
               <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] to-transparent z-10"></div>
               <div className="relative w-full h-16 animate-float flex items-center bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] px-6">
                  <svg className="w-5 h-5 text-gray-400 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  <span className="text-gray-400 font-sans text-sm tracking-wide">Search biology, machine learning, or Prof. Smith...</span>
                  <div className="ml-auto px-3 py-1 bg-gray-100/80 rounded-md text-[10px] text-gray-400 font-mono tracking-wider border border-gray-200/50">⌘ K</div>
               </div>
            </div>

          </div>
        </section>

        {/* --- REFINED BENTO FEATURES SECTION --- */}
        <section className="relative w-full py-24 px-4 sm:px-6 lg:px-8 bg-[#fafafa] flex justify-center border-t border-gray-100">
           <div className="max-w-6xl mx-auto w-full">
               <div className="mb-20 text-center space-y-4">
                 <h2 className="text-3xl md:text-4xl font-serif text-[#011F5B] tracking-tight">
                   Engineered for discovery.
                 </h2>
                 <p className="text-lg text-[var(--color-text-secondary)] mx-auto max-w-xl font-light">
                    An elegant platform that abstracts the complexity of research networking into a seamless experience.
                 </p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[280px]">
                  
                  {/* Feature 1 */}
                  <div className="md:col-span-2 relative group bento-shadow bg-white rounded-[2rem] p-10 border border-gray-100 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden">
                     <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full mix-blend-multiply blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
                     <div className="relative z-10 h-full flex flex-col justify-between">
                        <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-[#011F5B] border border-gray-100">
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" /></svg>
                        </div>
                        <div className="max-w-md">
                           <h3 className="text-xl font-medium text-gray-900 mb-2">Natural Language Engine</h3>
                           <p className="text-base text-gray-500 font-light leading-relaxed">Our semantic layers interpret your intent, finding perfect faculty matches without relying on exact phrasing.</p>
                        </div>
                     </div>
                  </div>

                  {/* Feature 2 (Accent) */}
                  <div className="md:col-span-1 relative group bento-shadow bg-gradient-to-b from-[#01194A] to-[#000d2b] rounded-[2rem] p-10 overflow-hidden transition-all duration-500 hover:shadow-[0_12px_40px_rgba(1,31,91,0.25)] hover:-translate-y-1 flex flex-col justify-between border border-[#011F5B]/50 hover:border-blue-400/30">
                     {/* Immersive natural lighting & textures */}
                     <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay pointer-events-none" style={{backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")'}}></div>
                     <div className="absolute top-[-30%] right-[-20%] w-[150%] h-[150%] bg-[#990000]/15 rounded-full mix-blend-screen blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none"></div>
                     <div className="absolute bottom-[-10%] left-[-10%] w-48 h-48 bg-blue-400/20 rounded-full mix-blend-screen blur-[60px] pointer-events-none"></div>

                     <div className="relative z-10 w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-blue-100 backdrop-blur-xl border border-white/10 group-hover:border-blue-300/30 transition-colors">
                        <svg className="w-5 h-5 drop-shadow-[0_0_15px_rgba(191,219,254,0.5)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                     </div>
                     <div className="relative z-10 mt-8">
                        <h3 className="text-xl font-serif tracking-tight text-white mb-2 group-hover:text-blue-50 transition-colors">Smart Generation</h3>
                        <p className="text-blue-200/60 font-light text-sm leading-relaxed group-hover:text-blue-200/80 transition-colors">Draft highly tailored, professional outreach emails with exquisite precision and absolute semantic grace.</p>
                     </div>
                  </div>

                  {/* Feature 3 */}
                  <div className="md:col-span-1 relative group bento-shadow bg-white rounded-[2rem] p-10 border border-gray-100 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex flex-col justify-between">
                     <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-[#990000] border border-gray-100">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                     </div>
                     <div>
                        <h3 className="text-xl font-medium text-gray-900 mb-2">Deep Granularity</h3>
                        <p className="text-gray-500 font-light text-sm leading-relaxed">Filter opportunities down to class year, interdisciplinary category, and exact compensation structures.</p>
                     </div>
                  </div>

                  {/* Feature 4 */}
                   <div className="md:col-span-2 relative group bento-shadow bg-white rounded-[2rem] p-10 border border-gray-100 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden">
                     <div className="absolute top-0 right-0 w-64 h-64 bg-[#990000]/5 rounded-full mix-blend-multiply blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
                     <div className="relative z-10 h-full flex flex-col justify-between">
                        <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-700">
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        </div>
                        <div className="max-w-md">
                           <h3 className="text-xl font-medium text-gray-900 mb-2">Dynamic Calibration</h3>
                           <p className="text-base text-gray-500 font-light leading-relaxed">The system continuously aligns with your evolving academic profile, quietly surfacing the most relevant lab openings.</p>
                        </div>
                     </div>
                  </div>

               </div>
           </div>
        </section>


        {/* --- EDITORIAL PROCESS STACK --- */}
        <section className="relative w-full py-28 px-4 sm:px-6 lg:px-8 bg-white flex justify-center border-t border-[var(--border-subtle)]">
           <div className="max-w-3xl mx-auto w-full">
              <div className="text-center mb-20 space-y-4">
                 <span className="text-gray-400 font-semibold tracking-[0.2em] text-[10px] uppercase">The Framework</span>
                 <h2 className="text-3xl md:text-4xl font-serif text-[#011F5B] tracking-tight">
                   From curiosity to placement.
                 </h2>
              </div>

              <div className="space-y-16">
                 {[
                   { step: '01', title: 'Create Account', desc: 'Sign up securely to save your profile and track matched opportunities.' },
                   { step: '02', title: 'Calibration', desc: 'Establish your vector. Major, skills, and academic trajectory.' },
                   { step: '03', title: 'Exploration', desc: 'Interface with the directory using natural language and strict filters.' },
                   { step: '04', title: 'Connection', desc: 'Deploy tailored outreach instantly to the principal investigator.' },
                 ].map((item, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row gap-6 items-baseline group border-b border-gray-100 pb-8 last:border-0 last:pb-0">
                       <div className="flex-shrink-0 text-sm font-mono text-gray-400 w-12 group-hover:text-[#011F5B] transition-colors duration-300">
                          {item.step}
                       </div>
                       <div>
                          <h3 className="text-xl font-medium text-gray-900 mb-2">{item.title}</h3>
                          <p className="text-base text-gray-500 font-light leading-relaxed max-w-lg">{item.desc}</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </section>

        {/* --- ARTISTIC PREMIUM CTA FOOTER --- */}
        <section className="relative w-full py-36 px-4 sm:px-6 lg:px-8 bg-[#00143a] overflow-hidden flex flex-col justify-center items-center text-center">
           
           {/* Immersive Atmospheric Lighting */}
           <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-400/20 to-transparent"></div>
           <div className="absolute top-[-50%] left-[-10%] w-[70vw] h-[70vw] max-w-[800px] max-h-[800px] bg-blue-500/10 rounded-full mix-blend-screen filter blur-[120px] pointer-events-none transform -rotate-12"></div>
           <div className="absolute bottom-[-50%] right-[-10%] w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] bg-[#990000]/15 rounded-full mix-blend-screen filter blur-[140px] pointer-events-none -rotate-12"></div>
           <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none" style={{backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")'}}></div>

           <div className="relative z-10 max-w-3xl mx-auto space-y-12 flex-1 flex flex-col justify-center w-full pb-16">
              
              <div className="space-y-6">
                 <h2 className="text-5xl sm:text-6xl lg:text-[4.5rem] font-serif tracking-tight leading-[1.05] text-white drop-shadow-lg">
                    Ready to begin <br/>
                    <span className="font-light italic text-blue-100/90">your research?</span>
                 </h2>
                 <p className="text-xl text-blue-200/60 font-light max-w-xl mx-auto tracking-wide">
                    Join the premier undergraduate directory at the University of Pennsylvania.
                 </p>
              </div>
              
              <div className="pt-8">
                 <Link
                    href={primaryCTA}
                    className="group relative inline-flex items-center justify-center px-12 py-5 bg-white/5 backdrop-blur-md text-white border border-white/20 rounded-full font-medium tracking-widest uppercase text-[10px] transition-all duration-500 hover:bg-white/10 hover:border-white/40 hover:shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:-translate-y-1 overflow-hidden"
                  >
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full"></div>
                    <span className="relative z-10 flex items-center gap-3">
                      Initialize Experience
                      <svg className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-1.5 opacity-70 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </span>
                  </Link>
              </div>
           </div>

           {/* Footer Anchor */}
           <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center text-blue-200/30 text-[11px] uppercase tracking-[0.2em] px-6 gap-8 pt-16 border-t border-white/5 mt-auto">
             <span className="font-light">© 2026 Penn CURF Finder</span>
             <div className="flex gap-8 font-light">
               <Link href="/privacy" className="hover:text-white transition-colors duration-500">Privacy Policy</Link>
               <Link href="/terms" className="hover:text-white transition-colors duration-500">Terms of Service</Link>
               <Link href="/contact" className="hover:text-white transition-colors duration-500">Support & Contact</Link>
             </div>
           </div>
        </section>
        
      </main>
    </div>
  );
}
