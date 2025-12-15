'use client'

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowRight, Calendar, Loader2, Clock, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { 
    employeeDashboardApi, 
    EmployeeDashboardData,
} from '@/lib/api';

// Colors for attendance summary
const ATTENDANCE_COLORS = {
    on_time: '#16A34A',
    late: '#F59E0B',
    absent: '#DC2626',
    leave: '#2563EB',
};

export default function UserDashboard() {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dashboardData, setDashboardData] = useState<EmployeeDashboardData | null>(null);
    
    const [dateRange, setDateRange] = useState({ from: '', to: '' });
    const [tempDateRange, setTempDateRange] = useState({ from: '', to: '' });
    const [isDateDialogOpen, setIsDateDialogOpen] = useState(false);

    const loadDashboardData = useCallback(async (startDate?: string, endDate?: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await employeeDashboardApi.getDashboard(startDate, endDate);
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

    const handleDateRangeSelect = () => {
        if (tempDateRange.from && tempDateRange.to) {
            setDateRange(tempDateRange);
            setIsDateDialogOpen(false);
            loadDashboardData(tempDateRange.from, tempDateRange.to);
        }
    };

    const clearDateRange = () => {
        setDateRange({ from: '', to: '' });
        setTempDateRange({ from: '', to: '' });
        loadDashboardData();
    };

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
                    onClick={() => loadDashboardData()}
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

    const { work_stats, attendance_summary, leave_summary, work_hours_chart } = dashboardData;

    // Prepare attendance summary pie chart data
    const attendanceSummaryData = [
        { name: 'On Time', value: attendance_summary.on_time, color: ATTENDANCE_COLORS.on_time },
        { name: 'Late', value: attendance_summary.late, color: ATTENDANCE_COLORS.late },
        { name: 'Absent', value: attendance_summary.absent, color: ATTENDANCE_COLORS.absent },
        { name: 'Leave', value: attendance_summary.leave_count, color: ATTENDANCE_COLORS.leave },
    ].filter(item => item.value > 0);

    const totalAttendance = attendance_summary.total_attendance || 
        (attendance_summary.on_time + attendance_summary.late + attendance_summary.absent + attendance_summary.leave_count);
    const presentPercentage = totalAttendance > 0 ? Math.round(attendance_summary.on_time_percent) : 0;

    // Prepare work hours chart data
    const workHoursData = work_hours_chart.daily_work_hours?.map(item => ({
        name: item.day_name.substring(0, 3),
        date: item.date,
        value: item.work_minutes / 60,
        workHours: item.work_hours,
    })) || [];

    // Calculate total leave quota
    const totalLeaveQuota = leave_summary.leave_quota_detail?.reduce((acc, item) => acc + item.total_quota, 0) || 0;
    const totalLeaveTaken = leave_summary.leave_quota_detail?.reduce((acc, item) => acc + item.taken, 0) || 0;
    const totalLeaveRemaining = leave_summary.leave_quota_detail?.reduce((acc, item) => acc + item.remaining, 0) || 0;

    return (
        <div className="space-y-6">
            {/* Date Range Filter */}
            <div className="flex gap-4 items-center">
                <Dialog open={isDateDialogOpen} onOpenChange={setIsDateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="gap-2">
                            <Calendar className="h-4 w-4" />
                            Select Date Range
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Select Date Range</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="from-date">From Date</Label>
                                <Input
                                    id="from-date"
                                    type="date"
                                    value={tempDateRange.from}
                                    onChange={(e) => setTempDateRange({ ...tempDateRange, from: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="to-date">To Date</Label>
                                <Input
                                    id="to-date"
                                    type="date"
                                    value={tempDateRange.to}
                                    onChange={(e) => setTempDateRange({ ...tempDateRange, to: e.target.value })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleDateRangeSelect}>Apply</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {dateRange.from && dateRange.to && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                            {dateRange.from} to {dateRange.to}
                        </span>
                        <Button variant="ghost" size="sm" onClick={clearDateRange}>Clear</Button>
                    </div>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Work Hours</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{work_stats.work_hours || '0h 0m'}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">On Time</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-green-600">{work_stats.on_time_count}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Late</CardTitle>
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-yellow-600">{work_stats.late_count}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Absent</CardTitle>
                        <XCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-red-600">{work_stats.absent_count}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Attendance Summary & Leave Summary */}
            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Attendance Summary</CardTitle>
                        <CardDescription>Monthly attendance overview</CardDescription>
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
                                        {attendanceSummaryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-4xl font-bold text-slate-800">{presentPercentage}%</span>
                                <span className="text-xs text-muted-foreground">On Time</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-center gap-4 text-sm pt-4 flex-wrap">
                            {attendanceSummaryData.map(item => (
                                <div key={item.name} className="flex items-center gap-2">
                                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                                    <span>{item.name}: {item.value}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Leave Summary</CardTitle>
                        <span className="text-sm text-muted-foreground">{leave_summary.year}</span>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <div className="p-4 border rounded-lg flex justify-between items-center">
                            <div>
                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-green-400"></span>
                                    Total Leave Quota
                                </p>
                                <p className="text-2xl font-bold">{totalLeaveQuota} Days</p>
                            </div>
                            <Link href="/my-leave" className="text-xs text-blue-600 flex items-center hover:underline">
                                Request Leave <ArrowRight className="h-3 w-3 ml-1" />
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 border rounded-lg">
                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-yellow-400"></span>
                                    Taken
                                </p>
                                <p className="text-2xl font-bold">{totalLeaveTaken} Days</p>
                            </div>
                            <div className="p-4 border rounded-lg">
                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-blue-400"></span>
                                    Remaining
                                </p>
                                <p className="text-2xl font-bold">{totalLeaveRemaining} Days</p>
                            </div>
                        </div>
                        
                        {leave_summary.leave_quota_detail && leave_summary.leave_quota_detail.length > 0 && (
                            <div className="mt-2 space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">By Type:</p>
                                {leave_summary.leave_quota_detail.map((item) => (
                                    <div key={item.leave_type_id} className="flex justify-between text-sm">
                                        <span>{item.leave_type_name}</span>
                                        <span className="text-muted-foreground">
                                            {item.taken}/{item.total_quota} days
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Work Hours Chart */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Your Work Hours</CardTitle>
                        <CardDescription>{work_hours_chart.total_work_hours || '0h 0m'}</CardDescription>
                    </div>
                    <span className="text-sm text-muted-foreground">
                        Week {work_hours_chart.week_number || 1}
                    </span>
                </CardHeader>
                <CardContent>
                    {workHoursData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={workHoursData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                                <YAxis unit=" hr" tickLine={false} axisLine={false} domain={[0, 10]} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
                                    labelStyle={{ fontWeight: 'bold' }}
                                />
                                <Bar dataKey="value" fill="#16A34A" radius={[4, 4, 0, 0]} barSize={50} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                            No work hours data available
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
