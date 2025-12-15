'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save, AlertCircle } from "lucide-react";
import { payrollApi, PayrollSettings, UpdatePayrollSettingsRequest } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function PayrollSettingsManager() {
    const { toast } = useToast();
    const [settings, setSettings] = useState<PayrollSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    // Form state
    const [lateDeductionEnabled, setLateDeductionEnabled] = useState(false);
    const [lateDeductionPerMinute, setLateDeductionPerMinute] = useState('0');
    const [overtimeEnabled, setOvertimeEnabled] = useState(false);
    const [overtimePayPerMinute, setOvertimePayPerMinute] = useState('0');
    const [earlyLeaveDeductionEnabled, setEarlyLeaveDeductionEnabled] = useState(false);
    const [earlyLeaveDeductionPerMinute, setEarlyLeaveDeductionPerMinute] = useState('0');

    const fetchSettings = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await payrollApi.getSettings();
            if (response.success && response.data) {
                setSettings(response.data);
                setLateDeductionEnabled(response.data.late_deduction_enabled);
                setLateDeductionPerMinute(response.data.late_deduction_per_minute);
                setOvertimeEnabled(response.data.overtime_enabled);
                setOvertimePayPerMinute(response.data.overtime_pay_per_minute);
                setEarlyLeaveDeductionEnabled(response.data.early_leave_deduction_enabled);
                setEarlyLeaveDeductionPerMinute(response.data.early_leave_deduction_per_minute);
            }
        } catch (error) {
            console.error('Failed to fetch payroll settings:', error);
            toast({
                title: "Error",
                description: "Failed to load payroll settings",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    // Track changes
    useEffect(() => {
        if (!settings) return;
        const changed = 
            lateDeductionEnabled !== settings.late_deduction_enabled ||
            lateDeductionPerMinute !== settings.late_deduction_per_minute ||
            overtimeEnabled !== settings.overtime_enabled ||
            overtimePayPerMinute !== settings.overtime_pay_per_minute ||
            earlyLeaveDeductionEnabled !== settings.early_leave_deduction_enabled ||
            earlyLeaveDeductionPerMinute !== settings.early_leave_deduction_per_minute;
        setHasChanges(changed);
    }, [settings, lateDeductionEnabled, lateDeductionPerMinute, overtimeEnabled, overtimePayPerMinute, earlyLeaveDeductionEnabled, earlyLeaveDeductionPerMinute]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const updateData: UpdatePayrollSettingsRequest = {
                late_deduction_enabled: lateDeductionEnabled,
                late_deduction_per_minute: lateDeductionPerMinute,
                overtime_enabled: overtimeEnabled,
                overtime_pay_per_minute: overtimePayPerMinute,
                early_leave_deduction_enabled: earlyLeaveDeductionEnabled,
                early_leave_deduction_per_minute: earlyLeaveDeductionPerMinute,
            };

            const response = await payrollApi.updateSettings(updateData);
            if (response.success) {
                toast({
                    title: "Success",
                    description: "Payroll settings saved successfully",
                });
                if (response.data) {
                    setSettings(response.data);
                }
                setHasChanges(false);
            } else {
                throw new Error(response.message || 'Failed to save settings');
            }
        } catch (error) {
            console.error('Failed to save payroll settings:', error);
            toast({
                title: "Error",
                description: "Failed to save payroll settings",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        if (!settings) return;
        setLateDeductionEnabled(settings.late_deduction_enabled);
        setLateDeductionPerMinute(settings.late_deduction_per_minute);
        setOvertimeEnabled(settings.overtime_enabled);
        setOvertimePayPerMinute(settings.overtime_pay_per_minute);
        setEarlyLeaveDeductionEnabled(settings.early_leave_deduction_enabled);
        setEarlyLeaveDeductionPerMinute(settings.early_leave_deduction_per_minute);
        setHasChanges(false);
    };

    const formatCurrency = (value: string): string => {
        const num = parseFloat(value) || 0;
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(num);
    };

    if (isLoading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Payroll Settings</CardTitle>
                <CardDescription>
                    Configure automatic deductions and overtime pay calculations for payroll.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {hasChanges && (
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            You have unsaved changes. Don&apos;t forget to save your settings.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Late Deduction Section */}
                <div className="space-y-4 p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-medium">Late Deduction</h4>
                            <p className="text-sm text-muted-foreground">
                                Automatically deduct salary for late arrivals
                            </p>
                        </div>
                        <Switch
                            checked={lateDeductionEnabled}
                            onCheckedChange={setLateDeductionEnabled}
                        />
                    </div>
                    {lateDeductionEnabled && (
                        <div className="grid gap-2 pl-4 border-l-2 border-primary/20">
                            <Label htmlFor="late-deduction">Deduction per minute</Label>
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">Rp</span>
                                <Input
                                    id="late-deduction"
                                    type="number"
                                    min="0"
                                    value={lateDeductionPerMinute}
                                    onChange={(e) => setLateDeductionPerMinute(e.target.value)}
                                    className="w-48"
                                />
                                <span className="text-sm text-muted-foreground">/ minute</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Example: If employee is 30 minutes late, deduction = {formatCurrency((parseFloat(lateDeductionPerMinute) * 30).toString())}
                            </p>
                        </div>
                    )}
                </div>

                {/* Overtime Pay Section */}
                <div className="space-y-4 p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-medium">Overtime Pay</h4>
                            <p className="text-sm text-muted-foreground">
                                Automatically calculate overtime pay for extra work hours
                            </p>
                        </div>
                        <Switch
                            checked={overtimeEnabled}
                            onCheckedChange={setOvertimeEnabled}
                        />
                    </div>
                    {overtimeEnabled && (
                        <div className="grid gap-2 pl-4 border-l-2 border-primary/20">
                            <Label htmlFor="overtime-pay">Pay per minute</Label>
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">Rp</span>
                                <Input
                                    id="overtime-pay"
                                    type="number"
                                    min="0"
                                    value={overtimePayPerMinute}
                                    onChange={(e) => setOvertimePayPerMinute(e.target.value)}
                                    className="w-48"
                                />
                                <span className="text-sm text-muted-foreground">/ minute</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Example: If employee works 60 minutes overtime, pay = {formatCurrency((parseFloat(overtimePayPerMinute) * 60).toString())}
                            </p>
                        </div>
                    )}
                </div>

                {/* Early Leave Deduction Section */}
                <div className="space-y-4 p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-medium">Early Leave Deduction</h4>
                            <p className="text-sm text-muted-foreground">
                                Automatically deduct salary for leaving early
                            </p>
                        </div>
                        <Switch
                            checked={earlyLeaveDeductionEnabled}
                            onCheckedChange={setEarlyLeaveDeductionEnabled}
                        />
                    </div>
                    {earlyLeaveDeductionEnabled && (
                        <div className="grid gap-2 pl-4 border-l-2 border-primary/20">
                            <Label htmlFor="early-leave-deduction">Deduction per minute</Label>
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">Rp</span>
                                <Input
                                    id="early-leave-deduction"
                                    type="number"
                                    min="0"
                                    value={earlyLeaveDeductionPerMinute}
                                    onChange={(e) => setEarlyLeaveDeductionPerMinute(e.target.value)}
                                    className="w-48"
                                />
                                <span className="text-sm text-muted-foreground">/ minute</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Example: If employee leaves 15 minutes early, deduction = {formatCurrency((parseFloat(earlyLeaveDeductionPerMinute) * 15).toString())}
                            </p>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">
                    <Button onClick={handleSave} disabled={isSaving || !hasChanges}>
                        {isSaving ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Save className="h-4 w-4 mr-2" />
                        )}
                        Save Settings
                    </Button>
                    {hasChanges && (
                        <Button variant="outline" onClick={handleReset} disabled={isSaving}>
                            Reset
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
