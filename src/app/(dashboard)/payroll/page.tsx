'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { FileDown, ListFilter } from 'lucide-react';
import AddPayrollDialog from '@/components/payroll/AddPayrollDialog';
import PayrollTable from '@/components/payroll/PayrollTable';
// 1. Import komponen yang diperlukan untuk Filter
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import jsPDF from 'jspdf'; // Import jsPDF
import autoTable from 'jspdf-autotable'; // Import autoTable
import { format } from "date-fns"; // Import format

// Tipe data untuk Payroll
export interface PayrollRecord {
    id: number;
    employeeName: string;
    position: string;
    basicSalary: number;
    allowance: number;
    deductions: number;
    netPay: number;
    status: "Pending" | "Paid";
    payDate: Date;
}

// Data awal (fiktif)
const initialPayrollData: PayrollRecord[] = [
    { id: 1, employeeName: "John Doe", position: "Developer", basicSalary: 10000000, allowance: 1000000, deductions: 500000, netPay: 10500000, status: "Paid", payDate: new Date("2025-10-25") },
    { id: 2, employeeName: "Jane Smith", position: "Designer", basicSalary: 8000000, allowance: 500000, deductions: 250000, netPay: 8250000, status: "Paid", payDate: new Date("2025-10-25") },
    { id: 3, employeeName: "Michael Johnson", position: "Manager", basicSalary: 15000000, allowance: 2500000, deductions: 1000000, netPay: 16500000, status: "Pending", payDate: new Date("2025-11-25") },
];

// Helper untuk format mata uang (jika belum ada)
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};


// 2. Buat komponen FilterDialog
const FilterDialog = ({ onApplyFilter }: { onApplyFilter: (filters: any) => void }) => {
    const [employeeName, setEmployeeName] = useState('');
    const [status, setStatus] = useState('');

    const handleApply = () => {
        onApplyFilter({ employeeName, status });
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
                    <DialogTitle>Filter Payroll</DialogTitle>
                    <DialogDescription>Filter payroll records based on criteria below.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="employeeName">Employee Name</Label>
                        <Input id="employeeName" value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} placeholder="Filter by name..." />
                    </div>
                    <div className="space-y-2">
                        <Label>Status</Label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger><SelectValue placeholder="All Statuses" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="Paid">Paid</SelectItem>
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


export default function PayrollPage() {
    const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>(initialPayrollData);
    // 3. Tambahkan state untuk data yang difilter
    const [filteredRecords, setFilteredRecords] = useState<PayrollRecord[]>(initialPayrollData);

    const handleAddPayroll = (newRecord: Omit<PayrollRecord, 'id' | 'netPay'>) => {
        const netPay = newRecord.basicSalary + newRecord.allowance - newRecord.deductions;
        const newPayroll = { 
            id: Date.now(), 
            ...newRecord,
            netPay,
        };
        setPayrollRecords(prev => [newPayroll, ...prev]);
        setFilteredRecords(prev => [newPayroll, ...prev]); // Update data terfilter juga
    };

    const handleUpdatePayroll = (updatedRecord: PayrollRecord) => {
        const netPay = updatedRecord.basicSalary + updatedRecord.allowance - updatedRecord.deductions;
        const finalRecord = { ...updatedRecord, netPay };
        const updatedList = payrollRecords.map(rec => rec.id === finalRecord.id ? finalRecord : rec);
        setPayrollRecords(updatedList);
        setFilteredRecords(updatedList); // Update data terfilter juga
    };

    const handleDeletePayroll = (recordId: number) => {
        const updatedList = payrollRecords.filter(rec => rec.id !== recordId);
        setPayrollRecords(updatedList);
        setFilteredRecords(updatedList); // Update data terfilter juga
    };

    // 4. Buat fungsi Download PDF
    const handleDownloadPDF = () => {
        const doc = new jsPDF();
        doc.text("Payroll Report", 14, 16);
        const tableColumn = ["Employee Name", "Position", "Net Pay", "Status", "Pay Date"];
        const tableRows: any[][] = [];

        // Gunakan data yang sudah difilter
        filteredRecords.forEach((record) => {
            const recordData = [
                record.employeeName,
                record.position,
                formatCurrency(record.netPay),
                record.status,
                format(record.payDate, "PPP"),
            ];
            tableRows.push(recordData);
        });
        autoTable(doc, { head: [tableColumn], body: tableRows, startY: 20 });
        doc.save("payroll_report.pdf");
     };

     // 5. Buat fungsi Apply Filter
     const handleApplyFilter = (filters: { employeeName: string, status: string }) => {
        let data = [...payrollRecords];
        if (filters.employeeName) {
            data = data.filter(item => item.employeeName.toLowerCase().includes(filters.employeeName.toLowerCase()));
        }
        if (filters.status && filters.status !== 'all') {
            data = data.filter(item => item.status === filters.status);
        }
        setFilteredRecords(data);
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Payroll Management</CardTitle>
                    <CardDescription>View, manage, and process employee payroll.</CardDescription>
                </div>
                 <div className="flex items-center gap-2">
                    {/* 6. Hubungkan komponen dan fungsi */}
                    <FilterDialog onApplyFilter={handleApplyFilter} />
                    <Button variant="outline" size="sm" className="gap-1" onClick={handleDownloadPDF}>
                        <FileDown className="h-4 w-4" />
                        <span className="hidden sm:inline">Download</span>
                    </Button>
                    <AddPayrollDialog onAddPayroll={handleAddPayroll} />
                </div>
            </CardHeader>
            <CardContent>
                <PayrollTable
                    records={filteredRecords} // Kirim data terfilter ke tabel
                    onUpdatePayroll={handleUpdatePayroll}
                    onDeletePayroll={handleDeletePayroll}
                />
            </CardContent>
        </Card>
    );
}

