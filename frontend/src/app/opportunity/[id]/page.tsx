'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, ResearchOpportunity } from '@/lib/api';
import { useProfile } from '@/contexts/ProfileContext';
import ProtectedRoute from '@/components/ProtectedRoute';

interface PageProps {
  params: Promise<{ id: string }>;
}

// Utility function to clean scraped text that may contain extra "Details:" section
function cleanScrapedText(text: string | undefined | null): string {
  if (!text) return '';

  // Remove "Details:" section and everything after common markers
  const markers = [
    'Details:',
    'Preferred Student Year',
    'VolunteerYes',
    'VolunteerNo',
    'PaidYes',
    'PaidNo',
    'Work StudyYes',
    'Work StudyNo',
    'Researcher',
  ];

  let cleaned = text;
  for (const marker of markers) {
    const idx = cleaned.indexOf(marker);
    if (idx > 0) {
      cleaned = cleaned.substring(0, idx);
    }
  }

  return cleaned.trim();
}

// Utility function to validate URLs - only show links with valid http/https URLs
function isValidUrl(url: string | undefined | null): boolean {
  if (!url || !url.trim()) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export default function OpportunityDetailPage({ params }: PageProps) {
  return (
    <ProtectedRoute>
      <OpportunityDetailContent params={params} />
    </ProtectedRoute>
  );
}

function OpportunityDetailContent({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { profileId, hasProfile } = useProfile();
  const [opportunity, setOpportunity] = useState<ResearchOpportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingEmail, setGeneratingEmail] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState<{ subject: string; body: string } | null>(null);
  const [copied, setCopied] = useState<'email' | 'subject' | 'body' | null>(null);

  /* Interactive Email Revision State */
  const [revisionMode, setRevisionMode] = useState(false);
  const [revisionInstruction, setRevisionInstruction] = useState('');
  const [revising, setRevising] = useState(false);

  useEffect(() => {
    api.getOpportunity(id)
      .then(opp => {
        setOpportunity(opp);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading opportunity:', err);
        setLoading(false);
      });
  }, [id]);

  const handleGenerateEmail = async (isRevision = false) => {
    if (!profileId) {
      alert('Please create a profile first to generate a personalized email.');
      router.push('/profile');
      return;
    }

    if (isRevision) {
      setRevising(true);
    } else {
      setGeneratingEmail(true);
    }

    try {
      const response = await api.generateEmail({
        opportunity_id: id,
        student_profile_id: profileId,
        custom_instructions: isRevision ? revisionInstruction : undefined,
        previous_email: isRevision && generatedEmail ? { subject: generatedEmail.subject, body: generatedEmail.body } : undefined
      });

      setGeneratedEmail({
        subject: response.subject,
        body: response.body,
      });

      if (isRevision) {
        setRevisionMode(false);
        setRevisionInstruction('');
      }

    } catch (err) {
      console.error('Error generating email:', err);
      alert('Error generating email. Please try again.');
    } finally {
      setGeneratingEmail(false);
      setRevising(false);
    }
  };

  const copyToClipboard = async (text: string, type: 'email' | 'subject' | 'body') => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#011F5B]"></div>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Opportunity Not Found</h1>
        <Link href="/search" className="text-[#011F5B] hover:underline">
          Back to Search
        </Link>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pb-20">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#011F5B] rounded-full mix-blend-multiply filter blur-[128px] opacity-[0.04] animate-blob"></div>
        <div className="absolute bottom-[20%] left-[-10%] w-[400px] h-[400px] bg-[#990000] rounded-full mix-blend-multiply filter blur-[100px] opacity-[0.04] animate-blob animation-delay-4000"></div>
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.02) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto space-y-8 pb-12 pt-8 px-4">
        {/* Back link */}
        <div>
          <Link
            href="/search"
            className="inline-flex items-center text-[#011F5B] hover:text-[#990000] transition-colors font-semibold text-sm group bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-white/60 shadow-sm"
          >
            <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Search
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header Card */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-layered border border-white/60 p-10 ring-1 ring-black/[0.03]">
              <div className="flex flex-wrap gap-2 mb-4">
                {opportunity.research_categories?.map(cat => (
                  <span key={cat} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold uppercase tracking-wider rounded-full border border-blue-100">
                    {cat}
                  </span>
                ))}
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-6 leading-tight">{opportunity.title}</h1>

              <div className="flex flex-wrap gap-3">
                {opportunity.is_paid && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-50 text-yellow-800 text-sm font-medium border border-yellow-100">
                    <span className="mr-1.5">$</span> Paid
                  </span>
                )}
                {opportunity.is_volunteer && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-50 text-purple-800 text-sm font-medium border border-purple-100">
                    Volunteer
                  </span>
                )}
                {opportunity.is_work_study && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-orange-50 text-orange-800 text-sm font-medium border border-orange-100">
                    Work Study
                  </span>
                )}
              </div>
            </div>

            {/* Description & Details */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-layered border border-white/60 p-10 space-y-10 ring-1 ring-black/[0.03]">
              {opportunity.description && (
                <section>
                  <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-[#990000] rounded-full"></div>
                    Description
                  </h2>
                  <div className="prose prose-blue max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {opportunity.description}
                  </div>
                </section>
              )}

              {opportunity.mentor_areas && (
                <section className="pt-6 border-t border-gray-50">
                  <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-[#011F5B] rounded-full"></div>
                    Research Areas
                  </h2>
                  <div className="prose prose-blue max-w-none text-gray-600 leading-relaxed">
                    {opportunity.mentor_areas}
                  </div>
                </section>
              )}

              {opportunity.preferred_qualifications && cleanScrapedText(opportunity.preferred_qualifications) && (
                <section className="pt-6 border-t border-gray-50">
                  <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-gray-400 rounded-full"></div>
                    Preferred Qualifications
                  </h2>
                  <div className="prose prose-blue max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {cleanScrapedText(opportunity.preferred_qualifications)}
                  </div>
                </section>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Researcher Info Card */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[1.5rem] shadow-layered border border-white/60 p-8 sticky top-24 ring-1 ring-black/[0.03]">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Researcher</h2>

              <div className="relative">
                {opportunity.researcher_name && (
                  <p className="text-xl font-bold text-gray-900 mb-1">{opportunity.researcher_name}</p>
                )}
                {opportunity.researcher_title && (
                  <p className="text-gray-500 text-sm mb-4 leading-normal">{opportunity.researcher_title}</p>
                )}
              </div>

              {opportunity.researcher_email && (
                <div className="mb-6 p-3 bg-gray-50 rounded-xl border border-gray-100 group">
                  <p className="text-xs text-gray-400 font-medium mb-1 pl-1">Contact Email</p>
                  <div className="flex items-center justify-between gap-2">
                    <code className="text-sm text-[#011F5B] font-medium truncate select-all">{opportunity.researcher_email}</code>
                    <button
                      onClick={() => copyToClipboard(opportunity.researcher_email!, 'email')}
                      className="p-1.5 text-gray-400 hover:text-[#011F5B] hover:bg-white rounded-lg transition-all shadow-sm opacity-0 group-hover:opacity-100"
                      title="Copy Email"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3 pt-2 border-t border-gray-100">
                {isValidUrl(opportunity.researcher_profile_url) && (
                  <a href={opportunity.researcher_profile_url!} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-gray-600 hover:text-[#011F5B] transition-colors group">
                    <span className="w-6 h-6 rounded-full bg-blue-50 text-[#011F5B] flex items-center justify-center mr-3 group-hover:bg-[#011F5B] group-hover:text-white transition-colors">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </span>
                    CURF Profile
                    <svg className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  </a>
                )}
                {isValidUrl(opportunity.department_page_url) && (
                  <a href={opportunity.department_page_url!} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-gray-600 hover:text-[#011F5B] transition-colors group">
                    <span className="w-6 h-6 rounded-full bg-blue-50 text-[#011F5B] flex items-center justify-center mr-3 group-hover:bg-[#011F5B] group-hover:text-white transition-colors">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    </span>
                    Department Page
                    <svg className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  </a>
                )}
                {isValidUrl(opportunity.project_website) && (
                  <a href={opportunity.project_website!} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-gray-600 hover:text-[#011F5B] transition-colors group">
                    <span className="w-6 h-6 rounded-full bg-blue-50 text-[#011F5B] flex items-center justify-center mr-3 group-hover:bg-[#011F5B] group-hover:text-white transition-colors">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                    </span>
                    Project Website
                    <svg className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  </a>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Requirements</h3>
              <div className="space-y-4">
                {opportunity.preferred_student_years && opportunity.preferred_student_years.length > 0 && (
                  <div>
                    <span className="block text-xs text-gray-500 mb-1">Student Years</span>
                    <div className="flex flex-wrap gap-1">
                      {opportunity.preferred_student_years.map(y => (
                        <span key={y} className="px-2 py-0.5 bg-white border border-gray-200 rounded text-xs text-gray-600 font-medium">{y}</span>
                      ))}
                    </div>
                  </div>
                )}
                {opportunity.academic_terms && opportunity.academic_terms.length > 0 && (
                  <div>
                    <span className="block text-xs text-gray-500 mb-1">Academic Terms</span>
                    <div className="flex flex-wrap gap-1">
                      {opportunity.academic_terms.map(t => (
                        <span key={t} className="px-2 py-0.5 bg-white border border-gray-200 rounded text-xs text-gray-600 font-medium">{t}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Skill Compatibility Section */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-8 border border-emerald-100/50 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-100 rounded-full blur-3xl -mr-10 -mt-10 opacity-50"></div>

          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  Skill Compatibility
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">Beta</span>
                </h2>
                <p className="text-gray-500 text-sm mt-1">AI-powered analysis of your fit for this role.</p>
              </div>
              {!hasProfile ? (
                <Link href="/profile" className="px-4 py-2 bg-white text-emerald-700 font-bold rounded-lg shadow-sm border border-emerald-100 hover:bg-emerald-50 transition text-sm">
                  Create Profile to Analyze
                </Link>
              ) : (
                <SkillAnalyzer opportunityId={id} />
              )}
            </div>
          </div>
        </div>

        {/* Email Generator - Full Width */}
        <div className="bg-gradient-to-br from-gray-900 to-blue-900 rounded-2xl shadow-lg p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
          <div className="relative z-10">
            <div className="max-w-3xl">
              <h2 className="text-2xl font-bold mb-2">Ready to apply?</h2>
              <p className="text-blue-100 mb-6 font-light">
                Our AI can analyze this opportunity and your profile to draft a personalized, professional email to Dr. {opportunity.researcher_name?.split(' ').pop()}.
              </p>
            </div>

            {!hasProfile && (
              <div className="mb-6 p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl flex items-center gap-4">
                <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-200">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <div>
                  <p className="font-medium">Profile Required</p>
                  <p className="text-sm text-blue-100">You need to <Link href="/profile" className="underline hover:text-white transition">create a profile</Link> first to generate personalized emails.</p>
                </div>
              </div>
            )}

            {!generatedEmail ? (
              <button
                onClick={() => handleGenerateEmail(false)}
                disabled={generatingEmail}
                className="px-8 py-3 bg-white text-[#011F5B] rounded-xl font-bold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {generatingEmail ? (
                  <>
                    <div className="w-5 h-5 border-2 border-blue-900/30 border-t-blue-900 rounded-full animate-spin"></div>
                    Drafting Email...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    Generate Email Draft
                  </>
                )}
              </button>
            ) : (
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 mt-6">

                {revisionMode && (
                  <div className="mb-6 p-4 bg-blue-900/50 border border-blue-500/30 rounded-lg animate-in fade-in slide-in-from-top-2">
                    <label className="block text-sm font-bold text-blue-200 mb-2">How should the AI revise this email?</label>
                    <textarea
                      value={revisionInstruction}
                      onChange={(e) => setRevisionInstruction(e.target.value)}
                      placeholder="e.g. Make it more formal, emphasize my Java skills, ask about summer availability..."
                      className="w-full px-4 py-3 bg-black/40 border border-blue-500/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 mb-3 text-sm"
                      rows={3}
                      autoFocus
                    />
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => setRevisionMode(false)}
                        className="px-3 py-1.5 text-sm text-gray-300 hover:text-white transition"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleGenerateEmail(true)}
                        disabled={revising || !revisionInstruction.trim()}
                        className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {revising ? (
                          <>
                            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Revising...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            Revise Draft
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-blue-200 uppercase tracking-wider">Send To</label>
                      <div className="bg-black/20 rounded-lg p-3 flex justify-between items-center border border-white/5">
                        <span className="font-mono text-sm truncate">{opportunity.researcher_email}</span>
                        <button onClick={() => copyToClipboard(opportunity.researcher_email!, 'email')} className="text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded transition">
                          {copied === 'email' ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-blue-200 uppercase tracking-wider">Subject</label>
                      <div className="bg-black/20 rounded-lg p-3 flex justify-between items-center border border-white/5">
                        <span className="font-medium text-sm truncate pr-2">{generatedEmail.subject}</span>
                        <button onClick={() => copyToClipboard(generatedEmail.subject, 'subject')} className="text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded transition">
                          {copied === 'subject' ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-blue-200 uppercase tracking-wider">Email Body</label>
                    <div className="relative">
                      <textarea
                        value={generatedEmail.body}
                        onChange={e => setGeneratedEmail({ ...generatedEmail, body: e.target.value })}
                        className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-white/30 focus:border-transparent font-mono text-sm text-gray-100 placeholder-gray-500 min-h-[300px]"
                        spellCheck={false}
                      />
                      <button
                        onClick={() => copyToClipboard(generatedEmail.body, 'body')}
                        className="absolute top-2 right-2 text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded transition text-white"
                      >
                        {copied === 'body' ? 'Copied' : 'Copy Body'}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-end gap-3 pt-2">
                    {!revisionMode && (
                      <>
                        <button
                          onClick={() => setRevisionMode(true)}
                          className="px-4 py-2 border border-blue-400/30 bg-blue-500/10 text-blue-100 rounded-lg font-medium hover:bg-blue-500/20 hover:border-blue-400/50 transition flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          Revise with AI
                        </button>
                        <button
                          onClick={() => handleGenerateEmail(false)}
                          className="px-4 py-2 text-sm text-blue-200 hover:text-white transition"
                        >
                          Regenerate Completely
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => copyToClipboard(`Subject: ${generatedEmail.subject}\n\n${generatedEmail.body}`, 'body')}
                      className="px-6 py-2 bg-white text-[#011F5B] rounded-lg font-bold hover:bg-blue-50 transition shadow-lg"
                    >
                      Copy Full Email
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface SkillAnalyzerProps {
  opportunityId: string;
}

function SkillAnalyzer({ opportunityId }: SkillAnalyzerProps) {
  const { profileId } = useProfile();
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<import('@/lib/api').SkillAnalysisResponse | null>(null);

  const handleAnalyze = async () => {
    if (!profileId) return;

    setAnalyzing(true);
    try {
      const data = await api.analyzeSkills({
        opportunity_id: opportunityId,
        student_profile_id: profileId,
      });
      setResult(data);
    } catch (err) {
      console.error('Skill analysis failed:', err);
      alert('Could not analyze skills. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  if (!result) {
    return (
      <button
        onClick={handleAnalyze}
        disabled={analyzing}
        className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-xl shadow-lg hover:bg-emerald-700 hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {analyzing ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            Analyzing...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" /></svg>
            Analyze My Fit
          </>
        )}
      </button>
    )
  }

  return (
    <div className="w-full bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-emerald-100 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex items-center gap-6 mb-6">
        <div className="relative w-16 h-16 flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="none" className="text-gray-200" />
            <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="none"
              className={`${result.match_score >= 80 ? 'text-emerald-500' : result.match_score >= 50 ? 'text-yellow-500' : 'text-red-500'} transition-all duration-1000 ease-out`}
              strokeDasharray={175.9}
              strokeDashoffset={175.9 - (175.9 * result.match_score) / 100}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center font-bold text-gray-700 text-sm">
            {result.match_score}%
          </div>
        </div>
        <div>
          <h3 className={`font-bold text-lg ${result.match_score >= 80 ? 'text-emerald-700' : result.match_score >= 50 ? 'text-yellow-700' : 'text-red-700'}`}>
            {result.match_score >= 80 ? 'High Compatibility' : result.match_score >= 50 ? 'Moderate Fit' : 'Low Compatibility'}
          </h3>
          <p className="text-sm text-gray-500 max-w-md leading-relaxed">{result.analysis_text || "Based on your major and skills."}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-widest flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            Your Strengths
          </h4>
          {result.matched_skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {result.matched_skills.map(skill => (
                <span key={skill} className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-medium rounded-lg border border-emerald-200 flex items-center gap-1">
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">No direct skill matches found.</p>
          )}
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            Skills to Build
          </h4>
          {result.missing_skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {result.missing_skills.map(skill => (
                <span key={skill} className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg border border-gray-200 dashed border-2">
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">No missing required skills identified.</p>
          )}
        </div>
      </div>
    </div>
  );
}
