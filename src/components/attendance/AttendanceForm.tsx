'use client'

import React, { useState } from "react"
import { format } from "date-fns"
import dynamic from "next/dynamic"; 
import { Calendar as CalendarIcon, UploadCloud } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DateRange } from "react-day-picker"

// Impor peta secara dinamis untuk menghindari error SSR
const AttendanceMap = dynamic(() => import('./AttendanceMap'), { 
    ssr: false,
    loading: () => <div className="h-full w-full bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center"><p className="text-gray-500">Loading map...</p></div>
});

// Definisikan lokasi dan koordinatnya
const locations = {
    "kantor-pusat": { lat: -7.9766, lon: 112.631, address: "Kota Malang, Jawa Timur" },
    "cabang-jakarta": { lat: -6.2088, lon: 106.8456, address: "Jakarta Pusat, DKI Jakarta" },
};

export default function AttendanceForm() {
    const [date, setDate] = React.useState<DateRange | undefined>();
    const [selectedLocation, setSelectedLocation] = useState<keyof typeof locations>("kantor-pusat");

    const currentPosition: [number, number] = [locations[selectedLocation].lat, locations[selectedLocation].lon];
    const currentAddress = locations[selectedLocation].address;

    return (
        <form className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
            {/* Kolom Kiri */}
            <div className="space-y-6">
                <div className="space-y-2">
                    <Label>Tipe Absensi</Label>
                    <Select>
                        <SelectTrigger><SelectValue placeholder="Pilih Tipe Absensi" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="clock-in">Clock In</SelectItem>
                            <SelectItem value="clock-out">Clock Out</SelectItem>
                            <SelectItem value="annual">Annual Leave</SelectItem>
                            <SelectItem value="sick">Sick Leave</SelectItem>
                            <SelectItem value="permit">Permit</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label htmlFor="start-date">Start Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !date?.from && "text-muted-foreground")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date?.from ? format(date.from, "PPP") : <span>dd/mm/yyyy</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={date?.from} onSelect={(day) => setDate(prev => ({...prev, from: day}))} initialFocus/></PopoverContent>
                        </Popover>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="end-date">End Date</Label>
                         <Popover>
                            <PopoverTrigger asChild>
                                <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !date?.to && "text-muted-foreground")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date?.to ? format(date.to, "PPP") : <span>select time</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={date?.to} onSelect={(day) => setDate(prev => ({ from: prev?.from ?? undefined, to: day }))} initialFocus/></PopoverContent>
                        </Popover>
                    </div>
                </div>
                
                <div className="space-y-2">
                    <Label>Upload Bukti Pendukung</Label>
                    <div className="flex items-center justify-center w-full">
                        <Label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <UploadCloud className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
                                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Drag'n Drop here</span> or Browse</p>
                            </div>
                            <Input id="dropzone-file" type="file" className="hidden" />
                        </Label>
                    </div>
                    <Button variant="outline" className="w-full">Upload Now</Button>
                </div>

                <div className="space-y-2">
                    <Label>Lokasi</Label>
                    <Select value={selectedLocation} onValueChange={(value) => setSelectedLocation(value as keyof typeof locations)}>
                        <SelectTrigger><SelectValue placeholder="Pilih Lokasi" /></SelectTrigger>
                        <SelectContent className="z-50">
                            <SelectItem value="kantor-pusat">Kantor Pusat - Malang</SelectItem>
                            <SelectItem value="cabang-jakarta">Cabang Jakarta</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Kolom Kanan */}
            <div className="space-y-6">
                 

                {/* Placeholder dengan Peta Interaktif */}
                <div className="h-48 w-full rounded-lg overflow-hidden">
                    <AttendanceMap position={currentPosition} />
                </div>

                 <div className="space-y-2">
                    <Label>Detail Alamat</Label>
                    <Input placeholder="Detail Alamat" readOnly value={currentAddress} />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Lat</Label>
                        <Input placeholder="Lat Lokasi" readOnly value={currentPosition[0]} />
                    </div>
                    <div className="space-y-2">
                        <Label>Long</Label>
                        <Input placeholder="Long Lokasi" readOnly value={currentPosition[1]}/>
                    </div>
                </div>

                 <div className="flex justify-end gap-2 pt-8">
                    <Button variant="outline">Cancel</Button>
                    <Button>Save</Button>
                </div>
            </div>
        </form>
    );
}

