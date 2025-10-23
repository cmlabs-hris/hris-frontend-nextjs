'use client'

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { LeaveRequest } from '@/app/(dashboard)/leave/page';

// Komponen Date Picker
function DatePicker({ date, onDateChange }: { date: Date | undefined, onDateChange: (date: Date | undefined) => void }) {
  return ( <Popover><PopoverTrigger asChild><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal",!date && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{date ? format(date, "PPP") : <span>Pick a date</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={date} onSelect={onDateChange} initialFocus /></PopoverContent></Popover> )
}

export default function AddLeaveDialog({ onAddLeave }: { onAddLeave: (request: Omit<LeaveRequest, 'id'>) => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [employeeName, setEmployeeName] = useState('');
    const [leaveType, setLeaveType] = useState<'Annual' | 'Sick' | 'Permit' | undefined>();
    const [startDate, setStartDate] = useState<Date | undefined>();
    const [endDate, setEndDate] = useState<Date | undefined>();
    const [reason, setReason] = useState('');

    const handleSubmit = () => {
        if (!employeeName || !leaveType || !startDate || !endDate || !reason) {
            alert('Please fill all required fields.');
            return;
        }
        onAddLeave({
            employeeName,
            leaveType,
            startDate,
            endDate,
            reason,
            status: 'Pending' // Default status 
        });
        // Reset form
        setEmployeeName('');
        setLeaveType(undefined);
        setStartDate(undefined);
        setEndDate(undefined);
        setReason('');
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="gap-1">
                    <PlusCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">Add Leave Request</span>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Leave Request</DialogTitle>
                    <DialogDescription>Fill in the details for the leave request.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
                    <div className="space-y-2">
                        <Label htmlFor="employeeName">Employee Name</Label>
                        {/* Seharusnya ini dropdown atau auto-complete, tapi untuk sementara pakai input */}
                        <Input id="employeeName" value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} placeholder="Enter employee name"/>
                    </div>
                     <div className="space-y-2">
                        <Label>Leave Type</Label>
                        <Select onValueChange={(v) => setLeaveType(v as any)} value={leaveType}>
                            <SelectTrigger><SelectValue placeholder="Select leave type" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Annual">Annual</SelectItem>
                                <SelectItem value="Sick">Sick</SelectItem>
                                <SelectItem value="Permit">Permit</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Start Date</Label>
                            <DatePicker date={startDate} onDateChange={setStartDate} />
                        </div>
                        <div className="space-y-2">
                            <Label>End Date</Label>
                            <DatePicker date={endDate} onDateChange={setEndDate} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="reason">Reason</Label>
                        <Textarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Enter the reason for leave" />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmit}>Submit Request</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
