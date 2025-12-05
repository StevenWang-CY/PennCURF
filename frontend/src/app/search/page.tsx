'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api, ResearchOpportunity, FilterOptions, SearchResult } from '@/lib/api';

export default function SearchPage() {
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
  const [hasProfile, setHasProfile] = useState(false);

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

    // Check if profile exists
    const profileId = localStorage.getItem('studentProfileId');
    setHasProfile(!!profileId);
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
      const profileId = localStorage.getItem('studentProfileId');
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
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Research Opportunities</h1>
          <p className="text-gray-500 mt-2">
            {searchResults.length > 0
              ? `Found ${searchResults.length} matching opportunities`
              : `Browse ${opportunities.length} research opportunities`}
          </p>
        </div>
        {!hasProfile && (
          <Link
            href="/profile"
            className="px-5 py-2.5 bg-blue-50 text-[#011F5B] rounded-full text-sm font-medium hover:bg-blue-100 transition-colors"
          >
            Create Profile for Better Results
          </Link>
        )}
      </div>

      {/* Search Interface */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1">
        {/* Toggle - Segmented Control */}
        <div className="flex p-1 bg-gray-50/80 rounded-xl mb-6 w-fit mx-auto sm:mx-0 sm:ml-6 mt-6">
          <button
            onClick={() => setSearchMode('natural')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${searchMode === 'natural'
              ? 'bg-white text-[#011F5B] shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            AI Search
          </button>
          <button
            onClick={() => setSearchMode('filter')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${searchMode === 'filter'
              ? 'bg-white text-[#011F5B] shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            Filters
          </button>
        </div>

        <div className="px-6 pb-6">
          {searchMode === 'natural' ? (
            <div className="space-y-4">
              <div className="relative">
                <textarea
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Describe your ideal research opportunity... (e.g., 'I want to work on climate change policy with a focus on data analysis')"
                  className="w-full px-6 py-5 bg-gray-50 border-0 rounded-2xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#011F5B]/20 focus:bg-white transition-all resize-none shadow-inner text-lg"
                  rows={3}
                />
                <div className="absolute bottom-4 right-4 flex gap-2">
                  {query && (
                    <button
                      onClick={() => setQuery('')}
                      className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 bg-white rounded-md shadow-sm border border-gray-200 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                  <button
                    onClick={handleNaturalSearch}
                    disabled={searching || !query.trim()}
                    className="px-6 py-2 bg-[#011F5B] text-white rounded-xl font-medium hover:bg-[#003366] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-900/10 flex items-center gap-2"
                  >
                    {searching ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Searching...</span>
                      </>
                    ) : (
                      <>
                        <span>Find Matches</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-500 px-1">
                {hasProfile
                  ? '✓ Personalizing results based on your profile'
                  : 'Tip: Results are better when you have a profile'}
              </p>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="space-y-8">
                {/* Category Filter */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                    Research Category
                  </label>
                  <div className="flex flex-wrap gap-2">
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
                            px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border
                            ${isSelected
                              ? 'bg-[#011F5B] text-white border-[#011F5B] shadow-sm'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-blue-200 hover:bg-blue-50'}
                          `}
                        >
                          {category}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Year Filter */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                      Student Year
                    </label>
                    <div className="flex flex-wrap gap-2">
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
                              px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border
                              ${isSelected
                                ? 'bg-[#990000] text-white border-[#990000] shadow-sm'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-red-200 hover:bg-red-50'}
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
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                      Compensation
                    </label>
                    <div className="flex flex-wrap gap-2">
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
                              px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border flex items-center gap-1.5
                              ${isSelected
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-200 hover:bg-emerald-50'}
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

                <div className="pt-4 flex items-center justify-between border-t border-gray-100">
                  <button
                    onClick={() => setActiveFilters({})}
                    className="text-sm text-gray-400 hover:text-gray-600 font-medium transition-colors"
                  >
                    Clear All Filters
                  </button>
                  <button
                    onClick={handleFilterSearch}
                    className="px-6 py-2 bg-[#011F5B] text-white rounded-lg font-bold shadow-md hover:bg-blue-900 hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
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
    </div >
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
      <div className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md hover:border-gray-200 transition-all duration-200 relative overflow-hidden">
        {/* Hover Highlight Line */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#011F5B] opacity-0 group-hover:opacity-100 transition-opacity"></div>

        <div className="flex justify-between items-start gap-6">
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#011F5B] transition-colors leading-snug mb-1">
                  {rank && <span className="mr-2 text-gray-400 font-normal">#{rank}</span>}
                  {opportunity.title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  {opportunity.researcher_name && <span className="font-medium">{opportunity.researcher_name}</span>}
                  {opportunity.researcher_title && <span className="text-gray-400">•</span>}
                  {opportunity.researcher_title && <span>{opportunity.researcher_title}</span>}
                </div>
              </div>

              {score !== undefined && (
                <div className="flex flex-col items-end flex-shrink-0 ml-4">
                  <div className="flex items-center gap-1 text-[#011F5B] font-bold">
                    <span className="text-2xl">{score}</span>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Match</span>
                </div>
              )}
            </div>

            {(opportunity.teaser || opportunity.description) && (
              <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 max-w-3xl">
                {opportunity.teaser || opportunity.description?.substring(0, 200)}...
              </p>
            )}

            {explanation && (
              <div className="flex gap-2 items-start py-2 px-3 bg-blue-50/50 rounded-lg text-sm text-blue-900/80 border border-blue-100/50">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span className="italic">&ldquo;{explanation}&rdquo;</span>
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-1">
              {opportunity.research_categories?.map(cat => (
                <span key={cat} className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full border border-gray-200">
                  {cat}
                </span>
              ))}
              {opportunity.preferred_student_years?.map(year => (
                <span key={year} className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-100">
                  {year}
                </span>
              ))}
              <div className="flex gap-2 ml-auto">
                {opportunity.is_paid && (
                  <span className="px-2.5 py-1 bg-yellow-50 text-yellow-700 text-xs font-medium rounded-full border border-yellow-100 flex items-center gap-1">
                    <span>$</span> Paid
                  </span>
                )}
                {opportunity.is_volunteer && (
                  <span className="px-2.5 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full border border-purple-100">
                    Volunteer
                  </span>
                )}
                {opportunity.is_work_study && (
                  <span className="px-2.5 py-1 bg-orange-50 text-orange-700 text-xs font-medium rounded-full border border-orange-100">
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
