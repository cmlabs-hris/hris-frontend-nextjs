'use client';

import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2, Eye, Briefcase, Building, FileBadge, Star, CalendarDays, FileText, Users, CalendarIcon, Mail, Phone, MapPin, GraduationCap, CreditCard, UserX } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from 'date-fns';
import { 
    EmployeeWithDetails, 
    UpdateEmployeeRequest,
    Position,
    Grade,
    Branch,
    getUploadUrl
} from '@/lib/api';

// Props types
interface EmployeeTableProps {
    employees: EmployeeWithDetails[];
    positions: Position[];
    grades: Grade[];
    branches: Branch[];
    onUpdateEmployee: (id: string, data: UpdateEmployeeRequest) => Promise<void>;
    onDeleteEmployee: (id: string) => Promise<void>;
    onInactivateEmployee?: (id: string, resignationDate: string) => Promise<void>;
}

// Detail Row Component
const DetailRow = ({ label, value, icon: Icon }: { label: string; value: string | React.ReactNode; icon: React.ElementType }) => (
    <div className="flex items-start justify-between py-2 border-b last:border-b-0">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon className="h-4 w-4" />
            <span>{label}</span>
        </div>
        <span className="font-medium text-sm text-right max-w-[200px] truncate">{value || '-'}</span>
    </div>
);

// View Employee Sheet
const ViewEmployeeSheet = ({ employee, children }: { employee: EmployeeWithDetails; children: React.ReactNode }) => {
    return (
        <Sheet>
            <SheetTrigger asChild>{children}</SheetTrigger>
            <SheetContent className="w-[500px] sm:w-[540px] flex flex-col">
                <SheetHeader>
                    <SheetTitle>Employee Details</SheetTitle>
                    <SheetDescription>Complete information for {employee.full_name}</SheetDescription>
                </SheetHeader>
                <div className="space-y-6 py-6 overflow-y-auto pr-4 flex-1">
                    {/* Profile Header */}
                    <div className="flex flex-col items-center gap-4 p-4 border rounded-lg bg-slate-50">
                        <Avatar className="h-24 w-24">
                            <AvatarImage src={getUploadUrl(employee.avatar_url)} alt={employee.full_name} />
                            <AvatarFallback className="text-2xl">
                                {employee.full_name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="text-center">
                            <p className="font-semibold text-xl">{employee.full_name}</p>
                            <p className="text-sm text-gray-500">{employee.position_name || 'No Position'}</p>
                            <Badge variant={employee.employment_status === 'active' ? 'default' : 'secondary'} className="mt-2">
                                {employee.employment_status}
                            </Badge>
                        </div>
                    </div>

                    {/* Personal Information */}
                    <div className="space-y-2">
                        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Personal Information</h4>
                        <div className="border rounded-lg p-3">
                            <DetailRow label="Email" value={employee.email} icon={FileBadge} />
                            <DetailRow label="Employee Code" value={employee.employee_code} icon={FileBadge} />
                            <DetailRow label="NIK" value={employee.nik} icon={FileBadge} />
                            <DetailRow label="Gender" value={employee.gender} icon={Users} />
                            <DetailRow label="Phone" value={employee.phone_number} icon={Phone} />
                            <DetailRow label="Place of Birth" value={employee.place_of_birth} icon={MapPin} />
                            <DetailRow label="Date of Birth" value={employee.dob ? format(new Date(employee.dob), 'PPP') : '-'} icon={CalendarDays} />
                            <DetailRow label="Education" value={employee.education} icon={GraduationCap} />
                            <DetailRow label="Address" value={employee.address} icon={MapPin} />
                        </div>
                    </div>

                    {/* Work Information */}
                    <div className="space-y-2">
                        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Work Information</h4>
                        <div className="border rounded-lg p-3">
                            <DetailRow label="Position" value={employee.position_name} icon={Briefcase} />
                            <DetailRow label="Branch" value={employee.branch_name} icon={Building} />
                            <DetailRow label="Grade" value={employee.grade_name} icon={Star} />
                            <DetailRow label="Work Schedule" value={employee.work_schedule_name} icon={CalendarDays} />
                            <DetailRow label="Employment Type" value={employee.employment_type} icon={FileText} />
                            <DetailRow label="Hire Date" value={employee.hire_date ? format(new Date(employee.hire_date), 'PPP') : '-'} icon={CalendarDays} />
                            <DetailRow label="Warning Letter" value={employee.warning_letter} icon={FileText} />
                        </div>
                    </div>

                    {/* Bank Information */}
                    <div className="space-y-2">
                        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Bank Information</h4>
                        <div className="border rounded-lg p-3">
                            <DetailRow label="Bank Name" value={employee.bank_name} icon={CreditCard} />
                            <DetailRow label="Account Number" value={employee.bank_account_number} icon={CreditCard} />
                            <DetailRow label="Account Holder" value={employee.bank_account_holder_name} icon={Users} />
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
};

// Date Picker Component
function DatePicker({ date, onDateChange }: { date: Date | undefined; onDateChange: (date: Date | undefined) => void }) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "dd/MM/yyyy") : <span>Select date</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={date} onSelect={onDateChange} initialFocus />
            </PopoverContent>
        </Popover>
    );
}

// Edit Employee Dialog
interface EditEmployeeDialogProps {
    employee: EmployeeWithDetails;
    positions: Position[];
    grades: Grade[];
    branches: Branch[];
    onUpdate: (id: string, data: UpdateEmployeeRequest) => Promise<void>;
    children: React.ReactNode;
}

const EditEmployeeDialog = ({ employee, positions, grades, branches, onUpdate, children }: EditEmployeeDialogProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<UpdateEmployeeRequest>({
        full_name: employee.full_name,
        employee_code: employee.employee_code,
        nik: employee.nik,
        gender: employee.gender,
        phone_number: employee.phone_number,
        address: employee.address,
        place_of_birth: employee.place_of_birth,
        dob: employee.dob,
        education: employee.education,
        position_id: employee.position_id,
        grade_id: employee.grade_id,
        branch_id: employee.branch_id,
        employment_type: employee.employment_type,
        bank_name: employee.bank_name,
        bank_account_number: employee.bank_account_number,
        bank_account_holder_name: employee.bank_account_holder_name,
    });
    const [dob, setDob] = useState<Date | undefined>(employee.dob ? new Date(employee.dob) : undefined);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
    };

    const handleSelectChange = (key: keyof UpdateEmployeeRequest, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            await onUpdate(employee.id, {
                ...formData,
                dob: dob?.toISOString().split('T')[0],
            });
            setIsOpen(false);
        } catch (err) {
            // Error handled by parent
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <div onClick={() => setIsOpen(true)}>{children}</div>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Employee: {employee.full_name}</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 py-4">
                    {/* Left Column */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="full_name">Full Name</Label>
                            <Input id="full_name" value={formData.full_name || ''} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="employee_code">Employee Code</Label>
                            <Input id="employee_code" value={formData.employee_code || ''} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="nik">NIK</Label>
                            <Input id="nik" value={formData.nik || ''} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                            <Label>Gender</Label>
                            <Select value={formData.gender} onValueChange={(v) => handleSelectChange('gender', v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Male">Male</SelectItem>
                                    <SelectItem value="Female">Female</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone_number">Phone Number</Label>
                            <Input id="phone_number" value={formData.phone_number || ''} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="place_of_birth">Place of Birth</Label>
                            <Input id="place_of_birth" value={formData.place_of_birth || ''} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                            <Label>Date of Birth</Label>
                            <DatePicker date={dob} onDateChange={setDob} />
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Position</Label>
                            <Select value={formData.position_id} onValueChange={(v) => handleSelectChange('position_id', v)}>
                                <SelectTrigger><SelectValue placeholder="Select position" /></SelectTrigger>
                                <SelectContent>
                                    {positions.map(pos => (
                                        <SelectItem key={pos.id} value={pos.id}>{pos.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Branch</Label>
                            <Select value={formData.branch_id || ''} onValueChange={(v) => handleSelectChange('branch_id', v)}>
                                <SelectTrigger><SelectValue placeholder="Select branch" /></SelectTrigger>
                                <SelectContent>
                                    {branches.map(branch => (
                                        <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Grade</Label>
                            <Select value={formData.grade_id || ''} onValueChange={(v) => handleSelectChange('grade_id', v)}>
                                <SelectTrigger><SelectValue placeholder="Select grade" /></SelectTrigger>
                                <SelectContent>
                                    {grades.map(grade => (
                                        <SelectItem key={grade.id} value={grade.id}>{grade.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Employment Type</Label>
                            <Select value={formData.employment_type || ''} onValueChange={(v) => handleSelectChange('employment_type', v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="permanent">Permanent</SelectItem>
                                    <SelectItem value="contract">Contract</SelectItem>
                                    <SelectItem value="probation">Probation</SelectItem>
                                    <SelectItem value="internship">Internship</SelectItem>
                                    <SelectItem value="freelance">Freelance</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bank_name">Bank Name</Label>
                            <Input id="bank_name" value={formData.bank_name || ''} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bank_account_number">Account Number</Label>
                            <Input id="bank_account_number" value={formData.bank_account_number || ''} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bank_account_holder_name">Account Holder Name</Label>
                            <Input id="bank_account_holder_name" value={formData.bank_account_holder_name || ''} onChange={handleInputChange} />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

// Main Component
export default function EmployeeTable({ employees, positions, grades, branches, onUpdateEmployee, onDeleteEmployee, onInactivateEmployee }: EmployeeTableProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [inactivateEmployee, setInactivateEmployee] = useState<EmployeeWithDetails | null>(null);
    const [resignationDate, setResignationDate] = useState<Date | undefined>(undefined);
    const [isInactivating, setIsInactivating] = useState(false);
    const itemsPerPage = 10;

    // Ensure employees is always an array
    const employeeList = Array.isArray(employees) ? employees : [];

    // Pagination
    const totalPages = Math.ceil(employeeList.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedEmployees = employeeList.slice(startIndex, startIndex + itemsPerPage);

    const handleDelete = async () => {
        if (!deleteId) return;
        setIsDeleting(true);
        try {
            await onDeleteEmployee(deleteId);
        } finally {
            setIsDeleting(false);
            setDeleteId(null);
        }
    };

    const handleInactivate = async () => {
        if (!inactivateEmployee || !resignationDate || !onInactivateEmployee) return;
        setIsInactivating(true);
        try {
            await onInactivateEmployee(inactivateEmployee.id, format(resignationDate, 'yyyy-MM-dd'));
            setInactivateEmployee(null);
            setResignationDate(undefined);
        } finally {
            setIsInactivating(false);
        }
    };

    if (employeeList.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No employees found</p>
                <p className="text-sm">Add your first employee to get started</p>
            </div>
        );
    }

    return (
        <div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader className="bg-slate-100 dark:bg-slate-800">
                        <TableRow>
                            <TableHead className="w-[50px]">No</TableHead>
                            <TableHead>Employee</TableHead>
                            <TableHead>Position</TableHead>
                            <TableHead>Branch</TableHead>
                            <TableHead>Employment Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedEmployees.map((employee, index) => (
                            <TableRow key={employee.id}>
                                <TableCell className="font-medium">{startIndex + index + 1}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={getUploadUrl(employee.avatar_url)} alt={employee.full_name} />
                                            <AvatarFallback>
                                                {employee.full_name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">{employee.full_name}</p>
                                            <p className="text-xs text-muted-foreground">{employee.employee_code}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>{employee.position_name || '-'}</TableCell>
                                <TableCell>{employee.branch_name || '-'}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="capitalize">
                                        {employee.employment_type}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge 
                                        variant={employee.employment_status === 'active' ? 'default' : 'secondary'}
                                        className={employee.employment_status === 'active' ? 'bg-green-500' : ''}
                                    >
                                        {employee.employment_status}
                                    </Badge>
                                    {employee.invitation_status && employee.invitation_status !== 'accepted' && (
                                        <Badge variant="outline" className="ml-1 text-xs">
                                            {employee.invitation_status}
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <ViewEmployeeSheet employee={employee}>
                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                    <Eye className="mr-2 h-4 w-4" /> View Details
                                                </DropdownMenuItem>
                                            </ViewEmployeeSheet>
                                            <EditEmployeeDialog 
                                                employee={employee}
                                                positions={positions}
                                                grades={grades}
                                                branches={branches}
                                                onUpdate={onUpdateEmployee}
                                            >
                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                                </DropdownMenuItem>
                                            </EditEmployeeDialog>
                                            {employee.employment_status === 'active' && onInactivateEmployee && (
                                                <DropdownMenuItem 
                                                    className="text-orange-600"
                                                    onSelect={() => setInactivateEmployee(employee)}
                                                >
                                                    <UserX className="mr-2 h-4 w-4" /> Deactivate
                                                </DropdownMenuItem>
                                            )}
                                            <DropdownMenuItem 
                                                className="text-red-600"
                                                onSelect={() => setDeleteId(employee.id)}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-4">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious 
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                />
                            </PaginationItem>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <PaginationItem key={page}>
                                    <PaginationLink
                                        onClick={() => setCurrentPage(page)}
                                        isActive={currentPage === page}
                                        className="cursor-pointer"
                                    >
                                        {page}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                            <PaginationItem>
                                <PaginationNext 
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the employee record.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Inactivate Employee Dialog */}
            <Dialog open={!!inactivateEmployee} onOpenChange={(open) => { if (!open) { setInactivateEmployee(null); setResignationDate(undefined); } }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Deactivate Employee</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-sm text-muted-foreground mb-4">
                            Are you sure you want to deactivate <span className="font-semibold">{inactivateEmployee?.full_name}</span>? 
                            This will mark them as inactive and set their resignation date.
                        </p>
                        <div className="grid gap-2">
                            <Label htmlFor="resignation-date">Resignation Date *</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !resignationDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {resignationDate ? format(resignationDate, "PPP") : "Select date"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={resignationDate}
                                        onSelect={setResignationDate}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setInactivateEmployee(null); setResignationDate(undefined); }}>
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleInactivate} 
                            disabled={isInactivating || !resignationDate}
                            className="bg-orange-600 hover:bg-orange-700"
                        >
                            {isInactivating ? 'Deactivating...' : 'Deactivate'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

