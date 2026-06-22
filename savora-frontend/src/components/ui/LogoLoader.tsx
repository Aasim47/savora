import React from 'react';

export function LogoLoader() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-base/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative flex items-center justify-center">
        {/* Outer spinning ring */}
        <div className="absolute inset-[-30px] rounded-full border-4 border-transparent border-t-accent border-l-accent/40 animate-[spin_1.5s_linear_infinite]" />
        
        {/* Inner pulsing logo */}
        <div className="relative z-10 animate-[pulse_2s_ease-in-out_infinite]">
          <img 
            src="/logo.png" 
            alt="Bhojanwale Loading..." 
            className="h-28 w-auto object-contain drop-shadow-xl" 
          />
        </div>
      </div>
      
      <p className="mt-12 text-sm font-medium text-accent animate-[pulse_2s_ease-in-out_infinite] tracking-widest uppercase">
        Preparing your experience...
      </p>
    </div>
  );
}
