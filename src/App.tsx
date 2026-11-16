import { useState, useEffect, useCallback } from 'react';
import { LeafletMap } from './components/LeafletMap';
import { PhotoSlider } from './components/PhotoSlider';
import { NILO_POINTS, NiloPoint } from './data';
import { motion, AnimatePresence } from 'motion/react';
import { X, Info, MapPin, HelpCircle, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';

const pointsSorted = [...NILO_POINTS].sort((a, b) => a.order - b.order);
const preloadedImages = new Set<string>();

function preloadPointPhotos(point: NiloPoint | undefined) {
  if (!point) return;
  for (const url of [point.historicalPhoto, point.currentPhoto]) {
    if (url && !preloadedImages.has(url)) {
      preloadedImages.add(url);
      const img = new Image();
      img.decoding = 'async';
      img.src = url;
    }
  }
}

export default function App() {
  const [selectedPoint, setSelectedPoint] = useState<NiloPoint | null>(null);
  const [focusedPointId, setFocusedPointId] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 767px)').matches : false
  );
  const [showMobileIndex, setShowMobileIndex] = useState(false);
  const [isIndexCollapsed, setIsIndexCollapsed] = useState(false);
  const [resetViewSignal, setResetViewSignal] = useState(0);

  const handleResetOverview = useCallback(() => {
    setSelectedPoint(null);
    setFocusedPointId(null);
    setShowInstructions(false);
    setShowAbout(false);
    setShowMobileIndex(false);
    setResetViewSignal(s => s + 1);
  }, []);

  // Kiosk inactivity auto-reset (3 minutes without user interaction)
  useEffect(() => {
    const INACTIVITY_MS = 180_000;
    let timer: ReturnType<typeof setTimeout>;
    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        handleResetOverview();
      }, INACTIVITY_MS);
    };
    resetTimer();
    const events = ['pointerdown', 'keydown', 'wheel', 'touchstart'] as const;
    events.forEach(ev => window.addEventListener(ev, resetTimer, { passive: true }));
    return () => {
      clearTimeout(timer);
      events.forEach(ev => window.removeEventListener(ev, resetTimer));
    };
  }, [handleResetOverview]);

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 767px)');
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    setIsMobile(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  const currentIndex = selectedPoint ? pointsSorted.findIndex(p => p.id === selectedPoint.id) : -1;
  const hasNext = currentIndex >= 0 && currentIndex < pointsSorted.length - 1;
  const hasPrev = currentIndex > 0;

  // Preload adjacent points' photos in memory for instant navigation
  useEffect(() => {
    if (currentIndex < 0) return;
    if (currentIndex + 1 < pointsSorted.length) {
      preloadPointPhotos(pointsSorted[currentIndex + 1]);
    }
    if (currentIndex - 1 >= 0) {
      preloadPointPhotos(pointsSorted[currentIndex - 1]);
    }
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    setSelectedPoint(prev => {
      if (!prev) return prev;
      const idx = pointsSorted.findIndex(p => p.id === prev.id);
      return idx >= 0 && idx < pointsSorted.length - 1 ? pointsSorted[idx + 1] : prev;
    });
  }, []);

  const handlePrev = useCallback(() => {
    setSelectedPoint(prev => {
      if (!prev) return prev;
      const idx = pointsSorted.findIndex(p => p.id === prev.id);
      return idx > 0 ? pointsSorted[idx - 1] : prev;
    });
  }, []);

  const handleSelectMapPoint = useCallback((point: NiloPoint | null) => {
    setSelectedPoint(point);
    setFocusedPointId(null);
    setShowMobileIndex(false);
  }, []);

  return (
    <div className="relative w-screen h-screen bg-editorial-bg text-editorial-text overflow-hidden font-sans">
      {/* Header & Top Controls */}
      {!isMobile ? (
        <header className="absolute top-0 left-0 right-0 z-[1000] p-4 md:p-6 flex justify-between items-start pointer-events-none">
          {/* Left Side: Solid Archival Paper Panel & Index */}
          <div className="flex flex-col gap-2.5 items-start w-72 md:w-80">
            <div className="pointer-events-auto w-full bg-editorial-bg p-4 md:p-5 border border-editorial-text rounded-[2px] shadow-[4px_4px_0px_rgba(20,20,19,0.14)]">
              <h1 className="text-base md:text-lg font-black uppercase tracking-tight leading-snug mb-2.5 font-display">
                Lo que vuelve a mirarnos. <span className="text-brand-primary">El Cordobazo en la lente de Nilo Silvestrone</span>
              </h1>
              <div className="h-px w-full bg-editorial-text/20 mb-3" />
              <p className="text-xs text-editorial-text/85 leading-relaxed font-serif mb-2">
                Tocá los puntos en el mapa para comparar las fotografías de 1969 con vistas actuales del mismo lugar.
              </p>
              <p className="text-[11px] font-bold text-brand-primary leading-snug">
                Abrí la Exploración Inmersiva para ver las láminas a pantalla completa.
              </p>
            </div>

            {/* Collapsible Archive Index List */}
            <div className="pointer-events-auto w-full flex flex-col bg-editorial-bg border border-editorial-text rounded-[2px] shadow-[4px_4px_0px_rgba(20,20,19,0.14)] overflow-hidden">
              <button
                onClick={() => setIsIndexCollapsed(!isIndexCollapsed)}
                className="w-full px-4 py-2.5 flex items-center justify-between text-left border-b border-editorial-text/20 hover:bg-editorial-text/5 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] font-mono font-bold text-editorial-text">
                  <MapPin size={12} className="text-brand-primary" />
                  <span>Índice · {pointsSorted.length} láminas</span>
                </div>
                {isIndexCollapsed ? (
                  <ChevronDown size={14} className="text-editorial-text/60" />
                ) : (
                  <ChevronUp size={14} className="text-editorial-text/60" />
                )}
              </button>

              {!isIndexCollapsed && (
                <div className="flex flex-col divide-y divide-editorial-text/10 max-h-[42vh] overflow-y-auto custom-scrollbar">
                  {pointsSorted.map((point) => {
                    const isActive = selectedPoint?.id === point.id;
                    return (
                      <button
                        key={point.id}
                        onClick={() => {
                          setSelectedPoint(point);
                          setFocusedPointId(point.id);
                        }}
                        className={`group flex items-center gap-3 px-3.5 py-2 text-left transition-colors ${
                          isActive
                            ? "bg-editorial-text text-editorial-bg"
                            : "bg-editorial-bg hover:bg-editorial-text/5 text-editorial-text"
                        }`}
                      >
                        <span
                          className={`font-mono text-[10px] font-bold flex-shrink-0 ${
                            isActive
                              ? "text-brand-primary"
                              : "text-editorial-text/50 group-hover:text-brand-primary"
                          }`}
                        >
                          {point.order.toString().padStart(2, '0')}
                        </span>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[11px] font-bold uppercase tracking-wide leading-tight truncate">
                            {point.title}
                          </h4>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Navigation & About */}
          <div className="flex flex-col gap-2 items-end">
            <div className="flex gap-2 pointer-events-auto">
              <button
                onClick={handleResetOverview}
                className="flex items-center gap-2 px-3.5 h-10 bg-editorial-bg border border-editorial-text hover:bg-editorial-text hover:text-editorial-bg transition-colors shadow-[3px_3px_0px_rgba(20,20,19,0.12)] group rounded-[2px] cursor-pointer"
                title="Centrar vista general del mapa"
              >
                <RotateCcw size={13} className="text-brand-primary group-hover:text-editorial-bg transition-colors" />
                <span className="text-[10px] font-bold uppercase tracking-[0.1em]">Vista general</span>
              </button>
              <button 
                onClick={() => setShowAbout(true)}
                className="flex items-center gap-2 px-4 h-10 bg-editorial-bg border border-editorial-text hover:bg-editorial-text hover:text-editorial-bg transition-colors shadow-[3px_3px_0px_rgba(20,20,19,0.12)] group rounded-[2px] cursor-pointer"
                title="Sobre el proyecto"
              >
                <Info size={14} className="text-brand-primary group-hover:text-editorial-bg transition-colors" />
                <span className="text-[10px] font-bold uppercase tracking-[0.1em]">Sobre el proyecto</span>
              </button>
              <button 
                onClick={() => setShowInstructions(!showInstructions)}
                className="w-10 h-10 bg-editorial-bg border border-editorial-text flex items-center justify-center hover:bg-editorial-text hover:text-editorial-bg transition-colors shadow-[3px_3px_0px_rgba(20,20,19,0.12)] rounded-[2px] cursor-pointer"
                title="Guía de uso"
              >
                <HelpCircle size={15} />
              </button>
            </div>
          </div>
        </header>
      ) : (
        /* Mobile Slim Top Bar */
        <header className="fixed top-0 left-0 right-0 z-[1001] bg-editorial-bg/95 backdrop-blur-md border-b border-editorial-text/10 h-14 px-4 flex items-center justify-between shadow-sm">
          <div className="flex flex-col items-start pr-2">
            <h1 className="text-xs font-black uppercase tracking-tight font-display leading-tight text-editorial-text truncate max-w-[160px]">
              Lo que vuelve a mirarnos
            </h1>
            <span className="text-[7.5px] font-bold uppercase tracking-[0.2em] text-brand-primary mt-0.5 whitespace-nowrap">
              Nilo Silvestrone en Córdoba
            </span>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button 
              onClick={() => {
                setShowMobileIndex(!showMobileIndex);
                if (selectedPoint) setSelectedPoint(null);
              }}
              className={`h-9 items-center gap-1.5 px-3 rounded-lg flex border transition-all text-editorial-text text-nowrap select-none active:scale-95 ${
                showMobileIndex 
                  ? "bg-editorial-text text-white border-editorial-text" 
                  : "bg-editorial-bg border-editorial-text/15"
              }`}
            >
              <MapPin size={11} className="text-brand-primary" />
              <span className="text-[9px] font-bold uppercase tracking-wider">Índice</span>
            </button>

            <button 
              onClick={() => {
                setShowAbout(true);
                if (selectedPoint) setSelectedPoint(null);
                setShowMobileIndex(false);
              }}
              className="w-9 h-9 bg-editorial-bg border border-editorial-text/15 flex items-center justify-center rounded-lg text-editorial-text active:scale-95 flex-shrink-0"
              title="Sobre el proyecto"
            >
              <Info size={13} className="text-brand-primary" />
            </button>
          </div>
        </header>
      )}

      {/* Main Map Container */}
      <main className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        <LeafletMap 
          points={NILO_POINTS} 
          onSelectPoint={handleSelectMapPoint}
          selectedPoint={selectedPoint}
          isMobile={isMobile}
          resetViewSignal={resetViewSignal}
          onNext={handleNext}
          onPrev={handlePrev}
          hasNext={hasNext}
          hasPrev={hasPrev}
          selectedPointId={focusedPointId || selectedPoint?.id}
        />
        <div className="map-vignette absolute inset-0 pointer-events-none z-[400]" />
      </main>

      {/* Mobile Index Drawer */}
      <AnimatePresence>
        {isMobile && showMobileIndex && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileIndex(false)}
              className="fixed inset-0 bg-black/30 z-[1002]"
            />
            {/* Drawer */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-[1003] bg-editorial-bg border-t border-editorial-text/15 rounded-t-2xl shadow-[0_-12px_48px_rgba(0,0,0,0.2)] max-h-[75vh] flex flex-col overflow-hidden"
            >
              {/* Drawer Handle / Title */}
              <div className="flex items-center justify-between p-4 border-b border-editorial-text/5 bg-editorial-bg/50 backdrop-blur-md flex-shrink-0">
                <div className="flex items-center gap-2">
                  <MapPin size={12} className="text-brand-primary" />
                  <h3 className="text-xs font-black uppercase tracking-wider font-display text-editorial-text">Índice del Archivo</h3>
                </div>
                <button 
                  onClick={() => setShowMobileIndex(false)}
                  className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Slider list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                {pointsSorted.map((point) => (
                  <button
                    key={point.id}
                    onClick={() => {
                      setSelectedPoint(point);
                      setFocusedPointId(point.id);
                      setShowMobileIndex(false);
                    }}
                    className={`group w-full flex items-center gap-3.5 p-3.5 text-left transition-all border rounded-xl ${
                      selectedPoint?.id === point.id 
                        ? "bg-editorial-text text-white border-editorial-text shadow-md" 
                        : "bg-white border-editorial-text/10 hover:border-editorial-text/20"
                    }`}
                  >
                    <span className={`font-mono text-xs font-bold ${
                      selectedPoint?.id === point.id ? "text-brand-primary" : "text-editorial-text/40"
                    }`}>
                      {point.order.toString().padStart(2, '0')}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold uppercase tracking-wider leading-snug text-wrap">
                        {point.title}
                      </h4>
                      <p className={`text-[10px] mt-0.5 font-serif italic truncate ${
                        selectedPoint?.id === point.id ? "text-white/70" : "text-editorial-text/60"
                      }`}>
                        {point.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Selected Point Drawer */}
      <AnimatePresence>
        {isMobile && selectedPoint && !showMobileIndex && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed bottom-0 left-0 right-0 z-[1001] bg-editorial-bg border-t border-editorial-text/15 rounded-t-2xl shadow-[0_-12px_48px_rgba(0,0,0,0.25)] flex flex-col max-h-[85vh] overflow-hidden"
          >
            {/* Grab pull line */}
            <div className="w-12 h-1 bg-editorial-text/15 rounded-full mx-auto mt-3 mb-2 flex-shrink-0" />

            {/* Header row in Drawer */}
            <div className="flex items-center justify-between px-4 pb-2 border-b border-editorial-text/5 bg-editorial-bg/30 flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-bold text-brand-primary">
                  Punto {selectedPoint.order.toString().padStart(2, '0')}
                </span>
                <span className="w-1 h-1 bg-editorial-text/20 rounded-full" />
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-editorial-text max-w-[200px] truncate">
                  {selectedPoint.title}
                </h3>
              </div>
              <button 
                onClick={() => {
                  setSelectedPoint(null);
                  setFocusedPointId(null);
                }}
                className="w-7 h-7 bg-black/5 hover:bg-black/10 rounded-full flex items-center justify-center transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            {/* Content area: PhotoSlider in standard view */}
            <div className="flex-1 overflow-y-auto p-4 pb-12 space-y-4 custom-scrollbar">
              <PhotoSlider 
                historical={selectedPoint.historicalPhoto}
                current={selectedPoint.currentPhoto}
                title={selectedPoint.title}
                description={selectedPoint.description}
                pointOrder={selectedPoint.order}
                totalPoints={pointsSorted.length}
                allPoints={pointsSorted}
                onSelectPoint={handleSelectMapPoint}
                lat={selectedPoint.lat}
                lng={selectedPoint.lng}
                onNext={handleNext}
                onPrev={handlePrev}
                hasNext={hasNext}
                hasPrev={hasPrev}
                isPopup={false}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions Modal Overlay */}
      <AnimatePresence>
        {showInstructions && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[3000] bg-black/50 flex items-center justify-center p-6"
            onClick={() => setShowInstructions(false)}
          >
            <motion.div 
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="bg-editorial-bg max-w-lg w-full rounded-[2px] overflow-hidden shadow-[6px_6px_0px_rgba(20,20,19,0.25)] border border-editorial-text"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-editorial-text px-6 py-5 text-editorial-bg border-b border-editorial-text">
                <h3 className="text-base font-bold font-display uppercase tracking-tight">Guía de Uso</h3>
              </div>

              <div className="p-7 space-y-6">
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-6 h-6 rounded-[2px] bg-brand-primary text-editorial-bg flex items-center justify-center flex-shrink-0 font-mono font-bold text-xs">1</div>
                    <div>
                      <h3 className="font-bold uppercase tracking-[0.1em] text-[11px] mb-1">Navegación</h3>
                      <p className="text-sm text-editorial-text/80 leading-relaxed font-serif">Explorá el mapa o el índice lateral para abrir cada lámina comparativa.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="w-6 h-6 rounded-[2px] bg-brand-primary text-editorial-bg flex items-center justify-center flex-shrink-0 font-mono font-bold text-xs">2</div>
                    <div>
                      <h3 className="font-bold uppercase tracking-[0.1em] text-[11px] mb-1">Exploración Inmersiva</h3>
                      <p className="text-sm text-editorial-text/80 leading-relaxed font-serif">Ampliá las fotografías a pantalla completa y navegá entre los 13 puntos con las flechas o el teclado.</p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setShowInstructions(false)}
                  className="w-full bg-editorial-text text-editorial-bg py-3.5 rounded-[2px] font-bold uppercase tracking-[0.14em] text-[11px] hover:bg-brand-primary transition-colors cursor-pointer"
                >
                  Comenzar Recorrido
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* About Project Modal */}
      <AnimatePresence>
        {showAbout && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[4000] bg-black/55 flex items-center justify-center p-6"
            onClick={() => setShowAbout(false)}
          >
            <motion.div 
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="bg-editorial-bg max-w-xl w-full rounded-[2px] overflow-hidden shadow-[6px_6px_0px_rgba(20,20,19,0.28)] border border-editorial-text"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-editorial-text px-6 py-6 border-b border-editorial-text">
                <h2 className="text-editorial-bg text-lg md:text-xl font-black tracking-tight font-display uppercase leading-tight">
                  Lo que vuelve a mirarnos. <span className="text-brand-primary">El Cordobazo en la lente de Nilo Silvestrone</span>
                </h2>
              </div>
              
              <div className="p-6 md:p-8 space-y-4">
                <p className="text-base md:text-lg font-serif text-editorial-text leading-relaxed">
                  Estas fotografías no solo documentan un acontecimiento de 1969, sino que condensan una experiencia colectiva de conflicto, organización y ruptura que continúa interrogando nuestras formas actuales de vida política y social.
                </p>

                <div className="h-px bg-editorial-text/15" />

                <p className="text-xs md:text-sm text-editorial-text/75 leading-relaxed font-serif">
                  Este mapa interactivo forma parte de una muestra donde se exhiben fotos emblemáticas de Nilo Silvestrone publicadas en 1969 por las revistas Siete Días y Paris Match, junto a negativos inéditos compartidos por la familia del fotógrafo.
                </p>

                <div className="pt-2 flex justify-between items-center border-t border-editorial-text/15">
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-editorial-text/50">
                    Córdoba, Argentina · Mayo de 1969
                  </span>
                  <button 
                    onClick={() => setShowAbout(false)}
                    className="bg-editorial-text text-editorial-bg px-6 py-2.5 rounded-[2px] font-bold text-[11px] uppercase tracking-[0.14em] hover:bg-brand-primary transition-colors cursor-pointer"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
