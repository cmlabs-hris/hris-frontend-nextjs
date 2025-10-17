'use client'

import { usePathname, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { PanelLeft, Search } from "lucide-react" 
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { NotificationBell } from './NotificationBell'; 

export default function Header({ onToggleSidebar }: { onToggleSidebar: () => void }) {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const router = useRouter();

    const getPageTitle = () => {
        const pathSegments = (pathname ?? '').split('/').filter(Boolean);
        const lastSegment = pathSegments[pathSegments.length - 1] || 'dashboard';
        return lastSegment.replace('-', ' ').toUpperCase();
    };

    return (
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4">
            
            <Button size="icon" variant="ghost" className="p-2" onClick={onToggleSidebar}>
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
            </Button>
            
            <h1 className="font-semibold text-lg">
                {getPageTitle()}
            </h1>

            <div className="relative ml-auto flex items-center gap-4 md:grow-0">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search..."
                        className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
                    />
                </div>
                
                {/* <ThemeToggle /> */}

                <NotificationBell />

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
                        <DropdownMenuItem onClick={() => router.push('/settings')}>Settings</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push('/contact-service')}>Support</DropdownMenuItem>
                        <DropdownMenuItem onClick={logout} className="text-red-500">Logout</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}

