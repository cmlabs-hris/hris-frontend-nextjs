import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MessageSquare } from "lucide-react";

export default function ContactServicePage() {
    return (
        <div className="grid gap-6 md:grid-cols-2">
            {/* Kolom Informasi Kontak */}
            <Card>
                <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                    <CardDescription>
                        Reach out to us through any of the following channels. We&apos;re here to help!
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                        <Mail className="h-6 w-6 text-muted-foreground" />
                        <div>
                            <p className="font-semibold">Email Support</p>
                            <a href="mailto:support@hris.com" className="text-sm text-blue-600 hover:underline">
                                support@hris.com
                            </a>
                        </div>
                    </div>
                     <div className="flex items-center gap-4">
                        <Phone className="h-6 w-6 text-muted-foreground" />
                        <div>
                            <p className="font-semibold">Phone Support</p>
                            <p className="text-sm text-muted-foreground">+62 812 3456 7890</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-4">
                        <MessageSquare className="h-6 w-6 text-muted-foreground" />
                        <div>
                            <p className="font-semibold">Live Chat</p>
                            <p className="text-sm text-muted-foreground">Available Mon-Fri, 9am - 5pm</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Kolom Formulir Pesan */}
            <Card>
                <CardHeader>
                    <CardTitle>Send us a Message</CardTitle>
                    <CardDescription>
                        Have a specific question? Fill out the form below.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="space-y-4">
                        <Input placeholder="Your Name" required />
                        <Input type="email" placeholder="Your Email" required />
                         <Select>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a subject" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="technical">Technical Issue</SelectItem>
                                <SelectItem value="billing">Billing Inquiry</SelectItem>
                                <SelectItem value="feedback">Feedback</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                        <Textarea placeholder="Type your message here..." required rows={5} />
                        <Button type="submit" className="w-full">Send Message</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
