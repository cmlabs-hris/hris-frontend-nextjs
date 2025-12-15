'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Plus, Search, Loader2, Calendar, Clock, FileText, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { leaveApi, LeaveQuota, LeaveRequest, LeaveRequestFilter, ListLeaveRequestResponse } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import CreateLeaveRequestDialog from '@/components/leave/CreateLeaveRequestDialog';
import LeaveRequestDetailSheet from '@/components/leave/LeaveRequestDetailSheet';

export default function MyLeavePage() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [quotas, setQuotas] = useState<LeaveQuota[]>([]);
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    // Fetch my leave quotas
    const fetchQuotas = useCallback(async () => {
        try {
            const response = await leaveApi.getMyQuota();
            if (response.success && response.data) {
                setQuotas(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch quotas:', error);
        }
    }, []);

    // Fetch my leave requests
    const fetchLeaveRequests = useCallback(async () => {
        setIsLoading(true);
        try {
            const filter: LeaveRequestFilter = {
                limit: 50,
                sort_by: 'submitted_at',
                sort_order: 'desc',
            };
            
            if (statusFilter !== 'all') {
                filter.status = statusFilter;
            }

            const response = await leaveApi.getMyRequests(filter);
            if (response.success && response.data) {
                setLeaveRequests(response.data.requests || []);
                setTotalCount(response.data.total_count);
            }
        } catch (error) {
            console.error('Failed to fetch leave requests:', error);
            toast({
                title: "Error",
                description: "Failed to fetch leave requests",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }, [statusFilter, toast]);

    useEffect(() => {
        fetchQuotas();
        fetchLeaveRequests();
    }, [fetchQuotas, fetchLeaveRequests]);

    const handleCreateSuccess = () => {
        setIsCreateDialogOpen(false);
        fetchQuotas();
        fetchLeaveRequests();
        toast({
            title: "Success",
            description: "Leave request submitted successfully",
        });
    };

    const handleViewDetail = (request: LeaveRequest) => {
        setSelectedRequest(request);
        setIsDetailOpen(true);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Approved</Badge>;
            case 'rejected':
                return <Badge className="bg-red-500"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
            case 'waiting_approval':
                return <Badge className="bg-yellow-400 text-yellow-900"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
            case 'cancelled':
                return <Badge variant="secondary"><AlertCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const filteredRequests = leaveRequests.filter(request => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            request.leave_type_name?.toLowerCase().includes(query) ||
            request.reason?.toLowerCase().includes(query)
        );
    });

    // Calculate total available quota
    const totalAvailable = quotas.reduce((sum, q) => sum + q.available_quota, 0);
    const totalUsed = quotas.reduce((sum, q) => sum + q.used_quota, 0);
    const totalPending = quotas.reduce((sum, q) => sum + q.pending_quota, 0);

    return (
        <div className="flex flex-col gap-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">My Leave</h1>
                    <p className="text-muted-foreground">Manage your leave requests and view quota</p>
                </div>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Request Leave
                </Button>
            </div>

            {/* Leave Quota Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Available Leave</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{totalAvailable} days</div>
                        <p className="text-xs text-muted-foreground">Total available quota</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Used Leave</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{totalUsed} days</div>
                        <p className="text-xs text-muted-foreground">Already taken this year</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{totalPending} days</div>
                        <p className="text-xs text-muted-foreground">Awaiting approval</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalCount}</div>
                        <p className="text-xs text-muted-foreground">All time requests</p>
                    </CardContent>
                </Card>
            </div>

            {/* Leave Quota Detail */}
            <Card>
                <CardHeader>
                    <CardTitle>Leave Quota Details</CardTitle>
                    <CardDescription>Your leave balance by type for the current year</CardDescription>
                </CardHeader>
                <CardContent>
                    {quotas.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">No leave quota assigned yet</p>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {quotas.map((quota) => (
                                <Card key={quota.id} className="bg-slate-50">
                                    <CardContent className="pt-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-medium">{quota.leave_type_name || 'Leave Type'}</span>
                                            <Badge variant="outline">{quota.year}</Badge>
                                        </div>
                                        <div className="space-y-1 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Available:</span>
                                                <span className="font-semibold text-green-600">{quota.available_quota} days</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Used:</span>
                                                <span>{quota.used_quota} days</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Pending:</span>
                                                <span className="text-yellow-600">{quota.pending_quota} days</span>
                                            </div>
                                            <div className="flex justify-between border-t pt-1 mt-1">
                                                <span className="text-muted-foreground">Total Quota:</span>
                                                <span>{quota.opening_balance + quota.earned_quota + quota.rollover_quota + quota.adjustment_quota} days</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Leave Requests Table */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Leave Requests History</CardTitle>
                            <CardDescription>View and track your leave requests</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Filters */}
                    <div className="flex items-center gap-4 mb-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search by leave type or reason..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
                            <TabsList>
                                <TabsTrigger value="all">All</TabsTrigger>
                                <TabsTrigger value="waiting_approval">Pending</TabsTrigger>
                                <TabsTrigger value="approved">Approved</TabsTrigger>
                                <TabsTrigger value="rejected">Rejected</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    {/* Table */}
                    {isLoading ? (
                        <div className="flex items-center justify-center py-10">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <span className="ml-2">Loading leave requests...</span>
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader className="bg-slate-100">
                                    <TableRow>
                                        <TableHead>Leave Type</TableHead>
                                        <TableHead>Start Date</TableHead>
                                        <TableHead>End Date</TableHead>
                                        <TableHead>Duration</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Submitted</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredRequests.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                                                {searchQuery || statusFilter !== 'all' 
                                                    ? 'No matching leave requests found' 
                                                    : 'No leave requests yet. Click "Request Leave" to create one.'}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredRequests.map((request) => (
                                            <TableRow key={request.id}>
                                                <TableCell className="font-medium">{request.leave_type_name}</TableCell>
                                                <TableCell>{format(new Date(request.start_date), 'MMM dd, yyyy')}</TableCell>
                                                <TableCell>{format(new Date(request.end_date), 'MMM dd, yyyy')}</TableCell>
                                                <TableCell>
                                                    {request.total_days} {request.total_days === 1 ? 'day' : 'days'}
                                                    {request.duration_type !== 'full_day' && (
                                                        <span className="text-xs text-muted-foreground ml-1">
                                                            ({request.duration_type.replace('_', ' ')})
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell>{getStatusBadge(request.status)}</TableCell>
                                                <TableCell>{format(new Date(request.submitted_at), 'MMM dd, yyyy')}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm"
                                                        onClick={() => handleViewDetail(request)}
                                                    >
                                                        View
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create Leave Request Dialog */}
            <CreateLeaveRequestDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                onSuccess={handleCreateSuccess}
                leaveQuotas={quotas}
            />

            {/* Leave Request Detail Sheet */}
            {selectedRequest && (
                <LeaveRequestDetailSheet
                    request={selectedRequest}
                    open={isDetailOpen}
                    onOpenChange={setIsDetailOpen}
                />
            )}
        </div>
    );
}
