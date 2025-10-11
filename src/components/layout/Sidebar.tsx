'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Home, Users, Clock, Calendar, FileText, Settings, LifeBuoy, Briefcase } from "lucide-react"
import { useAuth } from "@/context/AuthContext" // 1. Import hook useAuth

// 2. Tambahkan properti 'roles' untuk setiap item menu
const navItems = [
    { href: "/dashboard", icon: Home, label: "DASHBOARD", roles: ['admin', 'user'] },
    { href: "/employees", icon: Users, label: "EMPLOYEE", roles: ['admin'] }, // Hanya untuk admin
    { href: "/check-clock", icon: Clock, label: "CHECKCLOCK", roles: ['admin'] }, // Hanya untuk admin
    { href: "/attendance", icon: Calendar, label: "ATTENDANCE", roles: ['user'] }, // Contoh: Hanya untuk user
    { href: "/reports", icon: FileText, label: "REPORTS", roles: ['admin'] }, // Contoh: Hanya untuk admin
];

const bottomNavItems = [
    { href: "/contact-service", icon: LifeBuoy, label: "CONTACT SERVICE", roles: ['admin', 'user'] },
    { href: "/settings", icon: Settings, label: "SETTINGS", roles: ['admin', 'user'] },
];

export default function Sidebar({ isOpen }: { isOpen: boolean }) {
    const pathname = usePathname();
    const { user } = useAuth(); // 3. Dapatkan informasi user yang sedang login

    // 4. Filter item menu berdasarkan peran (role) user
    const filteredNavItems = navItems.filter(item => user && item.roles.includes(user.role));
    const filteredBottomNavItems = bottomNavItems.filter(item => user && item.roles.includes(user.role));


    const renderNavItem = (item: typeof navItems[0]) => {
        const safePathname = pathname ?? "";
        const isActive = safePathname === item.href || (item.href !== "/dashboard" && safePathname.startsWith(item.href));
        const linkClasses = cn(
            "flex items-center gap-4 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
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
                    <TooltipContent side="right">
                        <p>{item.label}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    };

    return (
        <aside className={cn(
            "fixed inset-y-0 left-0 z-10 flex-col border-r bg-background sm:flex transition-all duration-300 ease-in-out",
            isOpen ? "w-64" : "w-20"
        )}>
            <nav className="flex flex-col h-full gap-2 p-4">
                <div className="flex items-center gap-2 px-4 py-2 mb-4">
                    <Briefcase className="h-6 w-6" />
                    {isOpen && <span className="font-bold">HRIS</span>}
                </div>
                {/* 5. Gunakan item menu yang sudah difilter */}
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

