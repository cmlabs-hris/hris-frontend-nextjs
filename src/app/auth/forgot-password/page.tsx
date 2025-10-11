'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AnimatedBubbles from '@/components/auth/AnimatedBubbles';
import { ArrowLeft, Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement logic to send reset link to backend
    console.log('Sending reset link to:', email);
    setEmailSent(true); // Ganti tampilan setelah email dikirim
  };

  return (
    <main className="relative flex items-center justify-center min-h-screen bg-[#3B82F6] overflow-hidden p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-[#3B82F6] to-[#1E40AF] -z-20" />
      <AnimatedBubbles />
      
      <Card className="w-full max-w-md shadow-2xl">
        {/* Tampilkan konten berdasarkan state 'emailSent' */}
        {emailSent ? (
          // Tampilan "Check Your Email"
          <div>
            <CardHeader className="text-center">
              <div className="mx-auto bg-blue-100 rounded-full p-3 w-fit mb-4">
                <Mail className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
              <CardDescription className="px-4">
                We sent a password reset link to <span className="font-semibold text-slate-800">{email}</span> which is valid for 24 hours. Please check your inbox!
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Button asChild className="w-full bg-[#1E3A5F] hover:bg-slate-700 text-white font-semibold py-6">
                <a href="https://mail.google.com" target="_blank" rel="noopener noreferrer">OPEN GMAIL</a>
              </Button>
              <p className="text-center text-sm text-slate-500">
                Didn't receive the email? <button onClick={() => handleSubmit(new Event('submit') as any)} className="font-semibold text-blue-600 hover:underline">Click here to resend</button>
              </p>
               <div className="mt-4 text-center">
                <Link href="/auth" className="text-sm font-medium text-slate-600 hover:text-slate-900 inline-flex items-center gap-1">
                  <ArrowLeft size={16} />
                  Back to log in
                </Link>
              </div>
            </CardContent>
          </div>
        ) : (
          // Tampilan Awal "Forgot Password"
          <div>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
              <CardDescription>
                No worries! Enter your email address below, and we'll send you a link to reset your password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email-forgot">Email</Label>
                  <Input
                    id="email-forgot"
                    type="email"
                    placeholder="Enter your email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full bg-[#1E3A5F] hover:bg-slate-700 text-white font-semibold py-6">
                  SEND RESET LINK
                </Button>
              </form>
              <div className="mt-6 text-center">
                <Link href="/auth" className="text-sm font-medium text-slate-600 hover:text-slate-900 inline-flex items-center gap-1">
                  <ArrowLeft size={16} />
                  Back to login
                </Link>
              </div>
            </CardContent>
          </div>
        )}
      </Card>
    </main>
  );
}

