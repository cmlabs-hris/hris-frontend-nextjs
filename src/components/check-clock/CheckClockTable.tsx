'use client'

import React, { useState, useEffect } from 'react';
import { format } from "date-fns"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, CheckCircle2, Eye, PlusCircle, FileDown, ListFilter } from "lucide-react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DateRange } from "react-day-picker"


// --- DATA SIMULASI ---
const initialAttendanceData = [
    { id: 1, employeeName: "Emily Davis", jabatan: "Developer", clockIn: "08:30", clockOut: "16:30", workHours: 8, approve: "Cabang Jakarta", status: "Waiting", statusApprove: "Waiting", date: new Date("2025-10-10") },
    { id: 2, employeeName: "Jane Doe", jabatan: "Designer", clockIn: "08:32", clockOut: "16:30", workHours: 8, approve: "Cabang Bandung", status: "OnTime", statusApprove: "Approved", date: new Date("2025-10-10") },
    { id: 3, employeeName: "Peter Jones", jabatan: "Manager", clockIn: "09:15", clockOut: "17:00", workHours: 8, approve: "Pusat", status: "Late", statusApprove: "Approved", date: new Date("2025-10-11") },
    { id: 4, employeeName: "Mary Jane", jabatan: "QA", clockIn: "08:25", clockOut: "16:30", workHours: 8, approve: "Cabang Jakarta", status: "Waiting", statusApprove: "Waiting", date: new Date("2025-10-11") },
    { id: 5, employeeName: "John Doe", jabatan: "Developer", clockIn: "08:50", clockOut: "16:30", workHours: 8, approve: "Cabang Jakarta", status: "Late", statusApprove: "Approved", date: new Date("2025-10-12") },
];


// --- Komponen Anak (TIDAK BERUBAH) ---
const AddCheckClockDialog = () => ( <Dialog><DialogTrigger asChild><Button size="sm" className="gap-1"><PlusCircle className="h-4 w-4" /><span>Add</span></Button></DialogTrigger><DialogContent className="max-w-3xl"><DialogHeader><DialogTitle>Add Check Clock</DialogTitle><DialogDescription>Manually add an employee attendance record.</DialogDescription></DialogHeader><div className="grid grid-cols-2 gap-6 py-4"><div className="space-y-4"><div className="space-y-2"><Label>Karyawan</Label><Select><SelectTrigger><SelectValue placeholder="Pilih Karyawan" /></SelectTrigger><SelectContent><SelectItem value="1">Clarsa</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label>Tipe Absensi</Label><Select><SelectTrigger><SelectValue placeholder="Pilih Tipe Absensi" /></SelectTrigger><SelectContent><SelectItem value="clock-in">Clock In</SelectItem><SelectItem value="clock-out">Clock Out</SelectItem><SelectItem value="annual">Annual Leave</SelectItem><SelectItem value="sick">Sick Leave</SelectItem><SelectItem value="permit">Permit</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label>Upload Bukti pendukung</Label><div className="flex items-center justify-center w-full"><Label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"><div className="flex flex-col items-center justify-center pt-5 pb-6"><p className="mb-2 text-sm text-gray-500">Drag n Drop here</p><p className="text-xs text-gray-500">Or Browser</p></div><Input id="dropzone-file" type="file" className="hidden" /></Label></div><Button className="w-full">Upload Now</Button></div></div><div className="space-y-4"><div className="space-y-2"><Label>Lokasi</Label><Select><SelectTrigger><SelectValue placeholder="Pilih Lokal" /></SelectTrigger><SelectContent><SelectItem value="1">Kantor Pusat</SelectItem></SelectContent></Select></div><div className="h-48 w-full bg-gray-200 rounded-md flex items-center justify-center"><p className="text-gray-500">[Map Placeholder]</p></div><div className="space-y-2"><Label>Detail Alamat</Label><Input placeholder="Detail Alamat" readOnly /></div><div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Lat</Label><Input placeholder="Lat Location" readOnly /></div><div className="space-y-2"><Label>Long</Label><Input placeholder="Long Location" readOnly /></div></div></div></div><DialogFooter><Button variant="outline">Cancel</Button><Button>Save</Button></DialogFooter></DialogContent></Dialog>);
const ViewAttendanceSheet = ({ record }: { record: any }) => ( <Sheet><SheetTrigger asChild><Button variant="outline" size="sm">View</Button></SheetTrigger><SheetContent className="w-[400px] sm:w-[540px]"><SheetHeader><SheetTitle>Approve Attendance</SheetTitle><SheetDescription>Detailed attendance information for {record.employeeName}.</SheetDescription></SheetHeader><div className="space-y-6 py-4"><div className="flex items-center gap-4 p-4 border rounded-lg"><div className="w-12 h-12 bg-gray-200 rounded-full" /><div><p className="font-semibold">{record.employeeName}</p><p className="text-sm text-gray-500">{record.jabatan}</p></div><Badge variant={record.statusApprove === 'Approved' ? 'default' : 'secondary'} className="ml-auto">{record.statusApprove}</Badge></div><Card><CardHeader><CardTitle>Attendance Information</CardTitle></CardHeader><CardContent className="space-y-2"><div className="flex justify-between"><span>Date:</span> <span>{format(record.date, "PPP")}</span></div><div className="flex justify-between"><span>Check In:</span> <span>{record.clockIn}</span></div><div className="flex justify-between"><span>Check Out:</span> <span>{record.clockOut}</span></div><div className="flex justify-between"><span>Work Hours:</span> <span>{record.workHours}</span></div></CardContent></Card><Card><CardHeader><CardTitle>Location Information</CardTitle></CardHeader><CardContent className="space-y-2"><div className="flex justify-between"><span>Location:</span> <span>Kantor Pusat</span></div><div className="flex justify-between"><span>Address:</span> <span>Jl. Veteran No.1, Kota Malang</span></div></CardContent></Card><Card><CardHeader><CardTitle>Proof of Attendance</CardTitle></CardHeader><CardContent className="flex items-center justify-between"><p>Proof of Attendance.JPEG</p><div className="flex gap-2"><Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button><Button variant="ghost" size="icon"><FileDown className="h-4 w-4" /></Button></div></CardContent></Card></div></SheetContent></Sheet>);
const ApproveAttendanceDialog = ({ onApprove }: { onApprove: () => void }) => ( <AlertDialog><AlertDialogTrigger asChild><Badge className="cursor-pointer bg-yellow-400 hover:bg-yellow-500 text-yellow-900">Waiting</Badge></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Approve Attendance</AlertDialogTitle><AlertDialogDescription>Are you sure you want to approve this employee's attendance? This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Reject</AlertDialogCancel><AlertDialogAction onClick={onApprove}>Approve</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>);


// --- KOMPONEN BARU UNTUK FILTER ---
const FilterDialog = ({ onApplyFilter }: { onApplyFilter: (filters: any) => void }) => {
    const [name, setName] = useState('');
    const [status, setStatus] = useState('');
    const [date, setDate] = React.useState<DateRange | undefined>()

    const handleApply = () => {
        onApplyFilter({ name, status, date });
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1"><ListFilter className="h-4 w-4" /><span>Filter</span></Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Filter Attendance</DialogTitle>
                    <DialogDescription>Filter the attendance list based on criteria below.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                     <div className="space-y-2">
                        <Label htmlFor="name">Employee Name</Label>
                        <Input id="name" placeholder="Filter by name..." value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                         <Select onValueChange={setStatus} value={status}>
                            <SelectTrigger><SelectValue placeholder="All Statuses" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="Waiting">Waiting</SelectItem>
                                <SelectItem value="OnTime">OnTime</SelectItem>
                                <SelectItem value="Late">Late</SelectItem>
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
                                className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date?.from ? (
                                date.to ? (<> {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")} </>) : (format(date.from, "LLL dd, y"))) : (<span>Pick a date range</span>)}
                            </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar initialFocus mode="range" defaultMonth={date?.from} selected={date} onSelect={setDate} numberOfMonths={2}/>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleApply}>Apply Filter</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
};


// --- Komponen Tabel Utama ---

export default function CheckClockTable() {
    const [attendanceData, setAttendanceData] = useState(initialAttendanceData);
    const [filteredData, setFilteredData] = useState(initialAttendanceData);

    const handleApprove = (id: number) => {
        const updateData = (data: typeof initialAttendanceData) => 
            data.map(item => item.id === id ? { ...item, status: "OnTime", statusApprove: "Approved" } : item);
        
        setAttendanceData(updateData(attendanceData));
        setFilteredData(updateData(filteredData));
    };

    const handleDownloadPDF = () => {
        const doc = new jsPDF();
        doc.text("Check Clock Overview Report", 14, 16);
        const tableColumn = ["Employee Name", "Jabatan", "Clock In", "Clock Out", "Work Hours", "Status"];
        const tableRows: any[] = [];
        filteredData.forEach(record => {
            tableRows.push([record.employeeName, record.jabatan, record.clockIn, record.clockOut, record.workHours.toString(), record.status]);
        });
        autoTable(doc, { head: [tableColumn], body: tableRows, startY: 20 });
        doc.save("check_clock_report.pdf");
    };
    
    const handleApplyFilter = (filters: { name: string, status: string, date: DateRange | undefined }) => {
        let data = [...initialAttendanceData];
        if (filters.name) {
            data = data.filter(item => item.employeeName.toLowerCase().includes(filters.name.toLowerCase()));
        }
        if (filters.status && filters.status !== 'all') {
            data = data.filter(item => item.status === filters.status);
        }
        if (filters.date?.from) {
             data = data.filter(item => item.date >= filters.date!.from!);
        }
         if (filters.date?.to) {
             data = data.filter(item => item.date <= filters.date!.to!);
        }
        setFilteredData(data);
    };

    const getStatusBadge = (status: string, onApprove: () => void) => {
        switch (status) {
            case "Waiting": return <ApproveAttendanceDialog onApprove={onApprove} />;
            case "OnTime": return <Badge className="bg-green-500 hover:bg-green-600">OnTime</Badge>;
            case "Late": return <Badge variant="destructive">Late</Badge>;
            default: return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-4">
             <div className="flex items-center justify-end gap-2">
                {/* --- PERBAIKAN DI SINI --- */}
                <FilterDialog onApplyFilter={handleApplyFilter} />
                <Button variant="outline" size="sm" className="gap-1" onClick={handleDownloadPDF}><FileDown className="h-4 w-4" /><span>Download</span></Button>
                <AddCheckClockDialog />
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader className="bg-slate-100">
                        <TableRow>
                            <TableHead>Employee Name</TableHead>
                            <TableHead>Jabatan</TableHead>
                            <TableHead>Clock in</TableHead>
                            <TableHead>Clock out</TableHead>
                            <TableHead>Work Hours</TableHead>
                            <TableHead>Approve</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Details</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.map((record) => (
                            <TableRow key={record.id}>
                                <TableCell className="font-medium flex items-center gap-2">
                                     {record.statusApprove === 'Approved' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                                     {record.employeeName}
                                </TableCell>
                                <TableCell>{record.jabatan}</TableCell>
                                <TableCell>{record.clockIn}</TableCell>
                                <TableCell>{record.clockOut}</TableCell>
                                <TableCell>{record.workHours}</TableCell>
                                <TableCell>{record.approve}</TableCell>
                                <TableCell>{getStatusBadge(record.status, () => handleApprove(record.id))}</TableCell>
                                <TableCell><ViewAttendanceSheet record={record} /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Showing 1 to {filteredData.length} of {initialAttendanceData.length} records</div>
                <Pagination>
                    <PaginationContent>
                        <PaginationItem><PaginationPrevious href="#" /></PaginationItem>
                        <PaginationItem><PaginationLink href="#" isActive>1</PaginationLink></PaginationItem>
                        <PaginationItem><PaginationNext href="#" /></PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </div>
    );
}

