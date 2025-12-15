'use client'

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Calendar, Briefcase, User, Clock, FileText, Loader2 } from "lucide-react";
import { Badge } from '@/components/ui/badge';
import { notificationApi, Notification, getAccessToken } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';

const getNotificationIcon = (type: string) => {
    switch (type) {
        case 'attendance_approved':
        case 'attendance_rejected':
        case 'attendance_reminder':
            return Clock;
        case 'leave_approved':
        case 'leave_rejected':
        case 'leave_request':
            return Calendar;
        case 'employee_added':
        case 'employee_updated':
            return User;
        case 'task_assigned':
            return Briefcase;
        default:
            return FileText;
    }
};

export function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        // Only fetch if user is logged in (has access token)
        const token = getAccessToken();
        if (!token) {
            setLoading(false);
            return;
        }

        fetchNotifications();
        fetchUnreadCount();

        // Refresh every 30 seconds
        const interval = setInterval(() => {
            const currentToken = getAccessToken();
            if (currentToken) {
                fetchUnreadCount();
            }
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await notificationApi.list(1, 5);
            if (response.success && response.data) {
                setNotifications(response.data.notifications || []);
                setError(false);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const response = await notificationApi.getUnreadCount();
            if (response.success && response.data) {
                setUnreadCount(response.data.unread_count || 0);
            }
        } catch (error) {
            // Silently fail - don't show errors for background polling
            console.error('Failed to fetch unread count:', error);
        }
    };

    const handleMarkAsRead = async (id: string) => {
        try {
            await notificationApi.markAsRead([id]);
            setNotifications(prev => prev.map(n => 
                n.id === id ? { ...n, is_read: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

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
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                        <Bell className="h-8 w-8 mb-2 opacity-50" />
                        <p className="text-sm">Unable to load notifications</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                        <Bell className="h-8 w-8 mb-2" />
                        <p className="text-sm">No notifications</p>
                    </div>
                ) : (
                    notifications.map((notification) => {
                        const Icon = getNotificationIcon(notification.type);
                        const isRead = notification.is_read;
                        return (
                            <DropdownMenuItem 
                                key={notification.id} 
                                className="flex items-start gap-3 p-3 cursor-pointer"
                                onClick={() => !isRead && handleMarkAsRead(notification.id)}
                            >
                                <Icon className={`h-5 w-5 mt-1 ${isRead ? 'text-muted-foreground' : 'text-primary'}`} />
                                <div className="flex-1">
                                    <p className={`font-medium text-sm ${isRead ? 'text-muted-foreground' : 'text-foreground'}`}>
                                        {notification.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                    </p>
                                </div>
                                {!isRead && (
                                    <span className="h-2 w-2 rounded-full bg-primary mt-2" />
                                )}
                            </DropdownMenuItem>
                        );
                    })
                )}
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
