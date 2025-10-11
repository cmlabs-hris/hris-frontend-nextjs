'use client'

import * as React from "react"
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

// --- Komponen Date Picker Kustom ---
function DatePicker() {
  const [date, setDate] = React.useState<Date>()

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
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}


export default function AddEmployeeDialog() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button size="sm" className="gap-1">
                    <PlusCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">Add Employee</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Add New Employee</DialogTitle>
                    <DialogDescription>Fill in the form below to add a new employee.</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 max-h-[70vh] overflow-y-auto pr-6">
                    {/* Kolom Kiri */}
                    <div className="space-y-4">
                        <div className="flex flex-col items-center gap-4">
                             <div className="w-24 h-24 rounded-lg bg-slate-200" />
                             <Button variant="outline" size="sm">Upload Avatar</Button>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="company-name">Company Name</Label>
                            <Input id="company-name" placeholder="Enter your first company" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="mobile-number">Mobile Number</Label>
                            <Input id="mobile-number" placeholder="Enter your first Mobile Number" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="gender">Gender</Label>
                             <Select>
                                <SelectTrigger><SelectValue placeholder="--Choose Gender--" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="male">Laki - Laki</SelectItem>
                                    <SelectItem value="female">Perempuan</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="birth-place">Tempat Lahir</Label>
                            <Input id="birth-place" placeholder="Masukan tempat Lahir" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="position">Jabatan</Label>
                            <Input id="position" placeholder="Enter your jabatan" />
                        </div>
                         <div className="space-y-2">
                            <Label>Tipe Kontak</Label>
                            <RadioGroup defaultValue="tetap" className="flex items-center gap-4">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="tetap" id="tetap" />
                                    <Label htmlFor="tetap">Tetap</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="kontrak" id="kontrak" />
                                    <Label htmlFor="kontrak">Kontrak</Label>
                                </div>
                            </RadioGroup>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="bank">Bank</Label>
                            <Input id="bank" placeholder="Enter the bank" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="account-holder">Atas Nama Rekening</Label>
                            <Input id="account-holder" placeholder="Enter the account holder name" />
                        </div>
                    </div>
                    {/* Kolom Kanan */}
                     <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="company-username">Company Username</Label>
                            <Input id="company-username" placeholder="Enter your Company Username" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="nik">NIK</Label>
                            <Input id="nik" placeholder="Enter the NIK" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="education">Pendidikan Terakhir</Label>
                             <Select>
                                <SelectTrigger><SelectValue placeholder="--Pilih Pendidikan Terakhir--" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="sma">SMA/SMK</SelectItem>
                                    <SelectItem value="d3">D3</SelectItem>
                                    <SelectItem value="s1">S1</SelectItem>
                                    <SelectItem value="s2">S2</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="birth-date">Tanggal Lahir</Label>
                            {/* Mengganti Input dengan DatePicker */}
                            <DatePicker />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="branch">Cabang</Label>
                            <Input id="branch" placeholder="Enter the cabang" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="grade">Grade</Label>
                            <Input id="grade" placeholder="Masukan Grade" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="account-number">Nomor Rekening</Label>
                            <Input id="account-number" placeholder="Masukan Nomor Rekening" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sp-type">Tipe SP</Label>
                             <Select>
                                <SelectTrigger><SelectValue placeholder="--Pilih SP--" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="sp1">SP 1</SelectItem>
                                    <SelectItem value="sp2">SP 2</SelectItem>
                                    <SelectItem value="sp3">SP 3</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline">Reject</Button>
                    <Button>Approve</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

