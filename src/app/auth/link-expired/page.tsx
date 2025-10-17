'use client';

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AnimatedBubbles from '@/components/auth/AnimatedBubbles';
import { ArrowLeft } from 'lucide-react';

const Illustration404 = () => (
    <svg width="100" height="80" viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-6">
        <rect width="100" height="70" rx="8" fill="#E2E8F0"/>
        <rect x="8" y="8" width="84" height="8" rx="2" fill="#94A3B8"/>
        <circle cx="14" cy="12" r="2" fill="white"/>
        <circle cx="20" cy="12" r="2" fill="white"/>
        <circle cx="26" cy="12" r="2" fill="white"/>
        <path d="M30 40L40 30L50 40L60 30L70 40" stroke="#F87171" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M30 50L40 60L50 50L60 60L70 50" stroke="#F87171" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="25" y="25" width="50" height="40" rx="4" fill="#F1F5F9" fillOpacity="0.5"/>
        <text x="50" y="55" textAnchor="middle" fontSize="32" fontWeight="bold" fill="#3B82F6">404</text>
    </svg>
);


export default function LinkExpiredPage() {
  return (
    <main className="relative flex items-center justify-center min-h-screen bg-[#3B82F6] overflow-hidden p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-[#3B82F6] to-[#1E40AF] -z-20" />
      <AnimatedBubbles />
      
      <Card className="w-full max-w-md shadow-2xl text-center">
        <CardHeader>
          <Illustration404 />
          <CardTitle className="text-2xl font-bold">Link Expired</CardTitle>
          <CardDescription className="px-4">
            The password reset link has expired. Please request a new link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full bg-[#1E3A5F] hover:bg-slate-700 text-white font-semibold py-6">
            <Link href="/auth">
              Back to login
            </Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
