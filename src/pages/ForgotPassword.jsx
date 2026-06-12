import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { Droplet, Mail, ArrowLeft, Send } from 'lucide-react';

export const ForgotPassword = () => {
  const { resetPassword } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      showToast('Please provide your email address.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword(email);
      showToast('Reset email sent successfully!', 'success');
      setIsSubmitted(true);
    } catch (error) {
      console.error(error);
      showToast(error.message || 'Failed to send reset email.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[75vh] items-center justify-center bg-bg-light dark:bg-bg-dark px-4 py-12 transition-colors duration-300">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800">
        
        {/* Brand */}
        <div className="text-center mb-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary dark:bg-primary-dark/15 dark:text-primary-dark mb-3">
            <Droplet className="h-7 w-7 fill-current" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-850 dark:text-white">
            Reset Password
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Provide your email, and we will dispatch a password recovery link.
          </p>
        </div>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-5">
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-primary hover:bg-primary-hover py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/10 hover:shadow-primary-hover/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer dark:bg-primary-dark"
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? 'Sending link...' : 'Send Recovery Link'}
            </button>
          </form>
        ) : (
          <div className="text-center py-4 space-y-4">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 dark:bg-emerald-950/20 dark:text-emerald-400">
              <Mail className="h-5 w-5" />
            </div>
            <p className="text-sm text-slate-650 dark:text-slate-350">
              An email was sent to <strong className="text-slate-800 dark:text-white">{email}</strong>. Please check your inbox and spam folders to continue resetting your credentials.
            </p>
          </div>
        )}

        {/* Back navigation */}
        <div className="text-center mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-255"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to login screen
          </Link>
        </div>

      </div>
    </div>
  );
};
export default ForgotPassword;
