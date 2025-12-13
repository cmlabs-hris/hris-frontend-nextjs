'use client'

import React, { useState, useRef, useEffect } from "react"
import dynamic from "next/dynamic"
import { Camera, Loader2, MapPin, Clock, CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from '@/hooks/use-toast'
import { attendanceApi, ClockInRequest, ClockOutRequest } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'

// Dynamic import map to avoid SSR issues
const AttendanceMap = dynamic(() => import('./AttendanceMap'), { 
    ssr: false,
    loading: () => (
        <div className="h-full w-full bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Loading map...</p>
        </div>
    )
})

interface LocationData {
    latitude: number
    longitude: number
    address?: string
    accuracy?: number
}

export default function AttendanceForm() {
    const { user } = useAuth()
    const { toast } = useToast()
    
    // State
    const [isLoading, setIsLoading] = useState(false)
    const [isGettingLocation, setIsGettingLocation] = useState(false)
    const [location, setLocation] = useState<LocationData | null>(null)
    const [locationError, setLocationError] = useState<string | null>(null)
    const [photo, setPhoto] = useState<File | null>(null)
    const [photoPreview, setPhotoPreview] = useState<string | null>(null)
    const [isCapturing, setIsCapturing] = useState(false)
    const [stream, setStream] = useState<MediaStream | null>(null)
    
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Get current location on mount
    useEffect(() => {
        getCurrentLocation()
        return () => {
            // Cleanup camera stream
            if (stream) {
                stream.getTracks().forEach(track => track.stop())
            }
        }
    }, [])

    // Get current geolocation
    const getCurrentLocation = () => {
        setIsGettingLocation(true)
        setLocationError(null)

        if (!navigator.geolocation) {
            setLocationError('Geolocation is not supported by your browser')
            setIsGettingLocation(false)
            return
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude, accuracy } = position.coords
                setLocation({
                    latitude,
                    longitude,
                    accuracy
                })
                setIsGettingLocation(false)
            },
            (error) => {
                let message = 'Unable to get your location'
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        message = 'Location permission denied. Please enable location access.'
                        break
                    case error.POSITION_UNAVAILABLE:
                        message = 'Location information is unavailable.'
                        break
                    case error.TIMEOUT:
                        message = 'Location request timed out.'
                        break
                }
                setLocationError(message)
                setIsGettingLocation(false)
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        )
    }

    // Start camera capture
    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: 640, height: 480 }
            })
            setStream(mediaStream)
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream
            }
            setIsCapturing(true)
        } catch (error) {
            console.error('Camera error:', error)
            toast({
                title: "Camera Error",
                description: "Unable to access camera. Please check permissions.",
                variant: "destructive",
            })
        }
    }

    // Capture photo from camera
    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return

        const video = videoRef.current
        const canvas = canvasRef.current
        const context = canvas.getContext('2d')

        if (context) {
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
            context.drawImage(video, 0, 0)

            canvas.toBlob((blob) => {
                if (blob) {
                    const file = new File([blob], `attendance_${Date.now()}.jpg`, { type: 'image/jpeg' })
                    setPhoto(file)
                    setPhotoPreview(canvas.toDataURL('image/jpeg'))
                }
            }, 'image/jpeg', 0.8)
        }

        // Stop camera after capture
        stopCamera()
    }

    // Stop camera
    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop())
            setStream(null)
        }
        setIsCapturing(false)
    }

    // Handle file upload
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            // Validate file type
            if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
                toast({
                    title: "Invalid File",
                    description: "Only JPG, JPEG, and PNG files are allowed.",
                    variant: "destructive",
                })
                return
            }
            // Validate file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                toast({
                    title: "File Too Large",
                    description: "Photo size must not exceed 10MB.",
                    variant: "destructive",
                })
                return
            }

            setPhoto(file)
            setPhotoPreview(URL.createObjectURL(file))
        }
    }

    // Clear photo
    const clearPhoto = () => {
        setPhoto(null)
        setPhotoPreview(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    // Handle Clock In
    const handleClockIn = async () => {
        if (!location || !photo || !user?.employee_id) {
            toast({
                title: "Missing Information",
                description: "Please ensure location and photo are captured.",
                variant: "destructive",
            })
            return
        }

        setIsLoading(true)
        try {
            const data: ClockInRequest = {
                employee_id: user.employee_id,
                latitude: location.latitude,
                longitude: location.longitude,
            }

            const response = await attendanceApi.clockIn(data, photo)
            if (response.success) {
                toast({
                    title: "Clock In Successful",
                    description: `You have clocked in at ${new Date().toLocaleTimeString()}`,
                })
                // Reset form
                clearPhoto()
            } else {
                throw new Error(response.error?.message || 'Clock in failed')
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to clock in'
            toast({
                title: "Clock In Failed",
                description: errorMessage,
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    // Handle Clock Out
    const handleClockOut = async () => {
        if (!location || !photo || !user?.employee_id) {
            toast({
                title: "Missing Information",
                description: "Please ensure location and photo are captured.",
                variant: "destructive",
            })
            return
        }

        setIsLoading(true)
        try {
            const data: ClockOutRequest = {
                employee_id: user.employee_id,
                latitude: location.latitude,
                longitude: location.longitude,
            }

            const response = await attendanceApi.clockOut(data, photo)
            if (response.success) {
                toast({
                    title: "Clock Out Successful",
                    description: `You have clocked out at ${new Date().toLocaleTimeString()}`,
                })
                // Reset form
                clearPhoto()
            } else {
                throw new Error(response.error?.message || 'Clock out failed')
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to clock out'
            toast({
                title: "Clock Out Failed",
                description: errorMessage,
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const currentPosition: [number, number] = location 
        ? [location.latitude, location.longitude] 
        : [-7.9766, 112.631] // Default to Malang

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Photo Capture */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Camera className="h-5 w-5" />
                        Photo Proof
                    </CardTitle>
                    <CardDescription>
                        Take a selfie or upload a photo for attendance proof
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Camera/Photo Preview */}
                    <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                        {isCapturing ? (
                            <>
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                    <Button onClick={capturePhoto} size="lg">
                                        <Camera className="h-5 w-5 mr-2" />
                                        Capture
                                    </Button>
                                    <Button onClick={stopCamera} variant="outline" size="lg">
                                        Cancel
                                    </Button>
                                </div>
                            </>
                        ) : photoPreview ? (
                            <>
                                <img
                                    src={photoPreview}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                />
                                <Button
                                    onClick={clearPhoto}
                                    variant="destructive"
                                    size="sm"
                                    className="absolute top-2 right-2"
                                >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Remove
                                </Button>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full gap-4 p-4">
                                <Camera className="h-16 w-16 text-gray-400" />
                                <p className="text-gray-500 text-center">No photo captured</p>
                                <div className="flex gap-2">
                                    <Button onClick={startCamera} variant="outline">
                                        <Camera className="h-4 w-4 mr-2" />
                                        Take Photo
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        Upload
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                    <canvas ref={canvasRef} className="hidden" />
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                        onChange={handleFileChange}
                        className="hidden"
                    />

                    {photo && (
                        <div className="flex items-center gap-2 text-sm text-green-600">
                            <CheckCircle2 className="h-4 w-4" />
                            Photo captured: {photo.name}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Right Column - Location & Actions */}
            <div className="space-y-6">
                {/* Location Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            Location
                        </CardTitle>
                        <CardDescription>
                            Your current location for attendance
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {locationError && (
                            <Alert variant="destructive">
                                <AlertDescription>{locationError}</AlertDescription>
                            </Alert>
                        )}

                        {/* Map */}
                        <div className="h-48 w-full rounded-lg overflow-hidden">
                            <AttendanceMap position={currentPosition} />
                        </div>

                        {/* Location Details */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Latitude</Label>
                                <Input
                                    readOnly
                                    value={location?.latitude.toFixed(6) || 'Getting location...'}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Longitude</Label>
                                <Input
                                    readOnly
                                    value={location?.longitude.toFixed(6) || 'Getting location...'}
                                />
                            </div>
                        </div>

                        {location?.accuracy && (
                            <p className="text-xs text-muted-foreground">
                                Accuracy: ~{Math.round(location.accuracy)} meters
                            </p>
                        )}

                        <Button
                            variant="outline"
                            onClick={getCurrentLocation}
                            disabled={isGettingLocation}
                            className="w-full"
                        >
                            {isGettingLocation ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Getting Location...
                                </>
                            ) : (
                                <>
                                    <MapPin className="h-4 w-4 mr-2" />
                                    Refresh Location
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Current Time */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-center gap-3">
                            <Clock className="h-6 w-6 text-primary" />
                            <span className="text-2xl font-bold">
                                {new Date().toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit'
                                })}
                            </span>
                        </div>
                        <p className="text-center text-sm text-muted-foreground mt-2">
                            {new Date().toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-4">
                    <Button
                        onClick={handleClockIn}
                        disabled={isLoading || !location || !photo}
                        className="h-14 bg-green-600 hover:bg-green-700"
                    >
                        {isLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <>
                                <CheckCircle2 className="h-5 w-5 mr-2" />
                                Clock In
                            </>
                        )}
                    </Button>
                    <Button
                        onClick={handleClockOut}
                        disabled={isLoading || !location || !photo}
                        className="h-14 bg-red-600 hover:bg-red-700"
                    >
                        {isLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <>
                                <XCircle className="h-5 w-5 mr-2" />
                                Clock Out
                            </>
                        )}
                    </Button>
                </div>

                {(!location || !photo) && (
                    <Alert>
                        <AlertDescription>
                            Please capture a photo and ensure location is detected before clocking in/out.
                        </AlertDescription>
                    </Alert>
                )}
            </div>
        </div>
    )
}
