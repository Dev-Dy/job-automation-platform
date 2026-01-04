'use client';

interface JobDetailModalProps {
  job: any;
  isOpen: boolean;
  onClose: () => void;
  onApply: (id: number, status: string) => void;
}

export default function JobDetailModal({ job, isOpen, onClose, onApply }: JobDetailModalProps) {
  if (!isOpen || !job) return null;

  const getStatusBadge = (status: string | null) => {
    if (!status) return null;
    
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
      <span className={`px-3 py-1 text-sm rounded ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {displayNames[status] || status}
      </span>
    );
  };

  const isNonApplicableStatus = (status: string | null) => {
    return status && ['archived', 'old', 'not_useful'].includes(status);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                  <span className="font-medium">{job.source}</span>
                  {job.category && (
                    <span className={`px-2 py-1 text-xs rounded ${
                      job.category === 'mern' ? 'bg-blue-100 text-blue-800' :
                      job.category === 'crypto' ? 'bg-green-100 text-green-800' :
                      job.category === 'rust' ? 'bg-orange-100 text-orange-800' :
                      job.category === 'backend' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {job.category}
                    </span>
                  )}
                  <span className={`font-semibold ${
                    job.score >= 80 ? 'text-green-600' :
                    job.score >= 60 ? 'text-yellow-600' :
                    'text-gray-600'
                  }`}>
                    Score: {job.score}/100
                  </span>
                  {getStatusBadge(job.status)}
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Description</h4>
              <div className="text-sm text-gray-600 max-h-64 overflow-y-auto bg-gray-50 p-4 rounded border">
                <p className="whitespace-pre-wrap">{job.description}</p>
              </div>
            </div>

            {job.matchedSkills && job.matchedSkills.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Matched Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {job.matchedSkills.map((skill: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-gray-500">
                Discovered: {new Date(job.discoveredAt).toLocaleString()}
                {job.postedAt && ` • Posted: ${new Date(job.postedAt).toLocaleDateString()}`}
              </div>
              <div className="flex space-x-2">
                <a
                  href={job.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  View Original
                </a>
                {!isNonApplicableStatus(job.status) && job.status !== 'applied' && job.status !== 'replied' && (
                  <button
                    onClick={() => {
                      onApply(job.id, 'applied');
                      onClose();
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    Mark Applied
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
