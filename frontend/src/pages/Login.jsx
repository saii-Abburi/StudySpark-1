import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Mail, Lock, ArrowRight, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  // Gets success message if coming from registration
  const successMessage = location.state?.message;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    
    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      // Redirect to dashboard, or back to the protected route they were trying to access
      const from = location.state?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    } else {
      setErrorMsg(result.error || 'Failed to login');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden text-slate-300">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 flex justify-center items-center pointer-events-none">
        <div className="absolute w-96 h-96 bg-primary-500/10 rounded-full blur-3xl -top-10 -left-10"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center items-center space-x-2 group">
          <BookOpen className="h-8 w-8 text-primary-500" />
          <span className="text-2xl font-black tracking-tight text-white uppercase">
            Study<span className="text-primary-500">Spark</span>
          </span>
        </Link>
        <h2 className="mt-8 text-center text-4xl font-black text-white tracking-tight leading-none">
          Welcome back
        </h2>
        <p className="mt-2 text-center text-sm text-slate-200 font-medium">
          Or{' '}
          <Link to="/register" className="font-bold text-primary-500 hover:text-primary-400 transition-colors uppercase tracking-wider text-xs">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-dark-800 py-8 px-4 sm:rounded-none sm:px-10 border border-dark-700 shadow-2xl">
          
          {successMessage && (
            <div className="mb-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 rounded-md flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
              <p className="text-sm text-green-700 dark:text-green-400">{successMessage}</p>
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-400">{errorMsg}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
                Email address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-300" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full pl-10 sm:text-sm rounded-none py-3 border-dark-600 bg-dark-900 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-colors text-white placeholder-slate-600"
                  placeholder="you@student.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-300" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="block w-full pl-10 sm:text-sm rounded-none py-3 border-dark-600 bg-dark-900 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-colors text-white placeholder-slate-600"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-dark-600 bg-dark-900 rounded-sm"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-200">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-bold text-primary-500 hover:text-primary-400 transition-colors text-xs uppercase tracking-wider">
                  Forgot password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-none text-sm font-bold text-white bg-primary-500 hover:bg-primary-600 transition-all uppercase tracking-widest disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Sign in <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
