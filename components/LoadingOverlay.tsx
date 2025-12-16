import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

interface LoadingOverlayProps {
  message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message = "Rendering 3D rotation frames..." }) => {
  return (
    <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl">
      <div className="relative">
        <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 animate-pulse rounded-full"></div>
        <div className="relative bg-white p-4 rounded-full shadow-xl">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
        <div className="absolute -top-2 -right-2">
            <Sparkles className="w-5 h-5 text-amber-400 animate-bounce" />
        </div>
      </div>
      <h3 className="mt-6 text-lg font-semibold text-slate-800 animate-pulse">{message}</h3>
      <p className="text-sm text-slate-500 mt-2 max-w-xs text-center">
        Creating high-resolution video directly in your browser.
      </p>
    </div>
  );
};

export default LoadingOverlay;