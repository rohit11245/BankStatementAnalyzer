import React, { useRef, useState } from 'react';
import { Upload, FileText, Image as ImageIcon } from 'lucide-react';
import { FileUploadProps } from '../types';

const FileUpload: React.FC<FileUploadProps> = ({ onFilesSelected, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const validFiles = Array.from(e.dataTransfer.files).filter(
        (file) => file.type.startsWith('image/') || file.type === 'application/pdf'
      );
      if (validFiles.length > 0) {
        onFilesSelected(validFiles);
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const validFiles = Array.from(e.target.files);
      onFilesSelected(validFiles);
    }
    // Reset input to allow selecting the same file again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div
      className={`relative group border-2 border-dashed rounded-2xl p-12 transition-all duration-300 ease-out text-center cursor-pointer overflow-hidden
        ${isDragging 
          ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_30px_rgba(59,130,246,0.2)]' 
          : 'border-slate-700 bg-slate-900/50 hover:border-blue-500/50 hover:bg-slate-800/80'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : ''}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !disabled && fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileInput}
        accept="image/*,application/pdf"
        multiple
        disabled={disabled}
      />
      
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />

      <div className="relative flex flex-col items-center justify-center space-y-6 z-10">
        <div className={`p-6 rounded-full transition-all duration-500 ${isDragging ? 'bg-blue-600 shadow-lg shadow-blue-500/50 scale-110' : 'bg-slate-800 shadow-xl group-hover:bg-slate-700'}`}>
          <Upload size={40} className={`transition-colors ${isDragging ? 'text-white' : 'text-blue-400'}`} strokeWidth={2} />
        </div>
        
        <div className="space-y-3">
          <h3 className="text-2xl font-bold text-slate-100 tracking-tight">
            Upload Bank Statements
          </h3>
          <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed">
            Drag and drop your PDF statements or images here to automatically start extraction.
          </p>
        </div>
        
        <div className="flex items-center gap-4 text-xs font-medium text-slate-500 bg-slate-900/80 py-2.5 px-5 rounded-full border border-slate-700/50 backdrop-blur-sm">
          <span className="flex items-center gap-2 group-hover:text-blue-400 transition-colors">
            <ImageIcon size={14} /> PNG, JPG
          </span>
          <span className="w-px h-3 bg-slate-700"></span>
          <span className="flex items-center gap-2 group-hover:text-blue-400 transition-colors">
            <FileText size={14} /> PDF
          </span>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;