'use client'

import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { PanelLeft, Search } from "lucide-react" 
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { NotificationBell } from './NotificationBell';
import { employeeApi, getUploadUrl } from '@/lib/api';

export default function Header({ onToggleSidebar }: { onToggleSidebar: () => void }) {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const router = useRouter();
    const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
    const [employeeName, setEmployeeName] = useState<string | undefined>(undefined);

    // Fetch employee data for avatar
    useEffect(() => {
        const fetchEmployeeData = async () => {
            // Only fetch if user has employee_id and is not pending
            if (user?.employee_id && user?.role !== 'pending') {
                try {
                    const response = await employeeApi.get(user.employee_id);
                    if (response.success && response.data) {
                        setAvatarUrl(getUploadUrl(response.data.avatar_url));
                        setEmployeeName(response.data.full_name);
                    }
                } catch (error) {
                    // Silently fail - user might not have employee data yet
                    console.log('Employee data not available for header');
                }
            }
        };
        fetchEmployeeData();
    }, [user?.employee_id, user?.role]);

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
                                <AvatarImage src={avatarUrl} alt="User Avatar" />
                                <AvatarFallback>{employeeName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>
                            <div className="flex flex-col">
                                <span>{employeeName || user?.email || 'My Account'}</span>
                                <span className="text-xs font-normal text-muted-foreground capitalize">
                                    {user?.role || 'User'}
                                </span>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.push('/settings')}>Settings</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push('/contact-service')}>Support</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={logout} className="text-red-500">Logout</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}

