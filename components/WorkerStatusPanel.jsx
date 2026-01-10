'use client';

import { useState } from 'react';

// Helper function to safely render values that might be objects
const safeString = (value) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

export default function WorkerStatusPanel({ workers = [] }) {
  const [showAllWorkers, setShowAllWorkers] = useState(false);

  // Calculate status counts from actual workers data
  const statusCounts = {
    free: workers.filter(w => w.status === 'free').length,
    onsite: workers.filter(w => w.status === 'onsite').length,
    break: workers.filter(w => w.status === 'break').length,
  };

  // Calculate department counts from actual workers data
  const departmentCounts = workers.reduce((acc, worker) => {
    const dept = worker.department || 'Unassigned';
    if (!acc[dept]) {
      acc[dept] = { count: 0, workers: [] };
    }
    acc[dept].count++;
    acc[dept].workers.push(worker);
    return acc;
  }, {});

  const getStatusIcon = (status) => {
    switch (status) {
      case 'free':
        return 'check_circle';
      case 'onsite':
        return 'assignment_ind';
      case 'break':
        return 'schedule';
      default:
        return 'help';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'free':
        return 'text-success';
      case 'onsite':
        return 'text-primary-700';
      case 'break':
        return 'text-warning';
      default:
        return 'text-neutral-500';
    }
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-lg h-fit sticky top-[80px] md:top-[80px]">
      {/* Header */}
      <h3 className="text-lg font-bold text-neutral-800 mb-md flex items-center justify-between">
        Available Workers
      </h3>

      {/* Total */}
      <p className="text-sm text-neutral-500 mb-md">Total: {workers.length} Workers Online</p>

      {/* Status Breakdown */}
      <div className="bg-white border border-neutral-200 rounded-lg p-md mb-lg">
        <div className="flex items-center justify-between mb-sm">
          <span className="text-sm text-neutral-700 flex items-center gap-2">
            <span className="text-success">
              <span className="material-icons text-lg">check_circle</span>
            </span>
            Free
          </span>
          <span className="text-sm font-bold text-neutral-800">{statusCounts.free}</span>
        </div>
        <div className="flex items-center justify-between mb-sm">
          <span className="text-sm text-neutral-700 flex items-center gap-2">
            <span className="text-primary-700">
              <span className="material-icons text-lg">assignment_ind</span>
            </span>
            On-site
          </span>
          <span className="text-sm font-bold text-neutral-800">{statusCounts.onsite}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-700 flex items-center gap-2">
            <span className="text-warning">
              <span className="material-icons text-lg">schedule</span>
            </span>
            On Break
          </span>
          <span className="text-sm font-bold text-neutral-800">{statusCounts.break}</span>
        </div>
      </div>

      {/* View All Workers Button */}
      <button
        onClick={() => setShowAllWorkers(!showAllWorkers)}
        className="w-full text-primary-700 text-sm font-semibold hover:text-primary-800 mb-lg flex items-center justify-center gap-sm"
      >
        <span className="material-icons text-lg">people</span>
        {showAllWorkers ? 'Hide Workers' : 'View All Workers'}
        <span className="material-icons text-sm">{showAllWorkers ? 'expand_less' : 'expand_more'}</span>
      </button>

      {/* Individual Workers List (expandable) */}
      {showAllWorkers && (
        <div className="mb-lg border border-neutral-200 rounded-lg p-md max-h-[300px] overflow-y-auto">
          <p className="text-xs font-bold text-neutral-500 mb-sm">ALL WORKERS</p>
          {workers.length === 0 ? (
            <p className="text-sm text-neutral-500 text-center py-md">No workers found</p>
          ) : (
            workers.map((worker) => (
              <div key={worker.id} className="flex items-center gap-2 py-sm border-b border-neutral-100 last:border-b-0">
                <span className={`material-icons text-lg ${getStatusColor(worker.status)}`}>
                  {getStatusIcon(worker.status)}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-neutral-800">{safeString(worker.name)}</p>
                  <p className="text-xs text-neutral-500">{safeString(worker.department) || 'Unassigned'}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded ${worker.status === 'free' ? 'bg-success-100 text-success-700' :
                  worker.status === 'onsite' ? 'bg-primary-100 text-primary-700' :
                    'bg-warning-100 text-warning-700'
                  }`}>
                  {worker.status === 'free' ? 'Free' : worker.status === 'onsite' ? 'On-site' : 'Break'}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Department Breakdown */}
      <h4 className="text-sm font-bold text-neutral-700 mb-md">Department-wise</h4>
      <div className="space-y-md">
        {Object.entries(departmentCounts).map(([dept, data]) => (
          <div key={dept} className="flex items-center justify-between">
            <span className="text-sm text-neutral-700">{dept}</span>
            <div className="flex items-center gap-sm">
              <span className="text-xs font-bold text-neutral-800">{data.count}</span>
              <span className="text-success">
                <span className="material-icons text-lg">check_circle</span>
              </span>
            </div>
          </div>
        ))}
        {Object.keys(departmentCounts).length === 0 && (
          <p className="text-sm text-neutral-500 text-center">No workers to display</p>
        )}
      </div>
    </div>
  );
}
