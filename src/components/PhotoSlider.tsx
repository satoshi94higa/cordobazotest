import { useState, MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Columns, Layers, ArrowLeftRight, History, Maximize2, X, LocateFixed, Map as MapIcon } from 'lucide-react';
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
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

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
                <div className={cn(
                  "absolute left-3 z-20 bg-black/75 backdrop-blur-md text-white text-[9px] md:text-[10px] font-bold uppercase px-2 py-1.5 md:px-2.5 md:py-1 tracking-[0.2em] border border-white/20 rounded shadow-xl",
                  isModal ? "top-16 md:top-20 md:left-6" : "bottom-3 md:bottom-4 md:left-4"
                )}>1969</div>
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
                <div className={cn(
                  "absolute left-3 z-20 bg-brand-primary backdrop-blur-md text-white text-[9px] md:text-[10px] font-bold uppercase px-2 py-1.5 md:px-2.5 md:py-1 tracking-[0.2em] border border-white/20 rounded shadow-xl",
                  isModal ? "top-16 md:top-20 md:left-6" : "bottom-3 md:bottom-4 md:left-4"
                )}>Hoy</div>
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
                  <div className={cn(
                    "absolute left-4 bg-black/70 backdrop-blur-md text-white text-[9px] font-bold uppercase px-2.5 py-1.5 tracking-[0.2em] border border-white/20 rounded shadow-xl pointer-events-none z-30",
                    isModal ? "top-16" : "bottom-4"
                  )}>1969</div>
                  <div className={cn(
                    "absolute right-4 bg-brand-primary backdrop-blur-md text-white text-[9px] font-bold uppercase px-2.5 py-1.5 tracking-[0.2em] border border-white/20 rounded shadow-xl pointer-events-none z-30",
                    isModal ? "top-16" : "bottom-4"
                  )}>Hoy</div>
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

  const ModeSelector = ({ isModal = false }: { isModal?: boolean }) => (
    <div className={cn(
      "flex p-1 rounded-full border items-center mx-auto",
      isModal 
        ? "bg-black/40 backdrop-blur-xl border-white/20" 
        : "bg-white border-editorial-text/10 shadow-sm"
    )}>
      <button 
        onClick={() => setViewMode('side-by-side')}
        className={cn(
          "px-4 h-10 rounded-full flex items-center justify-center gap-2 transition-all",
          viewMode === 'side-by-side' 
            ? "bg-brand-primary text-white shadow-lg" 
            : isModal ? "text-white/40 hover:text-white" : "text-editorial-text/40 hover:text-editorial-text hover:bg-black/5"
        )}
      >
        <Columns size={16} />
        <span className="text-[9px] font-bold uppercase tracking-widest">Lados</span>
      </button>
      <button 
        onClick={() => setViewMode('toggle')}
        className={cn(
          "px-4 h-10 rounded-full flex items-center justify-center gap-2 transition-all",
          viewMode === 'toggle' 
            ? "bg-brand-primary text-white shadow-lg" 
            : isModal ? "text-white/40 hover:text-white" : "text-editorial-text/40 hover:text-editorial-text hover:bg-black/5"
        )}
      >
        <Layers size={16} />
        <span className="text-[9px] font-bold uppercase tracking-widest">Alternar</span>
      </button>
      <button 
        onClick={() => setViewMode('slider')}
        className={cn(
          "px-4 h-10 rounded-full flex items-center justify-center gap-2 transition-all",
          viewMode === 'slider' 
            ? "bg-brand-primary text-white shadow-lg" 
            : isModal ? "text-white/40 hover:text-white" : "text-editorial-text/40 hover:text-editorial-text hover:bg-black/5"
        )}
      >
        <ArrowLeftRight size={16} />
        <span className="text-[9px] font-bold uppercase tracking-widest">Deslizar</span>
      </button>
    </div>
  );

  const ToggleSelector = ({ isModal = false }: { isModal?: boolean }) => (
    <div className={cn(
      "flex p-1 rounded-full border items-center mx-auto",
      isModal 
        ? "bg-black/40 backdrop-blur-xl border-white/20" 
        : "bg-white border-editorial-text/10 shadow-sm"
    )}>
      <button 
        onClick={() => setActiveToggle('hist')}
        className={cn(
          "px-6 py-2 rounded-full font-bold text-[10px] uppercase tracking-widest transition-all", 
          activeToggle === 'hist' ? "bg-brand-primary text-white shadow-md" : isModal ? "text-white/40 hover:text-white" : "text-editorial-text/40 hover:text-editorial-text hover:bg-black/5"
        )}
      >
        1969
      </button>
      <button 
        onClick={() => setActiveToggle('curr')}
        className={cn(
          "px-6 py-2 rounded-full font-bold text-[10px] uppercase tracking-widest transition-all", 
          activeToggle === 'curr' ? "bg-brand-primary text-white shadow-md" : isModal ? "text-white/40 hover:text-white" : "text-editorial-text/40 hover:text-editorial-text hover:bg-black/5"
        )}
      >
        Hoy
      </button>
    </div>
  );

  const MiniMap = ({ isModalSidebar = false }: { isModalSidebar?: boolean }) => {
    if (!lat || !lng) return null;
    return (
      <div className={cn("pt-6 space-y-4 md:hidden", isModalSidebar ? "" : "md:pt-4")}>
        <div className="flex items-center gap-2 text-brand-primary">
          <MapIcon size={14} />
          <span className="text-[10px] uppercase font-bold tracking-widest">Ubicación Exacta</span>
        </div>
        <div className="w-full h-48 md:h-40 rounded-xl overflow-hidden border border-editorial-text/10 shadow-inner group relative bg-editorial-bg/50">
          <MapContainer 
            center={[lat, lng]} 
            zoom={16} 
            scrollWheelZoom={false} 
            zoomControl={false} 
            className="w-full h-full grayscale opacity-70 transition-all duration-500"
          >
            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
            <Marker position={[lat, lng]} icon={miniMapIcon} />
            <RecenterMap center={[lat, lng]} />
          </MapContainer>
          <div className="absolute inset-0 pointer-events-none border-2 border-brand-primary/10 rounded-xl"></div>
        </div>
      </div>
    );
  };

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex justify-center -mb-1">
        <ModeSelector />
      </div>
      
      <ViewerContent />

      {viewMode === 'toggle' && (
        <div className="flex justify-center -mt-1">
          <ToggleSelector />
        </div>
      )}

      <MiniMap />

      <div className="px-1 mt-1 flex gap-2">
        <button 
          onClick={() => setIsFullSize(true)}
          className="flex-1 h-12 bg-brand-primary text-white rounded-xl flex items-center justify-center gap-2.5 shadow-lg hover:bg-brand-primary/90 transition-all active:scale-[0.98] group"
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
              className="fixed inset-0 z-[9999] bg-black flex flex-col md:flex-row h-screen overflow-hidden"
            >
              {/* Image Area - Full screen on Mobile, Flex on Desktop */}
              <div className="relative flex-1 flex flex-col min-h-0 bg-black">
                {/* Floating button for quick exit on mobile */}
                <div className="absolute top-4 right-4 z-[100] md:hidden">
                  <button 
                    onClick={() => setIsFullSize(false)}
                    className="w-10 h-10 bg-black/40 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white/60 hover:text-white"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Mode Selector Top Bar (Modal) */}
                <div className="absolute top-4 left-0 right-0 z-50 flex justify-center px-12 md:px-4 pointer-events-none">
                  <div className="landscape:scale-75 landscape:origin-top pointer-events-auto">
                    <ModeSelector isModal />
                  </div>
                </div>
                
                <div className="flex-1 flex items-center justify-center p-0 md:p-8">
                  <ViewerContent isModal />
                </div>

                {/* Minimalist Mobile Overlay (Info + Nav) */}
                <div className="md:hidden absolute bottom-0 left-0 right-0 z-50 flex flex-col pb-6 px-4 pointer-events-none landscape:flex-row landscape:items-end landscape:gap-4 landscape:pb-4">
                  {/* Subtle Text Overlay */}
                  <div className="bg-black/40 backdrop-blur-md p-4 mb-4 rounded-2xl border border-white/10 pointer-events-auto landscape:mb-0 landscape:flex-1 landscape:max-w-[300px]">
                    <div className="text-[8px] uppercase tracking-[0.4em] font-bold text-brand-primary mb-1">Mapa interactivo</div>
                    <h2 className="text-sm font-bold tracking-tight text-white line-clamp-1 mb-0.5 font-display uppercase">{title}</h2>
                    <p className="text-[10px] text-white/60 font-serif line-clamp-2 landscape:line-clamp-1">{description}</p>
                  </div>

                  <div className="flex flex-col gap-4 pointer-events-auto landscape:flex-1">
                    {/* Toggle Selector for Mobile - if in toggle mode */}
                    {viewMode === 'toggle' && (
                      <div className="flex justify-center landscape:scale-90">
                        <ToggleSelector isModal />
                      </div>
                    )}

                    {/* Minimalist Navigation Overlay */}
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={onPrev}
                        disabled={!hasPrev}
                        className={cn(
                          "flex-1 h-12 rounded-xl flex items-center justify-center gap-2 font-bold text-[9px] uppercase tracking-[0.2em] transition-all bg-black/40 backdrop-blur-md border border-white/10 text-white shadow-xl landscape:h-10",
                          !hasPrev && "opacity-20 cursor-not-allowed"
                        )}
                      >
                        <ArrowLeftRight size={14} className="rotate-180" />
                        Prev
                      </button>
                      
                      <button 
                        onClick={onNext}
                        disabled={!hasNext}
                        className={cn(
                          "flex-1 h-12 rounded-xl flex items-center justify-center gap-2 font-bold text-[9px] uppercase tracking-[0.2em] transition-all bg-white text-black shadow-xl landscape:h-10",
                          !hasNext && "opacity-20 cursor-not-allowed"
                        )}
                      >
                        Sig
                        <ArrowLeftRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Desktop Toggle (Handled in Sidebar on Desktop, but kept here for toggle mode logic) */}
                <div className="hidden md:block">
                  {viewMode === 'toggle' && (
                    <div className="absolute bottom-10 left-0 right-0 z-50 flex justify-center px-4">
                      <ToggleSelector isModal />
                    </div>
                  )}
                </div>
              </div>

                {/* Info Area - Sidebar */}
              <div className={cn(
                "fixed inset-y-0 right-0 z-[200] w-[85%] max-w-[320px] md:w-[400px] md:max-w-none md:flex bg-editorial-bg overflow-hidden flex-col border-l border-white/10 shadow-2xl transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
                showMobileSidebar ? "translate-x-0 flex" : "translate-x-full md:translate-x-0 hidden"
              )}>
                {/* Mobile Close Handle */}
                <button 
                  onClick={() => setShowMobileSidebar(false)}
                  className="md:hidden absolute top-6 right-6 w-10 h-10 bg-black/5 hover:bg-black/10 rounded-full flex items-center justify-center text-editorial-text/40 transition-colors z-20"
                >
                  <X size={20} />
                </button>

                <div className="flex-1 overflow-y-auto p-8 md:p-10 custom-scrollbar landscape:p-6 landscape:pt-12">
                  <div className="flex flex-col gap-1 mb-6 landscape:mb-4">
                    <div className="text-[10px] uppercase tracking-[0.4em] font-bold text-brand-primary">Info Inmersiva</div>
                    <div className="text-xs opacity-40 font-mono uppercase tracking-widest leading-none mt-2">Mapa interactivo</div>
                  </div>

                  <div className="space-y-6 landscape:space-y-4">
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3 font-display uppercase leading-tight text-editorial-text landscape:text-xl">
                        {title}
                      </h2>
                      <div className="h-1.5 w-16 bg-brand-primary" />
                    </div>

                    <p className="text-base md:text-lg leading-relaxed text-editorial-text font-serif opacity-90 landscape:text-sm">
                      {description}
                    </p>

                    {/* Miniature Map in Sidebar */}
                    <MiniMap isModalSidebar />
                    
                    {/* Selector para mobile si estamos en modo toggle */}
                    {viewMode === 'toggle' && (
                      <div className="md:hidden pt-4">
                        <div className="text-[10px] uppercase font-bold tracking-widest opacity-40 mb-3">Cambiar Año</div>
                        <ToggleSelector isModal />
                      </div>
                    )}
                  </div>
                </div>

                {/* Highly accessible Navigation and Close Buttons for Touch Screens */}
                <div className="p-6 md:p-10 border-t border-editorial-text/10 bg-editorial-bg/50 backdrop-blur-md space-y-4 landscape:p-4 landscape:space-y-2">
                  {/* Navigation Row */}
                  <div className="grid grid-cols-2 gap-4 pb-2 landscape:pb-0 landscape:gap-2">
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
