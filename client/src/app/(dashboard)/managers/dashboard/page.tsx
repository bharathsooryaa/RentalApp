'use client';

import React, { useState } from 'react';
import { useGetManagerQuery, useGetManagerPropertiesQuery, useGetManagerApplicationsQuery } from '@/state/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Building, FileText, DollarSign, TrendingUp, Users, Calendar, MapPin, Eye, Plus, CheckCircle, Clock, XCircle } from 'lucide-react';
import Link from 'next/link';

const Dashboard = () => {
  const [cognitoId, setCognitoId] = useState<string>(''); // This should come from auth context
  const { data: manager, isLoading: managerLoading } = useGetManagerQuery(cognitoId, {
    skip: !cognitoId
  });
  const { data: properties, isLoading: propertiesLoading } = useGetManagerPropertiesQuery(cognitoId, {
    skip: !cognitoId
  });
  const { data: applications, isLoading: applicationsLoading } = useGetManagerApplicationsQuery(cognitoId, {
    skip: !cognitoId
  });

  const isLoading = managerLoading || propertiesLoading || applicationsLoading;

  // Calculate statistics
  const totalProperties = properties?.length || 0;
  const totalApplications = applications?.length || 0;
  const pendingApplications = applications?.filter(app => app.status === 'Pending').length || 0;
  const approvedApplications = applications?.filter(app => app.status === 'Approved').length || 0;
  const deniedApplications = applications?.filter(app => app.status === 'Denied').length || 0;
  
  const totalMonthlyRevenue = properties?.reduce((sum, prop) => sum + prop.price_per_month, 0) || 0;
  const averageRent = totalProperties > 0 ? totalMonthlyRevenue / totalProperties : 0;
  
  // Get recent applications (last 5)
  const recentApplications = applications?.slice(0, 5) || [];

  // Get top properties by rating
  const topProperties = [...(properties || [])]
    .sort((a, b) => b.average_rating - a.average_rating)
    .slice(0, 3);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">
          Welcome back, {manager?.name || 'Manager'}! 👋
        </h1>
        <p className="text-gray-600 mt-2">
          Here's what's happening with your properties today.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Properties */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Properties
            </CardTitle>
            <Building className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{totalProperties}</div>
            <p className="text-xs text-gray-500 mt-1">
              Active rental listings
            </p>
          </CardContent>
        </Card>

        {/* Total Revenue */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Monthly Revenue
            </CardTitle>
            <DollarSign className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              ${totalMonthlyRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Avg: ${Math.round(averageRent).toLocaleString()} per property
            </p>
          </CardContent>
        </Card>

        {/* Pending Applications */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pending Reviews
            </CardTitle>
            <Clock className="w-5 h-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{pendingApplications}</div>
            <p className="text-xs text-gray-500 mt-1">
              Applications awaiting review
            </p>
          </CardContent>
        </Card>

        {/* Total Applications */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Applications
            </CardTitle>
            <FileText className="w-5 h-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{totalApplications}</div>
            <p className="text-xs text-gray-500 mt-1">
              {approvedApplications} approved, {deniedApplications} denied
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Applications */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Recent Applications
                </CardTitle>
                <CardDescription className="mt-1">
                  Latest rental applications for your properties
                </CardDescription>
              </div>
              <Link href="/managers/applications">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentApplications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No applications yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentApplications.map((application) => (
                  <div
                    key={application.id}
                    className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{application.name}</h4>
                        <Badge
                          className={
                            application.status === 'Approved'
                              ? 'bg-green-100 text-green-800'
                              : application.status === 'Denied'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }
                        >
                          {application.status === 'Approved' && <CheckCircle className="w-3 h-3 mr-1" />}
                          {application.status === 'Denied' && <XCircle className="w-3 h-3 mr-1" />}
                          {application.status === 'Pending' && <Clock className="w-3 h-3 mr-1" />}
                          {application.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{application.property.name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(application.application_date).toLocaleDateString()}
                      </p>
                    </div>
                    <Link href="/managers/applications">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Application Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Application Status
            </CardTitle>
            <CardDescription className="mt-1">
              Overview of application statuses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Pending */}
              <div className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Pending</p>
                    <p className="text-sm text-gray-600">Awaiting review</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-yellow-600">{pendingApplications}</div>
              </div>

              {/* Approved */}
              <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Approved</p>
                    <p className="text-sm text-gray-600">Applications accepted</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-green-600">{approvedApplications}</div>
              </div>

              {/* Denied */}
              <div className="flex items-center justify-between p-4 border rounded-lg bg-red-50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Denied</p>
                    <p className="text-sm text-gray-600">Applications rejected</p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-red-600">{deniedApplications}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Properties */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Your Properties
              </CardTitle>
              <CardDescription className="mt-1">
                {totalProperties > 0 ? 'Top rated properties' : 'Get started by adding properties'}
              </CardDescription>
            </div>
            <Link href="/managers/properties">
              <Button className="flex items-center gap-2">
                {totalProperties > 0 ? (
                  <>
                    <Eye className="w-4 h-4" />
                    View All
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Add Property
                  </>
                )}
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {topProperties.length === 0 ? (
            <div className="text-center py-12">
              <Building className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Properties Yet</h3>
              <p className="text-gray-600 mb-6">
                Start by adding your first rental property to get applications
              </p>
              <Link href="/managers/properties">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Property
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {topProperties.map((property) => (
                <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    {property.photo_urls && property.photo_urls.length > 0 ? (
                      <img
                        src={property.photo_urls[0]}
                        alt={property.name}
                        className="w-full h-40 object-cover"
                      />
                    ) : (
                      <div className="w-full h-40 bg-gray-200 flex items-center justify-center">
                        <Building className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-primary text-white">
                        {property.property_type}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
                      {property.name}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                      <MapPin className="w-3 h-3" />
                      <span className="line-clamp-1">
                        {property.location.city}, {property.location.state}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-bold text-green-600">
                        ${property.price_per_month.toLocaleString()}/mo
                      </div>
                      {property.average_rating > 0 && (
                        <div className="flex items-center text-yellow-500">
                          <span className="mr-1">★</span>
                          <span className="text-sm font-semibold text-gray-900">
                            {property.average_rating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/managers/properties">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardContent className="p-6 text-center">
              <Building className="w-12 h-12 mx-auto mb-4 text-blue-600" />
              <h3 className="font-semibold text-gray-900 mb-2">Manage Properties</h3>
              <p className="text-sm text-gray-600">
                Add, edit, or remove your rental properties
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/managers/applications">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardContent className="p-6 text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-purple-600" />
              <h3 className="font-semibold text-gray-900 mb-2">Review Applications</h3>
              <p className="text-sm text-gray-600">
                Approve or deny rental applications
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/managers/settings">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardContent className="p-6 text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-green-600" />
              <h3 className="font-semibold text-gray-900 mb-2">Account Settings</h3>
              <p className="text-sm text-gray-600">
                Update your profile and preferences
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
