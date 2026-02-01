'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  subscriptionApi,
  SubscriptionPlan,
  SubscriptionResponse,
  SubscriptionInvoice,
  CheckoutRequest,
  BillingCycle,
  ApiError,
} from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import {
  CreditCard,
  Crown,
  Users,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  Loader2,
  Sparkles,
  Zap,
  Shield,
  Star,
  XCircle,
} from 'lucide-react';
import { format } from 'date-fns';

export default function SubscriptionPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null);
  const [invoices, setInvoices] = useState<SubscriptionInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  
  // Dialog states
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [showChangeSeatDialog, setShowChangeSeatDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showCancelInvoiceDialog, setShowCancelInvoiceDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<SubscriptionInvoice | null>(null);
  const [isCancellingInvoice, setIsCancellingInvoice] = useState(false);
  
  // Form states
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [seatCount, setSeatCount] = useState<number>(5);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [payerEmail, setPayerEmail] = useState<string>('');
  const [cancelReason, setCancelReason] = useState<string>('');

  // Fetch data
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (user?.email) {
      setPayerEmail(user.email);
    }
  }, [user]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [plansRes, subscriptionRes, invoicesRes] = await Promise.all([
        subscriptionApi.getPlans(),
        subscriptionApi.getMySubscription(),
        subscriptionApi.getInvoices(),
      ]);

      if (plansRes.success && plansRes.data) {
        setPlans(plansRes.data);
      }
      if (subscriptionRes.success && subscriptionRes.data) {
        setSubscription(subscriptionRes.data);
        setSeatCount(subscriptionRes.data.max_seats);
      }
      if (invoicesRes.success && invoicesRes.data) {
        setInvoices(invoicesRes.data);
      }
    } catch (error) {
      console.error('Failed to fetch subscription data:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load subscription data',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle checkout
  const handleCheckout = async () => {
    if (!selectedPlan) return;
    
    setIsCheckoutLoading(true);
    try {
      const data: CheckoutRequest = {
        plan_id: selectedPlan.id,
        seat_count: seatCount,
        billing_cycle: billingCycle,
        payer_email: payerEmail,
      };

      const response = await subscriptionApi.checkout(data);
      if (response.success && response.data) {
        // Redirect to Xendit payment page
        window.location.href = response.data.payment_url;
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast({
          variant: 'destructive',
          title: 'Checkout Failed',
          description: error.errorDetail.message,
        });
      }
    } finally {
      setIsCheckoutLoading(false);
      setShowCheckoutDialog(false);
    }
  };

  // Handle upgrade
  const handleUpgrade = async () => {
    if (!selectedPlan) return;
    
    setIsCheckoutLoading(true);
    try {
      const response = await subscriptionApi.upgradePlan({
        plan_id: selectedPlan.id,
        seat_count: seatCount,
        payer_email: payerEmail,
      });

      if (response.success && response.data) {
        window.location.href = response.data.payment_url;
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast({
          variant: 'destructive',
          title: 'Upgrade Failed',
          description: error.errorDetail.message,
        });
      }
    } finally {
      setIsCheckoutLoading(false);
      setShowUpgradeDialog(false);
    }
  };

  // Handle change seats
  const handleChangeSeats = async () => {
    setIsCheckoutLoading(true);
    try {
      const response = await subscriptionApi.changeSeats({ seat_count: seatCount });
      
      if (response.success && response.data) {
        if (response.data.invoice?.payment_url) {
          // Needs payment (upsell)
          window.location.href = response.data.invoice.payment_url;
        } else {
          // Downsell - scheduled for next period
          toast({
            title: 'Seat Change Scheduled',
            description: response.data.message,
          });
          fetchData();
        }
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast({
          variant: 'destructive',
          title: 'Failed to Change Seats',
          description: error.errorDetail.message,
        });
      }
    } finally {
      setIsCheckoutLoading(false);
      setShowChangeSeatDialog(false);
    }
  };

  // Handle cancel subscription
  const handleCancelSubscription = async () => {
    setIsCheckoutLoading(true);
    try {
      const response = await subscriptionApi.cancelSubscription({ reason: cancelReason });
      
      if (response.success) {
        toast({
          title: 'Subscription Cancelled',
          description: 'Your subscription will remain active until the end of the current period.',
        });
        fetchData();
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast({
          variant: 'destructive',
          title: 'Cancellation Failed',
          description: error.errorDetail.message,
        });
      }
    } finally {
      setIsCheckoutLoading(false);
      setShowCancelDialog(false);
      setCancelReason('');
    }
  };

  // Handle cancel pending invoice
  const handleCancelInvoice = async () => {
    if (!selectedInvoice) return;
    
    setIsCancellingInvoice(true);
    try {
      const response = await subscriptionApi.cancelPendingInvoice(selectedInvoice.id);
      
      if (response.success) {
        toast({
          title: 'Invoice Cancelled',
          description: 'The pending invoice has been cancelled successfully.',
        });
        fetchData();
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast({
          variant: 'destructive',
          title: 'Cancel Failed',
          description: error.errorDetail.message,
        });
      }
    } finally {
      setIsCancellingInvoice(false);
      setShowCancelInvoiceDialog(false);
      setSelectedInvoice(null);
    }
  };

  // Format currency
  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(num);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
      trial: { variant: 'secondary', icon: <Clock className="w-3 h-3 mr-1" /> },
      active: { variant: 'default', icon: <CheckCircle2 className="w-3 h-3 mr-1" /> },
      past_due: { variant: 'destructive', icon: <AlertCircle className="w-3 h-3 mr-1" /> },
      cancelled: { variant: 'outline', icon: <XCircle className="w-3 h-3 mr-1" /> },
      expired: { variant: 'destructive', icon: <XCircle className="w-3 h-3 mr-1" /> },
      pending: { variant: 'secondary', icon: <Clock className="w-3 h-3 mr-1" /> },
      paid: { variant: 'default', icon: <CheckCircle2 className="w-3 h-3 mr-1" /> },
      failed: { variant: 'destructive', icon: <XCircle className="w-3 h-3 mr-1" /> },
    };

    const config = statusConfig[status] || { variant: 'outline' as const, icon: null };
    
    return (
      <Badge variant={config.variant} className="flex items-center w-fit">
        {config.icon}
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  // Plan icon by tier
  const getPlanIcon = (tierLevel: number) => {
    if (tierLevel >= 3) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (tierLevel >= 2) return <Zap className="w-6 h-6 text-blue-500" />;
    return <Star className="w-6 h-6 text-gray-500" />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscription</h1>
          <p className="text-muted-foreground">
            Manage your subscription plan and billing
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {subscription && (
            <>
              {/* Current Subscription Card */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        Current Subscription
                      </CardTitle>
                      <CardDescription>Your active subscription details</CardDescription>
                    </div>
                    {getStatusBadge(subscription.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {/* Plan */}
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Plan</p>
                      <div className="flex items-center gap-2">
                        {getPlanIcon(subscription.plan.tier_level)}
                        <span className="font-semibold text-lg">{subscription.plan.name}</span>
                      </div>
                    </div>

                    {/* Seats */}
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Seats</p>
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-muted-foreground" />
                        <span className="font-semibold text-lg">
                          {subscription.used_seats} / {subscription.max_seats}
                        </span>
                        {subscription.pending_max_seats && (
                          <Badge variant="outline" className="ml-2">
                            Pending: {subscription.pending_max_seats}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Billing Cycle */}
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Billing Cycle</p>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-muted-foreground" />
                        <span className="font-semibold text-lg capitalize">
                          {subscription.billing_cycle}
                        </span>
                      </div>
                    </div>

                    {/* Period */}
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Current Period</p>
                      <p className="font-semibold">
                        {format(new Date(subscription.current_period_start), 'dd MMM yyyy')} -{' '}
                        {format(new Date(subscription.current_period_end), 'dd MMM yyyy')}
                      </p>
                    </div>
                  </div>

                  {/* Trial Info */}
                  {subscription.status === 'trial' && subscription.trial_ends_at && (
                    <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center gap-2 text-yellow-800">
                        <Clock className="w-5 h-5" />
                        <span>
                          Your trial ends on{' '}
                          <strong>{format(new Date(subscription.trial_ends_at), 'dd MMM yyyy')}</strong>
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Features */}
                  <div className="mt-6">
                    <p className="text-sm text-muted-foreground mb-3">Included Features</p>
                    <div className="flex flex-wrap gap-2">
                      {subscription.features.map((feature) => (
                        <Badge key={feature} variant="secondary" className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowChangeSeatDialog(true)}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Change Seats
                    </Button>
                    
                    {subscription.status !== 'cancelled' && (
                      <Button
                        variant="outline"
                        className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => setShowCancelDialog(true)}
                      >
                        Cancel Subscription
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Pending Plan Change */}
              {subscription.pending_plan && (
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-800">
                      <Sparkles className="w-5 h-5" />
                      Pending Plan Change
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-blue-700">
                      Your plan will change to <strong>{subscription.pending_plan.name}</strong> at the
                      start of your next billing period.
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        {/* Plans Tab */}
        <TabsContent value="plans" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => {
              const isCurrentPlan = subscription?.plan.id === plan.id;
              const canUpgrade = subscription && plan.tier_level > subscription.plan.tier_level;
              const canDowngrade = subscription && plan.tier_level < subscription.plan.tier_level;

              return (
                <Card
                  key={plan.id}
                  className={`relative ${isCurrentPlan ? 'border-primary ring-2 ring-primary' : ''}`}
                >
                  {isCurrentPlan && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary">Current Plan</Badge>
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      {getPlanIcon(plan.tier_level)}
                      <CardTitle>{plan.name}</CardTitle>
                    </div>
                    <CardDescription>
                      <span className="text-2xl font-bold text-foreground">
                        {formatCurrency(plan.price_per_seat)}
                      </span>
                      <span className="text-muted-foreground"> / seat / month</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {plan.max_seats && (
                        <p className="text-sm text-muted-foreground">
                          Up to {plan.max_seats} seats
                        </p>
                      )}
                      <div className="space-y-2">
                        {plan.features.map((feature) => (
                          <div key={feature.code} className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            <span className="text-sm">{feature.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6">
                      {!subscription ? (
                        <Button
                          className="w-full"
                          onClick={() => {
                            setSelectedPlan(plan);
                            setShowCheckoutDialog(true);
                          }}
                        >
                          Get Started
                        </Button>
                      ) : isCurrentPlan ? (
                        <Button variant="outline" className="w-full" disabled>
                          Current Plan
                        </Button>
                      ) : canUpgrade ? (
                        <Button
                          className="w-full"
                          onClick={() => {
                            setSelectedPlan(plan);
                            setShowUpgradeDialog(true);
                          }}
                        >
                          <Zap className="w-4 h-4 mr-2" />
                          Upgrade
                        </Button>
                      ) : canDowngrade ? (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={async () => {
                            try {
                              const res = await subscriptionApi.downgradePlan({ plan_id: plan.id });
                              if (res.success) {
                                toast({
                                  title: 'Downgrade Scheduled',
                                  description: 'Your plan will be changed at the end of current period.',
                                });
                                fetchData();
                              }
                            } catch (error) {
                              if (error instanceof ApiError) {
                                toast({
                                  variant: 'destructive',
                                  title: 'Downgrade Failed',
                                  description: error.errorDetail.message,
                                });
                              }
                            }
                          }}
                        >
                          Downgrade
                        </Button>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoice History</CardTitle>
              <CardDescription>View and manage your billing history</CardDescription>
            </CardHeader>
            <CardContent>
              {invoices.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No invoices yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice ID</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Issue Date</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-mono text-sm">
                          {invoice.id.slice(0, 8)}...
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{invoice.plan_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {invoice.seat_count} seats × {formatCurrency(invoice.price_per_seat)}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(invoice.amount)}
                        </TableCell>
                        <TableCell>
                          {format(new Date(invoice.period_start), 'dd MMM')} -{' '}
                          {format(new Date(invoice.period_end), 'dd MMM yyyy')}
                        </TableCell>
                        <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                        <TableCell>
                          {format(new Date(invoice.issue_date), 'dd MMM yyyy')}
                        </TableCell>
                        <TableCell>
                          {invoice.status === 'pending' && (
                            <div className="flex items-center gap-2">
                              {invoice.payment_url && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => window.open(invoice.payment_url, '_blank')}
                                >
                                  <ExternalLink className="w-4 h-4 mr-1" />
                                  Pay Now
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => {
                                  setSelectedInvoice(invoice);
                                  setShowCancelInvoiceDialog(true);
                                }}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Cancel
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Checkout Dialog */}
      <Dialog open={showCheckoutDialog} onOpenChange={setShowCheckoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Subscribe to {selectedPlan?.name}</DialogTitle>
            <DialogDescription>
              Complete your subscription purchase
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Email for invoice</Label>
              <Input
                type="email"
                value={payerEmail}
                onChange={(e) => setPayerEmail(e.target.value)}
                placeholder="your@email.com"
              />
            </div>
            <div>
              <Label>Number of Seats</Label>
              <Input
                type="number"
                min={1}
                max={selectedPlan?.max_seats || 999}
                value={seatCount}
                onChange={(e) => setSeatCount(parseInt(e.target.value) || 1)}
              />
            </div>
            <div>
              <Label>Billing Cycle</Label>
              <Select value={billingCycle} onValueChange={(v) => setBillingCycle(v as BillingCycle)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly (Save 20%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex justify-between items-center">
                <span>Total</span>
                <span className="text-xl font-bold">
                  {selectedPlan &&
                    formatCurrency(
                      parseFloat(selectedPlan.price_per_seat) *
                        seatCount *
                        (billingCycle === 'yearly' ? 12 * 0.8 : 1)
                    )}
                  <span className="text-sm font-normal text-muted-foreground">
                    /{billingCycle === 'yearly' ? 'year' : 'month'}
                  </span>
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCheckoutDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCheckout} disabled={isCheckoutLoading}>
              {isCheckoutLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Proceed to Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upgrade Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upgrade to {selectedPlan?.name}</DialogTitle>
            <DialogDescription>
              Upgrade your plan for more features
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Email for invoice</Label>
              <Input
                type="email"
                value={payerEmail}
                onChange={(e) => setPayerEmail(e.target.value)}
              />
            </div>
            <div>
              <Label>Number of Seats</Label>
              <Input
                type="number"
                min={subscription?.used_seats || 1}
                value={seatCount}
                onChange={(e) => setSeatCount(parseInt(e.target.value) || 1)}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Minimum: {subscription?.used_seats} (current employees)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpgradeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpgrade} disabled={isCheckoutLoading}>
              {isCheckoutLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Upgrade & Pay
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Seats Dialog */}
      <Dialog open={showChangeSeatDialog} onOpenChange={setShowChangeSeatDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Seat Count</DialogTitle>
            <DialogDescription>
              Adjust the number of seats in your subscription
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Number of Seats</Label>
              <Input
                type="number"
                min={subscription?.used_seats || 1}
                value={seatCount}
                onChange={(e) => setSeatCount(parseInt(e.target.value) || 1)}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Current: {subscription?.max_seats} | Used: {subscription?.used_seats}
              </p>
            </div>
            {seatCount > (subscription?.max_seats || 0) && (
              <div className="p-3 bg-blue-50 rounded-lg text-blue-800 text-sm">
                <p>Adding seats will generate a prorated invoice for the remaining period.</p>
              </div>
            )}
            {seatCount < (subscription?.max_seats || 0) && (
              <div className="p-3 bg-yellow-50 rounded-lg text-yellow-800 text-sm">
                <p>Reducing seats will take effect at the start of your next billing period.</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowChangeSeatDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleChangeSeats}
              disabled={isCheckoutLoading || seatCount === subscription?.max_seats}
            >
              {isCheckoutLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Confirm Change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Subscription Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your subscription?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 rounded-lg text-yellow-800">
              <p className="text-sm">
                Your subscription will remain active until{' '}
                <strong>
                  {subscription && format(new Date(subscription.current_period_end), 'dd MMM yyyy')}
                </strong>
                . After that, you will lose access to premium features.
              </p>
            </div>
            <div>
              <Label>Reason for cancellation (optional)</Label>
              <Input
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Tell us why you're leaving..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Keep Subscription
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelSubscription}
              disabled={isCheckoutLoading}
            >
              {isCheckoutLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Cancel Subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Invoice Dialog */}
      <Dialog open={showCancelInvoiceDialog} onOpenChange={setShowCancelInvoiceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Invoice</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this pending invoice?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedInvoice && (
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Invoice ID:</span>
                  <span className="font-mono">{selectedInvoice.id.slice(0, 12)}...</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Plan:</span>
                  <span className="font-medium">{selectedInvoice.plan_name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-semibold">{formatCurrency(selectedInvoice.amount)}</span>
                </div>
              </div>
            )}
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-yellow-800 dark:text-yellow-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm">
                  Cancelling this invoice will void the payment request. If this invoice is for adding seats or upgrading your plan, those changes will not be applied.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelInvoiceDialog(false)}>
              Keep Invoice
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelInvoice}
              disabled={isCancellingInvoice}
            >
              {isCancellingInvoice && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Cancel Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
