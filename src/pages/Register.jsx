import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { Droplet, User, Mail, Lock, UserPlus, Heart, FileText, Shield } from 'lucide-react';

export const Register = () => {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('donor'); // 'admin' | 'donor' | 'requester'
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !role) {
      showToast('Please complete all form inputs.', 'warning');
      return;
    }

    if (password.length < 6) {
      showToast('Password must contain at least 6 characters.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      await register(name, email, password, role);
      showToast('Registration successful! Account created.', 'success');
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      showToast(error.message || 'Registration failed. Email might be in use.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const roles = [
    {
      id: 'donor',
      title: 'Blood Donor',
      desc: 'Donate blood, manage availability status, and track history.',
      icon: Heart,
      color: 'border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10 text-emerald-500'
    },
    {
      id: 'requester',
      title: 'Blood Requester',
      desc: 'Submit and manage emergency requests for patients.',
      icon: FileText,
      color: 'border-blue-500 bg-blue-500/5 dark:bg-blue-500/10 text-blue-500'
    },
    {
      id: 'admin',
      title: 'Administrator',
      desc: 'Supervise users, blood request tickets, and system metrics.',
      icon: Shield,
      color: 'border-rose-500 bg-rose-500/5 dark:bg-rose-500/10 text-rose-500'
    }
  ];

  return (
    <div className="flex min-h-[85vh] items-center justify-center bg-bg-light dark:bg-bg-dark px-4 py-12 transition-colors duration-300">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary dark:bg-primary-dark/15 dark:text-primary-dark mb-3">
            <Droplet className="h-7 w-7 fill-current" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-850 dark:text-white">
            Create an Account
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Choose your profile type and register.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Account Role Visual Picker */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Select Your Role
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {roles.map((r) => {
                const Icon = r.icon;
                const isSelected = role === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={`flex flex-col items-center text-center p-3 rounded-xl border-2 transition-all cursor-pointer select-none ${
                      isSelected 
                        ? r.color + ' border-current scale-[1.02]' 
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 text-slate-500'
                    }`}
                  >
                    <Icon className="h-5.5 w-5.5 mb-2" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{r.title}</span>
                    <span className="text-[10px] text-slate-400 leading-tight mt-1 hidden sm:block">{r.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Full Name input */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
              <input
                type="text"
                required
                placeholder="e.g. John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-primary focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-primary-dark transition-all"
              />
            </div>
          </div>

          {/* Email input */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-primary focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-primary-dark transition-all"
              />
            </div>
          </div>

          {/* Password input */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
              <input
                type="password"
                required
                placeholder="Minimum 6 characters"
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
            <UserPlus className="h-4.5 w-4.5" />
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        {/* Footer login link */}
        <p className="text-center text-xs text-slate-450 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-bold text-primary hover:text-primary-hover dark:text-primary-dark"
          >
            Log in here
          </Link>
        </p>

      </div>
    </div>
  );
};
export default Register;
