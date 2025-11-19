'use client';

import React, { useState } from 'react';
import { useCreatePropertyMutation } from '@/state/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2, ArrowLeft, Save, Building, Upload, X, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import dynamic from 'next/dynamic';

// Dynamically import LocationPicker to avoid SSR issues with Leaflet
const LocationPicker = dynamic(() => import('@/components/LocationPicker'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
      <p className="text-gray-500">Loading map...</p>
    </div>
  ),
});

const NewProperty = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [createProperty, { isLoading }] = useCreatePropertyMutation();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price_per_month: '',
    security_deposit: '',
    application_fee: '',
    beds: '',
    baths: '',
    square_feet: '',
    property_type: 'Apartment',
    is_pets_allowed: false,
    is_parking_included: false,
    address: '',
    city: '',
    state: '',
    country: 'India',
    postal_code: '',
  });

  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [photoInput, setPhotoInput] = useState('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    console.log(`Switch ${name} changed to:`, checked);
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleAddPhoto = () => {
    if (photoInput.trim()) {
      setPhotoUrls(prev => [...prev, photoInput.trim()]);
      setPhotoInput('');
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotoUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleLocationChange = (lat: number, lng: number) => {
    setCoordinates({ lat, lng });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast.error('User not authenticated');
      return;
    }

    // Build the location object with coordinates if available
    const locationData: any = {
      address: formData.address,
      city: formData.city,
      state: formData.state,
      country: formData.country,
      postal_code: formData.postal_code,
    };

    // Add coordinates in GeoJSON format if selected
    if (coordinates) {
      locationData.coordinates = `POINT(${coordinates.lng} ${coordinates.lat})`;
    }

    try {
      await createProperty({
        manager_cognito_id: user.id,
        name: formData.name,
        description: formData.description,
        price_per_month: parseFloat(formData.price_per_month),
        security_deposit: parseFloat(formData.security_deposit),
        application_fee: parseFloat(formData.application_fee),
        beds: parseInt(formData.beds),
        baths: parseFloat(formData.baths),
        square_feet: parseInt(formData.square_feet),
        property_type: formData.property_type,
        is_pets_allowed: formData.is_pets_allowed,
        is_parking_included: formData.is_parking_included,
        photo_urls: photoUrls.length > 0 ? photoUrls : undefined,
        location: locationData,
      }).unwrap();
      
      toast.success('Property created successfully!');
      router.push('/managers/properties');
    } catch (err) {
      console.error('Failed to create property:', err);
      toast.error('Failed to create property. Please try again.');
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/managers/properties')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Properties
        </Button>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Building className="w-8 h-8" />
          Add New Property
        </h1>
        <p className="text-gray-600 mt-2">
          Fill in the details to create a new rental property
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Property name and description</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Property Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Modern Downtown Apartment"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your property, amenities, and features..."
                rows={5}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing Information */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing Information</CardTitle>
            <CardDescription>Set rental rates and fees</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price_per_month">Monthly Rent (₹) *</Label>
                <Input
                  id="price_per_month"
                  name="price_per_month"
                  type="number"
                  step="0.01"
                  value={formData.price_per_month}
                  onChange={handleInputChange}
                  placeholder="15000"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="security_deposit">Security Deposit (₹) *</Label>
                <Input
                  id="security_deposit"
                  name="security_deposit"
                  type="number"
                  step="0.01"
                  value={formData.security_deposit}
                  onChange={handleInputChange}
                  placeholder="15000"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="application_fee">Application Fee (₹) *</Label>
                <Input
                  id="application_fee"
                  name="application_fee"
                  type="number"
                  step="0.01"
                  value={formData.application_fee}
                  onChange={handleInputChange}
                  placeholder="500"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Property Photos */}
        <Card>
          <CardHeader>
            <CardTitle>Property Photos</CardTitle>
            <CardDescription>Add photos of your property (URLs)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="photo_url">Photo URL</Label>
              <div className="flex gap-2">
                <Input
                  id="photo_url"
                  value={photoInput}
                  onChange={(e) => setPhotoInput(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddPhoto();
                    }
                  }}
                />
                <Button type="button" onClick={handleAddPhoto} variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                Enter image URLs and click Add. Press Enter to quickly add photos.
              </p>
            </div>

            {photoUrls.length > 0 && (
              <div className="space-y-2">
                <Label>Added Photos ({photoUrls.length})</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {photoUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Property ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EInvalid URL%3C/text%3E%3C/svg%3E';
                        }}
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="absolute top-1 right-1 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemovePhoto(index)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                      {index === 0 && (
                        <div className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                          Main Photo
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Property Details */}
        <Card>
          <CardHeader>
            <CardTitle>Property Details</CardTitle>
            <CardDescription>Size and specifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="beds">Bedrooms *</Label>
                <Input
                  id="beds"
                  name="beds"
                  type="number"
                  min="0"
                  value={formData.beds}
                  onChange={handleInputChange}
                  placeholder="2"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="baths">Bathrooms *</Label>
                <Input
                  id="baths"
                  name="baths"
                  type="number"
                  step="0.5"
                  min="0"
                  value={formData.baths}
                  onChange={handleInputChange}
                  placeholder="1.5"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="square_feet">Square Feet *</Label>
                <Input
                  id="square_feet"
                  name="square_feet"
                  type="number"
                  min="0"
                  value={formData.square_feet}
                  onChange={handleInputChange}
                  placeholder="1000"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="property_type">Property Type *</Label>
                <Select value={formData.property_type} onValueChange={(value) => handleSelectChange('property_type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Apartment">Apartment</SelectItem>
                    <SelectItem value="Villa">Villa</SelectItem>
                    <SelectItem value="Townhouse">Townhouse</SelectItem>
                    <SelectItem value="Cottage">Cottage</SelectItem>
                    <SelectItem value="Rooms">Rooms</SelectItem>
                    <SelectItem value="Tinyhouse">Tiny House</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Location
            </CardTitle>
            <CardDescription>Property address and map location</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Street Address *</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="123 MG Road"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Bangalore"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State/Province *</Label>
                <Input
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="Karnataka"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postal_code">PIN Code *</Label>
                <Input
                  id="postal_code"
                  name="postal_code"
                  value={formData.postal_code}
                  onChange={handleInputChange}
                  placeholder="560001"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  placeholder="India"
                  required
                />
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t">
              <Label>Pin Property Location on Map</Label>
              <LocationPicker
                onLocationChange={handleLocationChange}
                initialLat={coordinates?.lat}
                initialLng={coordinates?.lng}
                address={`${formData.address}, ${formData.city}, ${formData.state}, ${formData.country}`}
              />
            </div>
          </CardContent>
        </Card>

        {/* Additional Options */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Options</CardTitle>
            <CardDescription>Property policies and features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="space-y-0.5">
                <Label htmlFor="is_pets_allowed" className="text-base font-medium cursor-pointer">
                  Pets Allowed
                </Label>
                <p className="text-sm text-gray-500">Allow tenants to have pets</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${formData.is_pets_allowed ? 'text-green-600' : 'text-gray-400'}`}>
                  {formData.is_pets_allowed ? 'Yes' : 'No'}
                </span>
                <Switch
                  id="is_pets_allowed"
                  checked={formData.is_pets_allowed}
                  onCheckedChange={(checked) => handleSwitchChange('is_pets_allowed', checked)}
                  className="data-[state=checked]:bg-green-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="space-y-0.5">
                <Label htmlFor="is_parking_included" className="text-base font-medium cursor-pointer">
                  Parking Included
                </Label>
                <p className="text-sm text-gray-500">Include parking with rental</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${formData.is_parking_included ? 'text-green-600' : 'text-gray-400'}`}>
                  {formData.is_parking_included ? 'Yes' : 'No'}
                </span>
                <Switch
                  id="is_parking_included"
                  checked={formData.is_parking_included}
                  onCheckedChange={(checked) => handleSwitchChange('is_parking_included', checked)}
                  className="data-[state=checked]:bg-green-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6">
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1 md:flex-none md:min-w-[200px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Create Property
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/managers/properties')}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewProperty;
