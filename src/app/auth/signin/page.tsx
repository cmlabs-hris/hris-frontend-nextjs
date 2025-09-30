'use client';

import AuthForm from "@/components/auth/AuthForm";

/**
 * Halaman Autentikasi Utama.
 * Sekarang halaman ini berfungsi sebagai container untuk komponen <AuthForm />
 * yang akan menangani logika untuk menampilkan Sign In dan Sign Up.
 * Latar belakang gradasi biru ditempatkan di sini.
 */
export default function AuthenticationPage() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-400 to-blue-600 p-4 overflow-hidden relative">
      {/* Komponen Latar Belakang Ombak Animasi */}
      <WaveBackground />
      {/* Komponen Form yang sekarang menangani Sign In dan Sign Up */}
      <AuthForm />
    </main>
  );
}

/**
 * Komponen untuk membuat latar belakang ombak bergelombang dengan animasi.
 * Menggunakan SVG inline dan animasi CSS untuk efek yang mulus dan ringan.
 */
const WaveBackground = () => (
  <div className="absolute top-0 left-0 w-full h-full z-0">
    <svg
      className="absolute bottom-0 left-0 w-full h-auto"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1440 320"
    >
      <path
        fill="rgba(255,255,255,0.1)"
        fillOpacity="1"
        d="M0,160L48,181.3C96,203,192,245,288,240C384,235,480,181,576,149.3C672,117,768,107,864,122.7C960,139,1056,181,1152,186.7C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
      ></path>
    </svg>
    <svg
      className="absolute bottom-0 left-0 w-full h-auto"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1440 320"
      style={{ animation: 'wave-animation 15s linear infinite alternate' }}
    >
      <path
        fill="rgba(255,255,255,0.2)"
        fillOpacity="1"
        d="M0,224L48,213.3C96,203,192,181,288,186.7C384,192,480,224,576,245.3C672,267,768,277,864,261.3C960,245,1056,203,1152,192C1248,181,1344,203,1392,213.3L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
      ></path>
    </svg>
     <style jsx global>{`
      @keyframes wave-animation {
        0% { transform: translateX(0); }
        100% { transform: translateX(-200px); }
      }
    `}</style>
  </div>
);