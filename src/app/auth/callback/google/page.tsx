'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { setAccessToken } from '@/lib/api';
import AnimatedBubbles from '@/components/auth/AnimatedBubbles';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function GoogleCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        const handleCallback = async () => {
            try {
                if (!searchParams) {
                    setStatus('error');
                    setErrorMessage('Invalid callback parameters');
                    return;
                }

                // Check for error in URL params (e.g., user denied access)
                const error = searchParams.get('error');
                if (error) {
                    setStatus('error');
                    setErrorMessage(error === 'access_denied' 
                        ? 'Google access was denied. Please try again.' 
                        : error === 'missing_params'
                        ? 'Missing authentication parameters. Please try again.'
                        : error === 'state_cookie_not_found'
                        ? 'Session expired. Please try again.'
                        : error === 'state_mismatch'
                        ? 'Security validation failed. Please try again.'
                        : `Authentication failed: ${error}`
                    );
                    return;
                }

                // Check if we have access_token from backend redirect
                const accessToken = searchParams.get('access_token');
                const expiresIn = searchParams.get('expires_in');
                
                if (accessToken && expiresIn) {
                    // Save access token
                    setAccessToken(accessToken, parseInt(expiresIn, 10));
                    
                    setStatus('success');
                    
                    // Parse JWT to check if user has company
                    const payload = JSON.parse(atob(accessToken.split('.')[1]));
                    
                    // Redirect based on user state
                    setTimeout(() => {
                        if (payload.company_id) {
                            router.push('/dashboard');
                        } else {
                            router.push('/auth/choose-role');
                        }
                    }, 1000);
                    return;
                }

                // Check if we have token_data from Next.js API route redirect (alternative flow)
                const tokenDataParam = searchParams.get('token_data');
                if (tokenDataParam) {
                    try {
                        const tokenData = JSON.parse(decodeURIComponent(tokenDataParam));
                        
                        // Save access token
                        setAccessToken(tokenData.access_token, tokenData.access_token_expires_in);
                        
                        setStatus('success');
                        
                        // Parse JWT to check if user has company
                        const payload = JSON.parse(atob(tokenData.access_token.split('.')[1]));
                        
                        // Redirect based on user state
                        setTimeout(() => {
                            if (payload.company_id) {
                                router.push('/dashboard');
                            } else {
                                router.push('/auth/choose-role');
                            }
                        }, 1000);
                        return;
                    } catch (parseError) {
                        console.error('Failed to parse token data:', parseError);
                        setStatus('error');
                        setErrorMessage('Invalid token data received');
                        return;
                    }
                }

                // No valid parameters found
                setStatus('error');
                setErrorMessage('Invalid callback parameters. Please try signing in again.');
            } catch (err) {
                console.error('Google callback error:', err);
                setStatus('error');
                setErrorMessage('Failed to complete authentication. Please try again.');
            }
        };

        handleCallback();
    }, [searchParams, router]);

    return (
        <Card className="w-full max-w-md shadow-2xl">
            <CardHeader className="text-center">
                {status === 'loading' && (
                    <>
                        <div className="mx-auto mb-4">
                            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                        </div>
                        <CardTitle className="text-2xl font-bold">Signing you in...</CardTitle>
                        <CardDescription>
                            Please wait while we complete your Google authentication.
                        </CardDescription>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="mx-auto bg-green-100 rounded-full p-3 w-fit mb-4">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-green-600">Success!</CardTitle>
                        <CardDescription>
                            Authentication successful. Redirecting you now...
                        </CardDescription>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="mx-auto bg-red-100 rounded-full p-3 w-fit mb-4">
                            <XCircle className="h-8 w-8 text-red-600" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-red-600">Authentication Failed</CardTitle>
                        <CardDescription className="text-red-500">
                            {errorMessage}
                        </CardDescription>
                    </>
                )}
            </CardHeader>

            {status === 'error' && (
                <CardContent className="flex flex-col gap-4">
                    <Button asChild className="w-full bg-[#1E3A5F] hover:bg-slate-700">
                        <Link href="/auth">Back to Login</Link>
                    </Button>
                </CardContent>
            )}
        </Card>
    );
}

export default function GoogleCallbackPage() {
    return (
        <main className="relative flex items-center justify-center min-h-screen bg-[#3B82F6] overflow-hidden p-4">
            <div className="absolute inset-0 bg-gradient-to-br from-[#3B82F6] to-[#1E40AF] -z-20" />
            <AnimatedBubbles />
            
            <Suspense fallback={
                <Card className="w-full max-w-md shadow-2xl">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4">
                            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                        </div>
                        <CardTitle className="text-2xl font-bold">Loading...</CardTitle>
                    </CardHeader>
                </Card>
            }>
                <GoogleCallbackContent />
            </Suspense>
        </main>
    );
}
