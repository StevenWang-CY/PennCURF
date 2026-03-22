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
        <div className="w-10 h-10 border-[3px] border-gray-100 border-t-[#011F5B] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="text-center py-40 min-h-screen flex flex-col items-center justify-center bg-[var(--background)]">
        <h1 className="text-3xl font-serif text-[#011F5B] mb-6">Opportunity Not Found</h1>
        <Link href="/search" className="text-xs font-semibold uppercase tracking-[0.2em] font-sans text-gray-500 hover:text-[#011F5B] transition-colors duration-300">
          Return to directory
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[#011F5B] selection:bg-[#011F5B] selection:text-white font-sans">
      
      {/* Hyper-delicate background noise */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.015] mix-blend-overlay" style={{backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")'}}></div>

      {/* Extremely subtle color wash */}
      <div className="fixed inset-0 overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-5%] right-[-5%] w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] bg-blue-50/30 rounded-full mix-blend-multiply filter blur-[140px] animate-blob"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 md:py-24">
        
        {/* Navigation */}
        <div className="mb-16">
          <button
            onClick={() => router.back()}
            className="group flex items-center gap-3 text-xs font-bold uppercase tracking-[0.15em] font-sans text-gray-400 hover:text-[#011F5B] transition-colors duration-300"
          >
            <svg className="w-4 h-4 transform group-hover:-translate-x-1.5 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" /></svg>
            Research Directory
          </button>
        </div>

        {/* Editorial Header Bento */}
        <header className="bg-white rounded-[2rem] p-10 lg:p-14 bento-shadow border-[0.5px] border-gray-100 mb-10 w-full relative overflow-hidden">
          <div className="absolute top-[-50%] right-[-10%] w-[40%] h-[150%] bg-[#011F5B]/3 rounded-full mix-blend-multiply filter blur-[80px] pointer-events-none"></div>
          
          <div className="relative z-10 max-w-4xl">
             <div className="flex flex-wrap gap-2 mb-8">
               {opportunity.is_paid && (
                 <span className="px-3.5 py-1.5 border-[0.5px] border-emerald-200/60 bg-emerald-50/50 text-emerald-700 text-[10px] font-bold uppercase tracking-[0.15em] font-sans rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.01)]">
                   Paid Position
                 </span>
               )}
               {opportunity.research_categories?.map(cat => (
                 <span key={cat} className="px-3.5 py-1.5 border-[0.5px] border-gray-200/80 text-gray-600 bg-white text-[10px] font-bold uppercase tracking-[0.15em] font-sans rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                   {cat}
                 </span>
               ))}
             </div>

             <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl leading-[1.05] text-[#011F5B] mb-8 tracking-tight">
               {opportunity.title}
             </h1>

             <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 text-lg font-sans text-gray-700">
               {opportunity.researcher_name && <span className="font-medium text-[#011F5B]">{opportunity.researcher_name}</span>}
               {opportunity.researcher_name && opportunity.researcher_title && <span className="hidden sm:inline text-gray-300">|</span>}
               {opportunity.researcher_title && <span className="text-gray-500">{opportunity.researcher_title}</span>}
             </div>
          </div>
        </header>

        {/* Content Body Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Left Column: Details Arrays */}
          <div className="lg:col-span-8 space-y-10">
            
            <div className="bg-white rounded-[2rem] p-10 lg:p-12 bento-shadow border-[0.5px] border-gray-100 flex flex-col gap-14">
               {opportunity.description && (
                 <section className="relative">
                   <div className="flex items-center gap-4 mb-6">
                     <span className="w-8 h-[1px] bg-[#011F5B]/20"></span>
                     <h3 className="text-[13px] font-bold uppercase tracking-[0.15em] font-sans text-[#011F5B]">Project Overview</h3>
                   </div>
                   <div className="font-sans text-[17px] text-gray-700 leading-[1.8] max-w-[70ch] whitespace-pre-wrap">
                     {opportunity.description}
                   </div>
                 </section>
               )}

               {opportunity.mentor_areas && (
                 <section className="relative pt-10 border-t-[0.5px] border-gray-100/80">
                   <div className="flex items-center gap-4 mb-6">
                     <span className="w-8 h-[1px] bg-[#011F5B]/20"></span>
                     <h3 className="text-[13px] font-bold uppercase tracking-[0.15em] font-sans text-[#011F5B]">Research Areas</h3>
                   </div>
                   <div className="font-sans text-[17px] text-gray-700 leading-[1.8] max-w-[70ch]">
                     {opportunity.mentor_areas}
                   </div>
                 </section>
               )}

               {opportunity.preferred_qualifications && cleanScrapedText(opportunity.preferred_qualifications) && (
                 <section className="relative pt-10 border-t-[0.5px] border-gray-100/80">
                   <div className="flex items-center gap-4 mb-6">
                     <span className="w-8 h-[1px] bg-[#011F5B]/20"></span>
                     <h3 className="text-[13px] font-bold uppercase tracking-[0.15em] font-sans text-[#011F5B]">Qualifications</h3>
                   </div>
                   <div className="font-sans text-[17px] text-gray-700 leading-[1.8] max-w-[70ch] whitespace-pre-wrap">
                     {cleanScrapedText(opportunity.preferred_qualifications)}
                   </div>
                 </section>
               )}
            </div>

            {/* Smart Fit Analysis Bento */}
            <div className="bg-white rounded-[2rem] p-10 lg:p-12 bento-shadow border-[0.5px] border-gray-100 relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#011F5B]/5 rounded-full mix-blend-multiply blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
              
              <div className="flex items-center gap-4 mb-8">
                <span className="w-8 h-[1px] bg-[#011F5B]/20"></span>
                <h3 className="text-[13px] font-bold uppercase tracking-[0.15em] font-sans text-[#011F5B]">Compatibility Engine</h3>
              </div>
              
              <div className="relative z-10 w-full">
                 <SkillAnalyzer opportunityId={id} />
              </div>
            </div>

            {/* Outreach Protocol Bento */}
             <div className="bg-white rounded-[2rem] p-10 lg:p-12 bento-shadow border-[0.5px] border-gray-100 relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500">
               <div className="absolute top-0 left-0 w-64 h-64 bg-[#990000]/5 rounded-full mix-blend-multiply blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

              <div className="flex items-center gap-4 mb-8">
                <span className="w-8 h-[1px] bg-[#011F5B]/20"></span>
                <h3 className="text-[13px] font-bold uppercase tracking-[0.15em] font-sans text-[#011F5B]">Outreach Protocol</h3>
              </div>

               <div className="relative z-10 w-full">
                 {!generatedEmail ? (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                      <p className="font-sans text-[17px] text-gray-600 flex-1 leading-[1.8]">
                        Instantly deploy a precision-crafted outreach email to the investigator based strictly on your academic vector mapping.
                      </p>
                      {hasProfile ? (
                        <button
                          onClick={() => handleGenerateEmail()}
                          disabled={generatingEmail}
                          className="px-8 py-3.5 bg-[#011F5B] text-white text-[12px] font-bold uppercase tracking-[0.15em] font-sans hover:shadow-[0_6px_20px_rgba(1,31,91,0.25)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-full whitespace-nowrap flex items-center gap-3"
                        >
                          {generatingEmail ? (
                             <>
                               <div className="w-4 h-4 border-[2px] border-white/30 border-t-white rounded-full animate-spin"></div>
                               Drafting Matrix...
                             </>
                          ) : 'Generate Draft'}
                        </button>
                      ) : (
                        <Link href="/profile" className="px-8 py-3.5 bg-white border border-gray-200 text-[#011F5B] text-[12px] font-bold uppercase tracking-[0.15em] font-sans hover:bg-gray-50 hover:-translate-y-0.5 shadow-[0_2px_10px_rgba(0,0,0,0.04)] transition-all duration-300 rounded-full whitespace-nowrap">
                          Create Profile
                        </Link>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-8 animate-in fade-in duration-500">
                      <div className="space-y-6">
                         <div>
                            <span className="text-[11px] font-bold uppercase tracking-[0.15em] font-sans text-gray-400 block mb-2">Subject</span>
                            <div className="font-mono text-[14px] text-[#011F5B] bg-blue-50/30 px-5 py-4 border-[0.5px] border-[#011F5B]/10 flex justify-between items-center group rounded-[1rem]">
                               <span>{generatedEmail.subject}</span>
                               <button onClick={() => copyToClipboard(generatedEmail.subject, 'subject')} className="text-[11px] uppercase tracking-widest text-[#011F5B] opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                                 {copied === 'subject' ? 'Copied' : 'Copy'}
                               </button>
                            </div>
                         </div>
                         
                         <div>
                            <div className="flex items-baseline justify-between mb-2">
                               <span className="text-[11px] font-bold uppercase tracking-[0.15em] font-sans text-gray-400 block">Body</span>
                               <button onClick={() => copyToClipboard(generatedEmail.body, 'body')} className="text-[11px] uppercase tracking-widest text-[#011F5B] hover:underline font-bold transition-opacity">
                                 {copied === 'body' ? 'Copied' : 'Copy Body'}
                               </button>
                            </div>
                            <textarea
                              value={generatedEmail.body}
                              onChange={e => setGeneratedEmail({ ...generatedEmail, body: e.target.value })}
                              className="w-full min-h-[400px] bg-white border-[0.5px] border-gray-200/80 p-8 font-mono text-[14px] text-gray-700 shadow-[inset_0_2px_10px_rgba(0,0,0,0.01)] focus:outline-none focus:border-[#011F5B]/30 leading-[1.8] resize-y transition-colors rounded-[1.5rem]"
                            />
                         </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 border-t border-gray-100 pt-8">
                        <button onClick={() => copyToClipboard(`Subject: ${generatedEmail.subject}\n\n${generatedEmail.body}`, 'body')} className="px-8 py-3.5 bg-[#011F5B] hover:shadow-[0_6px_20px_rgba(1,31,91,0.25)] hover:-translate-y-0.5 bg-gradient-to-r from-[#011F5B] to-[#001033] text-white text-[12px] font-bold uppercase tracking-widest rounded-full transition-all duration-300">
                          Copy Final Payload
                        </button>
                        <button onClick={() => handleGenerateEmail()} className="px-8 py-3.5 bg-white border border-gray-200 text-[#011F5B] text-[12px] font-bold uppercase tracking-widest rounded-full transition-colors hover:bg-gray-50 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:-translate-y-0.5">
                          Regenerate Matrix
                        </button>
                      </div>
                    </div>
                  )}
               </div>
            </div>
          </div>

          {/* Right Column: Metadata Rail */}
          <div className="lg:col-span-4 h-fit">
            
            <div className="bg-white rounded-[2rem] p-10 bento-shadow border-[0.5px] border-gray-100 lg:sticky lg:top-10 space-y-12">
               {/* Contact Info */}
               <div className="space-y-6">
                 <h3 className="text-[11px] font-bold uppercase tracking-widest font-sans text-gray-400 block mb-4">Principal Investigator</h3>
                 
                 <div className="space-y-4">
                   {opportunity.researcher_email ? (
                     <div className="group flex items-center gap-3">
                       <span className="font-mono text-[14px] text-[#011F5B] border-b-[0.5px] border-[#011F5B]/30 hover:border-[#011F5B] transition-colors cursor-text pb-0.5">
                          {opportunity.researcher_email}
                       </span>
                       <button onClick={() => copyToClipboard(opportunity.researcher_email!, 'email')} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-[#011F5B]">
                         <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                       </button>
                     </div>
                   ) : <span className="text-gray-400 italic text-[14px]">No direct line listed</span>}
   
                   <div className="flex flex-col gap-3 pt-4 border-t border-gray-100/60">
                     {isValidUrl(opportunity.researcher_profile_url) && (
                       <a href={opportunity.researcher_profile_url!} target="_blank" rel="noopener noreferrer" className="group text-[14px] font-medium font-sans text-gray-700 hover:text-[#011F5B] transition-colors flex items-center justify-between w-full pb-2 border-b-[0.5px] border-gray-100 hover:border-[#011F5B]/30">
                         External Profile <span className="text-gray-400 font-sans font-normal group-hover:text-[#011F5B] transition-colors ml-1">↗</span>
                       </a>
                     )}
                     {isValidUrl(opportunity.department_page_url) && (
                       <a href={opportunity.department_page_url!} target="_blank" rel="noopener noreferrer" className="group text-[14px] font-medium font-sans text-gray-700 hover:text-[#011F5B] transition-colors flex items-center justify-between w-full pb-2 border-b-[0.5px] border-gray-100 hover:border-[#011F5B]/30">
                         Department Page <span className="text-gray-400 font-sans font-normal group-hover:text-[#011F5B] transition-colors ml-1">↗</span>
                       </a>
                     )}
                   </div>
                 </div>
               </div>
   
               {/* Target Students */}
               <div className="space-y-6 pt-10 border-t border-gray-100">
                 <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] font-sans text-gray-400 block mb-4">Required Classifications</h3>
                 <div className="flex flex-wrap gap-2.5">
                   {opportunity.preferred_student_years?.map(y => (
                     <span key={y} className="px-3.5 py-1.5 border-[0.5px] border-blue-100/60 bg-blue-50/50 text-[#011F5B] text-[10px] font-bold uppercase tracking-[0.1em] font-sans rounded-[0.7rem] shadow-[0_2px_4px_rgba(0,0,0,0.01)] hover:shadow-sm hover:-translate-y-0.5 transition-all duration-300">
                       {y}
                     </span>
                   ))}
                   {opportunity.academic_terms?.map(t => (
                     <span key={t} className="px-3.5 py-1.5 border-[0.5px] border-blue-100/60 bg-blue-50/50 text-[#011F5B] text-[10px] font-bold uppercase tracking-[0.1em] font-sans rounded-[0.7rem] shadow-[0_2px_4px_rgba(0,0,0,0.01)] hover:shadow-sm hover:-translate-y-0.5 transition-all duration-300">
                       {t}
                     </span>
                   ))}
                 </div>
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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 w-full">
        <p className="font-sans text-[17px] text-gray-600 flex-1 leading-[1.8]">
          Execute cross-calibration function to match your profile vector against the technical prerequisites of this project.
        </p>
        <button
          onClick={handleAnalyze}
          disabled={analyzing}
          className="px-8 py-3.5 bg-[#011F5B] text-white text-[12px] font-bold uppercase tracking-[0.15em] font-sans hover:shadow-[0_6px_20px_rgba(1,31,91,0.25)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed min-w-[150px] flex items-center justify-center rounded-full whitespace-nowrap gap-3"
        >
          {analyzing ? (
            <>
               <div className="w-4 h-4 border-[2px] border-white/30 border-t-white rounded-full animate-spin"></div>
               Analyzing...
            </>
          ) : 'Execute Analysis'}
        </button>
      </div>
    )
  }

  return (
    <div className="animate-in fade-in duration-700 w-full">
      <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-100/60">
        <div className={`text-6xl font-serif tracking-tight ${result.match_score >= 80 ? 'text-[#011F5B]' :
            result.match_score >= 60 ? 'text-[#011F5B]/80' :
              result.match_score >= 40 ? 'text-gray-500' : 'text-[#990000]'
          }`}>
          {result.match_score}%
        </div>
        <div>
          <p className="font-sans font-bold uppercase tracking-widest text-[11px] text-gray-400 mb-1">Vector Index</p>
          <p className="font-sans text-[20px] font-medium text-[#011F5B]">
            {result.match_score >= 80 ? 'Exceptional Fit' :
              result.match_score >= 60 ? 'Strong Candidate' :
                result.match_score >= 40 ? 'Moderate Fit' : 'Low Compatibility'}
          </p>
        </div>
      </div>

      <p className="text-[17px] text-gray-700 leading-[1.8] mb-10">{result.analysis_text}</p>

      {result.matched_skills.length > 0 && (
         <div className="bg-blue-50/30 rounded-[1.5rem] p-6 border-[0.5px] border-blue-100/50">
           <span className="text-[11px] font-bold uppercase tracking-widest font-sans text-[#011F5B] block mb-4">Correlated Vectors</span>
           <div className="flex flex-wrap gap-2.5">
             {result.matched_skills.map(skill => (
               <span key={skill} className="px-4 py-2 border-[0.5px] border-[#011F5B]/20 text-[#011F5B] bg-white text-[11px] font-bold uppercase tracking-widest font-sans rounded-[0.8rem] shadow-sm">
                 {skill}
               </span>
             ))}
           </div>
         </div>
      )}
    </div>
  );
}
