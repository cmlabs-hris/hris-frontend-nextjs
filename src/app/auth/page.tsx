'use client'

import AuthenticationUI from '@/components/auth/AuthenticationUI';
import AnimatedBubbles from '@/components/auth/AnimatedBubbles';

export default function AuthPage() {
  return (
    // Container utama dengan posisi relative untuk menampung bubble
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden p-4">
      {/* Latar belakang gradasi biru */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#3B82F6] to-[#1E40AF] -z-20" />
      
      {/* Komponen bubble yang sekarang akan terlihat */}
      <AnimatedBubbles />
      
      {/* Komponen UI utama */}
      <AuthenticationUI />
    </div>
  );
}

