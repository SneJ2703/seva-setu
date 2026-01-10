'use client';

import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';

// Sample data to seed the database
const sampleIssues = [
  {
    title: 'Broken Water Pipe',
    description: 'Major water leak on MG Road causing flooding on the street. Urgent repair needed.',
    category: 'water',
    priority: 'urgent',
    status: 'open',
    ward: 'Ward 5',
    location: 'MG Road',
    address: 'Near Central Mall, MG Road, Bangalore',
    reportedBy: 'Rahul Sharma',
  },
  {
    title: 'Street Light Not Working',
    description: 'Street lights have been off for 3 days in the residential area. Safety concern for residents.',
    category: 'electricity',
    priority: 'medium',
    status: 'open',
    ward: 'Ward 12',
    location: 'Jayanagar 4th Block',
    address: '4th Cross, Jayanagar 4th Block',
    reportedBy: 'Priya Menon',
  },
  {
    title: 'Pothole on Main Road',
    description: 'Large pothole causing accidents. Multiple vehicles have been damaged.',
    category: 'road',
    priority: 'urgent',
    status: 'assigned',
    ward: 'Ward 8',
    location: 'Indiranagar',
    address: '100 Feet Road, Indiranagar',
    reportedBy: 'Arun Kumar',
  },
  {
    title: 'Garbage Not Collected',
    description: 'Garbage has not been collected for a week. Bad smell and health hazard.',
    category: 'sanitation',
    priority: 'medium',
    status: 'in_progress',
    ward: 'Ward 3',
    location: 'Koramangala',
    address: '5th Block, Koramangala',
    reportedBy: 'Meera Reddy',
  },
];

const sampleWorkers = [
  { name: 'Ravi Kumar', department: 'Water', status: 'free', phone: '9876543210' },
  { name: 'Priya Singh', department: 'Electricity', status: 'onsite', phone: '9876543211' },
  { name: 'Arjun Patel', department: 'Roads', status: 'free', phone: '9876543212' },
  { name: 'Lakshmi Nair', department: 'Sanitation', status: 'break', phone: '9876543213' },
];

export default function SeedButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const seedDatabase = async () => {
    setLoading(true);
    setMessage('');

    try {
      // Seed issues
      for (const issue of sampleIssues) {
        await addDoc(collection(firestore, 'issues'), {
          ...issue,
          createdAt: serverTimestamp(),
        });
      }

      // Seed workers
      for (const worker of sampleWorkers) {
        await addDoc(collection(firestore, 'workers'), {
          ...worker,
          createdAt: serverTimestamp(),
        });
      }

      setMessage(`✅ Successfully added ${sampleIssues.length} issues and ${sampleWorkers.length} workers!`);
    } catch (error) {
      console.error('Error seeding database:', error);
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-lg">
      <button
        onClick={seedDatabase}
        disabled={loading}
        className="px-md py-sm bg-primary-700 text-white rounded-md font-semibold hover:bg-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm flex items-center gap-sm"
      >
        <span className="material-icons text-lg">
          {loading ? 'hourglass_empty' : 'add_circle'}
        </span>
        {loading ? 'Seeding...' : 'Seed Sample Data'}
      </button>
      {message && (
        <p className={`mt-sm text-sm ${message.startsWith('✅') ? 'text-success' : 'text-danger'}`}>
          {message}
        </p>
      )}
    </div>
  );
}