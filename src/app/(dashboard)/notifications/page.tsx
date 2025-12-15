'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Bell, Check, Briefcase, Calendar, Plane, CreditCard, Mail, Loader2, CheckCheck, Trash2, RefreshCw } from "lucide-react";
import { notificationApi, Notification, NotificationType } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from 'date-fns';

// Icon mapping based on notification type
const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
        case 'leave_request':
        case 'leave_approved':
        case 'leave_rejected':
            return Plane;
        case 'attendance_reminder':
        case 'attendance_approved':
        case 'attendance_rejected':
            return Calendar;
        case 'payroll_generated':
            return CreditCard;
        case 'invitation':
            return Mail;
        default:
            return Bell;
    }
};

// Color mapping based on notification type
const getNotificationColor = (type: NotificationType) => {
    switch (type) {
        case 'leave_approved':
        case 'attendance_approved':
            return 'text-green-600';
        case 'leave_rejected':
        case 'attendance_rejected':
            return 'text-red-600';
        case 'leave_request':
            return 'text-blue-600';
        case 'payroll_generated':
            return 'text-purple-600';
        default:
            return 'text-primary';
    }
};

export default function NotificationsPage() {
    const { toast } = useToast();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showUnreadOnly, setShowUnreadOnly] = useState(false);
    const pageSize = 20;

    const fetchNotifications = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await notificationApi.list(page, pageSize, showUnreadOnly);
            if (response.success && response.data) {
                setNotifications(response.data.notifications || []);
                setUnreadCount(response.data.unread_count || 0);
                setTotalPages(Math.ceil((response.data.total || 0) / pageSize));
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            toast({
                title: "Error",
                description: "Failed to load notifications",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }, [page, showUnreadOnly, toast]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(notifications.map(n => n.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelect = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedIds(prev => [...prev, id]);
        } else {
            setSelectedIds(prev => prev.filter(i => i !== id));
        }
    };

    const handleMarkAsRead = async () => {
        if (selectedIds.length === 0) return;
        try {
            const response = await notificationApi.markAsRead(selectedIds);
            if (response.success) {
                toast({
                    title: "Success",
                    description: `${selectedIds.length} notification(s) marked as read`,
                });
                setSelectedIds([]);
                fetchNotifications();
            }
        } catch (error) {
            console.error('Failed to mark as read:', error);
            toast({
                title: "Error",
                description: "Failed to mark notifications as read",
                variant: "destructive",
            });
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            const response = await notificationApi.markAllAsRead();
            if (response.success) {
                toast({
                    title: "Success",
                    description: "All notifications marked as read",
                });
                fetchNotifications();
            }
        } catch (error) {
            console.error('Failed to mark all as read:', error);
            toast({
                title: "Error",
                description: "Failed to mark all as read",
                variant: "destructive",
            });
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const response = await notificationApi.delete(id);
            if (response.success) {
                toast({
                    title: "Success",
                    description: "Notification deleted",
                });
                fetchNotifications();
            }
        } catch (error) {
            console.error('Failed to delete notification:', error);
            toast({
                title: "Error",
                description: "Failed to delete notification",
                variant: "destructive",
            });
        }
    };

    const formatTime = (dateStr: string) => {
        try {
            return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Notifications</h1>
                    <p className="text-muted-foreground">
                        {unreadCount > 0 ? `You have ${unreadCount} unread notification(s)` : 'All caught up!'}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={fetchNotifications}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                    {unreadCount > 0 && (
                        <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
                            <CheckCheck className="h-4 w-4 mr-2" />
                            Mark All as Read
                        </Button>
                    )}
                </div>
            </div>

            <Card>
                <CardHeader className="border-b">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    checked={selectedIds.length === notifications.length && notifications.length > 0}
                                    onCheckedChange={handleSelectAll}
                                />
                                <span className="text-sm text-muted-foreground">Select All</span>
                            </div>
                            {selectedIds.length > 0 && (
                                <Button variant="outline" size="sm" onClick={handleMarkAsRead}>
                                    <Check className="h-4 w-4 mr-2" />
                                    Mark as Read ({selectedIds.length})
                                </Button>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <Button 
                                variant={showUnreadOnly ? "default" : "outline"} 
                                size="sm"
                                onClick={() => { setShowUnreadOnly(!showUnreadOnly); setPage(1); }}
                            >
                                {showUnreadOnly ? 'Show All' : 'Unread Only'}
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <Bell className="h-12 w-12 mb-4 opacity-50" />
                            <p>No notifications</p>
                            <p className="text-sm">You&apos;re all caught up!</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map((notification) => {
                                const Icon = getNotificationIcon(notification.type);
                                const iconColor = getNotificationColor(notification.type);
                                return (
                                    <div 
                                        key={notification.id} 
                                        className={`flex items-start gap-4 p-4 hover:bg-muted/50 transition-colors ${!notification.is_read ? 'bg-blue-50/50' : ''}`}
                                    >
                                        <Checkbox
                                            checked={selectedIds.includes(notification.id)}
                                            onCheckedChange={(checked) => handleSelect(notification.id, checked as boolean)}
                                        />
                                        <div className={`p-2 rounded-full bg-muted ${iconColor}`}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <p className={`font-semibold ${notification.is_read ? 'text-muted-foreground' : 'text-foreground'}`}>
                                                        {notification.title}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-2">
                                                        {formatTime(notification.created_at)}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    {!notification.is_read && (
                                                        <Badge variant="default" className="bg-blue-500">New</Badge>
                                                    )}
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Delete Notification</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Are you sure you want to delete this notification?
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDelete(notification.id)}>
                                                                    Delete
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page <= 1}
                    >
                        Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        Page {page} of {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages}
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
}
