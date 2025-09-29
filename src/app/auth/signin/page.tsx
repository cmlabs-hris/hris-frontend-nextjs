import SignInForm from "@/components/auth/SignInForm";

/**
 * Halaman Sign In (Login).
 * File ini berfungsi sebagai "entry point" untuk rute /auth/signin.
 * Logika utama dan tampilan form di-handle oleh komponen <SignInForm />
 * untuk menjaga halaman ini tetap bersih dan fokus pada layout.
 */
export default function SignInPage() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-50">
      <SignInForm />
    </main>
  );
}