'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon issue in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationPickerProps {
  onLocationChange: (lat: number, lng: number) => void;
  initialLat?: number;
  initialLng?: number;
  address?: string;
}

// Component to handle map clicks
function LocationMarker({ 
  position, 
  setPosition 
}: { 
  position: [number, number] | null;
  setPosition: (pos: [number, number]) => void;
}) {
  const map = useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return position === null ? null : (
    <Marker position={position} />
  );
}

const LocationPicker: React.FC<LocationPickerProps> = ({ 
  onLocationChange, 
  initialLat, 
  initialLng,
  address 
}) => {
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState<[number, number] | null>(
    initialLat && initialLng ? [initialLat, initialLng] : null
  );
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Default center (India - Bangalore)
  const defaultCenter: [number, number] = [12.9716, 77.5946];

  useEffect(() => {
    setMounted(true);
  }, []);

  // Geocode address when it changes
  useEffect(() => {
    if (address && address.length > 3 && !position) {
      geocodeAddress(address);
    }
  }, [address]);

  const geocodeAddress = async (addr: string) => {
    if (!addr || isGeocoding) return;
    
    setIsGeocoding(true);
    try {
      // Using Nominatim for geocoding (free OpenStreetMap service)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addr)}&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        setPosition([lat, lng]);
        onLocationChange(lat, lng);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    } finally {
      setIsGeocoding(false);
    }
  };

  const handlePositionChange = (newPosition: [number, number]) => {
    setPosition(newPosition);
    onLocationChange(newPosition[0], newPosition[1]);
  };

  // Only render map on client side
  if (!mounted) {
    return (
      <div className="w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="w-full h-[400px] rounded-lg overflow-hidden border border-gray-300 relative">
        <MapContainer
          center={position || defaultCenter}
          zoom={position ? 15 : 12}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} setPosition={handlePositionChange} />
        </MapContainer>
        {isGeocoding && (
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded shadow-lg z-[1000]">
            <p className="text-sm text-gray-700">Finding location on map...</p>
          </div>
        )}
      </div>
      {position && (
        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
          <span className="font-semibold">Selected Coordinates:</span> {position[0].toFixed(6)}, {position[1].toFixed(6)}
        </div>
      )}
      <p className="text-xs text-gray-500">
        Click on the map to select the precise location of your property. 
        {!position && address && " We'll try to locate it automatically based on the address."}
      </p>
    </div>
  );
};

export default LocationPicker;
