'use client'

import React, { useEffect, useState } from 'react'
import { getLibrarySettings, updateLibrarySettings, LibrarySettingsData } from '@/app/actions/librarySettingsActions'

function SystemPage() {
  const [settings, setSettings] = useState<LibrarySettingsData>({
    borrowingLimit: 5,
    loanPeriodDays: 14,
    finePerDay: 1.0,
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Effect to fetch current settings
  useEffect(() => {
    async function fetchSettings() {
      try {
        const result = await getLibrarySettings();
        if (result.success && result.data) {
          setSettings(result.data);
        } else {
          setError(result.error || 'Failed to load settings');
        }
      } catch (err) {
        setError('Failed to load settings');
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings({ ...settings, [name]: Number(value) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    
    try {
      const result = await updateLibrarySettings(settings);
      if (result.success) {
        setMessage(result.message || 'Settings updated successfully!');
        if (result.data) {
          setSettings(result.data);
        }
      } else {
        setError(result.error || 'Failed to update settings');
      }
    } catch (err) {
      setError('Failed to update settings');
    }
  };

  if (loading) {
    return <div>Loading settings...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">System Configuration</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Library Settings</h2>
        
        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {message}
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Borrowing Limit:
              <input
                type="number"
                name="borrowingLimit"
                value={settings.borrowingLimit}
                onChange={handleChange}
                min="1"
                max="20"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </label>
            <p className="text-sm text-gray-500">Maximum number of books a patron can borrow at once</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loan Period (Days):
              <input
                type="number"
                name="loanPeriodDays"
                value={settings.loanPeriodDays}
                onChange={handleChange}
                min="1"
                max="365"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </label>
            <p className="text-sm text-gray-500">Number of days a patron can keep a borrowed book</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fine Per Day ($):
              <input
                type="number"
                name="finePerDay"
                value={settings.finePerDay}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </label>
            <p className="text-sm text-gray-500">Fine amount charged per day for overdue books</p>
          </div>
          
          <button 
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}

export default SystemPage
