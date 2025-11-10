import React from 'react';

export default function Header() {
  const btn =
    'h-9 px-3 rounded-md text-sm font-medium border transition-colors';
  return (
    <div className="h-16 flex items-center justify-between px-4 bg-gradient-fine">
      <div className="flex gap-2">
        <button
          className={`${btn} bg-brand-blue text-white border-brand hover:bg-brand-blue-dark`}
        >
          Model
        </button>
        <button
          className={`${btn} bg-transparent text-white border-brand hover:bg-brand-blue/20`}
        >
          Ask
        </button>
        <button
          className={`${btn} bg-brand-beige text-black border-brand hover:bg-brand-beige-light`}
        >
          Quick
        </button>
      </div>
      <div className="flex gap-2">
        <button
          className={`${btn} bg-transparent text-white border-brand hover:bg-brand-blue/20`}
        >
          User
        </button>
      </div>
    </div>
  );
}
