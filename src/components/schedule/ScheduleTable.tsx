'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye, Pencil, Trash2, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { WorkSchedule } from '@/lib/api';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface ScheduleTableProps {
    schedules: WorkSchedule[];
    isOwner: boolean;
    onViewDetail: (schedule: WorkSchedule) => void;
    onEdit: (schedule: WorkSchedule) => void;
    onDelete: (id: string) => void;
    onAssign: (schedule: WorkSchedule) => void;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const getWorkArrangementBadge = (type: string) => {
    switch (type) {
        case 'WFO':
            return <Badge variant="default">WFO</Badge>;
        case 'WFA':
            return <Badge variant="secondary">WFA</Badge>;
        case 'Hybrid':
            return <Badge variant="outline">Hybrid</Badge>;
        default:
            return <Badge variant="outline">{type}</Badge>;
    }
};

const formatGracePeriod = (minutes: number) => {
    if (minutes === 0) return 'No grace period';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

export default function ScheduleTable({
    schedules,
    isOwner,
    onViewDetail,
    onEdit,
    onDelete,
    onAssign,
    currentPage,
    totalPages,
    onPageChange
}: ScheduleTableProps) {
    if (schedules.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-muted-foreground">No schedules found</p>
                {isOwner && (
                    <p className="text-sm text-muted-foreground mt-1">
                        Click "Add Schedule" to create your first work schedule
                    </p>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Schedule Times</TableHead>
                            <TableHead>Locations</TableHead>
                            <TableHead>Grace Period</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {schedules.map((schedule) => (
                            <TableRow key={schedule.id}>
                                <TableCell className="font-medium">{schedule.name}</TableCell>
                                <TableCell>{getWorkArrangementBadge(schedule.type)}</TableCell>
                                <TableCell>
                                    {schedule.times && schedule.times.length > 0 ? (
                                        <span className="text-sm">
                                            {schedule.times.length} day{schedule.times.length > 1 ? 's' : ''} configured
                                        </span>
                                    ) : (
                                        <span className="text-sm text-muted-foreground">Not configured</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {schedule.locations && schedule.locations.length > 0 ? (
                                        <span className="text-sm">
                                            {schedule.locations.length} location{schedule.locations.length > 1 ? 's' : ''}
                                        </span>
                                    ) : (
                                        <span className="text-sm text-muted-foreground">No locations</span>
                                    )}
                                </TableCell>
                                <TableCell>{formatGracePeriod(schedule.grace_period_minutes)}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreHorizontal className="h-4 w-4" />
                                                <span className="sr-only">Open menu</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => onViewDetail(schedule)}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                View Details
                                            </DropdownMenuItem>
                                            {isOwner && (
                                                <>
                                                    <DropdownMenuItem onClick={() => onEdit(schedule)}>
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => onAssign(schedule)}>
                                                        <Users className="mr-2 h-4 w-4" />
                                                        Assign to Employees
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <DropdownMenuItem 
                                                                className="text-destructive focus:text-destructive"
                                                                onSelect={(e) => e.preventDefault()}
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Delete Schedule</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Are you sure you want to delete "{schedule.name}"? 
                                                                    This action cannot be undone and will affect all employees assigned to this schedule.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction 
                                                                    onClick={() => onDelete(schedule.id)}
                                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                >
                                                                    Delete
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-end gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                    </Button>
                    <div className="text-sm text-muted-foreground">
                        Page {currentPage} of {totalPages}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                    >
                        Next
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}
