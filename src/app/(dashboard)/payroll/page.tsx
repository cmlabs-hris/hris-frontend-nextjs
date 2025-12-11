'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Loader2 } from 'lucide-react';
import PayrollTable from '@/components/payroll/PayrollTable';
import { payrollApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

// Generate Payroll Dialog
function GeneratePayrollDialog({ onSuccess }: { onSuccess: () => void }) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const { toast } = useToast();

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

    const handleGenerate = async () => {
        try {
            setIsLoading(true);
            const response = await payrollApi.generate({
                period_month: month,
                period_year: year,
            });

            if (response.success) {
                toast({
                    title: "Success",
                    description: `Payroll generated for ${months[month - 1].label} ${year}`,
                });
                setOpen(false);
                onSuccess();
            } else {
                throw new Error(response.message || 'Failed to generate payroll');
            }
        } catch (error) {
            console.error('Failed to generate payroll:', error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to generate payroll",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Generate Payroll
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Generate Payroll</DialogTitle>
                    <DialogDescription>
                        Generate payroll records for all employees for the selected period.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
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
                    <p className="text-sm text-muted-foreground">
                        This will calculate payroll for all active employees based on their attendance records, 
                        base salary, and assigned payroll components for the selected period.
                    </p>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button onClick={handleGenerate} disabled={isLoading}>
                        {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Generate
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function PayrollPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshKey, setRefreshKey] = useState(0);

    const handlePayrollGenerated = () => {
        setRefreshKey(prev => prev + 1);
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <CardTitle>Payroll Management</CardTitle>
                        <CardDescription>View and manage employee payroll records.</CardDescription>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search employee..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <GeneratePayrollDialog onSuccess={handlePayrollGenerated} />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <PayrollTable key={refreshKey} searchQuery={searchQuery} />
            </CardContent>
        </Card>
    );
}

