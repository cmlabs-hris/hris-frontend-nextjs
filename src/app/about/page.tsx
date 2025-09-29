export default function AboutPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-24">
      <div className="max-w-4xl w-full">
        <h1 className="text-4xl font-bold mb-6 text-center">
          Tentang Kami
        </h1>
        <p className="text-lg text-gray-700 leading-relaxed">
          Selamat datang di halaman "Tentang Kami"! Aplikasi ini dibuat menggunakan Next.js dengan App Router terbaru.
          Kami berdedikasi untuk memberikan pengalaman pengguna terbaik dengan teknologi web modern.
        </p>
        <p className="mt-4 text-lg text-gray-700 leading-relaxed">
          Di sini, Anda dapat mempelajari lebih lanjut tentang misi, visi, dan tim di balik proyek ini.
          Struktur file yang Anda lihat diorganisir untuk skalabilitas dan kemudahan perawatan.
        </p>
      </div>
    </main>
  );
}