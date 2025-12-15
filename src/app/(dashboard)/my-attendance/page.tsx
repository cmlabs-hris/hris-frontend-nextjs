'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Loader2, Calendar, Clock, MapPin, Image as ImageIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { attendanceApi, Attendance, getUploadUrl } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns';

const STATUS_COLORS: Record<string, string> = {
    'present': 'bg-green-100 text-green-800',
    'late': 'bg-orange-100 text-orange-800',
    'absent': 'bg-red-100 text-red-800',
    'waiting_approval': 'bg-yellow-100 text-yellow-800',
    'on_leave': 'bg-blue-100 text-blue-800',
    'holiday': 'bg-purple-100 text-purple-800',
};

const STATUS_LABELS: Record<string, string> = {
    'present': 'Present',
    'late': 'Late',
    'absent': 'Absent',
    'waiting_approval': 'Waiting Approval',
    'on_leave': 'On Leave',
    'holiday': 'Holiday',
};

export default function MyAttendancePage() {
    const { toast } = useToast();
    const [attendances, setAttendances] = useState<Attendance[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedAttendance, setSelectedAttendance] = useState<Attendance | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    
    // Filter state
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [statusFilter, setStatusFilter] = useState<string>('all');
    
    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const limit = 10;

    const fetchAttendances = useCallback(async () => {
        setIsLoading(true);
        try {
            const startDate = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
            const endDate = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
            
            const response = await attendanceApi.getMyAttendance({
                start_date: startDate,
                end_date: endDate,
                status: statusFilter !== 'all' ? statusFilter : undefined,
                page,
                limit,
                sort_by: 'date',
                sort_order: 'desc',
            });
            
            if (response.success && response.data) {
                setAttendances(response.data.attendances || []);
                setTotalCount(response.data.total_count || 0);
                setTotalPages(response.data.total_pages || 1);
            }
        } catch (error) {
            console.error('Failed to fetch attendances:', error);
            toast({
                title: "Error",
                description: "Failed to load attendance data",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }, [currentMonth, statusFilter, page, toast]);

    useEffect(() => {
        fetchAttendances();
    }, [fetchAttendances]);

    const handleViewDetail = (attendance: Attendance) => {
        setSelectedAttendance(attendance);
        setIsSheetOpen(true);
    };

    const formatTime = (timeStr: string | null | undefined) => {
        if (!timeStr) return '-';
        // Format: "2025-01-15 08:30:00" -> "08:30"
        const parts = timeStr.split(' ');
        if (parts.length >= 2) {
            return parts[1].substring(0, 5);
        }
        return timeStr.substring(0, 5);
    };

    const formatDate = (dateStr: string) => {
        try {
            return format(new Date(dateStr), 'dd MMM yyyy');
        } catch {
            return dateStr;
        }
    };

    const handlePrevMonth = () => {
        setCurrentMonth(subMonths(currentMonth, 1));
        setPage(1);
    };

    const handleNextMonth = () => {
        setCurrentMonth(addMonths(currentMonth, 1));
        setPage(1);
    };

    // Calculate summary
    const summary = {
        total: attendances.length,
        present: attendances.filter(a => a.status === 'present').length,
        late: attendances.filter(a => a.status === 'late').length,
        absent: attendances.filter(a => a.status === 'absent').length,
        waiting: attendances.filter(a => a.status === 'waiting_approval').length,
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">My Attendance</h1>
                <p className="text-muted-foreground">View your attendance history and status</p>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-5">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total Records</CardDescription>
                        <CardTitle className="text-3xl">{totalCount}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Present</CardDescription>
                        <CardTitle className="text-3xl text-green-600">{summary.present}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Late</CardDescription>
                        <CardTitle className="text-3xl text-orange-600">{summary.late}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Absent</CardDescription>
                        <CardTitle className="text-3xl text-red-600">{summary.absent}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Waiting Approval</CardDescription>
                        <CardTitle className="text-3xl text-yellow-600">{summary.waiting}</CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Attendance History</CardTitle>
                    <CardDescription>
                        Your clock in/out records for {format(currentMonth, 'MMMM yyyy')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-4 mb-4">
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <div className="w-40 text-center font-medium">
                                {format(currentMonth, 'MMMM yyyy')}
                            </div>
                            <Button variant="outline" size="icon" onClick={handleNextMonth}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex items-center gap-2">
                            <Label>Status:</Label>
                            <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setPage(1); }}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="present">Present</SelectItem>
                                    <SelectItem value="late">Late</SelectItem>
                                    <SelectItem value="absent">Absent</SelectItem>
                                    <SelectItem value="waiting_approval">Waiting Approval</SelectItem>
                                    <SelectItem value="on_leave">On Leave</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : attendances.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No attendance records found for this period.
                        </div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Clock In</TableHead>
                                        <TableHead>Clock Out</TableHead>
                                        <TableHead>Work Hours</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {attendances.map((attendance) => (
                                        <TableRow key={attendance.id}>
                                            <TableCell className="font-medium">
                                                {formatDate(attendance.date)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                                    {formatTime(attendance.clock_in_time)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                                    {formatTime(attendance.clock_out_time)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {attendance.working_hours ? `${attendance.working_hours}h` : '-'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={STATUS_COLORS[attendance.status] || 'bg-gray-100 text-gray-800'}>
                                                    {STATUS_LABELS[attendance.status] || attendance.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm"
                                                    onClick={() => handleViewDetail(attendance)}
                                                >
                                                    View
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between mt-4">
                                    <p className="text-sm text-muted-foreground">
                                        Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalCount)} of {totalCount} records
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            disabled={page <= 1}
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                            disabled={page >= totalPages}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Detail Sheet */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="sm:max-w-lg">
                    <SheetHeader>
                        <SheetTitle>Attendance Detail</SheetTitle>
                        <SheetDescription>
                            {selectedAttendance && formatDate(selectedAttendance.date)}
                        </SheetDescription>
                    </SheetHeader>
                    {selectedAttendance && (
                        <div className="mt-6 space-y-6">
                            <div className="flex justify-center">
                                <Badge className={`${STATUS_COLORS[selectedAttendance.status] || 'bg-gray-100'} px-4 py-1`}>
                                    {STATUS_LABELS[selectedAttendance.status] || selectedAttendance.status}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-muted rounded-lg">
                                    <p className="text-xs text-muted-foreground mb-1">Clock In</p>
                                    <p className="text-2xl font-bold">{formatTime(selectedAttendance.clock_in_time)}</p>
                                    {selectedAttendance.late_minutes && selectedAttendance.late_minutes > 0 && (
                                        <p className="text-xs text-red-600">Late {selectedAttendance.late_minutes} mins</p>
                                    )}
                                </div>
                                <div className="p-4 bg-muted rounded-lg">
                                    <p className="text-xs text-muted-foreground mb-1">Clock Out</p>
                                    <p className="text-2xl font-bold">{formatTime(selectedAttendance.clock_out_time)}</p>
                                    {selectedAttendance.early_leave_minutes && selectedAttendance.early_leave_minutes > 0 && (
                                        <p className="text-xs text-orange-600">Early {selectedAttendance.early_leave_minutes} mins</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Work Hours</p>
                                        <p className="font-medium">{selectedAttendance.working_hours ? `${selectedAttendance.working_hours} hours` : '-'}</p>
                                    </div>
                                </div>

                                {selectedAttendance.late_minutes && selectedAttendance.late_minutes > 0 && (
                                    <div className="flex items-start gap-3">
                                        <Clock className="h-5 w-5 text-orange-600 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Late</p>
                                            <p className="font-medium text-orange-600">{selectedAttendance.late_minutes} minutes</p>
                                        </div>
                                    </div>
                                )}

                                {selectedAttendance.early_leave_minutes && selectedAttendance.early_leave_minutes > 0 && (
                                    <div className="flex items-start gap-3">
                                        <Clock className="h-5 w-5 text-amber-600 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Early Leave</p>
                                            <p className="font-medium text-amber-600">{selectedAttendance.early_leave_minutes} minutes</p>
                                        </div>
                                    </div>
                                )}

                                {(selectedAttendance.clock_in_latitude && selectedAttendance.clock_in_longitude) && (
                                    <div className="flex items-start gap-3">
                                        <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Clock In Location</p>
                                            <p className="text-sm">{selectedAttendance.clock_in_latitude}, {selectedAttendance.clock_in_longitude}</p>
                                        </div>
                                    </div>
                                )}

                                {(selectedAttendance.clock_out_latitude && selectedAttendance.clock_out_longitude) && (
                                    <div className="flex items-start gap-3">
                                        <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Clock Out Location</p>
                                            <p className="text-sm">{selectedAttendance.clock_out_latitude}, {selectedAttendance.clock_out_longitude}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Photos */}
                            <div className="grid grid-cols-2 gap-4">
                                {selectedAttendance.clock_in_proof_url && (
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-2">Clock In Photo</p>
                                        <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                                            <img 
                                                src={getUploadUrl(selectedAttendance.clock_in_proof_url)} 
                                                alt="Clock in"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>
                                )}
                                {selectedAttendance.clock_out_proof_url && (
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-2">Clock Out Photo</p>
                                        <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                                            <img 
                                                src={getUploadUrl(selectedAttendance.clock_out_proof_url)} 
                                                alt="Clock out"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}
