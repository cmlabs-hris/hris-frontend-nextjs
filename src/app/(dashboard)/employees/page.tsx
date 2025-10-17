'use client'; // Jadikan client component untuk menangani state dan event

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ListFilter, FileDown } from "lucide-react";
import EmployeeTable from "@/components/employees/EmployeeTable";
import AddEmployeeDialog from "@/components/employees/AddEmployeeDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- DATA SIMULASI KARYAWAN  ---
const employees = [
    { id: 1, name: "John Doe", gender: "Laki - Laki", phone: "08123456789", branch: "Jakarta", position: "Developer", status: "Active" },
    { id: 2, name: "Jane Smith", gender: "Perempuan", phone: "08123456789", branch: "Bandung", position: "Designer", status: "Active" },
    { id: 3, name: "Michael Johnson", gender: "Laki - Laki", phone: "08123456789", branch: "Surabaya", position: "Manager", status: "Inactive" },
    { id: 4, name: "Emily Davis", gender: "Perempuan", phone: "08123456789", branch: "Jakarta", position: "QA", status: "Active" },
];


// Komponen Filter Dialog
const FilterDialog = () => {
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
                    <DialogTitle>Filter Employees</DialogTitle>
                    <DialogDescription>Filter the employee list based on criteria below.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="name" className="text-right">Name</Label><Input id="name" placeholder="Filter by name..." className="col-span-3" /></div>
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="position" className="text-right">Position</Label><Select><SelectTrigger className="col-span-3"><SelectValue placeholder="All Positions" /></SelectTrigger><SelectContent><SelectItem value="developer">Developer</SelectItem><SelectItem value="designer">Designer</SelectItem><SelectItem value="manager">Manager</SelectItem><SelectItem value="qa">QA</SelectItem></SelectContent></Select></div>
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="status" className="text-right">Status</Label><Select><SelectTrigger className="col-span-3"><SelectValue placeholder="All Statuses" /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent></Select></div>
                </div>
                <DialogFooter><Button type="submit">Apply Filter</Button></DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


export default function EmployeePage() {
    const handleDownloadPDF = () => {
        const doc = new jsPDF();
        doc.text("All Employee Information Report", 14, 16);
        const tableColumn = ["No", "Name", "Gender", "Phone", "Branch", "Position", "Status"];
        const tableRows: any[][] = [];
        employees.forEach((employee, index) => {
            const employeeData = [index + 1, employee.name, employee.gender, employee.phone, employee.branch, employee.position, employee.status];
            tableRows.push(employeeData);
        });
        
        autoTable(doc, { 
            head: [tableColumn], 
            body: tableRows, 
            startY: 20 
        });

        doc.save("employee_report.pdf");
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>All Employee Information</CardTitle>
                        <CardDescription>Manage and view all employee data.</CardDescription>
                    </div>
                    {/* HANYA ADA SATU SET TOMBOL DI SINI */}
                    <div className="flex items-center gap-2">
                        <FilterDialog />
                        <Button variant="outline" size="sm" className="gap-1" onClick={handleDownloadPDF}>
                            <FileDown className="h-4 w-4" />
                            <span className="hidden sm:inline">Download</span>
                        </Button>
                        <AddEmployeeDialog />
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Kirim data karyawan ke tabel melalui props */}
                    <EmployeeTable employees={employees} />
                </CardContent>
            </Card>
        </div>
    );
}

