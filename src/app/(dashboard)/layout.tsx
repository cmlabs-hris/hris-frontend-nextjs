'use client'

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user } = useAuth();
    const router = useRouter();
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        // Logika ini akan berjalan setelah komponen selesai dimuat di browser
        // Jika tidak ada user (null), maka tendang kembali ke halaman login
        if (user === null) {
            router.push('/auth');
        }
    }, [user, router]);
    
    // Selama status user masih diperiksa (undefined), atau jika user tidak ada (null),
    // tampilkan layar loading atau jangan tampilkan apa-apa untuk mencegah "flash" konten.
    if (!user) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <div>Loading...</div>
            </div>
        );
    }

    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    // Jika user sudah terverifikasi, tampilkan layout dashboard
    return (
        <div className="flex min-h-screen w-full bg-muted/40">
            <Sidebar isOpen={isSidebarOpen} />
            <div className={`flex flex-col flex-1 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
                <Header onToggleSidebar={toggleSidebar} />
                <main className="flex-1 p-4 sm:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}

