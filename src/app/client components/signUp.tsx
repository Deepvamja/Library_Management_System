'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import createPatron from '../actions/createPatron';
import Notification from './notification';

export default function SignUpForm() {
  const [patronType, setPatronType] = useState('student');
  const [showNotification, setShowNotification] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      await createPatron(formData);
      // Show success notification
      setShowNotification(true);
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error) {
      console.error('Error creating patron:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <main className="bg-slate-100 min-h-screen flex items-center justify-center font-sans">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-800">Create an Account</h1>
          <p className="text-slate-500 mt-2">Join our library as a student or faculty member.</p>
        </div>

        {/* --- Patron Type Selector --- */}
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
          <fieldset>
            <legend className="font-semibold text-slate-700 mb-3">I am a:</legend>
            <div className="flex gap-4">
              <label className={`flex-1 p-3 rounded-md border-2 text-center cursor-pointer transition-all ${patronType === 'student' ? 'bg-blue-500 border-blue-500 text-white' : 'bg-white hover:border-blue-400'}`}>
                <input
                  type="radio"
                  name="patronTypeSelector"
                  value="student"
                  checked={patronType === 'student'}
                  onChange={() => setPatronType('student')}
                  className="sr-only"
                />
                Student
              </label>
              <label className={`flex-1 p-3 rounded-md border-2 text-center cursor-pointer transition-all ${patronType === 'faculty' ? 'bg-blue-500 border-blue-500 text-white' : 'bg-white hover:border-blue-400'}`}>
                <input
                  type="radio"
                  name="patronTypeSelector"
                  value="faculty"
                  checked={patronType === 'faculty'}
                  onChange={() => setPatronType('faculty')}
                  className="sr-only"
                />
                Faculty
              </label>
            </div>
          </fieldset>
        </div>

        {/* --- Main Sign-Up Form --- */}
        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="patronType" value={patronType} />

          {/* Common Fields matching schema */}
          <div>
            <label htmlFor="patronFirstName" className="block text-sm font-medium text-slate-600 mb-1">First Name</label>
            <input 
              type="text" 
              id="patronFirstName" 
              name="patronFirstName" 
              required 
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
          </div>
          
          <div>
            <label htmlFor="patronLastName" className="block text-sm font-medium text-slate-600 mb-1">Last Name</label>
            <input 
              type="text" 
              id="patronLastName" 
              name="patronLastName" 
              required 
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
          </div>
          
          <div>
            <label htmlFor="patronEmail" className="block text-sm font-medium text-slate-600 mb-1">Email Address</label>
            <input 
              type="email" 
              id="patronEmail" 
              name="patronEmail" 
              required 
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
          </div>
          
          <div>
            <label htmlFor="patronPassword" className="block text-sm font-medium text-slate-600 mb-1">Password</label>
            <input 
              type="password" 
              id="patronPassword" 
              name="patronPassword" 
              required 
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
          </div>

          {/* Conditional Fields based on patron type */}
          {patronType === 'student' ? (
            <>
              <div>
                <label htmlFor="studentEnrollmentNumber" className="block text-sm font-medium text-slate-600 mb-1">Enrollment Number</label>
                <input 
                  type="number" 
                  id="studentEnrollmentNumber" 
                  name="studentEnrollmentNumber" 
                  required 
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>
              
              <div>
                <label htmlFor="studentDepartment" className="block text-sm font-medium text-slate-600 mb-1">Department</label>
                <input 
                  type="text" 
                  id="studentDepartment" 
                  name="studentDepartment" 
                  required 
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>
              
              <div>
                <label htmlFor="studentSemester" className="block text-sm font-medium text-slate-600 mb-1">Semester</label>
                <input 
                  type="number" 
                  id="studentSemester" 
                  name="studentSemester" 
                  min="1" 
                  max="8" 
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>
              
              <div>
                <label htmlFor="studentRollNo" className="block text-sm font-medium text-slate-600 mb-1">Roll Number</label>
                <input 
                  type="number" 
                  id="studentRollNo" 
                  name="studentRollNo" 
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label htmlFor="facultyDepartment" className="block text-sm font-medium text-slate-600 mb-1">Department</label>
                <input 
                  type="text" 
                  id="facultyDepartment" 
                  name="facultyDepartment" 
                  required 
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>
            </>
          )}

          <button 
            type="submit" 
            disabled={isSubmitting}
            className={`w-full font-bold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300 ${
              isSubmitting 
                ? 'bg-gray-400 text-gray-700 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
      </div>
      
      {/* Success Notification */}
      {showNotification && (
        <Notification 
          message="Account created successfully! Redirecting to login..." 
          type="success" 
          onClose={() => setShowNotification(false)}
        />
      )}
    </main>
  );
}
