'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';


const HrisLogo = () => (
    <div className="flex items-center gap-2">
        <Image
            src="/logo.png" // Ganti dengan path logo Anda
            alt="HRIS Logo"
            width={100} // Sesuaikan lebar logo Anda
            height={28} // Sesuaikan tinggi logo Anda
            priority
        />
    </div>
);

const SignInForm = () => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        login(email);
    };

    return (
        <div className="p-8 md:p-12 flex flex-col justify-center h-full">
            <div className="self-end"><HrisLogo /></div>
            <div className="mt-auto">
                <h2 className="text-3xl font-bold text-slate-800 mb-10">Sign In</h2>
                <p className="text-slate-500 mt-2 mb-10">Welcome back to HRIS. Manage everything with ease.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <Label htmlFor="email-signin">Email or Phone Number</Label>
                        <Input id="email-signin" type="email" placeholder="Enter your email or phone number" required value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="password-signin">Password</Label>
                        <Input id="password-signin" type="password" placeholder="Enter your password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2"><Checkbox id="remember-me" /><Label htmlFor="remember-me">Remember Me</Label></div>
                        <Link href="/auth/forgot-password" className="font-medium text-blue-600 hover:underline">Forgot password?</Link>
                    </div>
                    <Button type="submit" className="w-full bg-[#1E3A5F] hover:bg-slate-700 text-white font-semibold py-6">SIGN IN</Button>
                    <div className="relative my-2"><div className="absolute inset-0 flex items-center"><span className="w-full border-t"></span></div></div>
                    <Button variant="outline" className="w-full py-6">Sign in with Google</Button>
                    <Button variant="outline" className="w-full py-6">Sign in with ID Employee</Button>
                     {/* <p className="text-center text-sm text-slate-500 pt-2">
                        Don't have an account yet?{' '}
                        <Button className="bg-transparent text-white hover:bg-white hover:text-slate-800 font-semibold"></Button>
                    </p> */}
                </form>
            </div>
        </div>
    );
};

const SignUpForm = () => {
    const router = useRouter();
    const handleSignUp = (e: React.FormEvent) => {
        e.preventDefault();
        router.push('/auth/choose-role');
    };
    return (
        <div className="p-8 md:p-12 flex flex-col justify-center h-full">
            <div className="self-start"><HrisLogo /></div>
             <div className="mt-auto">
                <h2 className="text-3xl font-bold text-slate-800 mb-10">Sign Up</h2>
                <p className="text-slate-500 mt-2 mb-10">Create your account and streamline your employee management.</p>
                <form onSubmit={handleSignUp} className="space-y-4">
                    {/* <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1"><Label htmlFor="first-name">First Name</Label><Input id="first-name" placeholder="Enter your first name" required /></div>
                        <div className="space-y-1"><Label htmlFor="last-name">Last Name</Label><Input id="last-name" placeholder="Enter your last name" required /></div>
                    </div> */}
                    <div className="space-y-1"><Label htmlFor="email-signup">Email</Label><Input id="email-signup" type="email" placeholder="Enter email" required /></div>
                    <div className="space-y-1"><Label htmlFor="password-signup">Password</Label><Input id="password-signup" type="password" placeholder="Enter password" required /></div>
                    <div className="space-y-1"><Label htmlFor="confirm-password">Confirm Password</Label><Input id="confirm-password" type="password" placeholder="Enter confirm password" required /></div>
                    <div className="flex items-center gap-2"><Checkbox id="terms" /><Label htmlFor="terms" className="text-sm text-muted-foreground">I agree with the terms of use of HRIS</Label></div>
                    <Button type="submit" className="w-full bg-[#1E3A5F] hover:bg-slate-700 text-white font-semibold py-6">SIGN UP</Button>
                    <Button variant="outline" className="w-full py-6">Sign up with Google</Button>
                     {/* <p className="text-center text-sm text-slate-500 pt-2">
                        Already have an account?{' '}
                        <Button className="bg-transparent text-white hover:bg-white hover:text-slate-800 font-semibold"><span className="font-semibold text-blue-600 cursor-pointer">Sign in here</span></Button>
                    </p> */}
                </form>
            </div>
        </div>
    );
};

export default function AuthenticationUI() {
    const [isSignUp, setIsSignUp] = useState(false);

    return (
        <div className="relative w-full max-w-5xl min-h-[750px] bg-white rounded-2xl shadow-2xl overflow-hidden flex">
            
            {/*Form Sign Up */}
            <div className="w-1/2 flex-shrink-0">
                <SignUpForm />
            </div>

            {/* Form Sign In */}
            <div className="w-1/2 flex-shrink-0">
                <SignInForm />
            </div>

            {/* Panel Overlay*/}
            <div className={cn(
                "absolute top-0 left-0 h-full w-1/2 bg-[#1E3A5F] text-white",
                "transition-transform duration-700 ease-in-out",
                isSignUp ? "translate-x-full" : "translate-x-0"
            )}>
                {/* Konten overlay */}
                <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center">
                    {/* Tampilkan konten berdasarkan state isSignUp */}
                    {isSignUp ? (
                        <div>
                            <h2 className="text-3xl font-bold mb-4">Already Have an Account?</h2>
                            <p className="mb-8 px-4">Sign in to access your dashboard and continue your work.</p>
                            <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-slate-800 font-semibold" onClick={() => setIsSignUp(false)}>
                                SIGN IN
                            </Button>
                        </div>
                    ) : (
                        // Konten saat panel berada di atas Sign Up
                        <div>
                            <h2 className="text-3xl font-bold mb-4">New Here?</h2>
                            <p className="mb-8 px-4">Sign up to get started and manage everything with ease!</p>
                            <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-slate-800 font-semibold" onClick={() => setIsSignUp(true)}>
                                SIGN UP
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

