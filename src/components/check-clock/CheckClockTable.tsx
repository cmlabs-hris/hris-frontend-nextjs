'use client'

import React, { useState, useEffect } from 'react';
import { format } from "date-fns"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, CheckCircle2, Eye, PlusCircle, FileDown, ListFilter, MoreHorizontal, Edit, Trash2 } from "lucide-react";
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
import { AttendanceRecord } from '@/app/(dashboard)/check-clock/page'; 
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";


// Add Absen
const AddCheckClockDialog = ({ onAddRecord }: { onAddRecord: (record: Omit<AttendanceRecord, 'id'>) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [employeeName, setEmployeeName] = useState('');
    
    const handleSubmit = () => {
        if (!employeeName) return alert('Employee name is required.');
        
        const newRecord: Omit<AttendanceRecord, 'id'> = {
            employeeName,
            jabatan: "Staff", // Data fiktif
            clockIn: "09:00",
            clockOut: "17:00",
            workHours: 8,
            approve: "Pusat",
            status: "Waiting",
            statusApprove: "Waiting",
            date: new Date(),
        };
        onAddRecord(newRecord);
        setIsOpen(false);
        setEmployeeName('');
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild><Button size="sm" className="gap-1"><PlusCircle className="h-4 w-4" /><span>Add</span></Button></DialogTrigger>
            <DialogContent><DialogHeader><DialogTitle>Add Check Clock</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2"><Label htmlFor="employeeName">Employee Name</Label><Input id="employeeName" value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} /></div>
                </div>
            <DialogFooter><Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button><Button onClick={handleSubmit}>Save</Button></DialogFooter></DialogContent>
        </Dialog>
    );
};

// Dialog Edit Absensi (BARU)
const EditCheckClockDialog = ({ record, onUpdateRecord, children }: { record: AttendanceRecord, onUpdateRecord: (rec: AttendanceRecord) => void, children: React.ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState(record);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({...prev, [e.target.id]: e.target.value}));
    };
    
    const handleSubmit = () => {
        onUpdateRecord(formData);
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <div onClick={() => setIsOpen(true)}>{children}</div>
            <DialogContent>
                <DialogHeader><DialogTitle>Edit Attendance for {record.employeeName}</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2"><Label htmlFor="clockIn">Clock In</Label><Input id="clockIn" value={formData.clockIn} onChange={handleChange} /></div>
                    <div className="space-y-2"><Label htmlFor="clockOut">Clock Out</Label><Input id="clockOut" value={formData.clockOut} onChange={handleChange} /></div>
                </div>
                <DialogFooter><Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button><Button onClick={handleSubmit}>Save Changes</Button></DialogFooter>
            </DialogContent>
        </Dialog>
    );
};


// ... (Komponen ViewAttendanceSheet dan FilterDialog)
const ViewAttendanceSheet = ({ record }: { record: AttendanceRecord }) => ( <Sheet><SheetTrigger asChild><Button variant="outline" size="sm">View</Button></SheetTrigger><SheetContent className="w-[400px] sm:w-[540px]"><SheetHeader><SheetTitle>Approve Attendance</SheetTitle><SheetDescription>Detailed attendance information for {record.employeeName}.</SheetDescription></SheetHeader><div className="space-y-6 py-4"><div className="flex items-center gap-4 p-4 border rounded-lg"><div className="w-12 h-12 bg-gray-200 rounded-full" /><div><p className="font-semibold">{record.employeeName}</p><p className="text-sm text-gray-500">{record.jabatan}</p></div><Badge variant={record.statusApprove === 'Approved' ? 'default' : 'secondary'} className="ml-auto">{record.statusApprove}</Badge></div><Card><CardHeader><CardTitle>Attendance Information</CardTitle></CardHeader><CardContent className="space-y-2"><div className="flex justify-between"><span>Date:</span> <span>{format(record.date, "PPP")}</span></div><div className="flex justify-between"><span>Check In:</span> <span>{record.clockIn}</span></div><div className="flex justify-between"><span>Check Out:</span> <span>{record.clockOut}</span></div><div className="flex justify-between"><span>Work Hours:</span> <span>{record.workHours}</span></div></CardContent></Card><Card><CardHeader><CardTitle>Location Information</CardTitle></CardHeader><CardContent className="space-y-2"><div className="flex justify-between"><span>Location:</span> <span>Kantor Pusat</span></div><div className="flex justify-between"><span>Address:</span> <span>Jl. Veteran No.1, Kota Malang</span></div></CardContent></Card><Card><CardHeader><CardTitle>Proof of Attendance</CardTitle></CardHeader><CardContent className="flex items-center justify-between"><p>Proof of Attendance.JPEG</p><div className="flex gap-2"><Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button><Button variant="ghost" size="icon"><FileDown className="h-4 w-4" /></Button></div></CardContent></Card></div></SheetContent></Sheet>);
const FilterDialog = ({ onApplyFilter }: { onApplyFilter: (filters: any) => void }) => {
    const [name, setName] = useState(''); const [status, setStatus] = useState(''); const [date, setDate] = React.useState<DateRange | undefined>(); const handleApply = () => { onApplyFilter({ name, status, date }); };
    return ( <Dialog><DialogTrigger asChild><Button variant="outline" size="sm" className="gap-1"><ListFilter className="h-4 w-4" /><span>Filter</span></Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Filter Attendance</DialogTitle><DialogDescription>Filter the attendance list based on criteria below.</DialogDescription></DialogHeader><div className="grid gap-4 py-4"><div className="space-y-2"><Label htmlFor="name">Employee Name</Label><Input id="name" placeholder="Filter by name..." value={name} onChange={(e) => setName(e.target.value)} /></div><div className="space-y-2"><Label htmlFor="status">Status</Label><Select onValueChange={setStatus} value={status}><SelectTrigger><SelectValue placeholder="All Statuses" /></SelectTrigger><SelectContent><SelectItem value="all">All Statuses</SelectItem><SelectItem value="Waiting">Waiting</SelectItem><SelectItem value="OnTime">OnTime</SelectItem><SelectItem value="Late">Late</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label>Date Range</Label><Popover><PopoverTrigger asChild><Button id="date" variant={"outline"} className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{date?.from ? (date.to ? (<> {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")} </>) : (format(date.from, "LLL dd, y"))) : (<span>Pick a date range</span>)}</Button></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar initialFocus mode="range" defaultMonth={date?.from} selected={date} onSelect={setDate} numberOfMonths={2}/></PopoverContent></Popover></div></div><DialogFooter><Button onClick={handleApply}>Apply Filter</Button></DialogFooter></DialogContent></Dialog> )
};


// --- Komponen Tabel Utama ---

interface CheckClockTableProps {
    initialData: AttendanceRecord[];
    onAddRecord: (record: Omit<AttendanceRecord, 'id'>) => void;
    onUpdateRecord: (record: AttendanceRecord) => void;
    onDeleteRecord: (id: number) => void;
}

export default function CheckClockTable({ initialData, onAddRecord, onUpdateRecord, onDeleteRecord }: CheckClockTableProps) {
    const [filteredData, setFilteredData] = useState(initialData);

    useEffect(() => {
        setFilteredData(initialData);
    }, [initialData]);

    const handleApprove = (record: AttendanceRecord) => {
        const updatedRecord = { ...record, status: "OnTime" as "OnTime", statusApprove: "Approved" as "Approved" };
        onUpdateRecord(updatedRecord);
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
        let data = [...initialData];
        if (filters.name) {
            data = data.filter(item => item.employeeName.toLowerCase().includes(filters.name.toLowerCase()));
        }
        if (filters.status && filters.status !== 'all') {
            data = data.filter(item => item.status === filters.status);
        }
        if (filters.date?.from) { data = data.filter(item => item.date >= filters.date!.from!); }
        if (filters.date?.to) { data = data.filter(item => item.date <= filters.date!.to!); }
        setFilteredData(data);
    };

    return (
        <div className="space-y-4">
             <div className="flex items-center justify-end gap-2">
                <FilterDialog onApplyFilter={handleApplyFilter} />
                <Button variant="outline" size="sm" className="gap-1" onClick={handleDownloadPDF}><FileDown className="h-4 w-4" /><span>Download</span></Button>
                <AddCheckClockDialog onAddRecord={onAddRecord} />
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader className="bg-slate-100 dark:bg-slate-800">
                        <TableRow>
                            <TableHead>Employee Name</TableHead>
                            <TableHead>Jabatan</TableHead>
                            <TableHead>Clock in</TableHead>
                            <TableHead>Clock out</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Details</TableHead>
                            <TableHead className="text-center">Actions</TableHead>
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
                                <TableCell>
                                    {record.status === 'Waiting' ? (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild><Badge className="cursor-pointer bg-yellow-400 hover:bg-yellow-500 text-yellow-900">Waiting</Badge></AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader><AlertDialogTitle>Approve Attendance</AlertDialogTitle><AlertDialogDescription>Are you sure you want to approve this attendance?</AlertDialogDescription></AlertDialogHeader>
                                                <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleApprove(record)}>Approve</AlertDialogAction></AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    ) : (
                                        <Badge className={cn(record.status === 'OnTime' && 'bg-green-500', record.status === 'Late' && 'bg-red-500')}>{record.status}</Badge>
                                    )}
                                </TableCell>
                                <TableCell><ViewAttendanceSheet record={record} /></TableCell>
                                <TableCell className="text-center">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 p-0"><span className="sr-only">Open menu</span><MoreHorizontal className="h-4 w-4"/></Button></DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <EditCheckClockDialog record={record} onUpdateRecord={onUpdateRecord}>
                                                <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent focus:bg-accent focus:text-accent-foreground">
                                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                                </div>
                                            </EditCheckClockDialog>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm text-red-500 outline-none transition-colors hover:bg-accent focus:bg-accent-foreground">
                                                        <Trash2 className="mr-2 h-4 w-4"/> Delete
                                                    </div>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader><AlertDialogTitle>Delete Record</AlertDialogTitle><AlertDialogDescription>This will permanently delete the attendance record.</AlertDialogDescription></AlertDialogHeader>
                                                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => onDeleteRecord(record.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Showing 1 to {filteredData.length} of {initialData.length} records</div>
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

