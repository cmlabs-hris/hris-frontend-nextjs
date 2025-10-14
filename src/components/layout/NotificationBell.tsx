'use client'

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Check, Briefcase } from "lucide-react";
import { Badge } from '@/components/ui/badge';

// Data notifikasi fiktif
const notifications = [
    { id: 1, icon: Check, title: "Attendance Approved", description: "Your attendance for Oct 14 has been approved.", time: "5 min ago", read: false },
    { id: 2, icon: Briefcase, title: "New Task Assigned", description: "You have a new task in the 'Employee Onboarding' project.", time: "1 hour ago", read: false },
    { id: 3, icon: Check, title: "Leave Request Approved", description: "Your leave request for Oct 20-22 has been approved.", time: "Yesterday", read: true },
];

export function NotificationBell() {
    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                    )}
                    <span className="sr-only">Toggle notifications</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex justify-between items-center">
                    <span>Recent Notifications</span>
                    {unreadCount > 0 && <Badge>{unreadCount} New</Badge>}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.map((notification) => (
                    <DropdownMenuItem key={notification.id} className="flex items-start gap-3 p-3">
                        <notification.icon className={`h-5 w-5 mt-1 ${notification.read ? 'text-muted-foreground' : 'text-primary'}`} />
                        <div className="flex-1">
                            <p className={`font-medium text-sm ${notification.read ? 'text-muted-foreground' : 'text-foreground'}`}>{notification.title}</p>
                            <p className="text-xs text-muted-foreground">{notification.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                        </div>
                    </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/notifications" className="w-full flex justify-center py-2 text-sm font-medium text-primary">
                        View all notifications
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
