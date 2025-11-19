'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGetPublicPropertyByIdQuery } from '@/state/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  MapPin, 
  Bed, 
  Bath, 
  Maximize2, 
  Home,
  PawPrint,
  Car,
  IndianRupee,
  Calendar,
  Shield,
  FileText,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import map to avoid SSR issues
const PropertyDetailMap = dynamic(() => import('../../../../components/PropertyDetailMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  ),
});

const PropertyDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const propertyId = params?.id as string;
  
  const { data: property, isLoading } = useGetPublicPropertyByIdQuery(parseInt(propertyId), {
    skip: !propertyId
  });

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Home className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Property Not Found</h2>
        <p className="text-gray-600 mb-6">The property you're looking for doesn't exist.</p>
        <Button onClick={() => router.push('/search')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Search
        </Button>
      </div>
    );
  }

  const hasImages = property.photo_urls && property.photo_urls.length > 0;

  const nextImage = () => {
    if (hasImages) {
      setCurrentImageIndex((prev) => (prev + 1) % property.photo_urls.length);
    }
  };

  const prevImage = () => {
    if (hasImages) {
      setCurrentImageIndex((prev) => (prev - 1 + property.photo_urls.length) % property.photo_urls.length);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{property.name}</h1>
              <div className="flex items-center gap-2 text-gray-600 mt-2">
                <MapPin className="w-4 h-4" />
                <span>{property.location.address}, {property.location.city}, {property.location.state}</span>
              </div>
            </div>
            {property.has_active_lease && (
              <Badge variant="destructive" className="text-sm">
                Currently Occupied
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card>
              <CardContent className="p-0">
                {hasImages ? (
                  <div className="relative">
                    <img
                      src={property.photo_urls[currentImageIndex]}
                      alt={`${property.name} - Image ${currentImageIndex + 1}`}
                      className="w-full h-[500px] object-cover rounded-t-lg"
                    />
                    {property.photo_urls.length > 1 && (
                      <>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full"
                          onClick={prevImage}
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full"
                          onClick={nextImage}
                        >
                          <ChevronRight className="w-5 h-5" />
                        </Button>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                          {currentImageIndex + 1} / {property.photo_urls.length}
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-[500px] bg-gray-200 flex items-center justify-center rounded-t-lg">
                    <Home className="w-24 h-24 text-gray-400" />
                  </div>
                )}
                {hasImages && property.photo_urls.length > 1 && (
                  <div className="flex gap-2 p-4 overflow-x-auto">
                    {property.photo_urls.map((url, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                          currentImageIndex === index ? 'border-primary' : 'border-transparent'
                        }`}
                      >
                        <img
                          src={url}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>About This Property</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{property.description}</p>
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle>Property Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Bed className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-gray-600">Bedrooms</p>
                      <p className="font-semibold">{property.beds}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Bath className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-gray-600">Bathrooms</p>
                      <p className="font-semibold">{property.baths}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Maximize2 className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-gray-600">Square Feet</p>
                      <p className="font-semibold">{property.square_feet}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Home className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-gray-600">Type</p>
                      <p className="font-semibold">{property.property_type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <PawPrint className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-gray-600">Pets</p>
                      <p className="font-semibold">{property.is_pets_allowed ? 'Allowed' : 'Not Allowed'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Car className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-gray-600">Parking</p>
                      <p className="font-semibold">{property.is_parking_included ? 'Included' : 'Not Included'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location Map */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-gray-700">
                    <p className="font-semibold">{property.location.address}</p>
                    <p>{property.location.city}, {property.location.state} {property.location.postal_code}</p>
                    <p>{property.location.country}</p>
                  </div>
                  <PropertyDetailMap property={property} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Pricing Card */}
              <Card>
                <CardContent className="p-6">
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2 mb-2">
                      <IndianRupee className="w-6 h-6 text-green-600" />
                      <span className="text-4xl font-bold text-green-600">
                        {property.price_per_month.toLocaleString('en-IN')}
                      </span>
                      <span className="text-gray-600">/month</span>
                    </div>
                    <Badge variant="secondary" className="mt-2">
                      {property.property_type}
                    </Badge>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Shield className="w-4 h-4" />
                        <span className="text-sm">Security Deposit</span>
                      </div>
                      <span className="font-semibold">₹{property.security_deposit.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-600">
                        <FileText className="w-4 h-4" />
                        <span className="text-sm">Application Fee</span>
                      </div>
                      <span className="font-semibold">₹{property.application_fee.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">Posted</span>
                      </div>
                      <span className="font-semibold">
                        {new Date(property.posted_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  {property.has_active_lease ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                      <p className="text-sm text-red-800 font-medium">
                        This property is currently occupied
                      </p>
                    </div>
                  ) : (
                    <Button className="w-full" size="lg">
                      Apply Now
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Amenities */}
              {property.amenities && property.amenities.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Amenities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {property.amenities.map((amenity, index) => (
                        <Badge key={index} variant="outline">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Highlights */}
              {property.highlights && property.highlights.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Highlights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {property.highlights.map((highlight, index) => (
                        <Badge key={index} variant="secondary">
                          {highlight}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailPage;
