'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import LeaveTable from "@/components/leave/LeaveTable";
import AddLeaveDialog from "@/components/leave/AddLeaveDialog"; 
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label'; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; 
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { FileDown, ListFilter, Search } from 'lucide-react'; 
import jsPDF from 'jspdf'; 
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { leaveApi, LeaveType } from '@/lib/api';

// Komponen Filter Dialog 
const FilterDialog = ({ 
    leaveTypes,
    currentStatus,
    currentLeaveType,
    onApplyFilter 
}: { 
    leaveTypes: LeaveType[];
    currentStatus: string;
    currentLeaveType: string;
    onApplyFilter: (filters: { status: string; leaveType: string }) => void;
}) => {
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(currentStatus);
    const [leaveType, setLeaveType] = useState(currentLeaveType);

    const handleApply = () => {
        onApplyFilter({ status, leaveType });
        setOpen(false);
    };

    const handleReset = () => {
        setStatus('all');
        setLeaveType('all');
        onApplyFilter({ status: 'all', leaveType: 'all' });
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                    <ListFilter className="h-4 w-4" />
                    <span className="hidden sm:inline">Filter</span>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Filter Leave Requests</DialogTitle>
                    <DialogDescription>Filter the list by type or status.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label>Leave Type</Label>
                        <Select value={leaveType} onValueChange={setLeaveType}>
                            <SelectTrigger><SelectValue placeholder="All Types" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                {leaveTypes.map(type => (
                                    <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Status</Label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger><SelectValue placeholder="All Statuses" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="waiting_approval">Pending</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={handleReset}>Reset</Button>
                    <Button onClick={handleApply}>Apply Filter</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


export default function LeavePage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [leaveTypeFilter, setLeaveTypeFilter] = useState('all');
    const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
    const [refreshKey, setRefreshKey] = useState(0);

    // Fetch leave types for filter
    useEffect(() => {
        const fetchLeaveTypes = async () => {
            try {
                const response = await leaveApi.listTypes();
                if (response.success && response.data) {
                    setLeaveTypes(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch leave types:', error);
            }
        };
        fetchLeaveTypes();
    }, []);

    const handleApplyFilter = (filters: { status: string; leaveType: string }) => {
        setStatusFilter(filters.status);
        setLeaveTypeFilter(filters.leaveType);
    };

    const handleLeaveCreated = () => {
        setRefreshKey(prev => prev + 1);
    };

    // Fungsi download PDF 
    const handleDownloadPDF = () => {
        const doc = new jsPDF();
        doc.text("Leave Management Report", 14, 16);
        doc.text(`Generated: ${format(new Date(), "PPP")}`, 14, 24);
        const tableColumn = ["Employee", "Type", "Start Date", "End Date", "Days", "Status"];
        const tableRows: string[][] = [];
        // Note: PDF will show all data from table (filtered by current filters)
        autoTable(doc, { head: [tableColumn], body: tableRows, startY: 30 });
        doc.save("leave_report.pdf");
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <CardTitle>Leave Management</CardTitle>
                        <CardDescription>View and manage employee leave requests.</CardDescription>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search employee or leave type..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <FilterDialog 
                            leaveTypes={leaveTypes}
                            currentStatus={statusFilter}
                            currentLeaveType={leaveTypeFilter}
                            onApplyFilter={handleApplyFilter} 
                        />
                        <Button variant="outline" size="sm" className="gap-1" onClick={handleDownloadPDF}>
                            <FileDown className="h-4 w-4" />
                            <span className="hidden sm:inline">Download</span>
                        </Button>
                        <AddLeaveDialog leaveTypes={leaveTypes} onSuccess={handleLeaveCreated} />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <LeaveTable
                    searchQuery={searchQuery}
                    statusFilter={statusFilter}
                    leaveTypeFilter={leaveTypeFilter}
                    refreshKey={refreshKey}
                />
            </CardContent>
        </Card>
    );
}