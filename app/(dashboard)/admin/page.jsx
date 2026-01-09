'use client';

import { useState, useEffect } from 'react';
import IssueCard from '@/components/IssueCard';
import IssueStatsPanel from '@/components/IssueStatsPanel';
import { firestore } from '@/lib/firebase';
import SeedButton from '@/components/SeedButton'; // Ensure this path is correct
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import WorkerStatusPanel from '@/components/WorkerStatusPanel';

export default function AdminDashboard() {
  // State for data
  const [issues, setIssues] = useState([]);
  const [workers, setWorkers] = useState([]);

  // State for UI
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [assignedIssues, setAssignedIssues] = useState({});
  const [assignedWorkers, setAssignedWorkers] = useState({});
  const [mobileTab, setMobileTab] = useState('issues');
  const [workersOpen, setWorkersOpen] = useState(false);

  // Derived State: Filter issues based on status
  // 'newIssues' are those with status 'open'
  const newIssues = issues.filter(issue => issue.status === 'open');
  // 'ongoingIssuesList' are those assigned or in progress
  const ongoingIssuesList = issues.filter(issue => issue.status === 'assigned' || issue.status === 'in_progress');

  const handleViewDetails = (issue) => {
    setSelectedIssue(issue);
  };

  // Fetch Data on Component Load
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Issues
        const issuesQuery = query(collection(firestore, "issues"), orderBy("createdAt", "desc"));
        const issuesSnapshot = await getDocs(issuesQuery);
        const fetchedIssues = issuesSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            // Transform Firebase timestamp to readable string safely
            timeAgo: data.createdAt?.toDate ? data.createdAt.toDate().toLocaleString() : 'Just now',
            // Ensure images is an array
            images: data.images || []
          };
        });
        setIssues(fetchedIssues);

        // 2. Fetch Workers
        const workersSnapshot = await getDocs(collection(firestore, "workers"));
        const fetchedWorkers = workersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setWorkers(fetchedWorkers);

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleAssignWorker = (issueId, worker) => {
    setAssignedIssues((prev) => ({
      ...prev,
      [issueId]: true,
    }));
    setAssignedWorkers((prev) => ({
      ...prev,
      [issueId]: worker,
    }));
  };

  const handleFilterChange = (status) => {
    console.log('Filter by status:', status);
  };

  return (
    <div className="pt-md pb-md md:pb-md px-md md:px-lg max-w-7xl mx-auto">

      {/* ------------------------------------------------------- */}
      {/* FIX: Button must be INSIDE this div */}
      <SeedButton />
      {/* ------------------------------------------------------- */}

      {/* Mobile Header */}
      <div className="md:hidden mb-lg">
        <div className="flex items-center gap-sm">
          <button
            onClick={() => setWorkersOpen(!workersOpen)}
            className="p-sm hover:bg-neutral-100 rounded-md transition-colors"
          >
            <span className="material-icons text-lg text-neutral-800">menu</span>
          </button>
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search issues..."
              className="w-full px-md py-sm border border-neutral-300 rounded-md text-sm focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-100"
            />
            <span className="material-icons absolute right-md top-1/2 transform -translate-y-1/2 text-neutral-400">
              search
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Side Panel for Workers */}
      {workersOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-50 top-[60px]"
          onClick={() => setWorkersOpen(false)}
        />
      )}
      <div className={`
        md:hidden fixed top-[60px] left-0 bottom-0 z-50 w-72 bg-white border-r border-neutral-200
        transform transition-transform duration-300 ease-out overflow-y-auto
        ${workersOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-lg">
          <div className="flex items-center justify-between mb-lg">
            <h3 className="text-lg font-bold text-neutral-800">Available Workers</h3>
            <button
              onClick={() => setWorkersOpen(false)}
              className="p-sm hover:bg-neutral-100 rounded-md"
            >
              <span className="material-icons">close</span>
            </button>
          </div>
          <WorkerStatusPanel />
        </div>
      </div>

      {/* Desktop Grid Layout */}
      <div className="hidden md:grid grid-cols-3 gap-lg">
        {/* LEFT COLUMN - Worker Status */}
        <div className="col-span-1">
          <WorkerStatusPanel />
        </div>

        {/* CENTER COLUMN - New Issues Feed */}
        <div className="col-span-1">
          <div className="mb-lg">
            <div className="flex items-center justify-between mb-md">
              <h2 className="text-2xl font-bold text-neutral-800">
                <span className="material-icons inline-block mr-md text-danger">priority_high</span>
                New Issues <span className="text-warning text-lg ml-sm">({newIssues.length} Pending)</span>
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

          {/* Issue Cards Feed - FIX: Use newIssues variable here */}
          <div className="space-y-md">
            {newIssues.length === 0 && <p className="text-neutral-500 text-center">No new issues.</p>}
            {newIssues.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                onViewDetails={handleViewDetails}
                onAssign={(worker) => handleAssignWorker(issue.id, worker)}
                isAssigned={assignedIssues[issue.id] || false}
                assignedWorker={assignedWorkers[issue.id]}
              />
            ))}
          </div>

          {/* Ongoing Issues Section */}
          <div className="mt-2xl">
            <div className="mb-lg">
              <div className="flex items-center justify-between mb-md">
                <h2 className="text-2xl font-bold text-neutral-800">
                  <span className="material-icons inline-block mr-md text-neutral-700">schedule</span>
                  Ongoing Issues <span className="text-warning text-lg ml-sm">({ongoingIssuesList.length} In Progress)</span>
                </h2>
              </div>
            </div>

            {/* Ongoing Issue Cards Feed - FIX: Use ongoingIssuesList variable here */}
            <div className="space-y-md">
              {ongoingIssuesList.map((issue) => (
                <IssueCard
                  key={issue.id}
                  issue={issue}
                  onViewDetails={handleViewDetails}
                  onAssign={(worker) => handleAssignWorker(issue.id, worker)}
                  isAssigned={assignedIssues[issue.id] || false}
                  assignedWorker={assignedWorkers[issue.id]}
                  hideAssign={true}
                />
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - Stats & Analytics */}
        <div className="col-span-1">
          <IssueStatsPanel onFilterChange={handleFilterChange} />
        </div>
      </div>

      {/* Mobile Tab View */}
      <div className="md:hidden">
        {/* Tabs */}
        <div className="flex border-b border-neutral-200 sticky top-[60px] bg-white z-30 -mx-md px-md">
          <button
            onClick={() => setMobileTab('issues')}
            className={`flex-1 py-md px-md border-b-2 transition-colors font-semibold text-sm ${mobileTab === 'issues'
              ? 'border-primary-700 text-primary-700'
              : 'border-transparent text-neutral-600'
              }`}
          >
            Issues
          </button>
          <button
            onClick={() => setMobileTab('status')}
            className={`flex-1 py-md px-md border-b-2 transition-colors font-semibold text-sm ${mobileTab === 'status'
              ? 'border-primary-700 text-primary-700'
              : 'border-transparent text-neutral-600'
              }`}
          >
            Status
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-lg">
          {mobileTab === 'issues' && (
            <>
              <div className="mb-lg">
                <div className="flex items-center justify-between mb-md">
                  <h2 className="text-2xl font-bold text-neutral-800">
                    <span className="material-icons inline-block mr-md text-danger">priority_high</span>
                    New Issues <span className="text-warning text-lg ml-sm">({newIssues.length} Pending)</span>
                  </h2>
                </div>
                {/* ... filters ... */}
              </div>

              {/* Issue Cards Feed - FIX: Use newIssues */}
              <div className="space-y-md mb-2xl">
                {newIssues.map((issue) => (
                  <IssueCard
                    key={issue.id}
                    issue={issue}
                    onViewDetails={handleViewDetails}
                    onAssign={(worker) => handleAssignWorker(issue.id, worker)}
                    isAssigned={assignedIssues[issue.id] || false}
                    assignedWorker={assignedWorkers[issue.id]}
                  />
                ))}
              </div>

              {/* Ongoing Issues Section */}
              <div>
                <div className="mb-lg">
                  <div className="flex items-center justify-between mb-md">
                    <h2 className="text-2xl font-bold text-neutral-800">
                      <span className="material-icons inline-block mr-md text-neutral-700">schedule</span>
                      Ongoing Issues <span className="text-warning text-lg ml-sm">({ongoingIssuesList.length} In Progress)</span>
                    </h2>
                  </div>
                </div>

                {/* Ongoing Issue Cards Feed - FIX: Use ongoingIssuesList */}
                <div className="space-y-md">
                  {ongoingIssuesList.map((issue) => (
                    <IssueCard
                      key={issue.id}
                      issue={issue}
                      onViewDetails={handleViewDetails}
                      onAssign={(worker) => handleAssignWorker(issue.id, worker)}
                      isAssigned={assignedIssues[issue.id] || false}
                      assignedWorker={assignedWorkers[issue.id]}
                      hideAssign={true}
                    />
                  ))}
                </div>
              </div>
            </>
          )}

          {mobileTab === 'status' && (
            <>
              <div className="mb-lg">
                <h3 className="text-lg font-bold text-neutral-800 mb-md flex items-center gap-sm">
                  <span className="material-icons">dashboard</span>
                  Issue Status
                </h3>
                <IssueStatsPanel onFilterChange={handleFilterChange} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}