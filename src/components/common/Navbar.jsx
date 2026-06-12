import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Menu, X, Sun, Moon, LogOut, User, Settings, Shield, 
  Activity, Droplet, Search, FileText 
} from 'lucide-react';
import { Notifications } from './Notifications';

export const Navbar = () => {
  const { currentUser, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isActive = (path) => location.pathname === path;

  const linkClass = (path) => `
    flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
    ${isActive(path) 
      ? 'bg-primary text-white dark:bg-primary-dark shadow-sm' 
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'}
  `;

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/85 dark:border-slate-800/85 dark:bg-slate-950/85 backdrop-blur-md transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo Brand */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary-dark/15 dark:text-primary-dark">
              <Droplet className="h-5.5 w-5.5 fill-current" />
            </div>
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-xl font-bold tracking-tight text-transparent dark:from-primary-dark dark:to-secondary-dark">
              BloodConnect <span className="text-slate-800 dark:text-white">AI</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-5">
            {currentUser && (
              <>
                <Link to="/dashboard" className={linkClass('/dashboard')}>
                  <Activity className="h-4 w-4" /> Dashboard
                </Link>
                <Link to="/search" className={linkClass('/search')}>
                  <Search className="h-4 w-4" /> Find Donors
                </Link>
                <Link to="/request" className={linkClass('/request')}>
                  <FileText className="h-4 w-4" /> Request Blood
                </Link>
                {isAdmin && (
                  <Link to="/admin" className={linkClass('/admin')}>
                    <Shield className="h-4 w-4" /> Admin
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Utility Right panel */}
          <div className="hidden md:flex items-center gap-4">
            {/* Notifications */}
            {currentUser && <Notifications />}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* User Dropdown */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 rounded-full border border-slate-200 p-1 pr-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900 transition-colors"
                >
                  <img
                    src={currentUser.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.name}`}
                    alt={currentUser.name}
                    className="h-7 w-7 rounded-full object-cover"
                  />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 max-w-[100px] truncate">
                    {currentUser.name}
                  </span>
                  <div className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {currentUser.role}
                  </div>
                </button>

                {isDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                    <div className="absolute right-0 mt-2 w-52 origin-top-right rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-800 dark:bg-slate-900 z-20">
                      <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-xs font-semibold text-slate-400">Signed in as</p>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{currentUser.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <User className="h-4 w-4 text-slate-400" /> My Profile
                      </Link>
                      <Link
                        to="/settings"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <Settings className="h-4 w-4 text-slate-400" /> Settings
                      </Link>
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          handleLogout();
                        }}
                        className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                      >
                        <LogOut className="h-4 w-4" /> Log Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover shadow-sm hover:shadow dark:bg-primary-dark transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-850"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950 px-4 py-3 space-y-2.5">
          {currentUser ? (
            <>
              <div className="flex items-center gap-3 px-3 py-2 border-b border-slate-100 dark:border-slate-900">
                <img
                  src={currentUser.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.name}`}
                  alt={currentUser.name}
                  className="h-9 w-9 rounded-full object-cover"
                />
                <div>
                  <div className="text-sm font-semibold text-slate-850 dark:text-slate-100">{currentUser.name}</div>
                  <div className="text-xs text-slate-400 capitalize">{currentUser.role}</div>
                </div>
              </div>
              <Link to="/dashboard" onClick={() => setIsOpen(false)} className={linkClass('/dashboard')}>
                <Activity className="h-4 w-4" /> Dashboard
              </Link>
              <Link to="/search" onClick={() => setIsOpen(false)} className={linkClass('/search')}>
                <Search className="h-4 w-4" /> Find Donors
              </Link>
              <Link to="/request" onClick={() => setIsOpen(false)} className={linkClass('/request')}>
                <FileText className="h-4 w-4" /> Request Blood
              </Link>
              {isAdmin && (
                <Link to="/admin" onClick={() => setIsOpen(false)} className={linkClass('/admin')}>
                  <Shield className="h-4 w-4" /> Admin
                </Link>
              )}
              <Link to="/profile" onClick={() => setIsOpen(false)} className={linkClass('/profile')}>
                <User className="h-4 w-4" /> My Profile
              </Link>
              <Link to="/settings" onClick={() => setIsOpen(false)} className={linkClass('/settings')}>
                <Settings className="h-4 w-4" /> Settings
              </Link>
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg"
              >
                <LogOut className="h-4 w-4" /> Log Out
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="w-full text-center px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 dark:border-slate-800 dark:text-slate-350"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setIsOpen(false)}
                className="w-full text-center px-4 py-2.5 rounded-lg bg-primary text-sm font-semibold text-white dark:bg-primary-dark"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
export default Navbar;
