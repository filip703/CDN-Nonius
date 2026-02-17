
import React from 'react';

const Logo: React.FC<{ light?: boolean; size?: 'sm' | 'md' | 'lg' }> = ({ light = false, size = 'md' }) => {
  const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : size === 'lg' ? 'w-3 h-3' : 'w-2 h-2';
  const gap = size === 'sm' ? 'gap-0.5' : 'gap-1';
  
  // Nonius 'N' Pattern indices for a 4x4 grid
  const nPattern = [0, 4, 8, 12, 5, 10, 3, 7, 11, 15];

  return (
    <div className="flex items-center gap-3">
      <div className={`grid grid-cols-4 ${gap}`}>
        {Array.from({ length: 16 }).map((_, i) => (
          <div 
            key={i} 
            className={`${dotSize} rounded-full transition-colors duration-500 ${
              nPattern.includes(i) 
                ? 'bg-[#87A238]' 
                : (light ? 'bg-white/20' : 'bg-[#171844]/10')
            }`}
          />
        ))}
      </div>
      <div className="flex flex-col leading-none">
        <span className={`font-bold tracking-[0.2em] ${size === 'lg' ? 'text-3xl' : 'text-xl'} ${light ? 'text-white' : 'text-[#171844]'}`}>
          NONIUS
        </span>
        <span className={`text-[8px] font-black tracking-[0.4em] uppercase ${light ? 'text-[#87A238]' : 'text-[#0070C0]'}`}>
          Hospitality Technology
        </span>
      </div>
    </div>
  );
};

export default Logo;
