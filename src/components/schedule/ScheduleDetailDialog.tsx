'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock, MapPin, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { WorkSchedule, WorkScheduleTime, WorkScheduleLocation, scheduleApi, ApiError } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface ScheduleDetailDialogProps {
    schedule: WorkSchedule;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onRefresh: () => void;
}

const DAYS_OF_WEEK = [
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
    { value: 7, label: 'Sunday' }
];

const getDayLabel = (dayOfWeek: number) => {
    return DAYS_OF_WEEK.find(d => d.value === dayOfWeek)?.label || `Day ${dayOfWeek}`;
};

const formatTime = (time: string) => {
    return time.substring(0, 5); // HH:MM
};

const getWorkArrangementBadge = (type: string) => {
    switch (type) {
        case 'WFO':
            return <Badge variant="default">WFO</Badge>;
        case 'WFA':
            return <Badge variant="secondary">WFA</Badge>;
        case 'Hybrid':
            return <Badge variant="outline">Hybrid</Badge>;
        default:
            return <Badge variant="outline">{type}</Badge>;
    }
};

// Add/Edit Time Form
function TimeForm({ 
    scheduleId,
    existingTime,
    existingDays,
    onSuccess,
    onCancel 
}: { 
    scheduleId: string;
    existingTime?: WorkScheduleTime;
    existingDays: number[];
    onSuccess: () => void;
    onCancel: () => void;
}) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [dayOfWeek, setDayOfWeek] = useState(existingTime?.day_of_week || 1);
    const [clockInTime, setClockInTime] = useState(existingTime?.clock_in_time?.substring(0, 5) || '09:00');
    const [clockOutTime, setClockOutTime] = useState(existingTime?.clock_out_time?.substring(0, 5) || '17:00');
    const [isNextDayCheckout, setIsNextDayCheckout] = useState(existingTime?.is_next_day_checkout || false);
    const [locationType, setLocationType] = useState(existingTime?.location_type || 'WFO');

    const availableDays = existingTime 
        ? DAYS_OF_WEEK 
        : DAYS_OF_WEEK.filter(d => !existingDays.includes(d.value));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        
        try {
            if (existingTime) {
                await scheduleApi.updateTime(existingTime.id, {
                    day_of_week: dayOfWeek,
                    clock_in_time: clockInTime,
                    clock_out_time: clockOutTime,
                    is_next_day_checkout: isNextDayCheckout,
                    location_type: locationType
                });
                toast({ title: "Success", description: "Schedule time updated" });
            } else {
                await scheduleApi.createTime({
                    work_schedule_id: scheduleId,
                    day_of_week: dayOfWeek,
                    clock_in_time: clockInTime,
                    clock_out_time: clockOutTime,
                    is_next_day_checkout: isNextDayCheckout,
                    location_type: locationType
                });
                toast({ title: "Success", description: "Schedule time added" });
            }
            onSuccess();
        } catch (err) {
            const apiError = err as ApiError;
            toast({ 
                title: "Error", 
                description: apiError.message || "Failed to save schedule time",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-muted/50">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Day</Label>
                    <Select value={dayOfWeek.toString()} onValueChange={(v) => setDayOfWeek(parseInt(v))}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {availableDays.map(day => (
                                <SelectItem key={day.value} value={day.value.toString()}>
                                    {day.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Location Type</Label>
                    <Select value={locationType} onValueChange={setLocationType}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="WFO">WFO (Work From Office)</SelectItem>
                            <SelectItem value="WFA">WFA (Work From Anywhere)</SelectItem>
                            <SelectItem value="Hybrid">Hybrid</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Clock In Time</Label>
                    <Input type="time" value={clockInTime} onChange={(e) => setClockInTime(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label>Clock Out Time</Label>
                    <Input type="time" value={clockOutTime} onChange={(e) => setClockOutTime(e.target.value)} />
                </div>
            </div>
            <div className="flex items-center space-x-2">
                <input
                    type="checkbox"
                    id="isNextDayCheckout"
                    checked={isNextDayCheckout}
                    onChange={(e) => setIsNextDayCheckout(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="isNextDayCheckout" className="text-sm font-normal">
                    Clock out is on the next day (overnight shift)
                </Label>
            </div>
            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
                <Button type="submit" size="sm" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {existingTime ? 'Update' : 'Add'}
                </Button>
            </div>
        </form>
    );
}

// Add/Edit Location Form
function LocationForm({ 
    scheduleId,
    existingLocation,
    onSuccess,
    onCancel 
}: { 
    scheduleId: string;
    existingLocation?: WorkScheduleLocation;
    onSuccess: () => void;
    onCancel: () => void;
}) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [locationName, setLocationName] = useState(existingLocation?.location_name || '');
    const [latitude, setLatitude] = useState(existingLocation?.latitude?.toString() || '');
    const [longitude, setLongitude] = useState(existingLocation?.longitude?.toString() || '');
    const [radius, setRadius] = useState(existingLocation?.radius_meters?.toString() || '100');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!locationName.trim()) {
            toast({ title: "Error", description: "Location name is required", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        
        try {
            const data = {
                location_name: locationName.trim(),
                latitude: latitude ? parseFloat(latitude) : 0,
                longitude: longitude ? parseFloat(longitude) : 0,
                radius_meters: radius ? parseInt(radius) : 100
            };

            if (existingLocation) {
                await scheduleApi.updateLocation(existingLocation.id, data);
                toast({ title: "Success", description: "Location updated" });
            } else {
                await scheduleApi.createLocation({
                    work_schedule_id: scheduleId,
                    ...data
                });
                toast({ title: "Success", description: "Location added" });
            }
            onSuccess();
        } catch (err) {
            const apiError = err as ApiError;
            toast({ 
                title: "Error", 
                description: apiError.message || "Failed to save location",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleGetCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLatitude(position.coords.latitude.toString());
                    setLongitude(position.coords.longitude.toString());
                },
                () => {
                    toast({ title: "Error", description: "Failed to get current location", variant: "destructive" });
                }
            );
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-muted/50">
            <div className="space-y-2">
                <Label>Location Name</Label>
                <Input 
                    placeholder="e.g., Main Office" 
                    value={locationName} 
                    onChange={(e) => setLocationName(e.target.value)} 
                />
            </div>
            <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label>Latitude</Label>
                    <Input 
                        type="number" 
                        step="any"
                        placeholder="-6.2088" 
                        value={latitude} 
                        onChange={(e) => setLatitude(e.target.value)} 
                    />
                </div>
                <div className="space-y-2">
                    <Label>Longitude</Label>
                    <Input 
                        type="number" 
                        step="any"
                        placeholder="106.8456" 
                        value={longitude} 
                        onChange={(e) => setLongitude(e.target.value)} 
                    />
                </div>
                <div className="space-y-2">
                    <Label>Radius (m)</Label>
                    <Input 
                        type="number" 
                        min="1"
                        value={radius} 
                        onChange={(e) => setRadius(e.target.value)} 
                    />
                </div>
            </div>
            <div className="flex justify-between">
                <Button type="button" variant="outline" size="sm" onClick={handleGetCurrentLocation}>
                    <MapPin className="mr-2 h-4 w-4" />
                    Use Current Location
                </Button>
                <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
                    <Button type="submit" size="sm" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {existingLocation ? 'Update' : 'Add'}
                    </Button>
                </div>
            </div>
        </form>
    );
}

export default function ScheduleDetailDialog({ schedule, open, onOpenChange, onRefresh }: ScheduleDetailDialogProps) {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState('times');
    const [showTimeForm, setShowTimeForm] = useState(false);
    const [editingTime, setEditingTime] = useState<WorkScheduleTime | undefined>();
    const [showLocationForm, setShowLocationForm] = useState(false);
    const [editingLocation, setEditingLocation] = useState<WorkScheduleLocation | undefined>();

    const existingDays = schedule.times?.map(t => t.day_of_week) || [];

    const handleDeleteTime = async (timeId: string) => {
        try {
            await scheduleApi.deleteTime(timeId);
            toast({ title: "Success", description: "Schedule time deleted" });
            onRefresh();
        } catch (err) {
            const apiError = err as ApiError;
            toast({ 
                title: "Error", 
                description: apiError.message || "Failed to delete schedule time",
                variant: "destructive"
            });
        }
    };

    const handleDeleteLocation = async (locationId: string) => {
        try {
            await scheduleApi.deleteLocation(locationId);
            toast({ title: "Success", description: "Location deleted" });
            onRefresh();
        } catch (err) {
            const apiError = err as ApiError;
            toast({ 
                title: "Error", 
                description: apiError.message || "Failed to delete location",
                variant: "destructive"
            });
        }
    };

    const handleTimeSuccess = () => {
        setShowTimeForm(false);
        setEditingTime(undefined);
        onRefresh();
    };

    const handleLocationSuccess = () => {
        setShowLocationForm(false);
        setEditingLocation(undefined);
        onRefresh();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {schedule.name}
                        {getWorkArrangementBadge(schedule.type)}
                    </DialogTitle>
                    <DialogDescription>
                        Grace period: {schedule.grace_period_minutes} minutes
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="times" className="gap-2">
                            <Clock className="h-4 w-4" />
                            Schedule Times
                        </TabsTrigger>
                        <TabsTrigger value="locations" className="gap-2">
                            <MapPin className="h-4 w-4" />
                            Locations
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="times" className="space-y-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-base">Working Hours</CardTitle>
                                        <CardDescription>Configure working hours for each day</CardDescription>
                                    </div>
                                    {!showTimeForm && !editingTime && existingDays.length < 7 && (
                                        <Button size="sm" onClick={() => setShowTimeForm(true)}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Time
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {(showTimeForm || editingTime) && (
                                    <TimeForm
                                        scheduleId={schedule.id}
                                        existingTime={editingTime}
                                        existingDays={existingDays}
                                        onSuccess={handleTimeSuccess}
                                        onCancel={() => {
                                            setShowTimeForm(false);
                                            setEditingTime(undefined);
                                        }}
                                    />
                                )}
                                
                                {schedule.times && schedule.times.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Day</TableHead>
                                                <TableHead>Clock In</TableHead>
                                                <TableHead>Clock Out</TableHead>
                                                <TableHead>Location Type</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {schedule.times
                                                .sort((a, b) => a.day_of_week - b.day_of_week)
                                                .map((time) => (
                                                    <TableRow key={time.id}>
                                                        <TableCell className="font-medium">
                                                            {time.day_name || getDayLabel(time.day_of_week)}
                                                        </TableCell>
                                                        <TableCell>{formatTime(time.clock_in_time)}</TableCell>
                                                        <TableCell>
                                                            {formatTime(time.clock_out_time)}
                                                            {time.is_next_day_checkout && (
                                                                <span className="text-xs text-muted-foreground ml-1">(+1)</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline">{time.location_type}</Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end gap-1">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8"
                                                                    onClick={() => {
                                                                        setShowTimeForm(false);
                                                                        setEditingTime(time);
                                                                    }}
                                                                >
                                                                    <Pencil className="h-4 w-4" />
                                                                </Button>
                                                                <AlertDialog>
                                                                    <AlertDialogTrigger asChild>
                                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </Button>
                                                                    </AlertDialogTrigger>
                                                                    <AlertDialogContent>
                                                                        <AlertDialogHeader>
                                                                            <AlertDialogTitle>Delete Schedule Time</AlertDialogTitle>
                                                                            <AlertDialogDescription>
                                                                                Are you sure you want to delete the schedule time for {getDayLabel(time.day_of_week)}?
                                                                            </AlertDialogDescription>
                                                                        </AlertDialogHeader>
                                                                        <AlertDialogFooter>
                                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                            <AlertDialogAction 
                                                                                onClick={() => handleDeleteTime(time.id)}
                                                                                className="bg-destructive text-destructive-foreground"
                                                                            >
                                                                                Delete
                                                                            </AlertDialogAction>
                                                                        </AlertDialogFooter>
                                                                    </AlertDialogContent>
                                                                </AlertDialog>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <p className="text-center text-muted-foreground py-4">
                                        No schedule times configured
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="locations" className="space-y-4">
                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-base">Work Locations</CardTitle>
                                        <CardDescription>Configure allowed work locations with geofencing</CardDescription>
                                    </div>
                                    {!showLocationForm && !editingLocation && (
                                        <Button size="sm" onClick={() => setShowLocationForm(true)}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Location
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {(showLocationForm || editingLocation) && (
                                    <LocationForm
                                        scheduleId={schedule.id}
                                        existingLocation={editingLocation}
                                        onSuccess={handleLocationSuccess}
                                        onCancel={() => {
                                            setShowLocationForm(false);
                                            setEditingLocation(undefined);
                                        }}
                                    />
                                )}
                                
                                {schedule.locations && schedule.locations.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Name</TableHead>
                                                <TableHead>Coordinates</TableHead>
                                                <TableHead>Radius</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {schedule.locations.map((location) => (
                                                <TableRow key={location.id}>
                                                    <TableCell className="font-medium">{location.location_name}</TableCell>
                                                    <TableCell>
                                                        {location.latitude && location.longitude ? (
                                                            <span className="text-sm">
                                                                {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                                                            </span>
                                                        ) : (
                                                            <span className="text-muted-foreground">Not set</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>{location.radius_meters}m</TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8"
                                                                onClick={() => {
                                                                    setShowLocationForm(false);
                                                                    setEditingLocation(location);
                                                                }}
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Delete Location</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            Are you sure you want to delete "{location.location_name}"?
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                        <AlertDialogAction 
                                                                            onClick={() => handleDeleteLocation(location.id)}
                                                                            className="bg-destructive text-destructive-foreground"
                                                                        >
                                                                            Delete
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <p className="text-center text-muted-foreground py-4">
                                        No locations configured
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
