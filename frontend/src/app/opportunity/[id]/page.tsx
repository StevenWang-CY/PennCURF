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

  const handleGenerateEmail = async () => {
    if (!profileId) {
      alert('Please create a profile first to generate a personalized email.');
      router.push('/profile');
      return;
    }
    setGeneratingEmail(true);

    try {
      const response = await api.generateEmail({
        opportunity_id: id,
        student_profile_id: profileId,
      });
      setGeneratedEmail({ subject: response.subject, body: response.body });
    } catch (err) {
      console.error('Error generating email:', err);
      alert('Error generating email. Please try again.');
    } finally {
      setGeneratingEmail(false);
    }
  };

  const copyToClipboard = async (text: string, type: 'email' | 'subject' | 'body') => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="w-8 h-8 border-[2px] border-gray-100 border-t-gray-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="text-center py-40 bg-white min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-serif text-gray-900 mb-6">Opportunity Not Found</h1>
        <Link href="/search" className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 hover:text-gray-900 transition-colors duration-300">
          Return to directory
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#333333] selection:bg-gray-200 selection:text-black">
      <div className="max-w-[70rem] mx-auto px-6 sm:px-12 py-16 md:py-24">
        
        {/* Navigation */}
        <div className="mb-24">
          <button
            onClick={() => router.back()}
            className="group flex items-center gap-4 text-[10px] font-semibold uppercase tracking-[0.25em] font-sans text-gray-400 hover:text-gray-900 transition-colors duration-300"
          >
            <span className="w-8 h-[1px] bg-gray-300 group-hover:bg-gray-900 transition-colors duration-300 block"></span>
            Back to Directory
          </button>
        </div>

        {/* Hyper-Editorial Header */}
        <header className="mb-20 max-w-4xl border-b border-gray-100 pb-12">
          <div className="flex flex-wrap gap-2 mb-8">
            {opportunity.is_paid && (
              <span className="px-3 py-1 border-[0.5px] border-gray-300 text-gray-700 bg-white text-[10px] font-semibold uppercase tracking-widest font-sans rounded-full">
                Paid Position
              </span>
            )}
            {opportunity.research_categories?.map(cat => (
              <span key={cat} className="px-3 py-1 border-[0.5px] border-gray-200 text-gray-600 bg-white text-[10px] font-semibold uppercase tracking-widest font-sans rounded-full">
                {cat}
              </span>
            ))}
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl leading-[1.1] text-gray-900 mb-6 max-w-4xl tracking-tight">
            {opportunity.title}
          </h1>

          <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 text-lg text-gray-700">
            {opportunity.researcher_name && <span className="font-medium text-gray-900">{opportunity.researcher_name}</span>}
            {opportunity.researcher_name && opportunity.researcher_title && <span className="hidden sm:inline text-gray-300">|</span>}
            {opportunity.researcher_title && <span>{opportunity.researcher_title}</span>}
          </div>
        </header>

        {/* Content Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">

          {/* Left Column: Main Text */}
          <div className="lg:col-span-8 space-y-24">
            
            {opportunity.description && (
              <section className="relative">
                <div className="flex items-center gap-4 mb-6">
                  <span className="w-8 h-[1px] bg-gray-300"></span>
                  <h3 className="text-[11px] font-bold uppercase tracking-widest font-sans text-gray-500">Project Overview</h3>
                </div>
                <div className="text-[17px] text-gray-800 leading-[1.9] text-justify max-w-[65ch] whitespace-pre-wrap">
                  {opportunity.description}
                </div>
              </section>
            )}

            {opportunity.mentor_areas && (
              <section className="relative">
                <div className="flex items-center gap-4 mb-6">
                  <span className="w-8 h-[1px] bg-gray-300"></span>
                  <h3 className="text-[11px] font-bold uppercase tracking-widest font-sans text-gray-500">Research Areas</h3>
                </div>
                <div className="text-[17px] text-gray-800 leading-[1.9] text-justify max-w-[65ch]">
                  {opportunity.mentor_areas}
                </div>
              </section>
            )}

            {opportunity.preferred_qualifications && cleanScrapedText(opportunity.preferred_qualifications) && (
              <section className="relative">
                <div className="flex items-center gap-4 mb-6">
                  <span className="w-8 h-[1px] bg-gray-300"></span>
                  <h3 className="text-[11px] font-bold uppercase tracking-widest font-sans text-gray-500">Qualifications</h3>
                </div>
                <div className="text-[17px] text-gray-800 leading-[1.9] text-justify max-w-[65ch] whitespace-pre-wrap">
                  {cleanScrapedText(opportunity.preferred_qualifications)}
                </div>
              </section>
            )}

            {/* Seamless, Minimal Fit Analysis */}
            <section className="relative border-t border-gray-100 pt-16">
              <div className="flex items-center gap-4 mb-8">
                <span className="w-8 h-[1px] bg-[#011F5B]/30"></span>
                <h3 className="text-[11px] font-bold uppercase tracking-widest font-sans text-[#011F5B]">Compatibility Analysis</h3>
              </div>
              
              <div className="max-w-[65ch]">
                 <SkillAnalyzer opportunityId={id} />
              </div>
            </section>

            {/* Seamless, Minimal Email Generation */}
            <section className="relative border-t border-gray-100 pt-16">
              <div className="flex items-center gap-4 mb-8">
                <span className="w-8 h-[1px] bg-[#011F5B]/30"></span>
                <h3 className="text-[11px] font-bold uppercase tracking-widest font-sans text-[#011F5B]">Outreach Protocol</h3>
              </div>

               <div className="max-w-[65ch]">
                 {!generatedEmail ? (
                    <div className="flex flex-col sm:flex-row items-baseline gap-6 border border-gray-100 bg-gray-50/50 p-6 rounded-2xl">
                      <p className="text-[15px] text-gray-600 flex-1 leading-relaxed">
                        Use your established profile vector to automatically generate a precise outreach email to the investigator.
                      </p>
                      {hasProfile ? (
                        <button
                          onClick={() => handleGenerateEmail()}
                          disabled={generatingEmail}
                          className="px-6 py-2.5 bg-white border border-[#011F5B] text-[#011F5B] text-[11px] font-bold uppercase tracking-widest font-sans hover:bg-[#011F5B] hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-full whitespace-nowrap"
                        >
                          {generatingEmail ? 'Drafting...' : 'Generate Draft'}
                        </button>
                      ) : (
                        <Link href="/profile" className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 text-[11px] font-bold uppercase tracking-widest font-sans hover:bg-gray-50 transition-colors rounded-full whitespace-nowrap">
                          Create Profile
                        </Link>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-10 animate-in fade-in duration-700">
                      <div className="space-y-8">
                         <div>
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] font-sans text-gray-400 block mb-3">Subject</span>
                            <div className="font-mono text-[14px] text-gray-900 bg-gray-50/50 px-5 py-4 border-[0.5px] border-gray-200 flex justify-between items-center group rounded-xl">
                               <span>{generatedEmail.subject}</span>
                               <button onClick={() => copyToClipboard(generatedEmail.subject, 'subject')} className="text-[10px] uppercase tracking-widest text-[#011F5B] opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                                 {copied === 'subject' ? 'Copied' : 'Copy'}
                               </button>
                            </div>
                         </div>
                         
                         <div>
                            <div className="flex items-baseline justify-between mb-3">
                               <span className="text-[10px] font-bold uppercase tracking-[0.2em] font-sans text-gray-400 block">Body</span>
                               <button onClick={() => copyToClipboard(generatedEmail.body, 'body')} className="text-[10px] uppercase tracking-widest text-[#011F5B] hover:underline font-bold transition-opacity">
                                 {copied === 'body' ? 'Copied' : 'Copy Body'}
                               </button>
                            </div>
                            <textarea
                              value={generatedEmail.body}
                              onChange={e => setGeneratedEmail({ ...generatedEmail, body: e.target.value })}
                              className="w-full min-h-[400px] bg-transparent border-[0.5px] border-gray-200 p-6 font-mono text-[14px] text-gray-800 focus:outline-none focus:border-gray-400 leading-[1.8] resize-y transition-colors rounded-xl"
                            />
                         </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 border-t border-gray-100 pt-6">
                        <button onClick={() => copyToClipboard(`Subject: ${generatedEmail.subject}\n\n${generatedEmail.body}`, 'body')} className="px-6 py-2 border border-[#011F5B] bg-[#011F5B] text-white text-[11px] font-bold uppercase tracking-widest rounded-full transition-colors hover:bg-[#001033]">
                          Copy Full Payload
                        </button>
                        <button onClick={() => handleGenerateEmail()} className="px-6 py-2 border border-gray-300 bg-transparent text-gray-700 text-[11px] font-bold uppercase tracking-widest rounded-full transition-colors hover:bg-gray-50">
                          Regenerate
                        </button>
                      </div>
                    </div>
                  )}
               </div>
            </section>
          </div>

          {/* Right Column: Metadata */}
          <div className="lg:col-span-4 space-y-16 h-fit pt-2 lg:pt-0">
            
            {/* Contact Info */}
            <div className="space-y-6">
              <h3 className="text-[11px] font-bold uppercase tracking-widest font-sans text-gray-500 block mb-4">Researcher Contact</h3>
              
              <div className="space-y-5">
                {opportunity.researcher_email ? (
                  <div className="group flex items-center gap-3">
                    <span className="font-mono text-[14px] text-[#011F5B] border-b-[0.5px] border-[#011F5B]/30 hover:border-[#011F5B] transition-colors cursor-text pb-0.5">
                       {opportunity.researcher_email}
                    </span>
                    <button onClick={() => copyToClipboard(opportunity.researcher_email!, 'email')} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-[#011F5B]">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    </button>
                  </div>
                ) : <span className="text-gray-500 italic text-[15px]">No email listed</span>}

                <div className="flex flex-col gap-3 pt-4">
                  {isValidUrl(opportunity.researcher_profile_url) && (
                    <a href={opportunity.researcher_profile_url!} target="_blank" rel="noopener noreferrer" className="group text-[14px] font-medium text-gray-800 hover:text-[#011F5B] transition-colors flex items-center w-max gap-1">
                      CURF Profile <span className="text-gray-400 font-sans font-normal group-hover:text-[#011F5B] transition-colors ml-1">↗</span>
                    </a>
                  )}
                  {isValidUrl(opportunity.department_page_url) && (
                    <a href={opportunity.department_page_url!} target="_blank" rel="noopener noreferrer" className="group text-[14px] font-medium text-gray-800 hover:text-[#011F5B] transition-colors flex items-center w-max gap-1">
                      Department Page <span className="text-gray-400 font-sans font-normal group-hover:text-[#011F5B] transition-colors ml-1">↗</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Target Students */}
            <div className="space-y-6 pt-12 border-t border-gray-100">
              <h3 className="text-[11px] font-bold uppercase tracking-widest font-sans text-gray-500 block mb-4">Target Students</h3>
              <div className="flex flex-wrap gap-2">
                {opportunity.preferred_student_years?.map(y => (
                  <span key={y} className="px-3.5 py-1.5 border-[0.5px] border-gray-300 text-gray-700 bg-white text-[10px] font-semibold uppercase tracking-widest font-sans rounded-full">
                    {y}
                  </span>
                ))}
                {opportunity.academic_terms?.map(t => (
                  <span key={t} className="px-3.5 py-1.5 border-[0.5px] border-gray-300 text-gray-700 bg-white text-[10px] font-semibold uppercase tracking-widest font-sans rounded-full">
                    {t}
                  </span>
                ))}
              </div>
            </div>

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
      <div className="flex flex-col sm:flex-row items-baseline gap-6 border border-gray-100 bg-gray-50/50 p-6 rounded-2xl">
        <p className="text-[15px] text-gray-600 flex-1 leading-relaxed">
          Evaluate your profile vector against the required qualifications for this project.
        </p>
        <button
          onClick={handleAnalyze}
          disabled={analyzing}
          className="px-6 py-2.5 bg-white border border-[#011F5B] text-[#011F5B] text-[11px] font-bold uppercase tracking-widest font-sans hover:bg-[#011F5B] hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed min-w-[150px] flex justify-center rounded-full whitespace-nowrap"
        >
          {analyzing ? 'Analyzing...' : 'Execute Analysis'}
        </button>
      </div>
    )
  }

  return (
    <div className="animate-in fade-in duration-700">
      <div className="flex items-center gap-6 mb-6">
        <div className={`text-5xl font-serif tracking-tight ${result.match_score >= 80 ? 'text-[#011F5B]' :
            result.match_score >= 60 ? 'text-gray-800' :
              result.match_score >= 40 ? 'text-gray-500' : 'text-gray-400'
          }`}>
          {result.match_score}%
        </div>
        <div>
          <p className="font-serif text-[18px] text-gray-800 italic">
            {result.match_score >= 80 ? 'Exceptional Fit' :
              result.match_score >= 60 ? 'Strong Candidate' :
                result.match_score >= 40 ? 'Moderate Fit' : 'Low Compatibility'}
          </p>
        </div>
      </div>

      <p className="text-[16px] text-gray-800 leading-[1.9] text-justify mb-8">{result.analysis_text}</p>

      {result.matched_skills.length > 0 && (
         <div className="space-y-4">
           <span className="text-[10px] font-bold uppercase tracking-widest font-sans text-gray-500 block mb-3">Intersecting Vectors</span>
           <div className="flex flex-wrap gap-2">
             {result.matched_skills.map(skill => (
               <span key={skill} className="px-3.5 py-1.5 border-[0.5px] border-[#011F5B]/30 text-[#011F5B] bg-blue-50/30 text-[10px] font-semibold uppercase tracking-widest font-sans rounded-full">
                 {skill}
               </span>
             ))}
           </div>
         </div>
      )}
    </div>
  );
}
