'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { LeaveRequest } from '@/lib/api';
import { Calendar, Clock, FileText, User, CheckCircle2, XCircle, AlertCircle, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LeaveRequestDetailSheetProps {
    request: LeaveRequest;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function LeaveRequestDetailSheet({
    request,
    open,
    onOpenChange,
}: LeaveRequestDetailSheetProps) {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Approved</Badge>;
            case 'rejected':
                return <Badge className="bg-red-500"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
            case 'waiting_approval':
                return <Badge className="bg-yellow-400 text-yellow-900"><Clock className="h-3 w-3 mr-1" />Pending Approval</Badge>;
            case 'cancelled':
                return <Badge variant="secondary"><AlertCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const getDurationTypeLabel = (type: string) => {
        switch (type) {
            case 'full_day':
                return 'Full Day';
            case 'half_day_morning':
                return 'Half Day (Morning)';
            case 'half_day_afternoon':
                return 'Half Day (Afternoon)';
            default:
                return type;
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Leave Request Details
                    </SheetTitle>
                    <SheetDescription>
                        View details of your leave request
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-6 py-6">
                    {/* Status Card */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Status</span>
                                {getStatusBadge(request.status)}
                            </div>
                            {request.status === 'approved' && request.approved_at && (
                                <p className="text-xs text-muted-foreground mt-2">
                                    Approved on {format(new Date(request.approved_at), 'PPP')}
                                </p>
                            )}
                            {request.status === 'rejected' && request.rejection_reason && (
                                <div className="mt-3 p-3 bg-red-50 rounded-md">
                                    <p className="text-sm font-medium text-red-800">Rejection Reason:</p>
                                    <p className="text-sm text-red-700">{request.rejection_reason}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Leave Info */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Leave Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Leave Type</span>
                                <span className="text-sm font-medium">{request.leave_type_name}</span>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Duration Type</span>
                                <span className="text-sm">{getDurationTypeLabel(request.duration_type)}</span>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Total Days</span>
                                <span className="text-sm font-medium">{request.total_days} {request.total_days === 1 ? 'day' : 'days'}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Date Range */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Date Range
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-muted-foreground">Start Date</p>
                                    <p className="text-sm font-medium">{format(new Date(request.start_date), 'PPP')}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">End Date</p>
                                    <p className="text-sm font-medium">{format(new Date(request.end_date), 'PPP')}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Reason */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Reason</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{request.reason}</p>
                        </CardContent>
                    </Card>

                    {/* Attachment */}
                    {request.attachment_url && (
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <Paperclip className="h-4 w-4" />
                                    Attachment
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => window.open(request.attachment_url, '_blank')}
                                >
                                    View Attachment
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* Submission Info */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Submission Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Submitted At</span>
                                <span className="text-sm">{format(new Date(request.submitted_at), 'PPP p')}</span>
                            </div>
                            {request.working_days && request.working_days !== request.total_days && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Working Days</span>
                                    <span className="text-sm">{request.working_days} days</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </SheetContent>
        </Sheet>
    );
}
