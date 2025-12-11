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
import { Loader2 } from 'lucide-react';
import { authApi } from '@/lib/api';


const HrisLogo = () => (
    <div className="flex items-center gap-2">
        <Image
            src="/logo.png" 
            alt="HRIS Logo"
            width={100} 
            height={28} 
            priority
        />
    </div>
);

const SignInForm = () => {
    const { login, loginWithEmployeeCode, loginWithGoogle, isLoading, error, clearError } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showEmployeeLogin, setShowEmployeeLogin] = useState(false);
    const [companyUsername, setCompanyUsername] = useState('');
    const [employeeCode, setEmployeeCode] = useState('');
    const [localError, setLocalError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();
        setLocalError(null);
        try {
            await login({ email, password });
        } catch {
            // Error handled by AuthContext
        }
    };

    const handleEmployeeLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();
        setLocalError(null);
        try {
            await loginWithEmployeeCode({
                company_username: companyUsername,
                employee_code: employeeCode,
                password,
            });
        } catch {
            // Error handled by AuthContext
        }
    };

    const handleGoogleSignIn = () => {
        loginWithGoogle();
    };

    return (
        <div className="p-8 md:p-12 flex flex-col justify-center h-full">
            <div className="self-end"><HrisLogo /></div>
            <div className="mt-auto">
                <h2 className="text-3xl font-bold text-slate-800 mb-10">Sign In</h2>
                <p className="text-slate-500 mt-2 mb-10">Welcome back to HRIS. Manage everything with ease.</p>
                
                {(error || localError) && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                        {error || localError}
                    </div>
                )}

                {!showEmployeeLogin ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <Label htmlFor="email-signin">Email</Label>
                            <Input 
                                id="email-signin" 
                                type="email" 
                                placeholder="Enter your email" 
                                required 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="password-signin">Password</Label>
                            <Input 
                                id="password-signin" 
                                type="password" 
                                placeholder="Enter your password" 
                                required 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                disabled={isLoading}
                            />
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <Checkbox id="remember-me" />
                                <Label htmlFor="remember-me">Remember Me</Label>
                            </div>
                            <Link href="/auth/forgot-password" className="font-medium text-blue-600 hover:underline">
                                Forgot password?
                            </Link>
                        </div>
                        <Button 
                            type="submit" 
                            className="w-full bg-[#1E3A5F] hover:bg-slate-700 text-white font-semibold py-6"
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            SIGN IN
                        </Button>
                        <div className="relative my-2">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t"></span>
                            </div>
                        </div>
                        <Button 
                            type="button"
                            variant="outline" 
                            className="w-full py-6"
                            onClick={handleGoogleSignIn}
                            disabled={isLoading}
                        >
                            Sign in with Google
                        </Button>
                        <Button 
                            type="button"
                            variant="outline" 
                            className="w-full py-6"
                            onClick={() => setShowEmployeeLogin(true)}
                            disabled={isLoading}
                        >
                            Sign in with Employee ID
                        </Button>
                    </form>
                ) : (
                    <form onSubmit={handleEmployeeLogin} className="space-y-4">
                        <div className="space-y-1">
                            <Label htmlFor="company-username">Company Username</Label>
                            <Input 
                                id="company-username" 
                                type="text" 
                                placeholder="Enter company username" 
                                required 
                                value={companyUsername} 
                                onChange={(e) => setCompanyUsername(e.target.value)} 
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="employee-code">Employee Code</Label>
                            <Input 
                                id="employee-code" 
                                type="text" 
                                placeholder="Enter your employee code" 
                                required 
                                value={employeeCode} 
                                onChange={(e) => setEmployeeCode(e.target.value)} 
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="password-employee">Password</Label>
                            <Input 
                                id="password-employee" 
                                type="password" 
                                placeholder="Enter your password" 
                                required 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                disabled={isLoading}
                            />
                        </div>
                        <Button 
                            type="submit" 
                            className="w-full bg-[#1E3A5F] hover:bg-slate-700 text-white font-semibold py-6"
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            SIGN IN
                        </Button>
                        <Button 
                            type="button"
                            variant="outline" 
                            className="w-full py-6"
                            onClick={() => setShowEmployeeLogin(false)}
                            disabled={isLoading}
                        >
                            Back to Email Login
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
};

const SignUpForm = () => {
    const { register, isLoading, error, clearError } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();
        setLocalError(null);

        if (password !== confirmPassword) {
            setLocalError('Passwords do not match');
            return;
        }

        if (!agreedToTerms) {
            setLocalError('Please agree to the terms of use');
            return;
        }

        try {
            await register({
                email,
                password,
                confirm_password: confirmPassword,
            });
        } catch {
            // Error handled by AuthContext
        }
    };

    const handleGoogleSignUp = () => {
        authApi.loginWithGoogle();
    };

    return (
        <div className="p-8 md:p-12 flex flex-col justify-center h-full">
            <div className="self-start"><HrisLogo /></div>
            <div className="mt-auto">
                <h2 className="text-3xl font-bold text-slate-800 mb-10">Sign Up</h2>
                <p className="text-slate-500 mt-2 mb-10">Create your account and streamline your employee management.</p>
                
                {(error || localError) && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                        {error || localError}
                    </div>
                )}

                <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-1">
                        <Label htmlFor="email-signup">Email</Label>
                        <Input 
                            id="email-signup" 
                            type="email" 
                            placeholder="Enter email" 
                            required 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="password-signup">Password</Label>
                        <Input 
                            id="password-signup" 
                            type="password" 
                            placeholder="Enter password" 
                            required 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="confirm-password">Confirm Password</Label>
                        <Input 
                            id="confirm-password" 
                            type="password" 
                            placeholder="Enter confirm password" 
                            required 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox 
                            id="terms" 
                            checked={agreedToTerms}
                            onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                            disabled={isLoading}
                        />
                        <Label htmlFor="terms" className="text-sm text-muted-foreground">
                            I agree with the terms of use of HRIS
                        </Label>
                    </div>
                    <Button 
                        type="submit" 
                        className="w-full bg-[#1E3A5F] hover:bg-slate-700 text-white font-semibold py-6"
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        SIGN UP
                    </Button>
                    <Button 
                        type="button"
                        variant="outline" 
                        className="w-full py-6"
                        onClick={handleGoogleSignUp}
                        disabled={isLoading}
                    >
                        Sign up with Google
                    </Button>
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

