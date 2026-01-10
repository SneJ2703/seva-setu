'use client';

import { useIssues } from '@/lib/hooks/useIssues';
import { useWorkers } from '@/lib/hooks/useWorkers';
import IssueCard from '@/components/IssueCard';
import IssueStatsPanel from '@/components/IssueStatsPanel';
import WorkerStatusPanel from '@/components/WorkerStatusPanel';
import SeedButton from '@/components/SeedButton';

export default function AdminDashboard() {
  const { issues, loading, assignWorker } = useIssues();
  const { workers } = useWorkers();

  const handleAssignWorker = async (issueId, workerId) => {
    try {
      await assignWorker(issueId, workerId);
      // UI updates automatically via real-time listener
    } catch (error) {
      console.error('Failed to assign worker:', error);
    }
  };

  // Filter issues by status
  const openIssues = issues.filter(issue => issue.status === 'open');
  const assignedIssues = issues.filter(issue => issue.status === 'assigned' || issue.status === 'in_progress');

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="pt-md pb-md md:pb-md px-md md:px-lg max-w-7xl mx-auto">
      {/* Seed Button for testing */}
      <SeedButton />

      {/* Desktop Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        {/* LEFT COLUMN - Worker Status */}
        <div className="lg:col-span-1">
          <WorkerStatusPanel workers={workers} />
        </div>

        {/* CENTER COLUMN - Issues Feed */}
        <div className="lg:col-span-1">
          <div className="mb-lg">
            <div className="flex items-center justify-between mb-md">
              <h2 className="text-2xl font-bold text-neutral-800">
                <span className="material-icons inline-block mr-md text-danger">priority_high</span>
                New Issues <span className="text-warning text-lg ml-sm">({openIssues.length} Pending)</span>
              </h2>
            </div>

            <div className="flex flex-wrap gap-sm mb-md">
              <button className="px-md py-sm border border-neutral-300 rounded-md text-sm hover:border-primary-700 transition-colors flex items-center gap-sm">
                <span className="material-icons text-sm">tune</span>
                Filter
              </button>
              <button className="px-md py-sm border border-neutral-300 rounded-md text-sm hover:border-primary-700 transition-colors flex items-center gap-sm">
                <span className="material-icons text-sm">sort</span>
                Sort
              </button>
              <button className="px-md py-sm border border-neutral-300 rounded-md text-sm hover:border-primary-700 transition-colors flex items-center gap-sm">
                <span className="material-icons text-sm">refresh</span>
                Refresh
              </button>
            </div>
          </div>

          {/* Issue Cards Feed */}
          <div className="space-y-md">
            {openIssues.length === 0 && <p className="text-neutral-500 text-center">No new issues.</p>}
            {openIssues.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                workers={workers}
                onViewDetails={(issue) => console.log('View details:', issue)}
                onAssign={(worker) => handleAssignWorker(issue.id, worker.id)}
              />
            ))}
          </div>

          {/* Ongoing Issues Section */}
          <div className="mt-2xl">
            <div className="mb-lg">
              <div className="flex items-center justify-between mb-md">
                <h2 className="text-2xl font-bold text-neutral-800">
                  <span className="material-icons inline-block mr-md text-neutral-700">schedule</span>
                  Ongoing Issues <span className="text-warning text-lg ml-sm">({assignedIssues.length} In Progress)</span>
                </h2>
              </div>
            </div>

            <div className="space-y-md">
              {assignedIssues.map((issue) => (
                <IssueCard
                  key={issue.id}
                  issue={issue}
                  workers={workers}
                  onViewDetails={(issue) => console.log('View details:', issue)}
                  onAssign={(worker) => handleAssignWorker(issue.id, worker.id)}
                  hideAssign={true}
                />
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - Stats & Analytics */}
        <div className="lg:col-span-1">
          <IssueStatsPanel issues={issues} />
        </div>
      </div>
    </div>
  );
}