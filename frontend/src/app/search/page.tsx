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
    <div className="relative min-h-screen pb-40">
      {/* Dynamic Background */}
      <div className="fixed inset-0 overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#011F5B] rounded-full mix-blend-multiply filter blur-[150px] opacity-[0.02] animate-blob"></div>
        <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] bg-[#990000] rounded-full mix-blend-multiply filter blur-[120px] opacity-[0.02] animate-blob animation-delay-4000"></div>
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.01) 1px, transparent 0)', backgroundSize: '48px 48px' }}></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4">

        {/* Header / Search Hero */}
        <div className="flex flex-col items-center justify-center pt-24 pb-20 space-y-10">
          <div className="text-center space-y-4">
            <h1 className="text-5xl md:text-7xl font-serif text-[#011F5B] tracking-tight">
              Research Directory
            </h1>
            <p className="text-gray-400 font-sans text-lg tracking-wide uppercase text-[0.7rem] font-bold">
              {displayedOpportunities.length} Available Positions
            </p>
          </div>

          {/* Google Flights Style Search Input */}
          <div className="w-full max-w-2xl relative z-50">
            <div className="relative group">
              <div className={`
                absolute inset-0 bg-gradient-to-r from-blue-100/20 to-red-100/20 rounded-2xl blur-xl opacity-0 transition-opacity duration-500
                ${searching || query ? 'opacity-100' : 'group-hover:opacity-50'}
              `}></div>

              <div className="relative bg-white/60 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/50 overflow-hidden transition-all duration-300 focus-within:ring-4 focus-within:ring-[#011F5B]/5 focus-within:scale-[1.01]">
                <div className="flex items-center h-20 px-8">
                  <svg className={`w-6 h-6 text-gray-400 transition-colors ${searching ? 'animate-spin text-[#011F5B]' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {searching
                      ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    }
                  </svg>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleNaturalSearch()}
                    placeholder="Search by topic, professor, or keyword..."
                    className="w-full h-full bg-transparent border-none focus:ring-0 px-6 text-xl placeholder:text-gray-300 text-[#011F5B] font-serif"
                  />
                  {query && (
                    <button onClick={() => setQuery('')} className="p-2 text-gray-300 hover:text-gray-500 transition-colors">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  )}
                </div>

                {/* Mode Toggle inside the search pill or attached? sticking to simple for now as requested */}
              </div>
            </div>

            {/* Quick Filters */}
            <div className="flex justify-center gap-4 mt-6">
              {['Biomedical', 'Engineering', 'Social Science', 'Humanities'].map(cat => (
                <button
                  key={cat}
                  onClick={() => {
                    if (!activeFilters.research_categories?.includes(cat)) {
                      setActiveFilters({ ...activeFilters, research_categories: [...(activeFilters.research_categories || []), cat] });
                      handleFilterSearch(); // Trigger simplistic filter search
                    }
                  }}
                  className="text-xs font-semibold uppercase tracking-widest text-gray-400 hover:text-[#011F5B] transition-colors"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-12">
          {!query && !searching ? (
            /* Initial State: Featured Grid */
            <div className="space-y-8">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-4">
                Featured Research
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {opportunities.slice(0, 9).map((opp) => (
                  <FeaturedCard key={opp.id} opportunity={opp} />
                ))}
              </div>
            </div>
          ) : (
            /* Search Results: Linear List */
            <div className="space-y-0">
              {loading ? (
                <div className="py-40 text-center">
                  <div className="inline-block w-12 h-12 border-4 border-gray-100 border-t-[#011F5B] rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-300 font-serif italic text-xl animate-pulse">Curating opportunities...</p>
                </div>
              ) : displayedOpportunities.length === 0 ? (
                <div className="py-20 text-center">
                  <p className="text-2xl font-serif text-gray-400 italic mb-4">No exact matches found.</p>
                  <button onClick={() => setQuery('')} className="text-[#011F5B] font-bold border-b-2 border-[#011F5B]/20 hover:border-[#011F5B] transition-colors">
                    View all opportunities
                  </button>
                </div>
              ) : (
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-[#011F5B] mb-8">
                    {displayedOpportunities.length} Results Found
                  </h3>
                  {displayedOpportunities.map((opp, index) => {
                    const result = searchResults.find(r => r.opportunity.id === opp.id);
                    return (
                      <OpportunityItem
                        key={opp.id}
                        opportunity={opp}
                        index={index}
                        score={result?.score}
                        explanation={result?.explanation}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Grid Card for Initial State
function FeaturedCard({ opportunity }: { opportunity: ResearchOpportunity }) {
  return (
    <Link href={`/opportunity/${opportunity.id}`} className="group block h-full">
      <div className="h-full bg-white rounded-3xl p-8 border border-gray-100 hover:border-gray-200 transition-all hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between">
        <div>
          <div className="flex flex-wrap gap-2 mb-6">
            {opportunity.is_paid && (
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
            )}
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              {opportunity.research_categories?.[0] || "Research"}
            </span>
          </div>
          <h3 className="text-xl font-serif text-[#011F5B] mb-3 leading-tight group-hover:underline decoration-1 underline-offset-4 decoration-gray-300">
            {opportunity.title}
          </h3>
          <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed mb-6">
            {opportunity.teaser || opportunity.description}
          </p>
        </div>
        <div className="flex items-center gap-3 pt-6 border-t border-gray-50 mt-auto">
          <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-[#011F5B] font-serif font-bold text-xs">
            {opportunity.researcher_name?.[0] || "P"}
          </div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider truncate">
            {opportunity.researcher_name}
          </span>
        </div>
      </div>
    </Link>
  );
}

// Redesigned "Linear" List Item
function OpportunityItem({ opportunity, index, score, explanation }: { opportunity: ResearchOpportunity, index: number, score?: number, explanation?: string }) {
  return (
    <Link href={`/opportunity/${opportunity.id}`} className="block group">
      <div
        className="relative py-12 md:py-16 border-t border-gray-100 transition-all duration-700 hover:bg-white/50 hover:backdrop-blur-sm -mx-4 px-4 md:-mx-12 md:px-12 rounded-3xl group-hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]"
        style={{ animationDelay: `${index * 50}ms` }}
      >
        {/* Learn More Arrow (Hidden by default) */}
        <div className="absolute right-12 top-1/2 -translate-y-1/2 opacity-0 -translate-x-8 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 hidden md:flex items-center gap-3 text-[#011F5B]">
          <span className="text-xs font-bold uppercase tracking-widest">View</span>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
        </div>

        <div className="max-w-3xl">
          {/* Header */}
          <div className="mb-4 flex items-baseline gap-4">
            <h2 className="text-2xl md:text-3xl font-serif text-[#1e293b] group-hover:text-[#011F5B] transition-colors leading-tight">
              {opportunity.title}
            </h2>
            {score && (
              <span className="px-2 py-1 bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-wider rounded border border-green-100/50 opacity-60 group-hover:opacity-100 transition-opacity">
                {score}%
              </span>
            )}
          </div>

          {/* Researcher */}
          <div className="mb-6 flex items-center gap-3 text-xs text-gray-500 font-bold uppercase tracking-widest">
            {opportunity.researcher_name && <span className="text-gray-400">{opportunity.researcher_name}</span>}
          </div>

          {/* "Teaser" description */}
          <p className="text-gray-500 font-sans text-base leading-[1.8] line-clamp-2 mb-6 group-hover:text-gray-600 transition-colors max-w-2xl">
            {explanation ? `"${explanation}"` : (opportunity.teaser || opportunity.description?.substring(0, 300) + '...')}
          </p>

          {/* Metadata Pills */}
          <div className="flex flex-wrap gap-2 opacity-60 group-hover:opacity-100 transition-opacity duration-500">
            {opportunity.research_categories?.slice(0, 3).map(cat => (
              <span key={cat} className="px-3 py-1 border border-gray-200 text-gray-400 text-[10px] font-bold uppercase tracking-widest rounded-full bg-transparent">
                {cat}
              </span>
            ))}
            {opportunity.is_paid && (
              <span className="px-3 py-1 border border-gray-200 text-[#011F5B] text-[10px] font-bold uppercase tracking-widest rounded-full bg-transparent flex items-center gap-1">
                <span className="text-[12px] leading-none">$</span> Paid
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
