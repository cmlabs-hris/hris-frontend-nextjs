'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { XCircle, ArrowRight, RefreshCcw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function FailedContent() {
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(10);

  // Auto redirect to subscription page
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = '/subscription';
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="mx-auto mb-4 w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-800">Payment Failed</CardTitle>
          <CardDescription className="text-red-700">
            We couldn&apos;t process your payment. Please try again or contact support.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm text-red-800">
              Your payment was not completed. No charges have been made to your account. 
              Please check your payment details and try again.
            </p>
          </div>

          <div className="space-y-3">
            <Link href="/subscription">
              <Button className="w-full bg-red-600 hover:bg-red-700">
                <RefreshCcw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" className="w-full">
                Back to Dashboard
              </Button>
            </Link>
          </div>

          <div className="text-sm text-muted-foreground space-y-2">
            <p>Common reasons for payment failure:</p>
            <ul className="text-left list-disc list-inside space-y-1">
              <li>Insufficient funds</li>
              <li>Card declined by bank</li>
              <li>Network timeout</li>
              <li>Invalid card details</li>
            </ul>
          </div>

          <p className="text-sm text-muted-foreground">
            Redirecting to subscription page in {countdown} seconds...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SubscriptionFailedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-red-600" />
          </CardContent>
        </Card>
      </div>
    }>
      <FailedContent />
    </Suspense>
  );
}
