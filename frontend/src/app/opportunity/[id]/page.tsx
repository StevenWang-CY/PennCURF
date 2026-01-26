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

// Utility function to clean scraped text
function cleanScrapedText(text: string | undefined | null): string {
  if (!text) return '';
  const markers = [
    'Details:', 'Preferred Student Year', 'VolunteerYes', 'VolunteerNo',
    'PaidYes', 'PaidNo', 'Work StudyYes', 'Work StudyNo', 'Researcher',
  ];
  let cleaned = text;
  for (const marker of markers) {
    const idx = cleaned.indexOf(marker);
    if (idx > 0) cleaned = cleaned.substring(0, idx);
  }
  return cleaned.trim();
}

// Utility function to validate URLs
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
    if (isRevision) setRevising(true);
    else setGeneratingEmail(true);

    try {
      const response = await api.generateEmail({
        opportunity_id: id,
        student_profile_id: profileId,
        custom_instructions: isRevision ? revisionInstruction : undefined,
        previous_email: isRevision && generatedEmail ? { subject: generatedEmail.subject, body: generatedEmail.body } : undefined
      });
      setGeneratedEmail({ subject: response.subject, body: response.body });
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
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#011F5B]"></div>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="text-center py-40">
        <h1 className="text-4xl font-serif text-gray-900 mb-6">Opportunity Not Found</h1>
        <Link href="/search" className="text-[#011F5B] hover:opacity-70 transition-opacity border-b border-[#011F5B]">
          Return to directory
        </Link>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-white text-[#1e293b]">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden z-0 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-blue-50/50 rounded-full mix-blend-multiply filter blur-[120px] animate-blob"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 md:py-32">
        {/* Navigation */}
        <div className="mb-24">
          <Link href="/search" className="group flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-[#011F5B] transition-colors">
            <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Research Directory
          </Link>
        </div>

        {/* Editorial Header */}
        <header className="mb-32 max-w-4xl">
          <div className="flex flex-wrap gap-3 mb-8">
            {opportunity.is_paid && (
              <span className="px-3 py-1 border border-gray-200 text-[#011F5B] text-[10px] font-bold uppercase tracking-widest rounded-full bg-transparent">
                Paid Position
              </span>
            )}
            {opportunity.research_categories?.map(cat => (
              <span key={cat} className="px-3 py-1 border border-gray-200 text-gray-500 text-[10px] font-bold uppercase tracking-widest rounded-full bg-transparent">
                {cat}
              </span>
            ))}
          </div>

          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl leading-[0.95] md:leading-[0.9] tracking-tight text-[#011F5B] mb-12">
            {opportunity.title}
          </h1>

          <div className="flex items-center gap-4 text-lg md:text-xl font-sans text-gray-500">
            {opportunity.researcher_name && <span className="text-gray-900 font-medium border-b border-gray-300 pb-0.5">{opportunity.researcher_name}</span>}
            {opportunity.researcher_title && <span className="italic font-serif">{opportunity.researcher_title}</span>}
          </div>
        </header>

        {/* Content Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">

          {/* Left Column: Main Text */}
          <div className="lg:col-span-8 space-y-24">
            {opportunity.description && (
              <section>
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-8 flex items-center gap-3">
                  <span className="w-8 h-[1px] bg-gray-300"></span> Project Overview
                </h3>
                <div className="prose prose-lg md:prose-xl font-sans text-gray-600 leading-[1.8] max-w-none">
                  <p className="whitespace-pre-wrap">{opportunity.description}</p>
                </div>
              </section>
            )}

            {opportunity.mentor_areas && (
              <section>
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-8 flex items-center gap-3">
                  <span className="w-8 h-[1px] bg-gray-300"></span> Research Areas
                </h3>
                <div className="prose prose-lg font-sans text-gray-600 leading-[1.8]">
                  {opportunity.mentor_areas}
                </div>
              </section>
            )}

            {opportunity.preferred_qualifications && cleanScrapedText(opportunity.preferred_qualifications) && (
              <section>
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-8 flex items-center gap-3">
                  <span className="w-8 h-[1px] bg-gray-300"></span> Qualifications
                </h3>
                <div className="prose prose-lg font-sans text-gray-600 leading-[1.8] whitespace-pre-wrap">
                  {cleanScrapedText(opportunity.preferred_qualifications)}
                </div>
              </section>
            )}
          </div>

          {/* Right Column: Metadata & Tools */}
          <div className="lg:col-span-4 space-y-16">
            {/* Contact Info (Clean) */}
            <div className="space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Researcher Contact</h3>
              <div className="space-y-2">
                {opportunity.researcher_email ? (
                  <div className="group flex items-center gap-3">
                    <span className="font-mono text-sm text-[#011F5B] border-b border-gray-200 pb-0.5">{opportunity.researcher_email}</span>
                    <button onClick={() => copyToClipboard(opportunity.researcher_email!, 'email')} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-[#011F5B]">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    </button>
                  </div>
                ) : <span className="text-gray-400 italic">No email listed</span>}

                <div className="flex flex-col gap-2 pt-4">
                  {isValidUrl(opportunity.researcher_profile_url) && (
                    <a href={opportunity.researcher_profile_url!} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-gray-900 hover:text-[#011F5B] transition-colors flex items-center gap-2">
                      CURF Profile <span className="text-gray-300">↗</span>
                    </a>
                  )}
                  {isValidUrl(opportunity.department_page_url) && (
                    <a href={opportunity.department_page_url!} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-gray-900 hover:text-[#011F5B] transition-colors flex items-center gap-2">
                      Department Page <span className="text-gray-300">↗</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Requirements Pills */}
            <div className="space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Target Students</h3>
              <div className="flex flex-wrap gap-2">
                {opportunity.preferred_student_years?.map(y => (
                  <span key={y} className="px-3 py-1 border border-gray-200 text-gray-600 text-[11px] font-bold uppercase tracking-widest rounded-full">
                    {y}
                  </span>
                ))}
                {opportunity.academic_terms?.map(t => (
                  <span key={t} className="px-3 py-1 border border-gray-200 text-gray-600 text-[11px] font-bold uppercase tracking-widest rounded-full">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Skill Analyzer (Clean Look) */}
            <div className="pt-8 border-t border-gray-100">
              <SkillAnalyzer opportunityId={id} />
            </div>
          </div>
        </div>

        {/* Action Section / Email Generator */}
        <section className="mt-40 pt-20 border-t border-gray-100">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
              <div>
                <h2 className="font-serif text-4xl text-[#011F5B] mb-2">Interested?</h2>
                <p className="text-gray-500 font-sans text-lg">Draft a professional email to the researcher in seconds.</p>
              </div>
              {!generatedEmail && !hasProfile && (
                <Link href="/profile" className="px-6 py-3 bg-[#011F5B] text-white font-bold rounded-lg hover:bg-blue-900 transition shadow-lg">
                  Create Profile to Draft
                </Link>
              )}
            </div>

            {/* Tool Interface */}
            <div className="bg-gray-50 rounded-3xl p-8 md:p-12 border border-gray-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/50 rounded-full blur-3xl -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>

              <div className="relative z-10">
                {/* Similar logic for email generation UI but styled strictly */}
                {!generatedEmail ? (
                  <button
                    onClick={() => handleGenerateEmail(false)}
                    disabled={generatingEmail || !hasProfile}
                    className="w-full md:w-auto px-8 py-4 bg-[#011F5B] text-white rounded-xl font-bold text-lg hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {generatingEmail ? 'Drafting...' : 'Generate Email Draft'}
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </button>
                ) : (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                    {/* Email Preview */}
                    <div className="space-y-4">
                      <div className="border-b border-gray-200 pb-4">
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Subject</p>
                        <div className="flex justify-between items-center">
                          <p className="font-medium text-gray-900">{generatedEmail.subject}</p>
                          <button onClick={() => copyToClipboard(generatedEmail.subject, 'subject')} className="text-xs text-[#011F5B] font-bold hover:underline">
                            {copied === 'subject' ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Body</p>
                        <div className="relative">
                          <textarea
                            value={generatedEmail.body}
                            onChange={e => setGeneratedEmail({ ...generatedEmail, body: e.target.value })}
                            className="w-full min-h-[300px] bg-white border border-gray-200 rounded-xl p-6 font-mono text-sm text-gray-700 focus:ring-2 focus:ring-[#011F5B]/10 outline-none leading-relaxed resize-y shadow-sm"
                          />
                          <button onClick={() => copyToClipboard(generatedEmail.body, 'body')} className="absolute top-4 right-4 text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded text-gray-600 font-medium transition">
                            {copied === 'body' ? 'Copied' : 'Copy Body'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-200">
                      <button onClick={() => copyToClipboard(`Subject: ${generatedEmail.subject}\n\n${generatedEmail.body}`, 'body')} className="px-6 py-3 bg-[#011F5B] text-white font-bold rounded-lg hover:shadow-lg transition">
                        Copy Full Email
                      </button>
                      <button onClick={() => handleGenerateEmail(false)} className="px-6 py-3 bg-white border border-gray-200 text-gray-600 font-bold rounded-lg hover:bg-gray-50 transition">
                        Regenerate
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
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
      const data = await api.analyzeSkills({ opportunity_id: opportunityId, student_profile_id: profileId });
      setResult(data);
    } catch {
      alert('Analysis failed.');
    } finally {
      setAnalyzing(false);
    }
  };

  if (!result) {
    return (
      <button
        onClick={handleAnalyze}
        disabled={analyzing}
        className="w-full py-3 px-4 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2 group"
      >
        {analyzing ? (
          <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
        ) : (
          <>
            Analyze Fit
            <span className="text-gray-400 group-hover:translate-x-1 transition-transform">→</span>
          </>
        )}
      </button>
    )
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2">
      <div className="flex items-center gap-4 mb-4">
        <div className={`text-4xl font-bold ${result.match_score >= 80 ? 'text-emerald-600' : result.match_score >= 50 ? 'text-yellow-600' : 'text-red-500'}`}>
          {result.match_score}%
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Match Score</p>
          <p className="text-sm font-medium text-gray-900">{result.match_score >= 80 ? 'High Compatibility' : 'Moderate Fit'}</p>
        </div>
      </div>
      <p className="text-sm text-gray-500 leading-relaxed mb-6 border-b border-gray-100 pb-4">{result.analysis_text}</p>

      <div className="space-y-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#011F5B] mb-2">Matched Skills</p>
          <div className="flex flex-wrap gap-1">
            {result.matched_skills.map(skill => (
              <span key={skill} className="px-2 py-0.5 bg-blue-50 text-blue-800 text-[10px] font-bold uppercase tracking-wide rounded border border-blue-100">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
