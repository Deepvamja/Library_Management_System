'use client';

import React, { useRef, useActionState } from 'react'; // ✅ useActionState from 'react'
import { loginCheck, FormState } from '../actions/loginActions';

const initialState: FormState = {
  error: '',
};

export default function LoginForm() {
  const [state, formAction] = useActionState(loginCheck, initialState); // ✅ updated hook
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <main className="bg-slate-100 min-h-screen flex items-center justify-center font-sans">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-800">Library Login</h1>
          <p className="text-slate-500 mt-2">Sign in to access your library account</p>
        </div>

        <form ref={formRef} action={formAction} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-600 mb-1">
              Email Address
            </label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              required 
              key={state.error ? 'email-error' : 'email'}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-600 mb-1">
              Password  
            </label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              required 
              key={state.error ? 'password-error' : 'password'}
              autoComplete="current-password"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
          </div>

          {state.error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              {state.error}
            </div>
          )}

          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300"
          >
            Sign In
          </button>
        </form>

        <div className="text-center">
          <p className="text-sm text-slate-600">
            Don't have an account?{' '}
            <a href="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign up here
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
