import { useState, useEffect, useRef, MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from 'react';
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
  isPopup?: boolean;
}

type ViewMode = 'slide' | 'side-by-side' | 'toggle';

const isPhotoValid = (url: string | undefined | null): boolean => {
  if (!url) return false;
  const trimmed = url.trim();
  return trimmed !== "" && trimmed !== "fotos" && trimmed !== "fotos/" && trimmed !== "/fotos" && trimmed !== "/fotos/";
};

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
  className,
  isPopup = false
}: PhotoSliderProps) {
  const historicalSrc = isPhotoValid(historical) ? historical : null;
  const currentSrc = isPhotoValid(current) ? current : null;
  const hasBothPhotos = !!historicalSrc && !!currentSrc;

  const [viewMode, setViewMode] = useState<ViewMode>('side-by-side');
  const [activeToggle, setActiveToggle] = useState<'hist' | 'curr'>('hist');
  const [isFullSize, setIsFullSize] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // Swipe slider state
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const containerRectRef = useRef<DOMRect | null>(null);
  const isReadyToDrag = useRef(false);

  // Reset toggle selection to historical view when navigating to a different point
  useEffect(() => {
    setActiveToggle('hist');
    setSliderPosition(50);
  }, [historical]);

  const handleMove = (clientX: number) => {
    let rect = containerRectRef.current;
    if (!rect && containerRef.current) {
      rect = containerRef.current.getBoundingClientRect();
      containerRectRef.current = rect;
    }
    if (!rect) return;
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleDragStart = (clientX: number) => {
    isReadyToDrag.current = true;
    if (containerRef.current) {
      containerRectRef.current = containerRef.current.getBoundingClientRect();
    }
    handleMove(clientX);
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isReadyToDrag.current) return;
      if (!isDragging) {
        setIsDragging(true);
      }
      handleMove(e.clientX);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isReadyToDrag.current) return;
      if (e.touches && e.touches[0]) {
        // Prevent map panning or slide bouncing on iOS/Android
        if (e.cancelable) {
          e.preventDefault();
        }
        if (!isDragging) {
          setIsDragging(true);
        }
        handleMove(e.touches[0].clientX);
      }
    };

    const onMouseUp = () => {
      isReadyToDrag.current = false;
      setIsDragging(false);
      containerRectRef.current = null;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onMouseUp);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onMouseUp);
    };
  }, [isDragging]);

  const ViewerContent = ({ isModal = false, overrideViewMode }: { isModal?: boolean, overrideViewMode?: ViewMode }) => {
    // If only one photo is available, override the view mode to 'toggle' showing only historical photo
    const currentViewMode = !hasBothPhotos ? 'toggle' : (isPopup && !isModal ? 'side-by-side' : (overrideViewMode || viewMode));
    
    return (
      <div 
        className={cn(
          "relative overflow-hidden flex items-center justify-center bg-black/5 group/viewer", 
          isModal ? "w-full h-full p-2 md:p-4 bg-black" : "w-full aspect-video"
        )}
      >
        <div className={cn("relative h-full w-full flex items-center justify-center")}>
          <AnimatePresence mode="wait">
            {currentViewMode === 'slide' && hasBothPhotos && (
              <motion.div 
                key="slide" 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="relative w-full h-full select-none"
              >
                <div 
                  ref={containerRef}
                  className="relative w-full h-full overflow-hidden select-none cursor-ew-resize touch-none"
                  onMouseDown={(e) => {
                    e.stopPropagation(); // Safe for Leaflet map popups!
                    e.preventDefault();
                    handleDragStart(e.clientX);
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation(); // Safe for Leaflet map popups on Mobile!
                    if (e.touches && e.touches[0]) {
                      handleDragStart(e.touches[0].clientX);
                    }
                  }}
                >
                  {/* Historical past photo on bottom */}
                  <img 
                    src={historicalSrc || undefined} 
                    alt="Vista 1969"
                    className={cn(
                      "absolute inset-0 w-full h-full object-contain grayscale sepia-[0.2] pointer-events-none select-none",
                      isModal ? "max-w-full max-h-[96vh]" : ""
                    )} 
                    referrerPolicy="no-referrer" 
                  />
                  <div className={cn(
                    "absolute left-3 z-20 bg-black/75 backdrop-blur-md text-white text-[9px] md:text-[10px] font-bold uppercase px-2 py-1 md:px-2 md:py-0.5 tracking-[0.2em] border border-white/20 rounded shadow-xl pointer-events-none transition-opacity duration-300",
                    sliderPosition < 15 ? "opacity-0" : "opacity-100",
                    isModal ? "top-4 md:top-6 md:left-6" : "bottom-3 md:bottom-4 md:left-4"
                  )}>1969</div>

                  {/* Current present photo on top, clipped */}
                  <img 
                    src={currentSrc || undefined} 
                    alt="Vista Actual"
                    className={cn(
                      "absolute inset-0 w-full h-full object-contain pointer-events-none select-none",
                      isModal ? "max-w-full max-h-[96vh]" : "",
                      !isDragging && "transition-[clip-path] duration-300 ease-out"
                    )} 
                    style={{
                      clipPath: `polygon(${sliderPosition}% 0, 100% 0, 100% 100%, ${sliderPosition}% 100%)`
                    }}
                    referrerPolicy="no-referrer" 
                  />
                  <div className={cn(
                    "absolute right-3 z-20 bg-brand-primary backdrop-blur-md text-white text-[9px] md:text-[10px] font-bold uppercase px-2 py-1 md:px-2 md:py-0.5 tracking-[0.2em] border border-white/20 rounded shadow-xl pointer-events-none transition-opacity duration-300",
                    sliderPosition > 85 ? "opacity-0" : "opacity-100",
                    isModal ? "top-4 md:top-6 md:right-6" : "bottom-3 md:bottom-4 md:right-4"
                  )}>Hoy</div>

                  {/* Split bar line */}
                  <div 
                    className={cn(
                      "absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_8px_rgba(0,0,0,0.5)] z-30 pointer-events-none transition-colors duration-200 group-hover/viewer:bg-brand-primary",
                      !isDragging && "transition-[left] duration-300 ease-out"
                    )}
                    style={{ left: `${sliderPosition}%` }}
                  />

                  {/* Interactive Handle */}
                  <div 
                    className={cn(
                      "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-40 select-none pointer-events-none",
                      !isDragging && "transition-[left] duration-300 ease-out"
                    )}
                    style={{ left: `${sliderPosition}%` }}
                  >
                    <div className="w-8 h-8 rounded-full bg-white border border-brand-primary shadow-[0_4px_12px_rgba(0,0,0,0.4)] flex items-center justify-center text-brand-primary transition-transform duration-100 scale-100 group-hover/viewer:scale-110 active:scale-95">
                      <ArrowLeftRight size={14} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {currentViewMode === 'side-by-side' && (
              <motion.div key="side" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-2 gap-px bg-editorial-text/10 h-full w-full">
                <div 
                  className="relative flex items-center justify-center overflow-hidden bg-black h-full cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    setViewMode('toggle');
                    setActiveToggle('hist');
                    if (!isModal) {
                      setIsFullSize(true);
                    }
                  }}
                >
                  {historicalSrc ? (
                    <img 
                      src={historicalSrc} 
                      alt="Vista 1969"
                      className={cn(
                        "block grayscale sepia-[0.2] object-contain w-full h-full pointer-events-none select-none",
                        isModal ? "max-w-full max-h-[96vh]" : ""
                      )} 
                      referrerPolicy="no-referrer" 
                    />
                  ) : (
                    <div className="text-white/20 text-[10px] uppercase tracking-widest font-bold text-center p-2">Foto histórica no disponible</div>
                  )}
                  <div className={cn(
                    "absolute left-3 z-20 bg-black/75 backdrop-blur-md text-white text-[9px] md:text-[10px] font-bold uppercase px-2 py-1 md:px-2 md:py-0.5 tracking-[0.2em] border border-white/20 rounded shadow-xl pointer-events-none",
                    isModal ? "top-4 md:top-6 md:left-6" : "bottom-3 md:bottom-4 md:left-4"
                  )}>1969</div>
                </div>
                <div 
                  className="relative flex items-center justify-center overflow-hidden bg-black h-full cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    setViewMode('toggle');
                    setActiveToggle('curr');
                    if (!isModal) {
                      setIsFullSize(true);
                    }
                  }}
                >
                  {currentSrc ? (
                    <img 
                      src={currentSrc} 
                      alt="Vista Actual" 
                      className={cn(
                        "block object-contain w-full h-full pointer-events-none select-none",
                        isModal ? "max-w-full max-h-[96vh]" : ""
                      )} 
                      referrerPolicy="no-referrer" 
                    />
                  ) : (
                    <div className="text-white/20 text-[10px] uppercase tracking-widest font-bold text-center p-2">Foto actual no disponible</div>
                  )}
                  <div className={cn(
                    "absolute left-3 z-20 bg-brand-primary backdrop-blur-md text-white text-[9px] md:text-[10px] font-bold uppercase px-2 py-1 md:px-2 md:py-0.5 tracking-[0.2em] border border-white/20 rounded shadow-xl pointer-events-none",
                    isModal ? "top-4 md:top-6 md:left-6" : "bottom-3 md:bottom-4 md:left-4"
                  )}>Hoy</div>
                </div>
              </motion.div>
            )}

            {currentViewMode === 'toggle' && (
              <motion.div 
                key="toggle" 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="relative flex items-center justify-center bg-black/10 h-full w-full cursor-pointer hover:opacity-95 select-none transition-all duration-300"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveToggle(prev => prev === 'hist' ? 'curr' : 'hist');
                }}
              >
                {(activeToggle === 'hist' ? historicalSrc : currentSrc) ? (
                  <img 
                    src={(activeToggle === 'hist' ? historicalSrc : currentSrc) || undefined} 
                    alt={activeToggle === 'hist' ? "Vista 1969" : "Vista Actual"}
                    className={cn(
                      "block transition-all duration-500 object-contain w-full h-full", 
                      activeToggle === 'hist' && "grayscale sepia-[0.2]",
                      isModal ? "max-w-full max-h-[96vh]" : ""
                    )} 
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="text-black/20 text-[10px] uppercase tracking-widest font-bold text-center p-4">Imagen no disponible</div>
                )}
                {hasBothPhotos && (
                  <div className={cn(
                    "absolute left-3 z-20 bg-black/75 backdrop-blur-md text-white text-[9px] md:text-[10px] font-bold uppercase px-2 py-1 md:px-2 md:py-0.5 tracking-[0.2em] border border-white/20 rounded shadow-xl",
                    isModal ? "top-4 md:top-6 md:left-6" : "bottom-3 md:bottom-4 md:left-4"
                  )}>{activeToggle === 'hist' ? '1969' : 'Hoy'}</div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  const ModeSelector = ({ isModal = false }: { isModal?: boolean }) => {
    if (!hasBothPhotos) return null;
    if (isPopup && !isModal) return null;
    return (
      <div className={cn(
        "flex p-1 rounded-full border items-center mx-auto",
        isModal 
          ? "bg-black/40 backdrop-blur-xl border-white/20" 
          : "bg-white border-editorial-text/10 shadow-sm"
      )}>
        {/* Lados */}
        <button 
          onClick={(e) => { e.stopPropagation(); setViewMode('side-by-side'); }}
          className={cn(
            "px-2.5 h-8 rounded-full flex items-center justify-center gap-1 transition-all outline-none cursor-pointer",
            viewMode === 'side-by-side' 
              ? "bg-brand-primary text-white shadow-lg font-bold" 
              : isModal ? "text-white/40 hover:text-white" : "text-editorial-text/40 hover:text-editorial-text hover:bg-black/5"
          )}
        >
          <Columns size={11} />
          <span className="text-[7.5px] uppercase tracking-widest font-sans font-bold">Lados</span>
        </button>

        {/* Alternar */}
        <button 
          onClick={(e) => { e.stopPropagation(); setViewMode('toggle'); }}
          className={cn(
            "px-2.5 h-8 rounded-full flex items-center justify-center gap-1 transition-all outline-none cursor-pointer",
            viewMode === 'toggle' 
              ? "bg-brand-primary text-white shadow-lg font-bold" 
              : isModal ? "text-white/40 hover:text-white" : "text-editorial-text/40 hover:text-editorial-text hover:bg-black/5"
          )}
        >
          <Layers size={11} />
          <span className="text-[7.5px] uppercase tracking-widest font-sans font-bold">Alternar</span>
        </button>

        {/* Deslizar */}
        <button 
          onClick={(e) => { e.stopPropagation(); setViewMode('slide'); }}
          className={cn(
            "px-2.5 h-8 rounded-full flex items-center justify-center gap-1 transition-all outline-none cursor-pointer",
            viewMode === 'slide' 
              ? "bg-brand-primary text-white shadow-lg font-bold" 
              : isModal ? "text-white/40 hover:text-white" : "text-editorial-text/40 hover:text-editorial-text hover:bg-black/5"
          )}
        >
          <ArrowLeftRight size={11} />
          <span className="text-[7.5px] uppercase tracking-widest font-sans font-bold">Deslizar</span>
        </button>
      </div>
    );
  };

  const ToggleSelector = ({ isModal = false }: { isModal?: boolean }) => {
    if (!hasBothPhotos) return null;
    return (
      <div className={cn(
        "flex p-1 rounded-full border items-center mx-auto",
        isModal 
          ? "bg-black/40 backdrop-blur-xl border-white/20" 
          : "bg-white border-editorial-text/10 shadow-sm"
      )}>
        <button 
          onClick={(e) => { e.stopPropagation(); setActiveToggle('hist'); }}
          className={cn(
            "px-5 py-1.5 rounded-full font-bold text-[9px] uppercase tracking-widest transition-all outline-none cursor-pointer", 
            activeToggle === 'hist' ? "bg-brand-primary text-white shadow-md" : isModal ? "text-white/40 hover:text-white" : "text-editorial-text/40 hover:text-editorial-text hover:bg-black/5"
          )}
        >
          1969
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); setActiveToggle('curr'); }}
          className={cn(
            "px-5 py-1.5 rounded-full font-bold text-[9px] uppercase tracking-widest transition-all outline-none cursor-pointer", 
            activeToggle === 'curr' ? "bg-brand-primary text-white shadow-md" : isModal ? "text-white/40 hover:text-white" : "text-editorial-text/40 hover:text-editorial-text hover:bg-black/5"
          )}
        >
          Hoy
        </button>
      </div>
    );
  };

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
      <ViewerContent />

      {/* Inline view mode switching toggles */}
      {hasBothPhotos && !isPopup && (
        <div className="flex flex-col gap-2 items-center w-full my-0.5 animate-fadeIn">
          <ModeSelector isModal={false} />
          {viewMode === 'toggle' && (
            <ToggleSelector isModal={false} />
          )}
        </div>
      )}

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
          className="w-full h-9 bg-brand-primary text-white rounded-lg flex items-center justify-center gap-2 shadow-lg hover:bg-brand-primary/90 transition-all active:scale-[0.98] group cursor-pointer"
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

                {/* Mode Selector Top Bar (Modal) - NOW MOBILE ONLY as it is integrated into Sidebar for desktop */}
                <div className="absolute top-4 left-0 right-0 z-50 flex md:hidden justify-center px-12 md:px-4 pointer-events-none">
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

                {/* Desktop controls are now completely in the Sidebar for a clean UI */}
                <div className="hidden md:block">
                  {/* Floating Toggle minimized on desktop to avoid duplicate controls */}
                </div>
              </div>

                {/* Info Area - Sidebar */}
              <div className={cn(
                "fixed inset-y-0 right-0 z-[200] w-[85%] max-w-[320px] md:w-[460px] lg:w-[500px] md:max-w-none md:flex bg-editorial-bg overflow-hidden flex-col border-l border-white/10 shadow-2xl transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
                showMobileSidebar ? "translate-x-0 flex" : "translate-x-full md:translate-x-0 hidden"
              )}>
                {/* Mobile Close Handle */}
                <button 
                  onClick={() => setShowMobileSidebar(false)}
                  className="md:hidden absolute top-4 right-4 w-10 h-10 bg-black/5 hover:bg-black/10 rounded-full flex items-center justify-center text-editorial-text/40 transition-colors z-30"
                >
                  <X size={20} />
                </button>

                {/* Flex-1 text details - NOW AT THE TOP so they fill upper space */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar landscape:p-4 landscape:pt-10">
                  <div className="flex flex-col gap-1 mb-4 landscape:mb-3">
                    <div className="text-[8px] uppercase tracking-[0.4em] font-bold text-brand-primary">Info Inmersiva</div>
                    <div className="text-[9px] opacity-40 font-mono uppercase tracking-widest leading-none mt-1">Mapa interactivo</div>
                  </div>

                  <div className="space-y-4 landscape:space-y-3">
                    <div>
                      <h2 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight mb-2 font-display uppercase leading-tight text-editorial-text landscape:text-lg">
                        {title}
                      </h2>
                      <div className="h-1 w-12 bg-brand-primary" />
                    </div>

                    <p className="text-sm md:text-base lg:text-lg leading-relaxed text-editorial-text font-serif opacity-90 landscape:text-xs">
                      {description}
                    </p>

                    {/* Giant Screen Optimized Controls - positioned directly underneath explanation text */}
                    <div className="hidden md:flex flex-col gap-6 pt-6 pb-2 border-t border-editorial-text/10 mt-6 select-none animate-fadeIn">
                      
                      {/* 1. MODO DE VISIÓN (Vision Modes) - Giant buttons grouped together */}
                      {hasBothPhotos && (
                        <div className="space-y-3">
                          <span className="text-xs font-bold uppercase tracking-[0.25em] text-editorial-text/60">
                            Modo de Visión
                          </span>
                          <div className="grid grid-cols-3 gap-3">
                            <button 
                              onClick={(e) => { e.stopPropagation(); setViewMode('slide'); }}
                              className={cn(
                                "h-20 lg:h-24 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all cursor-pointer font-bold border text-xs uppercase tracking-wider",
                                viewMode === 'slide'
                                  ? "bg-brand-primary text-white border-transparent shadow-lg scale-[1.02]"
                                  : "bg-white text-editorial-text border-editorial-text/10 hover:bg-gray-50 active:scale-[0.98]"
                              )}
                            >
                              <ArrowLeftRight size={22} className={viewMode === 'slide' ? "text-white" : "text-brand-primary"} />
                              <span className="text-[11px] lg:text-xs font-bold tracking-wider">Deslizar</span>
                            </button>
                            
                            <button 
                              onClick={(e) => { e.stopPropagation(); setViewMode('side-by-side'); }}
                              className={cn(
                                "h-20 lg:h-24 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all cursor-pointer font-bold border text-xs uppercase tracking-wider",
                                viewMode === 'side-by-side'
                                  ? "bg-brand-primary text-white border-transparent shadow-lg scale-[1.02]"
                                  : "bg-white text-editorial-text border-editorial-text/10 hover:bg-gray-50 active:scale-[0.98]"
                              )}
                            >
                              <Columns size={22} className={viewMode === 'side-by-side' ? "text-white" : "text-brand-primary"} />
                              <span className="text-[11px] lg:text-xs font-bold tracking-wider">Lados</span>
                            </button>

                            <button 
                              onClick={(e) => { e.stopPropagation(); setViewMode('toggle'); }}
                              className={cn(
                                "h-20 lg:h-24 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all cursor-pointer font-bold border text-xs uppercase tracking-wider",
                                viewMode === 'toggle'
                                  ? "bg-brand-primary text-white border-transparent shadow-lg scale-[1.02]"
                                  : "bg-white text-editorial-text border-editorial-text/10 hover:bg-gray-50 active:scale-[0.98]"
                              )}
                            >
                              <Layers size={22} className={viewMode === 'toggle' ? "text-white" : "text-brand-primary"} />
                              <span className="text-[11px] lg:text-xs font-bold tracking-wider">Alternar</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 2. BOTONES DE AÑOS - Massive and interactive. If a user clicks a year in any mode, we switch to split/toggle mode for instant feedback! */}
                      {hasBothPhotos && (
                        <div className="space-y-3">
                          <span className="text-xs font-bold uppercase tracking-[0.25em] text-editorial-text/60">
                            Año Seleccionado
                          </span>
                          <div className="grid grid-cols-2 gap-4">
                            <button 
                              onClick={() => { setActiveToggle('hist'); setViewMode('toggle'); }}
                              className={cn(
                                "h-20 lg:h-24 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer font-bold border text-base uppercase tracking-widest",
                                (viewMode === 'toggle' && activeToggle === 'hist')
                                  ? "bg-brand-primary text-white border-transparent shadow-lg scale-[1.02]"
                                  : "bg-white text-editorial-text border-editorial-text/10 hover:bg-gray-50 active:scale-[0.98] opacity-85"
                              )}
                            >
                              <span className="text-xl lg:text-2xl font-display font-black">1969</span>
                              <span className="text-[10px] lg:text-[11px] uppercase tracking-wider opacity-70 font-bold">Foto Histórica</span>
                            </button>
                            
                            <button 
                              onClick={() => { setActiveToggle('curr'); setViewMode('toggle'); }}
                              className={cn(
                                "h-20 lg:h-24 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer font-bold border text-base uppercase tracking-widest",
                                (viewMode === 'toggle' && activeToggle === 'curr')
                                  ? "bg-brand-primary text-white border-transparent shadow-lg scale-[1.02]"
                                  : "bg-white text-editorial-text border-editorial-text/10 hover:bg-gray-50 active:scale-[0.98] opacity-85"
                              )}
                            >
                              <span className="text-xl lg:text-2xl font-display font-black">Hoy</span>
                              <span className="text-[10px] lg:text-[11px] uppercase tracking-wider opacity-70 font-bold">Foto Actual</span>
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="border-t border-editorial-text/10 my-1" />

                      {/* 3. PRIMARY ACTION & NAVIGATION */}
                      <div className="space-y-4">
                        {/* Back to Map Button - scaled up for high readability & touch friendliness */}
                        <button 
                          onClick={() => setIsFullSize(false)}
                          className="w-full h-18 lg:h-22 bg-brand-primary text-white hover:bg-editorial-text transition-all active:scale-[0.98] group cursor-pointer flex items-center justify-center gap-4 shadow-xl font-bold border border-transparent rounded-2xl"
                        >
                          <LocateFixed size={24} className="group-hover:scale-110 transition-transform text-white" />
                          <span className="text-sm lg:text-base uppercase font-extrabold tracking-[0.3em]">Volver al Mapa</span>
                        </button>

                        {/* Navigation controls */}
                        <div className="grid grid-cols-2 gap-4">
                          <button 
                            onClick={onPrev}
                            disabled={!hasPrev}
                            className={cn(
                              "h-16 lg:h-20 rounded-2xl flex items-center justify-center gap-3 font-bold text-xs lg:text-sm uppercase tracking-widest border transition-all cursor-pointer",
                              hasPrev 
                                ? "bg-white text-editorial-text border-editorial-text/20 shadow-lg hover:bg-gray-50 active:scale-[0.98] hover:border-editorial-text" 
                                : "opacity-20 cursor-not-allowed bg-black/5"
                            )}
                          >
                            <ArrowLeftRight size={20} className="rotate-180 opacity-60" />
                            Anterior
                          </button>
                          <button 
                            onClick={onNext}
                            disabled={!hasNext}
                            className={cn(
                              "h-16 lg:h-20 rounded-2xl flex items-center justify-center gap-3 font-bold text-xs lg:text-sm uppercase tracking-widest border transition-all cursor-pointer",
                              hasNext 
                                ? "bg-white text-editorial-text border-editorial-text/20 shadow-lg hover:bg-gray-50 active:scale-[0.98] hover:border-editorial-text" 
                                : "opacity-20 cursor-not-allowed bg-black/5"
                            )}
                          >
                            Siguiente
                            <ArrowLeftRight size={20} className="opacity-60" />
                          </button>
                        </div>
                      </div>
                    </div>

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

                {/* Persistent Control Bar for Giant Screens & Kiosks - NOW MOBILE ONLY */}
                <div className="p-4 md:p-6 pb-20 md:pb-24 border-t border-editorial-text/10 bg-editorial-bg/95 backdrop-blur-md space-y-3 z-20 md:hidden">
                  {/* Exit / Return to map comes first and is highly visible and accessible */}
                  <button 
                    onClick={() => setIsFullSize(false)}
                    className="w-full h-12 bg-brand-primary text-white rounded-xl flex items-center justify-center gap-3 shadow-lg hover:bg-editorial-text transition-all active:scale-95 group cursor-pointer"
                  >
                    <LocateFixed size={14} />
                    <span className="text-[9px] uppercase font-bold tracking-[0.3em]">Volver al Mapa</span>
                  </button>

                  {/* Navigation row directly under it */}
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={onPrev}
                      disabled={!hasPrev}
                      className={cn(
                        "h-12 rounded-xl flex items-center justify-center gap-2 font-bold text-[9px] uppercase tracking-widest border transition-all cursor-pointer",
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
                        "h-12 rounded-xl flex items-center justify-center gap-2 font-bold text-[9px] uppercase tracking-widest border transition-all cursor-pointer",
                        hasNext 
                          ? "bg-white text-editorial-text border-editorial-text/10 shadow-lg hover:bg-gray-50 active:scale-95" 
                          : "opacity-20 cursor-not-allowed bg-black/5"
                      )}
                    >
                      Siguiente
                      <ArrowLeftRight size={14} className="opacity-40" />
                    </button>
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
