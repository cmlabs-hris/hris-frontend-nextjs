import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Users, CalendarCheck, DollarSign } from "lucide-react";

// Data fiktif untuk jenis-jenis laporan
const reportTypes = [
    {
        icon: CalendarCheck,
        title: "Monthly Attendance Report",
        description: "Generate a detailed attendance summary for all employees for a selected month.",
    },
    {
        icon: DollarSign,
        title: "Employee Payroll Summary",
        description: "View and download the payroll summary, including salaries, bonuses, and deductions.",
    },
    {
        icon: Users,
        title: "Leave Balance Report",
        description: "Get an overview of the remaining leave balance for all employees.",
    },
     {
        icon: FileText,
        title: "New Hire Report",
        description: "List all new employees who joined within a specific date range.",
    },
];

export default function ReportsPage() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Report Center</CardTitle>
                    <CardDescription>
                        Generate and download various reports for your organization.
                    </CardDescription>
                </CardHeader>
            </Card>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {reportTypes.map((report) => (
                    <Card key={report.title} className="flex flex-col">
                        <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                            <div className="rounded-full border p-2 bg-muted/50">
                                <report.icon className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div>
                                <CardTitle>{report.title}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <p className="text-sm text-muted-foreground">
                                {report.description}
                            </p>
                        </CardContent>
                        <div className="p-6 pt-0">
                             <Button className="w-full">
                                <Download className="mr-2 h-4 w-4" />
                                Generate Report
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
