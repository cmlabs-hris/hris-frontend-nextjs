'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Edit, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ApiResponse } from '@/lib/api';

export interface MasterDataItem {
    id: string;
    name: string;
    address?: string;
    timezone?: string;
    description?: string;
}

export interface CrudManagerProps {
    title: string;
    description: string;
    type: 'branch' | 'grade' | 'position';
    fetchData: () => Promise<ApiResponse<MasterDataItem[]>>;
    createItem: (data: { name: string; address?: string; timezone?: string; description?: string }) => Promise<ApiResponse<MasterDataItem>>;
    updateItem: (id: string, data: { name: string; address?: string; timezone?: string; description?: string }) => Promise<ApiResponse<MasterDataItem>>;
    deleteItem: (id: string) => Promise<ApiResponse<null>>;
    showAddress?: boolean;
    showTimezone?: boolean;
}

export default function CrudManager({ 
    title, 
    description, 
    type,
    fetchData, 
    createItem, 
    updateItem, 
    deleteItem,
    showAddress = false,
    showTimezone = false,
}: CrudManagerProps) {
    const { toast } = useToast();
    const [data, setData] = useState<MasterDataItem[]>([]);
    const [currentItem, setCurrentItem] = useState<MasterDataItem | null>(null);
    const [isAddDialogOpen, setAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setEditDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    
    // Form states
    const [formName, setFormName] = useState("");
    const [formAddress, setFormAddress] = useState("");
    const [formTimezone, setFormTimezone] = useState("");

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetchData();
            if (response.success && response.data) {
                setData(response.data);
            } else {
                toast({
                    title: "Error",
                    description: response.error?.message || "Failed to load data",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load data. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }, [fetchData, toast]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const resetForm = () => {
        setFormName("");
        setFormAddress("");
        setFormTimezone("");
    };

    const handleAddItem = async () => {
        if (!formName.trim()) return;
        setIsSaving(true);
        try {
            const payload: { name: string; address?: string; timezone?: string } = { 
                name: formName.trim() 
            };
            if (showAddress && formAddress.trim()) {
                payload.address = formAddress.trim();
            }
            if (showTimezone && formTimezone.trim()) {
                payload.timezone = formTimezone.trim();
            }
            
            const response = await createItem(payload);
            if (response.success) {
                toast({
                    title: "Success",
                    description: `${title} created successfully`,
                });
                resetForm();
                setAddDialogOpen(false);
                loadData();
            } else {
                toast({
                    title: "Error",
                    description: response.error?.message || "Failed to create item",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to create item. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleEditItem = async () => {
        if (!currentItem || !formName.trim()) return;
        setIsSaving(true);
        try {
            const payload: { name: string; address?: string; timezone?: string } = { 
                name: formName.trim() 
            };
            if (showAddress) {
                payload.address = formAddress.trim() || undefined;
            }
            if (showTimezone) {
                payload.timezone = formTimezone.trim() || undefined;
            }
            
            const response = await updateItem(currentItem.id, payload);
            if (response.success) {
                toast({
                    title: "Success",
                    description: `${title} updated successfully`,
                });
                resetForm();
                setEditDialogOpen(false);
                setCurrentItem(null);
                loadData();
            } else {
                toast({
                    title: "Error",
                    description: response.error?.message || "Failed to update item",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update item. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleDeleteItem = async (id: string) => {
        setIsDeleting(id);
        try {
            const response = await deleteItem(id);
            if (response.success) {
                toast({
                    title: "Success",
                    description: `${title} deleted successfully`,
                });
                loadData();
            } else {
                toast({
                    title: "Error",
                    description: response.error?.message || "Failed to delete item",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete item. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsDeleting(null);
        }
    };

    const openEditDialog = (item: MasterDataItem) => {
        setCurrentItem(item);
        setFormName(item.name);
        setFormAddress(item.address || "");
        setFormTimezone(item.timezone || "");
        setEditDialogOpen(true);
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={(open) => { 
                    setAddDialogOpen(open); 
                    if (!open) resetForm(); 
                }}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="gap-1">
                            <PlusCircle className="h-4 w-4" />
                            <span>Add New</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New {title}</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">Name</Label>
                                <Input 
                                    id="name" 
                                    value={formName} 
                                    onChange={(e) => setFormName(e.target.value)} 
                                    className="col-span-3" 
                                    placeholder="Enter name"
                                />
                            </div>
                            {showAddress && (
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="address" className="text-right">Address</Label>
                                    <Textarea 
                                        id="address" 
                                        value={formAddress} 
                                        onChange={(e) => setFormAddress(e.target.value)} 
                                        className="col-span-3" 
                                        placeholder="Enter address (optional)"
                                    />
                                </div>
                            )}
                            {showTimezone && (
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="timezone" className="text-right">Timezone</Label>
                                    <Input 
                                        id="timezone" 
                                        value={formTimezone} 
                                        onChange={(e) => setFormTimezone(e.target.value)} 
                                        className="col-span-3" 
                                        placeholder="e.g., Asia/Jakarta"
                                    />
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button onClick={handleAddItem} disabled={isSaving || !formName.trim()}>
                                {isSaving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    'Save'
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                        <p>No data found</p>
                        <p className="text-sm">Click "Add New" to create your first {title.toLowerCase()}</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                {showAddress && <TableHead>Address</TableHead>}
                                {showTimezone && <TableHead>Timezone</TableHead>}
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map(item => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    {showAddress && <TableCell>{item.address || '-'}</TableCell>}
                                    {showTimezone && <TableCell>{item.timezone || '-'}</TableCell>}
                                    <TableCell className="text-right">
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => openEditDialog(item)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>

                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="text-red-500 hover:text-red-600"
                                                    disabled={isDeleting === item.id}
                                                >
                                                    {isDeleting === item.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete &quot;{item.name}&quot;.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteItem(item.id)}>
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={(open) => { 
                setEditDialogOpen(open); 
                if (!open) {
                    setCurrentItem(null);
                    resetForm();
                }
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit {title}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name-edit" className="text-right">Name</Label>
                            <Input 
                                id="name-edit" 
                                value={formName} 
                                onChange={(e) => setFormName(e.target.value)} 
                                className="col-span-3" 
                                placeholder="Enter name"
                            />
                        </div>
                        {showAddress && (
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="address-edit" className="text-right">Address</Label>
                                <Textarea 
                                    id="address-edit" 
                                    value={formAddress} 
                                    onChange={(e) => setFormAddress(e.target.value)} 
                                    className="col-span-3" 
                                    placeholder="Enter address (optional)"
                                />
                            </div>
                        )}
                        {showTimezone && (
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="timezone-edit" className="text-right">Timezone</Label>
                                <Input 
                                    id="timezone-edit" 
                                    value={formTimezone} 
                                    onChange={(e) => setFormTimezone(e.target.value)} 
                                    className="col-span-3" 
                                    placeholder="e.g., Asia/Jakarta"
                                />
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button onClick={handleEditItem} disabled={isSaving || !formName.trim()}>
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
