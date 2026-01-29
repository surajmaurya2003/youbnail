import React from 'react';

export const GallerySkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="card overflow-hidden animate-pulse">
          <div className="aspect-video" style={{background: 'var(--bg-secondary)'}} />
          <div className="p-4 space-y-3">
            <div className="h-4 rounded" style={{background: 'var(--bg-secondary)', width: '60%'}} />
            <div className="h-3 rounded" style={{background: 'var(--bg-secondary)', width: '80%'}} />
          </div>
        </div>
      ))}
    </div>
  );
};

export const UsageTableSkeleton: React.FC = () => {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="card p-4 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex-1 space-y-2">
              <div className="h-4 rounded" style={{background: 'var(--bg-secondary)', width: '30%'}} />
              <div className="h-3 rounded" style={{background: 'var(--bg-secondary)', width: '50%'}} />
            </div>
            <div className="h-6 w-16 rounded" style={{background: 'var(--bg-secondary)'}} />
          </div>
        </div>
      ))}
    </div>
  );
};

export const ProfileSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="card p-8 animate-pulse">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
          <div className="w-32 h-32 rounded-2xl" style={{background: 'var(--bg-secondary)'}} />
          <div className="flex-1 space-y-4 w-full">
            <div className="h-6 rounded" style={{background: 'var(--bg-secondary)', width: '40%'}} />
            <div className="h-4 rounded" style={{background: 'var(--bg-secondary)', width: '60%'}} />
            <div className="flex gap-4">
              <div className="h-16 rounded-lg flex-1" style={{background: 'var(--bg-secondary)'}} />
              <div className="h-16 rounded-lg w-32" style={{background: 'var(--bg-secondary)'}} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SpinnerLoader: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-16 h-16 border-4'
  };

  return (
    <div className={`${sizeClasses[size]} rounded-full border-[var(--border-secondary)] border-t-[var(--accent-primary)] animate-spin`} />
  );
};

export const FullScreenLoader: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{background: 'var(--bg-primary)'}}>
      <div className="text-center">
        <SpinnerLoader size="lg" />
        <p className="text-sm mt-4" style={{color: 'var(--text-secondary)'}}>{message}</p>
      </div>
    </div>
  );
};
