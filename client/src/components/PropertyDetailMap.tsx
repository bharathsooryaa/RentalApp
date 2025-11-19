'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Property } from '@/state/api';
import { MapPin } from 'lucide-react';

// Fix for default marker icon issue in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface PropertyDetailMapProps {
  property: Property;
}

const PropertyDetailMap: React.FC<PropertyDetailMapProps> = ({ property }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Parse property coordinates
  const getPropertyCoordinates = (): [number, number] | null => {
    if (!property.location?.coordinates) {
      console.log('No coordinates found in property.location');
      return null;
    }

    console.log('Coordinates data:', property.location.coordinates);
    let lat: number, lng: number;
    
    // Handle string format like "POINT(lng lat)"
    if (typeof property.location.coordinates === 'string') {
      const match = property.location.coordinates.match(/POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/i);
      if (match) {
        lng = parseFloat(match[1]);
        lat = parseFloat(match[2]);
        console.log('Parsed from POINT string:', { lat, lng });
        return [lat, lng];
      }
    }
    
    // Handle GeoJSON format
    if (typeof property.location.coordinates === 'object') {
      // Direct GeoJSON Point format
      if (property.location.coordinates.type === 'Point' && Array.isArray(property.location.coordinates.coordinates)) {
        [lng, lat] = property.location.coordinates.coordinates;
        console.log('Parsed from GeoJSON:', { lat, lng });
        return [lat, lng];
      }
      // Nested coordinates array
      if (Array.isArray(property.location.coordinates.coordinates)) {
        [lng, lat] = property.location.coordinates.coordinates;
        console.log('Parsed from nested coordinates:', { lat, lng });
        return [lat, lng];
      }
      // Direct array [lng, lat]
      if (Array.isArray(property.location.coordinates) && property.location.coordinates.length === 2) {
        [lng, lat] = property.location.coordinates;
        console.log('Parsed from direct array:', { lat, lng });
        return [lat, lng];
      }
    }
    
    console.log('Failed to parse coordinates');
    return null;
  };

  const coords = getPropertyCoordinates();
  
  // Default center (India - Bangalore) if no coordinates
  const defaultCenter: [number, number] = [12.9716, 77.5946];
  const center = coords || defaultCenter;

  if (!mounted) {
    return (
      <div className="w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden border border-gray-300">
      <MapContainer
        center={center}
        zoom={coords ? 15 : 12}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {coords && (
          <Marker position={coords}>
            <Popup>
              <div className="text-sm">
                <p className="font-semibold mb-1">{property.name}</p>
                <div className="flex items-center gap-1 text-gray-600">
                  <MapPin className="w-3 h-3" />
                  <span>{property.location.address}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {property.location.city}, {property.location.state}
                </p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
      
      {!coords && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100/90 pointer-events-none">
          <div className="text-center">
            <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Location not mapped</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetailMap;
