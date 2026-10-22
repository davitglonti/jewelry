import React from 'react';

export default function PageLoader() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0c0b0a]">
      <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}