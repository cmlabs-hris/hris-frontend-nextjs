'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

// Aset Ikon
const HrisLogo = () => ( <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-slate-800"> <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/> </svg> );
const GoogleLogo = () => ( <svg className="mr-2 h-4 w-4" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"> <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path> <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.42-4.55H24v8.51h12.8c-.57 2.65-2.07 4.92-4.21 6.48l7.98 6.19c4.7-4.28 7.43-10.74 7.43-18.63z"></path> <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path> <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.98-6.19c-2.11 1.45-4.8 2.3-7.91 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path> <path fill="none" d="M0 0h48v48H0z"></path> </svg> );


export default function AuthenticationUI() {
    const [isSignUp, setIsSignUp] = useState(false);

    return (
        <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden" style={{ minHeight: '650px' }}>
            
            {/* Panel Form Sign Up (selalu di kiri) */}
            <div className="absolute top-0 left-0 h-full w-1/2 p-8 md:p-12 flex flex-col justify-center">
                <SignUpContent />
            </div>
            
            {/* Panel Form Sign In (selalu di kanan) */}
            <div className="absolute top-0 right-0 h-full w-1/2 p-8 md:p-12 flex flex-col justify-center">
                <SignInContent />
            </div>

            {/* Panel Overlay yang bergerak */}
            <div className={`absolute top-0 left-0 h-full w-1/2 bg-blue-700 text-white flex flex-col items-center justify-center text-center p-12 transition-transform duration-700 ease-in-out z-20 ${isSignUp ? 'translate-x-full' : 'translate-x-0'}`}>
                <div className="transform transition-all duration-500">
                    {isSignUp ? (
                         <OverlayContent
                            title="Welcome Back!"
                            description="To keep connected with us please login with your personal info"
                            buttonText="SIGN IN"
                            onClick={() => setIsSignUp(false)}
                        />
                    ) : (
                        <OverlayContent
                            title="Hello, Friend!"
                            description="Enter your personal details and start your journey with us"
                            buttonText="SIGN UP"
                            onClick={() => setIsSignUp(true)}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

// Komponen Overlay
const OverlayContent = ({ title, description, buttonText, onClick }: any) => (
    <div>
        <h2 className="text-3xl font-bold">{title}</h2>
        <div className="border-2 w-10 border-white inline-block my-4"></div>
        <p className="mb-8">{description}</p>
        <Button variant="outline" className="bg-transparent text-white border-white hover:bg-white hover:text-blue-700 rounded-full" onClick={onClick}>
            {buttonText}
        </Button>
    </div>
);

// Konten Sign In dengan komponen shadcn/ui
const SignInContent = () => (
    <Card className="border-none shadow-none">
        <CardHeader className="items-center">
            <div className="flex items-center gap-2 mb-2">
                <HrisLogo />
                <CardTitle className="text-3xl">Sign In</CardTitle>
            </div>
            <CardDescription>Use your email or employee ID</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <Button variant="outline" className="w-full"><GoogleLogo /> Sign in with Google</Button>
            <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-muted-foreground">Or continue with</span></div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="email-in">Email or ID</Label>
                <Input id="email-in" type="email" placeholder="you@example.com" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password-in">Password</Label>
                <Input id="password-in" type="password" />
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Checkbox id="remember-me" />
                    <Label htmlFor="remember-me" className="text-sm font-normal">Remember me</Label>
                </div>
                <a href="#" className="text-sm font-medium text-blue-600 hover:underline">Forgot password?</a>
            </div>
            <Button className="w-full">Sign In</Button>
        </CardContent>
    </Card>
);

// Konten Sign Up dengan komponen shadcn/ui
const SignUpContent = () => (
    <Card className="border-none shadow-none">
        <CardHeader className="items-center">
            <div className="flex items-center gap-2 mb-2">
                <HrisLogo />
                <CardTitle className="text-3xl">Create Account</CardTitle>
            </div>
            <CardDescription>Enter your details below to create your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <Button variant="outline" className="w-full"><GoogleLogo /> Sign up with Google</Button>
            <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-muted-foreground">Or continue with</span></div>
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first-name">First Name</Label>
                  <Input id="first-name" placeholder="John" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name">Last Name</Label>
                  <Input id="last-name" placeholder="Doe" required />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="email-up">Email</Label>
                <Input id="email-up" type="email" placeholder="you@example.com" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password-up">Password</Label>
                <Input id="password-up" type="password" />
            </div>
            <Button className="w-full">Create Account</Button>
        </CardContent>
    </Card>
);

