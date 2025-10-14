import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import AttendanceForm from "@/components/attendance/AttendanceForm";

export default function AttendancePage() {
    return (
        <Card className="max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle>Add Checkclock</CardTitle>
                <CardDescription>Submit your attendance request, such as annual leave or sick leave.</CardDescription>
            </CardHeader>
            <CardContent>
                <AttendanceForm />
            </CardContent>
        </Card>
    );
}
