'use client'

import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2, Check, X } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { LeaveRequest } from '@/app/(dashboard)/leave/page';

// Komponen Date Picker 
function DatePicker({ date, onDateChange }: { date: Date | undefined, onDateChange: (date: Date | undefined) => void }) { return ( <Popover><PopoverTrigger asChild><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal",!date && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{date ? format(date, "PPP") : <span>Pick a date</span>}</Button></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={date} onSelect={onDateChange} initialFocus /></PopoverContent></Popover> )}

// Komponen Edit Dialog 
const EditLeaveDialog = ({ request, onUpdateLeave, children }: { request: LeaveRequest, onUpdateLeave: (req: LeaveRequest) => void, children: React.ReactNode }) => { const [isOpen, setIsOpen] = useState(false); const [formData, setFormData] = useState(request); const [startDate, setStartDate] = useState<Date | undefined>(request.startDate); const [endDate, setEndDate] = useState<Date | undefined>(request.endDate); const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { setFormData(prev => ({...prev, [e.target.id]: e.target.value})); }; const handleSelectChange = (id: keyof LeaveRequest, value: string) => { setFormData(prev => ({...prev, [id]: value})); }; const handleSubmit = () => { onUpdateLeave({...formData, startDate: startDate!, endDate: endDate!}); setIsOpen(false); }; return ( <Dialog open={isOpen} onOpenChange={setIsOpen}><DialogTrigger asChild>{children}</DialogTrigger><DialogContent><DialogHeader><DialogTitle>Edit Leave Request for {request.employeeName}</DialogTitle></DialogHeader><div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4"><div className="space-y-2"><Label>Employee Name</Label><Input value={formData.employeeName} readOnly disabled /></div><div className="space-y-2"><Label>Leave Type</Label><Select value={formData.leaveType} onValueChange={(v) => handleSelectChange('leaveType', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Annual">Annual</SelectItem><SelectItem value="Sick">Sick</SelectItem><SelectItem value="Permit">Permit</SelectItem></SelectContent></Select></div><div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Start Date</Label><DatePicker date={startDate} onDateChange={setStartDate} /></div><div className="space-y-2"><Label>End Date</Label><DatePicker date={endDate} onDateChange={setEndDate} /></div></div><div className="space-y-2"><Label htmlFor="reason">Reason</Label><Textarea id="reason" value={formData.reason} onChange={handleChange} /></div><div className="space-y-2"><Label>Status</Label><Select value={formData.status} onValueChange={(v) => handleSelectChange('status', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Pending">Pending</SelectItem><SelectItem value="Approved">Approved</SelectItem><SelectItem value="Rejected">Rejected</SelectItem></SelectContent></Select></div></div><DialogFooter><Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button><Button onClick={handleSubmit}>Save Changes</Button></DialogFooter></DialogContent></Dialog> )}

// Komponen Tabel Utama
export default function LeaveTable({ requests, onUpdateLeave, onDeleteLeave }: { requests: LeaveRequest[], onUpdateLeave: (req: LeaveRequest) => void, onDeleteLeave: (id: number) => void }) {
    
    // Fungsi untuk mengubah status (Approve/Reject)
    const handleStatusChange = (request: LeaveRequest, newStatus: "Approved" | "Rejected") => {
        onUpdateLeave({ ...request, status: newStatus });
    };
    
    // Komponen untuk Status Badge yang Interaktif
    const StatusBadge = ({ request }: { request: LeaveRequest }) => {
        if (request.status === "Pending") {
            return (
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Badge className="cursor-pointer bg-yellow-400 hover:bg-yellow-500 text-yellow-900">Pending</Badge>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Approve or Reject Leave Request?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Employee: {request.employeeName} <br/>
                                Type: {request.leaveType} <br/>
                                Dates: {format(request.startDate, "PPP")} - {format(request.endDate, "PPP")} <br/>
                                Reason: {request.reason}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <Button variant="destructive" onClick={() => handleStatusChange(request, "Rejected")}>Reject</Button>
                            <AlertDialogAction onClick={() => handleStatusChange(request, "Approved")}>Approve</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            );
        } else if (request.status === "Approved") {
            return <Badge className="bg-green-500 hover:bg-green-600">Approved</Badge>;
        } else {
            return <Badge variant="destructive">Rejected</Badge>;
        }
    };


    return (
        <div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader className="bg-slate-100 dark:bg-slate-800">
                        <TableRow>
                            <TableHead>Employee Name</TableHead>
                            <TableHead>Leave Type</TableHead>
                            <TableHead>Start Date</TableHead>
                            <TableHead>End Date</TableHead>
                            <TableHead>Reason</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {requests.map((request) => (
                            <TableRow key={request.id}>
                                <TableCell className="font-medium">{request.employeeName}</TableCell>
                                <TableCell>{request.leaveType}</TableCell>
                                <TableCell>{format(request.startDate, "PPP")}</TableCell>
                                <TableCell>{format(request.endDate, "PPP")}</TableCell>
                                <TableCell className="max-w-[200px] truncate">{request.reason}</TableCell>
                                <TableCell><StatusBadge request={request} /></TableCell>
                                <TableCell className="text-right">
                                     <DropdownMenu>
                                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4"/></Button></DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <EditLeaveDialog request={request} onUpdateLeave={onUpdateLeave}>
                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="flex items-center gap-2"><Edit className="h-4 w-4" /> <span>Edit</span></DropdownMenuItem>
                                            </EditLeaveDialog>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild><DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-500 flex items-center gap-2"><Trash2 className="h-4 w-4"/> <span>Delete</span></DropdownMenuItem></AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader><AlertDialogTitle>Delete Leave Request</AlertDialogTitle><AlertDialogDescription>This will permanently delete the leave request.</AlertDialogDescription></AlertDialogHeader>
                                                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => onDeleteLeave(request.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
             <div className="flex items-center justify-between mt-4">
                 <div className="text-sm text-muted-foreground">Showing 1 to {requests.length} of {requests.length} requests</div>
             </div>
        </div>
    );
}

