'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Loader2, RefreshCw, Search, Calendar } from "lucide-react";
import ScheduleTable from "@/components/schedule/ScheduleTable";
import AddScheduleDialog from "@/components/schedule/AddScheduleDialog";
import EditScheduleDialog from "@/components/schedule/EditScheduleDialog";
import ScheduleDetailDialog from "@/components/schedule/ScheduleDetailDialog";
import AssignScheduleDialog from "@/components/schedule/AssignScheduleDialog";
import { Input } from '@/components/ui/input';
import { 
    scheduleApi,
    WorkSchedule,
    ApiError 
} from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

export default function SchedulePage() {
    const { user } = useAuth();
    const { toast } = useToast();
    
    const [schedules, setSchedules] = useState<WorkSchedule[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    
    // Dialog states
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<WorkSchedule | null>(null);
    const [viewingSchedule, setViewingSchedule] = useState<WorkSchedule | null>(null);
    const [assigningSchedule, setAssigningSchedule] = useState<WorkSchedule | null>(null);

    const isOwner = user?.role === 'owner';
    const pageSize = 10;

    const fetchSchedules = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await scheduleApi.list({
                page: currentPage,
                limit: pageSize,
                name: searchTerm || undefined
            });
            if (response.data) {
                setSchedules(response.data.work_schedules);
                setTotalPages(response.data.total_pages);
                setTotalItems(response.data.total_count);
            }
        } catch (err) {
            const apiError = err as ApiError;
            toast({
                title: "Error",
                description: apiError.message || "Failed to load schedules",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, searchTerm, toast]);

    useEffect(() => {
        fetchSchedules();
    }, [fetchSchedules]);

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        setCurrentPage(1);
    };

    const handleAddSchedule = async (data: Parameters<typeof scheduleApi.create>[0]) => {
        try {
            await scheduleApi.create(data);
            toast({
                title: "Success",
                description: "Work schedule created successfully"
            });
            setIsAddDialogOpen(false);
            fetchSchedules();
        } catch (err) {
            const apiError = err as ApiError;
            toast({
                title: "Error",
                description: apiError.message || "Failed to create schedule",
                variant: "destructive"
            });
        }
    };

    const handleUpdateSchedule = async (id: string, data: Parameters<typeof scheduleApi.update>[1]) => {
        try {
            await scheduleApi.update(id, data);
            toast({
                title: "Success",
                description: "Work schedule updated successfully"
            });
            setEditingSchedule(null);
            fetchSchedules();
        } catch (err) {
            const apiError = err as ApiError;
            toast({
                title: "Error",
                description: apiError.message || "Failed to update schedule",
                variant: "destructive"
            });
        }
    };

    const handleDeleteSchedule = async (id: string) => {
        try {
            await scheduleApi.delete(id);
            toast({
                title: "Success",
                description: "Work schedule deleted successfully"
            });
            fetchSchedules();
        } catch (err) {
            const apiError = err as ApiError;
            toast({
                title: "Error",
                description: apiError.message || "Failed to delete schedule",
                variant: "destructive"
            });
        }
    };

    const handleViewDetail = (schedule: WorkSchedule) => {
        setViewingSchedule(schedule);
    };

    const handleEdit = (schedule: WorkSchedule) => {
        setEditingSchedule(schedule);
    };

    const handleAssign = (schedule: WorkSchedule) => {
        setAssigningSchedule(schedule);
    };

    return (
        <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Work Schedules</h1>
                    <p className="text-muted-foreground">
                        Manage work schedules and assign them to employees
                    </p>
                </div>
                {isOwner && (
                    <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Schedule
                    </Button>
                )}
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Schedule List
                            </CardTitle>
                            <CardDescription>
                                {totalItems} schedule{totalItems !== 1 ? 's' : ''} found
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search schedules..."
                                    className="pl-8 w-[200px]"
                                    value={searchTerm}
                                    onChange={(e) => handleSearch(e.target.value)}
                                />
                            </div>
                            <Button variant="outline" size="icon" onClick={fetchSchedules} disabled={isLoading}>
                                {isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <RefreshCw className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <ScheduleTable
                            schedules={schedules}
                            isOwner={isOwner}
                            onViewDetail={handleViewDetail}
                            onEdit={handleEdit}
                            onDelete={handleDeleteSchedule}
                            onAssign={handleAssign}
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    )}
                </CardContent>
            </Card>

            {/* Add Schedule Dialog */}
            <AddScheduleDialog
                open={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
                onSubmit={handleAddSchedule}
            />

            {/* Edit Schedule Dialog */}
            {editingSchedule && (
                <EditScheduleDialog
                    schedule={editingSchedule}
                    open={!!editingSchedule}
                    onOpenChange={(open) => !open && setEditingSchedule(null)}
                    onSubmit={(data) => handleUpdateSchedule(editingSchedule.id, data)}
                />
            )}

            {/* View Detail Dialog */}
            {viewingSchedule && (
                <ScheduleDetailDialog
                    schedule={viewingSchedule}
                    open={!!viewingSchedule}
                    onOpenChange={(open) => !open && setViewingSchedule(null)}
                    onRefresh={fetchSchedules}
                />
            )}

            {/* Assign Schedule Dialog */}
            {assigningSchedule && (
                <AssignScheduleDialog
                    schedule={assigningSchedule}
                    open={!!assigningSchedule}
                    onOpenChange={(open) => !open && setAssigningSchedule(null)}
                    onSuccess={fetchSchedules}
                />
            )}
        </div>
    );
}
