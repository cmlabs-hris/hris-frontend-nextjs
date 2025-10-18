'use client';

import { useRouter } from 'next/navigation';
import AnimatedBubbles from '@/components/auth/AnimatedBubbles';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';

export default function CreateCompanyPage() {
    const router = useRouter();
    const { login } = useAuth();

    const handleCreateCompany = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Logic to save company to backend
        // For now, simulate login as admin and redirect to dashboard
        login('admin@gmail.com');
    };

    return (
        <main className="relative flex flex-col items-center justify-center min-h-screen bg-[#3B82F6] overflow-hidden p-4">
            <div className="absolute inset-0 bg-gradient-to-br from-[#3B82F6] to-[#1E40AF] -z-20" />
            <AnimatedBubbles />

            <div className="text-center text-white mb-8">
                <h1 className="text-4xl font-bold">Create a new Company</h1>
                <p className="mt-4 max-w-xl">
                    A Company is the centralized environment for your entire organization. Manage all teams, projects, and issues on one unified platform.
                </p>
            </div>

            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Company Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleCreateCompany} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="company-name">Company Username</Label>
                            <Input id="company-name" placeholder="Enter company name" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="company-address">Company Address</Label>
                            <Input id="company-address" placeholder="Enter address" required />
                        </div>
                        <Button type="submit" className="w-full">Create Company</Button>
                    </form>
                </CardContent>
            </Card>
        </main>
    );
}
