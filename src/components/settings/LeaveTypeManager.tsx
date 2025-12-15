'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { leaveApi, LeaveType, CreateLeaveTypeRequest } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const COLORS = [
    { value: '#ef4444', label: 'Red' },
    { value: '#f97316', label: 'Orange' },
    { value: '#eab308', label: 'Yellow' },
    { value: '#22c55e', label: 'Green' },
    { value: '#3b82f6', label: 'Blue' },
    { value: '#8b5cf6', label: 'Purple' },
    { value: '#ec4899', label: 'Pink' },
    { value: '#6b7280', label: 'Gray' },
];

interface FormData {
    name: string;
    code: string;
    description: string;
    color: string;
    is_active: boolean;
    requires_approval: boolean;
    has_quota: boolean;
    quota_calculation_type: string;
    default_quota: number;
}

const initialFormData: FormData = {
    name: '',
    code: '',
    description: '',
    color: '#3b82f6',
    is_active: true,
    requires_approval: true,
    has_quota: true,
    quota_calculation_type: 'fixed',
    default_quota: 12,
};

export default function LeaveTypeManager() {
    const { toast } = useToast();
    const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingType, setEditingType] = useState<LeaveType | null>(null);
    const [formData, setFormData] = useState<FormData>(initialFormData);

    const fetchLeaveTypes = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await leaveApi.listTypes();
            if (response.success && response.data) {
                setLeaveTypes(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch leave types:', error);
            toast({
                title: "Error",
                description: "Failed to load leave types",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchLeaveTypes();
    }, [fetchLeaveTypes]);

    const handleOpenDialog = (leaveType?: LeaveType) => {
        if (leaveType) {
            setEditingType(leaveType);
            setFormData({
                name: leaveType.name,
                code: leaveType.code || '',
                description: leaveType.description || '',
                color: leaveType.color || '#3b82f6',
                is_active: leaveType.is_active ?? true,
                requires_approval: leaveType.requires_approval ?? true,
                has_quota: leaveType.has_quota ?? true,
                quota_calculation_type: leaveType.quota_calculation_type || 'fixed',
                default_quota: leaveType.quota_rules?.default_quota || 12,
            });
        } else {
            setEditingType(null);
            setFormData(initialFormData);
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            toast({
                title: "Validation Error",
                description: "Leave type name is required",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const payload: CreateLeaveTypeRequest = {
                name: formData.name.trim(),
                code: formData.code.trim() || undefined,
                description: formData.description.trim() || undefined,
                color: formData.color,
                is_active: formData.is_active,
                requires_approval: formData.requires_approval,
                has_quota: formData.has_quota,
                quota_calculation_type: formData.quota_calculation_type,
                quota_rules: {
                    type: formData.quota_calculation_type,
                    default_quota: formData.default_quota,
                },
            };

            let response;
            if (editingType) {
                response = await leaveApi.updateType(editingType.id, payload);
            } else {
                response = await leaveApi.createType(payload);
            }

            if (response.success) {
                toast({
                    title: "Success",
                    description: editingType ? "Leave type updated successfully" : "Leave type created successfully",
                });
                setIsDialogOpen(false);
                fetchLeaveTypes();
            } else {
                throw new Error(response.message || 'Operation failed');
            }
        } catch (error) {
            console.error('Failed to save leave type:', error);
            toast({
                title: "Error",
                description: "Failed to save leave type",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const response = await leaveApi.deleteType(id);
            if (response.success) {
                toast({
                    title: "Success",
                    description: "Leave type deleted successfully",
                });
                fetchLeaveTypes();
            } else {
                throw new Error(response.message || 'Delete failed');
            }
        } catch (error) {
            console.error('Failed to delete leave type:', error);
            toast({
                title: "Error",
                description: "Failed to delete leave type",
                variant: "destructive",
            });
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Leave Types</CardTitle>
                    <CardDescription>
                        Configure the types of leave available in your company.
                    </CardDescription>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => handleOpenDialog()}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Leave Type
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingType ? 'Edit Leave Type' : 'Add Leave Type'}</DialogTitle>
                            <DialogDescription>
                                {editingType ? 'Update the leave type details.' : 'Create a new leave type for your company.'}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name *</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g., Annual Leave"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="code">Code</Label>
                                    <Input
                                        id="code"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                        placeholder="e.g., AL"
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Describe this leave type..."
                                    rows={2}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Color</Label>
                                <div className="flex gap-2 flex-wrap">
                                    {COLORS.map((color) => (
                                        <button
                                            key={color.value}
                                            type="button"
                                            className={`w-8 h-8 rounded-full border-2 transition-transform ${formData.color === color.value ? 'border-primary scale-110' : 'border-transparent'}`}
                                            style={{ backgroundColor: color.value }}
                                            onClick={() => setFormData({ ...formData, color: color.value })}
                                            title={color.label}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center justify-between rounded-lg border p-3">
                                    <div className="space-y-0.5">
                                        <Label>Active</Label>
                                        <p className="text-xs text-muted-foreground">Enable this leave type</p>
                                    </div>
                                    <Switch
                                        checked={formData.is_active}
                                        onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                                    />
                                </div>
                                <div className="flex items-center justify-between rounded-lg border p-3">
                                    <div className="space-y-0.5">
                                        <Label>Requires Approval</Label>
                                        <p className="text-xs text-muted-foreground">Manager approval needed</p>
                                    </div>
                                    <Switch
                                        checked={formData.requires_approval}
                                        onCheckedChange={(checked) => setFormData({ ...formData, requires_approval: checked })}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-between rounded-lg border p-3">
                                <div className="space-y-0.5">
                                    <Label>Has Quota</Label>
                                    <p className="text-xs text-muted-foreground">This leave type has a limited quota</p>
                                </div>
                                <Switch
                                    checked={formData.has_quota}
                                    onCheckedChange={(checked) => setFormData({ ...formData, has_quota: checked })}
                                />
                            </div>
                            {formData.has_quota && (
                                <div className="grid grid-cols-2 gap-4 p-3 bg-muted/50 rounded-lg">
                                    <div className="grid gap-2">
                                        <Label>Quota Type</Label>
                                        <Select
                                            value={formData.quota_calculation_type}
                                            onValueChange={(value) => setFormData({ ...formData, quota_calculation_type: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="fixed">Fixed</SelectItem>
                                                <SelectItem value="tenure">Tenure Based</SelectItem>
                                                <SelectItem value="position">Position Based</SelectItem>
                                                <SelectItem value="grade">Grade Based</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Default Quota (days)</Label>
                                        <Input
                                            type="number"
                                            min={0}
                                            value={formData.default_quota}
                                            onChange={(e) => setFormData({ ...formData, default_quota: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
                                Cancel
                            </Button>
                            <Button onClick={handleSubmit} disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                {editingType ? 'Update' : 'Create'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : leaveTypes.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        No leave types configured yet. Click &quot;Add Leave Type&quot; to create one.
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Code</TableHead>
                                <TableHead>Quota</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {leaveTypes.map((type) => (
                                <TableRow key={type.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: type.color || '#6b7280' }}
                                            />
                                            <span className="font-medium">{type.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{type.code || '-'}</TableCell>
                                    <TableCell>
                                        {type.has_quota ? (
                                            <span>{type.quota_rules?.default_quota || 0} days</span>
                                        ) : (
                                            <span className="text-muted-foreground">Unlimited</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={type.is_active ? "default" : "secondary"}>
                                            {type.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleOpenDialog(type)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Delete Leave Type</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Are you sure you want to delete &quot;{type.name}&quot;? This action cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDelete(type.id)}
                                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                        >
                                                            Delete
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}
