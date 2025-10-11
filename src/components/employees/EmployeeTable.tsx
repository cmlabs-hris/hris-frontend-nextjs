'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

// Definisikan tipe untuk data karyawan
interface Employee {
    id: number;
    name: string;
    gender: string;
    phone: string;
    branch: string;
    position: string;
    status: string;
}

// Komponen sekarang hanya menerima 'employees' sebagai prop
export default function EmployeeTable({ employees }: { employees: Employee[] }) {
    return (
        <div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader className="bg-slate-100">
                        <TableRow>
                            <TableHead className="w-[80px]">No</TableHead>
                            <TableHead className="w-[100px]">Avatar</TableHead>
                            <TableHead>Nama</TableHead>
                            <TableHead>Jenis Kelamin</TableHead>
                            <TableHead>No. Telp</TableHead>
                            <TableHead>Cabang</TableHead>
                            <TableHead>Jabatan</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {employees.map((employee, index) => (
                            <TableRow key={employee.id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>
                                    <Avatar>
                                        <AvatarImage src={`https://i.pravatar.cc/40?u=${employee.id}`} alt={employee.name} />
                                        <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                </TableCell>
                                <TableCell className="font-medium">{employee.name}</TableCell>
                                <TableCell>
                                    <Badge variant={employee.gender === "Perempuan" ? "destructive" : "secondary"}>
                                        {employee.gender}
                                    </Badge>
                                </TableCell>
                                <TableCell>{employee.phone}</TableCell>
                                <TableCell>{employee.branch}</TableCell>
                                <TableCell>{employee.position}</TableCell>
                                <TableCell>
                                     <Badge variant={employee.status === "Active" ? "default" : "outline"}>
                                        {employee.status}
                                     </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Open menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>View Details</DropdownMenuItem>
                                            <DropdownMenuItem>Edit</DropdownMenuItem>
                                            <DropdownMenuItem className="text-red-500">Delete</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            {/* Paginasi */}
            <div className="flex items-center justify-between mt-4">
                 <div className="text-sm text-muted-foreground">
                    Showing 1 to {employees.length} of {employees.length} results
                </div>
                <Pagination>
                    <PaginationContent>
                        <PaginationItem><PaginationPrevious href="#" /></PaginationItem>
                        <PaginationItem><PaginationLink href="#" isActive>1</PaginationLink></PaginationItem>
                        <PaginationItem><PaginationNext href="#" /></PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </div>
    );
}

