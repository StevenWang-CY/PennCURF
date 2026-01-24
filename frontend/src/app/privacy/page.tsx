'use client';

import Link from 'next/link';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-[#fdfdfd] relative overflow-hidden">
            {/* Dynamic Background */}
            <div className="fixed inset-0 overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#011F5B] rounded-full mix-blend-multiply filter blur-[128px] opacity-[0.03] animate-blob"></div>
                <div className="absolute bottom-[20%] left-[-10%] w-[400px] h-[400px] bg-[#990000] rounded-full mix-blend-multiply filter blur-[100px] opacity-[0.03] animate-blob animation-delay-4000"></div>
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.02) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-6 py-24">
                <div className="mb-12">
                    <Link href="/" className="inline-flex items-center text-[#011F5B] hover:text-[#990000] transition-colors font-semibold text-sm group mb-8">
                        <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Home
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-bold text-[#011F5B] mb-4 tracking-tight">Privacy Policy</h1>
                    <p className="text-[var(--color-text-secondary)] text-lg font-light">Last updated: January 24, 2026</p>
                </div>

                <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-sm border border-white/60 p-10 md:p-14 space-y-10 ring-1 ring-black/[0.03]">
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-[#011F5B]">1. Introduction</h2>
                        <p className="text-gray-600 leading-relaxed font-light">
                            Penn CURF Finder ("we," "our," or "us") respects your privacy and is committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-[#011F5B]">2. Data We Collect</h2>
                        <p className="text-gray-600 leading-relaxed font-light">
                            We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-gray-600 font-light marker:text-[#990000]">
                            <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
                            <li><strong>Contact Data</strong> includes email address and telephone number.</li>
                            <li><strong>Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform, and other technology on the devices you use to access this website.</li>
                            <li><strong>Profile Data</strong> includes your interests, preferences, feedback and survey responses (e.g., your major, research interests).</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-[#011F5B]">3. How We Use Your Data</h2>
                        <p className="text-gray-600 leading-relaxed font-light">
                            We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-gray-600 font-light marker:text-[#990000]">
                            <li>To match you with relevant research opportunities.</li>
                            <li>To generate personalized email drafts for faculty connection.</li>
                            <li>To manage your account and registration.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-[#011F5B]">4. Data Security</h2>
                        <p className="text-gray-600 leading-relaxed font-light">
                            We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
