'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleGoToSubscription = () => {
    setIsNavigating(true);
    // Using window.location to force full page reload and refresh auth
    window.location.href = '/subscription';
  };

  const handleGoToDashboard = () => {
    setIsNavigating(true);
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="mx-auto mb-4 w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-800">
            Payment Successful!
          </CardTitle>
          <CardDescription className="text-green-700">
            Thank you for your subscription. Your payment has been processed successfully.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-800">
              Your subscription is now active. You can start using all premium features immediately.
            </p>
          </div>

          <div className="space-y-3">
            <Button 
              className="w-full bg-green-600 hover:bg-green-700" 
              disabled={isNavigating}
              onClick={handleGoToSubscription}
            >
              {isNavigating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Redirecting...
                </>
              ) : (
                <>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Subscription
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              disabled={isNavigating}
              onClick={handleGoToDashboard}
            >
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-green-600" />
          </CardContent>
        </Card>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
