import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { Droplet, Mail, Lock, LogIn } from 'lucide-react';

export const Login = () => {
  const { login, loginWithGoogle } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please fill in all credentials.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      showToast('Welcome back to BloodConnect AI!', 'success');
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      showToast(error.message || 'Failed to sign in. Please verify your email and password.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
      showToast('Successfully logged in with Google!', 'success');
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      showToast('Google login failed. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-bg-light dark:bg-bg-dark px-4 py-12 transition-colors duration-300">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary dark:bg-primary-dark/15 dark:text-primary-dark mb-4">
            <Droplet className="h-7 w-7 fill-current" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-850 dark:text-white">
            Welcome Back
          </h2>
          <p className="text-xs text-slate-400 mt-1.5">
            Log in to manage emergencies or update your donor availability status.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email input */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
              <input
                type="email"
                required
                placeholder="e.g. name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-primary focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-primary-dark transition-all"
              />
            </div>
          </div>

          {/* Password input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-bold text-primary hover:text-primary-hover dark:text-primary-dark"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
              <input
                type="password"
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-primary focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-primary-dark transition-all"
              />
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-primary hover:bg-primary-hover py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/10 hover:shadow-primary-hover/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer dark:bg-primary-dark"
          >
            <LogIn className="h-4.5 w-4.5" />
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-150 dark:border-slate-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase font-extrabold tracking-wider">
            <span className="bg-white dark:bg-slate-900 px-3 text-slate-400">Or continue with</span>
          </div>
        </div>

        {/* Google sign-in */}
        <button
          onClick={handleGoogleSignIn}
          disabled={isSubmitting}
          className="w-full rounded-xl border border-slate-200 bg-white hover:bg-slate-50 py-3.5 text-sm font-bold text-slate-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
        >
          <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
          </svg>
          Google Sign-In
        </button>

        {/* Register footer link */}
        <p className="text-center text-xs text-slate-450 mt-8">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-bold text-primary hover:text-primary-hover dark:text-primary-dark"
          >
            Create account
          </Link>
        </p>

      </div>
    </div>
  );
};
export default Login;
