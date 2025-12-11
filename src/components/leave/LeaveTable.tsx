'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Check, X, Eye, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { format } from "date-fns";
import { leaveApi, LeaveRequest, LeaveRequestFilter } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

// Helper untuk format tanggal
const formatDate = (dateString: string) => {
    try {
        return format(new Date(dateString), "PPP");
    } catch {
        return dateString;
    }
};

// View Details Dialog
const ViewLeaveDialog = ({ request }: { request: LeaveRequest }) => {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <span>View Details</span>
                </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Leave Request Details</DialogTitle>
                    <DialogDescription>
                        Submitted on {formatDate(request.submitted_at)}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="text-muted-foreground">Employee</Label>
                            <p className="font-medium">{request.employee_name}</p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Leave Type</Label>
                            <p className="font-medium">{request.leave_type_name}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="text-muted-foreground">Start Date</Label>
                            <p className="font-medium">{formatDate(request.start_date)}</p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">End Date</Label>
                            <p className="font-medium">{formatDate(request.end_date)}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="text-muted-foreground">Duration Type</Label>
                            <p className="font-medium capitalize">{request.duration_type?.replace('_', ' ') || 'Full Day'}</p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Total Days</Label>
                            <p className="font-medium">{request.total_days} days ({request.working_days} working days)</p>
                        </div>
                    </div>
                    <div>
                        <Label className="text-muted-foreground">Reason</Label>
                        <p className="font-medium">{request.reason}</p>
                    </div>
                    {request.attachment_url && (
                        <div>
                            <Label className="text-muted-foreground">Attachment</Label>
                            <a 
                                href={request.attachment_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                            >
                                View Attachment
                            </a>
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="text-muted-foreground">Status</Label>
                            <p className="font-medium capitalize">{request.status.replace('_', ' ')}</p>
                        </div>
                        {request.approved_at && (
                            <div>
                                <Label className="text-muted-foreground">Approved At</Label>
                                <p className="font-medium">{formatDate(request.approved_at)}</p>
                            </div>
                        )}
                    </div>
                    {request.rejection_reason && (
                        <div>
                            <Label className="text-muted-foreground">Rejection Reason</Label>
                            <p className="font-medium text-red-600">{request.rejection_reason}</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

// Reject Dialog
const RejectDialog = ({ 
    request, 
    onReject, 
    isLoading 
}: { 
    request: LeaveRequest; 
    onReject: (id: string, reason: string) => Promise<void>;
    isLoading: boolean;
}) => {
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState('');

    const handleReject = async () => {
        if (!reason.trim()) return;
        await onReject(request.id, reason);
        setOpen(false);
        setReason('');
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="destructive" size="sm">
                    <X className="h-4 w-4 mr-1" />
                    Reject
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Reject Leave Request</DialogTitle>
                    <DialogDescription>
                        Rejecting leave request from {request.employee_name}
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Label htmlFor="rejection_reason">Rejection Reason *</Label>
                    <Textarea
                        id="rejection_reason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Please provide a reason for rejection..."
                        rows={3}
                        className="mt-2"
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button 
                        variant="destructive" 
                        onClick={handleReject} 
                        disabled={!reason.trim() || isLoading}
                    >
                        {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Reject
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

// Main Table Component
interface LeaveTableProps {
    searchQuery: string;
    statusFilter?: string;
    leaveTypeFilter?: string;
    refreshKey?: number;
}

export default function LeaveTable({ searchQuery, statusFilter, leaveTypeFilter, refreshKey }: LeaveTableProps) {
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
    const [filteredData, setFilteredData] = useState<LeaveRequest[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [approvingId, setApprovingId] = useState<string | null>(null);
    const [rejectingId, setRejectingId] = useState<string | null>(null);
    const { toast } = useToast();

    // Fetch leave requests
    const fetchLeaveRequests = useCallback(async () => {
        try {
            setIsLoading(true);
            const filter: LeaveRequestFilter = {
                limit: 100,
            };

            if (statusFilter && statusFilter !== 'all') {
                filter.status = statusFilter;
            }
            if (leaveTypeFilter && leaveTypeFilter !== 'all') {
                filter.leave_type_id = leaveTypeFilter;
            }

            const response = await leaveApi.listRequests(filter);
            if (response.success && response.data) {
                setLeaveRequests(response.data.requests || []);
                setTotalCount(response.data.total_count || 0);
            } else {
                setLeaveRequests([]);
                setTotalCount(0);
            }
        } catch (error) {
            console.error('Failed to fetch leave requests:', error);
            setLeaveRequests([]);
            toast({
                title: "Error",
                description: "Failed to fetch leave requests",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }, [statusFilter, leaveTypeFilter, toast]);

    useEffect(() => {
        fetchLeaveRequests();
    }, [fetchLeaveRequests, refreshKey]);

    // Filter by search query (realtime)
    useEffect(() => {
        if (!leaveRequests || !Array.isArray(leaveRequests)) {
            setFilteredData([]);
            return;
        }

        if (!searchQuery.trim()) {
            setFilteredData(leaveRequests);
        } else {
            const query = searchQuery.toLowerCase();
            const filtered = leaveRequests.filter(request =>
                request.employee_name?.toLowerCase().includes(query) ||
                request.leave_type_name?.toLowerCase().includes(query) ||
                request.reason?.toLowerCase().includes(query)
            );
            setFilteredData(filtered);
        }
    }, [searchQuery, leaveRequests]);

    // Handle approve
    const handleApprove = async (id: string) => {
        try {
            setApprovingId(id);
            const response = await leaveApi.approveRequest(id);
            if (response.success) {
                toast({
                    title: "Success",
                    description: "Leave request approved successfully",
                });
                fetchLeaveRequests();
            } else {
                throw new Error(response.message || 'Failed to approve');
            }
        } catch (error) {
            console.error('Failed to approve:', error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to approve leave request",
                variant: "destructive",
            });
        } finally {
            setApprovingId(null);
        }
    };

    // Handle reject
    const handleReject = async (id: string, reason: string) => {
        try {
            setRejectingId(id);
            const response = await leaveApi.rejectRequest(id, reason);
            if (response.success) {
                toast({
                    title: "Success",
                    description: "Leave request rejected",
                });
                fetchLeaveRequests();
            } else {
                throw new Error(response.message || 'Failed to reject');
            }
        } catch (error) {
            console.error('Failed to reject:', error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to reject leave request",
                variant: "destructive",
            });
        } finally {
            setRejectingId(null);
        }
    };

    // Get status badge
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'waiting_approval':
                return <Badge className="bg-yellow-400 text-yellow-900">Pending</Badge>;
            case 'approved':
                return <Badge className="bg-green-500">Approved</Badge>;
            case 'rejected':
                return <Badge variant="destructive">Rejected</Badge>;
            case 'cancelled':
                return <Badge variant="secondary">Cancelled</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading leave requests...</span>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="rounded-md border">
                <Table>
                    <TableHeader className="bg-slate-100 dark:bg-slate-800">
                        <TableRow>
                            <TableHead>Employee</TableHead>
                            <TableHead>Leave Type</TableHead>
                            <TableHead>Period</TableHead>
                            <TableHead>Days</TableHead>
                            <TableHead>Reason</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-10 text-gray-500">
                                    {searchQuery ? 'No matching leave requests found' : 'No leave requests found'}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredData.map((request) => (
                                <TableRow key={request.id}>
                                    <TableCell className="font-medium">{request.employee_name}</TableCell>
                                    <TableCell>{request.leave_type_name}</TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            <p>{formatDate(request.start_date)}</p>
                                            <p className="text-muted-foreground">to {formatDate(request.end_date)}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>{request.total_days}</TableCell>
                                    <TableCell className="max-w-[200px] truncate">{request.reason}</TableCell>
                                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {request.status === 'waiting_approval' && (
                                                <>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-green-600 border-green-600 hover:bg-green-50"
                                                        onClick={() => handleApprove(request.id)}
                                                        disabled={approvingId === request.id}
                                                    >
                                                        {approvingId === request.id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <>
                                                                <Check className="h-4 w-4 mr-1" />
                                                                Approve
                                                            </>
                                                        )}
                                                    </Button>
                                                    <RejectDialog 
                                                        request={request} 
                                                        onReject={handleReject}
                                                        isLoading={rejectingId === request.id}
                                                    />
                                                </>
                                            )}
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <ViewLeaveDialog request={request} />
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                    Showing {filteredData.length} of {totalCount} requests
                </div>
            </div>
        </div>
    );
}

