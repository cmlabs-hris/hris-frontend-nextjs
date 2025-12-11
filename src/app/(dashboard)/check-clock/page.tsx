'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import CheckClockTable from "@/components/check-clock/CheckClockTable";

export default function CheckClockPage() {
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <CardTitle>Check Clock Overview</CardTitle>
                        <CardDescription>View and manage employee attendance records.</CardDescription>
                    </div>
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search employee, position, branch..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <CheckClockTable searchQuery={searchQuery} />
            </CardContent>
        </Card>
    );
}

