'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, PlusCircle, Loader2, Check, ChevronsUpDown, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { leaveApi, employeeApi, LeaveType, EmployeeWithDetails } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

// Komponen Date Picker
function DatePicker({ date, onDateChange }: { date: Date | undefined, onDateChange: (date: Date | undefined) => void }) {
  return ( <Popover><PopoverTrigger asChild><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal",!date && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{date ? format(date, "PPP") : <span>Pick a date</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={date} onSelect={onDateChange} initialFocus /></PopoverContent></Popover> )
}

interface AddLeaveDialogProps {
    leaveTypes: LeaveType[];
    onSuccess?: () => void;
}

export default function AddLeaveDialog({ leaveTypes, onSuccess }: AddLeaveDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Employee selection
    const [employees, setEmployees] = useState<EmployeeWithDetails[]>([]);
    const [employeeSearch, setEmployeeSearch] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState<EmployeeWithDetails | null>(null);
    const [employeePopoverOpen, setEmployeePopoverOpen] = useState(false);
    const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
    
    // Form fields
    const [leaveTypeId, setLeaveTypeId] = useState<string>('');
    const [durationType, setDurationType] = useState<'full_day' | 'half_day_morning' | 'half_day_afternoon'>('full_day');
    const [startDate, setStartDate] = useState<Date | undefined>();
    const [endDate, setEndDate] = useState<Date | undefined>();
    const [reason, setReason] = useState('');
    const [attachment, setAttachment] = useState<File | null>(null);
    
    const { toast } = useToast();

    // Fetch employees on search
    const fetchEmployees = useCallback(async (search: string) => {
        if (!search || search.length < 2) {
            setEmployees([]);
            return;
        }
        
        setIsLoadingEmployees(true);
        try {
            const response = await employeeApi.search(search);
            if (response.success && response.data) {
                setEmployees(response.data);
            }
        } catch (error) {
            console.error('Failed to search employees:', error);
        } finally {
            setIsLoadingEmployees(false);
        }
    }, []);

    // Debounce employee search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchEmployees(employeeSearch);
        }, 300);
        return () => clearTimeout(timer);
    }, [employeeSearch, fetchEmployees]);

    // Reset form when dialog closes
    useEffect(() => {
        if (!isOpen) {
            setSelectedEmployee(null);
            setEmployeeSearch('');
            setLeaveTypeId('');
            setDurationType('full_day');
            setStartDate(undefined);
            setEndDate(undefined);
            setReason('');
            setAttachment(null);
            setEmployees([]);
        }
    }, [isOpen]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast({
                    title: 'File too large',
                    description: 'Maximum file size is 5MB.',
                    variant: 'destructive'
                });
                return;
            }
            setAttachment(file);
        }
    };

    const handleSubmit = async () => {
        if (!selectedEmployee || !leaveTypeId || !startDate || !endDate || !reason) {
            toast({
                title: 'Validation Error',
                description: 'Please fill all required fields.',
                variant: 'destructive'
            });
            return;
        }

        if (reason.length < 10) {
            toast({
                title: 'Validation Error',
                description: 'Reason must be at least 10 characters.',
                variant: 'destructive'
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await leaveApi.createRequest({
                employee_id: selectedEmployee.id,
                leave_type_id: leaveTypeId,
                start_date: format(startDate, 'yyyy-MM-dd'),
                end_date: format(endDate, 'yyyy-MM-dd'),
                duration_type: durationType,
                reason,
            }, attachment || undefined);

            if (response.success) {
                toast({
                    title: 'Success',
                    description: 'Leave request submitted successfully.',
                });
                setIsOpen(false);
                onSuccess?.();
            } else {
                toast({
                    title: 'Error',
                    description: response.message || 'Failed to submit leave request.',
                    variant: 'destructive'
                });
            }
        } catch (error) {
            console.error('Error creating leave request:', error);
            toast({
                title: 'Error',
                description: 'An unexpected error occurred.',
                variant: 'destructive'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="gap-1">
                    <PlusCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">Add Leave Request</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Add New Leave Request</DialogTitle>
                    <DialogDescription>Fill in the details for the leave request.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
                    {/* Employee Selection with Search */}
                    <div className="space-y-2">
                        <Label>Employee <span className="text-destructive">*</span></Label>
                        <Popover open={employeePopoverOpen} onOpenChange={setEmployeePopoverOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={employeePopoverOpen}
                                    className="w-full justify-between font-normal"
                                >
                                    {selectedEmployee ? (
                                        <span className="truncate">
                                            {selectedEmployee.full_name} ({selectedEmployee.employee_code})
                                        </span>
                                    ) : (
                                        <span className="text-muted-foreground">Search employee...</span>
                                    )}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[400px] p-0" align="start">
                                <div className="p-2 border-b">
                                    <Input 
                                        placeholder="Search by name or employee code..." 
                                        value={employeeSearch}
                                        onChange={(e) => setEmployeeSearch(e.target.value)}
                                        className="h-9"
                                    />
                                </div>
                                <div className="max-h-[200px] overflow-y-auto">
                                    {isLoadingEmployees ? (
                                        <div className="flex items-center justify-center py-6">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        </div>
                                    ) : employees.length === 0 ? (
                                        <div className="py-6 text-center text-sm text-muted-foreground">
                                            {employeeSearch.length < 2 
                                                ? "Type at least 2 characters to search..." 
                                                : "No employees found."}
                                        </div>
                                    ) : (
                                        <div className="p-1">
                                            {employees.map((employee) => (
                                                <button
                                                    key={employee.id}
                                                    type="button"
                                                    className={cn(
                                                        "flex items-center w-full px-2 py-2 text-left rounded-sm hover:bg-accent cursor-pointer",
                                                        selectedEmployee?.id === employee.id && "bg-accent"
                                                    )}
                                                    onClick={() => {
                                                        setSelectedEmployee(employee);
                                                        setEmployeePopoverOpen(false);
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            selectedEmployee?.id === employee.id ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{employee.full_name}</span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {employee.employee_code} • {employee.position_name || 'No position'}
                                                        </span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Leave Type */}
                    <div className="space-y-2">
                        <Label>Leave Type <span className="text-destructive">*</span></Label>
                        <Select onValueChange={setLeaveTypeId} value={leaveTypeId}>
                            <SelectTrigger><SelectValue placeholder="Select leave type" /></SelectTrigger>
                            <SelectContent>
                                {leaveTypes.map(type => (
                                    <SelectItem key={type.id} value={type.id}>
                                        <div className="flex items-center gap-2">
                                            {type.color && (
                                                <div 
                                                    className="w-3 h-3 rounded-full" 
                                                    style={{ backgroundColor: type.color }}
                                                />
                                            )}
                                            {type.name}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Duration Type */}
                    <div className="space-y-2">
                        <Label>Duration Type <span className="text-destructive">*</span></Label>
                        <Select onValueChange={(v) => setDurationType(v as typeof durationType)} value={durationType}>
                            <SelectTrigger><SelectValue placeholder="Select duration type" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="full_day">Full Day</SelectItem>
                                <SelectItem value="half_day_morning">Half Day (Morning)</SelectItem>
                                <SelectItem value="half_day_afternoon">Half Day (Afternoon)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Start Date <span className="text-destructive">*</span></Label>
                            <DatePicker date={startDate} onDateChange={setStartDate} />
                        </div>
                        <div className="space-y-2">
                            <Label>End Date <span className="text-destructive">*</span></Label>
                            <DatePicker date={endDate} onDateChange={setEndDate} />
                        </div>
                    </div>

                    {/* Reason */}
                    <div className="space-y-2">
                        <Label htmlFor="reason">Reason <span className="text-destructive">*</span></Label>
                        <Textarea 
                            id="reason" 
                            value={reason} 
                            onChange={(e) => setReason(e.target.value)} 
                            placeholder="Enter the reason for leave (min. 10 characters)" 
                            rows={3}
                        />
                    </div>

                    {/* Attachment */}
                    <div className="space-y-2">
                        <Label>Attachment (Optional)</Label>
                        {attachment ? (
                            <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
                                <Upload className="h-4 w-4 text-muted-foreground" />
                                <span className="flex-1 text-sm truncate">{attachment.name}</span>
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => setAttachment(null)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <Input 
                                type="file" 
                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                onChange={handleFileChange}
                            />
                        )}
                        <p className="text-xs text-muted-foreground">
                            Supported formats: PDF, JPG, PNG, DOC, DOCX (max 5MB)
                        </p>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Request
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
