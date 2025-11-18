'use client';

import React from 'react';
import { useGetManagerPropertiesQuery, useDeletePropertyMutation } from '@/state/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, MapPin, IndianRupee, Bed, Bath, Square, Edit, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';

const Properties = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: properties, isLoading, error } = useGetManagerPropertiesQuery(user?.id || '', {
    skip: !user?.id
  });
  const [deleteProperty, { isLoading: isDeleting }] = useDeletePropertyMutation();

  const handleDeleteProperty = async (propertyId: number) => {
    if (!confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteProperty(propertyId).unwrap();
      toast.success('Property deleted successfully!');
    } catch (err) {
      console.error('Failed to delete property:', err);
      toast.error('Failed to delete property. Please try again.');
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Authentication Required</CardTitle>
            <CardDescription>Please sign in to view your properties</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>Failed to load properties</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Properties</h1>
          <p className="text-gray-600 mt-2">
            Manage your rental properties
          </p>
        </div>
        
        <Link href="/managers/newproperty">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Property
          </Button>
        </Link>
      </div>

      {!properties || properties.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Plus className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Properties Yet</h3>
            <p className="text-gray-600 mb-6">
              Get started by adding your first rental property
            </p>
            <Link href="/managers/newproperty">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Property
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <Card key={property.id} className="overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative">
                {property.photo_urls && property.photo_urls.length > 0 ? (
                  <img
                    src={property.photo_urls[0]}
                    alt={property.name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">No image</span>
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <Badge className="bg-primary text-white">
                    {property.property_type}
                  </Badge>
                </div>
                <div className="absolute top-2 right-2 flex gap-2">
                  {property.is_pets_allowed && (
                    <Badge variant="secondary" className="text-xs">🐾 Pets</Badge>
                  )}
                  {property.is_parking_included && (
                    <Badge variant="secondary" className="text-xs">🅿️ Parking</Badge>
                  )}
                </div>
              </div>

              <CardHeader>
                <CardTitle className="text-lg line-clamp-1">
                  {property.name}
                </CardTitle>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <CardDescription className="line-clamp-1">
                    {property.location.city}, {property.location.state}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <IndianRupee className="w-5 h-5 text-green-600" />
                  <span className="text-2xl font-bold text-gray-900">
                    ₹{property.price_per_month.toLocaleString('en-IN')}
                  </span>
                  <span className="text-gray-600">/month</span>
                </div>

                <div className="flex gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Bed className="w-4 h-4" />
                    {property.beds} bed{property.beds !== 1 ? 's' : ''}
                  </div>
                  <div className="flex items-center gap-1">
                    <Bath className="w-4 h-4" />
                    {property.baths} bath{property.baths !== 1 ? 's' : ''}
                  </div>
                  <div className="flex items-center gap-1">
                    <Square className="w-4 h-4" />
                    {property.square_feet} sqft
                  </div>
                </div>

                <p className="text-sm text-gray-600 line-clamp-2">
                  {property.description}
                </p>

                {property.average_rating > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      <span className="text-yellow-500">★</span>
                      <span className="ml-1 text-sm font-semibold">
                        {property.average_rating.toFixed(1)}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      ({property.number_of_reviews} review{property.number_of_reviews !== 1 ? 's' : ''})
                    </span>
                  </div>
                )}

                <div className="text-xs text-gray-500">
                  Posted {new Date(property.posted_date).toLocaleDateString()}
                </div>
              </CardContent>

              <CardFooter className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteProperty(property.id)}
                  disabled={isDeleting}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Properties;
