import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bell, Check, Briefcase } from "lucide-react";

// Data fiktif 
const allNotifications = [
    { id: 1, icon: Check, title: "Attendance Approved", description: "Your attendance for Oct 14 has been approved.", time: "5 min ago", read: false },
    { id: 2, icon: Briefcase, title: "New Task Assigned", description: "You have a new task in the 'Employee Onboarding' project.", time: "1 hour ago", read: false },
    { id: 3, icon: Check, title: "Leave Request Approved", description: "Your leave request for Oct 20-22 has been approved.", time: "Yesterday", read: true },
    { id: 4, icon: Bell, title: "Company Announcement", description: "Please check the new policy regarding work from home.", time: "2 days ago", read: true },
    { id: 5, icon: Check, title: "Attendance Approved", description: "Your attendance for Oct 11 has been approved.", time: "3 days ago", read: true },
];

export default function NotificationsPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>All Notifications</CardTitle>
                <CardDescription>Here is a list of all your past notifications.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {allNotifications.map((notification) => (
                        <div key={notification.id} className="flex items-start gap-4 p-4 border rounded-lg">
                             <notification.icon className={`h-6 w-6 mt-1 flex-shrink-0 ${notification.read ? 'text-muted-foreground' : 'text-primary'}`} />
                             <div className="flex-1">
                                <p className={`font-semibold ${notification.read ? 'text-muted-foreground' : 'text-foreground'}`}>{notification.title}</p>
                                <p className="text-sm text-muted-foreground">{notification.description}</p>
                                <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                            </div>
                            {!notification.read && <span className="h-2 w-2 rounded-full bg-primary mt-2"></span>}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
