'use client';

import React, { useState } from 'react';
import { useGetManagerApplicationsQuery, useUpdateApplicationStatusMutation, useCreateLeaseForApplicationMutation } from '@/state/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, FileText, Calendar, MapPin, DollarSign, Bed, Bath, Square, Check, X, User, Mail, Phone, FileCheck } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useAuth } from '@/components/AuthProvider';

const Applications = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: applications, isLoading, error } = useGetManagerApplicationsQuery(user?.id || '', {
    skip: !user?.id
  });
  const [updateStatus, { isLoading: isUpdating }] = useUpdateApplicationStatusMutation();
  const [createLease] = useCreateLeaseForApplicationMutation();

  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [isLeaseModalOpen, setIsLeaseModalOpen] = useState(false);
  const [leaseData, setLeaseData] = useState({
    start_date: '',
    end_date: '',
    rent: '',
    deposit: '',
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

  const handleApprove = async (applicationId: number) => {
    try {
      await updateStatus({ applicationId, status: 'Approved' }).unwrap();
      toast.success('Application approved successfully!');
    } catch (err) {
      console.error('Failed to approve application:', err);
      toast.error('Failed to approve application. Please try again.');
    }
  };

  const handleDeny = async (applicationId: number) => {
    if (!confirm('Are you sure you want to deny this application?')) {
      return;
    }

    try {
      await updateStatus({ applicationId, status: 'Denied' }).unwrap();
      toast.success('Application denied.');
    } catch (err) {
      console.error('Failed to deny application:', err);
      toast.error('Failed to deny application. Please try again.');
    }
  };

  const handleOpenLeaseModal = (application: any) => {
    setSelectedApplication(application);
    setLeaseData({
      start_date: '',
      end_date: '',
      rent: application.property.price_per_month.toString(),
      deposit: application.property.price_per_month.toString(),
    });
    setIsLeaseModalOpen(true);
  };

  const handleCreateLease = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedApplication) return;

    try {
      await createLease({
        applicationId: selectedApplication.id,
        start_date: leaseData.start_date,
        end_date: leaseData.end_date,
        rent: parseFloat(leaseData.rent),
        deposit: parseFloat(leaseData.deposit),
      }).unwrap();

      toast.success('Lease created successfully!');
      setIsLeaseModalOpen(false);
      setSelectedApplication(null);
    } catch (err) {
      console.error('Failed to create lease:', err);
      toast.error('Failed to create lease. Please try again.');
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
          Property Applications
        </h1>
        <p className="text-gray-600 mt-2">
          Review and manage rental applications for your properties
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
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-xl">
                            {application.property.name}
                          </CardTitle>
                          <Badge className={getStatusColor(application.status)}>
                            {application.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <CardDescription>
                            {application.property.location.address}, {application.property.location.city}, {application.property.location.state}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Property Details */}
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Property Details</h3>
                        {application.property.photo_urls && application.property.photo_urls.length > 0 && (
                          <img
                            src={application.property.photo_urls[0]}
                            alt={application.property.name}
                            className="w-full h-40 object-cover rounded-lg mb-3"
                          />
                        )}
                        
                        <div className="space-y-2">
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
                        </div>
                      </div>

                      {/* Applicant Information */}
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Applicant Information</h3>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-gray-700">
                            <User className="w-4 h-4" />
                            <div>
                              <p className="text-sm font-semibold">{application.name}</p>
                              {application.tenant && (
                                <p className="text-xs text-gray-500">Tenant ID: {application.tenant.id}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-gray-700">
                            <Mail className="w-4 h-4" />
                            <a href={`mailto:${application.email}`} className="text-sm text-blue-600 hover:underline">
                              {application.email}
                            </a>
                          </div>

                          <div className="flex items-center gap-2 text-gray-700">
                            <Phone className="w-4 h-4" />
                            <a href={`tel:${application.phone_number}`} className="text-sm text-blue-600 hover:underline">
                              {application.phone_number}
                            </a>
                          </div>

                          <div className="flex items-center gap-2 text-gray-700">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm">
                              Applied: {new Date(application.application_date).toLocaleDateString()}
                            </span>
                          </div>

                          {application.message && (
                            <div className="pt-2 border-t">
                              <p className="text-sm font-semibold text-gray-700 mb-1">Message:</p>
                              <p className="text-sm text-gray-600">{application.message}</p>
                            </div>
                          )}

                          {application.lease_id && (
                            <div className="pt-2 border-t">
                              <Badge className="bg-blue-100 text-blue-800">
                                <FileCheck className="w-3 h-3 mr-1" />
                                Lease Created
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {application.status === 'Pending' && (
                      <div className="flex gap-2 mt-6 pt-6 border-t">
                        <Button
                          onClick={() => handleApprove(application.id)}
                          disabled={isUpdating}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleDeny(application.id)}
                          disabled={isUpdating}
                          variant="destructive"
                          className="flex-1"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Deny
                        </Button>
                      </div>
                    )}

                    {application.status === 'Approved' && !application.lease_id && (
                      <div className="mt-6 pt-6 border-t">
                        <Button
                          onClick={() => handleOpenLeaseModal(application)}
                          className="w-full"
                        >
                          <FileCheck className="w-4 h-4 mr-2" />
                          Create Lease Agreement
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Create Lease Modal */}
      <Dialog open={isLeaseModalOpen} onOpenChange={setIsLeaseModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Lease Agreement</DialogTitle>
            <DialogDescription>
              Set up lease details for {selectedApplication?.tenant?.name || selectedApplication?.name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateLease} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Lease Start Date *</Label>
              <Input
                id="start_date"
                type="date"
                value={leaseData.start_date}
                onChange={(e) => setLeaseData(prev => ({ ...prev, start_date: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">Lease End Date *</Label>
              <Input
                id="end_date"
                type="date"
                value={leaseData.end_date}
                onChange={(e) => setLeaseData(prev => ({ ...prev, end_date: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rent">Monthly Rent ($) *</Label>
              <Input
                id="rent"
                type="number"
                step="0.01"
                value={leaseData.rent}
                onChange={(e) => setLeaseData(prev => ({ ...prev, rent: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deposit">Security Deposit ($) *</Label>
              <Input
                id="deposit"
                type="number"
                step="0.01"
                value={leaseData.deposit}
                onChange={(e) => setLeaseData(prev => ({ ...prev, deposit: e.target.value }))}
                required
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">Create Lease</Button>
              <Button type="button" variant="outline" onClick={() => setIsLeaseModalOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Applications;
