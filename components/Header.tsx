
import React from 'react';
import Logo from './Logo';

const Header: React.FC = () => {
  return (
    <header className="py-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <Logo />
        <p className="text-[#0070C0] text-sm mt-1 uppercase tracking-widest font-semibold">
          Hospitality Technology
        </p>
      </div>
      <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 uppercase tracking-tighter">
        <div className="px-3 py-1 border border-slate-200 rounded-full">CDN Controller v4.0</div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-[#87A238] rounded-full animate-pulse"></span>
          System Stable
        </div>
      </div>
    </header>
  );
};

export default Header;
