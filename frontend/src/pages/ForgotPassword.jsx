import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Mail, Lock, ArrowRight, Loader, AlertCircle, KeyRound } from 'lucide-react';
import { authService } from '../services/api';

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1 = Email, 2 = OTP, 3 = New Password
  const [formData, setFormData] = useState({ email: '', otp: '', newPassword: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!formData.email) return setErrorMsg('Email is required');
    
    setIsLoading(true);
    setErrorMsg('');
    try {
      await authService.sendForgotOtp(formData.email);
      setSuccessMsg(`Recovery OTP sent to ${formData.email}`);
      setStep(2);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndReset = async (e) => {
    e.preventDefault();
    if (step === 2) {
      if (!formData.otp || formData.otp.length !== 6) {
        return setErrorMsg('Please enter a valid 6-digit OTP');
      }
      setStep(3); // Move to password input
      return;
    }

    if (step === 3) {
      if (formData.newPassword.length < 6) {
        return setErrorMsg('Password must be at least 6 characters');
      }

      setIsLoading(true);
      setErrorMsg('');
      try {
        await authService.resetPassword({
          email: formData.email,
          otp: formData.otp,
          newPassword: formData.newPassword
        });
        navigate('/login', { state: { message: 'Password reset successfully! Please login with your new password.' } });
      } catch (err) {
        setErrorMsg(err.response?.data?.error || 'Failed to reset password. OTP may be invalid.');
        if (err.response?.status === 400 && err.response?.data?.error?.includes('OTP')) {
          setStep(2); // Go back to OTP step if it failed
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden text-slate-300">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 flex justify-center items-center pointer-events-none">
        <div className="absolute w-96 h-96 bg-primary-500/10 rounded-full blur-3xl -top-10 -right-10"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center items-center space-x-2 group">
          <BookOpen className="h-8 w-8 text-primary-500" />
          <span className="text-2xl font-black tracking-tight text-white uppercase">
            Study<span className="text-primary-500">Spark</span>
          </span>
        </Link>
        <h2 className="mt-8 text-center text-4xl font-black text-white tracking-tight leading-none">
          Recover Password
        </h2>
        <p className="mt-2 text-center text-sm text-slate-200 font-medium">
          Remember it?{' '}
          <Link to="/login" className="font-bold text-primary-500 hover:text-primary-400 transition-colors uppercase tracking-wider text-xs">
            Sign in here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-dark-800 py-8 px-4 sm:rounded-none sm:px-10 border border-dark-700 shadow-2xl">
           {errorMsg && (
            <div className="mb-4 bg-red-500/10 border-l-4 border-red-500 p-4 flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
              <p className="text-sm text-red-500 font-bold">{errorMsg}</p>
            </div>
          )}
          {successMsg && (
            <div className="mb-4 bg-green-500/10 border-l-4 border-green-500 p-4 flex items-start">
              <AlertCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
              <p className="text-sm text-green-500 font-bold">{successMsg}</p>
            </div>
          )}

          {step === 1 && (
            <form className="space-y-6" onSubmit={handleSendOtp}>
              <div>
                <label htmlFor="email" className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
                  Account Email
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-300" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="block w-full pl-10 sm:text-sm rounded-none py-3 border-dark-600 bg-dark-900 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-colors text-white placeholder-slate-600"
                    placeholder="you@student.edu"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
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
                      Send Recovery Code <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form className="space-y-6" onSubmit={handleVerifyAndReset}>
              <div>
                <label htmlFor="otp" className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 text-center">
                  Enter 6-Digit Rescue Code
                </label>
                <div className="mt-1 relative rounded-md shadow-sm max-w-xs mx-auto">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound className="h-5 w-5 text-slate-300" />
                  </div>
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    maxLength="6"
                    required
                    className="block w-full pl-10 sm:text-lg text-center rounded-none py-4 border-dark-600 bg-dark-900 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-colors text-white font-black tracking-[0.5em] placeholder-slate-700"
                    placeholder="000000"
                    value={formData.otp}
                    onChange={(e) => setFormData({...formData, otp: e.target.value.replace(/\D/g, '')})}
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-4 px-4 border border-transparent rounded-none text-sm font-bold text-white bg-primary-500 hover:bg-primary-600 transition-all uppercase tracking-widest"
                >
                  Verify Code <ArrowRight className="ml-2 h-5 w-5" />
                </button>
              </div>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-bold text-slate-400 hover:text-white uppercase tracking-widest transition-colors"
                >
                  Back to email
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form className="space-y-6" onSubmit={handleVerifyAndReset}>
              <div>
                <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
                  New Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-300" />
                  </div>
                  <input
                    type="password"
                    required
                    className="block w-full pl-10 sm:text-sm rounded-none py-3 border-dark-600 bg-dark-900 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-colors text-white placeholder-slate-600"
                    placeholder="••••••••"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                  />
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
                      Confirm New Password <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </button>
              </div>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs font-bold text-slate-400 hover:text-white uppercase tracking-widest transition-colors"
                >
                  Back to OTP
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
