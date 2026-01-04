'use client';

import { useEffect, useState, useMemo } from 'react';
import OverviewCards from './components/OverviewCards';
import OpportunitiesTable from './components/OpportunitiesTable';
import AnalyticsCharts from './components/AnalyticsCharts';
import SearchAndFilters, { FilterState } from './components/SearchAndFilters';
import JobDetailModal from './components/JobDetailModal';
import LoadingSpinner from './components/LoadingSpinner';
import Pagination from './components/Pagination';
import { useToast } from './hooks/useToast';
import { fetchOverview, fetchOpportunities, fetchFunnel, fetchSources, fetchCategories, applyToOpportunity, triggerDiscovery } from './lib/api';

export default function Home() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState<any[]>([]);
  const [overview, setOverview] = useState<any>(null);
  const [funnel, setFunnel] = useState<any>(null);
  const [sources, setSources] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [discovering, setDiscovering] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [filters, setFilters] = useState<FilterState>({
    category: '',
    source: '',
    status: '',
    minScore: 0,
    sortBy: 'discoveredAt',
    sortOrder: 'desc',
  });
  
  const { showToast, ToastContainer } = useToast();

  useEffect(() => {
    loadData();
    // Refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filter and sort opportunities
  useEffect(() => {
    let filtered = [...opportunities];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(opp => 
        opp.title.toLowerCase().includes(query) ||
        opp.description.toLowerCase().includes(query) ||
        (opp.matchedSkills && opp.matchedSkills.some((skill: string) => skill.toLowerCase().includes(query))) ||
        opp.source.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(opp => opp.category === filters.category);
    }

    // Source filter
    if (filters.source) {
      filtered = filtered.filter(opp => opp.source === filters.source);
    }

    // Status filter
    if (filters.status) {
      if (filters.status === 'new') {
        filtered = filtered.filter(opp => !opp.status);
      } else {
        filtered = filtered.filter(opp => opp.status === filters.status);
      }
    }

    // Min score filter
    if (filters.minScore > 0) {
      filtered = filtered.filter(opp => opp.score >= filters.minScore);
    }

    // Sorting
    filtered.sort((a, b) => {
      let aVal: any, bVal: any;
      
      switch (filters.sortBy) {
        case 'score':
          aVal = a.score;
          bVal = b.score;
          break;
        case 'title':
          aVal = a.title.toLowerCase();
          bVal = b.title.toLowerCase();
          break;
        case 'discoveredAt':
        default:
          aVal = new Date(a.discoveredAt).getTime();
          bVal = new Date(b.discoveredAt).getTime();
          break;
      }

      if (filters.sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setFilteredOpportunities(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [opportunities, searchQuery, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredOpportunities.length / itemsPerPage);
  const paginatedOpportunities = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredOpportunities.slice(start, end);
  }, [filteredOpportunities, currentPage, itemsPerPage]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [opps, ov, fun, src, cats] = await Promise.all([
        fetchOpportunities(),
        fetchOverview(),
        fetchFunnel(),
        fetchSources(),
        fetchCategories(),
      ]);
      setOpportunities(opps);
      setOverview(ov);
      setFunnel(fun);
      setSources(src);
      setCategories(cats);
    } catch (error) {
      console.error('Error loading data:', error);
      showToast('Failed to load data. Please refresh the page.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (id: number, status: string = 'applied') => {
    try {
      await applyToOpportunity(id, status);
      const statusMessages: Record<string, string> = {
        applied: 'Job marked as applied',
        old: 'Job marked as old',
        not_useful: 'Job marked as not useful',
        archived: 'Job archived',
        viewed: 'Job restored',
      };
      showToast(statusMessages[status] || 'Status updated', 'success');
      loadData();
    } catch (error: any) {
      console.error('Error updating status:', error);
      const errorMsg = error.response?.data?.error || `Failed to update status`;
      showToast(errorMsg, 'error');
    }
  };

  const handleDiscover = async () => {
    setDiscovering(true);
    try {
      const result = await triggerDiscovery();
      showToast(`Discovery completed! Found ${result.count} new opportunities.`, 'success');
      loadData();
    } catch (error) {
      console.error('Error triggering discovery:', error);
      showToast('Failed to trigger discovery', 'error');
    } finally {
      setDiscovering(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(opportunities.map(opp => opp.category).filter(Boolean)));
  }, [opportunities]);

  const uniqueSources = useMemo(() => {
    return Array.from(new Set(opportunities.map(opp => opp.source)));
  }, [opportunities]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <ToastContainer />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Job Opportunity Dashboard
              </h1>
              <p className="text-sm text-gray-600 mt-1">Automated job discovery and tracking</p>
            </div>
            <button
              onClick={handleDiscover}
              disabled={discovering}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-2 font-medium"
            >
              {discovering ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Discovering...</span>
                </>
              ) : (
                <>
                  <span>🔍</span>
                  <span>Discover Jobs</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        {overview && <OverviewCards data={overview} />}

        {/* Analytics Charts */}
        <div className="mt-8">
          <AnalyticsCharts funnel={funnel} sources={sources} categories={categories} />
        </div>

        {/* Search and Filters */}
        <div className="mt-8">
          <SearchAndFilters
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
            categories={uniqueCategories}
            sources={uniqueSources}
          />
        </div>

        {/* Opportunities Table */}
        <div className="mt-6">
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Opportunities
                {filteredOpportunities.length !== opportunities.length && (
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({filteredOpportunities.length} of {opportunities.length})
                  </span>
                )}
              </h2>
              <div className="text-sm text-gray-600">
                {filteredOpportunities.length === 0 ? 'No opportunities match your filters' : 'Showing filtered results'}
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <OpportunitiesTable 
              opportunities={paginatedOpportunities}
              onApply={handleApply}
              onViewDetails={(job) => setSelectedJob(job)}
            />
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={filteredOpportunities.length}
              />
            )}
          </div>
        </div>
      </main>

      {/* Job Detail Modal */}
      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          isOpen={!!selectedJob}
          onClose={() => setSelectedJob(null)}
          onApply={handleApply}
        />
      )}
    </div>
  );
}
