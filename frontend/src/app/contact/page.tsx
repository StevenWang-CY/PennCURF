'use client';

import Link from 'next/link';

export default function ContactPage() {
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
                    <h1 className="text-4xl md:text-5xl font-bold text-[#011F5B] mb-4 tracking-tight">Contact Us</h1>
                    <p className="text-[var(--color-text-secondary)] text-lg font-light">We'd love to hear from you.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-sm border border-white/60 p-10 ring-1 ring-black/[0.03] flex flex-col justify-center">
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xl font-bold text-[#011F5B] mb-2">General Inquiries</h3>
                                <p className="text-gray-600 font-light">curf@upenn.edu</p>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-[#011F5B] mb-2">Office</h3>
                                <p className="text-gray-600 font-light">
                                    Center for Undergraduate Research & Fellowships<br />
                                    University of Pennsylvania<br />
                                    3539 Locust Walk<br />
                                    Philadelphia, PA 19104
                                </p>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-[#011F5B] mb-2">Hours</h3>
                                <p className="text-gray-600 font-light">Monday - Friday: 9am - 5pm EST</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#011F5B] text-white rounded-[2rem] shadow-lg p-10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                        <div className="relative z-10 space-y-6">
                            <h3 className="text-2xl font-bold">Quick Message</h3>
                            <form className="space-y-4">
                                <div>
                                    <label className="block text-blue-200 text-xs font-bold uppercase tracking-wider mb-2">Name</label>
                                    <input type="text" className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 placeholder-blue-200/50 focus:outline-none focus:bg-white/20 transition text-sm" placeholder="Your Name" />
                                </div>
                                <div>
                                    <label className="block text-blue-200 text-xs font-bold uppercase tracking-wider mb-2">Email</label>
                                    <input type="email" className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 placeholder-blue-200/50 focus:outline-none focus:bg-white/20 transition text-sm" placeholder="pennkey@upenn.edu" />
                                </div>
                                <div>
                                    <label className="block text-blue-200 text-xs font-bold uppercase tracking-wider mb-2">Message</label>
                                    <textarea rows={4} className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 placeholder-blue-200/50 focus:outline-none focus:bg-white/20 transition text-sm" placeholder="How can we help?"></textarea>
                                </div>
                                <button type="button" className="w-full bg-white text-[#011F5B] font-bold py-3 rounded-lg hover:bg-gray-100 transition shadow-lg">Send Message</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
