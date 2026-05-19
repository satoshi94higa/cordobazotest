import { useState } from 'react';
import { LeafletMap } from './components/LeafletMap';
import { PhotoSlider } from './components/PhotoSlider';
import { NILO_POINTS, NiloPoint } from './data';
import { motion, AnimatePresence } from 'motion/react';
import { X, Info, Layers, MapPin, History, HelpCircle } from 'lucide-react';

export default function App() {
  const [selectedPoint, setSelectedPoint] = useState<NiloPoint | null>(null);
  const [focusedPointId, setFocusedPointId] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

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

      {/* Main Map Container */}
      <main className="w-full h-full relative">
        <LeafletMap 
          points={NILO_POINTS} 
          onSelectPoint={(point) => {
            setSelectedPoint(point);
            setFocusedPointId(null);
          }}
          selectedPoint={selectedPoint}
          onNext={handleNext}
          onPrev={handlePrev}
          hasNext={hasNext}
          hasPrev={hasPrev}
          selectedPointId={focusedPointId || selectedPoint?.id}
        />
      </main>

      {/* Details balloon removed from here (now in LeafletMap) */}



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
      <footer className="absolute bottom-6 left-6 z-[1000] pointer-events-none">
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
