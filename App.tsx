import React, { useState } from 'react';
import { UploadedImage, GenerationStatus, GeneratedVideo } from './types';
import CardUploader from './components/CardUploader';
import LoadingOverlay from './components/LoadingOverlay';
import { generateCardVideo } from './services/veoService';
import { Play, Download, RefreshCw, Zap, AlertCircle, Layers } from 'lucide-react';

function App() {
  const [frontImage, setFrontImage] = useState<UploadedImage | null>(null);
  const [backImage, setBackImage] = useState<UploadedImage | null>(null);
  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [result, setResult] = useState<GeneratedVideo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!frontImage || !backImage) return;

    setError(null);
    setStatus(GenerationStatus.GENERATING);

    try {
      // Local client-side generation (Free, No API Key)
      const videoResult = await generateCardVideo(frontImage, backImage);
      setResult(videoResult);
      setStatus(GenerationStatus.COMPLETE);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during video generation.");
      setStatus(GenerationStatus.ERROR);
    }
  };

  const handleReset = () => {
    setFrontImage(null);
    setBackImage(null);
    setStatus(GenerationStatus.IDLE);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
              JM
            </div>
            <h1 className="text-xl font-bold tracking-tight">Jay Mehta Team <span className="text-indigo-600">Cardspin</span></h1>
          </div>
          <div className="text-xs font-medium text-slate-500 flex items-center gap-1 bg-slate-100 px-3 py-1 rounded-full">
            <Layers size={12} className="text-indigo-500"/>
            Client-side Renderer
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl mb-4">
            Bring your collectibles to <span className="gradient-text">Life</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Upload your trading card images. Our engine creates a smooth 3D rotating showcase video instantly in your browser.
          </p>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Input Section */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <CardUploader 
                  label="Front of Card" 
                  image={frontImage} 
                  onImageSelect={setFrontImage}
                  onRemove={() => setFrontImage(null)}
                  disabled={status === GenerationStatus.GENERATING}
                />
                <CardUploader 
                  label="Back of Card" 
                  image={backImage} 
                  onImageSelect={setBackImage}
                  onRemove={() => setBackImage(null)}
                  disabled={status === GenerationStatus.GENERATING}
                />
              </div>

              {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-900 text-sm">Generation Failed</h4>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              )}

              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleGenerate}
                  disabled={!frontImage || !backImage || status === GenerationStatus.GENERATING}
                  className={`
                    relative overflow-hidden group w-full sm:w-auto px-8 py-4 rounded-full font-bold text-lg shadow-lg shadow-indigo-500/30 transition-all duration-300
                    ${(!frontImage || !backImage || status === GenerationStatus.GENERATING)
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-600/40 hover:-translate-y-0.5'
                    }
                  `}
                >
                  <span className="flex items-center justify-center gap-2">
                    {status === GenerationStatus.GENERATING ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <SparklesIcon className="w-5 h-5" />
                        Generate 360° Video
                      </>
                    )}
                  </span>
                  {(!frontImage || !backImage) && (
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs font-semibold text-slate-600 bg-white px-3 py-1 rounded-full shadow-sm">
                        Upload both images first
                      </span>
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Output Section */}
          <div className="lg:col-span-5">
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl p-6 shadow-xl border border-indigo-100 min-h-[400px] flex flex-col relative overflow-hidden">
                
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Play className="w-4 h-4 text-indigo-500 fill-indigo-500" />
                    Preview
                  </h3>
                  {result && (
                     <button onClick={handleReset} className="text-xs font-medium text-slate-500 hover:text-indigo-600 flex items-center gap-1">
                       <RefreshCw size={12} /> New Generation
                     </button>
                  )}
                </div>

                <div className="flex-1 bg-slate-900 rounded-xl overflow-hidden relative group flex items-center justify-center">
                  
                  {status === GenerationStatus.GENERATING && (
                    <LoadingOverlay />
                  )}

                  {result ? (
                    <video 
                      src={result.url} 
                      controls 
                      autoPlay 
                      loop 
                      className="w-full h-full object-contain bg-slate-50"
                    />
                  ) : (
                    <div className="text-center p-8">
                      {!status.includes('GENERATING') && (
                        <>
                          <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-500">
                             <Zap className="w-8 h-8 text-slate-600" />
                          </div>
                          <p className="text-slate-400 font-medium">Your masterpiece will appear here</p>
                          <p className="text-slate-600 text-sm mt-2">Ready to generate 1080p video</p>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {result && (
                  <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Format</p>
                      <p className="text-sm font-medium text-slate-700">
                        {result.filename.split('.').pop()?.toUpperCase()} • 1080p
                      </p>
                    </div>
                    <a 
                      href={result.url} 
                      download={result.filename}
                      className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
                    >
                      <Download size={16} />
                      Download Video
                    </a>
                  </div>
                )}

              </div>

              <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4">
                 <h4 className="text-sm font-bold text-blue-900 mb-1">Pro Tip</h4>
                 <p className="text-sm text-blue-800/80">
                   For best results, upload images that are already cropped to the card/slab edges. 
                   The renderer automatically adds a "safehavenexchange.com" display base.
                 </p>
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

// Icon helper
const SparklesIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L12 3Z" />
    <path d="M5 3v4" />
    <path d="M9 3v4" />
    <path d="M3 5h4" />
    <path d="M3 9h4" />
  </svg>
)

export default App;