'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Property } from '@/state/api';
import { MapPin, Home, IndianRupee } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

// Fix for default marker icon issue in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom search location marker (blue)
const searchMarkerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom property marker (green)
const propertyMarkerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface PropertyMapProps {
  properties: Property[];
  searchLocation: { lat: number; lng: number } | null;
  onSearchLocationChange: (lat: number, lng: number) => void;
  radiusKm: number;
  selectedPropertyId?: number;
  onPropertySelect?: (propertyId: number) => void;
}

// Component to handle map clicks
function MapClickHandler({ 
  onLocationSelect 
}: { 
  onLocationSelect: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

const PropertyMap: React.FC<PropertyMapProps> = ({ 
  properties,
  searchLocation, 
  onSearchLocationChange,
  radiusKm,
  selectedPropertyId,
  onPropertySelect
}) => {
  const [mounted, setMounted] = useState(false);

  // Default center (India - Bangalore)
  const defaultCenter: [number, number] = [12.9716, 77.5946];

  useEffect(() => {
    setMounted(true);
  }, []);

  // Parse property coordinates
  const getPropertyCoordinates = (property: Property): [number, number] | null => {
    if (!property.location?.coordinates) return null;

    let lat: number, lng: number;
    
    if (typeof property.location.coordinates === 'string') {
      const match = property.location.coordinates.match(/POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/i);
      if (match) {
        lng = parseFloat(match[1]);
        lat = parseFloat(match[2]);
        return [lat, lng];
      }
    } else if (property.location.coordinates.coordinates) {
      [lng, lat] = property.location.coordinates.coordinates;
      return [lat, lng];
    }
    
    return null;
  };

  // Calculate map center and bounds
  const mapCenter: [number, number] = searchLocation 
    ? [searchLocation.lat, searchLocation.lng]
    : properties.length > 0 && getPropertyCoordinates(properties[0])
    ? getPropertyCoordinates(properties[0])!
    : defaultCenter;

  if (!mounted) {
    return (
      <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-lg overflow-hidden border border-gray-300 relative">
      <MapContainer
        center={mapCenter}
        zoom={searchLocation ? 12 : 11}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapClickHandler onLocationSelect={onSearchLocationChange} />
        
        {/* Search location marker and radius */}
        {searchLocation && (
          <>
            <Marker 
              position={[searchLocation.lat, searchLocation.lng]}
              icon={searchMarkerIcon}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold">Search Location</p>
                  <p className="text-xs text-gray-600">
                    {searchLocation.lat.toFixed(4)}, {searchLocation.lng.toFixed(4)}
                  </p>
                </div>
              </Popup>
            </Marker>
            <Circle
              center={[searchLocation.lat, searchLocation.lng]}
              radius={radiusKm * 1000}
              pathOptions={{
                color: '#3b82f6',
                fillColor: '#3b82f6',
                fillOpacity: 0.1
              }}
            />
          </>
        )}

        {/* Property markers */}
        {properties.map(property => {
          const coords = getPropertyCoordinates(property);
          if (!coords) return null;

          return (
            <Marker
              key={property.id}
              position={coords}
              icon={propertyMarkerIcon}
              eventHandlers={{
                click: () => onPropertySelect?.(property.id)
              }}
            >
              <Popup>
                <div className="min-w-[200px]">
                  {property.photo_urls && property.photo_urls.length > 0 && (
                    <img
                      src={property.photo_urls[0]}
                      alt={property.name}
                      className="w-full h-32 object-cover rounded-lg mb-2"
                    />
                  )}
                  <h3 className="font-semibold text-sm mb-1 line-clamp-1">
                    {property.name}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
                    <MapPin className="w-3 h-3" />
                    <span className="line-clamp-1">
                      {property.location.city}, {property.location.state}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center text-green-600 font-bold">
                      <IndianRupee className="w-4 h-4" />
                      <span>{property.price_per_month.toLocaleString('en-IN')}/mo</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {property.property_type}
                    </Badge>
                  </div>
                  <div className="flex gap-2 text-xs text-gray-600 mb-2">
                    <span>{property.beds} beds</span>
                    <span>•</span>
                    <span>{property.baths} baths</span>
                    <span>•</span>
                    <span>{property.square_feet} sqft</span>
                  </div>
                  {property.distanceText && (
                    <p className="text-xs text-blue-600 font-medium mb-2">
                      📍 {property.distanceText}
                    </p>
                  )}
                  <Link 
                    href={`/properties/${property.id}`}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    View Details →
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Instructions overlay */}
      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-lg shadow-lg z-[1000] text-xs">
        <p className="text-gray-700">
          <MapPin className="w-3 h-3 inline mr-1" />
          Click on the map to set search location
        </p>
      </div>
    </div>
  );
};

export default PropertyMap;
