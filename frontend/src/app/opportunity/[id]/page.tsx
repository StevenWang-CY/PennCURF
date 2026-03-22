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
        <div className="w-10 h-10 border-[1px] border-gray-100 border-t-gray-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="text-center py-40 min-h-screen flex flex-col items-center justify-center bg-white">
        <h1 className="text-3xl font-serif text-gray-900 mb-6 tracking-tight">Opportunity Not Found</h1>
        <Link href="/search" className="text-[11px] font-semibold uppercase tracking-[0.2em] font-sans text-gray-400 hover:text-gray-900 transition-colors duration-300">
          Return to directory
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-gray-100 selection:text-black font-sans">

      {/* Extreme minimal nav */}
      <nav className="w-full border-b-[0.5px] border-gray-100/50">
         <div className="max-w-6xl mx-auto px-6 sm:px-12 py-6">
            <button
               onClick={() => router.back()}
               className="group flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.2em] font-sans text-gray-400 hover:text-gray-900 transition-all duration-300"
            >
               <span className="w-8 h-[1px] bg-gray-200 group-hover:bg-gray-400 group-hover:w-12 transition-all duration-500"></span>
               Research Directory
            </button>
         </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-6 sm:px-12 py-16 md:py-24">
        
        {/* Header Ribbon / Title Block */}
        <header className="mb-24 lg:mb-32 max-w-4xl relative">
          <div className="flex flex-wrap items-center gap-3 mb-8">
            {opportunity.is_paid && (
              <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-900">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-800"></span>
                Paid Position
              </span>
            )}
            {opportunity.research_categories?.map(cat => (
               <span key={cat} className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">
                 {cat}
               </span>
            ))}
          </div>

          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl leading-[1.05] text-gray-900 mb-10 tracking-tight">
            {opportunity.title}
          </h1>

          <div className="flex flex-col sm:flex-row sm:items-baseline gap-3 text-[15px] font-sans text-gray-600">
            {opportunity.researcher_name && <span className="font-medium text-gray-900 tracking-wide">{opportunity.researcher_name}</span>}
            {opportunity.researcher_name && opportunity.researcher_title && <span className="hidden sm:inline text-gray-300 font-light">/</span>}
            {opportunity.researcher_title && <span className="font-light">{opportunity.researcher_title}</span>}
          </div>
        </header>

        {/* 2-Column Academic Gallery Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">

          {/* Left Column: Continuous Reading Pane */}
          <div className="lg:col-span-8 space-y-20">
            
               {opportunity.description && (
                 <section>
                   <div className="flex items-center gap-6 mb-8">
                     <h3 className="text-[11px] font-semibold uppercase tracking-[0.25em] font-sans text-gray-400/90 whitespace-nowrap">Project Overview</h3>
                     <span className="w-full h-[1px] bg-gray-100/80"></span>
                   </div>
                   <div className="text-[15px] sm:text-[16px] text-gray-600 leading-[1.8] font-light max-w-[65ch] whitespace-pre-wrap">
                     {opportunity.description}
                   </div>
                 </section>
               )}

               {opportunity.mentor_areas && (
                 <section>
                   <div className="flex items-center gap-6 mb-8">
                     <h3 className="text-[11px] font-semibold uppercase tracking-[0.25em] font-sans text-gray-400/90 whitespace-nowrap">Research Areas</h3>
                     <span className="w-full h-[1px] bg-gray-100/80"></span>
                   </div>
                   <div className="text-[15px] sm:text-[16px] text-gray-600 leading-[1.8] font-light max-w-[65ch]">
                     {opportunity.mentor_areas}
                   </div>
                 </section>
               )}

               {opportunity.preferred_qualifications && cleanScrapedText(opportunity.preferred_qualifications) && (
                 <section>
                   <div className="flex items-center gap-6 mb-8">
                     <h3 className="text-[11px] font-semibold uppercase tracking-[0.25em] font-sans text-gray-400/90 whitespace-nowrap">Qualifications</h3>
                     <span className="w-full h-[1px] bg-gray-100/80"></span>
                   </div>
                   <div className="text-[15px] sm:text-[16px] text-gray-600 leading-[1.8] font-light max-w-[65ch] whitespace-pre-wrap">
                     {cleanScrapedText(opportunity.preferred_qualifications)}
                   </div>
                 </section>
               )}


            {/* Technical Consoles (Fit Analysis & Email) */}
            <div className="pt-16 space-y-16 border-t-[0.5px] border-gray-100/80">
               
               {/* Console 1: Compatibility */}
               <section>
                 <div className="flex items-center gap-6 mb-10">
                   <h3 className="text-[11px] font-semibold uppercase tracking-[0.25em] font-sans text-gray-900 whitespace-nowrap">Compatibility Engine</h3>
                 </div>
                 
                 <div className="w-full max-w-[65ch] border-[0.5px] border-gray-200 bg-gray-50/30 p-8 sm:p-12 relative">
                    {/* Subtle corner ticks for technical feel */}
                    <div className="absolute top-0 left-0 w-2 h-2 border-t-[0.5px] border-l-[0.5px] border-gray-400"></div>
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b-[0.5px] border-r-[0.5px] border-gray-400"></div>

                    <SkillAnalyzer opportunityId={id} />
                 </div>
               </section>

               {/* Console 2: Deployment */}
               <section>
                 <div className="flex items-center gap-6 mb-10">
                   <h3 className="text-[11px] font-semibold uppercase tracking-[0.25em] font-sans text-gray-900 whitespace-nowrap">Outreach Protocol</h3>
                 </div>

                 <div className="w-full max-w-[65ch] border-[0.5px] border-gray-200 bg-gray-50/30 p-8 sm:p-12 relative">
                    <div className="absolute top-0 left-0 w-2 h-2 border-t-[0.5px] border-l-[0.5px] border-gray-400"></div>
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b-[0.5px] border-r-[0.5px] border-gray-400"></div>

                   {!generatedEmail ? (
                      <div className="flex flex-col gap-6">
                        <p className="font-sans text-[15px] font-light text-gray-500 leading-[1.8]">
                          Synthesize your profile vector array into a highly-calibrated, professional email draft. This protocol bridges the gap between your established prerequisites and the project requirements.
                        </p>
                        {hasProfile ? (
                          <button
                            onClick={() => handleGenerateEmail()}
                            disabled={generatingEmail}
                            className="w-fit flex items-center justify-between gap-8 py-3 px-6 border-[0.5px] border-gray-300 bg-white hover:border-gray-900 hover:bg-gray-900 hover:text-white text-gray-800 text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {generatingEmail ? 'Synthesizing...' : 'Initialize Draft'}
                            {!generatingEmail && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>}
                          </button>
                        ) : (
                          <Link href="/profile" className="w-fit flex items-center justify-between gap-8 py-3 px-6 border-[0.5px] border-gray-300 bg-white hover:border-gray-900 hover:bg-gray-900 hover:text-white text-gray-800 text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300">
                            Establish Profile Vector
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                          </Link>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-10 animate-in fade-in duration-500">
                        <div className="space-y-6">
                           <div className="border-b-[0.5px] border-gray-200 pb-4 flex justify-between items-end group">
                              <div>
                                <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-gray-400 block mb-2">Subject Payload</span>
                                <span className="font-mono text-[13px] text-gray-900">{generatedEmail.subject}</span>
                              </div>
                              <button onClick={() => copyToClipboard(generatedEmail.subject, 'subject')} className="text-[9px] uppercase tracking-widest text-gray-500 hover:text-gray-900 font-bold transition-all opacity-0 group-hover:opacity-100">
                                {copied === 'subject' ? 'Copied' : 'Copy'}
                              </button>
                           </div>
                           
                           <div className="group relative pt-2">
                              <div className="flex justify-between items-center mb-4">
                                <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-gray-400 block">Body Syntax</span>
                                <button onClick={() => copyToClipboard(generatedEmail.body, 'body')} className="text-[9px] uppercase tracking-widest text-gray-500 hover:text-gray-900 font-bold transition-all opacity-0 group-hover:opacity-100">
                                  {copied === 'body' ? 'Copied' : 'Copy Payload'}
                                </button>
                              </div>
                              <textarea
                                value={generatedEmail.body}
                                onChange={e => setGeneratedEmail({ ...generatedEmail, body: e.target.value })}
                                className="w-full min-h-[400px] bg-white border-[0.5px] border-gray-200 p-6 font-mono text-[13px] text-gray-700 leading-[1.8] resize-y focus:outline-none focus:border-gray-400 transition-colors shadow-[rgba(0,0,0,0.02)_0px_2px_8px_inset]"
                              />
                           </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 pt-4">
                          <button onClick={() => copyToClipboard(`Subject: ${generatedEmail.subject}\n\n${generatedEmail.body}`, 'body')} className="py-3 px-6 bg-gray-900 text-white text-[10px] font-bold uppercase tracking-[0.2em] transition-all hover:bg-black">
                            Copy Final Output
                          </button>
                          <button onClick={() => handleGenerateEmail()} className="py-3 px-6 bg-transparent border-[0.5px] border-gray-300 text-gray-600 text-[10px] font-bold uppercase tracking-[0.2em] transition-all hover:bg-gray-100 hover:text-gray-900">
                            Regenerate
                          </button>
                        </div>
                      </div>
                    )}
                 </div>
               </section>
            </div>
          </div>

          {/* Right Column: Metadata Rail */}
          <div className="lg:col-span-4 h-fit">
            
            <div className="lg:sticky lg:top-24 space-y-16 pr-4">
               
               {/* Principal Investigator */}
               <div className="space-y-6">
                 <h3 className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-400/90 whitespace-nowrap mb-6">Principal Investigator</h3>
                 
                 <div className="space-y-4">
                   {opportunity.researcher_email ? (
                     <div className="group flex items-center gap-3">
                       <span className="font-sans text-[14px] text-gray-900 font-medium py-1 selection:bg-gray-200 relative after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-full after:bg-gray-200 hover:after:bg-gray-900 after:transition-colors">
                          {opportunity.researcher_email}
                       </span>
                       <button onClick={() => copyToClipboard(opportunity.researcher_email!, 'email')} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-900">
                         <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                       </button>
                     </div>
                   ) : <span className="text-gray-400 font-light text-[14px] italic">No direct line listed</span>}
   
                   <div className="flex flex-col gap-0 pt-6">
                     {isValidUrl(opportunity.researcher_profile_url) && (
                       <a href={opportunity.researcher_profile_url!} target="_blank" rel="noopener noreferrer" className="group text-[13px] font-light text-gray-500 hover:text-gray-900 transition-colors flex items-center justify-between w-full py-4 border-b-[0.5px] border-gray-100 hover:border-gray-300">
                         External Profile <span className="text-gray-400 group-hover:text-gray-900 transition-colors ml-1">↗</span>
                       </a>
                     )}
                     {isValidUrl(opportunity.department_page_url) && (
                       <a href={opportunity.department_page_url!} target="_blank" rel="noopener noreferrer" className="group text-[13px] font-light text-gray-500 hover:text-gray-900 transition-colors flex items-center justify-between w-full py-4 border-b-[0.5px] border-gray-100 hover:border-gray-300">
                         Department Page <span className="text-gray-400 group-hover:text-gray-900 transition-colors ml-1">↗</span>
                       </a>
                     )}
                   </div>
                 </div>
               </div>
   
               {/* Classifications Rail */}
               <div className="space-y-6 pt-2">
                 <h3 className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-400/90 whitespace-nowrap mb-6">Classifications</h3>
                 
                 <div className="flex flex-col gap-2">
                    {/* Combine into a unified comma-separated text list rather than massive pills */}
                    {opportunity.preferred_student_years?.length ? (
                       <div className="flex items-start gap-4 py-3 border-b-[0.5px] border-gray-100">
                          <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest w-20 shrink-0">Years</span>
                          <span className="text-[13px] font-light text-gray-600 leading-relaxed">
                             {opportunity.preferred_student_years.join(', ')}
                          </span>
                       </div>
                    ) : null}

                    {opportunity.academic_terms?.length ? (
                       <div className="flex items-start gap-4 py-3 border-b-[0.5px] border-gray-100">
                          <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest w-20 shrink-0">Terms</span>
                          <span className="text-[13px] font-light text-gray-600 leading-relaxed">
                             {opportunity.academic_terms.join(', ')}
                          </span>
                       </div>
                    ) : null}
                 </div>
               </div>
            </div>

          </div>
        </div>
      </main>
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
      <div className="flex flex-col gap-8">
        <p className="font-sans text-[15px] font-light text-gray-500 leading-[1.8]">
          Execute cross-calibration function to match your profile vector against the technical prerequisites of this project layout.
        </p>
        <button
          onClick={handleAnalyze}
          disabled={analyzing}
          className="w-fit flex items-center justify-between gap-8 py-3 px-6 border-[0.5px] border-gray-300 bg-white hover:border-gray-900 hover:bg-gray-900 hover:text-white text-gray-800 text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {analyzing ? 'Calibrating...' : 'Run Calibration'}
          {!analyzing && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>}
        </button>
      </div>
    )
  }

  return (
    <div className="animate-in fade-in duration-700 w-full">
      <div className="flex flex-wrap items-end gap-6 mb-8 pb-8 border-b-[0.5px] border-gray-200">
        <div className={`text-6xl font-serif tracking-tight leading-none ${result.match_score >= 80 ? 'text-gray-900' :
            result.match_score >= 60 ? 'text-gray-700' :
              result.match_score >= 40 ? 'text-gray-500' : 'text-gray-300'
          }`}>
          {result.match_score}%
        </div>
        <div className="pb-1">
          <p className="font-sans font-semibold uppercase tracking-[0.25em] text-[9px] text-gray-400 mb-1 block">Vector Match</p>
          <p className="font-sans text-[16px] font-medium text-gray-900 tracking-wide">
            {result.match_score >= 80 ? 'High Confidence' :
              result.match_score >= 60 ? 'Probable Alignment' :
                result.match_score >= 40 ? 'Marginal Match' : 'Deficient'}
          </p>
        </div>
      </div>

      <p className="text-[15px] text-gray-600 font-light leading-[1.8] mb-10">{result.analysis_text}</p>

      {result.matched_skills.length > 0 && (
         <div className="pt-2">
           <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-gray-400 block mb-4">Confirmed Vectors</span>
           <div className="flex flex-wrap gap-2">
             {result.matched_skills.map(skill => (
               <span key={skill} className="px-3 py-1.5 border-[0.5px] border-gray-300 bg-white text-gray-700 text-[10px] font-bold uppercase tracking-[0.15em] font-sans">
                 {skill}
               </span>
             ))}
           </div>
         </div>
      )}
    </div>
  );
}
