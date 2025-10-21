'use client'

import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2, Eye, Briefcase, Building, FileBadge, Star, CalendarDays, FileText, Users, CalendarIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Employee } from '@/app/(dashboard)/employees/page';
import { format } from 'date-fns';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

// Komponen helper untuk menampilkan detail
const DetailRow = ({ label, value, icon: Icon }: { label: string, value: string | React.ReactNode, icon: React.ElementType }) => (
    <div className="flex items-start justify-between py-2 border-b">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon className="h-4 w-4" />
            <span>{label}</span>
        </div>
        <span className="font-medium text-sm text-right">{value}</span>
    </div>
);

// Komponen View Details Sheet (DIPERBARUI TOTAL)
const ViewEmployeeSheet = ({ employee, children }: { employee: Employee, children: React.ReactNode }) => {
    return (
        <Sheet>
            <SheetTrigger asChild>
                {children}
            </SheetTrigger>
            <SheetContent className="w-[600px] sm:w-[540px] flex flex-col">
                <SheetHeader>
                    <SheetTitle>Employee Details</SheetTitle>
                    <SheetDescription>Complete information for {employee.name}.</SheetDescription>
                </SheetHeader>
                <div className="space-y-6 py-6 overflow-y-auto pr-4 flex-1 pl-4">
                    <div className="flex flex-col items-center gap-4 p-4 border rounded-lg">
                        <Avatar className="h-24 w-24">
                           <AvatarImage src={`https://i.pravatar.cc/100?u=${employee.id}`} alt={employee.name} />
                           <AvatarFallback>{employee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold text-xl text-center">{employee.name}</p>
                            <p className="text-sm text-gray-500 text-center">{employee.position}</p>
                        </div>
                    </div>
                    {/* Informasi Pribadi */}
                    <div className="space-y-2">
                        <h4 className="font-semibold">Personal Information</h4>
                        <DetailRow label="NIK" value={employee.nik || 'N/A'} icon={FileBadge} />
                        <DetailRow label="Phone" value={employee.phone} icon={MoreHorizontal} />
                        <DetailRow label="Gender" value={employee.gender} icon={Users} />
                        <DetailRow label="Tempat Lahir" value={employee.birthPlace || 'N/A'} icon={MoreHorizontal} />
                        <DetailRow label="Tanggal Lahir" value={employee.birthDate ? format(employee.birthDate, "PPP") : 'N/A'} icon={CalendarDays} />
                        <DetailRow label="Pendidikan Terakhir" value={employee.education || 'N/A'} icon={FileBadge} />
                    </div>
                     {/* Informasi Pekerjaan */}
                     <div className="space-y-2">
                        <h4 className="font-semibold">Work Information</h4>
                         <DetailRow label="Jabatan" value={employee.position} icon={Briefcase} />
                         <DetailRow label="Cabang" value={employee.branch} icon={Building} />
                         <DetailRow label="Tipe Kontrak" value={employee.contractType || 'N/A'} icon={FileText} />
                         <DetailRow label="Grade" value={employee.grade || 'N/A'} icon={Star} />
                         <DetailRow label="Date Hired" value={employee.dateHired ? format(employee.dateHired, "PPP") : 'N/A'} icon={CalendarDays} />
                         <DetailRow label="Status" value={<Badge variant={employee.status === "Active" ? "default" : "outline"} className={employee.status === "Active" ? "bg-green-500" : ""}>{employee.status}</Badge>} icon={MoreHorizontal} />
                    </div>
                     {/* Informasi Bank */}
                      <div className="space-y-2">
                        <h4 className="font-semibold">Bank Information</h4>
                         <DetailRow label="Bank" value={employee.bank || 'N/A'} icon={MoreHorizontal} />
                         <DetailRow label="Nomor Rekening" value={employee.accountNumber || 'N/A'} icon={MoreHorizontal} />
                         <DetailRow label="Atas Nama" value={employee.accountHolder || 'N/A'} icon={MoreHorizontal} />
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}

// Komponen Edit Dialog (tidak berubah)
function DatePicker({ date, onDateChange }: { date: Date | undefined, onDateChange: (date: Date | undefined) => void }) {
  return ( <Popover><PopoverTrigger asChild><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal",!date && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{date ? format(date, "dd/MM/yyyy") : <span>dd/mm/yyyy</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={date} onSelect={onDateChange} initialFocus /></PopoverContent></Popover> )
}


const EditEmployeeDialog = ({ employee, onUpdateEmployee, children }: { employee: Employee, onUpdateEmployee: (emp: Employee) => void, children: React.ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState<Employee>(employee);
    const [birthDate, setBirthDate] = useState<Date | undefined>(employee.birthDate);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({...prev, [e.target.id]: e.target.value}));
    };
    const handleSelectChange = (id: keyof Employee, value: string) => {
        setFormData(prev => ({...prev, [id]: value}));
    };
    const handleSubmit = () => {
        onUpdateEmployee({...formData, birthDate});
        setIsOpen(false);
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <div onClick={() => setIsOpen(true)}>{children}</div>
            <DialogContent className="max-w-4xl">
                <DialogHeader><DialogTitle>Edit Employee: {employee.name}</DialogTitle></DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 py-4 max-h-[80vh] overflow-y-auto pr-6">
                    {/* Kolom Kiri */}
                    <div className="space-y-4">
                        <div className="flex flex-col items-center gap-4"><div className="w-24 h-24 rounded-lg bg-slate-200 flex items-center justify-center text-slate-400"><span className="text-sm">Avatar</span></div><Button variant="outline" size="sm">Upload Avatar</Button></div>
                        <div className="space-y-2"><Label htmlFor="name">First Name</Label><Input id="name" value={formData.name} onChange={handleInputChange} /></div>
                        <div className="space-y-2"><Label htmlFor="mobileNumber">Mobile Number</Label><Input id="mobileNumber" value={formData.mobileNumber} onChange={handleInputChange} /></div>
                        <div className="space-y-2"><Label>Gender</Label><Select value={formData.gender} onValueChange={(v) => handleSelectChange('gender', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Laki - Laki">Laki - Laki</SelectItem><SelectItem value="Perempuan">Perempuan</SelectItem></SelectContent></Select></div>
                        <div className="space-y-2"><Label htmlFor="birthPlace">Tempat Lahir</Label><Input id="birthPlace" value={formData.birthPlace} onChange={handleInputChange} /></div>
                        <div className="space-y-2"><Label>Jabatan</Label><Select value={formData.position} onValueChange={(v) => handleSelectChange('position', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Software Engineer">Software Engineer</SelectItem><SelectItem value="UI/UX Designer">UI/UX Designer</SelectItem><SelectItem value="Manager">Manager</SelectItem></SelectContent></Select></div>
                        <div className="space-y-2"><Label>Tipe Kontrak</Label><RadioGroup value={formData.contractType} onValueChange={(v) => handleSelectChange('contractType', v)} className="flex items-center gap-4"><div className="flex items-center space-x-2"><RadioGroupItem value="Tetap" id="edit-tetap" /><Label htmlFor="edit-tetap">Tetap</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="Kontrak" id="edit-kontrak" /><Label htmlFor="edit-kontrak">Kontrak</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="Lepas" id="edit-lepas" /><Label htmlFor="edit-lepas">Lepas</Label></div></RadioGroup></div>
                        <div className="space-y-2"><Label>Bank</Label><Select value={formData.bank} onValueChange={(v) => handleSelectChange('bank', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="bca">BCA</SelectItem><SelectItem value="mandiri">Mandiri</SelectItem></SelectContent></Select></div>
                        <div className="space-y-2"><Label htmlFor="accountHolder">Atas Nama Rekening</Label><Input id="accountHolder" value={formData.accountHolder} onChange={handleInputChange} /></div>
                    </div>
                    {/* Kolom Kanan */}
                     <div className="space-y-4 mt-auto"><div className="space-y-2"><Label htmlFor="lastName">Last Name</Label><Input id="lastName" value={formData.lastName} onChange={handleInputChange} /></div><div className="space-y-2"><Label htmlFor="nik">NIK</Label><Input id="nik" value={formData.nik} onChange={handleInputChange} /></div><div className="space-y-2"><Label>Pendidikan Terakhir</Label><Select value={formData.education} onValueChange={(v) => handleSelectChange('education', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="SMA/SMK">SMA/SMK</SelectItem><SelectItem value="D3">D3</SelectItem><SelectItem value="S1">S1</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label>Tanggal Lahir</Label><DatePicker date={birthDate} onDateChange={setBirthDate} /></div><div className="space-y-2"><Label>Cabang</Label><Select value={formData.branch} onValueChange={(v) => handleSelectChange('branch', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Jakarta">Jakarta</SelectItem><SelectItem value="Bandung">Bandung</SelectItem><SelectItem value="Surabaya">Surabaya</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label>Grade</Label><Select value={formData.grade} onValueChange={(v) => handleSelectChange('grade', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Junior">Junior</SelectItem><SelectItem value="Senior">Senior</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label htmlFor="accountNumber">Nomor Rekening</Label><Input id="accountNumber" value={formData.accountNumber} onChange={handleInputChange} /></div><div className="space-y-2"><Label>Tipe SP</Label><Select value={formData.spType} onValueChange={(v) => handleSelectChange('spType', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="SP1">SP 1</SelectItem><SelectItem value="SP2">SP 2</SelectItem></SelectContent></Select></div></div>
                </div>
                <DialogFooter className="mt-4"><Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button><Button onClick={handleSubmit}>Save Changes</Button></DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// Komponen utama
export default function EmployeeTable({ employees, onUpdateEmployee, onDeleteEmployee }: { employees: Employee[], onUpdateEmployee: (emp: Employee) => void, onDeleteEmployee: (id: number) => void }) {
    return (
        <div>
            <div className="rounded-md border">
                <Table>
                    {/* --- PERUBAHAN HEADER TABEL --- */}
                    <TableHeader className="bg-slate-100 dark:bg-slate-800">
                        <TableRow>
                            <TableHead className="w-[50px]">No</TableHead>
                            <TableHead>Nama</TableHead>
                            <TableHead>Jabatan</TableHead>
                            <TableHead>Tipe Kontrak</TableHead>
                            <TableHead>Cabang</TableHead>
                            <TableHead>Grade</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-center">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {employees.map((employee, index) => (
                            <TableRow key={employee.id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell className="font-medium flex items-center gap-3">
                                    <Avatar><AvatarImage src={`https://i.pravatar.cc/40?u=${employee.id}`} alt={employee.name} /><AvatarFallback>{employee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
                                    {employee.name}
                                </TableCell>
                                <TableCell>{employee.position}</TableCell>
                                {/* --- PENAMBAHAN KOLOM BARU --- */}
                                <TableCell>{employee.contractType || '-'}</TableCell>
                                <TableCell>{employee.branch}</TableCell>
                                <TableCell>{employee.grade || '-'}</TableCell>
                                <TableCell><Badge variant={employee.status === "Active" ? "default" : "outline"} className={employee.status === "Active" ? "bg-green-500" : ""}>{employee.status}</Badge></TableCell>
                                <TableCell className="text-center">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Open menu</span><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            {/* Panggil ViewEmployeeSheet di sini */}
                                            <ViewEmployeeSheet employee={employee}>
                                                <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent focus:bg-accent focus:text-accent-foreground">
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    <span>View Details</span>
                                                </div>
                                            </ViewEmployeeSheet>
                                            <EditEmployeeDialog employee={employee} onUpdateEmployee={onUpdateEmployee}>
                                                <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent focus:bg-accent focus:text-accent-foreground">
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    <span>Edit</span>
                                                </div>
                                            </EditEmployeeDialog>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm text-red-500 outline-none transition-colors hover:bg-accent focus:bg-accent focus:text-accent-foreground">
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        <span>Delete</span>
                                                    </div>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. This will permanently delete this employee.</AlertDialogDescription></AlertDialogHeader>
                                                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => onDeleteEmployee(employee.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">Showing 1 to {employees.length} of {employees.length} results</div>
                <Pagination>
                    <PaginationContent>
                        <PaginationItem><PaginationPrevious href="#" /></PaginationItem>
                        <PaginationItem><PaginationLink href="#" isActive>1</PaginationLink></PaginationItem>
                        <PaginationItem><PaginationNext href="#" /></PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </div>
    );
}

