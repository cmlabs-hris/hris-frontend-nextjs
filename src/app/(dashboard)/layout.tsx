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
    // 1. State untuk mengontrol status sidebar (true = terbuka, false = tertutup)
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        if (!user) {
            router.push('/auth');
        }
    }, [user, router]);
    
    if (!user) {
        return null; 
    }

    // 2. Fungsi untuk mengubah state, yang akan kita kirim ke Header
    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="flex min-h-screen w-full bg-gray-100/40 dark:bg-gray-800/40">
            {/* 3. Kirim state 'isOpen' ke Sidebar */}
            <Sidebar isOpen={isSidebarOpen} />
            
            <div className={cn(
                "flex flex-col flex-1 transition-all duration-300 ease-in-out",
                // Logika untuk menggeser konten utama saat sidebar berubah ukuran
                isSidebarOpen ? "lg:ml-64" : "lg:ml-20"
            )}>
                {/* 4. Kirim fungsi 'toggleSidebar' ke Header */}
                <Header onToggleSidebar={toggleSidebar} />
                <main className="flex-1 p-4 sm:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}

