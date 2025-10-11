import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import CheckClockTable from "@/components/check-clock/CheckClockTable";

export default function CheckClockPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Check Clock Overview</CardTitle>
                <CardDescription>View and manage employee attendance records.</CardDescription>
            </CardHeader>
            <CardContent>
                <CheckClockTable />
            </CardContent>
        </Card>
    );
}
