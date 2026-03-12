import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin } from 'lucide-react';

// Fix for default marker icon in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function LocationMap({ lat = 17.9757, lng = 102.6331, address = "Vientiane, Laos" }) {
  const position = [lat, lng];

  return (
    <div className="py-12 border-b border-border">
      <h2 className="text-2xl font-bold text-foreground mb-6 tracking-tight">Where you'll be</h2>
      <p className="text-sm font-medium text-muted-foreground mb-6 flex items-center gap-2">
        <MapPin className="w-4 h-4 text-primary" />
        {address}
      </p>
      
      <div className="h-[400px] sm:h-[480px] w-full rounded-3xl overflow-hidden border border-border shadow-inner relative group isolate">
        <MapContainer 
            center={position} 
            zoom={14} 
            scrollWheelZoom={false} 
            className="h-full w-full z-10"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <Circle
            center={position}
            radius={500}
            pathOptions={{ 
                fillColor: '#FF385C', 
                fillOpacity: 0.1, 
                color: '#FF385C', 
                weight: 2,
                dashArray: '5, 10'
            }}
          />
          
          <Marker position={position}>
            <Popup className="font-bold text-primary">
              Approximate location
            </Popup>
          </Marker>
        </MapContainer>

        {/* Map overlay controls placeholder logic */}
        <div className="absolute bottom-6 left-6 z-20 flex gap-2">
            <button className="bg-card text-foreground px-4 py-2.5 rounded-xl text-xs font-bold border border-border shadow-xl hover:bg-muted transition-all uppercase tracking-widest">
                Explore Area
            </button>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        <p className="text-[15px] text-foreground/80 leading-relaxed max-w-2xl font-medium italic">
            "The neighborhood is very quiet and safe. It's located in the diplomatic area of Vientiane, within walking distance to many great restaurants and local markets."
        </p>
        <button className="text-sm font-bold underline text-foreground hover:text-muted-foreground transition-all">
            Show more about the location
        </button>
      </div>
    </div>
  );
}
