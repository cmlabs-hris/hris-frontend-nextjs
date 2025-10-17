'use client'

import React, { useState } from 'react';
import dynamic from 'next/dynamic'; 
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Eye, PlusCircle, FileDown, ListFilter } from "lucide-react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const AttendanceMap = dynamic(() => import('@/components/attendance/AttendanceMap'), { 
    ssr: false,
    loading: () => <div className="h-full w-full bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center"><p className="text-gray-500">Loading map...</p></div>
});

const locations = {
    "kantor-pusat": { lat: -7.9766, lon: 112.631, address: "Kota Malang, Jawa Timur" },
    "cabang-jakarta": { lat: -6.2088, lon: 106.8456, address: "Jakarta Pusat, DKI Jakarta" },
};

// --- Data Simulasi  ---
const initialAttendanceData = [
    { id: 1, employeeName: "Emily Davis", jabatan: "Developer", clockIn: "08:30", clockOut: "16:30", workHours: 8, approve: "Cabang Jakarta", status: "Waiting", statusApprove: "Waiting" },
    { id: 2, employeeName: "Jane Doe", jabatan: "Designer", clockIn: "08:32", clockOut: "16:30", workHours: 8, approve: "Cabang Bandung", status: "OnTime", statusApprove: "Approved" },
    { id: 3, employeeName: "Peter Jones", jabatan: "Manager", clockIn: "09:15", clockOut: "17:00", workHours: 8, approve: "Pusat", status: "Late", statusApprove: "Approved" },
    { id: 4, employeeName: "Mary Jane", jabatan: "QA", clockIn: "08:25", clockOut: "16:30", workHours: 8, approve: "Cabang Jakarta", status: "Waiting", statusApprove: "Waiting" },
];



// Menambah Absensi Baru 
const AddCheckClockDialog = () => {
    const [selectedLocation, setSelectedLocation] = useState<keyof typeof locations>("kantor-pusat");
    const currentPosition: [number, number] = [locations[selectedLocation].lat, locations[selectedLocation].lon];
    const currentAddress = locations[selectedLocation].address;

    return (
        <Dialog>
            <DialogTrigger asChild><Button size="sm" className="gap-1"><PlusCircle className="h-4 w-4" /><span>Add</span></Button></DialogTrigger>
            <DialogContent className="max-w-3xl">
                <DialogHeader><DialogTitle>Add Check Clock</DialogTitle><DialogDescription>Manually add an employee attendance record.</DialogDescription></DialogHeader>
                <div className="grid grid-cols-2 gap-6 py-4">
                    {/* Kolom Kiri */}
                    <div className="space-y-4">
                        <div className="space-y-2"><Label>Karyawan</Label><Select><SelectTrigger><SelectValue placeholder="Pilih Karyawan" /></SelectTrigger><SelectContent><SelectItem value="1">Clarsa</SelectItem></SelectContent></Select></div>
                        <div className="space-y-2"><Label>Tipe Absensi</Label><Select><SelectTrigger><SelectValue placeholder="Pilih Tipe Absensi" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="clock-in">Clock In</SelectItem>
                            <SelectItem value="clock-out">Clock Out</SelectItem>
                            <SelectItem value="annual">Annual Leave</SelectItem>
                            <SelectItem value="sick">Sick Leave</SelectItem>
                            <SelectItem value="permit">Permit</SelectItem>
                        </SelectContent></Select></div>
                        
                        <div className="space-y-2"><Label>Upload Bukti pendukung</Label><div className="flex items-center justify-center w-full"><Label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"><div className="flex flex-col items-center justify-center pt-5 pb-6"><p className="mb-2 text-sm text-gray-500">Drag n Drop here</p><p className="text-xs text-gray-500">Or Browser</p></div><Input id="dropzone-file" type="file" className="hidden" /></Label></div><Button className="w-full">Upload Now</Button></div>
                    </div>
                    {/* Kolom Kanan */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Lokasi</Label>
                            <Select value={selectedLocation} onValueChange={(value) => setSelectedLocation(value as keyof typeof locations)}>
                                <SelectTrigger><SelectValue placeholder="Pilih Lokasi" /></SelectTrigger>
                                <SelectContent className="z-50">
                                    <SelectItem value="kantor-pusat">Kantor Pusat - Malang</SelectItem>
                                    <SelectItem value="cabang-jakarta">Cabang Jakarta</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {/* Ganti Placeholder dengan Peta Interaktif */}
                        <div className="h-48 w-full rounded-lg overflow-hidden">
                            <AttendanceMap position={currentPosition} />
                        </div>
                        <div className="space-y-2">
                            <Label>Detail Alamat</Label>
                            <Input placeholder="Detail Alamat" readOnly value={currentAddress} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>Lat</Label><Input placeholder="Lat Location" readOnly value={currentPosition[0]} /></div>
                            <div className="space-y-2"><Label>Long</Label><Input placeholder="Long Location" readOnly value={currentPosition[1]} /></div>
                        </div>
                    </div>
                </div>
                <DialogFooter><Button variant="outline">Cancel</Button><Button>Save</Button></DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

// ... (Sisa komponen ViewAttendanceSheet dan ApproveAttendanceDialog) ...
const ViewAttendanceSheet = ({ record }: { record: any }) => ( <Sheet><SheetTrigger asChild><Button variant="outline" size="sm">View</Button></SheetTrigger><SheetContent className="w-[400px] sm:w-[540px]"><SheetHeader><SheetTitle>Approve Attendance</SheetTitle><SheetDescription>Detailed attendance information for {record.employeeName}.</SheetDescription></SheetHeader><div className="space-y-6 py-4"><div className="flex items-center gap-4 p-4 border rounded-lg"><div className="w-12 h-12 bg-gray-200 rounded-full" /><div><p className="font-semibold">{record.employeeName}</p><p className="text-sm text-gray-500">{record.jabatan}</p></div><Badge variant={record.statusApprove === 'Approved' ? 'default' : 'secondary'} className="ml-auto">{record.statusApprove}</Badge></div><Card><CardHeader><CardTitle>Attendance Information</CardTitle></CardHeader><CardContent className="space-y-2"><div className="flex justify-between"><span>Date:</span> <span>1 June 2025</span></div><div className="flex justify-between"><span>Check In:</span> <span>{record.clockIn}</span></div><div className="flex justify-between"><span>Check Out:</span> <span>{record.clockOut}</span></div><div className="flex justify-between"><span>Work Hours:</span> <span>{record.workHours}</span></div></CardContent></Card><Card><CardHeader><CardTitle>Location Information</CardTitle></CardHeader><CardContent className="space-y-2"><div className="flex justify-between"><span>Location:</span> <span>Kantor Pusat</span></div><div className="flex justify-between"><span>Address:</span> <span>Jl. Veteran No.1, Kota Malang</span></div></CardContent></Card><Card><CardHeader><CardTitle>Proof of Attendance</CardTitle></CardHeader><CardContent className="flex items-center justify-between"><p>Proof of Attendance.JPEG</p><div className="flex gap-2"><Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button><Button variant="ghost" size="icon"><FileDown className="h-4 w-4" /></Button></div></CardContent></Card></div></SheetContent></Sheet>);
const ApproveAttendanceDialog = ({ onApprove }: { onApprove: () => void }) => ( <AlertDialog><AlertDialogTrigger asChild><Badge className="cursor-pointer bg-yellow-400 hover:bg-yellow-500 text-yellow-900">Waiting</Badge></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Approve Attendance</AlertDialogTitle><AlertDialogDescription>Are you sure you want to approve this employee's attendance? This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Reject</AlertDialogCancel><AlertDialogAction onClick={onApprove}>Approve</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>);


// --- Komponen Tabel Utama ---

export default function CheckClockTable() {
    const [attendanceData, setAttendanceData] = useState(initialAttendanceData);

    const handleApprove = (id: number) => {
        setAttendanceData(prevData =>
            prevData.map(item =>
                item.id === id ? { ...item, status: "OnTime", statusApprove: "Approved" } : item
            )
        );
    };

    const handleDownloadPDF = () => {
        const doc = new jsPDF();
        doc.text("Check Clock Overview Report", 14, 16);
        const tableColumn = ["Employee Name", "Jabatan", "Clock In", "Clock Out", "Work Hours", "Status"];
        const tableRows: any[] = [];
        attendanceData.forEach(record => {
            tableRows.push([record.employeeName, record.jabatan, record.clockIn, record.clockOut, record.workHours.toString(), record.status]);
        });
        autoTable(doc, { head: [tableColumn], body: tableRows, startY: 20 });
        doc.save("check_clock_report.pdf");
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
                <Button variant="outline" size="sm" className="gap-1"><ListFilter className="h-4 w-4" /><span>Filter</span></Button>
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
                        {attendanceData.map((record) => (
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
                <div className="text-sm text-muted-foreground">Showing 1 to {attendanceData.length} of {attendanceData.length} records</div>
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

