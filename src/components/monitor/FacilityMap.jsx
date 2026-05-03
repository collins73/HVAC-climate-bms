import { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CheckCircle2, AlertCircle, WifiOff } from 'lucide-react';
import { renderToString } from 'react-dom/server';

export default function FacilityMap({ facilities }) {
  // Filter facilities with coordinates
  const geoFacilities = facilities.filter(f => f.latitude != null && f.longitude != null);

  // Calculate center of map
  const mapCenter = useMemo(() => {
    if (geoFacilities.length === 0) {
      return [40.7128, -74.0060]; // Default to NYC
    }
    const lat = geoFacilities.reduce((sum, f) => sum + f.latitude, 0) / geoFacilities.length;
    const lng = geoFacilities.reduce((sum, f) => sum + f.longitude, 0) / geoFacilities.length;
    return [lat, lng];
  }, [geoFacilities]);

  const getStatusIcon = (facility) => {
    if (!facility.credential) {
      return {
        color: '#6b7280', // gray - not connected
        icon: 'circle-x',
        label: 'Not Connected'
      };
    }
    if (!facility.credential.enabled) {
      return {
        color: '#6b7280', // gray - disabled
        icon: 'circle-x',
        label: 'Disabled'
      };
    }
    if (facility.credential.expires_at && new Date(facility.credential.expires_at) < new Date()) {
      return {
        color: '#ef4444', // red - expired
        icon: 'alert-circle',
        label: 'Expired'
      };
    }
    if (!facility.lastSync) {
      return {
        color: '#f59e0b', // amber - connected but inactive
        icon: 'circle-alert',
        label: 'Connected · Inactive'
      };
    }
    return {
      color: '#10b981', // emerald - active
      icon: 'check-circle',
      label: 'Connected · Active'
    };
  };

  const createCustomIcon = (color) => {
    return new Icon({
      iconUrl: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='${encodeURIComponent(color)}'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z'/%3E%3C/svg%3E`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });
  };

  if (geoFacilities.length === 0) {
    return (
      <div className="w-full h-96 bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">No facilities with location data</p>
          <p className="text-xs text-muted-foreground mt-1">Add latitude/longitude to buildings to display on map</p>
        </div>
      </div>
    );
  }

  return (
    <MapContainer
      center={mapCenter}
      zoom={6}
      style={{ height: '500px', width: '100%' }}
      className="rounded-b-lg"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
        maxNativeZoom={19}
        maxZoom={21}
      />
      {geoFacilities.map(facility => {
        const status = getStatusIcon(facility);
        return (
          <Marker
            key={facility.id}
            position={[facility.latitude, facility.longitude]}
            icon={createCustomIcon(status.color)}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold text-foreground mb-2">{facility.name}</p>
                {facility.address && (
                  <p className="text-xs text-muted-foreground mb-2">{facility.address}</p>
                )}
                <div className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium mb-2 ${
                  status.color === '#10b981' ? 'bg-emerald-500/15 text-emerald-400' :
                  status.color === '#f59e0b' ? 'bg-amber-500/15 text-amber-400' :
                  status.color === '#ef4444' ? 'bg-red-500/15 text-red-400' :
                  'bg-gray-500/15 text-gray-400'
                }`}>
                  <span>●</span>
                  {status.label}
                </div>
                {facility.credential && (
                  <div className="text-xs text-muted-foreground space-y-1 border-t border-border pt-2">
                    <p><span className="font-medium">Key:</span> {facility.credential.name}</p>
                    {facility.lastSync && (
                      <p><span className="font-medium">Last Sync:</span> {new Date(facility.lastSync).toLocaleString()}</p>
                    )}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}