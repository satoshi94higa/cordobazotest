import { useState, MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Columns, Layers, ArrowLeftRight, History, Maximize2, X } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface PhotoSliderProps {
  historical: string;
  current: string;
  title: string;
  description: string;
  onNext?: () => void;
  onPrev?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
  className?: string;
}

type ViewMode = 'slider' | 'side-by-side' | 'toggle';

export function PhotoSlider({ 
  historical, 
  current, 
  title, 
  description, 
  onNext, 
  onPrev, 
  hasNext, 
  hasPrev, 
  className 
}: PhotoSliderProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('side-by-side');
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [activeToggle, setActiveToggle] = useState<'hist' | 'curr'>('hist');
  const [isFullSize, setIsFullSize] = useState(false);

  const handleMove = (e: ReactMouseEvent | ReactTouchEvent) => {
    if (!isDragging || viewMode !== 'slider') return;
    
    const container = e.currentTarget.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX : (e as ReactMouseEvent).clientX;
    const position = ((x - container.left) / container.width) * 100;
    setSliderPos(Math.max(0, Math.min(100, position)));
  };

  const ViewerContent = ({ isModal = false }: { isModal?: boolean }) => (
    <div 
      className={cn(
        "relative overflow-hidden flex items-center justify-center bg-black/5", 
        isModal ? "w-full h-full p-8 bg-black" : "w-full max-h-[60vh]"
      )}
      onMouseDown={() => setIsDragging(true)}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
      onMouseMove={handleMove}
      onTouchStart={() => setIsDragging(true)}
      onTouchEnd={() => setIsDragging(false)}
      onTouchMove={handleMove}
    >
      <div className={cn("relative", isModal ? "max-w-full max-h-full flex items-center justify-center" : "w-full")}>
        <AnimatePresence mode="wait">
          {viewMode === 'side-by-side' && (
            <motion.div key="side" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-2 gap-px bg-editorial-text/10 h-full w-full">
              <div className="relative flex items-center justify-center overflow-hidden bg-black min-h-[300px]">
                {historical ? (
                  <img 
                    src={historical} 
                    alt="Vista 1969"
                    className={cn(
                      "block grayscale sepia-[0.2]",
                      isModal ? "max-w-full max-h-[85vh]" : "max-h-[60vh] object-contain"
                    )} 
                    referrerPolicy="no-referrer" 
                  />
                ) : (
                  <div className="text-white/20 text-[10px] uppercase tracking-widest font-bold">Foto histórica no disponible</div>
                )}
                <div className="absolute top-4 left-4 bg-black/50 text-white text-[9px] font-bold uppercase px-2 py-1 tracking-widest">1969</div>
              </div>
              <div className="relative flex items-center justify-center overflow-hidden bg-black min-h-[300px]">
                {current ? (
                  <img 
                    src={current} 
                    alt="Vista Actual"
                    className={cn(
                      "block",
                      isModal ? "max-w-full max-h-[85vh]" : "max-h-[60vh] object-contain"
                    )} 
                    referrerPolicy="no-referrer" 
                  />
                ) : (
                  <div className="text-white/20 text-[10px] uppercase tracking-widest font-bold">Foto actual no disponible</div>
                )}
                <div className="absolute top-4 left-4 bg-brand-primary/90 text-white text-[9px] font-bold uppercase px-2 py-1 tracking-widest">Hoy</div>
              </div>
            </motion.div>
          )}

          {viewMode === 'toggle' && (
            <motion.div key="toggle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative flex items-center justify-center bg-black/10 min-h-[400px]">
              {(activeToggle === 'hist' ? historical : current) ? (
                <img 
                  src={activeToggle === 'hist' ? historical : current} 
                  alt={activeToggle === 'hist' ? "Vista 1969" : "Vista Actual"}
                  className={cn(
                    "block transition-all duration-500", 
                    activeToggle === 'hist' && "grayscale sepia-[0.2]",
                    isModal ? "max-w-full max-h-[85vh] w-auto h-auto" : "w-full h-auto max-h-[60vh] object-contain"
                  )} 
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="text-black/20 text-[10px] uppercase tracking-widest font-bold">Imagen no disponible</div>
              )}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[90%] flex gap-4">
                <button 
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => { e.stopPropagation(); setActiveToggle('hist'); }}
                  className={cn("flex-1 py-4 px-4 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all shadow-2xl border", activeToggle === 'hist' ? "bg-brand-primary text-white border-brand-primary" : "bg-white/90 backdrop-blur-md border-black/10")}
                >
                  Ver 1969
                </button>
                <button 
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => { e.stopPropagation(); setActiveToggle('curr'); }}
                  className={cn("flex-1 py-4 px-4 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all shadow-2xl border", activeToggle === 'curr' ? "bg-brand-primary text-white border-brand-primary" : "bg-white/90 backdrop-blur-md border-black/10")}
                >
                  Ver Hoy
                </button>
              </div>
            </motion.div>
          )}

          {viewMode === 'slider' && (
            <motion.div 
              key="slider"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="relative cursor-ew-resize overflow-hidden flex items-center justify-center min-h-[400px] w-full"
            >
              {current ? (
                <img 
                  src={current} 
                  alt="Vista Actual" 
                  className={cn(
                    "block pointer-events-none",
                    isModal ? "max-w-full max-h-[85vh] w-auto h-auto" : "w-full h-auto max-h-[60vh] object-contain"
                  )} 
                  referrerPolicy="no-referrer" 
                />
              ) : (
                <div className="text-black/20 text-[10px] uppercase tracking-widest font-bold">Vista Actual no disponible</div>
              )}
              
              {historical && current && (
                <>
                  <div 
                    className="absolute inset-y-0 left-0 overflow-hidden pointer-events-none flex items-center h-full" 
                    style={{ width: `${sliderPos}%` }}
                  >
                    <img 
                      src={historical} 
                      alt="Vista 1969" 
                      className={cn(
                        "max-none grayscale sepia-[0.2] h-full",
                        isModal ? "max-h-[85vh] w-auto" : "max-h-[60vh] w-auto"
                      )} 
                      style={{ 
                        width: `${100 / (sliderPos / 100)}%`,
                        objectFit: 'cover'
                      }} 
                      referrerPolicy="no-referrer" 
                    />
                  </div>
                  <div className="absolute inset-y-0 w-1 bg-white/80 shadow-[0_0_15px_rgba(0,0,0,0.5)] pointer-events-none" style={{ left: `${sliderPos}%` }}>
                    <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-2xl flex items-center justify-center border-4 border-brand-primary">
                      <ArrowLeftRight size={18} className="text-brand-primary" />
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
    </div>
  );

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Mode Selectors */}
      <div className="flex bg-editorial-text/5 p-1 border border-editorial-text/10 shadow-inner">
        <button 
          onClick={() => setViewMode('side-by-side')}
          className={cn(
            "flex-1 py-3 flex flex-col items-center gap-1 transition-all",
            viewMode === 'side-by-side' ? "bg-editorial-bg shadow-sm text-brand-primary" : "opacity-40 hover:opacity-100"
          )}
        >
          <Columns size={18} />
          <span className="text-[9px] uppercase font-bold tracking-widest">Lado a Lado</span>
        </button>
        <button 
          onClick={() => setViewMode('toggle')}
          className={cn(
            "flex-1 py-3 flex flex-col items-center gap-1 transition-all",
            viewMode === 'toggle' ? "bg-editorial-bg shadow-sm text-brand-primary" : "opacity-40 hover:opacity-100"
          )}
        >
          <Layers size={18} />
          <span className="text-[9px] uppercase font-bold tracking-widest">Alternar</span>
        </button>
        <button 
          onClick={() => setViewMode('slider')}
          className={cn(
            "flex-1 py-3 flex flex-col items-center gap-1 transition-all",
            viewMode === 'slider' ? "bg-editorial-bg shadow-sm text-brand-primary" : "opacity-40 hover:opacity-100"
          )}
        >
          <ArrowLeftRight size={18} />
          <span className="text-[9px] uppercase font-bold tracking-widest">Deslizar</span>
        </button>
      </div>

      <ViewerContent />

      {/* Entry Button for Immersion */}
      <div className="px-1 mt-2">
        <button 
          onClick={() => setIsFullSize(true)}
          className="w-full h-16 bg-brand-primary text-white rounded-xl flex items-center justify-center gap-3 shadow-xl hover:bg-brand-primary/90 transition-all active:scale-[0.98] group"
        >
          <Maximize2 size={20} className="opacity-80 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] uppercase font-bold tracking-[0.3em]">Exploración Inmersiva</span>
        </button>
        <div className="mt-2 text-center">
           <span className="text-[9px] uppercase tracking-widest opacity-30 font-bold">Inicia una experiencia visual de pantalla completa</span>
        </div>
      </div>

      {/* Fullscreen Overlay */}
      {createPortal(
        <AnimatePresence>
          {isFullSize && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] bg-black flex flex-col md:flex-row"
            >
              {/* Image Area */}
              <div className="flex-1 relative order-2 md:order-1 flex items-center justify-center p-4">
                <ViewerContent isModal />
                
                {/* Minimalist Floating Controls for Fullscreen */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex bg-black/40 backdrop-blur-xl p-1 rounded-full border border-white/10 shadow-2xl scale-75 md:scale-90 transition-all hover:scale-100">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setViewMode('side-by-side'); }}
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center transition-all",
                      viewMode === 'side-by-side' ? "bg-brand-primary text-white" : "text-white/40 hover:text-white"
                    )}
                  >
                    <Columns size={18} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setViewMode('toggle'); }}
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center transition-all",
                      viewMode === 'toggle' ? "bg-brand-primary text-white" : "text-white/40 hover:text-white"
                    )}
                  >
                    <Layers size={18} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setViewMode('slider'); }}
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center transition-all",
                      viewMode === 'slider' ? "bg-brand-primary text-white" : "text-white/40 hover:text-white"
                    )}
                  >
                    <ArrowLeftRight size={18} />
                  </button>
                </div>
              </div>

              {/* Info Area */}
              <div className="w-full md:w-[400px] h-auto md:h-full bg-editorial-bg overflow-hidden order-1 md:order-2 flex flex-col border-b md:border-b-0 md:border-l border-white/10 shadow-2xl">
                <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar">
                  <div className="flex flex-col gap-1 mb-10">
                    <div className="text-[10px] uppercase tracking-[0.4em] font-bold text-brand-primary">Muestra Inmersiva</div>
                    <div className="text-xs opacity-40 font-mono uppercase tracking-widest leading-none mt-2">Archivo de la Memoria</div>
                  </div>

                  <div className="space-y-8">
                    <div>
                      <h2 className="text-4xl font-bold tracking-tight mb-4 italic font-serif leading-tight text-editorial-text">
                        {title}
                      </h2>
                      <div className="h-2 w-20 bg-brand-primary" />
                    </div>

                    <p className="text-xl leading-relaxed text-editorial-text font-serif italic opacity-90">
                      {description}
                    </p>
                  </div>
                </div>

                {/* Highly accessible Navigation and Close Buttons for Touch Screens */}
                <div className="p-8 md:p-10 border-t border-editorial-text/10 bg-editorial-bg/50 backdrop-blur-md space-y-4">
                  {/* Navigation Row */}
                  <div className="grid grid-cols-2 gap-4 pb-2">
                    <button 
                      onClick={onPrev}
                      disabled={!hasPrev}
                      className={cn(
                        "h-16 rounded-2xl flex items-center justify-center gap-3 font-bold text-[10px] uppercase tracking-widest border transition-all",
                        hasPrev 
                          ? "bg-white text-editorial-text border-editorial-text/10 shadow-lg hover:bg-gray-50 active:scale-95" 
                          : "opacity-20 cursor-not-allowed bg-black/5"
                      )}
                    >
                      <ArrowLeftRight size={18} className="rotate-180 opacity-40" />
                      Anterior
                    </button>
                    <button 
                      onClick={onNext}
                      disabled={!hasNext}
                      className={cn(
                        "h-16 rounded-2xl flex items-center justify-center gap-3 font-bold text-[10px] uppercase tracking-widest border transition-all",
                        hasNext 
                          ? "bg-white text-editorial-text border-editorial-text/10 shadow-lg hover:bg-gray-50 active:scale-95" 
                          : "opacity-20 cursor-not-allowed bg-black/5"
                      )}
                    >
                      Siguiente
                      <ArrowLeftRight size={18} className="opacity-40" />
                    </button>
                  </div>

                  <button 
                    onClick={() => setIsFullSize(false)}
                    className="w-full h-20 bg-editorial-text text-white rounded-2xl flex items-center justify-center gap-4 shadow-[0_20px_40px_rgba(0,0,0,0.2)] hover:bg-brand-primary transition-all active:scale-95 group"
                  >
                    <span className="text-xs uppercase font-bold tracking-[0.4em] group-hover:translate-x-1 transition-transform">Ir al Mapa</span>
                    <X size={24} className="opacity-60" />
                  </button>
                  <div className="mt-4 text-center">
                    <span className="text-[10px] uppercase tracking-[0.2em] opacity-30 font-bold">Toca para volver al mapa principal</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
