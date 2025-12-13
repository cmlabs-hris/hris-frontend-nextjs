import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import AttendanceForm from "@/components/attendance/AttendanceForm";

export default function AttendancePage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Attendance</h1>
                <p className="text-muted-foreground">Clock in or clock out with photo proof and location.</p>
            </div>
            <AttendanceForm />
        </div>
    );
}
