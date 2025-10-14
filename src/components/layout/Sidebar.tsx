'use client'

import Link from "next/link"
import Image from "next/image" // 1. Import komponen Image
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Home, Users, Clock, Calendar, FileText, Settings, LifeBuoy } from "lucide-react"
import { useAuth } from "@/context/AuthContext"

const navItems = [
    { href: "/dashboard", icon: Home, label: "DASHBOARD", roles: ['admin', 'user'] },
    { href: "/employees", icon: Users, label: "EMPLOYEE", roles: ['admin'] },
    { href: "/check-clock", icon: Clock, label: "CHECKCLOCK", roles: ['admin'] },
    { href: "/attendance", icon: Calendar, label: "ATTENDANCE", roles: ['user'] },
    { href: "/reports", icon: FileText, label: "REPORTS", roles: ['admin'] },
];

const bottomNavItems = [
    { href: "/contact-service", icon: LifeBuoy, label: "CONTACT SERVICE", roles: ['admin', 'user'] },
    { href: "/settings", icon: Settings, label: "SETTINGS", roles: ['admin', 'user'] },
];

export default function Sidebar({ isOpen }: { isOpen: boolean }) {
    const pathname = usePathname();
    const { user } = useAuth(); 

    const filteredNavItems = navItems.filter(item => user && item.roles.includes(user.role));
    const filteredBottomNavItems = bottomNavItems.filter(item => user && item.roles.includes(user.role));

    const renderNavItem = (item: typeof navItems[0]) => {
        const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
        
        // 3. Ubah warna teks agar kontras dengan latar belakang biru
        const linkClasses = cn(
            "flex items-center gap-4 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
            "hover:bg-blue-900/50 hover:text-white", // Efek hover
            isActive ? "bg-blue-900/60 text-white" : "text-black" // Kondisi aktif vs tidak aktif
        );

        if (isOpen) {
            return (
                <Link key={item.href} href={item.href} className={linkClasses}>
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                </Link>
            );
        }

        return (
            <TooltipProvider key={item.href} delayDuration={0}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Link href={item.href} className={linkClasses}>
                            <item.icon className="h-5 w-5" />
                            <span className="sr-only">{item.label}</span>
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="bg-[#1E3A5F] text-white border-blue-800">
                        <p>{item.label}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    };

    return (
        // 2. GANTI WARNA SIDEBAR DI SINI
        <aside className={cn(
            "fixed inset-y-0 left-0 z-10 flex-col border-r sm:flex transition-all duration-300 ease-in-out",
            "bg-white ",
            isOpen ? "w-64" : "w-20"
        )}>
            <nav className="flex flex-col h-full gap-2 p-4">
                <div className="flex items-center  h-10 mb-4">
                    {/* 4. GANTI LOGO DENGAN GAMBAR DI SINI */}
                    {isOpen ? (
                        // Tampilan logo saat sidebar terbuka
                        <Image
                            // Ganti URL ini dengan path logo Anda
                            src="/logo.png"
                            alt="HRIS Logo"
                            width={100}
                            height={40}
                            priority
                        />
                    ) : (
                        // Tampilan logo saat sidebar tertutup
                         <Image
                            // Ganti URL ini dengan path ikon Anda
                            src="/logo.png"
                            alt="HRIS Icon"
                            width={40}
                            height={40}
                            priority
                            className="rounded-lg"
                        />
                    )}
                </div>
                <div className="flex-1 space-y-2">
                    {filteredNavItems.map(renderNavItem)}
                </div>
                <div className="mt-auto space-y-2">
                    {filteredBottomNavItems.map(renderNavItem)}
                </div>
            </nav>
        </aside>
    );
}

