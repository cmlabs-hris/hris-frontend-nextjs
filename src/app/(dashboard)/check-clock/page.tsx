'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import CheckClockTable from "@/components/check-clock/CheckClockTable";

// Definisikan tipe data untuk absensi di sini agar bisa di-share
export interface AttendanceRecord {
    id: number;
    employeeName: string;
    jabatan: string;
    clockIn: string;
    clockOut: string;
    workHours: number;
    approve: string;
    status: "Waiting" | "OnTime" | "Late";
    statusApprove: "Waiting" | "Approved";
    date: Date;
}

// Data awal (fiktif)
const initialAttendanceData: AttendanceRecord[] = [
    { id: 1, employeeName: "Emily Davis", jabatan: "Developer", clockIn: "08:30", clockOut: "16:30", workHours: 8, approve: "Cabang Jakarta", status: "Waiting", statusApprove: "Waiting", date: new Date("2025-10-10") },
    { id: 2, employeeName: "Jane Doe", jabatan: "Designer", clockIn: "08:32", clockOut: "16:30", workHours: 8, approve: "Cabang Bandung", status: "OnTime", statusApprove: "Approved", date: new Date("2025-10-10") },
    { id: 3, employeeName: "Peter Jones", jabatan: "Manager", clockIn: "09:15", clockOut: "17:00", workHours: 8, approve: "Pusat", status: "Late", statusApprove: "Approved", date: new Date("2025-10-11") },
    { id: 4, employeeName: "Mary Jane", jabatan: "QA", clockIn: "08:25", clockOut: "16:30", workHours: 8, approve: "Cabang Jakarta", status: "Waiting", statusApprove: "Waiting", date: new Date("2025-10-11") },
    { id: 5, employeeName: "John Doe", jabatan: "Developer", clockIn: "08:50", clockOut: "16:30", workHours: 8, approve: "Cabang Jakarta", status: "Late", statusApprove: "Approved", date: new Date("2025-10-12") },
];


export default function CheckClockPage() {
    // 1. Pindahkan data ke dalam state
    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(initialAttendanceData);

    // 2. Buat fungsi-fungsi CRUD
    const handleAddRecord = (newRecordData: Omit<AttendanceRecord, 'id'>) => {
        const newRecord = {
            id: Date.now(), // ID unik sementara
            ...newRecordData,
        };
        setAttendanceRecords(prev => [newRecord, ...prev]);
    };

    const handleUpdateRecord = (updatedRecord: AttendanceRecord) => {
        setAttendanceRecords(prev => prev.map(rec => rec.id === updatedRecord.id ? updatedRecord : rec));
    };

    const handleDeleteRecord = (recordId: number) => {
        setAttendanceRecords(prev => prev.filter(rec => rec.id !== recordId));
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Check Clock Overview</CardTitle>
                <CardDescription>View and manage employee attendance records.</CardDescription>
            </CardHeader>
            <CardContent>
                {/* 3. Kirim data dan fungsi-fungsi CRUD ke komponen tabel */}
                <CheckClockTable
                    initialData={attendanceRecords}
                    onAddRecord={handleAddRecord}
                    onUpdateRecord={handleUpdateRecord}
                    onDeleteRecord={handleDeleteRecord}
                />
            </CardContent>
        </Card>
    );
}

