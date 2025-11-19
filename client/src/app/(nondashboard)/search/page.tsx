'use client';

import React, { useState, useEffect } from 'react';
import { useSearchPropertiesQuery, SearchFilters, Property } from '@/state/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  MapPin, 
  Filter, 
  IndianRupee, 
  Bed, 
  Bath, 
  Home,
  PawPrint,
  Car,
  Maximize2,
  X,
  SlidersHorizontal,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamically import PropertyMap to avoid SSR issues with Leaflet
const PropertyMap = dynamic(() => import('@/components/PropertyMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  ),
});

const SearchPage = () => {
  const [filters, setFilters] = useState<SearchFilters>({
    radiusKm: 10,
    sortBy: 'posted_date',
    sortOrder: 'desc',
  });
  
  const [showFilters, setShowFilters] = useState(true);
  const [showMap, setShowMap] = useState(true);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | undefined>();
  const [searchLocation, setSearchLocation] = useState<{ lat: number; lng: number } | null>(null);

  const { data: properties, isLoading, isFetching } = useSearchPropertiesQuery(filters);

  // Update search location in filters
  useEffect(() => {
    if (searchLocation) {
      setFilters(prev => ({
        ...prev,
        latitude: searchLocation.lat,
        longitude: searchLocation.lng,
      }));
    } else {
      setFilters(prev => {
        const { latitude, longitude, ...rest } = prev;
        return rest;
      });
    }
  }, [searchLocation]);

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === '' ? undefined : value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      radiusKm: 10,
      sortBy: 'posted_date',
      sortOrder: 'desc',
    });
    setSearchLocation(null);
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setSearchLocation({ lat, lng });
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Search className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Find Your Perfect Rental</h1>
            <p className="text-sm text-gray-600">
              {properties?.length || 0} properties found
              {searchLocation && ' near your selected location'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowMap(!showMap)}
          >
            <MapPin className="w-4 h-4 mr-2" />
            {showMap ? 'Hide' : 'Show'} Map
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden"
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            {showFilters ? 'Hide' : 'Show'} Filters
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Filters Sidebar */}
        <div
          className={`${
            showFilters ? 'block' : 'hidden'
          } lg:block w-full lg:w-80 bg-white border-r overflow-y-auto`}
        >
          <div className="p-6 space-y-6">
            {/* Location Search */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location
              </Label>
              <Input
                placeholder="Search by city or state"
                value={filters.city || ''}
                onChange={(e) => handleFilterChange('city', e.target.value)}
              />
              <div className="space-y-2">
                <Label className="text-xs">Search Radius: {filters.radiusKm}km</Label>
                <Slider
                  value={[filters.radiusKm || 10]}
                  onValueChange={([value]) => handleFilterChange('radiusKm', value)}
                  min={1}
                  max={50}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-gray-500">
                  {searchLocation 
                    ? 'Showing properties within this radius of your selected location'
                    : 'Select a location on the map to enable radius search'}
                </p>
              </div>
              {searchLocation && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-blue-900">
                      Map Location Selected
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchLocation(null)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                  <p className="text-xs text-blue-700">
                    {searchLocation.lat.toFixed(4)}, {searchLocation.lng.toFixed(4)}
                  </p>
                </div>
              )}
            </div>

            {/* Price Range */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <IndianRupee className="w-4 h-4" />
                Price Range (per month)
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice || ''}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice || ''}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                />
              </div>
            </div>

            {/* Bedrooms & Bathrooms */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Bed className="w-4 h-4" />
                  Min Beds
                </Label>
                <Select
                  value={filters.beds?.toString() || 'any'}
                  onValueChange={(value) => handleFilterChange('beds', value === 'any' ? undefined : parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="1">1+</SelectItem>
                    <SelectItem value="2">2+</SelectItem>
                    <SelectItem value="3">3+</SelectItem>
                    <SelectItem value="4">4+</SelectItem>
                    <SelectItem value="5">5+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Bath className="w-4 h-4" />
                  Min Baths
                </Label>
                <Select
                  value={filters.baths?.toString() || 'any'}
                  onValueChange={(value) => handleFilterChange('baths', value === 'any' ? undefined : parseFloat(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="1">1+</SelectItem>
                    <SelectItem value="1.5">1.5+</SelectItem>
                    <SelectItem value="2">2+</SelectItem>
                    <SelectItem value="2.5">2.5+</SelectItem>
                    <SelectItem value="3">3+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Property Type */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                Property Type
              </Label>
              <Select
                value={filters.propertyType || 'all'}
                onValueChange={(value) => handleFilterChange('propertyType', value === 'all' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Apartment">Apartment</SelectItem>
                  <SelectItem value="Villa">Villa</SelectItem>
                  <SelectItem value="Townhouse">Townhouse</SelectItem>
                  <SelectItem value="Cottage">Cottage</SelectItem>
                  <SelectItem value="Rooms">Rooms</SelectItem>
                  <SelectItem value="Tinyhouse">Tiny House</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Square Feet */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Maximize2 className="w-4 h-4" />
                Square Feet
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.minSquareFeet || ''}
                  onChange={(e) => handleFilterChange('minSquareFeet', e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.maxSquareFeet || ''}
                  onChange={(e) => handleFilterChange('maxSquareFeet', e.target.value)}
                />
              </div>
            </div>

            {/* Amenities */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Amenities
              </Label>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <PawPrint className="w-4 h-4 text-gray-600" />
                  <span className="text-sm">Pets Allowed</span>
                </div>
                <Switch
                  checked={filters.isPetsAllowed || false}
                  onCheckedChange={(checked) => handleFilterChange('isPetsAllowed', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-gray-600" />
                  <span className="text-sm">Parking Included</span>
                </div>
                <Switch
                  checked={filters.isParkingIncluded || false}
                  onCheckedChange={(checked) => handleFilterChange('isParkingIncluded', checked)}
                />
              </div>
            </div>

            {/* Sort By */}
            <div className="space-y-2">
              <Label>Sort By</Label>
              <Select
                value={filters.sortBy || 'posted_date'}
                onValueChange={(value) => handleFilterChange('sortBy', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="posted_date">Newest First</SelectItem>
                  <SelectItem value="price_per_month">Price: Low to High</SelectItem>
                  <SelectItem value="beds">Most Bedrooms</SelectItem>
                  <SelectItem value="square_feet">Largest Space</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters */}
            <Button
              variant="outline"
              onClick={clearFilters}
              className="w-full"
            >
              <X className="w-4 h-4 mr-2" />
              Clear All Filters
            </Button>
          </div>
        </div>

        {/* Map and Results */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Map */}
          {showMap && (
            <div className="w-full lg:w-1/2 h-1/2 lg:h-full">
              <PropertyMap
                properties={properties || []}
                searchLocation={searchLocation}
                onSearchLocationChange={handleLocationSelect}
                radiusKm={filters.radiusKm || 10}
                selectedPropertyId={selectedPropertyId}
                onPropertySelect={setSelectedPropertyId}
              />
            </div>
          )}

          {/* Property List */}
          <div className={`${showMap ? 'w-full lg:w-1/2' : 'w-full'} h-1/2 lg:h-full overflow-y-auto bg-gray-50 p-4`}>
            {isLoading || isFetching ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : properties && properties.length > 0 ? (
              <div className="space-y-4">
                {properties.map((property) => (
                  <Card
                    key={property.id}
                    className={`hover:shadow-lg transition-shadow cursor-pointer ${
                      selectedPropertyId === property.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedPropertyId(property.id)}
                  >
                    <div className="flex flex-col sm:flex-row">
                      {/* Image */}
                      <div className="sm:w-48 h-48 sm:h-auto relative">
                        {property.photo_urls && property.photo_urls.length > 0 ? (
                          <img
                            src={property.photo_urls[0]}
                            alt={property.name}
                            className="w-full h-full object-cover rounded-t-lg sm:rounded-l-lg sm:rounded-t-none"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-t-lg sm:rounded-l-lg sm:rounded-t-none">
                            <Home className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                        {property.has_active_lease && (
                          <Badge className="absolute top-2 left-2 bg-red-500">
                            Occupied
                          </Badge>
                        )}
                      </div>

                      {/* Content */}
                      <CardContent className="flex-1 p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
                              {property.name}
                            </h3>
                            <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                              <MapPin className="w-3 h-3" />
                              <span className="line-clamp-1">
                                {property.location.address}, {property.location.city}
                              </span>
                            </div>
                          </div>
                          <Badge variant="secondary">{property.property_type}</Badge>
                        </div>

                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                          {property.description}
                        </p>

                        <div className="flex flex-wrap gap-3 text-sm text-gray-700 mb-3">
                          <span className="flex items-center gap-1">
                            <Bed className="w-4 h-4" />
                            {property.beds} beds
                          </span>
                          <span className="flex items-center gap-1">
                            <Bath className="w-4 h-4" />
                            {property.baths} baths
                          </span>
                          <span className="flex items-center gap-1">
                            <Maximize2 className="w-4 h-4" />
                            {property.square_feet} sqft
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-3">
                          {property.is_pets_allowed && (
                            <Badge variant="outline" className="text-xs">
                              <PawPrint className="w-3 h-3 mr-1" />
                              Pets OK
                            </Badge>
                          )}
                          {property.is_parking_included && (
                            <Badge variant="outline" className="text-xs">
                              <Car className="w-3 h-3 mr-1" />
                              Parking
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center text-2xl font-bold text-green-600">
                              <IndianRupee className="w-5 h-5" />
                              {property.price_per_month.toLocaleString('en-IN')}
                              <span className="text-sm text-gray-500 ml-1">/month</span>
                            </div>
                            {property.distanceText && (
                              <p className="text-xs text-blue-600 font-medium mt-1">
                                📍 {property.distanceText}
                              </p>
                            )}
                          </div>
                          <Link href={`/properties/${property.id}`}>
                            <Button size="sm">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <Search className="w-16 h-16 mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold mb-2">No Properties Found</h3>
                <p className="text-center mb-4">
                  Try adjusting your filters or search in a different location
                </p>
                <Button onClick={clearFilters}>Clear Filters</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
