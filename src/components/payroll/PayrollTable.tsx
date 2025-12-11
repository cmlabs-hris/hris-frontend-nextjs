'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash2, CheckCircle2, FileDown, ListFilter, Loader2, Eye } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { payrollApi, PayrollRecord, PayrollFilter, PayrollSummary } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Helper untuk format mata uang dari string decimal
const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(numAmount);
};

// Helper untuk format period
const formatPeriod = (month: number, year: number) => {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    return `${monthNames[month - 1]} ${year}`;
};

// Get current month and year
const getCurrentPeriod = () => {
    const now = new Date();
    return { month: now.getMonth() + 1, year: now.getFullYear() };
};

// Filter Dialog
const FilterDialog = ({ 
    currentFilters, 
    onApplyFilter 
}: { 
    currentFilters: { status: string; month: number; year: number };
    onApplyFilter: (filters: { status: string; month: number; year: number }) => void;
}) => {
    const [status, setStatus] = useState(currentFilters.status);
    const [month, setMonth] = useState(currentFilters.month);
    const [year, setYear] = useState(currentFilters.year);
    const [open, setOpen] = useState(false);
    
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
    const months = [
        { value: 1, label: 'January' },
        { value: 2, label: 'February' },
        { value: 3, label: 'March' },
        { value: 4, label: 'April' },
        { value: 5, label: 'May' },
        { value: 6, label: 'June' },
        { value: 7, label: 'July' },
        { value: 8, label: 'August' },
        { value: 9, label: 'September' },
        { value: 10, label: 'October' },
        { value: 11, label: 'November' },
        { value: 12, label: 'December' },
    ];

    const handleApply = () => {
        onApplyFilter({ status, month, year });
        setOpen(false);
    };

    const handleReset = () => {
        const current = getCurrentPeriod();
        setStatus('');
        setMonth(current.month);
        setYear(current.year);
        onApplyFilter({ status: '', month: current.month, year: current.year });
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                    <ListFilter className="h-4 w-4" />
                    <span>Filter</span>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Filter Payroll</DialogTitle>
                    <DialogDescription>Filter payroll records based on criteria below.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select onValueChange={setStatus} value={status}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Statuses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="paid">Paid</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Month</Label>
                            <Select onValueChange={(v) => setMonth(parseInt(v))} value={String(month)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select month" />
                                </SelectTrigger>
                                <SelectContent>
                                    {months.map((m) => (
                                        <SelectItem key={m.value} value={String(m.value)}>
                                            {m.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Year</Label>
                            <Select onValueChange={(v) => setYear(parseInt(v))} value={String(year)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select year" />
                                </SelectTrigger>
                                <SelectContent>
                                    {years.map((y) => (
                                        <SelectItem key={y} value={String(y)}>
                                            {y}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={handleReset}>Reset</Button>
                    <Button onClick={handleApply}>Apply Filter</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

// Payroll Detail Dialog
const PayrollDetailDialog = ({ record }: { record: PayrollRecord }) => {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="flex items-center gap-2">
                    <Eye className="h-4 w-4"/> 
                    <span>View Details</span>
                </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Payroll Details</DialogTitle>
                    <DialogDescription>
                        {record.employee_name} - {formatPeriod(record.period_month, record.period_year)}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="text-muted-foreground">Employee</Label>
                            <p className="font-medium">{record.employee_name}</p>
                            <p className="text-sm text-muted-foreground">{record.employee_code}</p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Position / Branch</Label>
                            <p className="font-medium">{record.position_name || '-'}</p>
                            <p className="text-sm text-muted-foreground">{record.branch_name || '-'}</p>
                        </div>
                    </div>
                    
                    <div className="border-t pt-4">
                        <h4 className="font-semibold mb-2">Salary Breakdown</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span>Base Salary</span>
                                <span className="font-medium">{formatCurrency(record.base_salary)}</span>
                            </div>
                            <div className="flex justify-between text-green-600">
                                <span>Total Allowances</span>
                                <span>+{formatCurrency(record.total_allowances)}</span>
                            </div>
                            {record.allowances_detail && Object.entries(record.allowances_detail).map(([name, amount]) => (
                                <div key={name} className="flex justify-between text-sm text-muted-foreground pl-4">
                                    <span>{name}</span>
                                    <span>+{formatCurrency(amount)}</span>
                                </div>
                            ))}
                            <div className="flex justify-between text-green-600">
                                <span>Overtime ({record.total_overtime_minutes} min)</span>
                                <span>+{formatCurrency(record.overtime_amount)}</span>
                            </div>
                            <div className="flex justify-between text-red-500">
                                <span>Total Deductions</span>
                                <span>-{formatCurrency(record.total_deductions)}</span>
                            </div>
                            {record.deductions_detail && Object.entries(record.deductions_detail).map(([name, amount]) => (
                                <div key={name} className="flex justify-between text-sm text-muted-foreground pl-4">
                                    <span>{name}</span>
                                    <span>-{formatCurrency(amount)}</span>
                                </div>
                            ))}
                            <div className="flex justify-between text-red-500">
                                <span>Late Deduction ({record.total_late_minutes} min)</span>
                                <span>-{formatCurrency(record.late_deduction_amount)}</span>
                            </div>
                            <div className="flex justify-between text-red-500">
                                <span>Early Leave Deduction ({record.total_early_leave_minutes} min)</span>
                                <span>-{formatCurrency(record.early_leave_deduction_amount)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="border-t pt-4 space-y-2">
                        <div className="flex justify-between">
                            <span>Gross Salary</span>
                            <span className="font-medium">{formatCurrency(record.gross_salary)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-semibold">
                            <span>Net Salary</span>
                            <span>{formatCurrency(record.net_salary)}</span>
                        </div>
                    </div>

                    <div className="border-t pt-4 grid grid-cols-2 gap-4">
                        <div>
                            <Label className="text-muted-foreground">Work Days</Label>
                            <p className="font-medium">{record.total_work_days} days</p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Status</Label>
                            <p className="font-medium capitalize">{record.status}</p>
                            {record.paid_at && (
                                <p className="text-sm text-muted-foreground">
                                    Paid: {format(new Date(record.paid_at), 'PPP')}
                                </p>
                            )}
                        </div>
                    </div>

                    {record.notes && (
                        <div className="border-t pt-4">
                            <Label className="text-muted-foreground">Notes</Label>
                            <p>{record.notes}</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

// Main Table Component
interface PayrollTableProps {
    searchQuery: string;
}

export default function PayrollTable({ searchQuery }: PayrollTableProps) {
    const currentPeriod = getCurrentPeriod();
    const [payrollData, setPayrollData] = useState<PayrollRecord[]>([]);
    const [filteredData, setFilteredData] = useState<PayrollRecord[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [finalizingIds, setFinalizingIds] = useState<string[]>([]);
    const [filters, setFilters] = useState<{ status: string; month: number; year: number }>({ 
        status: '', 
        month: currentPeriod.month, 
        year: currentPeriod.year 
    });
    const { toast } = useToast();

    // Fetch payroll data
    const fetchPayroll = useCallback(async () => {
        try {
            setIsLoading(true);
            const filter: PayrollFilter = {
                period_month: filters.month,
                period_year: filters.year,
            };
            
            if (filters.status && filters.status !== 'all') {
                filter.status = filters.status;
            }

            const response = await payrollApi.listRecords(filter);
            if (response.success && response.data) {
                setPayrollData(response.data.data || []);
                setTotalCount(response.data.total_count || 0);
            } else {
                setPayrollData([]);
                setTotalCount(0);
            }
        } catch (error) {
            console.error('Failed to fetch payroll:', error);
            setPayrollData([]);
            setTotalCount(0);
            toast({
                title: "Error",
                description: "Failed to fetch payroll data",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }, [filters, toast]);

    useEffect(() => {
        fetchPayroll();
    }, [fetchPayroll]);

    // Filter by search query (realtime)
    useEffect(() => {
        if (!payrollData || !Array.isArray(payrollData)) {
            setFilteredData([]);
            return;
        }
        
        if (!searchQuery.trim()) {
            setFilteredData(payrollData);
        } else {
            const query = searchQuery.toLowerCase();
            const filtered = payrollData.filter(record => 
                record.employee_name?.toLowerCase().includes(query) ||
                record.employee_code?.toLowerCase().includes(query) ||
                record.position_name?.toLowerCase().includes(query) ||
                record.branch_name?.toLowerCase().includes(query)
            );
            setFilteredData(filtered);
        }
    }, [searchQuery, payrollData]);

    // Handle delete
    const handleDelete = async (id: string) => {
        try {
            setDeletingId(id);
            const response = await payrollApi.deleteRecord(id);
            if (response.success) {
                toast({
                    title: "Success",
                    description: "Payroll record deleted successfully",
                });
                fetchPayroll();
            } else {
                throw new Error(response.message || 'Failed to delete');
            }
        } catch (error) {
            console.error('Failed to delete:', error);
            toast({
                title: "Error",
                description: "Failed to delete payroll record",
                variant: "destructive",
            });
        } finally {
            setDeletingId(null);
        }
    };

    // Handle finalize (mark as paid)
    const handleFinalize = async (record: PayrollRecord) => {
        try {
            setFinalizingIds(prev => [...prev, record.id]);
            const response = await payrollApi.finalize({ record_ids: [record.id] });
            if (response.success) {
                toast({
                    title: "Success",
                    description: `Payroll for ${record.employee_name} marked as paid`,
                });
                fetchPayroll();
            } else {
                throw new Error(response.message || 'Failed to finalize');
            }
        } catch (error) {
            console.error('Failed to finalize:', error);
            toast({
                title: "Error",
                description: "Failed to finalize payroll",
                variant: "destructive",
            });
        } finally {
            setFinalizingIds(prev => prev.filter(id => id !== record.id));
        }
    };

    // Handle filter apply
    const handleApplyFilter = (newFilters: { status: string; month: number; year: number }) => {
        setFilters(newFilters);
    };

    // Download PDF
    const handleDownloadPDF = () => {
        const doc = new jsPDF();
        doc.text("Payroll Report", 14, 16);
        doc.text(`Period: ${formatPeriod(filters.month, filters.year)}`, 14, 24);
        doc.text(`Generated: ${format(new Date(), "PPP")}`, 14, 32);
        
        const tableColumn = ["Employee", "Position", "Period", "Base Salary", "Allowances", "Deductions", "Net Salary", "Status"];
        const tableRows: string[][] = [];
        
        filteredData.forEach(record => {
            tableRows.push([
                record.employee_name || '-',
                record.position_name || '-',
                formatPeriod(record.period_month, record.period_year),
                formatCurrency(record.base_salary),
                formatCurrency(record.total_allowances),
                formatCurrency(record.total_deductions),
                formatCurrency(record.net_salary),
                record.status
            ]);
        });
        
        autoTable(doc, { head: [tableColumn], body: tableRows, startY: 40 });
        doc.save(`payroll_report_${filters.month}_${filters.year}.pdf`);
    };

    // Get status badge
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'draft':
                return <Badge className="bg-yellow-400 text-yellow-900">Draft</Badge>;
            case 'paid':
                return <Badge className="bg-green-500">Paid</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading payroll data...</span>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                    Showing payroll for <span className="font-semibold">{formatPeriod(filters.month, filters.year)}</span>
                </div>
                <div className="flex items-center gap-2">
                    <FilterDialog currentFilters={filters} onApplyFilter={handleApplyFilter} />
                    <Button variant="outline" size="sm" className="gap-1" onClick={handleDownloadPDF}>
                        <FileDown className="h-4 w-4" />
                        <span>Download</span>
                    </Button>
                </div>
            </div>
            
            <div className="rounded-md border">
                <Table>
                    <TableHeader className="bg-slate-100 dark:bg-slate-800">
                        <TableRow>
                            <TableHead>Employee</TableHead>
                            <TableHead>Position</TableHead>
                            <TableHead>Base Salary</TableHead>
                            <TableHead>Allowances</TableHead>
                            <TableHead>Deductions</TableHead>
                            <TableHead>Net Salary</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-10 text-gray-500">
                                    {searchQuery ? 'No matching records found' : 'No payroll records found for this period'}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredData.map((record) => (
                                <TableRow key={record.id}>
                                    <TableCell className="font-medium">
                                        <div>
                                            <p>{record.employee_name || 'Unknown'}</p>
                                            <p className="text-xs text-gray-400">{record.employee_code}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <p>{record.position_name || '-'}</p>
                                            <p className="text-xs text-gray-400">{record.branch_name || '-'}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>{formatCurrency(record.base_salary)}</TableCell>
                                    <TableCell className="text-green-600">+{formatCurrency(record.total_allowances)}</TableCell>
                                    <TableCell className="text-red-500">-{formatCurrency(record.total_deductions)}</TableCell>
                                    <TableCell className="font-semibold">{formatCurrency(record.net_salary)}</TableCell>
                                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4"/>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <PayrollDetailDialog record={record} />
                                                
                                                {record.status === 'draft' && (
                                                    <DropdownMenuItem 
                                                        onClick={() => handleFinalize(record)}
                                                        disabled={finalizingIds.includes(record.id)}
                                                        className="flex items-center gap-2"
                                                    >
                                                        {finalizingIds.includes(record.id) ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <CheckCircle2 className="h-4 w-4" />
                                                        )}
                                                        <span>Mark as Paid</span>
                                                    </DropdownMenuItem>
                                                )}
                                                
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-500 flex items-center gap-2">
                                                            <Trash2 className="h-4 w-4"/> 
                                                            <span>Delete</span>
                                                        </DropdownMenuItem>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Delete Payroll Record?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This will permanently delete the payroll record for {record.employee_name}.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction 
                                                                onClick={() => handleDelete(record.id)}
                                                                disabled={deletingId === record.id}
                                                            >
                                                                {deletingId === record.id ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                                                                Delete
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            
            <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                    Showing {filteredData.length} of {totalCount} records
                </div>
            </div>
        </div>
    );
}
