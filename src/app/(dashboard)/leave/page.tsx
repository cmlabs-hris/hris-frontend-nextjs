'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import LeaveTable from "@/components/leave/LeaveTable";
import AddLeaveDialog from "@/components/leave/AddLeaveDialog"; 
import { Button } from '@/components/ui/button';
import { FileDown, ListFilter } from 'lucide-react'; 
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"; // Import Dialog
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label'; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; 
import jsPDF from 'jspdf'; 
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

// Tipe data untuk Pengajuan Cuti
export interface LeaveRequest {
    id: number;
    employeeName: string;
    leaveType: "Annual" | "Sick" | "Permit";
    startDate: Date;
    endDate: Date;
    reason: string;
    status: "Pending" | "Approved" | "Rejected";
}

// Data awal (fiktif)
const initialLeaveRequests: LeaveRequest[] = [
    { id: 1, employeeName: "John Doe", leaveType: "Annual", startDate: new Date("2025-11-10"), endDate: new Date("2025-11-12"), reason: "Family vacation", status: "Approved" },
    { id: 2, employeeName: "Jane Smith", leaveType: "Sick", startDate: new Date("2025-11-15"), endDate: new Date("2025-11-15"), reason: "Flu", status: "Pending" },
    { id: 3, employeeName: "Michael Johnson", leaveType: "Permit", startDate: new Date("2025-11-18"), endDate: new Date("2025-11-18"), reason: "Personal matter", status: "Rejected" },
];

// Komponen Filter Dialog 
const FilterDialog = ({ onApplyFilter }: { onApplyFilter: (filters: any) => void }) => {
    const [employeeName, setEmployeeName] = useState('');
    const [leaveType, setLeaveType] = useState('');
    const [status, setStatus] = useState('');

    const handleApply = () => {
        onApplyFilter({ employeeName, leaveType, status });
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                    <ListFilter className="h-4 w-4" />
                    <span className="hidden sm:inline">Filter</span>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Filter Leave Requests</DialogTitle>
                    <DialogDescription>Filter the list by employee, type, or status.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="employeeName">Employee Name</Label>
                        <Input id="employeeName" value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} placeholder="Filter by name..." />
                    </div>
                    <div className="space-y-2">
                        <Label>Leave Type</Label>
                        <Select value={leaveType} onValueChange={setLeaveType}>
                            <SelectTrigger><SelectValue placeholder="All Types" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="Annual">Annual</SelectItem>
                                <SelectItem value="Sick">Sick</SelectItem>
                                <SelectItem value="Permit">Permit</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Status</Label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger><SelectValue placeholder="All Statuses" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="Approved">Approved</SelectItem>
                                <SelectItem value="Rejected">Rejected</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleApply}>Apply Filter</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


export default function LeavePage() {
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(initialLeaveRequests);
    // State baru untuk data yang sudah difilter
    const [filteredRequests, setFilteredRequests] = useState<LeaveRequest[]>(initialLeaveRequests);

    const handleAddLeave = (newRequestData: Omit<LeaveRequest, 'id'>) => {
        const newRequest = { id: Date.now(), ...newRequestData };
        setLeaveRequests(prev => [newRequest, ...prev]);
        setFilteredRequests(prev => [newRequest, ...prev]); // Update data terfilter
    };

    const handleUpdateLeave = (updatedRequest: LeaveRequest) => {
        const updatedList = leaveRequests.map(req => req.id === updatedRequest.id ? updatedRequest : req);
        setLeaveRequests(updatedList);
        setFilteredRequests(updatedList); // Update data terfilter 
    };

    const handleDeleteLeave = (requestId: number) => {
        const updatedList = leaveRequests.filter(req => req.id !== requestId);
        setLeaveRequests(updatedList);
        setFilteredRequests(updatedList); // Update data terfilter 
    };

    // Fungsi download PDF 
    const handleDownloadPDF = () => {
        const doc = new jsPDF();
        doc.text("Leave Management Report", 14, 16);
        const tableColumn = ["Employee Name", "Type", "Start Date", "End Date", "Status"];
        const tableRows: any[][] = [];
        filteredRequests.forEach((request) => { // Gunakan data terfilter
            const requestData = [
                request.employeeName,
                request.leaveType,
                format(request.startDate, "PPP"),
                format(request.endDate, "PPP"),
                request.status,
            ];
            tableRows.push(requestData);
        });
        autoTable(doc, { head: [tableColumn], body: tableRows, startY: 20 });
        doc.save("leave_report.pdf");
     };

     // Fungsi untuk menerapkan filter
     const handleApplyFilter = (filters: { employeeName: string, leaveType: string, status: string }) => {
        let data = [...leaveRequests];
        if (filters.employeeName) {
            data = data.filter(item => item.employeeName.toLowerCase().includes(filters.employeeName.toLowerCase()));
        }
        if (filters.leaveType && filters.leaveType !== 'all') {
            data = data.filter(item => item.leaveType === filters.leaveType);
        }
        if (filters.status && filters.status !== 'all') {
            data = data.filter(item => item.status === filters.status);
        }
        setFilteredRequests(data);
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Leave Management</CardTitle>
                    <CardDescription>View and manage employee leave requests.</CardDescription>
                </div>
                 <div className="flex items-center gap-2">
                    <FilterDialog onApplyFilter={handleApplyFilter} />
                    <Button variant="outline" size="sm" className="gap-1" onClick={handleDownloadPDF}>
                        <FileDown className="h-4 w-4" />
                        <span className="hidden sm:inline">Download</span>
                    </Button>
                    <AddLeaveDialog onAddLeave={handleAddLeave} />
                </div>
            </CardHeader>
            <CardContent>
                <LeaveTable
                    requests={filteredRequests} // Tampilkan data yang sudah difilter
                    onUpdateLeave={handleUpdateLeave}
                    onDeleteLeave={handleDeleteLeave}
                />
            </CardContent>
        </Card>
    );
}

