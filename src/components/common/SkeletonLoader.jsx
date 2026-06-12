import React from 'react';

export const SkeletonLoader = ({ count = 3, type = 'card' }) => {
  if (type === 'card') {
    return (
      <>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse h-32" />
        ))}
      </>
    );
  }

  if (type === 'line') {
    return (
      <>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-slate-200 dark:bg-slate-800 rounded h-4 mb-2 animate-pulse" />
        ))}
      </>
    );
  }

  if (type === 'avatar') {
    return (
      <>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex gap-4 mb-4">
            <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse w-24" />
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded animate-pulse w-32" />
            </div>
          </div>
        ))}
      </>
    );
  }

  return null;
};

export default SkeletonLoader;
