'use client'

import React, { useState } from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, PlusCircle } from "lucide-react"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Employee } from "@/app/(dashboard)/employees/page";
import { format as formatDate } from "date-fns";

// --- Komponen Date Picker Kustom (DIPERBARUI) ---
function DatePicker({ date, onDateChange }: { date: Date | undefined, onDateChange: (date: Date | undefined) => void }) {
 return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "dd/MM/yyyy") : <span>dd/mm/yyyy</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onDateChange}
          // --- PENAMBAHAN PROPERTI BARU DI SINI ---
          captionLayout="dropdown"
          fromYear={1960}
          toYear={2030}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}


export default function AddEmployeeDialog({ onAddEmployee }: { onAddEmployee: (employee: Omit<Employee, 'id'>) => void }) {
    const [isOpen, setIsOpen] = useState(false);
    
    // State untuk semua field di form
    const [formData, setFormData] = useState<Partial<Omit<Employee, 'id'>>>({
        contractType: 'Tetap'
    });
    // State terpisah untuk tanggal lahir
    const [birthDate, setBirthDate] = useState<Date | undefined>();
    // State terpisah untuk tanggal masuk kerja
    const [dateHired, setDateHired] = useState<Date | undefined>();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSelectChange = (id: keyof Omit<Employee, 'id'>, value: string) => {
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = () => {
        // Validasi sederhana
        if (!formData.name || !formData.lastName) {
            alert("First Name and Last Name are required.");
            return;
        }

        const newEmployeeData: Omit<Employee, 'id'> = {
            name: `${formData.name} ${formData.lastName}`.trim(),
            lastName: formData.lastName ?? '',
            gender: formData.gender ?? 'Laki - Laki',
            position: formData.position ?? 'N/A',
            phone: formData.mobileNumber ?? 'N/A',
            branch: formData.branch ?? 'N/A',
            status: 'Active',
            contractType: formData.contractType ?? 'Tetap',
            birthDate: birthDate ?? new Date(),
            dateHired: formData.dateHired ?? new Date(),
            nik: formData.nik ?? '',
            education: formData.education ?? '',
            birthPlace: formData.birthPlace ?? '',
            bank: formData.bank ?? '',
            accountHolder: formData.accountHolder ?? '',
            accountNumber: formData.accountNumber ?? '',
            grade: formData.grade ?? '',
            spType: formData.spType ?? '',
        };

        onAddEmployee(newEmployeeData);

        // Reset form dan tutup dialog
        setFormData({ contractType: 'Tetap' });
        setBirthDate(undefined);
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="gap-1">
                    <PlusCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">Add Employee</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Add New Employee</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 py-4 max-h-[80vh] overflow-y-auto pr-6">
                    {/* Kolom Kiri */}
                    <div className="space-y-4">
                        <div className="flex flex-col items-center gap-4">
                             <div className="w-24 h-24 rounded-lg bg-slate-200 flex items-center justify-center text-slate-400">
                                <span className="text-sm">Avatar</span>
                             </div>
                             <Button variant="outline" size="sm">Upload Avatar</Button>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="name">First Name</Label>
                            <Input id="name" onChange={handleInputChange} placeholder="Enter the first name" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="mobileNumber">Mobile Number</Label>
                            <Input id="mobileNumber" onChange={handleInputChange} placeholder="Enter the Mobile Number" />
                        </div>
                         <div className="space-y-2">
                            <Label>Gender</Label>
                             <Select onValueChange={(v) => handleSelectChange('gender', v)}>
                                <SelectTrigger><SelectValue placeholder="-Choose Gender-" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Laki - Laki">Laki - Laki</SelectItem>
                                    <SelectItem value="Perempuan">Perempuan</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="birthPlace">Tempat Lahir</Label>
                            <Input id="birthPlace" onChange={handleInputChange} placeholder="Masukan Tempat Lahir" />
                        </div>
                         <div className="space-y-2">
                            <Label>Jabatan</Label>
                            <Select onValueChange={(v) => handleSelectChange('position', v)}>
                                <SelectTrigger><SelectValue placeholder="Enter your jabatan" /></SelectTrigger>
                                <SelectContent>
                                     <SelectItem value="Software Engineer">Software Engineer</SelectItem>
                                     <SelectItem value="UI/UX Designer">UI/UX Designer</SelectItem>
                                     <SelectItem value="Manager">Manager</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Tipe Kontrak</Label>
                             <RadioGroup defaultValue="Tetap" onValueChange={(v) => handleSelectChange('contractType', v)} className="flex items-center gap-4">
                                <div className="flex items-center space-x-2"><RadioGroupItem value="Tetap" id="tetap" /><Label htmlFor="tetap">Tetap</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="Kontrak" id="kontrak" /><Label htmlFor="kontrak">Kontrak</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="Lepas" id="lepas" /><Label htmlFor="lepas">Lepas</Label></div>
                            </RadioGroup>
                        </div>
                        <div className="space-y-2">
                             <Label>Bank</Label>
                            <Select onValueChange={(v) => handleSelectChange('bank', v)}><SelectTrigger><SelectValue placeholder="-Pilih Bank-" /></SelectTrigger><SelectContent><SelectItem value="bca">BCA</SelectItem><SelectItem value="mandiri">Mandiri</SelectItem></SelectContent></Select>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="accountHolder">Atas Nama Rekening</Label>
                            <Input id="accountHolder" onChange={handleInputChange} placeholder="Masukan A/N Rekening" />
                        </div>
                    </div>
                    {/* Kolom Kanan */}
                     <div className="space-y-4 mt-auto">
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input id="lastName" onChange={handleInputChange} placeholder="Enter the last name" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="nik">NIK</Label>
                            <Input id="nik" onChange={handleInputChange} placeholder="Enter the NIK" />
                        </div>
                        <div className="space-y-2">
                            <Label>Pendidikan Terakhir</Label>
                             <Select onValueChange={(v) => handleSelectChange('education', v)}>
                                <SelectTrigger><SelectValue placeholder="-Pilih Pendidikan Terakhir-" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SMA/SMK">SMA/SMK</SelectItem>
                                    <SelectItem value="D3">D3</SelectItem>
                                    <SelectItem value="S1">S1</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Tanggal Lahir</Label>
                            <DatePicker date={birthDate} onDateChange={setBirthDate} />
                        </div>
                         <div className="space-y-2">
                            <Label>Cabang</Label>
                            <Select onValueChange={(v) => handleSelectChange('branch', v)}>
                                <SelectTrigger><SelectValue placeholder="Enter the cabang" /></SelectTrigger>
                                <SelectContent>
                                     <SelectItem value="Jakarta">Jakarta</SelectItem>
                                     <SelectItem value="Bandung">Bandung</SelectItem>
                                     <SelectItem value="Surabaya">Surabaya</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-2">
                            <Label>Grade</Label>
                            <Select onValueChange={(v) => handleSelectChange('grade', v)}>
                                <SelectTrigger><SelectValue placeholder="Masukan Grade Anda" /></SelectTrigger>
                                <SelectContent>
                                     <SelectItem value="Junior">Junior</SelectItem>
                                     <SelectItem value="Senior">Senior</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="accountNumber">Nomor Rekening</Label>
                            <Input id="accountNumber" onChange={handleInputChange} placeholder="Masukan Nomor Rekening" />
                        </div>
                        <div className="space-y-2">
                            <Label>Tipe SP</Label>
                             <Select onValueChange={(v) => handleSelectChange('spType', v)}>
                                <SelectTrigger><SelectValue placeholder="-Pilih SP-" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SP1">None</SelectItem>
                                    <SelectItem value="SP1">SP 1</SelectItem>
                                    <SelectItem value="SP2">SP 2</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Date Hired</Label>
                            <DatePicker date={dateHired} onDateChange={setDateHired} />
                        </div>
                    </div>
                </div>
                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmit}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

