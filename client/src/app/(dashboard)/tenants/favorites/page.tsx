'use client';

import React, { useState } from 'react';
import { useGetTenantFavoritesQuery, useRemoveFavoriteMutation } from '@/state/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Heart, MapPin, DollarSign, Bed, Bath, Square, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';

const Favorites = () => {
  const [cognitoId, setCognitoId] = useState<string>(''); // This should come from auth context
  const { data: favorites, isLoading, error } = useGetTenantFavoritesQuery(cognitoId, {
    skip: !cognitoId
  });
  const [removeFavorite, { isLoading: isRemoving }] = useRemoveFavoriteMutation();

  const handleRemoveFavorite = async (propertyId: number) => {
    if (!cognitoId) return;

    try {
      await removeFavorite({ cognitoId, propertyId }).unwrap();
      toast.success('Property removed from favorites');
    } catch (err) {
      console.error('Failed to remove favorite:', err);
      toast.error('Failed to remove favorite. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>Failed to load favorites</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Heart className="w-8 h-8 text-red-500 fill-red-500" />
          My Favorites
        </h1>
        <p className="text-gray-600 mt-2">
          Properties you've saved for later
        </p>
      </div>

      {!favorites || favorites.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Heart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Favorites Yet</h3>
            <p className="text-gray-600 mb-6">
              Start exploring properties and save your favorites here!
            </p>
            <Button>
              Browse Properties
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((favorite) => {
            const property = favorite.property;
            
            return (
              <Card key={favorite.id} className="overflow-hidden hover:shadow-xl transition-shadow">
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
                  <div className="absolute top-2 right-2">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="rounded-full bg-white/90 hover:bg-white"
                      onClick={() => handleRemoveFavorite(property.id)}
                      disabled={isRemoving}
                    >
                      <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                    </Button>
                  </div>
                  <div className="absolute bottom-2 left-2">
                    <Badge className="bg-primary text-white">
                      {property.property_type}
                    </Badge>
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
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <span className="text-2xl font-bold text-gray-900">
                      ${property.price_per_month.toLocaleString()}
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

                  {property.amenities && property.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {property.amenities.slice(0, 3).map((amenity, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                      {property.amenities.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{property.amenities.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}

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

                  <p className="text-sm text-gray-600 line-clamp-2">
                    {property.description}
                  </p>

                  <div className="text-xs text-gray-500">
                    Saved on {new Date(favorite.created_at).toLocaleDateString()}
                  </div>
                </CardContent>

                <CardFooter className="flex gap-2">
                  <Button className="flex-1" variant="default">
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleRemoveFavorite(property.id)}
                    disabled={isRemoving}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Favorites;
