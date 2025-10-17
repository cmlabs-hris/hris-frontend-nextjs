'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowRight } from "lucide-react";

// --- Data Fiktif untuk Desain Baru ---
const userStats = [
    { title: "Work Hours", value: "120h 54m" },
    { title: "On Time", value: "20" },
    { title: "Late", value: "5" },
    { title: "Absent", value: "10" },
];

const attendanceSummaryData = [
    { name: 'Present', value: 85, color: '#16A34A' }, 
    { name: 'Permit', value: 5, color: '#2563EB' },  
    { name: 'Leave', value: 7, color: '#F59E0B' },   
    { name: 'Sick', value: 3, color: '#DC2626' },     
];
// Hitung total dan persentase
const totalAttendance = attendanceSummaryData.reduce((acc, curr) => acc + curr.value, 0);
const presentPercentage = Math.round((attendanceSummaryData.find(d => d.name === 'Present')?.value || 0) / totalAttendance * 100);


const workHoursData = [
    { name: 'March 20', value: 4 },
    { name: 'March 21', value: 2 },
    { name: 'March 22', value: 2.5 },
    { name: 'March 23', value: 2 },
    { name: 'March 24', value: 8 },
    { name: 'March 25', value: 2 },
    { name: 'March 26', value: 3 },
];


export default function UserDashboard() {
  return (
    <div className="space-y-6">
        {/* Kartu Statistik Atas */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {userStats.map(stat => (
                <Card key={stat.title}>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{stat.value}</p>
                    </CardContent>
                </Card>
            ))}
        </div>

        {/* Ringkasan Absensi & Cuti */}
        <div className="grid gap-6 lg:grid-cols-2">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Attendance Summary</CardTitle>
                    <Select defaultValue="months"><SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="months">Months</SelectItem></SelectContent></Select>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center gap-4 pt-4">
                    <div className="relative w-48 h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie 
                                    data={attendanceSummaryData} 
                                    cx="50%" 
                                    cy="50%" 
                                    innerRadius={60} 
                                    outerRadius={80} 
                                    dataKey="value" 
                                    stroke="none"
                                    paddingAngle={5}
                                    cornerRadius={8}
                                >
                                    {attendanceSummaryData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        {/* --- PERUBAHAN DI SINI --- */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-bold text-slate-800">{presentPercentage}%</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-center gap-4 text-sm pt-4 flex-wrap">
                        {attendanceSummaryData.map(item => (
                            <div key={item.name} className="flex items-center gap-2">
                                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                                <span>{item.name}</span>
                            </div>
                         ))}
                    </div>
                </CardContent>
            </Card>
            <Card>
                 <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Leave Summary</CardTitle>
                    <Select defaultValue="range"><SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="range">Rentan Waktu</SelectItem></SelectContent></Select>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <div className="p-4 border rounded-lg flex justify-between items-center">
                        <div>
                            <p className="text-sm text-muted-foreground flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-green-400"></span>Total Quota Annual Leave</p>
                            <p className="text-2xl font-bold">12 Days</p>
                        </div>
                        <a href="#" className="text-xs text-blue-600 flex items-center">Request Leave <ArrowRight className="h-3 w-3 ml-1" /></a>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 border rounded-lg">
                             <p className="text-sm text-muted-foreground flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-green-400"></span>Taken</p>
                            <p className="text-2xl font-bold">4 Days</p>
                            <a href="#" className="text-xs text-blue-600 flex items-center mt-2">See Details <ArrowRight className="h-3 w-3 ml-1" /></a>
                        </div>
                        <div className="p-4 border rounded-lg">
                             <p className="text-sm text-muted-foreground flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-green-400"></span>Remaining</p>
                            <p className="text-2xl font-bold">8 Days</p>
                             <a href="#" className="text-xs text-blue-600 flex items-center mt-2">Request Leave <ArrowRight className="h-3 w-3 ml-1" /></a>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Grafik Jam Kerja */}
        <Card>
             <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Your Work Hours</CardTitle>
                    <CardDescription>120h 54m</CardDescription>
                </div>
                <Select defaultValue="week"><SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="week">View by Week</SelectItem></SelectContent></Select>
            </CardHeader>
             <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={workHoursData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tickLine={false} axisLine={false} />
                        <YAxis unit=" hr" tickLine={false} axisLine={false} domain={[0, 8]} ticks={[1, 4, 8]}/>
                        <Tooltip 
                            contentStyle={{ borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
                            labelStyle={{ fontWeight: 'bold' }}
                            formatter={(value) => [`${value} hr`, 'Work Hours']}
                        />
                        <Bar dataKey="value" fill="#16A34A" radius={[4, 4, 0, 0]} barSize={50} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    </div>
  );
}

