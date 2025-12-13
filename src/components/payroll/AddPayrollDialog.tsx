'use client'

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { PayrollRecord } from '@/lib/api';

// Komponen Date Picker
function DatePicker({ date, onDateChange }: { date: Date | undefined, onDateChange: (date: Date | undefined) => void }) {
  return ( <Popover><PopoverTrigger asChild><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal",!date && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{date ? format(date, "PPP") : <span>Pick a date</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={date} onSelect={onDateChange} initialFocus /></PopoverContent></Popover> )
}

type FormData = Omit<PayrollRecord, 'id' | 'net_salary'>;

export default function AddPayrollDialog({ onAddPayroll }: { onAddPayroll: (request: FormData) => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState<Partial<FormData>>({
        status: "draft",
        base_salary: '0',
        total_allowances: '0',
        total_deductions: '0',
    });
    const [payDate, setPayDate] = useState<Date | undefined>(new Date());

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };
    
    const handleSelectChange = (id: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = () => {
        if (!formData.employee_name || !formData.position_name || !payDate) {
            alert('Please fill all required fields.');
            return;
        }
        
        onAddPayroll({
            ...formData,
            employee_name: formData.employee_name,
            position_name: formData.position_name,
            base_salary: formData.base_salary || '0',
            total_allowances: formData.total_allowances || '0',
            total_deductions: formData.total_deductions || '0',
            status: formData.status || "draft",
        } as FormData);

        // Reset form
        setFormData({ status: "draft", base_salary: '0', total_allowances: '0', total_deductions: '0' });
        setPayDate(new Date());
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="gap-1">
                    <PlusCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">Add Payroll</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Add New Payroll Record</DialogTitle>
                    <DialogDescription>Fill in the details for the new payroll record.</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-2"><Label htmlFor="employee_name">Employee Name</Label><Input id="employee_name" onChange={handleChange} placeholder="e.g. John Doe"/></div>
                    <div className="space-y-2"><Label htmlFor="position_name">Position</Label><Input id="position_name" onChange={handleChange} placeholder="e.g. Developer" /></div>
                    <div className="space-y-2"><Label htmlFor="base_salary">Basic Salary</Label><Input id="base_salary" type="number" onChange={handleChange} placeholder="e.g. 10000000" /></div>
                    <div className="space-y-2"><Label htmlFor="total_allowances">Allowance</Label><Input id="total_allowances" type="number" onChange={handleChange} placeholder="e.g. 1000000" /></div>
                    <div className="space-y-2"><Label htmlFor="total_deductions">Deductions</Label><Input id="total_deductions" type="number" onChange={handleChange} placeholder="e.g. 500000" /></div>
                    <div className="space-y-2"><Label>Payment Date</Label><DatePicker date={payDate} onDateChange={setPayDate} /></div>
                    <div className="space-y-2"><Label>Status</Label><Select value={formData.status} onValueChange={(v) => handleSelectChange('status', v as 'draft' | 'paid')}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="paid">Paid</SelectItem></SelectContent></Select></div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmit}>Create Record</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
