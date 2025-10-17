'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// --- Data Simulasi ---

const barChartData = [
  { name: 'New', value: 18 },
  { name: 'Active', value: 33 },
  { name: 'Resign', value: 10 },
];

const horizontalBarData = [
    { name: 'Magang', value: 37 },
    { name: 'PKWT (Kontrak)', value: 22 },
    { name: 'Tetap Percobaan', value: 26 },
    { name: 'Tetap Permanen', value: 17 },
];

const attendanceData = [
    { name: 'Ontime', value: 145, color: '#22c55e' }, 
    { name: 'Late', value: 23, color: '#f59e0b' },   
    { name: 'Sick', value: 8, color: '#ef4444' },   
];
const totalAttendance = attendanceData.reduce((acc, curr) => acc + curr.value, 0);
const ontimePercentage = Math.round((attendanceData.find(d => d.name === 'Ontime')?.value || 0) / totalAttendance * 100);


const recentAttendance = [
    { no: 1, nama: 'Angga', status: 'On Time', checkIn: '08:30' },
    { no: 2, nama: 'Resi', status: 'Sick', checkIn: '-' },
    { no: 3, nama: 'Imanuel', status: 'Late', checkIn: '09:05' },
    { no: 4, nama: 'Hafiz', status: 'On Time', checkIn: '08:30' },
    { no: 5, nama: 'Farrel', status: 'On Time', checkIn: '08:30' },
];


export default function AdminDashboard() {
    return (
        <div className="grid gap-6">
            {/* Employee Statistics Charts */}
            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Employee Statistics</CardTitle>
                        <CardDescription>Current Number of Employees</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={barChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                         <CardTitle>Employee Statistics</CardTitle>
                        <CardDescription>Current Number of Employees by Status</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                             <BarChart data={horizontalBarData} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false}/>
                                <XAxis type="number" />
                                <YAxis type="category" dataKey="name" width={100} tickLine={false} axisLine={false} />
                                <Tooltip />
                                <Bar dataKey="value" fill="#82ca9d" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
            {/* Attendance Statistics */}
             <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Statistics Attendance</CardTitle>
                    </CardHeader>
                    {/* --- PERUBAHAN TATA LETAK KEMBALI KE AWAL --- */}
                    <CardContent className="flex flex-col items-center justify-center gap-4 pt-4">
                        <div className="relative w-52 h-52">
                             <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={attendanceData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={65}
                                        outerRadius={85}
                                        paddingAngle={5}
                                        dataKey="value"
                                        cornerRadius={8}
                                    >
                                        {attendanceData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-4xl font-bold text-slate-800">{ontimePercentage}%</span>
                            </div>
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-semibold text-slate-600">Total</p>
                            <p className="text-3xl font-bold text-slate-800">{totalAttendance}</p>
                        </div>
                        <div className="flex items-center justify-center gap-6 text-sm pt-4">
                             {attendanceData.map(item => (
                                <div key={item.name} className="flex items-center gap-2">
                                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                                    <span>{item.name}:</span>
                                    <span className="font-medium text-slate-700">{item.value}</span>
                                </div>
                             ))}
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Attendance</CardTitle>
                         <Select defaultValue="this-month">
                            <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="this-month">This Month</SelectItem>
                                <SelectItem value="last-month">Last Month</SelectItem>
                            </SelectContent>
                        </Select>
                    </CardHeader>
                     <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>No</TableHead>
                                    <TableHead>Nama</TableHead>
                                    <TableHead>Status Kehadiran</TableHead>
                                    <TableHead>Check In</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentAttendance.map(att => (
                                    <TableRow key={att.no}>
                                        <TableCell>{att.no}</TableCell>
                                        <TableCell>{att.nama}</TableCell>
                                        <TableCell>
                                            <Badge variant={att.status === 'Late' ? 'destructive' : att.status === 'Sick' ? 'secondary' : 'default'}
                                            className={att.status === 'On Time' ? 'bg-green-500' : ''}
                                            >
                                                {att.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{att.checkIn}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

