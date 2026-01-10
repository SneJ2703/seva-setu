'use client';

import { useState, useEffect } from 'react';
import { database } from '@/lib/firebase';
import { ref, push, set, onValue } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

// Category mapping for display names
const categoryLabels = {
  pothole: 'Pothole on Road',
  garbage: 'Garbage Dump',
  'street-light': 'Street Light Issue',
  water: 'Water Leakage',
  other: 'Other Issue',
};

// Helper function to safely render values that might be objects
const safeString = (value) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') return value.name || value.title || JSON.stringify(value);
  return String(value);
};

export default function UserDashboard() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [userReports, setUserReports] = useState([]);
  const [formData, setFormData] = useState({
    category: '',
    location: '',
    description: '',
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoName, setPhotoName] = useState('');

  // Fetch user's reports from Realtime Database
  useEffect(() => {
    const issuesRef = ref(database, 'issues');

    const unsubscribe = onValue(issuesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const reports = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
          createdAt: value.createdAt
            ? new Date(value.createdAt).toLocaleString()
            : 'Just now',
        }));
        // Sort by createdAt descending and take first 10
        reports.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setUserReports(reports.slice(0, 10));
      } else {
        setUserReports([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const statusConfig = {
    pending: { label: 'Pending', color: 'bg-neutral-100 text-neutral-700', icon: 'schedule' },
    open: { label: 'Open', color: 'bg-neutral-100 text-neutral-700', icon: 'schedule' },
    assigned: { label: 'Assigned', color: 'bg-primary-100 text-primary-700', icon: 'person' },
    'in-progress': { label: 'In Progress', color: 'bg-warning-100 text-warning-700', icon: 'build' },
    in_progress: { label: 'In Progress', color: 'bg-warning-100 text-warning-700', icon: 'build' },
    resolved: { label: 'Resolved', color: 'bg-success-100 text-success-700', icon: 'check_circle' },
  };

  const handleCategoryChange = (e) => {
    setFormData({ ...formData, category: e.target.value });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoName(file.name);
    }
  };

  const handleViewDetails = (report) => {
    setSelectedReport(report);
    setShowDetailModal(true);
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.category || !formData.location || !formData.description) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = '';

      // 1. Upload Image to Firebase Storage (if photo exists)
      if (photoFile) {
        try {
          const storage = getStorage();
          const imageRefPath = storageRef(storage, `issues/${Date.now()}_${photoFile.name}`);
          const uploadResult = await uploadBytes(imageRefPath, photoFile);
          imageUrl = await getDownloadURL(uploadResult.ref);
        } catch (storageError) {
          console.warn('Image upload failed, continuing without image:', storageError);
        }
      }

      // 2. Generate title from category
      const title = categoryLabels[formData.category] || 'Issue Report';

      // 3. Save Issue Data to Realtime Database
      const issuesRef = ref(database, 'issues');
      const newIssueRef = push(issuesRef);
      await set(newIssueRef, {
        title: title,
        category: formData.category,
        location: formData.location,
        description: formData.description,
        imageUrl: imageUrl,
        status: 'open',
        priority: 'medium',
        ward: 'Ward 42',
        address: formData.location,
        reportedBy: 'Guest User',
        createdAt: Date.now(),
      });

      console.log('Issue submitted successfully');
      setShowReportModal(false);
      setFormData({ category: '', location: '', description: '' });
      setPhotoFile(null);
      setPhotoName('');
      alert('Issue Submitted Successfully!');

    } catch (error) {
      console.error('Error submitting issue:', error);
      alert('Error submitting issue: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-lg pb-24 md:pb-lg px-md md:px-lg bg-neutral-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="mb-2xl">
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-sm flex items-center gap-md">
            Hello, User <span className="text-3xl">👋</span>
          </h1>
          <p className="text-neutral-600 flex items-center gap-sm">
            <span className="material-icons text-lg">location_on</span>
            Ward 42 · Indiranagar
          </p>
        </div>

        {/* Report New Issue CTA */}
        <div className="grid md:grid-cols-2 gap-lg mb-2xl">
          <button
            onClick={() => setShowReportModal(true)}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg p-2xl md:p-3xl shadow-md hover:shadow-lg transition-all duration-200 flex flex-col items-center justify-center group text-center"
          >
            <span className="material-icons text-6xl md:text-7xl text-orange-200 group-hover:text-orange-100 transition-colors mb-md">camera_alt</span>
            <p className="text-lg md:text-xl font-bold">Take a Photo</p>
            <p className="text-sm text-orange-100 mt-sm">Snap and report instantly</p>
          </button>

          <button
            onClick={() => setShowReportModal(true)}
            className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg p-2xl md:p-3xl shadow-md hover:shadow-lg transition-all duration-200 flex flex-col items-center justify-center group text-center"
          >
            <span className="material-icons text-6xl md:text-7xl text-primary-200 group-hover:text-primary-100 transition-colors mb-md">edit_note</span>
            <p className="text-lg md:text-xl font-bold">Write Report</p>
            <p className="text-sm text-primary-100 mt-sm">Describe in detail</p>
          </button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-md mb-2xl">
          <div className="bg-white rounded-lg p-lg border border-neutral-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer hover:border-primary-300">
            <span className="material-icons text-2xl text-primary-700 mb-sm block">place</span>
            <p className="font-semibold text-neutral-800 text-sm">View Nearby Issues</p>
            <p className="text-xs text-neutral-500 mt-sm">See community reports</p>
          </div>

          <div className="bg-white rounded-lg p-lg border border-neutral-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer hover:border-primary-300">
            <span className="material-icons text-2xl text-primary-700 mb-sm block">assignment</span>
            <p className="font-semibold text-neutral-800 text-sm">My Reports</p>
            <p className="text-xs text-neutral-500 mt-sm">Track your submissions</p>
          </div>
        </div>

        {/* Recent Reports Section */}
        <div>
          <h2 className="text-xl font-bold text-neutral-800 mb-md flex items-center gap-sm">
            <span className="material-icons">history</span>
            Recent Reports
          </h2>

          <div className="space-y-md">
            {userReports.length === 0 ? (
              <p className="text-neutral-500 text-center py-lg">No reports yet. Submit your first issue!</p>
            ) : (
              userReports.map((report) => {
                const status = statusConfig[report.status] || statusConfig.pending;
                return (
                  <div key={report.id} className="bg-white rounded-lg p-lg border border-neutral-200 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-start justify-between gap-md mb-md">
                      <div className="flex-1">
                        <div className="flex items-center gap-sm mb-sm">
                          <h3 className="font-bold text-neutral-800">{report.title}</h3>
                          <span className={`inline-flex items-center gap-xs px-2 py-1 rounded text-xs font-semibold ${status.color}`}>
                            <span className="material-icons text-sm">{status.icon}</span>
                            {status.label}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-600 mb-sm line-clamp-2">{report.description}</p>
                        <p className="text-xs text-neutral-500 flex items-center gap-sm">
                          <span className="material-icons text-sm">location_on</span>
                          {report.location || report.address}
                        </p>
                      </div>
                    </div>
                    <div className="pt-md border-t border-neutral-200">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-neutral-500 flex items-center gap-sm">
                          <span className="material-icons text-sm">access_time</span>
                          {report.createdAt}
                        </p>
                        <button
                          onClick={() => handleViewDetails(report)}
                          className="text-sm font-semibold text-primary-700 hover:text-primary-800 flex items-center gap-sm"
                        >
                          View Details
                          <span className="material-icons text-sm">arrow_forward</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Report Issue Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-md z-50">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-neutral-200 px-lg py-md flex items-center justify-between">
              <h3 className="text-xl font-bold text-neutral-800">Report New Issue</h3>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-neutral-500 hover:text-neutral-700 transition-colors"
              >
                <span className="material-icons">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitReport} className="p-lg space-y-lg">
              {/* Category */}
              <div>
                <label className="block text-sm font-bold text-neutral-800 mb-sm">Category *</label>
                <select
                  value={formData.category}
                  onChange={handleCategoryChange}
                  required
                  className="w-full px-md py-md border border-neutral-300 rounded-lg focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-200 transition-all bg-white"
                >
                  <option value="">Select a category...</option>
                  <option value="pothole">Pothole</option>
                  <option value="garbage">Garbage Dump</option>
                  <option value="street-light">Street Light</option>
                  <option value="water">Water Leakage</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-bold text-neutral-800 mb-sm">Location *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., CMH Road, Ward 42"
                  className="w-full px-md py-md border border-neutral-300 rounded-lg focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-200 transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-neutral-800 mb-sm">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  placeholder="Describe the issue in detail..."
                  rows={5}
                  className="w-full px-md py-md border border-neutral-300 rounded-lg focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-200 transition-all resize-none"
                />
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-bold text-neutral-800 mb-sm">Photo (Optional)</label>
                <label className="border-2 border-dashed border-neutral-300 hover:border-primary-500 transition-colors rounded-lg p-lg flex flex-col items-center justify-center cursor-pointer bg-neutral-50 hover:bg-primary-50">
                  <span className="material-icons text-4xl text-neutral-400 mb-sm">camera_alt</span>
                  <p className="text-sm font-semibold text-neutral-700 text-center">
                    {photoName ? photoName : 'Take or upload a photo'}
                  </p>
                  <p className="text-xs text-neutral-500 mt-sm">Click to select or drag & drop</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary-700 hover:bg-primary-800 disabled:bg-neutral-400 text-white font-bold py-md rounded-lg transition-colors mt-lg flex items-center justify-center gap-sm"
              >
                {isSubmitting ? (
                  <>
                    <span className="material-icons animate-spin">refresh</span>
                    Submitting...
                  </>
                ) : (
                  'Submit Issue'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showDetailModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-md z-50">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-neutral-200 px-lg py-md flex items-center justify-between">
              <h3 className="text-xl font-bold text-neutral-800">Issue Details</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-neutral-500 hover:text-neutral-700 transition-colors"
              >
                <span className="material-icons">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-lg space-y-lg">
              {/* Image */}
              {selectedReport.imageUrl && (
                <div className="rounded-lg overflow-hidden">
                  <img
                    src={selectedReport.imageUrl}
                    alt={selectedReport.title}
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}

              {/* Title & Status */}
              <div>
                <div className="flex items-center gap-sm mb-sm">
                  <h4 className="text-lg font-bold text-neutral-800">{safeString(selectedReport.title)}</h4>
                  <span className={`inline-flex items-center gap-xs px-2 py-1 rounded text-xs font-semibold ${(statusConfig[selectedReport.status] || statusConfig.pending).color}`}>
                    {(statusConfig[selectedReport.status] || statusConfig.pending).label}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <p className="text-xs font-bold text-neutral-500 mb-sm">DESCRIPTION</p>
                <p className="text-neutral-700">{safeString(selectedReport.description)}</p>
              </div>

              {/* Location */}
              <div>
                <p className="text-xs font-bold text-neutral-500 mb-sm">LOCATION</p>
                <p className="text-neutral-700 flex items-center gap-sm">
                  <span className="material-icons text-lg">location_on</span>
                  {safeString(selectedReport.location || selectedReport.address)}
                </p>
                <p className="text-sm text-neutral-500 ml-6">{safeString(selectedReport.ward)}</p>
              </div>

              {/* Reported Info */}
              <div className="grid grid-cols-2 gap-md pt-md border-t border-neutral-200">
                <div>
                  <p className="text-xs font-bold text-neutral-500 mb-sm">REPORTED BY</p>
                  <p className="text-neutral-700">{safeString(selectedReport.reportedBy) || 'Guest User'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-500 mb-sm">DATE</p>
                  <p className="text-neutral-700">{safeString(selectedReport.createdAt)}</p>
                </div>
              </div>

              {/* Assigned Worker (if any) */}
              {selectedReport.assignedWorker && (
                <div className="pt-md border-t border-neutral-200">
                  <p className="text-xs font-bold text-neutral-500 mb-sm">ASSIGNED TO</p>
                  <p className="text-neutral-700">Worker ID: {selectedReport.assignedWorker}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
