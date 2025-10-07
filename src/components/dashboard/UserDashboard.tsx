"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PieChart, Pie, Cell } from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Data Dummy
const attendanceSummaryData = [
    { name: 'Leave', value: 5 },
    { name: 'Present', value: 85 },
    { name: 'Sick', value: 3 },
    { name: 'Late', value: 7 },
];
const COLORS_SUMMARY = ['#3b82f6', '#22c55e', '#ef4444', '#f97316'];

const weeklyStatsData = [
  { name: 'June 13', value: 2 },
  { name: 'June 14', value: 7 },
  { name: 'June 15', value: 3 },
  { name: 'June 16', value: 6 },
  { name: 'June 17', value: 5 },
  { name: 'June 18', value: 7 },
];

export default function UserDashboard() {
  return (
    <div className="flex flex-col gap-6">
       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader>
                    <CardTitle>Total Employees</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-4xl font-bold">190</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Total Employees</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-4xl font-bold">190</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Total Employees</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-4xl font-bold">190</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Total Employees</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-4xl font-bold">190</p>
                </CardContent>
            </Card>
       </div>
       <div className="grid gap-6 lg:grid-cols-2">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Attendance Summary</CardTitle>
                    <Select defaultValue="month">
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select Month" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="month">This Month</SelectItem>
                        </SelectContent>
                    </Select>
                </CardHeader>
                <CardContent className="flex items-center justify-center flex-col">
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                             <Pie data={attendanceSummaryData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={70} outerRadius={90} fill="#8884d8" paddingAngle={5}>
                                {attendanceSummaryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS_SUMMARY[index % COLORS_SUMMARY.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                     <p className="text-2xl font-bold -mt-20">Total Presensi</p>
                     <div className="mt-20 flex justify-center gap-4 text-sm flex-wrap">
                        <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>Leave</span>
                        <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>Present</span>
                        <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>Sick</span>
                        <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-orange-500 mr-2"></div>Late</span>
                    </div>
                </CardContent>
            </Card>
            <div className="flex flex-col gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Leave Summary</CardTitle>
                        <Select defaultValue="month">
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select Month" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="month">This Month</SelectItem>
                            </SelectContent>
                        </Select>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <div className="p-4 border rounded-lg">
                            <p className="text-sm text-muted-foreground">Total Quota Annual Leave</p>
                            <p className="text-2xl font-bold">50</p>
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                             <div className="p-4 border rounded-lg">
                                <p className="text-sm text-muted-foreground">Taken</p>
                                <p className="text-2xl font-bold">32</p>
                            </div>
                             <div className="p-4 border rounded-lg">
                                <p className="text-sm text-muted-foreground">Remaining</p>
                                <p className="text-2xl font-bold">72</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
       </div>
       <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Employee Statistics</CardTitle>
                    <CardDescription>Current Number of Employees</CardDescription>
                </div>
                <Select defaultValue="week">
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="View by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="week">View by Week</SelectItem>
                        <SelectItem value="month">View by Month</SelectItem>
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={weeklyStatsData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    </div>
  );
}
