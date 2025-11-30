import { useEffect, useRef, useState } from 'react';

interface VehicleLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: 'moving' | 'stopped' | 'offline';
  speed?: number;
  heading?: number;
}

interface LiveMapProps {
  center?: [number, number];
  zoom?: number;
  vehicles?: VehicleLocation[];
}

const LiveMap = ({ 
  center = [17.3850, 78.4867], 
  zoom = 13,
  vehicles = [] 
}: LiveMapProps) => {
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initMap = async () => {
      try {
        const leaflet = await import('leaflet');
        const L = leaflet.default || leaflet;

        // Check if map container exists
        const container = document.getElementById('live-map');
        if (!container) return;

        // Check if map is already initialized
        if (mapRef.current) return;

        // Remove any existing map instance on the container
        if ((container as any)._leaflet_id) {
          return;
        }

        const map = L.map('live-map').setView(center, zoom);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '© OSM © CARTO',
          maxZoom: 19
        }).addTo(map);

        mapRef.current = map;
        setMapLoaded(true);
      } catch (err) {
        console.error('Error loading map:', err);
        setError('Map library not installed. Run: npm install leaflet react-leaflet @types/leaflet');
      }
    };

    initMap();

    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (err) {
          console.error('Error removing map:', err);
        }
        mapRef.current = null;
        setMapLoaded(false);
      }
    };
  }, []);

  // Handle center and zoom changes
  useEffect(() => {
    if (mapRef.current && mapLoaded) {
      mapRef.current.setView(center, zoom);
    }
  }, [center, zoom, mapLoaded]);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    const updateMarkers = async () => {
      try {
        const leaflet = await import('leaflet');
        const L = leaflet.default || leaflet;

        const currentVehicleIds = new Set(vehicles.map(v => v.id));
        
        markersRef.current.forEach((marker, id) => {
          if (!currentVehicleIds.has(id)) {
            marker.remove();
            markersRef.current.delete(id);
          }
        });

        vehicles.forEach((vehicle) => {
          const neonIcon = L.divIcon({
            className: 'bg-transparent',
            html: `
              <div class="relative">
                <div class="absolute inset-0 w-6 h-6 bg-primary rounded-full animate-ping opacity-75"></div>
                <div class="relative w-6 h-6 bg-primary rounded-full shadow-[0_0_20px_rgba(16,185,129,0.8)]"></div>
              </div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
            popupAnchor: [0, -12]
          });

          if (markersRef.current.has(vehicle.id)) {
            const marker = markersRef.current.get(vehicle.id);
            marker.setLatLng([vehicle.lat, vehicle.lng]);
            marker.setPopupContent(`
              <div class="p-2">
                <div class="font-bold text-primary">${vehicle.name}</div>
                <div class="text-sm">Status: ${vehicle.status}</div>
                ${vehicle.speed ? `<div class="text-sm">Speed: ${vehicle.speed} km/h</div>` : ''}
              </div>
            `);
          } else {
            const marker = L.marker([vehicle.lat, vehicle.lng], { icon: neonIcon })
              .addTo(mapRef.current)
              .bindPopup(`
                <div class="p-2">
                  <div class="font-bold text-primary">${vehicle.name}</div>
                  <div class="text-sm">Status: ${vehicle.status}</div>
                  ${vehicle.speed ? `<div class="text-sm">Speed: ${vehicle.speed} km/h</div>` : ''}
                </div>
              `);
            markersRef.current.set(vehicle.id, marker);
          }
        });
      } catch (err) {
        console.error('Error updating markers:', err);
      }
    };

    updateMarkers();
  }, [vehicles, mapLoaded]);

  if (error) {
    return (
      <div className="relative w-full h-full rounded-lg overflow-hidden border border-border bg-card">
        <div className="flex items-center justify-center h-full min-h-[500px]">
          <div className="text-center p-6 space-y-4">
            <div className="text-destructive text-lg font-semibold">Map Component Not Available</div>
            <p className="text-sm text-muted-foreground max-w-md">{error}</p>
            <div className="text-xs text-muted-foreground">
              The map will work once the required packages are installed.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden border border-border">
      <div id="live-map" className="w-full h-full min-h-[500px]" />
      
      <div className="absolute top-4 left-4 z-[1000] bg-card/90 backdrop-blur-sm border border-border rounded-lg p-3 space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">Active Bus</span>
        </div>
        <div className="text-xs text-muted-foreground">Live GPS Feed</div>
        {vehicles.length > 0 && (
          <div className="text-xs text-primary font-semibold">{vehicles.length} vehicle(s) tracked</div>
        )}
      </div>
    </div>
  );
};

export default LiveMap;
