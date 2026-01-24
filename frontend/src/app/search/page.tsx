'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api, ResearchOpportunity, FilterOptions, SearchResult } from '@/lib/api';
import { useProfile } from '@/contexts/ProfileContext';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function SearchPage() {
  return (
    <ProtectedRoute>
      <SearchContent />
    </ProtectedRoute>
  );
}

function SearchContent() {
  const { profileId, hasProfile } = useProfile();
  const [opportunities, setOpportunities] = useState<ResearchOpportunity[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({ research_categories: [], preferred_student_years: [] });
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchMode, setSearchMode] = useState<'filter' | 'natural'>('natural');

  // Filter state
  interface FilterState {
    research_categories?: string[];
    preferred_student_years?: string[];
    is_paid?: boolean;
    is_volunteer?: boolean;
    is_work_study?: boolean;
  }
  const [activeFilters, setActiveFilters] = useState<FilterState>({});

  // Natural language search
  const [query, setQuery] = useState('');

  useEffect(() => {
    // Load filter options and initial opportunities
    Promise.all([
      api.getFilterOptions(),
      api.getOpportunities()
    ]).then(([options, opps]) => {
      setFilterOptions(options);
      setOpportunities(opps);
      setLoading(false);
    }).catch(err => {
      console.error('Error loading data:', err);
      setLoading(false);
    });
  }, []);

  const handleFilterSearch = async () => {
    setSearching(true);
    try {
      const results = await api.getOpportunities({
        research_categories: activeFilters.research_categories,
        preferred_student_years: activeFilters.preferred_student_years,
        is_paid: activeFilters.is_paid,
        is_volunteer: activeFilters.is_volunteer,
        is_work_study: activeFilters.is_work_study,
      });
      setOpportunities(results);
      setSearchResults([]);
    } catch (err) {
      console.error('Error filtering:', err);
    } finally {
      setSearching(false);
    }
  };

  const handleNaturalSearch = async () => {
    if (!query.trim()) return;

    setSearching(true);
    try {
      const response = await api.search({
        query: query.trim(),
        student_profile_id: profileId || undefined,
        filters: {
          research_categories: activeFilters.research_categories,
          preferred_student_years: activeFilters.preferred_student_years,
          is_paid: activeFilters.is_paid,
          is_volunteer: activeFilters.is_volunteer,
          is_work_study: activeFilters.is_work_study,
        },
        limit: 20,
      });
      setSearchResults(response.results);
      setOpportunities([]);
    } catch (err) {
      console.error('Error searching:', err);
      alert('Error performing search. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const clearFilters = () => {
    setActiveFilters({});
    setQuery('');
  };

  const displayedOpportunities = searchResults.length > 0
    ? searchResults.map(r => r.opportunity)
    : opportunities;

  return (
    <div className="relative min-h-screen pb-20">
      {/* Background Elements for Search Page */}
      <div className="fixed inset-0 overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-[#011F5B] rounded-full mix-blend-multiply filter blur-[100px] opacity-[0.03] animate-blob"></div>
        <div className="absolute bottom-[10%] left-[-5%] w-[300px] h-[300px] bg-[#990000] rounded-full mix-blend-multiply filter blur-[80px] opacity-[0.03] animate-blob animation-delay-4000"></div>
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.02) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto space-y-8 pt-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-[var(--border-subtle)] pb-6 bg-white/40 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/50">
          <div>
            <h1 className="text-3xl font-bold text-[#011F5B] tracking-tight">Research Opportunities</h1>
            <p className="text-[var(--color-text-secondary)] mt-2 text-base font-light tracking-wide">
              {searchResults.length > 0
                ? `Found ${searchResults.length} matching opportunities`
                : `Browse ${opportunities.length} research opportunities`}
            </p>
          </div>
          {!hasProfile && (
            <Link
              href="/profile"
              className="px-5 py-2.5 bg-[#011F5B]/5 text-[#011F5B] rounded-full text-sm font-semibold hover:bg-[#011F5B] hover:text-white transition-all shadow-sm border border-[#011F5B]/10 hover:shadow-md"
            >
              Create Profile for Better Results
            </Link>
          )}
        </div>

        {/* Search Interface */}
        <div className="bg-white rounded-[2rem] shadow-layered border border-[var(--border-subtle)] p-2">
          {/* Toggle - Segmented Control */}
          <div className="flex p-1 bg-gray-50 rounded-[1.5rem] mb-6 w-fit mx-auto sm:mx-0 sm:ml-6 mt-6 border border-gray-100">
            <button
              onClick={() => setSearchMode('natural')}
              className={`px-8 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${searchMode === 'natural'
                ? 'bg-white text-[#011F5B] shadow-md'
                : 'text-gray-400 hover:text-gray-600'
                }`}
            >
              AI Search
            </button>
            <button
              onClick={() => setSearchMode('filter')}
              className={`px-8 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${searchMode === 'filter'
                ? 'bg-white text-[#011F5B] shadow-md'
                : 'text-gray-400 hover:text-gray-600'
                }`}
            >
              Filters
            </button>
          </div>

          <div className="px-8 pb-8">
            {searchMode === 'natural' ? (
              <div className="space-y-6">
                <div className="relative group">
                  <textarea
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Describe your ideal research opportunity... (e.g., 'I want to work on climate change policy with a focus on data analysis')"
                    className="w-full px-8 py-6 bg-gray-50/50 border border-gray-100 rounded-3xl text-gray-900 placeholder:text-gray-400 focus:ring-4 focus:ring-[#011F5B]/5 focus:bg-white focus:border-blue-100 transition-all resize-none shadow-inner text-lg leading-relaxed"
                    rows={3}
                  />
                  <div className="absolute bottom-6 right-6 flex gap-3">
                    {query && (
                      <button
                        onClick={() => setQuery('')}
                        className="px-4 py-2 text-xs font-medium text-gray-400 hover:text-gray-600 bg-white rounded-xl shadow-sm border border-gray-100 transition-colors"
                      >
                        Clear
                      </button>
                    )}
                    <button
                      onClick={handleNaturalSearch}
                      disabled={searching || !query.trim()}
                      className="px-8 py-3 bg-[#011F5B] text-white rounded-xl font-medium hover:bg-[#003366] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20 hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 group-hover:shadow-blue-900/30"
                    >
                      {searching ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Searching...</span>
                        </>
                      ) : (
                        <>
                          <span>Find Matches</span>
                          <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <p className="text-sm text-[var(--color-text-tertiary)] px-2 flex items-center gap-2">
                  {hasProfile
                    ? <><span className="text-green-500">✓</span> Personalizing results based on your profile</>
                    : <><span className="w-1.5 h-1.5 rounded-full bg-blue-300"></span> Tip: Results are better when you have a profile</>}
                </p>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="space-y-10">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 ml-1">
                      Research Category
                    </label>
                    <div className="flex flex-wrap gap-2.5">
                      {filterOptions.research_categories.map(category => {
                        const isSelected = activeFilters.research_categories?.includes(category);
                        return (
                          <button
                            key={category}
                            onClick={() => {
                              const current = activeFilters.research_categories || [];
                              const updated = current.includes(category)
                                ? current.filter(c => c !== category)
                                : [...current, category];
                              setActiveFilters({ ...activeFilters, research_categories: updated });
                            }}
                            className={`
                            px-4 py-2 rounded-xl text-sm transition-all duration-300 border
                            ${isSelected
                                ? 'bg-[#011F5B] text-white border-[#011F5B] shadow-md scale-105'
                                : 'bg-white text-gray-500 border-gray-100 hover:border-blue-100 hover:bg-blue-50/50 hover:text-[#011F5B]'}
                          `}
                          >
                            {category}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Year Filter */}
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 ml-1">
                        Student Year
                      </label>
                      <div className="flex flex-wrap gap-2.5">
                        {filterOptions.preferred_student_years.map(year => {
                          const isSelected = activeFilters.preferred_student_years?.includes(year);
                          return (
                            <button
                              key={year}
                              onClick={() => {
                                const current = activeFilters.preferred_student_years || [];
                                const updated = current.includes(year)
                                  ? current.filter(y => y !== year)
                                  : [...current, year];
                                setActiveFilters({ ...activeFilters, preferred_student_years: updated });
                              }}
                              className={`
                              px-4 py-2 rounded-xl text-sm transition-all duration-300 border
                              ${isSelected
                                  ? 'bg-[#990000] text-white border-[#990000] shadow-md scale-105'
                                  : 'bg-white text-gray-500 border-gray-100 hover:border-red-100 hover:bg-red-50/50 hover:text-[#990000]'}
                            `}
                            >
                              {year}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Compensation Filter */}
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 ml-1">
                        Compensation
                      </label>
                      <div className="flex flex-wrap gap-2.5">
                        {[
                          { key: 'is_paid', label: 'Paid' },
                          { key: 'is_volunteer', label: 'Volunteer' },
                          { key: 'is_work_study', label: 'Work Study' }
                        ].map(type => {
                          const isSelected = activeFilters[type.key as keyof FilterState] === true;
                          return (
                            <button
                              key={type.key}
                              onClick={() => {
                                setActiveFilters({
                                  ...activeFilters,
                                  [type.key]: !isSelected // Toggle
                                });
                              }}
                              className={`
                              px-4 py-2 rounded-xl text-sm transition-all duration-300 border flex items-center gap-2
                              ${isSelected
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-105'
                                  : 'bg-white text-gray-500 border-gray-100 hover:border-emerald-100 hover:bg-emerald-50/50 hover:text-emerald-700'}
                            `}
                            >
                              {isSelected && (
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                              {type.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 flex items-center justify-between border-t border-[var(--border-subtle)]">
                    <button
                      onClick={() => setActiveFilters({})}
                      className="text-sm text-gray-400 hover:text-gray-600 font-medium transition-colors"
                    >
                      Clear All Filters
                    </button>
                    <button
                      onClick={handleFilterSearch}
                      className="px-8 py-3 bg-[#011F5B] text-white rounded-xl font-bold shadow-lg shadow-blue-900/10 hover:bg-[#003366] hover:shadow-xl hover:scale-105 transition-all duration-300"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        {
          loading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-100 border-t-[#011F5B]"></div>
                <p className="text-gray-400 font-medium animate-pulse">Loading opportunities...</p>
              </div>
            </div>
          ) : displayedOpportunities.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No matches found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your search terms or filters.</p>
              <button
                onClick={clearFilters}
                className="text-[#011F5B] font-medium hover:underline decoration-2 underline-offset-4"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {searchResults.length > 0 ? (
                searchResults.map((result, index) => (
                  <OpportunityCard
                    key={result.opportunity.id}
                    opportunity={result.opportunity}
                    rank={index + 1}
                    score={result.score}
                    explanation={result.explanation}
                  />
                ))
              ) : (
                displayedOpportunities.map(opp => (
                  <OpportunityCard key={opp.id} opportunity={opp} />
                ))
              )}
            </div>
          )
        }
      </div>
    </div>
  );
}

interface OpportunityCardProps {
  opportunity: ResearchOpportunity;
  rank?: number;
  score?: number;
  explanation?: string;
}

function OpportunityCard({ opportunity, rank, score, explanation }: OpportunityCardProps) {
  return (
    <Link href={`/opportunity/${opportunity.id}`} className="block group">
      <div className="bg-white rounded-3xl border border-transparent p-8 hover:shadow-layered-hover transition-all duration-500 relative overflow-hidden ring-1 ring-black/[0.03] hover:ring-black/[0.06] transform hover:-translate-y-1">
        {/* Subtle decorative background */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50/50 to-transparent rounded-bl-full opacity-50 group-hover:opacity-100 transition-opacity"></div>

        {/* Hover Highlight Line */}
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#011F5B] opacity-0 group-hover:opacity-100 transition-all duration-500 transform -translate-x-full group-hover:translate-x-0"></div>

        <div className="flex justify-between items-start gap-8 relative z-10">
          <div className="flex-1 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold text-[#011F5B] group-hover:text-[#990000] transition-colors leading-snug mb-2">
                  {rank && <span className="mr-3 text-gray-300 font-light text-2xl">#{rank}</span>}
                  {opportunity.title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                  {opportunity.researcher_name && <span className="font-medium text-gray-900">{opportunity.researcher_name}</span>}
                  {opportunity.researcher_title && <span className="text-gray-300">•</span>}
                  {opportunity.researcher_title && <span className="font-light italic">{opportunity.researcher_title}</span>}
                </div>
              </div>

              {score !== undefined && (
                <div className="flex flex-col items-end flex-shrink-0 ml-6">
                  <div className="flex items-center gap-1.5 text-[#011F5B] font-bold bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                    <span className="text-lg">{score}</span>
                    <span className="text-[10px] uppercase tracking-wider text-blue-400 font-semibold">Match</span>
                  </div>
                </div>
              )}
            </div>

            {(opportunity.teaser || opportunity.description) && (
              <p className="text-[var(--color-text-secondary)] text-base leading-relaxed line-clamp-2 max-w-4xl font-light">
                {opportunity.teaser || opportunity.description?.substring(0, 250)}...
              </p>
            )}

            {explanation && (
              <div className="flex gap-3 items-start py-3 px-4 bg-blue-50/30 rounded-xl text-sm text-[#011F5B]/80 border border-blue-100/30 backdrop-blur-sm">
                <svg className="w-5 h-5 mt-0.5 flex-shrink-0 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span className="italic leading-relaxed">"{explanation}"</span>
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-2">
              {opportunity.research_categories?.map(cat => (
                <span key={cat} className="px-3 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-full border border-gray-200/60 shadow-sm">
                  {cat}
                </span>
              ))}
              {opportunity.preferred_student_years?.map(year => (
                <span key={year} className="px-3 py-1 bg-green-50/50 text-green-700 text-xs font-medium rounded-full border border-green-100/60">
                  {year}
                </span>
              ))}
              <div className="flex gap-2 ml-auto">
                {opportunity.is_paid && (
                  <span className="px-3 py-1 bg-yellow-50/50 text-yellow-700 text-xs font-medium rounded-full border border-yellow-100/60 flex items-center gap-1">
                    <span>$</span> Paid
                  </span>
                )}
                {opportunity.is_volunteer && (
                  <span className="px-3 py-1 bg-purple-50/50 text-purple-700 text-xs font-medium rounded-full border border-purple-100/60">
                    Volunteer
                  </span>
                )}
                {opportunity.is_work_study && (
                  <span className="px-3 py-1 bg-orange-50/50 text-orange-700 text-xs font-medium rounded-full border border-orange-100/60">
                    Work Study
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
