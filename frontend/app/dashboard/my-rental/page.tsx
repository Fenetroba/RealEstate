'use client';

import { useState } from 'react';
import { DashboardFilterTabs } from '@/components/dashboard/DashboardFilterTabs';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { dashboardPanelClass } from '@/lib/constants/dashboard-layout';
import { typeStatValue } from '@/lib/responsive';
import { cn, formatCurrency } from '@/lib/utils';
import {
  Building2, MapPin, DollarSign, Calendar, User, Phone,
  Mail, FileText, Download, AlertCircle, CheckCircle,
  Clock, Home, Bed, Bath, Maximize, Shield,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
export default function MyRentalPage() {
  const [activeTab, setActiveTab] = useState<'details' | 'lease' | 'landlord'>('details');

  // Mock rental data
  const rental = {
    id: '1',
    title: 'Modern Downtown Apartment',
    address: '123 Main Street, Apt 4B',
    city: 'Los Angeles',
    state: 'CA',
    zipCode: '90001',
    monthlyRent: 2400,
    securityDeposit: 2400,
    leaseStart: '2024-06-01',
    leaseEnd: '2025-06-01',
    rentDueDate: '1st of each month',
    nextPaymentDue: '2026-06-01',
    bedrooms: 2,
    bathrooms: 2,
    area: 1200,
    images: ['/edenet.jpg', '/image.png'],
    amenities: ['Parking', 'Pool', 'Gym', 'Security', 'Elevator'],
    landlord: {
      name: 'John Smith',
      email: 'john.smith@example.com',
      phone: '+1 (555) 123-4567',
    },
    documents: [
      { name: 'Lease Agreement', type: 'PDF', url: '#', date: '2024-06-01' },
      { name: 'Move-in Checklist', type: 'PDF', url: '#', date: '2024-06-01' },
      { name: 'Property Rules', type: 'PDF', url: '#', date: '2024-06-01' },
    ],
    paymentHistory: [
      { date: '2026-05-01', amount: 2400, status: 'PAID', method: 'Bank Transfer' },
      { date: '2026-04-01', amount: 2400, status: 'PAID', method: 'Bank Transfer' },
      { date: '2026-03-01', amount: 2400, status: 'PAID', method: 'Bank Transfer' },
    ],
  };

  const daysUntilPayment = Math.ceil(
    (new Date(rental.nextPaymentDue).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const tabOptions = [
    { id: 'details', label: 'Property details' },
    { id: 'lease', label: 'Lease information' },
    { id: 'landlord', label: 'Landlord contact' },
  ];

  return (
    <DashboardShell>
      <DashboardHeader
        title="My rental property"
        description="View your current rental details and lease information"
        actions={<Badge variant="success" dot>Active lease</Badge>}
      />

          {daysUntilPayment <= 7 && (
            <div className="mb-6">
              <Card className="border-l-4 border-l-accent bg-accent/5">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-accent mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">Rent Payment Due Soon</p>
                      <p className="text-sm text-muted mt-1">
                        Your next rent payment of {formatCurrency(rental.monthlyRent)} is due in {daysUntilPayment} days
                      </p>
                      <Button variant="primary" size="sm" className="mt-3">
                        Pay Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="mb-6">
            <div className="grid grid-cols-2 gap-4">
              {rental.images.map((img, idx) => (
                <div key={idx} className="relative h-64 rounded-2xl overflow-hidden">
                  <img src={img} alt={`Property ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          <DashboardFilterTabs
            className={cn('mb-6', dashboardPanelClass)}
            options={tabOptions}
            value={activeTab}
            onChange={(id) => setActiveTab(id as typeof activeTab)}
          />

          {/* Tab Content */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {activeTab === 'details' && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Property Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="text-xl font-bold text-foreground mb-2">{rental.title}</h3>
                        <div className="flex items-start gap-2 text-muted">
                          <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                          <span className="text-sm">
                            {rental.address}, {rental.city}, {rental.state} {rental.zipCode}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Bed className="h-5 w-5 text-foreground" />
                          </div>
                          <div>
                            <p className="text-sm text-muted">Bedrooms</p>
                            <p className="font-semibold text-foreground">{rental.bedrooms}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Bath className="h-5 w-5 text-foreground" />
                          </div>
                          <div>
                            <p className="text-sm text-muted">Bathrooms</p>
                            <p className="font-semibold text-foreground">{rental.bathrooms}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Maximize className="h-5 w-5 text-foreground" />
                          </div>
                          <div>
                            <p className="text-sm text-muted">Area</p>
                            <p className="font-semibold text-foreground">{rental.area} sqft</p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <h4 className="font-semibold text-foreground mb-3">Amenities</h4>
                        <div className="flex flex-wrap gap-2">
                          {rental.amenities.map((amenity) => (
                            <Badge key={amenity} variant="default">
                              {amenity}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Lease Documents</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {rental.documents.map((doc) => (
                          <div
                            key={doc.name}
                            className="flex items-center justify-between p-4 rounded-xl bg-surface hover:bg-surface transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                                <FileText className="h-5 w-5 text-destructive" />
                              </div>
                              <div>
                                <p className="font-medium text-foreground">{doc.name}</p>
                                <p className="text-xs text-muted">
                                  {doc.type} • Uploaded {doc.date}
                                </p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" leftIcon={<Download className="h-4 w-4" />}>
                              Download
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === 'lease' && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Lease Terms</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-surface">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="h-4 w-4 text-accent" />
                            <p className="text-sm text-muted">Lease Start</p>
                          </div>
                          <p className="font-semibold text-foreground">
                            {new Date(rental.leaseStart).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                        <div className="p-4 rounded-xl bg-surface">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="h-4 w-4 text-accent" />
                            <p className="text-sm text-muted">Lease End</p>
                          </div>
                          <p className="font-semibold text-foreground">
                            {new Date(rental.leaseEnd).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-accent/10 border border-accent/20">
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="h-4 w-4 text-accent" />
                          <p className="text-sm text-muted">Monthly Rent</p>
                        </div>
                        <p className={typeStatValue}>
                          {formatCurrency(rental.monthlyRent)}
                        </p>
                        <p className="text-xs text-muted mt-1">Due on {rental.rentDueDate}</p>
                      </div>

                      <div className="p-4 rounded-xl bg-surface">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="h-4 w-4 text-foreground" />
                          <p className="text-sm text-muted">Security Deposit</p>
                        </div>
                        <p className="font-semibold text-foreground">
                          {formatCurrency(rental.securityDeposit)}
                        </p>
                        <p className="text-xs text-muted mt-1">Refundable at lease end</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Payment History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {rental.paymentHistory.map((payment, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-4 rounded-xl bg-surface"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              </div>
                              <div>
                                <p className="font-medium text-foreground">
                                  {formatCurrency(payment.amount)}
                                </p>
                                <p className="text-xs text-muted">
                                  {new Date(payment.date).toLocaleDateString()} • {payment.method}
                                </p>
                              </div>
                            </div>
                            <Badge variant="success">{payment.status}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === 'landlord' && (
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Landlord Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl gradient-gold flex items-center justify-center text-white text-xl font-bold">
                          {rental.landlord.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-foreground">{rental.landlord.name}</h3>
                          <p className="text-sm text-muted">Property Owner</p>
                        </div>
                      </div>

                      <div className="space-y-4 pt-4 border-t">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Mail className="h-5 w-5 text-foreground" />
                          </div>
                          <div>
                            <p className="text-sm text-muted">Email</p>
                            <p className="font-medium text-foreground">{rental.landlord.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Phone className="h-5 w-5 text-foreground" />
                          </div>
                          <div>
                            <p className="text-sm text-muted">Phone</p>
                            <p className="font-medium text-foreground">{rental.landlord.phone}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4 border-t">
                        <Button variant="primary" className="flex-1" leftIcon={<Mail className="h-4 w-4" />}>
                          Send Message
                        </Button>
                        <Button variant="outline" className="flex-1" leftIcon={<Phone className="h-4 w-4" />}>
                          Call
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="primary" className="w-full" leftIcon={<DollarSign className="h-4 w-4" />}>
                    Pay Rent
                  </Button>
                 
                  <Button variant="outline" className="w-full" leftIcon={<Calendar className="h-4 w-4" />}>
                    Renew Lease
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Lease Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">Lease Started</p>
                        <p className="text-xs text-muted">
                          {new Date(rental.leaseStart).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Clock className="h-4 w-4 text-primary dark:text-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">Current Period</p>
                        <p className="text-xs text-muted">4 months remaining</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center flex-shrink-0">
                        <Calendar className="h-4 w-4 text-muted" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">Lease Ends</p>
                        <p className="text-xs text-muted">
                          {new Date(rental.leaseEnd).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
    </DashboardShell>
  );
}
