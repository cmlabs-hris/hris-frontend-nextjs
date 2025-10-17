'use client';

import { useRouter } from 'next/navigation';
import AnimatedBubbles from '@/components/auth/AnimatedBubbles';
import { Button } from '@/components/ui/button';

export default function ChooseRolePage() {
    const router = useRouter();

    return (
        <main className="relative flex items-center justify-center min-h-screen bg-[#3B82F6] overflow-hidden p-4">
            <div className="absolute inset-0 bg-gradient-to-br from-[#3B82F6] to-[#1E40AF] -z-20" />
            <AnimatedBubbles />

            <div className="text-center text-white">
                <h1 className="text-4xl font-bold mb-12">Choose Role</h1>
                <div className="flex gap-8">
                    <Button 
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-6 px-12 text-lg"
                        onClick={() => router.push('/auth/create-company')}
                    >
                        Admin
                    </Button>
                    <Button 
                        className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-6 px-12 text-lg"
                        onClick={() => router.push('/auth/join-company')}
                    >
                        Employee
                    </Button>
                </div>
            </div>
        </main>
    );
}
