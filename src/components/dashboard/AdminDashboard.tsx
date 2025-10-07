"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PieChart, Pie, Cell, Legend } from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Data Dummy
const employeeStatsData = [
  { name: 'New', value: 16 },
  { name: 'Active', value: 33 },
  { name: 'Resign', value: 9 },
];

const employeeStatusData = [
  { name: 'Tetap Permanen', value: 17 },
  { name: 'Tetap Percobaan', value: 26 },
  { name: 'PKWT (Kontrak)', value: 22 },
  { name: 'Magang', value: 37 },
];

const attendanceStatsData = [
    { name: 'Ontime', value: 145 },
    { name: 'Late', value: 23 },
    { name: 'Sick', value: 8 },
];
const COLORS_ATTENDANCE = ['#22c55e', '#f97316', '#ef4444']; // Green, Orange, Red

const attendanceListData = [
    { no: 1, nama: 'Angga', status: 'On Time', checkIn: '08:30' },
    { no: 2, nama: 'Resi', status: 'Sick', checkIn: '-' },
    { no: 3, nama: 'Imanuel', status: 'Late', checkIn: '09:05' },
    { no: 4, nama: 'Hafiz', status: 'On Time', checkIn: '08:30' },
    { no: 5, nama: 'Farel', status: 'On Time', checkIn: '08:30' },
];


export default function AdminDashboard() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Employees</CardTitle>
            <CardDescription>Update: December 31, 2025</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">190</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>New Employees</CardTitle>
            <CardDescription>Update: December 31, 2025</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">17</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active Employees</CardTitle>
            <CardDescription>Update: December 31, 2025</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">34</p>
          </CardContent>
        </Card>
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Resigned Employees</CardTitle>
            <CardDescription>Update: December 31, 2025</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">9</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
         <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Employee Statistics</CardTitle>
                    <CardDescription>Current Number of Employees</CardDescription>
                </div>
                <Select defaultValue="month">
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select Month" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="month">This Month</SelectItem>
                        <SelectItem value="year">This Year</SelectItem>
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={employeeStatsData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Employee Statistics</CardTitle>
                    <CardDescription>Current Number of Employees</CardDescription>
                </div>
                <Select defaultValue="month">
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select Month" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="month">This Month</SelectItem>
                        <SelectItem value="year">This Year</SelectItem>
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart layout="vertical" data={employeeStatusData}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={100} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#82ca9d" />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
             <CardHeader>
                <CardTitle>Statistics Attendance</CardTitle>
             </CardHeader>
             <CardContent className="flex flex-col items-center">
                 <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                        <Pie data={attendanceStatsData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5}>
                             {attendanceStatsData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS_ATTENDANCE[index % COLORS_ATTENDANCE.length]} />
                            ))}
                        </Pie>
                         <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 flex flex-col gap-2 text-center">
                    <p className="text-2xl font-bold">Total: {attendanceStatsData.reduce((acc, curr) => acc + curr.value, 0)}</p>
                    <div className="flex justify-center gap-4 text-sm">
                        <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>Ontime: {attendanceStatsData[0].value}</span>
                        <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-orange-500 mr-2"></div>Late: {attendanceStatsData[1].value}</span>
                        <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>Sick: {attendanceStatsData[2].value}</span>
                    </div>
                </div>
             </CardContent>
        </Card>
        <Card className="lg:col-span-3">
             <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Attendance</CardTitle>
                <Select defaultValue="month">
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select Month" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="month">This Month</SelectItem>
                        <SelectItem value="year">This Year</SelectItem>
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
                         {attendanceListData.map((item) => (
                            <TableRow key={item.no}>
                                <TableCell>{item.no}</TableCell>
                                <TableCell>{item.nama}</TableCell>
                                <TableCell>
                                    <Badge variant={item.status === 'On Time' ? 'default' : item.status === 'Late' ? 'destructive' : 'secondary'}>{item.status}</Badge>
                                </TableCell>
                                <TableCell>{item.checkIn}</TableCell>
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
