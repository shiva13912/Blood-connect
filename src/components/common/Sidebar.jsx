import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, Search, HeartHandshake, Brain, 
  BarChart3, ShieldAlert, User, Settings, List
} from 'lucide-react';

export const Sidebar = () => {
  const { currentUser, isAdmin } = useAuth();

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/search', label: 'Find Donors', icon: Search },
    { to: '/request', label: 'Emergency Requests', icon: HeartHandshake },
    { to: '/blood-requests', label: 'All Requests', icon: List },
    { to: '/ai-recommend', label: 'AI Match Finder', icon: Brain },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    ...(isAdmin ? [{ to: '/admin', label: 'Admin Console', icon: ShieldAlert }] : []),
    { to: '/profile', label: 'My Profile', icon: User },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const activeClassName = 'flex items-center gap-3 px-4 py-3 rounded-xl bg-primary text-white dark:bg-primary-dark shadow-md shadow-primary/15 dark:shadow-none transition-all duration-200';
  const inactiveClassName = 'flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-all duration-200';

  return (
    <aside className="w-64 hidden lg:flex flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950/70 py-6 px-4 shrink-0 h-[calc(100vh-4rem)] sticky top-16 select-none">
      <div className="flex flex-col justify-between h-full">
        {/* Navigation list */}
        <nav className="space-y-1.5">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => (isActive ? activeClassName : inactiveClassName)}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="text-sm font-semibold">{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User signature footer */}
        <div className="border-t border-slate-150 dark:border-slate-850 pt-4 px-2">
          <div className="flex items-center gap-3">
            <img
              src={currentUser?.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser?.name}`}
              alt={currentUser?.name || 'User'}
              className="h-10 w-10 rounded-xl object-cover ring-2 ring-primary/10 dark:ring-primary-dark/20"
            />
            <div className="truncate">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{currentUser?.name}</h4>
              <p className="text-xs text-slate-450 truncate capitalize font-medium">{currentUser?.role} Mode</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
export default Sidebar;
