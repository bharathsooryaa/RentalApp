'use client';

import React, { useState } from 'react';
import { useGetTenantResidencesQuery, useGetLeasePaymentsQuery } from '@/state/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Home, MapPin, Calendar, DollarSign, User, Phone, Mail, Bed, Bath, Square, Receipt, ChevronDown, ChevronUp } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/components/AuthProvider';

const Residences = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: residences, isLoading, error } = useGetTenantResidencesQuery(user?.id || '', {
    skip: !user?.id
  });

  const [expandedLease, setExpandedLease] = useState<number | null>(null);

  const isLeaseActive = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    return now >= start && now <= end;
  };

  const getLeaseStatus = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) return { label: 'Upcoming', color: 'bg-blue-100 text-blue-800 border-blue-300' };
    if (now > end) return { label: 'Expired', color: 'bg-gray-100 text-gray-800 border-gray-300' };
    return { label: 'Active', color: 'bg-green-100 text-green-800 border-green-300' };
  };

  const LeasePayments = ({ leaseId }: { leaseId: number }) => {
    const { data: payments, isLoading: paymentsLoading } = useGetLeasePaymentsQuery(leaseId);

    if (paymentsLoading) {
      return (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      );
    }

    if (!payments || payments.length === 0) {
      return (
        <div className="text-center py-4 text-gray-600">
          No payment records found
        </div>
      );
    }

    const getPaymentStatusColor = (status: string) => {
      switch (status) {
        case 'Paid':
          return 'bg-green-100 text-green-800';
        case 'Pending':
          return 'bg-yellow-100 text-yellow-800';
        case 'Overdue':
          return 'bg-red-100 text-red-800';
        case 'PartiallyPaid':
          return 'bg-orange-100 text-orange-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    };

    return (
      <div className="mt-4">
        <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Receipt className="w-5 h-5" />
          Payment History
        </h4>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Due Date</TableHead>
                <TableHead>Amount Due</TableHead>
                <TableHead>Amount Paid</TableHead>
                <TableHead>Payment Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    {new Date(payment.due_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-semibold">
                    ${payment.amount_due.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    ${payment.amount_paid.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {new Date(payment.payment_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge className={getPaymentStatusColor(payment.payment_status)}>
                      {payment.payment_status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
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
            <CardDescription>Failed to load residences</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Home className="w-8 h-8" />
          My Residences
        </h1>
        <p className="text-gray-600 mt-2">
          View your current and past rental properties
        </p>
      </div>

      {!residences || residences.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Home className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Residences Yet</h3>
            <p className="text-gray-600 mb-6">
              Once you have an approved application, your residence will appear here
            </p>
            <Button>
              Browse Properties
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {residences.map((lease) => {
            const property = lease.property;
            const status = getLeaseStatus(lease.start_date, lease.end_date);

            // Skip if property is null
            if (!property) {
              return null;
            }

            return (
              <Card key={lease.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-2xl">
                          {property.name}
                        </CardTitle>
                        <Badge className={status.color}>
                          {status.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <CardDescription className="text-base">
                          {property.location.address}, {property.location.city}, {property.location.state} {property.location.postal_code}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Property Image */}
                    <div>
                      {property.photo_urls && property.photo_urls.length > 0 ? (
                        <img
                          src={property.photo_urls[0]}
                          alt={property.name}
                          className="w-full h-64 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-gray-400">No image available</span>
                        </div>
                      )}

                      {/* Property Details */}
                      <div className="mt-4 grid grid-cols-3 gap-4">
                        <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                          <Bed className="w-5 h-5 text-gray-600 mb-1" />
                          <span className="text-sm font-semibold">{property.beds}</span>
                          <span className="text-xs text-gray-600">Bedrooms</span>
                        </div>
                        <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                          <Bath className="w-5 h-5 text-gray-600 mb-1" />
                          <span className="text-sm font-semibold">{property.baths}</span>
                          <span className="text-xs text-gray-600">Bathrooms</span>
                        </div>
                        <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                          <Square className="w-5 h-5 text-gray-600 mb-1" />
                          <span className="text-sm font-semibold">{property.square_feet}</span>
                          <span className="text-xs text-gray-600">Sq Ft</span>
                        </div>
                      </div>
                    </div>

                    {/* Lease Information */}
                    <div className="space-y-6">
                      {/* Lease Dates */}
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Calendar className="w-5 h-5" />
                          Lease Period
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Start Date:</span>
                            <span className="font-semibold">
                              {new Date(lease.start_date).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">End Date:</span>
                            <span className="font-semibold">
                              {new Date(lease.end_date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Financial Information */}
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <DollarSign className="w-5 h-5" />
                          Financial Details
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Monthly Rent:</span>
                            <span className="font-semibold text-green-700">
                              ${lease.rent.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Security Deposit:</span>
                            <span className="font-semibold">
                              ${lease.deposit.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Property Manager */}
                      {property.manager && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Property Manager
                          </h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-600" />
                              <span>{property.manager.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-gray-600" />
                              <a href={`mailto:${property.manager.email}`} className="text-blue-600 hover:underline">
                                {property.manager.email}
                              </a>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-gray-600" />
                              <a href={`tel:${property.manager.phone_number}`} className="text-blue-600 hover:underline">
                                {property.manager.phone_number}
                              </a>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1">
                          View Lease Agreement
                        </Button>
                        <Button variant="outline" className="flex-1">
                          Contact Manager
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Payment History Accordion */}
                  <Accordion type="single" collapsible className="mt-6">
                    <AccordionItem value="payments">
                      <AccordionTrigger className="text-lg font-semibold">
                        View Payment History
                      </AccordionTrigger>
                      <AccordionContent>
                        <LeasePayments leaseId={lease.id} />
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Residences;
