'use client';

import React from 'react';
import { useGetTenantApplicationsQuery } from '@/state/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, FileText, Calendar, MapPin, DollarSign, Home, Bed, Bath, Square } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/components/AuthProvider';

const Applications = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: applications, isLoading, error } = useGetTenantApplicationsQuery(user?.id || '', {
    skip: !user?.id
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'Denied':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const filterApplications = (status: string) => {
    if (!applications) return [];
    if (status === 'all') return applications;
    return applications.filter(app => app.status === status);
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
            <CardDescription>Failed to load applications</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const pendingCount = applications?.filter(app => app.status === 'Pending').length || 0;
  const approvedCount = applications?.filter(app => app.status === 'Approved').length || 0;
  const deniedCount = applications?.filter(app => app.status === 'Denied').length || 0;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="w-8 h-8" />
          My Applications
        </h1>
        <p className="text-gray-600 mt-2">
          Track all your rental applications in one place
        </p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="all">
            All ({applications?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="Pending">
            Pending ({pendingCount})
          </TabsTrigger>
          <TabsTrigger value="Approved">
            Approved ({approvedCount})
          </TabsTrigger>
          <TabsTrigger value="Denied">
            Denied ({deniedCount})
          </TabsTrigger>
        </TabsList>

        {['all', 'Pending', 'Approved', 'Denied'].map((status) => (
          <TabsContent key={status} value={status} className="space-y-4">
            {filterApplications(status).length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No applications found</p>
                </CardContent>
              </Card>
            ) : (
              filterApplications(status).map((application) => (
                <Card key={application.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl">
                          {application.property.name}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-2 text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <CardDescription>
                            {application.property.location.address}, {application.property.location.city}, {application.property.location.state}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge className={getStatusColor(application.status)}>
                        {application.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Property Image */}
                      <div>
                        {application.property.photo_urls && application.property.photo_urls.length > 0 && (
                          <img
                            src={application.property.photo_urls[0]}
                            alt={application.property.name}
                            className="w-full h-48 object-cover rounded-lg"
                          />
                        )}
                      </div>

                      {/* Application Details */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">
                            Applied on: {new Date(application.application_date).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-700">
                          <DollarSign className="w-4 h-4" />
                          <span className="text-sm font-semibold">
                            ${application.property.price_per_month}/month
                          </span>
                        </div>

                        <div className="flex gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Bed className="w-4 h-4" />
                            {application.property.beds} bed{application.property.beds !== 1 ? 's' : ''}
                          </div>
                          <div className="flex items-center gap-1">
                            <Bath className="w-4 h-4" />
                            {application.property.baths} bath{application.property.baths !== 1 ? 's' : ''}
                          </div>
                          <div className="flex items-center gap-1">
                            <Square className="w-4 h-4" />
                            {application.property.square_feet} sqft
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-gray-700">
                          <Home className="w-4 h-4" />
                          <span className="text-sm capitalize">
                            {application.property.property_type}
                          </span>
                        </div>

                        {application.message && (
                          <div className="pt-2 border-t">
                            <p className="text-sm text-gray-600">
                              <strong>Your message:</strong> {application.message}
                            </p>
                          </div>
                        )}

                        {application.lease && (
                          <div className="pt-2 border-t">
                            <p className="text-sm text-green-700 font-semibold">
                              Lease Active
                            </p>
                            <p className="text-xs text-gray-600">
                              {new Date(application.lease.start_date).toLocaleDateString()} - {new Date(application.lease.end_date).toLocaleDateString()}
                            </p>
                          </div>
                        )}

                        <div className="flex gap-2 pt-2">
                          <Button variant="outline" size="sm">
                            View Property
                          </Button>
                          {application.status === 'Approved' && application.lease && (
                            <Button size="sm">
                              View Lease
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default Applications;
