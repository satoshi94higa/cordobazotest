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

type ViewMode = 'side-by-side' | 'toggle';

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
  const [activeToggle, setActiveToggle] = useState<'hist' | 'curr'>('hist');
  const [isFullSize, setIsFullSize] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const ViewerContent = ({ isModal = false, overrideViewMode }: { isModal?: boolean, overrideViewMode?: ViewMode }) => {
    const currentViewMode = overrideViewMode || viewMode;
    
    return (
      <div 
        className={cn(
          "relative overflow-hidden flex items-center justify-center bg-black/5 group/viewer", 
          isModal ? "w-full h-full p-2 md:p-4 bg-black" : "w-full aspect-video"
        )}
      >
        <div className={cn("relative h-full w-full", isModal ? "flex items-center justify-center" : "")}>
          <AnimatePresence mode="wait">
            {currentViewMode === 'side-by-side' && (
              <motion.div key="side" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-2 gap-px bg-editorial-text/10 h-full w-full">
                <div className="relative flex items-center justify-center overflow-hidden bg-black h-full">
                  {historical ? (
                    <img 
                      src={historical} 
                      alt="Vista 1969"
                      className={cn(
                        "block grayscale sepia-[0.2] object-contain w-full h-full",
                        isModal ? "max-w-full max-h-[96vh]" : ""
                      )} 
                      referrerPolicy="no-referrer" 
                    />
                  ) : (
                    <div className="text-white/20 text-[10px] uppercase tracking-widest font-bold text-center p-2">Foto histórica no disponible</div>
                  )}
                  <div className={cn(
                    "absolute left-3 z-20 bg-black/75 backdrop-blur-md text-white text-[9px] md:text-[10px] font-bold uppercase px-2 py-1 md:px-2 md:py-0.5 tracking-[0.2em] border border-white/20 rounded shadow-xl",
                    isModal ? "top-4 md:top-6 md:left-6" : "bottom-3 md:bottom-4 md:left-4"
                  )}>1969</div>
                </div>
                <div className="relative flex items-center justify-center overflow-hidden bg-black h-full">
                  {current ? (
                    <img 
                      src={current} 
                      alt="Vista Actual" 
                      className={cn(
                        "block object-contain w-full h-full",
                        isModal ? "max-w-full max-h-[96vh]" : ""
                      )} 
                      referrerPolicy="no-referrer" 
                    />
                  ) : (
                    <div className="text-white/20 text-[10px] uppercase tracking-widest font-bold text-center p-2">Foto actual no disponible</div>
                  )}
                  <div className={cn(
                    "absolute left-3 z-20 bg-brand-primary backdrop-blur-md text-white text-[9px] md:text-[10px] font-bold uppercase px-2 py-1 md:px-2 md:py-0.5 tracking-[0.2em] border border-white/20 rounded shadow-xl",
                    isModal ? "top-4 md:top-6 md:left-6" : "bottom-3 md:bottom-4 md:left-4"
                  )}>Hoy</div>
                </div>
              </motion.div>
            )}

            {currentViewMode === 'toggle' && (
              <motion.div key="toggle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative flex items-center justify-center bg-black/10 h-full w-full">
                {(activeToggle === 'hist' ? historical : current) ? (
                  <img 
                    src={activeToggle === 'hist' ? historical : current} 
                    alt={activeToggle === 'hist' ? "Vista 1969" : "Vista Actual"}
                    className={cn(
                      "block transition-all duration-500 object-contain w-full h-full", 
                      activeToggle === 'hist' && "grayscale sepia-[0.2]",
                      isModal ? "max-w-full max-h-[96vh]" : ""
                    )} 
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="text-black/20 text-[10px] uppercase tracking-widest font-bold">Imagen no disponible</div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  };;

  const ModeSelector = ({ isModal = false }: { isModal?: boolean }) => (
    <div className={cn(
      "flex p-1 rounded-full border items-center mx-auto",
      isModal 
        ? "bg-black/40 backdrop-blur-xl border-white/20" 
        : "bg-white border-editorial-text/10 shadow-sm"
    )}>
      <button 
        onClick={(e) => { e.stopPropagation(); setViewMode('side-by-side'); }}
        className={cn(
          "px-3 h-8 rounded-full flex items-center justify-center gap-1.5 transition-all outline-none",
          viewMode === 'side-by-side' 
            ? "bg-brand-primary text-white shadow-lg" 
            : isModal ? "text-white/40 hover:text-white" : "text-editorial-text/40 hover:text-editorial-text hover:bg-black/5"
        )}
      >
        <Columns size={12} />
        <span className="text-[8px] font-bold uppercase tracking-widest">Lados</span>
      </button>
      <button 
        onClick={(e) => { e.stopPropagation(); setViewMode('toggle'); }}
        className={cn(
          "px-3 h-8 rounded-full flex items-center justify-center gap-1.5 transition-all outline-none",
          viewMode === 'toggle' 
            ? "bg-brand-primary text-white shadow-lg" 
            : isModal ? "text-white/40 hover:text-white" : "text-editorial-text/40 hover:text-editorial-text hover:bg-black/5"
        )}
      >
        <Layers size={12} />
        <span className="text-[8px] font-bold uppercase tracking-widest">Alternar</span>
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
        onClick={(e) => { e.stopPropagation(); setActiveToggle('hist'); }}
        className={cn(
          "px-5 py-1.5 rounded-full font-bold text-[9px] uppercase tracking-widest transition-all outline-none", 
          activeToggle === 'hist' ? "bg-brand-primary text-white shadow-md" : isModal ? "text-white/40 hover:text-white" : "text-editorial-text/40 hover:text-editorial-text hover:bg-black/5"
        )}
      >
        1969
      </button>
      <button 
        onClick={(e) => { e.stopPropagation(); setActiveToggle('curr'); }}
        className={cn(
          "px-5 py-1.5 rounded-full font-bold text-[9px] uppercase tracking-widest transition-all outline-none", 
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
    <div className={cn("flex flex-col gap-3", className)}>
      <ViewerContent overrideViewMode="side-by-side" />

      <div className="space-y-2 px-1">
        <h2 className="text-[10px] font-bold tracking-tight font-display uppercase leading-tight text-editorial-text">
          {title}
        </h2>
        <div className="h-0.5 w-6 bg-brand-primary" />
        <p className="text-[8px] leading-relaxed text-editorial-text font-serif italic opacity-70 line-clamp-2">
          {description}
        </p>
      </div>

      <div className="px-0.5 mt-1 flex flex-col gap-2">
        <button 
          onClick={() => setIsFullSize(true)}
          className="w-full h-9 bg-brand-primary text-white rounded-lg flex items-center justify-center gap-2 shadow-lg hover:bg-brand-primary/90 transition-all active:scale-[0.98] group"
        >
          <Maximize2 size={13} className="opacity-80 group-hover:scale-110 transition-transform" />
          <span className="text-[7px] uppercase font-bold tracking-[0.3em]">Exploración Inmersiva</span>
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
                <div className="md:hidden absolute bottom-4 left-0 right-0 z-50 flex flex-col pb-8 px-4 pointer-events-none landscape:flex-row landscape:items-end landscape:gap-4 landscape:pb-4">
                  {/* Subtle Text Overlay */}
                  <div className="bg-black/60 backdrop-blur-md p-3 mb-4 rounded-xl border border-white/10 pointer-events-auto landscape:mb-0 landscape:flex-1 landscape:max-w-[260px]">
                    <div className="text-[7px] uppercase tracking-[0.4em] font-bold text-brand-primary mb-1">Mapa interactivo</div>
                    <h2 className="text-xs font-bold tracking-tight text-white line-clamp-1 mb-0.5 font-display uppercase">{title}</h2>
                    <p className="text-[9px] text-white/50 font-serif line-clamp-2 landscape:line-clamp-1">{description}</p>
                  </div>

                  <div className="flex flex-col gap-3 pointer-events-auto landscape:flex-1">
                    {/* Toggle Selector for Mobile - if in toggle mode */}
                    {viewMode === 'toggle' && (
                      <div className="flex justify-center landscape:scale-80">
                        <ToggleSelector isModal />
                      </div>
                    )}

                    {/* Minimalist Navigation Overlay */}
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={onPrev}
                        disabled={!hasPrev}
                        className={cn(
                          "flex-1 h-14 rounded-xl flex items-center justify-center gap-2 font-bold text-[8px] uppercase tracking-[0.2em] transition-all bg-black/60 backdrop-blur-md border border-white/10 text-white shadow-xl active:scale-95",
                          !hasPrev && "opacity-20 cursor-not-allowed"
                        )}
                      >
                        <ArrowLeftRight size={14} className="rotate-180" />
                        Anterior
                      </button>
                      
                      <button 
                        onClick={onNext}
                        disabled={!hasNext}
                        className={cn(
                          "flex-1 h-14 rounded-xl flex items-center justify-center gap-2 font-bold text-[8px] uppercase tracking-[0.2em] transition-all bg-white text-black shadow-xl active:scale-95",
                          !hasNext && "opacity-20 cursor-not-allowed"
                        )}
                      >
                        Siguiente
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

                <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar landscape:p-4 landscape:pt-10">
                  <div className="flex flex-col gap-1 mb-4 landscape:mb-3">
                    <div className="text-[8px] uppercase tracking-[0.4em] font-bold text-brand-primary">Info Inmersiva</div>
                    <div className="text-[9px] opacity-40 font-mono uppercase tracking-widest leading-none mt-1">Mapa interactivo</div>
                  </div>

                  <div className="space-y-4 landscape:space-y-3">
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-2 font-display uppercase leading-tight text-editorial-text landscape:text-lg">
                        {title}
                      </h2>
                      <div className="h-1 w-12 bg-brand-primary" />
                    </div>

                    <p className="text-sm md:text-base leading-relaxed text-editorial-text font-serif opacity-90 landscape:text-xs">
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
                <div className="p-4 md:p-6 border-t border-editorial-text/10 bg-editorial-bg/50 backdrop-blur-md space-y-3 landscape:p-3 landscape:space-y-2">
                  {/* Navigation Row */}
                  <div className="grid grid-cols-2 gap-3 pb-1 landscape:pb-0 landscape:gap-2">
                    <button 
                      onClick={onPrev}
                      disabled={!hasPrev}
                      className={cn(
                        "h-12 rounded-xl flex items-center justify-center gap-2 font-bold text-[9px] uppercase tracking-widest border transition-all",
                        hasPrev 
                          ? "bg-white text-editorial-text border-editorial-text/10 shadow-lg hover:bg-gray-50 active:scale-95" 
                          : "opacity-20 cursor-not-allowed bg-black/5"
                      )}
                    >
                      <ArrowLeftRight size={14} className="rotate-180 opacity-40" />
                      Anterior
                    </button>
                    <button 
                      onClick={onNext}
                      disabled={!hasNext}
                      className={cn(
                        "h-12 rounded-xl flex items-center justify-center gap-2 font-bold text-[9px] uppercase tracking-widest border transition-all",
                        hasNext 
                          ? "bg-white text-editorial-text border-editorial-text/10 shadow-lg hover:bg-gray-50 active:scale-95" 
                          : "opacity-20 cursor-not-allowed bg-black/5"
                      )}
                    >
                      Siguiente
                      <ArrowLeftRight size={14} className="opacity-40" />
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => setIsFullSize(false)}
                    className="w-full h-12 bg-brand-primary text-white rounded-xl flex items-center justify-center gap-3 shadow-lg hover:bg-editorial-text transition-all active:scale-95 group"
                  >
                    <LocateFixed size={14} />
                    <span className="text-[9px] uppercase font-bold tracking-[0.3em]">Volver al Mapa</span>
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
