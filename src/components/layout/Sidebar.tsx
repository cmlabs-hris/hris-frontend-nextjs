'use client'

import Link from "next/link"
import Image from "next/image" 
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Home, Users, Clock, Calendar, FileText, Settings, LifeBuoy, Building2, Plane, Banknote, CalendarClock, CreditCard } from "lucide-react"
import { useAuth } from "@/context/AuthContext"

// Roles from backend:
// - owner: Company owner (created company) - full access
// - manager: Can approve leave/attendance
// - employee: Regular employee (joined company)
// - pending: Still in onboarding

const navItems = [
    { href: "/dashboard", icon: Home, label: "DASHBOARD", roles: ['owner', 'manager', 'employee'] },
    { href: "/employees", icon: Users, label: "EMPLOYEE", roles: ['owner', 'manager'] },
    { href: "/check-clock", icon: Clock, label: "CHECKCLOCK", roles: ['owner', 'manager'] },
    { href: "/schedule", icon: CalendarClock, label: "SCHEDULE", roles: ['owner', 'manager'] },
    { href: "/payroll", icon: Banknote, label: "PAYROLL", roles: ['owner', 'manager'] },
    { href: "/attendance", icon: Calendar, label: "ATTENDANCE", roles: ['employee'] },
    { href: "/my-attendance", icon: Clock, label: "MY ATTENDANCE", roles: ['employee'] },
    { href: "/my-leave", icon: Plane, label: "MY LEAVE", roles: ['employee'] },
    { href: "/leave", icon: Plane, label: "LEAVE MANAGEMENT", roles: ['owner', 'manager'] },
    { href: "/company-settings", icon: Building2, label: "COMPANY SETTINGS", roles: ['owner'] },
    
    { href: "/reports", icon: FileText, label: "REPORTS", roles: ['owner', 'manager'] },
];

const bottomNavItems = [
    { href: "/subscription", icon: CreditCard, label: "SUBSCRIPTION", roles: ['owner'] },
    { href: "/contact-service", icon: LifeBuoy, label: "CONTACT SERVICE", roles: ['owner', 'manager', 'employee'] },
    { href: "/settings", icon: Settings, label: "SETTINGS", roles: ['owner', 'manager', 'employee'] },
];

export default function Sidebar({ isOpen }: { isOpen: boolean }) {
    const pathname = usePathname();
    const { user } = useAuth(); 

    const filteredNavItems = navItems.filter(item => user && item.roles.includes(user.role));
    const filteredBottomNavItems = bottomNavItems.filter(item => user && item.roles.includes(user.role));

    const renderNavItem = (item: typeof navItems[0]) => {
        const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
        
        const linkClasses = cn(
            "flex items-center gap-4 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
            "hover:bg-blue-900/50 hover:text-white", 
            isActive ? "bg-blue-900/60 text-white" : "text-black" 
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
        <aside className={cn(
            "fixed inset-y-0 left-0 z-10 flex-col border-r sm:flex transition-all duration-300 ease-in-out",
            "bg-white ",
            isOpen ? "w-64" : "w-20"
        )}>
            <nav className="flex flex-col h-full gap-2 p-4">
                <div className="flex items-center  h-10 mb-4">
                    {isOpen ? (
                        <Image
                            src="/logo.png"
                            alt="HRIS Logo"
                            width={100}
                            height={40}
                            priority
                        />
                    ) : (
                         <Image
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

