import React, { useState, useCallback } from 'react';
import { ScanLine, Loader2, CheckCircle2, AlertTriangle, Trash2, ShieldCheck, Zap, FileText, ChevronRight } from 'lucide-react';
import FileUpload from './components/FileUpload';
import TransactionTable from './components/TransactionTable';
import { extractTransactions } from './services/geminiService';
import { fileToBase64 } from './utils/fileHelpers';
import { ProcessedFile } from './types';

const App: React.FC = () => {
  const [files, setFiles] = useState<ProcessedFile[]>([]);

  // Automatically start processing as soon as files are selected
  const handleFilesSelected = useCallback(async (selectedFiles: File[]) => {
    // 1. Create initial state for new files (Set status to 'processing' immediately)
    const newFileEntries: ProcessedFile[] = selectedFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      name: file.name,
      type: file.type,
      transactions: [],
      status: 'processing', 
    }));

    setFiles(prev => [...prev, ...newFileEntries]);

    // 2. Process each file individually
    // Using a loop or forEach allows us to trigger them all, but we handle the async results independently.
    selectedFiles.forEach(async (file, index) => {
      const entryId = newFileEntries[index].id;
      
      try {
        const base64 = await fileToBase64(file);
        
        // Call the Gemini Service
        const transactions = await extractTransactions(base64, file.type);
        
        // Update state on success
        setFiles(prev => prev.map(f => 
          f.id === entryId 
            ? { ...f, status: 'completed', transactions, base64 } 
            : f
        ));
      } catch (error: any) {
        // Update state on error
        setFiles(prev => prev.map(f => 
          f.id === entryId 
            ? { ...f, status: 'error', errorMessage: error.message } 
            : f
        ));
      }
    });
  }, []);

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-200 selection:bg-blue-500/30">
      
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
                <ScanLine size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">
                  Statement<span className="text-blue-500">OCR</span>
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              <span className="text-xs font-medium text-slate-400">Gemini 2.5 Active</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-6 leading-tight">
            Bank Statement <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Extractor</span>
          </h2>
          <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto">
            Upload an image or PDF of your bank statement to get a clean, structured CSV with instant analytics.
          </p>
          
          <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-slate-500">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-blue-500" />
              <span>99% Accuracy</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-blue-500" />
              <span>Secure Processing</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-blue-500" />
              <span>Instant Analytics</span>
            </div>
          </div>
        </div>

        {/* Upload Card */}
        <section className="bg-slate-900/50 rounded-3xl p-2 border border-slate-800 shadow-2xl shadow-black/50 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800/50">
             <FileUpload onFilesSelected={handleFilesSelected} />
          </div>
        </section>

        {/* Processing Queue & File List */}
        {files.length > 0 && (
          <div className="mt-12 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider pl-1 flex items-center gap-2">
              <ChevronRight size={16} /> Process Queue
            </h4>
            <div className="grid gap-4">
              {files.map((file) => (
                <div key={file.id} className="group relative flex items-center justify-between p-5 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 hover:border-slate-700 transition-all shadow-lg">
                  <div className="flex items-center gap-5 overflow-hidden">
                    <div className={`p-3 rounded-xl shrink-0 transition-colors ${
                      file.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' :
                      file.status === 'error' ? 'bg-rose-500/10 text-rose-500' :
                      file.status === 'processing' ? 'bg-blue-500/10 text-blue-500' :
                      'bg-slate-800 text-slate-500'
                    }`}>
                        {file.status === 'processing' ? <Loader2 className="animate-spin" size={24} /> : 
                        file.status === 'completed' ? <CheckCircle2 size={24} /> :
                        file.status === 'error' ? <AlertTriangle size={24} /> :
                        <FileText size={24} />
                        }
                    </div>
                    <div className="min-w-0">
                      <p className="text-base font-bold text-slate-200 truncate">{file.name}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs font-mono text-slate-500 uppercase bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          {file.type.split('/')[1] || 'FILE'}
                        </span>
                        <span className="text-xs text-slate-400">
                          {file.status === 'processing' && <span className="text-blue-400 flex items-center gap-1">Processing...</span>}
                          {file.status === 'completed' && <span className="text-emerald-400">Analysis Complete</span>}
                          {file.status === 'error' && <span className="text-rose-400">{file.errorMessage}</span>}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {file.status !== 'processing' && (
                      <button 
                        onClick={() => removeFile(file.id)}
                        className="p-2 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Remove file"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results Section */}
        <section className="space-y-12 pb-24">
           {files.filter(f => f.status === 'completed').map((file) => (
             <TransactionTable 
               key={file.id} 
               transactions={file.transactions} 
               fileName={file.name} 
             />
           ))}
        </section>

      </main>
    </div>
  );
};

export default App;