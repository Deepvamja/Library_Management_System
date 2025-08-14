'use client'

import React, { useState, useEffect } from 'react'
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  changeUserRole,
  getUserStatistics,
  resetUserPassword
} from '@/app/actions/userManagementActions'
import { UserRole, UserData } from '@/types/userTypes'

function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingUser, setEditingUser] = useState<UserData | null>(null)
  const [formData, setFormData] = useState<UserData>({
    email: '',
    firstName: '',
    lastName: '',
    role: UserRole.PATRON,
    isStudent: false,
    isFaculty: false,
    department: '',
    semester: undefined,
    rollNo: undefined,
    enrollmentNumber: undefined
  })

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const result = await getAllUsers()
      if (result.success) {
        setUsers(result.data)
      } else {
        setError(result.error || 'Failed to load users')
        // Show demo data when database is not available
        setUsers([
          { id: 1, email: 'admin@library.com', firstName: 'System', lastName: 'Admin', role: UserRole.ADMIN },
          { id: 2, email: 'librarian@library.com', firstName: 'John', lastName: 'Librarian', role: UserRole.LIBRARIAN },
          { id: 3, email: 'student@library.com', firstName: 'Jane', lastName: 'Student', role: UserRole.PATRON, isStudent: true, department: 'Computer Science' },
          { id: 4, email: 'faculty@library.com', firstName: 'Dr. Smith', lastName: 'Professor', role: UserRole.PATRON, isFaculty: true, department: 'Mathematics' }
        ])
      }
    } catch (err) {
      console.error('Error loading users:', err)
      setError('Failed to load users')
      // Show demo data
      setUsers([
        { id: 1, email: 'admin@library.com', firstName: 'System', lastName: 'Admin', role: UserRole.ADMIN },
        { id: 2, email: 'librarian@library.com', firstName: 'John', lastName: 'Librarian', role: UserRole.LIBRARIAN },
        { id: 3, email: 'student@library.com', firstName: 'Jane', lastName: 'Student', role: UserRole.PATRON, isStudent: true, department: 'Computer Science' },
        { id: 4, email: 'faculty@library.com', firstName: 'Dr. Smith', lastName: 'Professor', role: UserRole.PATRON, isFaculty: true, department: 'Mathematics' }
      ])
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const result = await getUserStatistics()
      if (result.success) {
        setStats(result.data)
      } else {
        // Show demo stats when database is not available
        setStats({
          admins: 1,
          librarians: 1,
          patrons: 2,
          students: 1,
          faculty: 1,
          totalUsers: 4
        })
      }
    } catch (err) {
      console.error('Error fetching user statistics:', err)
      // Show demo stats
      setStats({
        admins: 1,
        librarians: 1,
        patrons: 2,
        students: 1,
        faculty: 1,
        totalUsers: 4
      })
    }
  }

  const handleCreateUser = async () => {
    try {
      const result = await createUser(formData)
      if (result.success) {
        setMessage('User created successfully!')
        setShowCreateModal(false)
        resetForm()
        fetchUsers()
        fetchStats()
      } else {
        setError(result.error || 'Failed to create user')
      }
    } catch (err) {
      setError('Failed to create user')
    }
  }

  const handleEditUser = async () => {
    if (!editingUser?.id) return
    
    try {
      const result = await updateUser(editingUser.id, formData)
      if (result.success) {
        setMessage('User updated successfully!')
        setShowEditModal(false)
        setEditingUser(null)
        resetForm()
        fetchUsers()
      } else {
        setError(result.error || 'Failed to update user')
      }
    } catch (err) {
      setError('Failed to update user')
    }
  }

  const handleDeleteUser = async (userId: number, role: UserRole) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    
    try {
      const result = await deleteUser(userId, role)
      if (result.success) {
        setMessage('User deleted successfully!')
        fetchUsers()
        fetchStats()
      } else {
        setError(result.error || 'Failed to delete user')
      }
    } catch (err) {
      setError('Failed to delete user')
    }
  }

  const handleResetPassword = async (userId: number, role: UserRole) => {
    if (!confirm('Are you sure you want to reset this user\'s password?')) return
    
    try {
      const result = await resetUserPassword(userId, role)
      if (result.success) {
        setMessage(`Password reset successfully! Temporary password: ${result.data?.temporaryPassword}`)
      } else {
        setError(result.error || 'Failed to reset password')
      }
    } catch (err) {
      setError('Failed to reset password')
    }
  }

  const openEditModal = (user: UserData) => {
    setEditingUser(user)
    setFormData({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isStudent: user.isStudent || false,
      isFaculty: user.isFaculty || false,
      department: user.department || '',
      semester: user.semester,
      rollNo: user.rollNo,
      enrollmentNumber: user.enrollmentNumber
    })
    setShowEditModal(true)
  }

  const resetForm = () => {
    setFormData({
      email: '',
      firstName: '',
      lastName: '',
      role: UserRole.PATRON,
      isStudent: false,
      isFaculty: false,
      department: '',
      semester: undefined,
      rollNo: undefined,
      enrollmentNumber: undefined
    })
  }

  useEffect(() => {
    fetchUsers()
    fetchStats()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">User Management</h1>
        <p className="text-purple-100">Manage library users by adding, editing, deleting, and assigning roles</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {message}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Users Overview</h2>
          <p className="text-sm text-gray-600">Total Counts of Users</p>
        </div>
        <div className="p-6">
          {stats && (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{stats.admins}</p>
                <p className="text-sm text-gray-600">Admins</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{stats.librarians}</p>
                <p className="text-sm text-gray-600">Librarians</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{stats.patrons}</p>
                <p className="text-sm text-gray-600">Patrons</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{stats.students}</p>
                <p className="text-sm text-gray-600">Students</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{stats.faculty}</p>
                <p className="text-sm text-gray-600">Faculty</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Users List</h2>
            <p className="text-sm text-gray-600">Manage all user accounts</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Add User</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user: UserData) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                    {user.department && (
                      <div className="text-xs text-gray-500">{user.department}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === UserRole.ADMIN ? 'bg-red-100 text-red-800' :
                      user.role === UserRole.LIBRARIAN ? 'bg-green-100 text-green-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {user.isStudent ? 'Student' : user.isFaculty ? 'Faculty' : 'General'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => openEditModal(user)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => user.id && handleResetPassword(user.id, user.role)}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-xs"
                      >
                        Reset Password
                      </button>
                      <button 
                        onClick={() => user.id && handleDeleteUser(user.id, user.role)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New User</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="border rounded px-3 py-2 w-full"
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="border rounded px-3 py-2 w-full"
                  />
                </div>
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="border rounded px-3 py-2 w-full"
                />
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value as UserRole})}
                  className="border rounded px-3 py-2 w-full"
                >
                  <option value={UserRole.PATRON}>Patron</option>
                  <option value={UserRole.LIBRARIAN}>Librarian</option>
                  <option value={UserRole.ADMIN}>Admin</option>
                </select>
                
                {formData.role === UserRole.PATRON && (
                  <div className="space-y-3">
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.isStudent}
                          onChange={(e) => setFormData({...formData, isStudent: e.target.checked, isFaculty: false})}
                          className="mr-2"
                        />
                        Student
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.isFaculty}
                          onChange={(e) => setFormData({...formData, isFaculty: e.target.checked, isStudent: false})}
                          className="mr-2"
                        />
                        Faculty
                      </label>
                    </div>
                    {(formData.isStudent || formData.isFaculty) && (
                      <input
                        type="text"
                        placeholder="Department"
                        value={formData.department}
                        onChange={(e) => setFormData({...formData, department: e.target.value})}
                        className="border rounded px-3 py-2 w-full"
                      />
                    )}
                    {formData.isStudent && (
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="number"
                          placeholder="Semester"
                          value={formData.semester || ''}
                          onChange={(e) => setFormData({...formData, semester: parseInt(e.target.value)})}
                          className="border rounded px-3 py-2 w-full"
                        />
                        <input
                          type="number"
                          placeholder="Roll No"
                          value={formData.rollNo || ''}
                          onChange={(e) => setFormData({...formData, rollNo: parseInt(e.target.value)})}
                          className="border rounded px-3 py-2 w-full"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {setShowCreateModal(false); resetForm();}}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateUser}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  Create User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit User</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="border rounded px-3 py-2 w-full"
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="border rounded px-3 py-2 w-full"
                  />
                </div>
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="border rounded px-3 py-2 w-full"
                />
                
                {formData.role === UserRole.PATRON && (
                  <div className="space-y-3">
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.isStudent}
                          onChange={(e) => setFormData({...formData, isStudent: e.target.checked, isFaculty: false})}
                          className="mr-2"
                        />
                        Student
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.isFaculty}
                          onChange={(e) => setFormData({...formData, isFaculty: e.target.checked, isStudent: false})}
                          className="mr-2"
                        />
                        Faculty
                      </label>
                    </div>
                    {(formData.isStudent || formData.isFaculty) && (
                      <input
                        type="text"
                        placeholder="Department"
                        value={formData.department}
                        onChange={(e) => setFormData({...formData, department: e.target.value})}
                        className="border rounded px-3 py-2 w-full"
                      />
                    )}
                    {formData.isStudent && (
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="number"
                          placeholder="Semester"
                          value={formData.semester || ''}
                          onChange={(e) => setFormData({...formData, semester: parseInt(e.target.value)})}
                          className="border rounded px-3 py-2 w-full"
                        />
                        <input
                          type="number"
                          placeholder="Roll No"
                          value={formData.rollNo || ''}
                          onChange={(e) => setFormData({...formData, rollNo: parseInt(e.target.value)})}
                          className="border rounded px-3 py-2 w-full"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {setShowEditModal(false); setEditingUser(null); resetForm();}}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditUser}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                >
                  Update User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UsersPage

