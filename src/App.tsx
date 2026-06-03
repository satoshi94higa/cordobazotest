import { useState, useEffect } from 'react';
import { LeafletMap } from './components/LeafletMap';
import { PhotoSlider } from './components/PhotoSlider';
import { NILO_POINTS, NiloPoint } from './data';
import { motion, AnimatePresence } from 'motion/react';
import { X, Info, Layers, MapPin, HelpCircle } from 'lucide-react';

export default function App() {
  const [selectedPoint, setSelectedPoint] = useState<NiloPoint | null>(null);
  const [focusedPointId, setFocusedPointId] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileIndex, setShowMobileIndex] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const pointsSorted = [...NILO_POINTS].sort((a, b) => a.order - b.order);
  const currentIndex = selectedPoint ? pointsSorted.findIndex(p => p.id === selectedPoint.id) : -1;
  const hasNext = currentIndex < pointsSorted.length - 1;
  const hasPrev = currentIndex > 0;

  const handleNext = () => {
    if (hasNext) setSelectedPoint(pointsSorted[currentIndex + 1]);
  };

  const handlePrev = () => {
    if (hasPrev) setSelectedPoint(pointsSorted[currentIndex - 1]);
  };

  return (
    <div className="relative w-screen h-screen bg-editorial-bg text-editorial-text overflow-hidden font-sans">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05]" 
           style={{ backgroundImage: 'radial-gradient(#1A1A1A 1px, transparent 1px)', backgroundSize: '32px 32px' }} 
      />

      {/* Header & Top Controls */}
      {!isMobile ? (
        <header className="absolute top-0 left-0 right-0 z-[1000] p-4 md:p-8 flex justify-between items-start pointer-events-none">
          {/* Left Side: Title & Index */}
          <div className="flex flex-col gap-3 items-start">
            <div className="pointer-events-auto bg-editorial-bg/80 backdrop-blur-md p-3 md:p-4 border border-editorial-text/10 shadow-sm">
              <div className="text-[7px] md:text-[9px] uppercase tracking-[0.3em] font-bold text-brand-primary mb-1 md:mb-1.5 text-nowrap">Mapa interactivo</div>
              <h1 className="text-base md:text-xl font-black uppercase tracking-tight leading-tight mb-1 md:mb-1.5 font-display max-w-[240px] md:max-w-xs">
                Lo que vuelve a mirarnos. <span className="text-brand-primary">El Cordobazo en la lente de Nilo Silvestrone</span>
              </h1>
              <div className="h-0.5 w-12 md:w-16 bg-brand-primary" />
            </div>

            {/* Indicaciones / Información de navegación */}
            <div className="pointer-events-auto bg-editorial-bg/80 backdrop-blur-md p-3 md:p-4 border border-editorial-text/10 shadow-sm max-w-[240px] md:max-w-xs flex flex-col gap-2.5">
              <p className="text-[9px] md:text-[11px] text-editorial-text/80 leading-relaxed">
                Tocá los puntos georreferenciados para ver las fotos de Nilo Silvestrone e imágenes actuales del lugar. También podés navegar por el índice del archivo.
              </p>
              <p className="text-[9px] md:text-[11px] font-bold text-brand-primary leading-relaxed">
                Ingresá a la Exploración Inmersiva para ver las fotos a pantalla completa.
              </p>
            </div>

            {/* Permanent Index List */}
            <div className="pointer-events-auto w-64 max-h-[50vh] flex flex-col gap-2 bg-editorial-bg/40 backdrop-blur-sm p-2 border border-editorial-text/10 rounded-xl">
              <div className="text-[7px] uppercase tracking-[0.4em] font-bold text-brand-primary mb-0.5 border-b border-editorial-text/10 pb-0.5 flex items-center gap-1.5">
                 <MapPin size={8} /> Indice del archivo
              </div>
              <div className="flex flex-col gap-0.5 overflow-y-auto pr-1.5 custom-scrollbar">
                {pointsSorted.map((point) => (
                  <button
                    key={point.id}
                    onClick={() => {
                      setSelectedPoint(point);
                      setFocusedPointId(point.id);
                    }}
                    className={`group flex items-center gap-2.5 p-1.5 text-left transition-all border rounded-md ${
                      selectedPoint?.id === point.id 
                        ? "bg-editorial-text text-white border-editorial-text shadow-sm" 
                        : "bg-editorial-bg/80 backdrop-blur-md border-editorial-text/5 hover:border-editorial-text/20 hover:bg-white"
                    }`}
                  >
                    <span className={`font-mono text-[7px] font-bold ${
                      selectedPoint?.id === point.id ? "text-brand-primary" : "opacity-30"
                    }`}>
                      {point.order.toString().padStart(2, '0')}
                    </span>
                    <div className="flex-1 truncate">
                      <h4 className="text-[8px] font-bold uppercase tracking-widest leading-none truncate">
                        {point.title}
                      </h4>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side: Navigation & About */}
          <div className="flex flex-col gap-2 items-end">
            <div className="flex gap-1.5 pointer-events-auto">
              <button 
                onClick={() => setShowAbout(true)}
                className="flex items-center gap-2 px-4 h-10 bg-editorial-bg border border-editorial-text/20 hover:bg-editorial-text hover:text-white transition-all shadow-lg group rounded-lg"
                title="Sobre el proyecto"
              >
                <Info size={14} className="text-brand-primary group-hover:text-white transition-colors" />
                <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest">Sobre el proyecto</span>
              </button>
              <button 
                onClick={() => setShowInstructions(!showInstructions)}
                className="w-10 h-10 bg-editorial-bg border border-editorial-text/20 flex items-center justify-center hover:bg-editorial-text hover:text-white transition-all shadow-lg rounded-lg"
                title="Guía de uso"
              >
                <HelpCircle size={14} />
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

<<<<<<< HEAD
          <div className="flex items-center gap-2 flex-shrink-0">
=======
          {/* Indicaciones / Información de navegación */}
          <div className="pointer-events-auto bg-editorial-bg/80 backdrop-blur-md p-3 md:p-4 border border-editorial-text/10 shadow-sm max-w-[240px] md:max-w-xs flex flex-col gap-2.5">
            <p className="text-[9px] md:text-[11px] text-editorial-text/80 leading-relaxed">
              Tocá los puntos georreferenciados para ver las fotos de Nilo Silvestrone e imágenes actuales del lugar. También podés navegar por el índice del archivo.
            </p>
            <p className="text-[9px] md:text-[11px] font-bold text-brand-primary leading-relaxed">
              Ingresá a la Exploración Inmersiva para ver las fotos a pantalla completa.
            </p>
          </div>

          {/* Permanent Index List */}
          <div className="pointer-events-auto w-64 max-h-[50vh] flex flex-col gap-2 bg-editorial-bg/40 backdrop-blur-sm p-2 border border-editorial-text/10 rounded-xl">
            <div className="text-[7px] uppercase tracking-[0.4em] font-bold text-brand-primary mb-0.5 border-b border-editorial-text/10 pb-0.5 flex items-center gap-1.5">
               <MapPin size={8} /> Indice del archivo
            </div>
            <div className="flex flex-col gap-0.5 overflow-y-auto pr-1.5 custom-scrollbar">
              {pointsSorted.map((point) => (
                <button
                  key={point.id}
                  onClick={() => {
                    setSelectedPoint(point);
                    setFocusedPointId(point.id);
                  }}
                  className={`group flex items-center gap-2.5 p-1.5 text-left transition-all border rounded-md ${
                    selectedPoint?.id === point.id 
                      ? "bg-editorial-text text-white border-editorial-text shadow-sm" 
                      : "bg-editorial-bg/80 backdrop-blur-md border-editorial-text/5 hover:border-editorial-text/20 hover:bg-white"
                  }`}
                >
                  <span className={`font-mono text-[7px] font-bold ${
                    selectedPoint?.id === point.id ? "text-brand-primary" : "opacity-30"
                  }`}>
                    {point.order.toString().padStart(2, '0')}
                  </span>
                  <div className="flex-1 truncate">
                    <h4 className="text-[8px] font-bold uppercase tracking-widest leading-none truncate">
                      {point.title}
                    </h4>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Navigation & About */}
        <div className="flex flex-col gap-2 items-end">
          <div className="flex gap-1.5 pointer-events-auto">
>>>>>>> 6aa8c7ab8c99be5a1936f4062eb5f7e2ed304cab
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
          onSelectPoint={(point) => {
            setSelectedPoint(point);
            setFocusedPointId(null);
            setShowMobileIndex(false);
          }}
          selectedPoint={selectedPoint}
          onNext={handleNext}
          onPrev={handlePrev}
          hasNext={hasNext}
          hasPrev={hasPrev}
          selectedPointId={focusedPointId || selectedPoint?.id}
        />
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
            className="absolute inset-0 z-[3000] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => setShowInstructions(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-editorial-bg max-w-lg w-full rounded-2xl overflow-hidden shadow-2xl border border-editorial-text/10"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-editorial-text p-6 text-white text-center">
                <h3 className="text-lg font-bold font-display uppercase tracking-tight">Guía de Uso</h3>
                <p className="text-[8px] uppercase tracking-[0.3em] opacity-50 mt-1">Mapa interactivo</p>
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-6 h-6 rounded-full bg-brand-primary text-white flex items-center justify-center flex-shrink-0 font-bold text-xs">1</div>
                    <div>
                      <h3 className="font-bold uppercase tracking-widest text-[10px] mb-1">Navegación</h3>
                      <p className="text-xs opacity-70 leading-relaxed italic">Explora el mapa y selecciona los puntos rojos para abrir la ventana de comparación.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="w-6 h-6 rounded-full bg-brand-primary text-white flex items-center justify-center flex-shrink-0 font-bold text-xs">2</div>
                    <div>
                      <h3 className="font-bold uppercase tracking-widest text-[10px] mb-1">Inmersión</h3>
                      <p className="text-xs opacity-70 leading-relaxed italic">Usa el botón "Exploración Inmersiva" para ver las fotos en pantalla completa y navegar entre puntos.</p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setShowInstructions(false)}
                  className="w-full bg-editorial-text text-white py-4 rounded-xl font-bold uppercase tracking-[0.3em] text-[10px] hover:bg-brand-primary transition-all active:scale-95 shadow-xl"
                >
                  Comenzar Recorrido
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Project Branding Footer */}
      <footer className="absolute bottom-6 left-6 z-[1000] pointer-events-none hidden md:block">
        <div className="opacity-40 flex items-center gap-2">
          <Layers size={14} />
          <span className="text-[10px] font-mono uppercase tracking-widest">Open Street Maps Data Layer</span>
        </div>
      </footer>

      {/* About Project Modal */}
      <AnimatePresence>
        {showAbout && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[4000] bg-black/60 backdrop-blur-md flex items-center justify-center p-6"
            onClick={() => setShowAbout(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="bg-editorial-bg max-w-xl w-full rounded-xl md:rounded-2xl overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.5)] border border-editorial-text/10"
              onClick={e => e.stopPropagation()}
            >
              <div className="relative h-24 md:h-32 bg-editorial-text flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                <h2 className="relative text-white text-lg md:text-xl font-black tracking-tight font-display uppercase px-6 text-center leading-tight">
                  Lo que vuelve a mirarnos. <span className="text-brand-primary">El Cordobazo en la lente de Nilo Silvestrone</span>
                </h2>
              </div>
              
              <div className="p-5 md:p-8 space-y-3 md:space-y-5">
                <div className="flex flex-col gap-1">
                  <div className="text-sm md:text-base font-serif text-editorial-text leading-relaxed">
                    Estas fotografías no solo documentan un acontecimiento de 1969, sino que condensan una experiencia colectiva de conflicto, organización y ruptura que continúa interrogando nuestras formas actuales de vida política y social.
                  </div>
                </div>

                <div className="h-px bg-editorial-text/10" />

                <p className="text-[10px] md:text-xs opacity-70 leading-relaxed">
                  Este mapa interactivo forma parte de una muestra se exhiben fotos emblemáticas de Nilo Silvestrone, que publicaron en 1969 las revistas Siete Días y Paris Match y más de 40 fotos inéditas, cuyos negativos fueron compartidos por la familia del fotógrafo.
                </p>

                <div className="pt-2 md:pt-4 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[8px] md:text-[9px] uppercase tracking-widest font-bold opacity-30">Versión del Archivo</span>
                    <span className="font-mono text-[9px] md:text-[10px] font-bold">ARC-2024.v1</span>
                  </div>
                  <button 
                    onClick={() => setShowAbout(false)}
                    className="bg-editorial-text text-white px-6 md:px-8 py-2 md:py-3 rounded-full font-bold text-[10px] md:text-xs uppercase tracking-widest hover:bg-brand-primary transition-all active:scale-95"
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
