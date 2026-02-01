'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AnimatedBubbles from '@/components/auth/AnimatedBubbles';
import { ArrowLeft, Lock, Loader2, CheckCircle, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { authApi, ApiError } from '@/lib/api';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get('token') ?? null;
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isInvalidToken, setIsInvalidToken] = useState(false);

  // Check if token exists
  useEffect(() => {
    if (!token) {
      setIsInvalidToken(true);
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password length
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.resetPassword({
        token: token!,
        password,
        confirm_password: confirmPassword,
      });

      if (response.success) {
        setIsSuccess(true);
      } else {
        setError(response.message || 'Failed to reset password');
      }
    } catch (err) {
      if (err instanceof ApiError) {
        const errorCode = err.errorDetail?.code;
        if (errorCode === 'TOKEN_EXPIRED' || errorCode === 'INVALID_TOKEN' || errorCode === 'TOKEN_USED') {
          setIsInvalidToken(true);
        } else {
          setError(err.errorDetail?.message || err.message || 'Failed to reset password');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Invalid or expired token view
  if (isInvalidToken) {
    return (
      <main className="relative flex items-center justify-center min-h-screen bg-[#3B82F6] overflow-hidden p-4">
        <div className="absolute inset-0 bg-gradient-to-br from-[#3B82F6] to-[#1E40AF] -z-20" />
        <AnimatedBubbles />
        
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto bg-red-100 rounded-full p-3 w-fit mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Invalid or Expired Link</CardTitle>
            <CardDescription className="px-4">
              This password reset link is invalid or has expired. Please request a new password reset link.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button 
              asChild 
              className="w-full bg-[#1E3A5F] hover:bg-slate-700 text-white font-semibold py-6"
            >
              <Link href="/auth/forgot-password">REQUEST NEW LINK</Link>
            </Button>
            <div className="text-center">
              <Link href="/auth" className="text-sm font-medium text-slate-600 hover:text-slate-900 inline-flex items-center gap-1">
                <ArrowLeft size={16} />
                Back to login
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  // Success view
  if (isSuccess) {
    return (
      <main className="relative flex items-center justify-center min-h-screen bg-[#3B82F6] overflow-hidden p-4">
        <div className="absolute inset-0 bg-gradient-to-br from-[#3B82F6] to-[#1E40AF] -z-20" />
        <AnimatedBubbles />
        
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto bg-green-100 rounded-full p-3 w-fit mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Password Reset Successful!</CardTitle>
            <CardDescription className="px-4">
              Your password has been successfully reset. You can now log in with your new password.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button 
              onClick={() => router.push('/auth')}
              className="w-full bg-[#1E3A5F] hover:bg-slate-700 text-white font-semibold py-6"
            >
              GO TO LOGIN
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  // Reset password form
  return (
    <main className="relative flex items-center justify-center min-h-screen bg-[#3B82F6] overflow-hidden p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-[#3B82F6] to-[#1E40AF] -z-20" />
      <AnimatedBubbles />
      
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-blue-100 rounded-full p-3 w-fit mb-4">
            <Lock className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Reset Your Password</CardTitle>
          <CardDescription>
            Please enter your new password below. Make sure it&apos;s at least 8 characters long.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Password requirements */}
            <div className="text-xs text-slate-500 space-y-1">
              <p className={password.length >= 8 ? 'text-green-600' : ''}>
                • At least 8 characters
              </p>
              <p className={password === confirmPassword && confirmPassword.length > 0 ? 'text-green-600' : ''}>
                • Passwords match
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-[#1E3A5F] hover:bg-slate-700 text-white font-semibold py-6"
              disabled={isLoading || password.length < 8 || password !== confirmPassword}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  RESETTING...
                </>
              ) : (
                'RESET PASSWORD'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/auth" className="text-sm font-medium text-slate-600 hover:text-slate-900 inline-flex items-center gap-1">
              <ArrowLeft size={16} />
              Back to login
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <main className="relative flex items-center justify-center min-h-screen bg-[#3B82F6] overflow-hidden p-4">
        <div className="absolute inset-0 bg-gradient-to-br from-[#3B82F6] to-[#1E40AF] -z-20" />
        <Card className="w-full max-w-md shadow-2xl">
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </main>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
