'use client'

import { usePathname } from 'next/navigation';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { PanelLeft, Search, Bell } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';

export default function Header({ onToggleSidebar }: { onToggleSidebar: () => void }) {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    // Fungsi untuk mendapatkan judul halaman berdasarkan path
    const getPageTitle = () => {
        switch (pathname) {
            case '/dashboard':
                return 'DASHBOARD';
            case '/employees':
                return 'EMPLOYEE DATABASE';
            case '/check-clock':
                return 'CHECK CLOCK OVERVIEW';
            case '/attendance':
                return 'ATTENDANCE';
            // Tambahkan case lain jika ada halaman baru
            default:
                // Fallback jika tidak ada yang cocok
                return 'DASHBOARD';
        }
    };

    return (
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4">
            <Button size="icon" variant="outline" className="sm:hidden" onClick={onToggleSidebar}>
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
            </Button>
            
            {/* Judul Halaman Dinamis */}
            <h1 className="font-semibold text-lg hidden sm:block">
                {getPageTitle()}
            </h1>

            <div className="relative ml-auto flex-1 md:grow-0">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search..."
                    className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
                />
            </div>
            <Button variant="outline" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Toggle notifications</span>
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        className="overflow-hidden rounded-full"
                    >
                        <Avatar>
                            <AvatarImage src="https://i.pravatar.cc/40" alt="User Avatar" />
                            <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>{user?.name || 'My Account'}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Settings</DropdownMenuItem>
                    <DropdownMenuItem>Support</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-red-500">Logout</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    )
}

