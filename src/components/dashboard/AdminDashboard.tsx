'use client'

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Loader2, Users, UserPlus, UserCheck, UserX } from 'lucide-react';
import { 
    adminDashboardApi, 
    AdminDashboardData,
    EmployeeCurrentNumberResponse,
    EmployeeStatusStatsResponse,
    AttendanceStatsResponse,
    MonthlyAttendanceResponse
} from '@/lib/api';

// Colors for charts
const ATTENDANCE_COLORS = {
    on_time: '#22c55e',
    late: '#f59e0b',
    absent: '#ef4444',
};

const EMPLOYEE_STATUS_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00C49F'];

export default function AdminDashboard() {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
    const [selectedMonth, setSelectedMonth] = useState<string>(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });

    const loadDashboardData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await adminDashboardApi.getDashboard();
            if (response.success && response.data) {
                setDashboardData(response.data);
            } else {
                setError(response.error?.message || 'Failed to load dashboard data');
            }
        } catch (err) {
            setError('Failed to load dashboard data. Please try again.');
            console.error('Dashboard error:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDashboardData();
    }, [loadDashboardData]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <p className="text-red-500">{error}</p>
                <button 
                    onClick={loadDashboardData}
                    className="text-blue-500 hover:underline"
                >
                    Try again
                </button>
            </div>
        );
    }

    if (!dashboardData) {
        return null;
    }

    const { employee_summary, employee_current_number, employee_status_stats, attendance_stats, monthly_attendance } = dashboardData;

    // Prepare bar chart data for employee current number
    const barChartData = [
        { name: 'New', value: employee_current_number.new },
        { name: 'Active', value: employee_current_number.active },
        { name: 'Resign', value: employee_current_number.resign },
    ];

    // Prepare horizontal bar chart data for employee status
    const horizontalBarData = [
        { name: 'Permanent', value: employee_status_stats.permanent },
        { name: 'Probation', value: employee_status_stats.probation },
        { name: 'Contract', value: employee_status_stats.contract },
        { name: 'Internship', value: employee_status_stats.internship },
        { name: 'Freelance', value: employee_status_stats.freelance },
    ].filter(item => item.value > 0);

    // Prepare pie chart data for attendance
    const attendanceData = [
        { name: 'On Time', value: attendance_stats.on_time, color: ATTENDANCE_COLORS.on_time },
        { name: 'Late', value: attendance_stats.late, color: ATTENDANCE_COLORS.late },
        { name: 'Absent', value: attendance_stats.absent, color: ATTENDANCE_COLORS.absent },
    ];
    const totalAttendance = attendance_stats.total || (attendance_stats.on_time + attendance_stats.late + attendance_stats.absent);
    const ontimePercentage = totalAttendance > 0 ? Math.round(attendance_stats.on_time_percent) : 0;

    // Get status badge variant
    const getStatusBadge = (status: string) => {
        const statusLower = status.toLowerCase();
        if (statusLower === 'late') return 'destructive';
        if (statusLower === 'absent') return 'secondary';
        return 'default';
    };

    const getStatusClass = (status: string) => {
        const statusLower = status.toLowerCase();
        if (statusLower === 'on_time') return 'bg-green-500';
        return '';
    };

    return (
        <div className="grid gap-6">
            {/* Summary Cards */}
            <div className="grid md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{employee_summary.total_employee}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">New Employees</CardTitle>
                        <UserPlus className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{employee_summary.new_employee}</div>
                        <p className="text-xs text-muted-foreground">Last 30 days</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{employee_summary.active_employee}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Resigned</CardTitle>
                        <UserX className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{employee_summary.resigned_employee}</div>
                    </CardContent>
                </Card>
            </div>

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
                        {horizontalBarData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={horizontalBarData} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false}/>
                                    <XAxis type="number" />
                                    <YAxis type="category" dataKey="name" width={100} tickLine={false} axisLine={false} />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#82ca9d" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                                No employee data available
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Attendance Statistics */}
            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Statistics Attendance</CardTitle>
                        <CardDescription>Today&apos;s Attendance Overview</CardDescription>
                    </CardHeader>
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
                        <CardTitle>Recent Attendance</CardTitle>
                        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                            <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value={selectedMonth}>This Month</SelectItem>
                            </SelectContent>
                        </Select>
                    </CardHeader>
                    <CardContent>
                        {monthly_attendance.records && monthly_attendance.records.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>No</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Check In</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {monthly_attendance.records.map((record) => (
                                        <TableRow key={record.no}>
                                            <TableCell>{record.no}</TableCell>
                                            <TableCell>{record.employee_name}</TableCell>
                                            <TableCell>
                                                <Badge 
                                                    variant={getStatusBadge(record.status)}
                                                    className={getStatusClass(record.status)}
                                                >
                                                    {record.status.replace('_', ' ')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{record.check_in || '-'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                                No attendance records
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

