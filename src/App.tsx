import { useState } from 'react';
import { LeafletMap } from './components/LeafletMap';
import { PhotoSlider } from './components/PhotoSlider';
import { CORDOBAZO_POINTS, CordobazoPoint } from './data';
import { motion, AnimatePresence } from 'motion/react';
import { X, Info, Layers, MapPin, History } from 'lucide-react';

export default function App() {
  const [selectedPoint, setSelectedPoint] = useState<CordobazoPoint | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  const pointsSorted = [...CORDOBAZO_POINTS].sort((a, b) => a.order - b.order);
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

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-[1000] p-8 flex justify-between items-start pointer-events-none">
        <div className="pointer-events-auto bg-editorial-bg/80 backdrop-blur-md p-4 border border-editorial-text/10 shadow-sm">
          <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-primary mb-2">Fotos de ayer y hoy</div>
          <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-[0.8] mb-2 font-serif">
            Cordobazo<span className="text-brand-primary italic">.1969</span>
          </h1>
          <div className="h-1 w-24 bg-brand-primary" />
        </div>
        
        <button 
          onClick={() => setShowInstructions(!showInstructions)}
          className="pointer-events-auto w-12 h-12 bg-editorial-bg border border-editorial-text/20 flex items-center justify-center hover:bg-editorial-text hover:text-white transition-all shadow-xl"
        >
          <Info size={20} />
        </button>
      </header>

      {/* Main Map Container */}
      <main className="w-full h-full relative">
        <LeafletMap 
          points={CORDOBAZO_POINTS} 
          onSelectPoint={setSelectedPoint}
          selectedPointId={selectedPoint?.id}
        />
      </main>

      {/* Details Panel */}
      <AnimatePresence>
        {selectedPoint && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 150 }}
            className="absolute top-0 left-0 h-full w-full md:w-[600px] bg-editorial-bg shadow-2xl z-[2000] border-r border-editorial-text/10 flex flex-col p-8 sm:p-12"
          >
            <div className="flex justify-between items-start mb-8">
              <div className="flex flex-col gap-1">
                <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-brand-primary">Documento Histórico</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse" />
                  <span className="text-[10px] uppercase tracking-widest opacity-40">Localización Activa</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedPoint(null)}
                className="w-10 h-10 border border-editorial-text/10 flex items-center justify-center hover:bg-editorial-text hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <PhotoSlider 
                historical={selectedPoint.historicalPhoto}
                current={selectedPoint.currentPhoto}
                title={selectedPoint.title}
                description={selectedPoint.description}
                onNext={handleNext}
                onPrev={handlePrev}
                hasNext={hasNext}
                hasPrev={hasPrev}
                className="mb-10 shadow-2xl border border-editorial-text/5"
              />

              <div className="space-y-8">
                <div>
                  <h2 className="text-4xl font-bold tracking-tight mb-4 italic font-serif leading-tight">
                    {selectedPoint.title}
                  </h2>
                  <div className="h-1.5 w-16 bg-brand-primary" />
                </div>

                <div className="space-y-4">
                  <p className="text-lg leading-relaxed text-editorial-text font-serif italic opacity-90">
                    {selectedPoint.description}
                  </p>
                </div>

                <div className="pt-10 border-t border-editorial-text/10">
                  <div className="grid grid-cols-2 gap-px bg-editorial-text/10 border border-editorial-text/10">
                    <div className="p-6 bg-editorial-bg">
                      <span className="block text-[9px] uppercase tracking-[0.2em] font-bold opacity-40 mb-2">Latitud</span>
                      <span className="font-mono text-xs font-bold">{selectedPoint.lat.toFixed(6)}</span>
                    </div>
                    <div className="p-6 bg-editorial-bg">
                      <span className="block text-[9px] uppercase tracking-[0.2em] font-bold opacity-40 mb-2">Longitud</span>
                      <span className="font-mono text-xs font-bold">{selectedPoint.lng.toFixed(6)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Index Sidebar (Right) */}
      <aside className="absolute top-32 right-8 bottom-24 w-52 z-[1000] hidden lg:flex flex-col gap-4 pointer-events-none">
        <div className="flex flex-col gap-1 pointer-events-auto">
          <div className="text-[9px] uppercase tracking-[0.4em] font-bold text-brand-primary mb-2 border-b border-editorial-text/10 pb-2 flex items-center gap-2">
             <MapPin size={10} /> Indice
          </div>
          <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[70vh] pr-2 custom-scrollbar">
            {CORDOBAZO_POINTS.sort((a, b) => a.order - b.order).map((point) => (
              <button
                key={point.id}
                onClick={() => setSelectedPoint(point)}
                className={`group flex items-start gap-3 p-3 text-left transition-all border ${
                  selectedPoint?.id === point.id 
                    ? "bg-editorial-text text-white border-editorial-text" 
                    : "bg-editorial-bg/80 backdrop-blur-md border-editorial-text/10 hover:border-editorial-text/30"
                }`}
              >
                <span className={`font-mono text-[10px] font-bold ${
                  selectedPoint?.id === point.id ? "text-brand-primary" : "opacity-30"
                }`}>
                  {point.order < 10 ? `0${point.order}` : point.order}
                </span>
                <div className="flex-1">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest leading-tight">
                    {point.title}
                  </h4>
                  <div className={`h-0.5 bg-brand-primary w-0 group-hover:w-full transition-all duration-300 ${
                    selectedPoint?.id === point.id ? "w-full" : ""
                  }`} />
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-auto pointer-events-auto bg-editorial-bg/60 backdrop-blur-sm p-3 border border-editorial-text/10">
          <div className="flex items-center gap-2 mb-1">
            <Info size={12} className="text-brand-primary" />
            <span className="text-[9px] font-bold uppercase tracking-widest">Navegación</span>
          </div>
          <p className="text-[8px] opacity-40 leading-relaxed font-serif italic">
            Seleccione un punto para visualizar archivos de memoria.
          </p>
        </div>
      </aside>

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
              <div className="bg-editorial-text p-8 text-white">
                <h3 className="text-2xl font-bold italic font-serif">Guía de Uso</h3>
                <p className="text-[10px] uppercase tracking-[0.3em] opacity-50 mt-1">Archivo de la Memoria</p>
              </div>

              <div className="p-10 space-y-8">
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center flex-shrink-0 font-bold text-sm">1</div>
                    <div>
                      <h3 className="font-bold uppercase tracking-widest text-xs mb-1">Navegación</h3>
                      <p className="text-sm opacity-70 leading-relaxed italic">Explora el mapa y selecciona los puntos rojos para abrir la ventana de comparación.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center flex-shrink-0 font-bold text-sm">2</div>
                    <div>
                      <h3 className="font-bold uppercase tracking-widest text-xs mb-1">Inmersión</h3>
                      <p className="text-sm opacity-70 leading-relaxed italic">Usa el botón "Exploración Inmersiva" para ver las fotos en pantalla completa y navegar entre puntos.</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center flex-shrink-0 font-bold text-sm">3</div>
                    <div>
                      <h3 className="font-bold uppercase tracking-widest text-xs mb-1">Edición</h3>
                      <p className="text-sm opacity-70 leading-relaxed italic">Puedes modificar el texto "Sobre el proyecto" directamente en el archivo <span className="font-mono text-brand-primary">App.tsx</span> (línea 261 aprox).</p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setShowInstructions(false)}
                  className="w-full bg-editorial-text text-white py-5 rounded-xl font-bold uppercase tracking-[0.3em] text-xs hover:bg-brand-primary transition-all active:scale-95 shadow-xl"
                >
                  Comenzar Recorrido
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Branding & About Button */}
      <footer className="absolute bottom-6 left-6 z-[1000] flex flex-col gap-4">
        <button 
          onClick={() => setShowAbout(true)}
          className="pointer-events-auto flex items-center gap-3 bg-editorial-bg border border-editorial-text/10 px-5 py-3 hover:bg-brand-primary hover:text-white transition-all shadow-lg group"
        >
          <Info size={16} className="text-brand-primary group-hover:text-white transition-colors" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Sobre el proyecto</span>
        </button>

        <div className="pointer-events-none opacity-40 flex items-center gap-2">
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
              className="bg-editorial-bg max-w-xl w-full rounded-2xl overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.5)] border border-editorial-text/10"
              onClick={e => e.stopPropagation()}
            >
              <div className="relative h-48 bg-editorial-text flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                <h2 className="relative text-white text-5xl font-black italic tracking-tighter font-serif uppercase">
                  Cordobazo<span className="text-brand-primary">.1969</span>
                </h2>
              </div>
              
              <div className="p-10 space-y-6">
                <div className="flex flex-col gap-1">
                  <div className="text-[10px] uppercase tracking-[0.4em] font-bold text-brand-primary">Memoria Visual</div>
                  <div className="text-lg font-serif italic text-editorial-text leading-relaxed">
                    Este proyecto es un archivo inmersivo que busca reconstruir, a través de la fotografía comparativa, los escenarios del Cordobazo de 1969 en la ciudad actual.
                  </div>
                </div>

                <div className="h-px bg-editorial-text/10" />

                <p className="text-sm opacity-70 leading-relaxed">
                  Una invitación a recorrer la historia caminando las calles de hoy, vinculando el presente con la gesta obrero-estudiantil que marcó a fuego la identidad de Córdoba. Cada punto en el mapa es un portal a una memoria que sigue viva bajo el asfalto.
                </p>

                <div className="pt-4 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase tracking-widest font-bold opacity-30">Versión del Archivo</span>
                    <span className="font-mono text-[10px] font-bold">ARC-2024.v1</span>
                  </div>
                  <button 
                    onClick={() => setShowAbout(false)}
                    className="bg-editorial-text text-white px-8 py-3 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-brand-primary transition-all active:scale-95"
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
