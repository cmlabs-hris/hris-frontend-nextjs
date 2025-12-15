'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Loader2, Upload, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, differenceInDays } from "date-fns";
import { leaveApi, LeaveQuota, LeaveType, CreateLeaveRequestPayload } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CreateLeaveRequestDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    leaveQuotas: LeaveQuota[];
}

export default function CreateLeaveRequestDialog({ 
    open, 
    onOpenChange, 
    onSuccess,
    leaveQuotas 
}: CreateLeaveRequestDialogProps) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
    const [isLoadingTypes, setIsLoadingTypes] = useState(true);

    // Form fields
    const [leaveTypeId, setLeaveTypeId] = useState<string>('');
    const [durationType, setDurationType] = useState<'full_day' | 'half_day_morning' | 'half_day_afternoon'>('full_day');
    const [startDate, setStartDate] = useState<Date | undefined>();
    const [endDate, setEndDate] = useState<Date | undefined>();
    const [reason, setReason] = useState('');
    const [attachment, setAttachment] = useState<File | null>(null);

    // Fetch leave types on mount
    useEffect(() => {
        const fetchLeaveTypes = async () => {
            setIsLoadingTypes(true);
            try {
                const response = await leaveApi.listTypes();
                if (response.success && response.data) {
                    // Only show active leave types
                    const activeTypes = response.data.filter(t => t.is_active !== false);
                    setLeaveTypes(activeTypes);
                }
            } catch (error) {
                console.error('Failed to fetch leave types:', error);
            } finally {
                setIsLoadingTypes(false);
            }
        };
        
        if (open) {
            fetchLeaveTypes();
        }
    }, [open]);

    // Reset form when dialog closes
    useEffect(() => {
        if (!open) {
            setLeaveTypeId('');
            setDurationType('full_day');
            setStartDate(undefined);
            setEndDate(undefined);
            setReason('');
            setAttachment(null);
        }
    }, [open]);

    // Get selected leave type info
    const selectedLeaveType = leaveTypes.find(t => t.id === leaveTypeId);
    const selectedQuota = leaveQuotas.find(q => q.leave_type_id === leaveTypeId);

    // Calculate requested days
    const calculateDays = () => {
        if (!startDate || !endDate) return 0;
        const days = differenceInDays(endDate, startDate) + 1;
        if (durationType !== 'full_day') return days * 0.5;
        return days;
    };

    const requestedDays = calculateDays();

    // Validation
    const isQuotaSufficient = selectedQuota ? selectedQuota.available_quota >= requestedDays : true;
    const isFormValid = leaveTypeId && startDate && endDate && reason.length >= 10 && isQuotaSufficient;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
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

    const removeAttachment = () => {
        setAttachment(null);
        const fileInput = document.getElementById('attachment') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    };

    const handleSubmit = async () => {
        if (!isFormValid || !startDate || !endDate) return;

        setIsSubmitting(true);
        try {
            const payload: CreateLeaveRequestPayload = {
                employee_id: '', // Will be filled by backend from JWT
                leave_type_id: leaveTypeId,
                start_date: format(startDate, 'yyyy-MM-dd'),
                end_date: format(endDate, 'yyyy-MM-dd'),
                duration_type: durationType,
                reason: reason,
            };

            const response = await leaveApi.createRequest(payload, attachment || undefined);
            
            if (response.success) {
                onSuccess();
            } else {
                throw new Error(response.message || 'Failed to submit leave request');
            }
        } catch (error) {
            console.error('Failed to submit leave request:', error);
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to submit leave request',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Request Leave</DialogTitle>
                    <DialogDescription>
                        Submit a new leave request. All fields are required.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {/* Leave Type */}
                    <div className="grid gap-2">
                        <Label htmlFor="leaveType">Leave Type</Label>
                        <Select value={leaveTypeId} onValueChange={setLeaveTypeId} disabled={isLoadingTypes}>
                            <SelectTrigger>
                                <SelectValue placeholder={isLoadingTypes ? "Loading..." : "Select leave type"} />
                            </SelectTrigger>
                            <SelectContent>
                                {leaveTypes.map((type) => {
                                    const quota = leaveQuotas.find(q => q.leave_type_id === type.id);
                                    return (
                                        <SelectItem key={type.id} value={type.id}>
                                            <div className="flex items-center justify-between w-full">
                                                <span>{type.name}</span>
                                                {quota && (
                                                    <span className="text-xs text-muted-foreground ml-2">
                                                        ({quota.available_quota} days available)
                                                    </span>
                                                )}
                                            </div>
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                        {selectedQuota && (
                            <p className="text-xs text-muted-foreground">
                                Available: {selectedQuota.available_quota} days | Used: {selectedQuota.used_quota} days | Pending: {selectedQuota.pending_quota} days
                            </p>
                        )}
                    </div>

                    {/* Duration Type */}
                    <div className="grid gap-2">
                        <Label htmlFor="durationType">Duration Type</Label>
                        <Select value={durationType} onValueChange={(value: 'full_day' | 'half_day_morning' | 'half_day_afternoon') => setDurationType(value)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="full_day">Full Day</SelectItem>
                                <SelectItem value="half_day_morning">Half Day (Morning)</SelectItem>
                                <SelectItem value="half_day_afternoon">Half Day (Afternoon)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Start Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !startDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {startDate ? format(startDate, "PPP") : "Pick date"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={startDate}
                                        onSelect={setStartDate}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="grid gap-2">
                            <Label>End Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !endDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {endDate ? format(endDate, "PPP") : "Pick date"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={endDate}
                                        onSelect={setEndDate}
                                        disabled={(date) => startDate ? date < startDate : false}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    {/* Requested Days Summary */}
                    {startDate && endDate && (
                        <div className="bg-slate-50 p-3 rounded-md">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Requested Duration:</span>
                                <span className="font-medium">{requestedDays} {requestedDays === 1 ? 'day' : 'days'}</span>
                            </div>
                            {!isQuotaSufficient && (
                                <Alert variant="destructive" className="mt-2">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        Insufficient quota. You have {selectedQuota?.available_quota || 0} days available.
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>
                    )}

                    {/* Reason */}
                    <div className="grid gap-2">
                        <Label htmlFor="reason">Reason</Label>
                        <Textarea
                            id="reason"
                            placeholder="Please provide a detailed reason for your leave request (minimum 10 characters)"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={3}
                        />
                        <p className="text-xs text-muted-foreground">
                            {reason.length}/10 characters minimum
                        </p>
                    </div>

                    {/* Attachment */}
                    <div className="grid gap-2">
                        <Label htmlFor="attachment">Attachment (Optional)</Label>
                        {attachment ? (
                            <div className="flex items-center justify-between p-2 border rounded-md bg-slate-50">
                                <div className="flex items-center gap-2">
                                    <Upload className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm truncate max-w-[200px]">{attachment.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                        ({(attachment.size / 1024).toFixed(1)} KB)
                                    </span>
                                </div>
                                <Button variant="ghost" size="sm" onClick={removeAttachment}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <Input
                                id="attachment"
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={handleFileChange}
                            />
                        )}
                        <p className="text-xs text-muted-foreground">
                            Supported formats: PDF, JPG, PNG. Max size: 5MB
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={!isFormValid || isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            'Submit Request'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
