'use client'

import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { PayrollRecord } from '@/app/(dashboard)/payroll/page';

// Helper untuk format mata uang
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};

// Komponen Date Picker
function DatePicker({ date, onDateChange }: { date: Date | undefined, onDateChange: (date: Date | undefined) => void }) {
  return ( <Popover><PopoverTrigger asChild><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal",!date && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{date ? format(date, "PPP") : <span>Pick a date</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={date} onSelect={onDateChange} initialFocus /></PopoverContent></Popover> )
}

// Komponen Edit Dialog
const EditPayrollDialog = ({ record, onUpdatePayroll, children }: { record: PayrollRecord, onUpdatePayroll: (req: PayrollRecord) => void, children: React.ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState(record);
    const [payDate, setPayDate] = useState<Date | undefined>(record.payDate);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: id === 'basicSalary' || id === 'allowance' || id === 'deductions' ? Number(value) : value }));
    };
    const handleSelectChange = (id: keyof PayrollRecord, value: string) => {
        setFormData(prev => ({ ...prev, [id]: value }));
    };
    const handleSubmit = () => {
        onUpdatePayroll({...formData, payDate: payDate!});
        setIsOpen(false);
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader><DialogTitle>Edit Payroll for {record.employeeName}</DialogTitle></DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-2"><Label>Employee Name</Label><Input value={formData.employeeName} readOnly disabled /></div>
                    <div className="space-y-2"><Label htmlFor="position">Position</Label><Input id="position" value={formData.position} onChange={handleChange} /></div>
                    <div className="space-y-2"><Label htmlFor="basicSalary">Basic Salary</Label><Input id="basicSalary" type="number" value={formData.basicSalary} onChange={handleChange} /></div>
                    <div className="space-y-2"><Label htmlFor="allowance">Allowance</Label><Input id="allowance" type="number" value={formData.allowance} onChange={handleChange} /></div>
                    <div className="space-y-2"><Label htmlFor="deductions">Deductions</Label><Input id="deductions" type="number" value={formData.deductions} onChange={handleChange} /></div>
                    <div className="space-y-2"><Label>Payment Date</Label><DatePicker date={payDate} onDateChange={setPayDate} /></div>
                    <div className="space-y-2"><Label>Status</Label><Select value={formData.status} onValueChange={(v) => handleSelectChange('status', v as any)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Pending">Pending</SelectItem><SelectItem value="Paid">Paid</SelectItem></SelectContent></Select></div>
                </div>
                <DialogFooter><Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button><Button onClick={handleSubmit}>Save Changes</Button></DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// Komponen Tabel Utama
export default function PayrollTable({ records, onUpdatePayroll, onDeletePayroll }: { records: PayrollRecord[], onUpdatePayroll: (req: PayrollRecord) => void, onDeletePayroll: (id: number) => void }) {
    
    const getStatusBadge = (status: PayrollRecord['status']) => {
        switch (status) {
            case "Pending": return <Badge className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900">Pending</Badge>;
            case "Paid": return <Badge className="bg-green-500 hover:bg-green-600">Paid</Badge>;
            default: return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader className="bg-slate-100 dark:bg-slate-800">
                        <TableRow>
                            <TableHead>Employee Name</TableHead>
                            <TableHead>Basic Salary</TableHead>
                            <TableHead>Allowance</TableHead>
                            <TableHead>Deductions</TableHead>
                            <TableHead>Net Pay</TableHead>
                            <TableHead>Pay Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {records.map((record) => (
                            <TableRow key={record.id}>
                                <TableCell className="font-medium">{record.employeeName}</TableCell>
                                <TableCell>{formatCurrency(record.basicSalary)}</TableCell>
                                <TableCell>{formatCurrency(record.allowance)}</TableCell>
                                <TableCell className="text-red-500">{formatCurrency(record.deductions)}</TableCell>
                                <TableCell className="font-semibold">{formatCurrency(record.netPay)}</TableCell>
                                <TableCell>{format(record.payDate, "PPP")}</TableCell>
                                <TableCell>{getStatusBadge(record.status)}</TableCell>
                                <TableCell className="text-right">
                                     <DropdownMenu>
                                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4"/></Button></DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <EditPayrollDialog record={record} onUpdatePayroll={onUpdatePayroll}>
                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="flex items-center gap-2"><Edit className="h-4 w-4" /> <span>Edit</span></DropdownMenuItem>
                                            </EditPayrollDialog>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild><DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-500 flex items-center gap-2"><Trash2 className="h-4 w-4"/> <span>Delete</span></DropdownMenuItem></AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader><AlertDialogTitle>Delete Payroll Record?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the payroll record.</AlertDialogDescription></AlertDialogHeader>
                                                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => onDeletePayroll(record.id)}>Delete</AlertDialogAction></AlertDialogFooter>
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
             <div className="flex items-center justify-between mt-4">
                 <div className="text-sm text-muted-foreground">Showing 1 to {records.length} of {records.length} records</div>
             </div>
        </div>
    );
}
