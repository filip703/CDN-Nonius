
import React from 'react';

const Logo: React.FC<{ light?: boolean }> = ({ light = false }) => {
  return (
    <div className="flex items-center gap-4">
      <div className="grid grid-cols-4 gap-1 w-12">
        {Array.from({ length: 16 }).map((_, i) => {
          const isLime = [4, 5, 8, 9, 13].includes(i);
          return (
            <div 
              key={i} 
              className={`w-2 h-2 rounded-full ${
                isLime ? 'bg-[#87A238]' : (light ? 'bg-white' : 'bg-[#171844]')
              }`}
            />
          );
        })}
      </div>
      <span className={`text-2xl font-semibold tracking-widest ${light ? 'text-white' : 'text-[#171844]'}`}>
        NONIUS
      </span>
    </div>
  );
};

export default Logo;
