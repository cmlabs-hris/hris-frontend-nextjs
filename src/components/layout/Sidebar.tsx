'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Users, CheckSquare, Calendar, Settings, LifeBuoy } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Ikon
const HrisLogo = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 7l10 5 10-5-10-5z" fill="#FFFFFF"/><path d="M2 17l10 5 10-5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="#FFFFFF" opacity="0.6"/><path d="M2 12l10 5 10-5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="#FFFFFF" opacity="0.3"/></svg>

// Daftar Navigasi
const navItems = [
    { href: "/dashboard", label: "DASHBOARD", icon: Home },
    { href: "/employee", label: "EMPLOYEE", icon: Users },
    { href: "/checkclock", label: "CHECKCLOCK", icon: CheckSquare },
    { href: "/attendance", label: "ATTENDANCE", icon: Calendar },
];

interface SidebarProps {
  isOpen: boolean;
}

export default function Sidebar({ isOpen }: SidebarProps) {
    const pathname = usePathname();

    return (
        <aside className={cn(
          "hidden lg:flex lg:flex-col fixed z-40 h-screen bg-[#1E3A5F] text-white transition-all duration-300 ease-in-out", // Color changed here
          isOpen ? "lg:w-64" : "lg:w-20"
        )}>
            <div className="flex h-full max-h-screen flex-col gap-2">
                <div className="flex h-16 items-center border-b border-gray-500/30 px-6">
                    <Link href="/" className="flex items-center gap-3 font-semibold">
                        <HrisLogo />
                        <span className={cn("transition-opacity duration-200", !isOpen && "opacity-0 w-0")}>HRIS</span>
                    </Link>
                </div>
                <div className="flex-1 overflow-auto py-2">
                    <div className={cn("flex flex-col items-center gap-4 text-center my-4 transition-all duration-300", isOpen ? "px-4" : "px-2")}>
                        <Avatar className={cn("transition-all duration-300", isOpen ? "h-20 w-20" : "h-10 w-10")}>
                            <AvatarImage src="https://i.pravatar.cc/150?u=admin" />
                            <AvatarFallback>KA</AvatarFallback>
                        </Avatar>
                        <div className={cn("transition-opacity duration-200 whitespace-nowrap", !isOpen && "opacity-0 h-0 overflow-hidden")}>
                            <p className="font-semibold">KroKrok</p>
                            <p className="text-sm text-gray-400">Admin</p>
                        </div>
                    </div>
                    <nav className={cn("grid items-start font-medium", isOpen ? "px-4 gap-1" : "px-2")}>
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 transition-all hover:text-white hover:bg-white/10",
                                    !isOpen && "justify-center",
                                    pathname?.startsWith(item.href) && "bg-white/10 text-white"
                                )}
                            >
                                <item.icon className="h-5 w-5" />
                                <span className={cn("transition-opacity duration-200", !isOpen && "opacity-0 w-0")}>{item.label}</span>
                            </Link>
                        ))}
                    </nav>
                </div>
                <div className="mt-auto p-4 border-t border-gray-500/30">
                     <nav className={cn("grid items-start text-sm font-medium gap-1", isOpen ? "" : "px-0")}>
                        <Link
                            href="/contact"
                            className={cn(
                              "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 transition-all hover:text-white hover:bg-white/10",
                              !isOpen && "justify-center"
                            )}
                        >
                            <LifeBuoy className="h-5 w-5" />
                            <span className={cn("transition-opacity duration-200", !isOpen && "opacity-0 w-0")}>CONTACT SERVICE</span>
                        </Link>
                         <Link
                            href="/settings"
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 transition-all hover:text-white hover:bg-white/10",
                                !isOpen && "justify-center",
                                pathname?.startsWith("/settings") && "bg-white/10 text-white"
                            )}
                        >
                            <Settings className="h-5 w-5" />
                            <span className={cn("transition-opacity duration-200", !isOpen && "opacity-0 w-0")}>SETTINGS</span>
                        </Link>
                    </nav>
                </div>
            </div>
        </aside>
    );
}

