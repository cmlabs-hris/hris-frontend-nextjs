'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';

interface DataItem {
    id: number;
    name: string;
}

interface CrudManagerProps {
    title: string;
    description: string;
    initialData: DataItem[];
}

export default function CrudManager({ title, description, initialData }: CrudManagerProps) {
    const [data, setData] = useState<DataItem[]>(initialData);
    const [currentItem, setCurrentItem] = useState<DataItem | null>(null);
    const [isAddDialogOpen, setAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setEditDialogOpen] = useState(false);
    const [newItemName, setNewItemName] = useState("");

    const handleAddItem = () => {
        if (!newItemName.trim()) return;
        const newItem = { id: Date.now(), name: newItemName.trim() };
        setData([...data, newItem]);
        setNewItemName("");
        setAddDialogOpen(false);
    };

    const handleEditItem = () => {
        if (!currentItem || !newItemName.trim()) return;
        setData(data.map(item => item.id === currentItem.id ? { ...item, name: newItemName.trim() } : item));
        setNewItemName("");
        setEditDialogOpen(false);
        setCurrentItem(null);
    };
    
    const handleDeleteItem = (id: number) => {
        setData(data.filter(item => item.id !== id));
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setAddDialogOpen}>
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
                                <Input id="name" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} className="col-span-3" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleAddItem}>Save</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map(item => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell className="text-right">
                                    <Dialog open={isEditDialogOpen && currentItem?.id === item.id} onOpenChange={(open) => { if(!open) setCurrentItem(null); setEditDialogOpen(open); }}>
                                        <DialogTrigger asChild>
                                            <Button variant="ghost" size="icon" onClick={() => { setCurrentItem(item); setNewItemName(item.name); setEditDialogOpen(true); }}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader><DialogTitle>Edit {title}</DialogTitle></DialogHeader>
                                            <div className="grid gap-4 py-4"><div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="name-edit" className="text-right">Name</Label><Input id="name-edit" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} className="col-span-3" /></div></div>
                                            <DialogFooter><Button onClick={handleEditItem}>Save Changes</Button></DialogFooter>
                                        </DialogContent>
                                    </Dialog>

                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. This will permanently delete the item.</AlertDialogDescription></AlertDialogHeader>
                                            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteItem(item.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
