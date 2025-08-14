'use client'

import React, { useState, useEffect } from 'react'
import { User, Mail, Save, CheckCircle, AlertCircle } from 'lucide-react'
import { getPatronProfile, updatePatronProfile } from '../../actions/patronActions'

interface ProfileManagementProps {
  patronId: number
}

const ProfileManagement: React.FC<ProfileManagementProps> = ({ patronId }) => {
  const [profile, setProfile] = useState({
    patronFirstName: '',
    patronLastName: '',
    patronEmail: '',
    isStudent: false,
    isFaculty: false,
    studentProfile: null as any,
    facultyProfile: null as any,
  })
  
  // Store original profile data to reset on cancel
  const [originalProfile, setOriginalProfile] = useState(profile)

  const [editing, setEditing] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [patronId])

  const loadProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await getPatronProfile(patronId)
      
      if (result.success && result.patron) {
        const profileData = {
          patronFirstName: result.patron.patronFirstName,
          patronLastName: result.patron.patronLastName,
          patronEmail: result.patron.patronEmail,
          isStudent: result.patron.isStudent,
          isFaculty: result.patron.isFaculty,
          studentProfile: result.patron.studentProfile,
          facultyProfile: result.patron.facultyProfile,
        }
        setProfile(profileData)
        setOriginalProfile(profileData)
      } else {
        setError(result.error || 'Failed to load profile')
      }
    } catch (err) {
      setError('An error occurred while loading profile')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setProfile(prevProfile => ({
      ...prevProfile,
      [name]: value,
    }))
  }

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError(null)
    
    try {
      const result = await updatePatronProfile(patronId, {
        patronFirstName: profile.patronFirstName,
        patronLastName: profile.patronLastName,
        patronEmail: profile.patronEmail,
      })
      
      if (result.success) {
        // Update original profile with saved data
        const updatedProfile = {
          ...profile,
          patronFirstName: profile.patronFirstName,
          patronLastName: profile.patronLastName,
          patronEmail: profile.patronEmail,
        }
        setOriginalProfile(updatedProfile)
        setEditing(false)
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } else {
        setError(result.error || 'Failed to update profile')
      }
    } catch (err) {
      setError('An error occurred while updating profile')
    } finally {
      setSaving(false)
    }
  }

  const getRoleDisplay = () => {
    if (profile.isStudent) return 'Student'
    if (profile.isFaculty) return 'Faculty'
    return 'Patron'
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="h-10 bg-gray-300 rounded"></div>
              <div className="h-10 bg-gray-300 rounded"></div>
            </div>
            <div className="h-10 bg-gray-300 rounded"></div>
            <div className="h-10 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile Management</h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-700 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}
      
      <form onSubmit={handleFormSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600">First Name</label>
            <input
              type="text"
              name="patronFirstName"
              value={profile.patronFirstName}
              onChange={handleInputChange}
              disabled={!editing}
              className="mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600">Last Name</label>
            <input
              type="text"
              name="patronLastName"
              value={profile.patronLastName}
              onChange={handleInputChange}
              disabled={!editing}
              className="mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600">Email Address</label>
          <input
            type="email"
            name="patronEmail"
            value={profile.patronEmail}
            onChange={handleInputChange}
            disabled={!editing}
            className="mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600">Role</label>
          <input
            type="text"
            name="role"
            value={getRoleDisplay()}
            disabled={true}
            className="mt-1 px-3 py-2 border rounded-md bg-gray-100"
          />
        </div>

        {/* Student-specific fields */}
        {profile.isStudent && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600">Semester</label>
              <input
                type="number"
                name="studentSemester"
                value={profile.studentProfile?.studentSemester || ''}
                readOnly
                className="mt-1 px-3 py-2 border rounded-md bg-gray-100"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600">Department</label>
              <input
                type="text"
                name="studentDepartment"
                value={profile.studentProfile?.studentDepartment || ''}
                readOnly
                className="mt-1 px-3 py-2 border rounded-md bg-gray-100"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600">Roll Number</label>
              <input
                type="number"
                name="studentRollNo"
                value={profile.studentProfile?.studentRollNo || ''}
                readOnly
                className="mt-1 px-3 py-2 border rounded-md bg-gray-100"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600">Enrollment Number</label>
              <input
                type="number"
                name="studentEnrollmentNumber"
                value={profile.studentProfile?.studentEnrollmentNumber || ''}
                readOnly
                className="mt-1 px-3 py-2 border rounded-md bg-gray-100"
              />
            </div>
          </div>
        )}

        {/* Faculty-specific fields */}
        {profile.isFaculty && (
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600">Department</label>
            <input
              type="text"
              name="facultyDepartment"
              value={profile.facultyProfile?.facultyDepartment || ''}
              readOnly
              className="mt-1 px-3 py-2 border rounded-md bg-gray-100"
            />
          </div>
        )}

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              if (editing) {
                // Reset form to original values when canceling
                setProfile(originalProfile)
                setError(null)
              }
              setEditing(!editing)
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {editing ? 'Cancel' : 'Edit Profile'}
          </button>

          {editing && (
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="inline-block mr-2 h-4 w-4" /> Save
                </>
              )}
            </button>
          )}
        </div>

        {saved && (
          <div className="text-green-700 mt-4 flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            <p>Profile saved successfully.</p>
          </div>
        )}
      </form>
    </div>
  )
}

export default ProfileManagement;

