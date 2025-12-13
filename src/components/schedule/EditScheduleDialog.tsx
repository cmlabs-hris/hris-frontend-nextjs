'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { WorkSchedule, UpdateWorkScheduleRequest } from '@/lib/api';

interface EditScheduleDialogProps {
    schedule: WorkSchedule;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: UpdateWorkScheduleRequest) => Promise<void>;
}

export default function EditScheduleDialog({ schedule, open, onOpenChange, onSubmit }: EditScheduleDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<UpdateWorkScheduleRequest>({
        name: schedule.name,
        type: schedule.type,
        grace_period_minutes: schedule.grace_period_minutes
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        setFormData({
            name: schedule.name,
            type: schedule.type,
            grace_period_minutes: schedule.grace_period_minutes
        });
    }, [schedule]);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        
        if (!formData.name?.trim()) {
            newErrors.name = 'Name is required';
        }
        
        if (formData.grace_period_minutes !== undefined && formData.grace_period_minutes < 0) {
            newErrors.grace_period_minutes = 'Grace period cannot be negative';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validate()) return;

        setIsLoading(true);
        try {
            await onSubmit(formData);
            setErrors({});
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            onOpenChange(false);
            setErrors({});
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Work Schedule</DialogTitle>
                    <DialogDescription>
                        Update the work schedule details.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Schedule Name</Label>
                            <Input
                                id="name"
                                placeholder="e.g., Regular Office Hours"
                                value={formData.name || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                disabled={isLoading}
                            />
                            {errors.name && (
                                <p className="text-sm text-destructive">{errors.name}</p>
                            )}
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="type">Work Arrangement</Label>
                            <Select
                                value={formData.type || schedule.type}
                                onValueChange={(value: 'WFO' | 'WFA' | 'Hybrid') => 
                                    setFormData(prev => ({ ...prev, type: value }))
                                }
                                disabled={isLoading}
                            >
                                <SelectTrigger id="type">
                                    <SelectValue placeholder="Select work arrangement" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="WFO">WFO (Work From Office)</SelectItem>
                                    <SelectItem value="WFA">WFA (Work From Anywhere)</SelectItem>
                                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="grace_period">Grace Period (minutes)</Label>
                            <Input
                                id="grace_period"
                                type="number"
                                min="0"
                                value={formData.grace_period_minutes ?? schedule.grace_period_minutes}
                                onChange={(e) => setFormData(prev => ({ 
                                    ...prev, 
                                    grace_period_minutes: parseInt(e.target.value) || 0 
                                }))}
                                disabled={isLoading}
                            />
                            {errors.grace_period_minutes && (
                                <p className="text-sm text-destructive">{errors.grace_period_minutes}</p>
                            )}
                            <p className="text-sm text-muted-foreground">
                                Time allowed after scheduled start before marking as late
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
