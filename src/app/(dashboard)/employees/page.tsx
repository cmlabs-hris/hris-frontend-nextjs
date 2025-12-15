'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ListFilter, FileDown, Loader2, RefreshCw, Search, X } from "lucide-react";
import EmployeeTable from "@/components/employees/EmployeeTable";
import AddEmployeeDialog from "@/components/employees/AddEmployeeDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    employeeApi, 
    masterApi,
    scheduleApi,
    EmployeeWithDetails, 
    CreateEmployeeRequest,
    UpdateEmployeeRequest,
    Position, 
    Grade, 
    Branch,
    WorkSchedule,
    ApiError 
} from '@/lib/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useToast } from '@/hooks/use-toast';

// Filter Dialog Component
interface FilterDialogProps {
    positions: Position[];
    branches: Branch[];
    filter: {
        search: string;
        position_id: string;
        branch_id: string;
        employment_status: string;
    };
    onFilterChange: (filter: FilterDialogProps['filter']) => void;
    onApply: () => void;
}

const FilterDialog = ({ positions, branches, filter, onFilterChange, onApply }: FilterDialogProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [localFilter, setLocalFilter] = useState(filter);

    const handleApply = () => {
        onFilterChange(localFilter);
        onApply();
        setIsOpen(false);
    };

    const handleReset = () => {
        const resetFilter = { search: '', position_id: '', branch_id: '', employment_status: '' };
        setLocalFilter(resetFilter);
        onFilterChange(resetFilter);
        onApply();
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                    <ListFilter className="h-4 w-4" />
                    <span className="hidden sm:inline">Filter</span>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Filter Employees</DialogTitle>
                    <DialogDescription>Filter the employee list based on criteria below.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="search" className="text-right">Search</Label>
                        <Input 
                            id="search" 
                            placeholder="Name or employee code..." 
                            className="col-span-3" 
                            value={localFilter.search}
                            onChange={(e) => setLocalFilter(prev => ({ ...prev, search: e.target.value }))}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Position</Label>
                        <Select 
                            value={localFilter.position_id} 
                            onValueChange={(v) => setLocalFilter(prev => ({ ...prev, position_id: v === 'all' ? '' : v }))}
                        >
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="All Positions" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Positions</SelectItem>
                                {positions.map(pos => (
                                    <SelectItem key={pos.id} value={pos.id}>{pos.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Branch</Label>
                        <Select 
                            value={localFilter.branch_id} 
                            onValueChange={(v) => setLocalFilter(prev => ({ ...prev, branch_id: v === 'all' ? '' : v }))}
                        >
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="All Branches" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Branches</SelectItem>
                                {branches.map(branch => (
                                    <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Status</Label>
                        <Select 
                            value={localFilter.employment_status} 
                            onValueChange={(v) => setLocalFilter(prev => ({ ...prev, employment_status: v === 'all' ? '' : v }))}
                        >
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="All Statuses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
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


// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

export default function EmployeePage() {
    const { toast } = useToast();
    
    // State
    const [employees, setEmployees] = useState<EmployeeWithDetails[]>([]);
    const [positions, setPositions] = useState<Position[]>([]);
    const [grades, setGrades] = useState<Grade[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [workSchedules, setWorkSchedules] = useState<WorkSchedule[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState({
        search: '',
        position_id: '',
        branch_id: '',
        employment_status: '',
    });

    // Debounce search query (300ms delay)
    const debouncedSearch = useDebounce(searchQuery, 300);

    // Load master data
    const loadMasterData = useCallback(async () => {
        try {
            const [posRes, gradeRes, branchRes, scheduleRes] = await Promise.all([
                masterApi.listPositions(),
                masterApi.listGrades(),
                masterApi.listBranches(),
                scheduleApi.list(),
            ]);
            
            if (posRes.data) setPositions(posRes.data);
            if (gradeRes.data) setGrades(gradeRes.data);
            if (branchRes.data) setBranches(branchRes.data);
            // Schedule API returns { work_schedules: [...] } in data
            if (scheduleRes.data) {
                const schedules = Array.isArray(scheduleRes.data) 
                    ? scheduleRes.data 
                    : (scheduleRes.data as { work_schedules?: WorkSchedule[] }).work_schedules || [];
                setWorkSchedules(schedules);
            }
        } catch (err) {
            console.error('Failed to load master data:', err);
        }
    }, []);

    // Load employees
    const loadEmployees = useCallback(async (searchTerm?: string) => {
        try {
            const response = await employeeApi.list({
                search: searchTerm || filter.search || undefined,
                position_id: filter.position_id || undefined,
                branch_id: filter.branch_id || undefined,
                employment_status: filter.employment_status || undefined,
            });
            
            console.log('Employee API response:', response);
            
            if (response.data) {
                // Handle both array and paginated response
                const employeeData = Array.isArray(response.data) 
                    ? response.data 
                    : (response.data as unknown as { items?: EmployeeWithDetails[], employees?: EmployeeWithDetails[] }).items 
                      || (response.data as unknown as { items?: EmployeeWithDetails[], employees?: EmployeeWithDetails[] }).employees
                      || [];
                setEmployees(employeeData);
            } else {
                setEmployees([]);
            }
            setError(null);
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.errorDetail.message);
            } else {
                setError('Failed to load employees');
            }
            setEmployees([]);
        }
    }, [filter]);

    // Initial load
    useEffect(() => {
        const initLoad = async () => {
            setIsLoading(true);
            await Promise.all([loadMasterData(), loadEmployees()]);
            setIsLoading(false);
        };
        initLoad();
    }, [loadMasterData, loadEmployees]);

    // Realtime search effect
    useEffect(() => {
        if (!isLoading) {
            setIsSearching(true);
            loadEmployees(debouncedSearch).finally(() => setIsSearching(false));
        }
    }, [debouncedSearch]);

    // Refresh
    const handleRefresh = async () => {
        setIsRefreshing(true);
        await loadEmployees();
        setIsRefreshing(false);
    };

    // Add Employee
    const handleAddEmployee = async (data: CreateEmployeeRequest, avatar?: File) => {
        try {
            await employeeApi.create(data, avatar);
            toast({
                title: "Success",
                description: "Employee added successfully. Invitation email has been sent.",
            });
            await loadEmployees();
        } catch (err) {
            if (err instanceof ApiError) {
                toast({
                    title: "Error",
                    description: err.errorDetail.message,
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Error",
                    description: "Failed to add employee",
                    variant: "destructive",
                });
            }
            throw err;
        }
    };

    // Update Employee
    const handleUpdateEmployee = async (id: string, data: UpdateEmployeeRequest) => {
        try {
            await employeeApi.update(id, data);
            toast({
                title: "Success",
                description: "Employee updated successfully",
            });
            await loadEmployees();
        } catch (err) {
            if (err instanceof ApiError) {
                toast({
                    title: "Error",
                    description: err.errorDetail.message,
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Error",
                    description: "Failed to update employee",
                    variant: "destructive",
                });
            }
            throw err;
        }
    };

    // Delete Employee
    const handleDeleteEmployee = async (id: string) => {
        try {
            await employeeApi.delete(id);
            toast({
                title: "Success",
                description: "Employee deleted successfully",
            });
            await loadEmployees();
        } catch (err) {
            if (err instanceof ApiError) {
                toast({
                    title: "Error",
                    description: err.errorDetail.message,
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Error",
                    description: "Failed to delete employee",
                    variant: "destructive",
                });
            }
        }
    };

    // Inactivate Employee
    const handleInactivateEmployee = async (id: string, resignationDate: string) => {
        try {
            await employeeApi.inactivate(id, resignationDate);
            toast({
                title: "Success",
                description: "Employee deactivated successfully",
            });
            await loadEmployees();
        } catch (err) {
            if (err instanceof ApiError) {
                toast({
                    title: "Error",
                    description: err.errorDetail.message,
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Error",
                    description: "Failed to deactivate employee",
                    variant: "destructive",
                });
            }
        }
    };

    // Download PDF
    const handleDownloadPDF = () => {
        const doc = new jsPDF();
        doc.text("All Employee Information Report", 14, 16);
        const tableColumn = ["No", "Employee Code", "Name", "Position", "Branch", "Status"];
        const tableRows: (string | number)[][] = [];
        
        employees.forEach((employee, index) => {
            const employeeData = [
                index + 1, 
                employee.employee_code,
                employee.full_name, 
                employee.position_name || '-',
                employee.branch_name || '-',
                employee.employment_status
            ];
            tableRows.push(employeeData);
        });
        
        autoTable(doc, { 
            head: [tableColumn], 
            body: tableRows, 
            startY: 20 
        });

        doc.save("employee_report.pdf");
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>All Employee Information</CardTitle>
                        <CardDescription>
                            Manage and view all employee data. Total: {employees.length} employees
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Realtime Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search employee..."
                                className="pl-8 pr-8 h-9 w-[200px] lg:w-[250px]"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                            {isSearching && (
                                <div className="absolute right-8 top-1/2 -translate-y-1/2">
                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                </div>
                            )}
                        </div>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                        >
                            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        </Button>
                        <FilterDialog 
                            positions={positions}
                            branches={branches}
                            filter={filter}
                            onFilterChange={setFilter}
                            onApply={handleRefresh}
                        />
                        <Button variant="outline" size="sm" className="gap-1" onClick={handleDownloadPDF}>
                            <FileDown className="h-4 w-4" />
                            <span className="hidden sm:inline">Download</span>
                        </Button>
                        <AddEmployeeDialog 
                            positions={positions}
                            grades={grades}
                            branches={branches}
                            workSchedules={workSchedules}
                            onAddEmployee={handleAddEmployee}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    {error ? (
                        <div className="text-center py-8 text-red-500">{error}</div>
                    ) : (
                        <EmployeeTable 
                            employees={employees}
                            positions={positions}
                            grades={grades}
                            branches={branches}
                            onUpdateEmployee={handleUpdateEmployee}
                            onDeleteEmployee={handleDeleteEmployee}
                            onInactivateEmployee={handleInactivateEmployee}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

