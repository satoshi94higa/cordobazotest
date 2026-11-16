import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, ZoomControl, useMapEvents, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { NiloPoint } from '@/src/data';
import { useEffect, useMemo, memo } from 'react';
import { PhotoSlider } from './PhotoSlider';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const iconCache = new Map<string, L.DivIcon>();

const getCustomIcon = (order: number, isSelected: boolean): L.DivIcon => {
  const key = `${order}-${isSelected ? '1' : '0'}`;
  let icon = iconCache.get(key);
  if (!icon) {
    icon = L.divIcon({
      className: 'custom-marker',
      html: `<div class="flex items-center justify-center relative">
               <div class="w-7 h-7 ${isSelected ? 'bg-editorial-text ring-2 ring-brand-primary ring-offset-2 ring-offset-[#F3EFE6] z-[1001]' : 'bg-brand-primary hover:scale-105'} rounded-full border-[1.5px] border-[#F3EFE6] shadow-md flex items-center justify-center transition-transform duration-200">
                 <span class="text-[10px] font-bold text-[#F3EFE6] font-mono">${order}</span>
               </div>
             </div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
    iconCache.set(key, icon);
  }
  return icon;
};

interface MapProps {
  points: NiloPoint[];
  onSelectPoint: (point: NiloPoint | null) => void;
  selectedPoint?: NiloPoint | null;
  selectedPointId?: string | null;
  isMobile?: boolean;
  resetViewSignal?: number;
  onNext?: () => void;
  onPrev?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
}

function ChangeView({ lat, lng, zoom }: { lat: number; lng: number; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], zoom, {
      animate: true,
      duration: 1.4,
      easeLinearity: 0.25,
    });
  }, [lat, lng, zoom, map]);
  return null;
}

function ResetMapView({ signal }: { signal: number }) {
  const map = useMap();
  useEffect(() => {
    if (signal > 0) {
      map.flyTo(cordobaCenter, 14, {
        animate: true,
        duration: 1.4,
        easeLinearity: 0.25,
      });
    }
  }, [signal, map]);
  return null;
}

function MapEvents({ onMapClick }: { onMapClick: () => void }) {
  const map = useMap();
  useMapEvents({
    click: () => {
      onMapClick();
    },
  });
  
  // Trigger a container resize recalculation on mount to guarantee Leaflet detects the correct parent size
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 500);
    return () => clearTimeout(timer);
  }, [map]);

  return null;
}

const cordobaCenter: [number, number] = [-31.4148, -64.1895];

// Límites aproximados de la Ciudad de Córdoba para restringir el movimiento
const cordobaBounds: L.LatLngBoundsExpression = [
  [-31.55, -64.35], // Suroeste - Ampliado un poco
  [-31.30, -64.05], // Noreste
];

export const LeafletMap = memo(function LeafletMap({ 
  points, 
  onSelectPoint, 
  selectedPoint,
  selectedPointId,
  isMobile = false,
  resetViewSignal = 0,
  onNext,
  onPrev,
  hasNext,
  hasPrev
 }: MapProps) {
  const activeTargetPoint = useMemo(
    () => (selectedPointId ? points.find(p => p.id === selectedPointId) ?? null : null),
    [points, selectedPointId]
  );

  // Historical route lines: downtown march axis (1-5, 7-13) and Santa Isabel feeder (6 -> 1)
  const { centerRoutePositions, renaultFeederPositions } = useMemo(() => {
    const sorted = [...points].sort((a, b) => a.order - b.order);
    const centerPoints = sorted.filter(p => p.order !== 6);
    const renault = sorted.find(p => p.order === 6);
    const firstCenter = sorted.find(p => p.order === 1);
    return {
      centerRoutePositions: centerPoints.map(p => [p.lat, p.lng] as [number, number]),
      renaultFeederPositions:
        renault && firstCenter
          ? [[renault.lat, renault.lng] as [number, number], [firstCenter.lat, firstCenter.lng] as [number, number]]
          : [],
    };
  }, [points]);

  return (
    <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
      <MapContainer 
        center={cordobaCenter} 
        zoom={14} 
        minZoom={12} 
        maxZoom={18}
        maxBounds={cordobaBounds}
        maxBoundsViscosity={1.0}
          style={{ 
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          height: '100%', 
          width: '100%',
          backgroundColor: '#F3EFE6'
        }}
        zoomControl={false}
        scrollWheelZoom={true}
        zoomAnimation={true}
        markerZoomAnimation={true}
        fadeAnimation={true}
        zoomSnap={0.25}
        zoomDelta={0.5}
        wheelPxPerZoomLevel={120}
        preferCanvas={true} // Forces Leaflet to render in a high-performance Canvas, significantly more reliable in older WebViews than SVGs
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          keepBuffer={4}
        />
        <ZoomControl position="bottomright" />
        
        <MapEvents onMapClick={() => onSelectPoint(null)} />

        {/* Subtle historical route connecting the archival points */}
        {centerRoutePositions.length > 1 && (
          <Polyline
            positions={centerRoutePositions}
            pathOptions={{
              color: '#9B1B1B',
              weight: 1.75,
              opacity: 0.4,
              dashArray: '5, 7',
            }}
          />
        )}
        {renaultFeederPositions.length === 2 && (
          <Polyline
            positions={renaultFeederPositions}
            pathOptions={{
              color: '#9B1B1B',
              weight: 1.25,
              opacity: 0.25,
              dashArray: '3, 8',
            }}
          />
        )}
        
        {points.map((point) => {
          const isSelected = selectedPointId === point.id;
          return (
            <Marker 
              key={point.id} 
              position={[point.lat, point.lng]} 
              icon={getCustomIcon(point.order, isSelected)}
              eventHandlers={{
                click: () => onSelectPoint(point),
              }}
              zIndexOffset={isSelected ? 1000 : 0}
            >
              <Tooltip direction="top" offset={[0, -12]} opacity={1} className="editorial-tooltip">
                <div className="flex items-center gap-2.5 p-1.5 pr-3 bg-editorial-bg text-editorial-text rounded-[2px] shadow-[3px_3px_0px_rgba(20,20,19,0.18)] border border-editorial-text max-w-[240px]">
                  <img
                    src={point.historicalPhoto}
                    alt={point.title}
                    className="w-10 h-10 object-cover rounded-[1px] grayscale sepia-[0.15] border border-editorial-text/20 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-[9px] font-mono uppercase tracking-[0.12em] text-brand-primary font-bold">
                      Lámina {point.order.toString().padStart(2, '0')}
                    </div>
                    <div className="text-[11px] font-bold uppercase tracking-wide leading-tight truncate">
                      {point.title}
                    </div>
                  </div>
                </div>
              </Tooltip>
            </Marker>
          );
        })}

        {/* Georeferenced Editorial Balloon Popup */}
        {selectedPoint && !isMobile && (
          <Popup 
            position={[selectedPoint.lat, selectedPoint.lng]}
            closeButton={false}
            autoPan={false}
            className="editorial-popup"
            offset={[0, -20]}
            maxWidth={520}
          >
            <div className="bg-editorial-bg shadow-[5px_5px_0px_rgba(20,20,19,0.2)] rounded-[2px] overflow-hidden border border-editorial-text flex flex-col w-[400px] md:w-[480px]">
              <div className="px-3.5 py-2.5 border-b border-editorial-text/20 flex justify-between items-center bg-editorial-text text-editorial-bg gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="font-mono text-[10px] font-bold tracking-wider text-editorial-bg/70 flex-shrink-0">
                    {selectedPoint.order.toString().padStart(2, '0')}/{points.length.toString().padStart(2, '0')}
                  </span>
                  <span className="w-px h-3 bg-editorial-bg/25 flex-shrink-0" />
                  <h3 className="text-[11px] font-bold uppercase tracking-wider truncate">{selectedPoint.title}</h3>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (hasPrev && onPrev) onPrev();
                    }}
                    disabled={!hasPrev}
                    className="w-7 h-7 hover:bg-white/15 disabled:opacity-25 disabled:cursor-not-allowed rounded-[2px] flex items-center justify-center transition-colors cursor-pointer"
                    title="Lámina anterior"
                  >
                    <ChevronLeft size={15} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (hasNext && onNext) onNext();
                    }}
                    disabled={!hasNext}
                    className="w-7 h-7 hover:bg-white/15 disabled:opacity-25 disabled:cursor-not-allowed rounded-[2px] flex items-center justify-center transition-colors cursor-pointer"
                    title="Lámina siguiente"
                  >
                    <ChevronRight size={15} />
                  </button>
                  <div className="w-px h-4 bg-white/15 mx-0.5" />
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPoint(null);
                    }}
                    className="w-7 h-7 hover:bg-white/15 rounded-[2px] flex items-center justify-center transition-colors cursor-pointer"
                    title="Cerrar"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              <div className="p-3.5" onClick={(e) => e.stopPropagation()}>
                <PhotoSlider 
                  historical={selectedPoint.historicalPhoto}
                  current={selectedPoint.currentPhoto}
                  title={selectedPoint.title}
                  description={selectedPoint.description}
                  pointOrder={selectedPoint.order}
                  totalPoints={points.length}
                  allPoints={points}
                  onSelectPoint={onSelectPoint}
                  lat={selectedPoint.lat}
                  lng={selectedPoint.lng}
                  onNext={onNext || (() => {})}
                  onPrev={onPrev || (() => {})}
                  hasNext={hasNext || false}
                  hasPrev={hasPrev || false}
                  className="overflow-hidden flex-1"
                  isPopup={true}
                />
              </div>
            </div>
          </Popup>
        )}

        {/* Recenter when a point is selected - offset to keep marker centered with popup space */}
        {activeTargetPoint && (
          <ChangeView 
            lat={activeTargetPoint.lat + (isMobile ? -0.0018 : 0.0007)} 
            lng={activeTargetPoint.lng} 
            zoom={17} 
          />
        )}

        <ResetMapView signal={resetViewSignal} />
      </MapContainer>
    </div>
  );
});
