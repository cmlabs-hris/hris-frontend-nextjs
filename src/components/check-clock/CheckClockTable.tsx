'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { format } from "date-fns"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, CheckCircle2, Eye, FileDown, ListFilter, MoreHorizontal, Trash2, XCircle, Loader2 } from "lucide-react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DateRange } from "react-day-picker"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { attendanceApi, Attendance, AttendanceFilter, ListAttendanceResponse } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

// Extended Attendance with additional fields for UI
export interface AttendanceWithEmployee extends Attendance {
    employee_code?: string;
    branch_name?: string;
}

// View Attendance Sheet with Approve/Reject
const ViewAttendanceSheet = ({ 
    record, 
    onApprove, 
    onReject,
    isApproving,
    isRejecting 
}: { 
    record: AttendanceWithEmployee;
    onApprove: (id: string) => void;
    onReject: (id: string, reason: string) => void;
    isApproving: boolean;
    isRejecting: boolean;
}) => {
    const [rejectReason, setRejectReason] = React.useState('');
    
    const formatTime = (timeStr?: string) => {
        if (!timeStr) return '-';
        // Format from backend is "2006-01-02 15:04:05" - extract HH:MM
        if (timeStr.includes(' ')) {
            const timePart = timeStr.split(' ')[1];
            return timePart ? timePart.substring(0, 5) : '-';
        }
        // Fallback for time-only format (HH:MM:SS or HH:MM)
        return timeStr.substring(0, 5);
    };

    const formatWorkHours = (hours?: number) => {
        if (!hours) return '-';
        const h = Math.floor(hours);
        const mins = Math.round((hours - h) * 60);
        return `${h}h ${mins}m`;
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'present':
            case 'on_time':
                return <Badge className="bg-green-500">On Time</Badge>;
            case 'late':
                return <Badge className="bg-red-500">Late</Badge>;
            case 'waiting_approval':
                return <Badge className="bg-yellow-400 text-yellow-900">Waiting Approval</Badge>;
            case 'absent':
                return <Badge className="bg-gray-500">Absent</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm">View</Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px]">
                <SheetHeader>
                    <SheetTitle>Attendance Details</SheetTitle>
                    <SheetDescription>
                        Detailed attendance information for {record.employee_name || 'Employee'}.
                    </SheetDescription>
                </SheetHeader>
                <div className="space-y-6 py-4">
                    <div className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-lg font-semibold text-gray-600">
                                {record.employee_name?.charAt(0) || 'E'}
                            </span>
                        </div>
                        <div>
                            <p className="font-semibold">{record.employee_name || 'Unknown Employee'}</p>
                            <p className="text-sm text-gray-500">{record.employee_position || 'No Position'}</p>
                            <p className="text-xs text-gray-400">{record.employee_code}</p>
                        </div>
                        {getStatusBadge(record.status)}
                    </div>
                    
                    <Card>
                        <CardHeader>
                            <CardTitle>Attendance Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Date:</span>
                                <span>{record.date ? format(new Date(record.date), "PPP") : '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Check In:</span>
                                <span>{formatTime(record.clock_in_time)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Check Out:</span>
                                <span>{formatTime(record.clock_out_time)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Work Hours:</span>
                                <span>{formatWorkHours(record.working_hours)}</span>
                            </div>
                            {record.is_late && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Late:</span>
                                    <span className="text-red-500">{record.late_minutes} minutes</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader>
                            <CardTitle>Location Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Branch:</span>
                                <span>{record.branch_name || '-'}</span>
                            </div>
                            {record.clock_in_latitude && record.clock_in_longitude && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Clock In Location:</span>
                                    <span className="text-xs">{record.clock_in_latitude.toFixed(6)}, {record.clock_in_longitude.toFixed(6)}</span>
                                </div>
                            )}
                            {record.clock_out_latitude && record.clock_out_longitude && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Clock Out Location:</span>
                                    <span className="text-xs">{record.clock_out_latitude.toFixed(6)}, {record.clock_out_longitude.toFixed(6)}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
                
                {record.status === 'waiting_approval' && (
                    <div className="mt-4 space-y-4">
                        <div className="space-y-2">
                            <Label>Rejection Reason (required for reject)</Label>
                            <Textarea 
                                placeholder="Enter reason for rejection..."
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                            />
                        </div>
                        <SheetFooter className="flex gap-2">
                            <Button 
                                variant="destructive" 
                                onClick={() => onReject(record.id, rejectReason)}
                                disabled={isRejecting || isApproving || !rejectReason.trim()}
                                className="flex-1"
                            >
                                {isRejecting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <XCircle className="h-4 w-4 mr-2" />}
                                Reject
                            </Button>
                            <Button 
                                onClick={() => onApprove(record.id)}
                                disabled={isApproving || isRejecting}
                                className="flex-1"
                            >
                                {isApproving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                                Approve
                            </Button>
                        </SheetFooter>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
};

// Filter Dialog
const FilterDialog = ({ onApplyFilter }: { onApplyFilter: (filters: { status: string; date: DateRange | undefined }) => void }) => {
    const [status, setStatus] = useState('');
    const [date, setDate] = React.useState<DateRange | undefined>();
    
    const handleApply = () => {
        onApplyFilter({ status, date });
    };

    const handleReset = () => {
        setStatus('');
        setDate(undefined);
        onApplyFilter({ status: '', date: undefined });
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                    <ListFilter className="h-4 w-4" />
                    <span>Filter</span>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Filter Attendance</DialogTitle>
                    <DialogDescription>Filter the attendance list based on criteria below.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select onValueChange={setStatus} value={status}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Statuses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="waiting_approval">Waiting Approval</SelectItem>
                                <SelectItem value="on_time">On Time</SelectItem>
                                <SelectItem value="present">Present</SelectItem>
                                <SelectItem value="late">Late</SelectItem>
                                <SelectItem value="absent">Absent</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Date Range</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    id="date"
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date?.from ? (
                                        date.to ? (
                                            <>
                                                {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                                            </>
                                        ) : (
                                            format(date.from, "LLL dd, y")
                                        )
                                    ) : (
                                        <span>Pick a date range</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={date?.from}
                                    selected={date}
                                    onSelect={setDate}
                                    numberOfMonths={2}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={handleReset}>Reset</Button>
                    <Button onClick={handleApply}>Apply Filter</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

// --- Main Table Component ---

interface CheckClockTableProps {
    searchQuery: string;
}

export default function CheckClockTable({ searchQuery }: CheckClockTableProps) {
    const [attendanceData, setAttendanceData] = useState<AttendanceWithEmployee[]>([]);
    const [filteredData, setFilteredData] = useState<AttendanceWithEmployee[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [approvingId, setApprovingId] = useState<string | null>(null);
    const [rejectingId, setRejectingId] = useState<string | null>(null);
    const [filters, setFilters] = useState<{ status: string; date: DateRange | undefined }>({ status: '', date: undefined });
    const [dialogRejectReason, setDialogRejectReason] = useState<string>('');
    const { toast } = useToast();

    // Fetch attendance data
    const fetchAttendance = useCallback(async () => {
        try {
            setIsLoading(true);
            const filter: AttendanceFilter = {};
            
            if (filters.status && filters.status !== 'all') {
                filter.status = filters.status;
            }
            if (filters.date?.from) {
                filter.start_date = format(filters.date.from, 'yyyy-MM-dd');
            }
            if (filters.date?.to) {
                filter.end_date = format(filters.date.to, 'yyyy-MM-dd');
            }

            const response = await attendanceApi.list(filter);
            if (response.success && response.data) {
                // Extract attendances array from ListAttendanceResponse
                const listResponse = response.data;
                setAttendanceData(listResponse.attendances as AttendanceWithEmployee[]);
            } else {
                setAttendanceData([]);
            }
        } catch (error) {
            console.error('Failed to fetch attendance:', error);
            setAttendanceData([]);
            toast({
                title: "Error",
                description: "Failed to fetch attendance data",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }, [filters, toast]);

    useEffect(() => {
        fetchAttendance();
    }, [fetchAttendance]);

    // Filter by search query (realtime)
    useEffect(() => {
        if (!attendanceData || !Array.isArray(attendanceData)) {
            setFilteredData([]);
            return;
        }
        
        if (!searchQuery.trim()) {
            setFilteredData(attendanceData);
        } else {
            const query = searchQuery.toLowerCase();
            const filtered = attendanceData.filter(record => 
                record.employee_name?.toLowerCase().includes(query) ||
                record.employee_code?.toLowerCase().includes(query) ||
                record.employee_position?.toLowerCase().includes(query) ||
                record.branch_name?.toLowerCase().includes(query)
            );
            setFilteredData(filtered);
        }
    }, [searchQuery, attendanceData]);

    // Handle approve
    const handleApprove = async (id: string) => {
        try {
            setApprovingId(id);
            const response = await attendanceApi.approve(id);
            if (response.success) {
                toast({
                    title: "Success",
                    description: "Attendance approved successfully",
                });
                fetchAttendance();
            } else {
                throw new Error(response.message || 'Failed to approve');
            }
        } catch (error) {
            console.error('Failed to approve:', error);
            toast({
                title: "Error",
                description: "Failed to approve attendance",
                variant: "destructive",
            });
        } finally {
            setApprovingId(null);
        }
    };

    // Handle reject
    const handleReject = async (id: string, reason: string) => {
        if (!reason.trim()) {
            toast({
                title: "Error",
                description: "Rejection reason is required",
                variant: "destructive",
            });
            return;
        }
        try {
            setRejectingId(id);
            const response = await attendanceApi.reject(id, reason);
            if (response.success) {
                toast({
                    title: "Success",
                    description: "Attendance rejected successfully",
                });
                fetchAttendance();
            } else {
                throw new Error(response.message || 'Failed to reject');
            }
        } catch (error) {
            console.error('Failed to reject:', error);
            toast({
                title: "Error",
                description: "Failed to reject attendance",
                variant: "destructive",
            });
        } finally {
            setRejectingId(null);
        }
    };

    // Handle delete
    const handleDelete = async (id: string) => {
        try {
            const response = await attendanceApi.delete(id);
            if (response.success) {
                toast({
                    title: "Success",
                    description: "Attendance record deleted successfully",
                });
                fetchAttendance();
            } else {
                throw new Error(response.message || 'Failed to delete');
            }
        } catch (error) {
            console.error('Failed to delete:', error);
            toast({
                title: "Error",
                description: "Failed to delete attendance record",
                variant: "destructive",
            });
        }
    };

    // Handle filter apply
    const handleApplyFilter = (newFilters: { status: string; date: DateRange | undefined }) => {
        setFilters(newFilters);
    };

    // Download PDF
    const handleDownloadPDF = () => {
        const doc = new jsPDF();
        doc.text("Check Clock Overview Report", 14, 16);
        doc.text(`Generated: ${format(new Date(), "PPP")}`, 14, 24);
        
        const tableColumn = ["Employee", "Position", "Date", "Clock In", "Clock Out", "Status"];
        const tableRows: string[][] = [];
        
        filteredData.forEach(record => {
            tableRows.push([
                record.employee_name || '-',
                record.employee_position || '-',
                record.date ? format(new Date(record.date), "yyyy-MM-dd") : '-',
                record.clock_in_time?.substring(0, 5) || '-',
                record.clock_out_time?.substring(0, 5) || '-',
                record.status || '-'
            ]);
        });
        
        autoTable(doc, { head: [tableColumn], body: tableRows, startY: 30 });
        doc.save("check_clock_report.pdf");
    };

    // Format time helper - backend returns "YYYY-MM-DD HH:MM:SS" format
    const formatTime = (timeStr?: string) => {
        if (!timeStr) return '-';
        // Format from backend is "2006-01-02 15:04:05" - extract HH:MM
        if (timeStr.includes(' ')) {
            const timePart = timeStr.split(' ')[1];
            return timePart ? timePart.substring(0, 5) : '-';
        }
        // Fallback for time-only format (HH:MM:SS or HH:MM)
        return timeStr.substring(0, 5);
    };

    // Get status badge
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'present':
            case 'on_time':
                return <Badge className="bg-green-500">On Time</Badge>;
            case 'late':
                return <Badge className="bg-red-500">Late</Badge>;
            case 'waiting_approval':
                return <Badge className="bg-yellow-400 text-yellow-900 cursor-pointer hover:bg-yellow-500">Waiting</Badge>;
            case 'absent':
                return <Badge className="bg-gray-500">Absent</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading attendance data...</span>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-end gap-2">
                <FilterDialog onApplyFilter={handleApplyFilter} />
                <Button variant="outline" size="sm" className="gap-1" onClick={handleDownloadPDF}>
                    <FileDown className="h-4 w-4" />
                    <span>Download</span>
                </Button>
            </div>
            
            <div className="rounded-md border">
                <Table>
                    <TableHeader className="bg-slate-100 dark:bg-slate-800">
                        <TableRow>
                            <TableHead>Employee</TableHead>
                            <TableHead>Position</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Clock In</TableHead>
                            <TableHead>Clock Out</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Details</TableHead>
                            <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-10 text-gray-500">
                                    {searchQuery ? 'No matching records found' : 'No attendance records found'}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredData.map((record) => (
                                <TableRow key={record.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            {record.status !== 'waiting_approval' && (
                                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                            )}
                                            <div>
                                                <p>{record.employee_name || 'Unknown'}</p>
                                                <p className="text-xs text-gray-400">{record.employee_code}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{record.employee_position || '-'}</TableCell>
                                    <TableCell>{record.date ? format(new Date(record.date), "MMM dd, yyyy") : '-'}</TableCell>
                                    <TableCell>{formatTime(record.clock_in_time)}</TableCell>
                                    <TableCell>{formatTime(record.clock_out_time)}</TableCell>
                                    <TableCell>
                                        {record.status === 'waiting_approval' ? (
                                            <AlertDialog onOpenChange={(open) => { if (!open) setDialogRejectReason(''); }}>
                                                <AlertDialogTrigger asChild>
                                                    {getStatusBadge(record.status)}
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Approve or Reject Attendance</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            What would you like to do with this attendance record for {record.employee_name}?
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <div className="py-4">
                                                        <Label htmlFor="reject-reason" className="text-sm font-medium">
                                                            Rejection Reason (required for reject)
                                                        </Label>
                                                        <Textarea
                                                            id="reject-reason"
                                                            placeholder="Enter reason for rejection..."
                                                            value={dialogRejectReason}
                                                            onChange={(e) => setDialogRejectReason(e.target.value)}
                                                            className="mt-2"
                                                            rows={3}
                                                        />
                                                    </div>
                                                    <AlertDialogFooter className="gap-2">
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <Button 
                                                            variant="destructive"
                                                            onClick={() => {
                                                                if (!dialogRejectReason.trim()) {
                                                                    toast({
                                                                        title: "Error",
                                                                        description: "Please provide a rejection reason",
                                                                        variant: "destructive",
                                                                    });
                                                                    return;
                                                                }
                                                                handleReject(record.id, dialogRejectReason);
                                                            }}
                                                            disabled={rejectingId === record.id || !dialogRejectReason.trim()}
                                                        >
                                                            {rejectingId === record.id ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <XCircle className="h-4 w-4 mr-2" />}
                                                            Reject
                                                        </Button>
                                                        <Button 
                                                            onClick={() => handleApprove(record.id)}
                                                            disabled={approvingId === record.id}
                                                        >
                                                            {approvingId === record.id ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                                                            Approve
                                                        </Button>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        ) : (
                                            getStatusBadge(record.status)
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <ViewAttendanceSheet 
                                            record={record}
                                            onApprove={handleApprove}
                                            onReject={handleReject}
                                            isApproving={approvingId === record.id}
                                            isRejecting={rejectingId === record.id}
                                        />
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4"/>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {record.status === 'waiting_approval' && (
                                                    <>
                                                        <DropdownMenuItem onClick={() => handleApprove(record.id)}>
                                                            <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                                                            Approve
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm text-red-500 outline-none transition-colors hover:bg-accent focus:bg-accent-foreground">
                                                            <Trash2 className="mr-2 h-4 w-4"/> Delete
                                                        </div>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Delete Record</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This will permanently delete the attendance record for {record.employee_name}.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDelete(record.id)}>
                                                                Delete
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            
            <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                    Showing {filteredData.length} of {attendanceData.length} records
                </div>
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious href="#" />
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationLink href="#" isActive>1</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationNext href="#" />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </div>
    );
}

