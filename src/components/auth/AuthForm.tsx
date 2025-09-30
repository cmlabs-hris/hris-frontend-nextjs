// src/components/auth/AuthForm.tsx
'use client';

import { useState } from 'react';

// Aset SVG untuk ikon (tetap sama)
const HrisLogo = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#0F172A]">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);
const GoogleLogo = () => (
    <svg className="w-5 h-5" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.42-4.55H24v8.51h12.8c-.57 2.65-2.07 4.92-4.21 6.48l7.98 6.19c4.7-4.28 7.43-10.74 7.43-18.63z"></path>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.98-6.19c-2.11 1.45-4.8 2.3-7.91 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
        <path fill="none" d="M0 0h48v48H0z"></path>
    </svg>
);


export default function AuthForm() {
    const [isSignUp, setIsSignUp] = useState(false);

    return (
        <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden" style={{ minHeight: '650px' }}>
            
            {/* Container untuk Form Sign Up (Kanan) */}
            <div className={`absolute top-0 h-full w-1/2 right-0 flex flex-col justify-center p-8 md:p-12 transition-all duration-700 ease-in-out ${isSignUp ? 'translate-x-0 opacity-100 z-20' : 'translate-x-full opacity-0 z-10 pointer-events-none'}`}>
                <SignUpContent />
            </div>
            
            {/* Container untuk Form Sign In (Kiri) */}
            <div className={`absolute top-0 h-full w-1/2 left-0 flex flex-col justify-center p-8 md:p-12 transition-all duration-700 ease-in-out ${isSignUp ? '-translate-x-full opacity-0 z-10 pointer-events-none' : 'translate-x-0 opacity-100 z-20'}`}>
                <SignInContent />
            </div>

            {/* Container untuk Panel Overlay yang Bergerak */}
            <div className={`absolute top-0 h-full w-1/2 right-0 bg-blue-700 text-white flex flex-col items-center justify-center text-center p-12 transition-all duration-700 ease-in-out z-30 ${isSignUp ? '-translate-x-full' : 'translate-x-0'}`}>
                {isSignUp ? (
                    <div>
                        <h2 className="text-3xl font-bold">Hello, Friend!</h2>
                        <p className="mt-4">Enter your personal details and start your journey with us</p>
                        <button onClick={() => setIsSignUp(false)} className="mt-8 px-6 py-2 border-2 border-white rounded-full font-semibold hover:bg-white hover:text-blue-700 transition-colors">
                            SIGN IN
                        </button>
                    </div>
                ) : (
                    <div>
                        <h2 className="text-3xl font-bold">Welcome Back!</h2>
                        <p className="mt-4">To keep connected with us please login with your personal info</p>
                         <button onClick={() => setIsSignUp(true)} className="mt-8 px-6 py-2 border-2 border-white rounded-full font-semibold hover:bg-white hover:text-blue-700 transition-colors">
                            SIGN UP
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// Komponen terpisah untuk konten Sign In
const SignInContent = () => (
    <>
        <div className="flex items-center mb-6 self-start">
            <HrisLogo />
            <span className="ml-2 text-xl font-bold text-gray-800">HRIS</span>
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900">Sign In</h2>
        <p className="mt-2 text-sm text-gray-500">Welcome back to HRIS Manage everything with ease.</p>
        <form className="mt-8 space-y-6 w-full" onSubmit={(e) => { e.preventDefault(); console.log('Sign In Submitted'); }}>
            <div>
                <label htmlFor="email-address" className="text-sm font-medium text-gray-700">Email or Phone Number</label>
                <input id="email-address" name="email" type="email" required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Enter your email or phone number" />
            </div>
            <div>
                <label htmlFor="password-in" className="text-sm font-medium text-gray-700">Password</label>
                <input id="password-in" name="password" type="password" required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Enter your password" />
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">Remember Me</label>
                </div>
                <div className="text-sm">
                    <a href="#" className="font-medium text-blue-600 hover:text-blue-500">Forgot password?</a>
                </div>
            </div>
            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">SIGN IN</button>
            <button type="button" className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"><GoogleLogo /> <span className="ml-2">Sign in with Google</span></button>
            <button type="button" className="w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">Sign in with ID Employee</button>
        </form>
    </>
);


// Komponen terpisah untuk konten Sign Up
const SignUpContent = () => {
    // Menambahkan state untuk setiap input
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    // Fungsi untuk menangani submit form
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validasi sederhana
        if (password !== confirmPassword) {
            alert("Password dan Konfirmasi Password tidak cocok!");
            return;
        }
        if (!agreedToTerms) {
            alert("Anda harus menyetujui syarat dan ketentuan penggunaan.");
            return;
        }

        // TODO: Implementasi logika pendaftaran dengan backend (Laravel)
        console.log('Mencoba mendaftar dengan data:', {
            firstName,
            lastName,
            email,
            password,
        });
        alert('Pendaftaran berhasil! (Silakan cek data di console browser)');
    };

     return (
     <>
        <div className="flex items-center mb-6 self-start">
            <HrisLogo />
            <span className="ml-2 text-xl font-bold text-gray-800">HRIS</span>
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900">Sign Up</h2>
        <p className="mt-2 text-sm text-gray-500">Create your account and streamline your employee management.</p>
        
        {/* Menghubungkan fungsi handleSubmit ke form */}
        <form className="mt-8 space-y-2 w-full" onSubmit={handleSubmit}>
            <div className="flex space-x-4">
                <div className="w-1/2">
                    <label htmlFor="first-name" className="text-sm font-medium text-gray-700">First Name</label>
                    <input id="first-name" required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Enter your first name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </div>
                <div className="w-1/2">
                    <label htmlFor="last-name" className="text-sm font-medium text-gray-700">Last Name</label>
                    <input id="last-name" required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Enter your last name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
            </div>
            <div>
                <label htmlFor="email-up" className="text-sm font-medium text-gray-700">Email</label>
                <input id="email-up" type="email" required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
                <label htmlFor="password-up" className="text-sm font-medium text-gray-700">Password</label>
                <input id="password-up" type="password" required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
             <div>
                <label htmlFor="confirm-password" className="text-sm font-medium text-gray-700">Confirm Password</label>
                <input id="confirm-password" type="password" required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Enter confirm password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
             <div className="flex items-center">
                <input id="terms" type="checkbox" className="h-4 w-4 text-blue-600 border-gray-300 rounded" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">I agree with the terms of use of HRIS</label>
            </div>
            <button type="submit" className="w-full flex justify-center py-2 px-4 border rounded-md text-white bg-gray-800 hover:bg-gray-900">SIGN UP</button>
            <button type="button" className="w-full flex justify-center items-center py-2 px-4 border rounded-md text-gray-700 bg-white hover:bg-gray-50"><GoogleLogo /> <span className="ml-2">Sign up with Google</span></button>
        </form>
    </>
    );
};

