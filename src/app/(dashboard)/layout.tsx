'use client'

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { cn } from "@/lib/utils";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user } = useAuth();
    const router = useRouter();
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        if (!user) {
            router.push('/auth');
        }
    }, [user, router]);
    
    if (!user) {
        return null; 
    }

    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="flex min-h-screen w-full bg-gray-100/40 dark:bg-gray-800/40">
            <Sidebar isOpen={isSidebarOpen} />
            
            <div className={cn(
                "flex flex-col flex-1 transition-all duration-300 ease-in-out",
                isSidebarOpen ? "lg:ml-64" : "lg:ml-20"
            )}>
                <Header onToggleSidebar={toggleSidebar} />
                <main className="flex-1 p-4 sm:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}

