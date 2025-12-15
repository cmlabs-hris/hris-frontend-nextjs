'use client';

import { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Upload, Building2, Pencil, Save, X } from "lucide-react";
import CrudManager, { MasterDataItem } from "@/components/settings/CrudManager";
import LeaveTypeManager from "@/components/settings/LeaveTypeManager";
import LeaveQuotaManager from "@/components/settings/LeaveQuotaManager";
import PayrollSettingsManager from "@/components/settings/PayrollSettingsManager";
import { masterApi, companyApi, ApiResponse, Branch, Grade, Position, Company, getUploadUrl } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function CompanySettingsPage() {
    const { toast } = useToast();
    const [company, setCompany] = useState<Company | null>(null);
    const [isLoadingCompany, setIsLoadingCompany] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);
    
    // Edit form state
    const [editName, setEditName] = useState('');
    const [editAddress, setEditAddress] = useState('');

    // Fetch company data
    const fetchCompany = useCallback(async () => {
        setIsLoadingCompany(true);
        try {
            const response = await companyApi.getMyCompany();
            if (response.success && response.data) {
                setCompany(response.data);
                setEditName(response.data.company_name || '');
                setEditAddress(response.data.company_address || '');
            }
        } catch (error) {
            console.error('Failed to fetch company:', error);
            toast({
                title: "Error",
                description: "Failed to load company data",
                variant: "destructive",
            });
        } finally {
            setIsLoadingCompany(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchCompany();
    }, [fetchCompany]);

    // Handle logo upload
    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file
        if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
            toast({
                title: "Invalid file type",
                description: "Please upload a JPG or PNG image",
                variant: "destructive",
            });
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            toast({
                title: "File too large",
                description: "Maximum file size is 10MB",
                variant: "destructive",
            });
            return;
        }

        setIsUploadingLogo(true);
        try {
            const response = await companyApi.uploadLogo(file);
            if (response.success && response.data) {
                // Refresh company data to get updated logo
                await fetchCompany();
                toast({
                    title: "Success",
                    description: "Company logo updated successfully",
                });
            } else {
                throw new Error(response.message || 'Failed to upload logo');
            }
        } catch (error) {
            console.error('Failed to upload logo:', error);
            toast({
                title: "Error",
                description: "Failed to upload logo",
                variant: "destructive",
            });
        } finally {
            setIsUploadingLogo(false);
            // Reset input
            e.target.value = '';
        }
    };

    // Handle save company info
    const handleSaveCompany = async () => {
        setIsSaving(true);
        try {
            const response = await companyApi.update({
                company_name: editName,
                company_address: editAddress || undefined,
            });
            
            if (response.success) {
                await fetchCompany();
                setIsEditing(false);
                toast({
                    title: "Success",
                    description: "Company information updated successfully",
                });
            } else {
                throw new Error(response.message || 'Failed to update company');
            }
        } catch (error) {
            console.error('Failed to update company:', error);
            toast({
                title: "Error",
                description: "Failed to update company information",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    // Cancel editing
    const handleCancelEdit = () => {
        setEditName(company?.company_name || '');
        setEditAddress(company?.company_address || '');
        setIsEditing(false);
    };

    // Branch API handlers
    const fetchBranches = async (): Promise<ApiResponse<MasterDataItem[]>> => {
        const response = await masterApi.listBranches();
        return {
            ...response,
            data: response.data?.map((item: Branch) => ({
                id: item.id,
                name: item.name,
                address: item.address,
                timezone: item.timezone,
            })),
        };
    };

    const createBranch = async (data: { name: string; address?: string; timezone?: string }) => {
        const response = await masterApi.createBranch(data);
        return {
            ...response,
            data: response.data ? {
                id: response.data.id,
                name: response.data.name,
                address: response.data.address,
                timezone: response.data.timezone,
            } : undefined,
        };
    };

    const updateBranch = async (id: string, data: { name: string; address?: string; timezone?: string }) => {
        const response = await masterApi.updateBranch(id, data);
        return {
            ...response,
            data: response.data ? {
                id: response.data.id,
                name: response.data.name,
                address: response.data.address,
                timezone: response.data.timezone,
            } : undefined,
        };
    };

    const deleteBranch = async (id: string) => {
        return masterApi.deleteBranch(id);
    };

    // Grade API handlers
    const fetchGrades = async (): Promise<ApiResponse<MasterDataItem[]>> => {
        const response = await masterApi.listGrades();
        return {
            ...response,
            data: response.data?.map((item: Grade) => ({
                id: item.id,
                name: item.name,
            })),
        };
    };

    const createGrade = async (data: { name: string }) => {
        const response = await masterApi.createGrade(data);
        return {
            ...response,
            data: response.data ? {
                id: response.data.id,
                name: response.data.name,
            } : undefined,
        };
    };

    const updateGrade = async (id: string, data: { name: string }) => {
        const response = await masterApi.updateGrade(id, data);
        return {
            ...response,
            data: response.data ? {
                id: response.data.id,
                name: response.data.name,
            } : undefined,
        };
    };

    const deleteGrade = async (id: string) => {
        return masterApi.deleteGrade(id);
    };

    // Position API handlers
    const fetchPositions = async (): Promise<ApiResponse<MasterDataItem[]>> => {
        const response = await masterApi.listPositions();
        return {
            ...response,
            data: response.data?.map((item: Position) => ({
                id: item.id,
                name: item.name,
            })),
        };
    };

    const createPosition = async (data: { name: string }) => {
        const response = await masterApi.createPosition(data);
        return {
            ...response,
            data: response.data ? {
                id: response.data.id,
                name: response.data.name,
            } : undefined,
        };
    };

    const updatePosition = async (id: string, data: { name: string }) => {
        const response = await masterApi.updatePosition(id, data);
        return {
            ...response,
            data: response.data ? {
                id: response.data.id,
                name: response.data.name,
            } : undefined,
        };
    };

    const deletePosition = async (id: string) => {
        return masterApi.deletePosition(id);
    };

    return (
        <div className="space-y-6">
            {/* Company Profile Card */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Company Profile</CardTitle>
                        <CardDescription>
                            Manage your company's basic information and logo.
                        </CardDescription>
                    </div>
                    {!isEditing && !isLoadingCompany && (
                        <Button variant="outline" onClick={() => setIsEditing(true)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                        </Button>
                    )}
                </CardHeader>
                <CardContent>
                    {isLoadingCompany ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : company ? (
                        <div className="grid gap-6 md:grid-cols-[200px_1fr]">
                            {/* Logo Section */}
                            <div className="flex flex-col items-center gap-4">
                                <div className="relative group">
                                    <Avatar className="h-32 w-32 border-4 border-slate-100">
                                        <AvatarImage 
                                            src={company.logo_url ? getUploadUrl(company.logo_url) : undefined} 
                                            alt={company.company_name} 
                                        />
                                        <AvatarFallback className="text-4xl bg-slate-100">
                                            <Building2 className="h-16 w-16 text-slate-400" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <label 
                                        htmlFor="logo-upload"
                                        className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                                    >
                                        {isUploadingLogo ? (
                                            <Loader2 className="h-8 w-8 animate-spin text-white" />
                                        ) : (
                                            <Upload className="h-8 w-8 text-white" />
                                        )}
                                    </label>
                                    <input
                                        id="logo-upload"
                                        type="file"
                                        accept="image/jpeg,image/png,image/jpg"
                                        onChange={handleLogoUpload}
                                        className="hidden"
                                        disabled={isUploadingLogo}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground text-center">
                                    Click to upload logo<br />
                                    JPG, PNG (max 10MB)
                                </p>
                            </div>

                            {/* Company Info Section */}
                            <div className="space-y-4">
                                {isEditing ? (
                                    <>
                                        <div className="grid gap-2">
                                            <Label htmlFor="company-name">Company Name</Label>
                                            <Input
                                                id="company-name"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                placeholder="Enter company name"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="company-username">Company Username</Label>
                                            <Input
                                                id="company-username"
                                                value={company.company_username}
                                                disabled
                                                className="bg-slate-50"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Username cannot be changed
                                            </p>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="company-address">Address</Label>
                                            <Textarea
                                                id="company-address"
                                                value={editAddress}
                                                onChange={(e) => setEditAddress(e.target.value)}
                                                placeholder="Enter company address"
                                                rows={3}
                                            />
                                        </div>
                                        <div className="flex gap-2 pt-2">
                                            <Button onClick={handleSaveCompany} disabled={isSaving}>
                                                {isSaving ? (
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                ) : (
                                                    <Save className="h-4 w-4 mr-2" />
                                                )}
                                                Save Changes
                                            </Button>
                                            <Button variant="outline" onClick={handleCancelEdit} disabled={isSaving}>
                                                <X className="h-4 w-4 mr-2" />
                                                Cancel
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="grid gap-1">
                                            <Label className="text-muted-foreground text-xs">Company Name</Label>
                                            <p className="text-lg font-medium">{company.company_name || '-'}</p>
                                        </div>
                                        <div className="grid gap-1">
                                            <Label className="text-muted-foreground text-xs">Company Username</Label>
                                            <p className="font-medium">@{company.company_username}</p>
                                        </div>
                                        <div className="grid gap-1">
                                            <Label className="text-muted-foreground text-xs">Address</Label>
                                            <p className="text-sm text-muted-foreground">
                                                {company.company_address || 'No address provided'}
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center py-4">
                            No company data available
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Master Data Tabs */}
            <Card>
                <CardHeader>
                    <CardTitle>Settings</CardTitle>
                    <CardDescription>
                        Manage master data, leave types, quotas, and payroll settings.
                    </CardDescription>
                </CardHeader>   
            </Card>

            <Tabs defaultValue="position" className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="position">Position</TabsTrigger>
                    <TabsTrigger value="grade">Grade</TabsTrigger>
                    <TabsTrigger value="branch">Branch</TabsTrigger>
                    <TabsTrigger value="leave-types">Leave Types</TabsTrigger>
                    <TabsTrigger value="leave-quota">Leave Quota</TabsTrigger>
                    <TabsTrigger value="payroll">Payroll</TabsTrigger>
                </TabsList>
                <TabsContent value="position">
                    <CrudManager 
                        title="Position" 
                        description="Manage job positions in your company." 
                        type="position"
                        fetchData={fetchPositions}
                        createItem={createPosition}
                        updateItem={updatePosition}
                        deleteItem={deletePosition}
                    />
                </TabsContent>
                <TabsContent value="grade">
                    <CrudManager 
                        title="Grade" 
                        description="Manage employee grade levels." 
                        type="grade"
                        fetchData={fetchGrades}
                        createItem={createGrade}
                        updateItem={updateGrade}
                        deleteItem={deleteGrade}
                    />
                </TabsContent>
                <TabsContent value="branch">
                    <CrudManager 
                        title="Branch" 
                        description="Manage your company's branches." 
                        type="branch"
                        fetchData={fetchBranches}
                        createItem={createBranch}
                        updateItem={updateBranch}
                        deleteItem={deleteBranch}
                        showAddress={true}
                        showTimezone={true}
                    />
                </TabsContent>
                <TabsContent value="leave-types">
                    <LeaveTypeManager />
                </TabsContent>
                <TabsContent value="leave-quota">
                    <LeaveQuotaManager />
                </TabsContent>
                <TabsContent value="payroll">
                    <PayrollSettingsManager />
                </TabsContent>
            </Tabs>
        </div>
    );
}
