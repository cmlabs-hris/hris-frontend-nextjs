'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, Loader2, Search, X } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { 
    WorkSchedule, 
    EmployeeWithDetails,
    scheduleApi, 
    employeeApi,
    ApiError 
} from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface AssignScheduleDialogProps {
    schedule: WorkSchedule;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export default function AssignScheduleDialog({ schedule, open, onOpenChange, onSuccess }: AssignScheduleDialogProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);
    const [employees, setEmployees] = useState<EmployeeWithDetails[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Form state
    const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
    const [effectiveDate, setEffectiveDate] = useState<Date>(new Date());
    const [endDate, setEndDate] = useState<Date | undefined>();
    const [isPermanent, setIsPermanent] = useState(true);

    useEffect(() => {
        if (open) {
            fetchEmployees();
        }
    }, [open]);

    const fetchEmployees = async () => {
        setIsLoadingEmployees(true);
        try {
            const response = await employeeApi.list({ limit: 100 });
            if (response.data && response.data.employees) {
                setEmployees(response.data.employees);
            } else {
                setEmployees([]);
            }
        } catch (err) {
            const apiError = err as ApiError;
            toast({
                title: "Error",
                description: apiError.message || "Failed to load employees",
                variant: "destructive"
            });
            setEmployees([]);
        } finally {
            setIsLoadingEmployees(false);
        }
    };

    const filteredEmployees = employees.filter(emp => 
        emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employee_code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleEmployee = (employeeId: string) => {
        setSelectedEmployees(prev => 
            prev.includes(employeeId)
                ? prev.filter(id => id !== employeeId)
                : [...prev, employeeId]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (selectedEmployees.length === 0) {
            toast({
                title: "Error",
                description: "Please select at least one employee",
                variant: "destructive"
            });
            return;
        }

        setIsLoading(true);
        
        try {
            // Assign schedule to each selected employee
            const promises = selectedEmployees.map(employeeId => 
                scheduleApi.assignToEmployee(schedule.id, employeeId, {
                    start_date: format(effectiveDate, 'yyyy-MM-dd'),
                    end_date: !isPermanent && endDate ? format(endDate, 'yyyy-MM-dd') : undefined
                })
            );

            await Promise.all(promises);
            
            toast({
                title: "Success",
                description: `Schedule assigned to ${selectedEmployees.length} employee(s)`
            });
            
            // Reset form
            setSelectedEmployees([]);
            setEffectiveDate(new Date());
            setEndDate(undefined);
            setIsPermanent(true);
            
            onOpenChange(false);
            onSuccess();
        } catch (err) {
            const apiError = err as ApiError;
            toast({
                title: "Error",
                description: apiError.message || "Failed to assign schedule",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            onOpenChange(false);
            setSelectedEmployees([]);
            setSearchTerm('');
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Assign Schedule to Employees</DialogTitle>
                    <DialogDescription>
                        Assign "{schedule.name}" to one or more employees
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        {/* Employee Search and Selection */}
                        <div className="space-y-2">
                            <Label>Select Employees</Label>
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search employees..."
                                    className="pl-8"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            
                            {/* Selected employees badges */}
                            {selectedEmployees.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {selectedEmployees.map(id => {
                                        const emp = employees.find(e => e.id === id);
                                        return emp ? (
                                            <Badge key={id} variant="secondary" className="gap-1">
                                                {emp.full_name}
                                                <X 
                                                    className="h-3 w-3 cursor-pointer" 
                                                    onClick={() => toggleEmployee(id)} 
                                                />
                                            </Badge>
                                        ) : null;
                                    })}
                                </div>
                            )}
                            
                            {/* Employee list */}
                            <ScrollArea className="h-[150px] border rounded-md">
                                {isLoadingEmployees ? (
                                    <div className="flex items-center justify-center h-full">
                                        <Loader2 className="h-6 w-6 animate-spin" />
                                    </div>
                                ) : filteredEmployees.length === 0 ? (
                                    <div className="flex items-center justify-center h-full text-muted-foreground">
                                        No employees found
                                    </div>
                                ) : (
                                    <div className="p-2 space-y-1">
                                        {filteredEmployees.map(emp => (
                                            <div
                                                key={emp.id}
                                                className={cn(
                                                    "flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-muted",
                                                    selectedEmployees.includes(emp.id) && "bg-primary/10"
                                                )}
                                                onClick={() => toggleEmployee(emp.id)}
                                            >
                                                <div>
                                                    <p className="font-medium text-sm">{emp.full_name}</p>
                                                    <p className="text-xs text-muted-foreground">{emp.employee_code}</p>
                                                </div>
                                                {selectedEmployees.includes(emp.id) && (
                                                    <Badge variant="default" className="text-xs">Selected</Badge>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </div>

                        {/* Effective Date */}
                        <div className="space-y-2">
                            <Label>Effective Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !effectiveDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {effectiveDate ? format(effectiveDate, "PPP") : "Select date"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={effectiveDate}
                                        onSelect={(date) => date && setEffectiveDate(date)}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Duration Type */}
                        <div className="space-y-2">
                            <Label>Duration</Label>
                            <Select 
                                value={isPermanent ? 'permanent' : 'temporary'} 
                                onValueChange={(v) => setIsPermanent(v === 'permanent')}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="permanent">Permanent (No end date)</SelectItem>
                                    <SelectItem value="temporary">Temporary (With end date)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* End Date (if temporary) */}
                        {!isPermanent && (
                            <div className="space-y-2">
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
                                            {endDate ? format(endDate, "PPP") : "Select end date"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={endDate}
                                            onSelect={setEndDate}
                                            disabled={(date) => date < effectiveDate}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading || selectedEmployees.length === 0}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Assign Schedule
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
