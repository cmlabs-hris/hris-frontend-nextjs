'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import CrudManager, { MasterDataItem } from "@/components/settings/CrudManager";
import { masterApi, ApiResponse, Branch, Grade, Position } from "@/lib/api";

export default function CompanySettingsPage() {
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
            <Card>
                <CardHeader>
                    <CardTitle>Company Settings</CardTitle>
                    <CardDescription>
                        Manage master data used across the application, such as job positions, branches, and grades.
                    </CardDescription>
                </CardHeader>   
            </Card>

            <Tabs defaultValue="position" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="position">Position</TabsTrigger>
                    <TabsTrigger value="grade">Grade</TabsTrigger>
                    <TabsTrigger value="branch">Branch</TabsTrigger>
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
            </Tabs>
        </div>
    );
}
