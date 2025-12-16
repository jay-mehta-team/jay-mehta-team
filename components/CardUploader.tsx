import React, { useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { UploadedImage } from '../types';

interface CardUploaderProps {
  label: string;
  image: UploadedImage | null;
  onImageSelect: (image: UploadedImage) => void;
  onRemove: () => void;
  disabled?: boolean;
}

const CardUploader: React.FC<CardUploaderProps> = ({
  label,
  image,
  onImageSelect,
  onRemove,
  disabled = false
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const result = event.target?.result as string;
        // Split data URL to get base64
        const base64Data = result.split(',')[1];
        
        onImageSelect({
          id: crypto.randomUUID(),
          file,
          previewUrl: result,
          base64Data,
          mimeType: file.type
        });
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handleClick = () => {
    if (!image && !disabled) {
      inputRef.current?.click();
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <span className="text-sm font-medium text-slate-600 uppercase tracking-wide">{label}</span>
      
      <div 
        onClick={handleClick}
        className={`
          relative group cursor-pointer transition-all duration-300 ease-in-out
          border-2 border-dashed rounded-xl h-[400px] w-full flex flex-col items-center justify-center
          ${image 
            ? 'border-indigo-500 bg-indigo-50/30' 
            : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input 
          type="file" 
          ref={inputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleFileChange}
          disabled={disabled}
        />

        {image ? (
          <div className="relative w-full h-full p-4 flex items-center justify-center">
            <img 
              src={image.previewUrl} 
              alt={label} 
              className="max-h-full max-w-full object-contain shadow-lg rounded-lg transform transition-transform group-hover:scale-105"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-red-50 text-slate-500 hover:text-red-500 transition-colors"
            >
              <X size={18} />
            </button>
            <div className="absolute bottom-4 left-0 right-0 text-center">
              <span className="inline-block px-3 py-1 bg-black/50 backdrop-blur-md text-white text-xs rounded-full font-medium">
                {image.file.name}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-slate-400 group-hover:text-indigo-500 transition-colors">
            <div className="w-16 h-16 rounded-full bg-slate-100 group-hover:bg-indigo-50 flex items-center justify-center mb-4 transition-colors">
              <Upload size={24} />
            </div>
            <p className="font-medium text-slate-600 group-hover:text-indigo-600">Click to upload</p>
            <p className="text-sm mt-1">or drag and drop</p>
            <p className="text-xs mt-4 text-slate-400 max-w-[200px] text-center">
              Supported: JPG, PNG, WEBP<br/>(Max 5MB)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CardUploader;
