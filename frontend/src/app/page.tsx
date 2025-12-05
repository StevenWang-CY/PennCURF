'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function HomePage() {
  const [profileExists, setProfileExists] = useState(false);

  useEffect(() => {
    // Check if profile exists in localStorage
    const profileId = localStorage.getItem('studentProfileId');
    setProfileExists(!!profileId);
  }, []);

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-[#011F5B] text-white py-24 px-8 text-center shadow-2xl ring-1 ring-white/10">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-[#011F5B] via-[#003366] to-[#990000] opacity-90"></div>

        <div className="relative z-10 max-w-3xl mx-auto space-y-8">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight drop-shadow-sm">
            Find Your Perfect <br />
            <span className="text-blue-100">Research Opportunity</span>
          </h1>
          <p className="text-xl text-blue-50/90 leading-relaxed font-light max-w-2xl mx-auto">
            Discover 700+ opportunities at Penn. Get personalized recommendations
            and generate cold emails to connect with faculty instantly.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            <Link
              href="/search"
              className="px-8 py-4 bg-white text-[#011F5B] rounded-full font-semibold hover:bg-blue-50 hover:scale-105 transition-all shadow-lg hover:shadow-xl"
            >
              Start Searching
            </Link>
            {!profileExists && (
              <Link
                href="/profile"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-full font-semibold hover:bg-white/20 transition-all"
              >
                Create Profile
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-6xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            How It Works
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Three simple steps to launch your research journey.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {[
            { step: 1, title: 'Create Profile', desc: 'Tell us about your interests and skills.' },
            { step: 2, title: 'Search Naturally', desc: 'Describe what you want in plain English.' },
            { step: 3, title: 'Get Matches', desc: 'AI ranks opportunities just for you.' },
            { step: 4, title: 'Generate Email', desc: 'Draft personalized emails to faculty.' },
          ].map((item, idx) => (
            <div key={idx} className="group relative bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-[#011F5B] to-[#003366] text-white rounded-2xl flex items-center justify-center mx-auto mb-6 text-xl font-bold shadow-lg shadow-blue-900/10 group-hover:scale-110 transition-transform">
                {item.step}
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-3">{item.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-white rounded-3xl p-12 shadow-sm border border-gray-100">
        <div className="text-center mb-16">
          <span className="text-[#990000] font-semibold tracking-wider text-sm uppercase">Powerful Tools</span>
          <h2 className="text-3xl font-bold text-gray-900 mt-2">
            Features designed for students
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
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
            <div key={idx} className="flex gap-6 items-start p-4 hover:bg-gray-50 rounded-2xl transition-colors">
              <div className="flex-shrink-0 w-12 h-12 bg-red-50 text-[#990000] rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {feature.icon}
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {feature.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden rounded-3xl bg-gray-900 text-white py-20 px-4 text-center">
        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">
            Ready to find your research group?
          </h2>
          <p className="text-gray-400 text-lg">
            Join hundreds of students who found their placement through Penn CURF Finder.
          </p>
          <Link
            href={profileExists ? "/search" : "/profile"}
            className="inline-block px-8 py-4 bg-[#990000] hover:bg-red-800 text-white rounded-full font-semibold transition-all shadow-lg hover:shadow-red-900/20 hover:-translate-y-1"
          >
            {profileExists ? "Start Searching Now" : "Create Your Profile"}
          </Link>
        </div>
      </section>
    </div>
  );
}
