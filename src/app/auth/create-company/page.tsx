'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AnimatedBubbles from '@/components/auth/AnimatedBubbles';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/AuthContext';
import { companyApi, ApiError } from '@/lib/api';
import { Loader2, ArrowLeft, Upload, X, Image as ImageIcon, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

export default function CreateCompanyPage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading: authLoading, refreshAuth } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();
    
    const [companyName, setCompanyName] = useState('');
    const [companyUsername, setCompanyUsername] = useState('');
    const [companyAddress, setCompanyAddress] = useState('');
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Redirect jika sudah punya company
    useEffect(() => {
        if (!authLoading && isAuthenticated && user?.company_id) {
            router.push('/dashboard');
        }
    }, [authLoading, isAuthenticated, user, router]);

    // Redirect jika belum login
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/auth');
        }
    }, [authLoading, isAuthenticated, router]);

    // Handle file selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
            if (!allowedTypes.includes(file.type)) {
                setError('Invalid file type. Only JPG, PNG, and PDF files are allowed.');
                return;
            }
            
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('File size must not exceed 5MB.');
                return;
            }
            
            setLogoFile(file);
            setError(null);
            
            // Create preview for images
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setLogoPreview(reader.result as string);
                };
                reader.readAsDataURL(file);
            } else {
                setLogoPreview(null);
            }
        }
    };

    // Remove selected file
    const handleRemoveFile = () => {
        setLogoFile(null);
        setLogoPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleCreateCompany = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            await companyApi.create({
                company_name: companyName,
                company_username: companyUsername,
                company_address: companyAddress || undefined,
                attachment: logoFile || undefined,
            });
            
            // Refresh token untuk mendapatkan JWT baru dengan company_id dan role: owner
            await refreshAuth();
            
            // Show success notification
            toast({
                title: 'Company Created Successfully! 🎉',
                description: `Welcome to ${companyName}! You are now the owner of this company.`,
                duration: 5000,
            });
            
            // Redirect ke dashboard setelah berhasil
            router.push('/dashboard');
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.errorDetail.message);
            } else {
                setError('Failed to create company. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-generate username dari nama company
    const handleCompanyNameChange = (value: string) => {
        setCompanyName(value);
        // Generate username: lowercase, replace spaces with hyphens, remove special chars
        const generatedUsername = value
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
            .substring(0, 30);
        setCompanyUsername(generatedUsername);
    };

    if (authLoading) {
        return (
            <main className="relative flex items-center justify-center min-h-screen bg-[#3B82F6] overflow-hidden p-4">
                <div className="absolute inset-0 bg-gradient-to-br from-[#3B82F6] to-[#1E40AF] -z-20" />
                <AnimatedBubbles />
                <div className="text-white text-xl">Loading...</div>
            </main>
        );
    }

    return (
        <main className="relative flex flex-col items-center justify-center min-h-screen bg-[#3B82F6] overflow-hidden p-4">
            <div className="absolute inset-0 bg-gradient-to-br from-[#3B82F6] to-[#1E40AF] -z-20" />
            <AnimatedBubbles />

            <div className="text-center text-white mb-8">
                <h1 className="text-4xl font-bold">Create a new Company</h1>
                <p className="mt-4 max-w-xl">
                    A Company is the centralized environment for your entire organization. Manage all teams, projects, and issues on one unified platform.
                </p>
            </div>

            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Company Details</CardTitle>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                            {error}
                        </div>
                    )}
                    
                    <form onSubmit={handleCreateCompany} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="company-name">Company Name</Label>
                            <Input 
                                id="company-name" 
                                placeholder="Enter company name" 
                                required 
                                value={companyName}
                                onChange={(e) => handleCompanyNameChange(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="company-username">Company Username</Label>
                            <Input 
                                id="company-username" 
                                placeholder="company-username" 
                                required 
                                value={companyUsername}
                                onChange={(e) => setCompanyUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                disabled={isLoading}
                            />
                            <p className="text-xs text-muted-foreground">
                                Used for employee login. Only lowercase letters, numbers, and hyphens.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="company-address">Company Address (Optional)</Label>
                            <Textarea 
                                id="company-address" 
                                placeholder="Enter company address" 
                                value={companyAddress}
                                onChange={(e) => setCompanyAddress(e.target.value)}
                                disabled={isLoading}
                                rows={3}
                            />
                        </div>
                        
                        {/* Company Logo Upload (Optional) */}
                        <div className="space-y-2">
                            <Label htmlFor="company-logo">Company Logo (Optional)</Label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 transition-colors hover:border-gray-400">
                                {logoPreview ? (
                                    <div className="relative">
                                        <Image 
                                            src={logoPreview} 
                                            alt="Logo preview" 
                                            width={128}
                                            height={128}
                                            className="mx-auto h-32 w-32 object-contain rounded"
                                        />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-0 right-0 h-6 w-6"
                                            onClick={handleRemoveFile}
                                            disabled={isLoading}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                        <p className="text-center text-sm text-muted-foreground mt-2">
                                            {logoFile?.name}
                                        </p>
                                    </div>
                                ) : logoFile ? (
                                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                        <div className="flex items-center gap-2">
                                            <ImageIcon className="h-8 w-8 text-gray-400" />
                                            <span className="text-sm text-gray-600 truncate max-w-[200px]">
                                                {logoFile.name}
                                            </span>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={handleRemoveFile}
                                            disabled={isLoading}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div 
                                        className="flex flex-col items-center justify-center py-4 cursor-pointer"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Upload className="h-10 w-10 text-gray-400 mb-2" />
                                        <p className="text-sm text-gray-600">
                                            Click to upload logo
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            JPG, PNG or PDF (max 5MB)
                                        </p>
                                    </div>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    id="company-logo"
                                    accept=".jpg,.jpeg,.png,.pdf"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <Button 
                            type="submit" 
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Creating...
                                </>
                            ) : (
                                'Create Company'
                            )}
                        </Button>
                    </form>
                    
                    <div className="mt-6 text-center">
                        <Link 
                            href="/auth/choose-role" 
                            className="text-sm font-medium text-slate-600 hover:text-slate-900 inline-flex items-center gap-1"
                        >
                            <ArrowLeft size={16} />
                            Back to role selection
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </main>
    );
}
