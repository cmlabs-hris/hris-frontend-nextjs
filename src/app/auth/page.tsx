'use client';

import AuthenticationUI from "../../components/auth/AuthenticationUI";

// Komponen untuk latar belakang ombak animasi
const WaveBackground = () => (
  <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
    <svg className="absolute bottom-0 left-0 w-full h-auto" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
      <path fill="#a0c4ff" fillOpacity="0.7" d="M0,224L48,213.3C96,203,192,181,288,186.7C384,192,480,224,576,245.3C672,267,768,277,864,256C960,235,1056,181,1152,165.3C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
    </svg>
    <style jsx global>{`
      @keyframes wave-animation {
        0% { transform: translateX(0); }
        50% { transform: translateX(-5%); }
        100% { transform: translateX(0); }
      }
      .wave-animation {
        animation: wave-animation 10s ease-in-out infinite;
      }
    `}</style>
    <svg className="absolute bottom-0 left-0 w-full h-auto wave-animation" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
        <path fill="#4A90E2" fillOpacity="0.6" d="M0,160L48,176C96,192,192,224,288,218.7C384,213,480,171,576,149.3C672,128,768,128,864,144C960,160,1056,192,1152,197.3C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
    </svg>
  </div>
);

// Halaman utama yang merender latar belakang dan komponen UI
export default function AuthPage() {
  return (
    <main className="relative flex items-center justify-center min-h-screen w-full bg-gradient-to-br from-blue-300 via-blue-400 to-blue-500 overflow-hidden">
      <WaveBackground />
      <AuthenticationUI />
    </main>
  );
}

