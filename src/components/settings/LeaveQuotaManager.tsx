'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Search } from "lucide-react";
import { leaveApi, employeeApi, LeaveQuota, LeaveType, EmployeeWithDetails } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface AdjustmentFormData {
    employee_id: string;
    leave_type_id: string;
    adjustment: number;
    reason: string;
}

const initialFormData: AdjustmentFormData = {
    employee_id: '',
    leave_type_id: '',
    adjustment: 0,
    reason: '',
};

export default function LeaveQuotaManager() {
    const { toast } = useToast();
    const [quotas, setQuotas] = useState<LeaveQuota[]>([]);
    const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
    const [employees, setEmployees] = useState<EmployeeWithDetails[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formData, setFormData] = useState<AdjustmentFormData>(initialFormData);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterLeaveType, setFilterLeaveType] = useState<string>('all');

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [quotaResponse, typesResponse, employeesResponse] = await Promise.all([
                leaveApi.listQuota(),
                leaveApi.listTypes(),
                employeeApi.list()
            ]);

            if (quotaResponse.success && quotaResponse.data) {
                setQuotas(quotaResponse.data);
            }
            if (typesResponse.success && typesResponse.data) {
                setLeaveTypes(typesResponse.data);
            }
            if (employeesResponse.success && employeesResponse.data) {
                setEmployees(employeesResponse.data.employees || []);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
            toast({
                title: "Error",
                description: "Failed to load quota data",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleOpenDialog = () => {
        setFormData(initialFormData);
        setIsDialogOpen(true);
    };

    const handleSubmit = async () => {
        if (!formData.employee_id || !formData.leave_type_id) {
            toast({
                title: "Validation Error",
                description: "Please select an employee and leave type",
                variant: "destructive",
            });
            return;
        }
        if (!formData.reason.trim()) {
            toast({
                title: "Validation Error",
                description: "Please provide a reason for the adjustment",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await leaveApi.adjustQuota({
                employee_id: formData.employee_id,
                leave_type_id: formData.leave_type_id,
                adjustment: formData.adjustment,
                reason: formData.reason.trim(),
            });

            if (response.success) {
                toast({
                    title: "Success",
                    description: "Leave quota adjusted successfully",
                });
                setIsDialogOpen(false);
                fetchData();
            } else {
                throw new Error(response.message || 'Operation failed');
            }
        } catch (error) {
            console.error('Failed to adjust quota:', error);
            toast({
                title: "Error",
                description: "Failed to adjust leave quota",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Group quotas by employee
    const groupedQuotas = quotas.reduce((acc, quota) => {
        const employee = employees.find(e => e.id === quota.employee_id);
        const employeeName = employee?.full_name || 'Unknown Employee';
        if (!acc[quota.employee_id]) {
            acc[quota.employee_id] = {
                employeeName,
                employeeCode: employee?.employee_code || '',
                quotas: [],
            };
        }
        acc[quota.employee_id].quotas.push(quota);
        return acc;
    }, {} as Record<string, { employeeName: string; employeeCode: string; quotas: LeaveQuota[] }>);

    // Filter quotas
    const filteredGroups = Object.entries(groupedQuotas).filter(([, group]) => {
        const matchesSearch = searchQuery === '' || 
            group.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            group.employeeCode.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesType = filterLeaveType === 'all' ||
            group.quotas.some(q => q.leave_type_id === filterLeaveType);

        return matchesSearch && matchesType;
    });

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Leave Quota Management</CardTitle>
                    <CardDescription>
                        View and adjust employee leave quotas.
                    </CardDescription>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={handleOpenDialog}>
                            <Plus className="h-4 w-4 mr-2" />
                            Adjust Quota
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Adjust Leave Quota</DialogTitle>
                            <DialogDescription>
                                Add or subtract days from an employee&apos;s leave quota.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label>Employee *</Label>
                                <Select
                                    value={formData.employee_id}
                                    onValueChange={(value) => setFormData({ ...formData, employee_id: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select employee" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {employees.map((emp) => (
                                            <SelectItem key={emp.id} value={emp.id}>
                                                {emp.full_name} ({emp.employee_code})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Leave Type *</Label>
                                <Select
                                    value={formData.leave_type_id}
                                    onValueChange={(value) => setFormData({ ...formData, leave_type_id: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select leave type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {leaveTypes.filter(t => t.has_quota).map((type) => (
                                            <SelectItem key={type.id} value={type.id}>
                                                {type.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Adjustment (days)</Label>
                                <Input
                                    type="number"
                                    value={formData.adjustment}
                                    onChange={(e) => setFormData({ ...formData, adjustment: parseInt(e.target.value) || 0 })}
                                    placeholder="e.g., 2 or -1"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Use positive numbers to add days, negative to subtract.
                                </p>
                            </div>
                            <div className="grid gap-2">
                                <Label>Reason *</Label>
                                <Input
                                    value={formData.reason}
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                    placeholder="e.g., Bonus leave for project completion"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
                                Cancel
                            </Button>
                            <Button onClick={handleSubmit} disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                Apply Adjustment
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                {/* Filters */}
                <div className="flex gap-4 mb-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search employee..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <Select value={filterLeaveType} onValueChange={setFilterLeaveType}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Filter by leave type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Leave Types</SelectItem>
                            {leaveTypes.filter(t => t.has_quota).map((type) => (
                                <SelectItem key={type.id} value={type.id}>
                                    {type.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : filteredGroups.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        No leave quotas found.
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredGroups.map(([employeeId, group]) => (
                            <div key={employeeId} className="border rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <h4 className="font-semibold">{group.employeeName}</h4>
                                    <Badge variant="outline">{group.employeeCode}</Badge>
                                </div>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Leave Type</TableHead>
                                            <TableHead className="text-right">Opening</TableHead>
                                            <TableHead className="text-right">Earned</TableHead>
                                            <TableHead className="text-right">Adjustment</TableHead>
                                            <TableHead className="text-right">Used</TableHead>
                                            <TableHead className="text-right">Pending</TableHead>
                                            <TableHead className="text-right">Available</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {group.quotas
                                            .filter(q => filterLeaveType === 'all' || q.leave_type_id === filterLeaveType)
                                            .map((quota) => (
                                            <TableRow key={quota.id}>
                                                <TableCell className="font-medium">
                                                    {quota.leave_type_name || leaveTypes.find(t => t.id === quota.leave_type_id)?.name || 'Unknown'}
                                                </TableCell>
                                                <TableCell className="text-right">{quota.opening_balance}</TableCell>
                                                <TableCell className="text-right">{quota.earned_quota}</TableCell>
                                                <TableCell className="text-right">
                                                    <span className={quota.adjustment_quota >= 0 ? 'text-green-600' : 'text-red-600'}>
                                                        {quota.adjustment_quota >= 0 ? '+' : ''}{quota.adjustment_quota}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">{quota.used_quota}</TableCell>
                                                <TableCell className="text-right text-amber-600">{quota.pending_quota}</TableCell>
                                                <TableCell className="text-right font-semibold text-primary">{quota.available_quota}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
