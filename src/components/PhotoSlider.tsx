import { useState, MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Columns, Layers, ArrowLeftRight, History, Maximize2, X, LocateFixed } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { cn } from '@/src/lib/utils';

// Simple fix for marker icon in nested components
const miniMapIcon = L.divIcon({
  className: 'mini-marker',
  html: '<div class="w-3 h-3 bg-brand-primary rounded-full border border-white shadow-sm"></div>',
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
}

interface PhotoSliderProps {
  historical: string;
  current: string;
  title: string;
  description: string;
  lat?: number;
  lng?: number;
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
  lat,
  lng,
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
        "relative overflow-hidden flex items-center justify-center bg-black/5 group/viewer", 
        isModal ? "w-full h-full p-2 md:p-8 bg-black" : "w-full aspect-[4/3] max-h-[350px]"
      )}
      onMouseDown={() => setIsDragging(true)}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
      onMouseMove={handleMove}
      onTouchStart={() => setIsDragging(true)}
      onTouchEnd={() => setIsDragging(false)}
      onTouchMove={handleMove}
    >
      {/* Floating Mode Selector Pill (Top) */}
      <div className={cn(
        "absolute top-4 left-1/2 -translate-x-1/2 flex p-1 rounded-full z-[100] transition-all border shadow-2xl items-center",
        isModal 
          ? "bg-black/60 backdrop-blur-xl border-white/20" 
          : "bg-white/95 backdrop-blur-md border-editorial-text/20"
      )}>
        <button 
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); setViewMode('side-by-side'); }}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center transition-all",
            viewMode === 'side-by-side' 
              ? "bg-brand-primary text-white shadow-lg" 
              : isModal ? "text-white/40 hover:text-white hover:bg-white/5" : "text-editorial-text/40 hover:text-editorial-text hover:bg-black/5"
          )}
          title="Vista Lado a Lado"
        >
          <Columns size={16} />
        </button>
        <button 
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); setViewMode('toggle'); }}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center transition-all",
            viewMode === 'toggle' 
              ? "bg-brand-primary text-white shadow-lg" 
              : isModal ? "text-white/40 hover:text-white hover:bg-white/5" : "text-editorial-text/40 hover:text-editorial-text hover:bg-black/5"
          )}
          title="Modo Alternar"
        >
          <Layers size={16} />
        </button>
        <button 
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); setViewMode('slider'); }}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center transition-all",
            viewMode === 'slider' 
              ? "bg-brand-primary text-white shadow-lg" 
              : isModal ? "text-white/40 hover:text-white hover:bg-white/5" : "text-editorial-text/40 hover:text-editorial-text hover:bg-black/5"
          )}
          title="Modo Deslizar"
        >
          <ArrowLeftRight size={16} />
        </button>
      </div>
      <div className={cn("relative h-full w-full", isModal ? "flex items-center justify-center" : "")}>
        <AnimatePresence mode="wait">
          {viewMode === 'side-by-side' && (
            <motion.div key="side" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-2 gap-px bg-editorial-text/10 h-full w-full">
              <div className="relative flex items-center justify-center overflow-hidden bg-black h-full">
                {historical ? (
                  <img 
                    src={historical} 
                    alt="Vista 1969"
                    className={cn(
                      "block grayscale sepia-[0.2] object-contain",
                      isModal ? "max-w-full max-h-[85vh]" : "w-full h-full"
                    )} 
                    referrerPolicy="no-referrer" 
                  />
                ) : (
                  <div className="text-white/20 text-[10px] uppercase tracking-widest font-bold text-center p-2">Foto histórica no disponible</div>
                )}
                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md text-white text-[8px] font-bold uppercase px-2 py-1 tracking-widest border border-white/10 rounded">1969</div>
              </div>
              <div className="relative flex items-center justify-center overflow-hidden bg-black h-full">
                {current ? (
                  <img 
                    src={current} 
                    alt="Vista Actual"
                    className={cn(
                      "block object-contain",
                      isModal ? "max-w-full max-h-[85vh]" : "w-full h-full"
                    )} 
                    referrerPolicy="no-referrer" 
                  />
                ) : (
                  <div className="text-white/20 text-[10px] uppercase tracking-widest font-bold text-center p-2">Foto actual no disponible</div>
                )}
                <div className="absolute bottom-4 left-4 bg-brand-primary/90 backdrop-blur-md text-white text-[8px] font-bold uppercase px-2 py-1 tracking-widest border border-white/10 rounded">Hoy</div>
              </div>
            </motion.div>
          )}

          {viewMode === 'toggle' && (
            <motion.div key="toggle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative flex items-center justify-center bg-black/10 h-full w-full">
              {(activeToggle === 'hist' ? historical : current) ? (
                <img 
                  src={activeToggle === 'hist' ? historical : current} 
                  alt={activeToggle === 'hist' ? "Vista 1969" : "Vista Actual"}
                  className={cn(
                    "block transition-all duration-500 object-contain", 
                    activeToggle === 'hist' && "grayscale sepia-[0.2]",
                    isModal ? "max-w-full max-h-[85vh]" : "w-full h-full"
                  )} 
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="text-black/20 text-[10px] uppercase tracking-widest font-bold">Imagen no disponible</div>
              )}
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex bg-editorial-bg/95 backdrop-blur-md shadow-2xl p-1 rounded-full border border-editorial-text/20 z-[100] items-center">
                <button 
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => { e.stopPropagation(); setActiveToggle('hist'); }}
                  className={cn(
                    "px-4 py-2 rounded-full font-bold text-[10px] uppercase tracking-widest transition-all", 
                    activeToggle === 'hist' ? "bg-brand-primary text-white shadow-md" : "text-editorial-text/40 hover:text-editorial-text hover:bg-black/5"
                  )}
                >
                  1969
                </button>
                <button 
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => { e.stopPropagation(); setActiveToggle('curr'); }}
                  className={cn(
                    "px-4 py-2 rounded-full font-bold text-[10px] uppercase tracking-widest transition-all", 
                    activeToggle === 'curr' ? "bg-brand-primary text-white shadow-md" : "text-editorial-text/40 hover:text-editorial-text hover:bg-black/5"
                  )}
                >
                  Hoy
                </button>
              </div>
            </motion.div>
          )}

          {viewMode === 'slider' && (
            <motion.div 
              key="slider"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="relative cursor-ew-resize overflow-hidden flex items-center justify-center h-full w-full"
            >
              {current ? (
                <img 
                  src={current} 
                  alt="Vista Actual" 
                  className={cn(
                    "block pointer-events-none object-contain",
                    isModal ? "max-w-full max-h-[85vh]" : "w-full h-full"
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
                        "max-none grayscale sepia-[0.2] h-full object-cover",
                        isModal ? "max-h-[85vh]" : ""
                      )} 
                      style={{ 
                        width: `${100 / (sliderPos / 100)}%`,
                      }} 
                      referrerPolicy="no-referrer" 
                    />
                  </div>
                  <div className="absolute inset-y-0 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] pointer-events-none" style={{ left: `${sliderPos}%` }}>
                    <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-white rounded-full shadow-2xl flex items-center justify-center border-2 md:border-4 border-brand-primary">
                      <ArrowLeftRight size={14} className="text-brand-primary" />
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
    <div className={cn("flex flex-col gap-1.5", className)}>
      <ViewerContent />

      {/* Entry Button for Immersion */}
      <div className="px-1 mt-1">
        <button 
          onClick={() => setIsFullSize(true)}
          className="w-full h-12 bg-brand-primary text-white rounded-xl flex items-center justify-center gap-2.5 shadow-lg hover:bg-brand-primary/90 transition-all active:scale-[0.98] group"
        >
          <Maximize2 size={16} className="opacity-80 group-hover:scale-110 transition-transform" />
          <span className="text-[9px] uppercase font-bold tracking-[0.3em]">Exploración Inmersiva</span>
        </button>
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
              <div className="flex-1 relative order-1 md:order-1 flex items-center justify-center p-0 md:p-4">
                <ViewerContent isModal />
              </div>

                {/* Info Area */}
              <div className="w-full md:w-[400px] h-auto md:h-full bg-editorial-bg overflow-hidden order-2 md:order-2 flex flex-col border-t md:border-t-0 md:border-l border-white/10 shadow-2xl">
                <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
                  <div className="flex flex-col gap-1 mb-6">
                    <div className="text-[10px] uppercase tracking-[0.4em] font-bold text-brand-primary">Muestra Inmersiva</div>
                    <div className="text-xs opacity-40 font-mono uppercase tracking-widest leading-none mt-2">Archivo de la Memoria</div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h2 className="text-3xl font-bold tracking-tight mb-3 italic font-serif leading-tight text-editorial-text">
                        {title}
                      </h2>
                      <div className="h-1.5 w-16 bg-brand-primary" />
                    </div>

                    <p className="text-lg leading-relaxed text-editorial-text font-serif italic opacity-90">
                      {description}
                    </p>

                    {/* Miniature Map in Sidebar */}
                    {lat && lng && (
                      <div className="pt-8 space-y-4">
                        <div className="w-full h-40 rounded-xl overflow-hidden border border-editorial-text/10 shadow-inner group relative">
                          <MapContainer 
                            center={[lat, lng]} 
                            zoom={16} 
                            scrollWheelZoom={false} 
                            zoomControl={false} 
                            dragging={false}
                            touchZoom={false}
                            doubleClickZoom={false}
                            className="w-full h-full grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                          >
                            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                            <Marker position={[lat, lng]} icon={miniMapIcon} />
                            <RecenterMap center={[lat, lng]} />
                          </MapContainer>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Highly accessible Navigation and Close Buttons for Touch Screens */}
                <div className="p-6 md:p-10 border-t border-editorial-text/10 bg-editorial-bg/50 backdrop-blur-md space-y-4">
                  {/* Navigation Row */}
                  <div className="grid grid-cols-2 gap-4 pb-2">
                    <button 
                      onClick={onPrev}
                      disabled={!hasPrev}
                      className={cn(
                        "h-14 rounded-xl flex items-center justify-center gap-3 font-bold text-[10px] uppercase tracking-widest border transition-all",
                        hasPrev 
                          ? "bg-white text-editorial-text border-editorial-text/10 shadow-lg hover:bg-gray-50 active:scale-95" 
                          : "opacity-20 cursor-not-allowed bg-black/5"
                      )}
                    >
                      <ArrowLeftRight size={16} className="rotate-180 opacity-40" />
                      Anterior
                    </button>
                    <button 
                      onClick={onNext}
                      disabled={!hasNext}
                      className={cn(
                        "h-14 rounded-xl flex items-center justify-center gap-3 font-bold text-[10px] uppercase tracking-widest border transition-all",
                        hasNext 
                          ? "bg-white text-editorial-text border-editorial-text/10 shadow-lg hover:bg-gray-50 active:scale-95" 
                          : "opacity-20 cursor-not-allowed bg-black/5"
                      )}
                    >
                      Siguiente
                      <ArrowLeftRight size={16} className="opacity-40" />
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => setIsFullSize(false)}
                    className="w-full h-14 bg-brand-primary text-white rounded-xl flex items-center justify-center gap-3 shadow-lg hover:bg-editorial-text transition-all active:scale-95 group"
                  >
                    <LocateFixed size={16} />
                    <span className="text-[10px] uppercase font-bold tracking-[0.3em]">Volver al Mapa</span>
                  </button>
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
