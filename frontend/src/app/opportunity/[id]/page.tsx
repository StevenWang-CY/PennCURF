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
      <div className="flex justify-center items-center min-h-screen bg-[var(--background)]">
        <div className="w-8 h-8 border-[0.5px] border-[#011F5B]/20 border-t-[#011F5B] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="text-center py-40 min-h-screen flex flex-col items-center justify-center bg-[var(--background)]">
        <h1 className="text-2xl font-serif text-[#011F5B] mb-6 tracking-tight">Opportunity Not Found</h1>
        <Link href="/search" className="text-[10px] uppercase tracking-[0.2em] font-sans text-gray-500 hover:text-[#011F5B] transition-colors duration-300">
          Return to directory
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-gray-900 selection:bg-[#011F5B] selection:text-white font-sans">
      {/* Hyper-delicate background noise */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.012] mix-blend-overlay" style={{backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")'}}></div>

      {/* Extreme minimal nav */}
      <nav className="w-full border-b-[0.5px] border-gray-100 relative z-10">
         <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-5 border-b-[0.5px] border-transparent">
            <button
               onClick={() => router.back()}
               className="group flex items-center gap-4 text-[10px] uppercase tracking-[0.2em] font-sans text-gray-400 hover:text-[#011F5B] transition-all duration-500"
            >
               <span className="w-6 h-[0.5px] bg-gray-300 group-hover:bg-[#011F5B] group-hover:w-10 transition-all duration-500"></span>
               Research Directory
            </button>
         </div>
      </nav>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 md:py-24">
        
        {/* Header Ribbon / Title Block */}
        <header className="mb-20 lg:mb-28 max-w-4xl relative">
          <div className="flex flex-wrap items-center gap-4 mb-8">
            {opportunity.is_paid && (
              <span className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[#011F5B]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#011F5B]/20 border-[0.5px] border-[#011F5B]"></span>
                Paid Position
              </span>
            )}
            {opportunity.research_categories?.map(cat => (
               <span key={cat} className="text-[10px] uppercase tracking-[0.2em] text-gray-400">
                 {cat}
               </span>
            ))}
          </div>

          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl leading-[1.05] text-[#011F5B] mb-10 tracking-tight font-light">
            {opportunity.title}
          </h1>

          <div className="flex flex-col sm:flex-row sm:items-baseline gap-3 text-[16px] font-sans text-gray-500 font-light">
            {opportunity.researcher_name && <span className="text-[#011F5B] tracking-wide">{opportunity.researcher_name}</span>}
            {opportunity.researcher_name && opportunity.researcher_title && <span className="hidden sm:inline text-gray-300">/</span>}
            {opportunity.researcher_title && <span>{opportunity.researcher_title}</span>}
          </div>
        </header>

        {/* 2-Column Academic Gallery Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">

          {/* Left Column: Continuous Reading Pane */}
          <div className="lg:col-span-8 space-y-20">
            
               {opportunity.description && (
                 <section className="relative group">
                   <div className="absolute left-[-2rem] top-2 bottom-0 w-[0.5px] bg-gray-100 group-hover:bg-[#011F5B]/10 transition-colors hidden sm:block"></div>
                   <h3 className="text-2xl font-serif text-[#011F5B] mb-6 font-light">Project Overview</h3>
                   <div className="text-[16px] text-gray-700 leading-[1.85] max-w-[65ch] whitespace-pre-wrap font-serif font-light" style={{ fontFamily: 'Georgia, serif' }}>
                     {opportunity.description}
                   </div>
                 </section>
               )}

               {opportunity.mentor_areas && (
                 <section className="relative group">
                   <div className="absolute left-[-2rem] top-2 bottom-0 w-[0.5px] bg-gray-100 group-hover:bg-[#011F5B]/10 transition-colors hidden sm:block"></div>
                   <h3 className="text-2xl font-serif text-[#011F5B] mb-6 font-light">Research Areas</h3>
                   <div className="text-[16px] text-gray-700 leading-[1.85] max-w-[65ch] font-serif font-light" style={{ fontFamily: 'Georgia, serif' }}>
                     {opportunity.mentor_areas}
                   </div>
                 </section>
               )}

               {opportunity.preferred_qualifications && cleanScrapedText(opportunity.preferred_qualifications) && (
                 <section className="relative group">
                   <div className="absolute left-[-2rem] top-2 bottom-0 w-[0.5px] bg-gray-100 group-hover:bg-[#011F5B]/10 transition-colors hidden sm:block"></div>
                   <h3 className="text-2xl font-serif text-[#011F5B] mb-6 font-light">Qualifications</h3>
                   <div className="text-[16px] text-gray-700 leading-[1.85] max-w-[65ch] whitespace-pre-wrap font-serif font-light" style={{ fontFamily: 'Georgia, serif' }}>
                     {cleanScrapedText(opportunity.preferred_qualifications)}
                   </div>
                 </section>
               )}


            {/* Delicate Feature Boxes (Fit Analysis & Email) */}
            <div className="pt-8 space-y-12">
               
               {/* Box 1: Compatibility Engine */}
               <section className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.02)] border-[0.5px] border-[#011F5B]/10 p-8 sm:p-12 relative overflow-hidden transition-all duration-500 hover:shadow-[0_8px_30px_rgb(1,31,91,0.04)]">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50/50 rounded-full mix-blend-multiply blur-3xl pointer-events-none"></div>
                 
                 <div className="relative z-10 w-full">
                    <h3 className="text-xl font-serif text-[#011F5B] mb-8 font-light italic">Compatibility Engine</h3>
                    <SkillAnalyzer opportunityId={id} />
                 </div>
               </section>

               {/* Box 2: Outreach Protocol */}
               <section className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.02)] border-[0.5px] border-[#011F5B]/10 p-8 sm:p-12 relative overflow-hidden transition-all duration-500 hover:shadow-[0_8px_30px_rgb(1,31,91,0.04)]">
                 <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-blue-50/40 via-transparent to-transparent opacity-60 rounded-full mix-blend-multiply pointer-events-none transform translate-x-1/3 -translate-y-1/3"></div>

                 <div className="relative z-10 w-full">
                   <h3 className="text-xl font-serif text-[#011F5B] mb-8 font-light italic">Outreach Protocol</h3>

                   {!generatedEmail ? (
                      <div className="flex flex-col gap-8">
                        <p className="font-serif text-[16px] text-gray-600 leading-[1.85] max-w-[60ch] font-light" style={{ fontFamily: 'Georgia, serif' }}>
                          Synthesize your profile vector array into a highly-calibrated, professional email draft. This protocol bridges the gap between your established prerequisites and the project requirements.
                        </p>
                        {hasProfile ? (
                          <button
                            onClick={() => handleGenerateEmail()}
                            disabled={generatingEmail}
                            className="w-fit flex items-center justify-between gap-6 py-3 px-8 border-[0.5px] border-[#011F5B]/30 bg-transparent hover:bg-slate-50 text-[#011F5B] text-[10px] uppercase tracking-[0.2em] rounded-full transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed font-sans"
                          >
                            {generatingEmail ? (
                               <>
                                 <div className="w-3 h-3 border-[0.5px] border-[#011F5B]/30 border-t-[#011F5B] rounded-full animate-spin"></div>
                                 Synthesizing Draft
                               </>
                            ) : 'Initialize Draft'}
                          </button>
                        ) : (
                          <Link href="/profile" className="w-fit flex items-center justify-between gap-6 py-3 px-8 border-[0.5px] border-[#011F5B]/30 bg-transparent hover:bg-slate-50 text-[#011F5B] text-[10px] uppercase tracking-[0.2em] rounded-full transition-all duration-500 font-sans">
                            Establish Profile
                          </Link>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-10 animate-in fade-in duration-700">
                        <div className="space-y-8">
                           <div className="border-b-[0.5px] border-gray-100 pb-6 flex flex-col gap-3 group">
                              <div className="flex justify-between items-center">
                                <span className="text-[9px] uppercase tracking-[0.2em] text-[#011F5B]/40 block font-sans">Subject Payload</span>
                                <button onClick={() => copyToClipboard(generatedEmail.subject, 'subject')} className="text-[9px] uppercase tracking-[0.2em] text-[#011F5B]/60 hover:text-[#011F5B] transition-all opacity-0 group-hover:opacity-100 font-sans">
                                  {copied === 'subject' ? 'Copied' : 'Copy'}
                                </button>
                              </div>
                              <span className="font-serif text-[17px] text-gray-800 font-light" style={{ fontFamily: 'Georgia, serif' }}>{generatedEmail.subject}</span>
                           </div>
                           
                           <div className="group relative">
                              <div className="flex justify-between items-center mb-6">
                                <span className="text-[9px] uppercase tracking-[0.2em] text-[#011F5B]/40 block font-sans">Body Syntax</span>
                                <button onClick={() => copyToClipboard(generatedEmail.body, 'body')} className="text-[9px] uppercase tracking-[0.2em] text-[#011F5B]/60 hover:text-[#011F5B] transition-all opacity-0 group-hover:opacity-100 font-sans">
                                  {copied === 'body' ? 'Copied' : 'Copy Payload'}
                                </button>
                              </div>
                              <textarea
                                value={generatedEmail.body}
                                onChange={e => setGeneratedEmail({ ...generatedEmail, body: e.target.value })}
                                className="w-full min-h-[400px] bg-transparent border-[0.5px] border-gray-200 rounded-xl p-8 font-serif text-[15px] text-gray-700 font-light leading-[1.9] resize-y focus:outline-none focus:border-[#011F5B]/30 focus:bg-white transition-colors" style={{ fontFamily: 'Georgia, serif' }}
                              />
                           </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 pt-2">
                          <button onClick={() => copyToClipboard(`Subject: ${generatedEmail.subject}\n\n${generatedEmail.body}`, 'body')} className="py-3 px-8 bg-[#011F5B] text-white text-[10px] uppercase tracking-[0.2em] rounded-full hover:bg-[#001033] transition-all duration-500 font-sans shadow-sm">
                            Copy Final Output
                          </button>
                          <button onClick={() => handleGenerateEmail()} className="py-3 px-8 bg-transparent border-[0.5px] border-gray-300 text-gray-500 text-[10px] uppercase tracking-[0.2em] rounded-full hover:bg-gray-50 hover:text-gray-900 transition-all duration-500 font-sans">
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
                 <div className="flex items-center gap-4 mb-6">
                    <h3 className="text-[17px] font-serif italic text-gray-400 font-light block">Investigator</h3>
                    <span className="flex-1 h-[0.5px] bg-gray-100"></span>
                 </div>
                 
                 <div className="space-y-6">
                   {opportunity.researcher_email ? (
                     <div className="group flex items-center gap-3">
                       <span className="font-sans text-[14px] text-gray-700 font-light tracking-wide selection:bg-blue-50">
                          {opportunity.researcher_email}
                       </span>
                       <button onClick={() => copyToClipboard(opportunity.researcher_email!, 'email')} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-[#011F5B] ml-auto">
                         <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                       </button>
                     </div>
                   ) : <span className="text-gray-400 font-serif text-[14px] italic font-light">No direct line listed</span>}
   
                   <div className="flex flex-col gap-0">
                     {isValidUrl(opportunity.researcher_profile_url) && (
                       <a href={opportunity.researcher_profile_url!} target="_blank" rel="noopener noreferrer" className="group text-[14px] font-light font-sans text-gray-500 hover:text-[#011F5B] transition-colors flex items-center justify-between w-full py-4 border-b-[0.5px] border-gray-100">
                         External Profile <span className="text-gray-300 group-hover:text-[#011F5B] transition-colors ml-1 font-light">↗</span>
                       </a>
                     )}
                     {isValidUrl(opportunity.department_page_url) && (
                       <a href={opportunity.department_page_url!} target="_blank" rel="noopener noreferrer" className="group text-[14px] font-light font-sans text-gray-500 hover:text-[#011F5B] transition-colors flex items-center justify-between w-full py-4 border-b-[0.5px] border-gray-100">
                         Department Page <span className="text-gray-300 group-hover:text-[#011F5B] transition-colors ml-1 font-light">↗</span>
                       </a>
                     )}
                   </div>
                 </div>
               </div>
   
               {/* Classifications Rail */}
               <div className="space-y-6 pt-6">
                 <div className="flex items-center gap-4 mb-6">
                    <h3 className="text-[17px] font-serif italic text-gray-400 font-light block">Classification</h3>
                    <span className="flex-1 h-[0.5px] bg-gray-100"></span>
                 </div>
                 
                 <div className="flex flex-col gap-8">
                    {opportunity.preferred_student_years?.length ? (
                       <div className="flex flex-col gap-4">
                          <span className="text-[9px] text-gray-400 uppercase tracking-[0.2em] font-sans">Target Years</span>
                          <div className="flex flex-wrap gap-2">
                            {opportunity.preferred_student_years.map(year => (
                              <span key={year} className="bg-transparent border-[0.5px] border-gray-200 text-gray-500 text-[11px] font-light uppercase tracking-widest px-4 py-1.5 rounded-full font-sans transition-colors hover:border-gray-400">
                                {year}
                              </span>
                            ))}
                          </div>
                       </div>
                    ) : null}

                    {opportunity.academic_terms?.length ? (
                       <div className="flex flex-col gap-4">
                          <span className="text-[9px] text-gray-400 uppercase tracking-[0.2em] font-sans">Academic Terms</span>
                          <div className="flex flex-wrap gap-2">
                            {opportunity.academic_terms.map(term => (
                              <span key={term} className="bg-transparent border-[0.5px] border-[#011F5B]/20 text-[#011F5B]/80 text-[11px] font-light uppercase tracking-widest px-4 py-1.5 rounded-full font-sans transition-colors hover:border-[#011F5B]/50">
                                {term}
                              </span>
                            ))}
                          </div>
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
        <p className="font-serif text-[16px] text-gray-600 leading-[1.85] max-w-[60ch] font-light" style={{ fontFamily: 'Georgia, serif' }}>
          Execute the cross-calibration function to match your profile vector against the technical prerequisites of this project.
        </p>
        <button
          onClick={handleAnalyze}
          disabled={analyzing}
          className="w-fit flex items-center justify-between gap-6 py-3 px-8 border-[0.5px] border-[#011F5B]/30 bg-transparent hover:bg-slate-50 text-[#011F5B] text-[10px] uppercase tracking-[0.2em] rounded-full transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed font-sans"
        >
          {analyzing ? (
             <>
               <div className="w-3 h-3 border-[0.5px] border-[#011F5B]/30 border-t-[#011F5B] rounded-full animate-spin"></div>
               Calibrating Array
             </>
          ) : 'Run Calibration'}
        </button>
      </div>
    )
  }

  return (
    <div className="animate-in fade-in duration-700 w-full">
      <div className="flex flex-wrap items-end gap-6 mb-8 pb-8 border-b-[0.5px] border-gray-100">
        <div className={`text-6xl sm:text-7xl font-serif tracking-tight leading-none font-light ${result.match_score >= 80 ? 'text-[#011F5B]' :
            result.match_score >= 60 ? 'text-gray-700' :
              result.match_score >= 40 ? 'text-gray-500' : 'text-gray-300'
          }`}>
          {result.match_score}%
        </div>
        <div className="pb-1 sm:pb-2">
          <p className="font-sans font-medium uppercase tracking-[0.25em] text-[8px] text-gray-400 mb-2 block">Match Score</p>
          <p className="font-sans text-[16px] font-light text-gray-800 tracking-wide">
            {result.match_score >= 80 ? 'Exceptional Fit' :
              result.match_score >= 60 ? 'Strong Candidate' :
                result.match_score >= 40 ? 'Moderate Fit' : 'Low Compatibility'}
          </p>
        </div>
      </div>

      <p className="text-[16px] text-gray-700 font-serif font-light leading-[1.85] mb-10" style={{ fontFamily: 'Georgia, serif' }}>{result.analysis_text}</p>

      {result.matched_skills.length > 0 && (
         <div className="pt-2">
           <span className="text-[9px] uppercase tracking-[0.2em] text-[#011F5B]/50 block mb-4 font-sans">Correlated Skills</span>
           <div className="flex flex-wrap gap-2.5">
             {result.matched_skills.map(skill => (
               <span key={skill} className="px-3 py-1 bg-transparent border-[0.5px] border-[#011F5B]/20 text-[#011F5B]/80 text-[10px] font-light tracking-widest font-sans rounded-full">
                 {skill}
               </span>
             ))}
           </div>
         </div>
      )}
    </div>
  );
}
