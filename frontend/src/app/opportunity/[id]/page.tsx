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
        <h1 className="text-3xl font-serif text-[#011F5B] mb-6 tracking-tight">Opportunity Not Found</h1>
        <Link href="/search" className="text-[11px] font-semibold uppercase tracking-[0.2em] font-sans text-gray-500 hover:text-[#011F5B] transition-colors duration-300">
          Return to directory
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-gray-900 selection:bg-[#011F5B] selection:text-white font-sans">

      {/* Extreme minimal nav */}
      <nav className="w-full border-b-[0.5px] border-gray-100/50">
         <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-6">
            <button
               onClick={() => router.back()}
               className="group flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.2em] font-sans text-gray-400 hover:text-[#011F5B] transition-all duration-300"
            >
               <span className="w-8 h-[1px] bg-gray-200 group-hover:bg-[#011F5B] group-hover:w-12 transition-all duration-500"></span>
               Research Directory
            </button>
         </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 md:py-24">
        
        {/* Header Ribbon / Title Block */}
        <header className="mb-20 lg:mb-28 max-w-4xl relative">
          <div className="flex flex-wrap items-center gap-3 mb-8">
            {opportunity.is_paid && (
              <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#011F5B]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#011F5B]"></span>
                Paid Position
              </span>
            )}
            {opportunity.research_categories?.map(cat => (
               <span key={cat} className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">
                 {cat}
               </span>
            ))}
          </div>

          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl leading-[1.05] text-[#011F5B] mb-10 tracking-tight">
            {opportunity.title}
          </h1>

          <div className="flex flex-col sm:flex-row sm:items-baseline gap-3 text-[17px] font-sans text-gray-600">
            {opportunity.researcher_name && <span className="font-medium text-[#011F5B] tracking-wide">{opportunity.researcher_name}</span>}
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
                   <h3 className="text-3xl font-serif text-[#011F5B] mb-6">Project Overview</h3>
                   <div className="text-[17px] text-gray-800 leading-[1.8] max-w-[65ch] whitespace-pre-wrap font-serif" style={{ fontFamily: 'Georgia, serif' }}>
                     {opportunity.description}
                   </div>
                 </section>
               )}

               {opportunity.mentor_areas && (
                 <section>
                   <h3 className="text-3xl font-serif text-[#011F5B] mb-6">Research Areas</h3>
                   <div className="text-[17px] text-gray-800 leading-[1.8] max-w-[65ch] font-serif" style={{ fontFamily: 'Georgia, serif' }}>
                     {opportunity.mentor_areas}
                   </div>
                 </section>
               )}

               {opportunity.preferred_qualifications && cleanScrapedText(opportunity.preferred_qualifications) && (
                 <section>
                   <h3 className="text-3xl font-serif text-[#011F5B] mb-6">Qualifications</h3>
                   <div className="text-[17px] text-gray-800 leading-[1.8] max-w-[65ch] whitespace-pre-wrap font-serif" style={{ fontFamily: 'Georgia, serif' }}>
                     {cleanScrapedText(opportunity.preferred_qualifications)}
                   </div>
                 </section>
               )}


            {/* Rich Feature Boxes (Fit Analysis & Email) */}
            <div className="pt-8 space-y-12">
               
               {/* Box 1: Compatibility Engine (Elevated White Card) */}
               <section className="bg-white rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 p-8 sm:p-12 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-[#011F5B]/3 rounded-full mix-blend-multiply blur-3xl pointer-events-none"></div>
                 
                 <div className="relative z-10 w-full">
                    <h3 className="text-2xl font-serif text-[#011F5B] mb-8">Compatibility Engine</h3>
                    <SkillAnalyzer opportunityId={id} />
                 </div>
               </section>

               {/* Box 2: Outreach Protocol (Rich Penn Blue Gradient Card) */}
               <section className="bg-gradient-to-br from-[#011F5B] to-[#001033] rounded-[1.5rem] shadow-xl p-8 sm:p-12 relative overflow-hidden text-white">
                 <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[150%] bg-[#990000]/10 rounded-full mix-blend-screen filter blur-[60px] pointer-events-none"></div>

                 <div className="relative z-10 w-full">
                   <h3 className="text-2xl font-serif text-white mb-8">Outreach Protocol</h3>

                   {!generatedEmail ? (
                      <div className="flex flex-col gap-8">
                        <p className="font-serif text-[17px] text-white/80 leading-[1.8] max-w-[60ch]" style={{ fontFamily: 'Georgia, serif' }}>
                          Synthesize your profile vector array into a highly-calibrated, professional email draft. This protocol bridges the gap between your established prerequisites and the project requirements.
                        </p>
                        {hasProfile ? (
                          <button
                            onClick={() => handleGenerateEmail()}
                            disabled={generatingEmail}
                            className="w-fit flex items-center justify-between gap-6 py-4 px-8 bg-white hover:bg-gray-50 text-[#011F5B] text-[13px] font-bold uppercase tracking-widest rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-sans"
                          >
                            {generatingEmail ? (
                               <>
                                 <div className="w-4 h-4 border-[2px] border-[#011F5B]/30 border-t-[#011F5B] rounded-full animate-spin"></div>
                                 Synthesizing Draft...
                               </>
                            ) : 'Initialize Draft'}
                          </button>
                        ) : (
                          <Link href="/profile" className="w-fit flex items-center justify-between gap-6 py-4 px-8 bg-white hover:bg-gray-50 text-[#011F5B] text-[13px] font-bold uppercase tracking-widest rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 font-sans">
                            Establish Profile
                          </Link>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-10 animate-in fade-in duration-500">
                        <div className="space-y-6">
                           <div className="border-b-[0.5px] border-white/20 pb-4 flex flex-col gap-2 group">
                              <div className="flex justify-between items-center">
                                <span className="text-[11px] font-semibold uppercase tracking-widest text-white/50 block font-sans">Subject</span>
                                <button onClick={() => copyToClipboard(generatedEmail.subject, 'subject')} className="text-[11px] uppercase tracking-widest text-white/70 hover:text-white font-bold transition-all opacity-0 group-hover:opacity-100 font-sans">
                                  {copied === 'subject' ? 'Copied' : 'Copy'}
                                </button>
                              </div>
                              <span className="font-serif text-[18px] text-white" style={{ fontFamily: 'Georgia, serif' }}>{generatedEmail.subject}</span>
                           </div>
                           
                           <div className="group relative pt-2">
                              <div className="flex justify-between items-center mb-4">
                                <span className="text-[11px] font-semibold uppercase tracking-widest text-white/50 block font-sans">Body Content</span>
                                <button onClick={() => copyToClipboard(generatedEmail.body, 'body')} className="text-[11px] uppercase tracking-widest text-white/70 hover:text-white font-bold transition-all opacity-0 group-hover:opacity-100 font-sans">
                                  {copied === 'body' ? 'Copied' : 'Copy Payload'}
                                </button>
                              </div>
                              <textarea
                                value={generatedEmail.body}
                                onChange={e => setGeneratedEmail({ ...generatedEmail, body: e.target.value })}
                                className="w-full min-h-[400px] bg-white/5 border border-white/10 rounded-xl p-8 font-serif text-[16px] text-white/90 leading-[1.8] resize-y focus:outline-none focus:border-white/30 focus:bg-white/10 transition-colors shadow-inner backdrop-blur-sm" style={{ fontFamily: 'Georgia, serif' }}
                              />
                           </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 pt-4">
                          <button onClick={() => copyToClipboard(`Subject: ${generatedEmail.subject}\n\n${generatedEmail.body}`, 'body')} className="py-4 px-8 bg-white hover:bg-gray-50 text-[#011F5B] text-[12px] font-bold uppercase tracking-widest rounded-xl hover:-translate-y-0.5 transition-all duration-300 shadow-lg hover:shadow-xl font-sans">
                            Copy Final Output
                          </button>
                          <button onClick={() => handleGenerateEmail()} className="py-4 px-8 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-[12px] font-bold uppercase tracking-widest rounded-xl hover:-translate-y-0.5 transition-all duration-300 font-sans">
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
                 <h3 className="text-2xl font-serif text-[#011F5B] mb-6 block">Investigator</h3>
                 
                 <div className="space-y-6">
                   {opportunity.researcher_email ? (
                     <div className="group flex items-center gap-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm transition-shadow hover:shadow-md">
                       <span className="font-sans text-[15px] text-[#011F5B] font-medium selection:bg-blue-100">
                          {opportunity.researcher_email}
                       </span>
                       <button onClick={() => copyToClipboard(opportunity.researcher_email!, 'email')} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-[#011F5B] ml-auto">
                         <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                       </button>
                     </div>
                   ) : <span className="text-gray-500 font-serif text-[15px] italic">No direct line listed</span>}
   
                   <div className="flex flex-col gap-3">
                     {isValidUrl(opportunity.researcher_profile_url) && (
                       <a href={opportunity.researcher_profile_url!} target="_blank" rel="noopener noreferrer" className="group text-[15px] font-medium font-sans text-gray-600 hover:text-[#011F5B] transition-colors flex items-center justify-between w-full py-4 border-b-[0.5px] border-gray-200 hover:border-[#011F5B]">
                         External Profile <span className="text-gray-400 group-hover:text-[#011F5B] transition-colors ml-1">↗</span>
                       </a>
                     )}
                     {isValidUrl(opportunity.department_page_url) && (
                       <a href={opportunity.department_page_url!} target="_blank" rel="noopener noreferrer" className="group text-[15px] font-medium font-sans text-gray-600 hover:text-[#011F5B] transition-colors flex items-center justify-between w-full py-4 border-b-[0.5px] border-gray-200 hover:border-[#011F5B]">
                         Department Page <span className="text-gray-400 group-hover:text-[#011F5B] transition-colors ml-1">↗</span>
                       </a>
                     )}
                   </div>
                 </div>
               </div>
   
               {/* Classifications Rail */}
               <div className="space-y-6 pt-6">
                 <h3 className="text-2xl font-serif text-[#011F5B] mb-6 block">Classification</h3>
                 
                 <div className="flex flex-col gap-6">
                    {opportunity.preferred_student_years?.length ? (
                       <div className="flex flex-col gap-3">
                          <span className="text-[13px] font-bold text-gray-400 uppercase tracking-widest font-sans">Target Years</span>
                          <div className="flex flex-wrap gap-2">
                            {opportunity.preferred_student_years.map(year => (
                              <span key={year} className="bg-gray-50 border border-gray-200 text-gray-700 text-[13px] font-medium px-4 py-1.5 rounded-full font-sans shadow-sm">
                                {year}
                              </span>
                            ))}
                          </div>
                       </div>
                    ) : null}

                    {opportunity.academic_terms?.length ? (
                       <div className="flex flex-col gap-3">
                          <span className="text-[13px] font-bold text-gray-400 uppercase tracking-widest font-sans">Academic Terms</span>
                          <div className="flex flex-wrap gap-2">
                            {opportunity.academic_terms.map(term => (
                              <span key={term} className="bg-blue-50 border border-blue-100 text-[#011F5B] text-[13px] font-medium px-4 py-1.5 rounded-full font-sans shadow-sm">
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
      <div className="flex flex-col gap-10">
        <p className="font-serif text-[17px] text-gray-700 leading-[1.8] max-w-[60ch]" style={{ fontFamily: 'Georgia, serif' }}>
          Execute the cross-calibration function to match your profile vector against the technical prerequisites of this project.
        </p>
        <button
          onClick={handleAnalyze}
          disabled={analyzing}
          className="w-fit flex items-center justify-between gap-6 py-4 px-8 bg-[#011F5B] hover:bg-[#001033] text-white text-[13px] font-bold uppercase tracking-widest rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-sans"
        >
          {analyzing ? (
             <>
               <div className="w-4 h-4 border-[2px] border-white/30 border-t-white rounded-full animate-spin"></div>
               Calibrating Array...
             </>
          ) : 'Run Calibration'}
        </button>
      </div>
    )
  }

  return (
    <div className="animate-in fade-in duration-700 w-full">
      <div className="flex flex-wrap items-end gap-6 mb-8 pb-8 border-b-[0.5px] border-gray-200">
        <div className={`text-6xl sm:text-7xl font-serif tracking-tight leading-none ${result.match_score >= 80 ? 'text-[#011F5B]' :
            result.match_score >= 60 ? 'text-gray-700' :
              result.match_score >= 40 ? 'text-gray-500' : 'text-gray-300'
          }`}>
          {result.match_score}%
        </div>
        <div className="pb-1 sm:pb-2">
          <p className="font-sans font-semibold uppercase tracking-[0.25em] text-[11px] text-gray-400 mb-2 block">Match Score</p>
          <p className="font-sans text-[18px] sm:text-[20px] font-medium text-gray-900 tracking-wide">
            {result.match_score >= 80 ? 'Exceptional Fit' :
              result.match_score >= 60 ? 'Strong Candidate' :
                result.match_score >= 40 ? 'Moderate Fit' : 'Low Compatibility'}
          </p>
        </div>
      </div>

      <p className="text-[17px] text-gray-700 font-serif leading-[1.8] mb-10" style={{ fontFamily: 'Georgia, serif' }}>{result.analysis_text}</p>

      {result.matched_skills.length > 0 && (
         <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
           <span className="text-[11px] font-bold uppercase tracking-widest text-[#011F5B] block mb-4 font-sans">Correlated Skills</span>
           <div className="flex flex-wrap gap-2.5">
             {result.matched_skills.map(skill => (
               <span key={skill} className="px-4 py-2 bg-white border border-gray-200 text-gray-800 text-[12px] font-medium font-sans rounded-lg shadow-sm">
                 {skill}
               </span>
             ))}
           </div>
         </div>
      )}
    </div>
  );
}
