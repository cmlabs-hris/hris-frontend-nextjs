'use client'

import AuthenticationUI from '@/components/auth/AuthenticationUI';
import AnimatedBubbles from '@/components/auth/AnimatedBubbles';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AuthPage() {
  return (
    // Container utama dengan posisi relative untuk menampung bubble
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden p-4">
      {/* Latar belakang gradasi biru */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#3B82F6] to-[#1E40AF] -z-20" />
      
      {/* Back to Landing Page Button */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 z-10 flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-white/10 hover:bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back to Home</span>
      </Link>
      
      {/* Komponen bubble yang sekarang akan terlihat */}
      <AnimatedBubbles />
      
      {/* Komponen UI utama */}
      <AuthenticationUI />
    </div>
  );
}

