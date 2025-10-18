'use client';

import { useRouter } from 'next/navigation';
import AnimatedBubbles from '@/components/auth/AnimatedBubbles';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';

export default function JoinCompanyPage() {
    const router = useRouter();
    const { login } = useAuth();

    // Simulasi: ganti nilai ini menjadi false untuk melihat tampilan "No Access"
    const hasBeenInvited = true;

    const handleJoin = () => {
        // TODO: Logic to verify join with backend
        // For now, simulate login as user and redirect to dashboard
        login('employee@hris.com');
    };

    return (
        <main className="relative flex flex-col items-center justify-center min-h-screen bg-[#3B82F6] overflow-hidden p-4">
            <div className="absolute inset-0 bg-gradient-to-br from-[#3B82F6] to-[#1E40AF] -z-20" />
            <AnimatedBubbles />

            <div className="text-center text-white mb-8">
                <h1 className="text-4xl font-bold">You have access to these companies</h1>
            </div>

            <Card className="w-full max-w-lg">
                <CardContent className="p-6">
                    {hasBeenInvited ? (
                        // Tampilan jika sudah diundang
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="bg-blue-200 text-blue-800 font-bold p-3 rounded-md">CI</div>
                                <span>CmlabsIndonesiaDigital</span>
                            </div>
                            <Button onClick={handleJoin}>Join</Button>
                        </div>
                    ) : (
                        // Tampilan jika belum diundang
                        <div className="text-center text-gray-500 py-4">
                            No Access
                        </div>
                    )}
                </CardContent>
            </Card>
        </main>
    );
}
