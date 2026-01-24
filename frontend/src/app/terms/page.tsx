'use client';

import Link from 'next/link';

export default function TermsPage() {
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
                    <h1 className="text-4xl md:text-5xl font-bold text-[#011F5B] mb-4 tracking-tight">Terms of Service</h1>
                    <p className="text-[var(--color-text-secondary)] text-lg font-light">Last updated: January 24, 2026</p>
                </div>

                <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-sm border border-white/60 p-10 md:p-14 space-y-10 ring-1 ring-black/[0.03]">
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-[#011F5B]">1. Acceptance of Terms</h2>
                        <p className="text-gray-600 leading-relaxed font-light">
                            By accessing and using Penn CURF Finder, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using this websites particular services, you shall be subject to any posted guidelines or rules applicable to such services.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-[#011F5B]">2. Use License</h2>
                        <p className="text-gray-600 leading-relaxed font-light">
                            Permission is granted to temporarily view the materials (information or software) on Penn CURF Finder's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-gray-600 font-light marker:text-[#990000]">
                            <li>modify or copy the materials;</li>
                            <li>use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
                            <li>attempt to decompile or reverse engineer any software contained on Penn CURF Finder's website;</li>
                            <li>remove any copyright or other proprietary notations from the materials; or</li>
                            <li>transfer the materials to another person or "mirror" the materials on any other server.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-[#011F5B]">3. Disclaimer</h2>
                        <p className="text-gray-600 leading-relaxed font-light">
                            The materials on Penn CURF Finder's website are provided "as is". Penn CURF Finder makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties, including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-[#011F5B]">4. Limitations</h2>
                        <p className="text-gray-600 leading-relaxed font-light">
                            In no event shall Penn CURF Finder or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Penn CURF Finder's Internet site.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
