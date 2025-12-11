'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import AnimatedBubbles from '@/components/auth/AnimatedBubbles';
import { Button } from '@/components/ui/button';
import { Building2, Users } from 'lucide-react'; 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

// Komponen kartu yang bisa digunakan kembali untuk setiap peran
const RoleCard = ({ 
    icon: Icon, 
    title, 
    description, 
    buttonText, 
    onClick,
    className
}: { 
    icon: React.ElementType, 
    title: string, 
    description: string, 
    buttonText: string, 
    onClick: () => void,
    className?: string
}) => {
    return (
        <Card 
            className={cn(
                "w-full max-w-sm bg-white/10 backdrop-blur-lg border-white/20 text-white text-center transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:bg-white/20 cursor-pointer",
                className
            )}
            onClick={onClick}
        >
            <CardHeader className="items-center">
                <div className="p-4 bg-white/20 rounded-full mb-4">
                    <Icon className="h-10 w-10" />
                </div>
                <CardTitle className="text-2xl font-bold">{title}</CardTitle>
                <CardDescription className="text-white/80">{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <Button 
                    className="w-full font-bold py-6 text-lg"
                >
                    {buttonText}
                </Button>
            </CardContent>
        </Card>
    );
}


export default function ChooseRolePage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading } = useAuth();

    // Redirect jika sudah punya company
    useEffect(() => {
        if (!isLoading && isAuthenticated && user?.company_id) {
            router.push('/dashboard');
        }
    }, [isLoading, isAuthenticated, user, router]);

    // Redirect jika belum login
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/auth');
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
        return (
            <main className="relative flex items-center justify-center min-h-screen bg-[#3B82F6] overflow-hidden p-4">
                <div className="absolute inset-0 bg-gradient-to-br from-[#3B82F6] to-[#1E40AF] -z-20" />
                <AnimatedBubbles />
                <div className="text-white text-xl">Loading...</div>
            </main>
        );
    }

    return (
        <main className="relative flex items-center justify-center min-h-screen bg-[#3B82F6] overflow-hidden p-4">
            <div className="absolute inset-0 bg-gradient-to-br from-[#3B82F6] to-[#1E40AF] -z-20" />
            <AnimatedBubbles />

            <div className="flex flex-col items-center text-center text-white">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">Choose Your Role</h1>
                <p className="text-white/80 mb-12 max-w-md">Select whether you are setting up a new workspace for your team or joining an existing one.</p>
                
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Kartu untuk Owner - Create Company */}
                    <RoleCard
                        icon={Building2}
                        title="Create Company"
                        description="Create and manage a new company workspace for your team as the owner."
                        buttonText="Create New Company"
                        onClick={() => router.push('/auth/create-company')}
                        className="group"
                    />

                    {/* Kartu untuk Employee - Join Company */}
                     <RoleCard
                        icon={Users}
                        title="Join Company"
                        description="Join an existing company workspace you've been invited to."
                        buttonText="Join Existing Company"
                        onClick={() => router.push('/auth/join-company')}
                        className="group"
                    />
                </div>
            </div>
        </main>
    );
}

