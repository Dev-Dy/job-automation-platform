'use client';

import { useState } from 'react';

interface Opportunity {
  id: number;
  title: string;
  source: string;
  score: number;
  url: string;
  status: string | null;
  discoveredAt: string;
  sourceType?: string;
  category?: string;
  matchedSkills?: string[];
}

interface OpportunitiesTableProps {
  opportunities: Opportunity[];
  onApply: (id: number, status?: string) => void;
  onViewDetails?: (job: Opportunity) => void;
}

export default function OpportunitiesTable({ opportunities, onApply, onViewDetails }: OpportunitiesTableProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const getStatusBadge = (status: string | null) => {
    if (!status) return <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-800">New</span>;
    
    const colors: Record<string, string> = {
      viewed: 'bg-blue-100 text-blue-800',
      applied: 'bg-yellow-100 text-yellow-800',
      replied: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      archived: 'bg-gray-200 text-gray-700',
      old: 'bg-orange-100 text-orange-800',
      not_useful: 'bg-red-200 text-red-900',
    };

    const displayNames: Record<string, string> = {
      not_useful: 'Not Useful',
      viewed: 'Viewed',
      applied: 'Applied',
      replied: 'Replied',
      rejected: 'Rejected',
      archived: 'Archived',
      old: 'Old',
    };

    return (
      <span className={`px-2 py-1 text-xs rounded ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {displayNames[status] || status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const isNonApplicableStatus = (status: string | null) => {
    return status && ['archived', 'old', 'not_useful'].includes(status);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 font-bold';
    if (score >= 60) return 'text-yellow-600 font-semibold';
    return 'text-gray-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Opportunities</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Source
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {opportunities.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  No opportunities found. Trigger discovery to find jobs.
                </td>
              </tr>
            ) : (
              opportunities.map((opp) => (
                <tr key={opp.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => onViewDetails?.(opp)}>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors">{opp.title}</div>
                    {opp.description && (
                      <div className="text-xs text-gray-500 mt-1 line-clamp-2">{opp.description.substring(0, 100)}...</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{opp.source}</div>
                    {opp.sourceType && opp.sourceType !== 'automated' && (
                      <div className="text-xs text-gray-400">({opp.sourceType})</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {opp.category && (
                      <span className={`px-2 py-1 text-xs rounded ${
                        opp.category === 'mern' ? 'bg-blue-100 text-blue-800' :
                        opp.category === 'crypto' ? 'bg-green-100 text-green-800' :
                        opp.category === 'rust' ? 'bg-orange-100 text-orange-800' :
                        opp.category === 'backend' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {opp.category}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${getScoreColor(opp.score)}`}>
                      {opp.score}/100
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(opp.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(opp.discoveredAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                    <div className="flex flex-col space-y-1">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onViewDetails?.(opp)}
                          className="text-blue-600 hover:text-blue-900 font-medium"
                        >
                          Details
                        </button>
                        <a
                          href={opp.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Open
                        </a>
                        {!isNonApplicableStatus(opp.status) && opp.status !== 'applied' && opp.status !== 'replied' && (
                          <button
                            onClick={() => {
                              setSelectedId(opp.id);
                              onApply(opp.id, 'applied');
                            }}
                            disabled={selectedId === opp.id}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50"
                          >
                            {selectedId === opp.id ? 'Applying...' : 'Apply'}
                          </button>
                        )}
                      </div>
                      <div className="flex space-x-1 text-xs">
                        {!isNonApplicableStatus(opp.status) && (
                          <>
                            <button
                              onClick={() => onApply(opp.id, 'old')}
                              className="text-orange-600 hover:text-orange-800"
                              title="Mark as Old"
                            >
                              Old
                            </button>
                            <button
                              onClick={() => onApply(opp.id, 'not_useful')}
                              className="text-red-600 hover:text-red-800"
                              title="Mark as Not Useful"
                            >
                              Not Useful
                            </button>
                            <button
                              onClick={() => onApply(opp.id, 'archived')}
                              className="text-gray-600 hover:text-gray-800"
                              title="Archive"
                            >
                              Archive
                            </button>
                          </>
                        )}
                        {isNonApplicableStatus(opp.status) && (
                          <button
                            onClick={() => onApply(opp.id, 'viewed')}
                            className="text-blue-600 hover:text-blue-800"
                            title="Restore"
                          >
                            Restore
                          </button>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
