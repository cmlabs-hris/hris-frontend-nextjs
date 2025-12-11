'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AnimatedBubbles from '@/components/auth/AnimatedBubbles';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { invitationApi, Invitation, ApiError } from '@/lib/api';
import { Loader2, ArrowLeft, Building2, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function JoinCompanyPage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading: authLoading, refreshAuth } = useAuth();
    
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [joiningId, setJoiningId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

    // Load invitations
    useEffect(() => {
        const loadInvitations = async () => {
            if (!isAuthenticated) return;
            
            try {
                const response = await invitationApi.listMyInvitations();
                if (response.data) {
                    // Filter only pending invitations
                    const pendingInvitations = response.data.filter(
                        inv => inv.status === 'pending'
                    );
                    setInvitations(pendingInvitations);
                }
            } catch (err) {
                if (err instanceof ApiError) {
                    setError(err.errorDetail.message);
                } else {
                    setError('Failed to load invitations');
                }
            } finally {
                setIsLoading(false);
            }
        };

        if (isAuthenticated) {
            loadInvitations();
        }
    }, [isAuthenticated]);

    const handleJoin = async (invitation: Invitation) => {
        setJoiningId(invitation.id);
        setError(null);
        setSuccessMessage(null);

        try {
            await invitationApi.accept(invitation.token);
            setSuccessMessage(`Successfully joined ${invitation.company_name || 'company'}!`);
            
            // Refresh token untuk mendapatkan JWT baru dengan company_id dan role: employee
            await refreshAuth();
            
            // Redirect ke dashboard setelah delay singkat
            setTimeout(() => {
                router.push('/dashboard');
            }, 1500);
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.errorDetail.message);
            } else {
                setError('Failed to join company. Please try again.');
            }
        } finally {
            setJoiningId(null);
        }
    };

    if (authLoading || isLoading) {
        return (
            <main className="relative flex items-center justify-center min-h-screen bg-[#3B82F6] overflow-hidden p-4">
                <div className="absolute inset-0 bg-gradient-to-br from-[#3B82F6] to-[#1E40AF] -z-20" />
                <AnimatedBubbles />
                <div className="text-white text-xl flex items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    Loading...
                </div>
            </main>
        );
    }

    return (
        <main className="relative flex flex-col items-center justify-center min-h-screen bg-[#3B82F6] overflow-hidden p-4">
            <div className="absolute inset-0 bg-gradient-to-br from-[#3B82F6] to-[#1E40AF] -z-20" />
            <AnimatedBubbles />

            <div className="text-center text-white mb-8">
                <h1 className="text-4xl font-bold">Join a Company</h1>
                <p className="mt-4 max-w-xl">
                    Below are the companies you have been invited to join.
                </p>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm max-w-lg w-full">
                    {error}
                </div>
            )}

            {successMessage && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-md text-sm max-w-lg w-full flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    {successMessage}
                </div>
            )}

            <Card className="w-full max-w-lg">
                <CardContent className="p-6">
                    {invitations.length > 0 ? (
                        <div className="space-y-4">
                            {invitations.map((invitation) => (
                                <div 
                                    key={invitation.id}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="bg-blue-100 text-blue-800 font-bold p-3 rounded-md">
                                            <Building2 className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{invitation.company_name || 'Company'}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Invited as {invitation.role || 'Employee'}
                                            </p>
                                        </div>
                                    </div>
                                    <Button 
                                        onClick={() => handleJoin(invitation)}
                                        disabled={joiningId === invitation.id}
                                    >
                                        {joiningId === invitation.id ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                Joining...
                                            </>
                                        ) : (
                                            'Join'
                                        )}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Building2 className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                            <p className="text-slate-500 mb-2">No pending invitations</p>
                            <p className="text-sm text-muted-foreground">
                                You haven&apos;t been invited to any company yet. Contact your company admin to send you an invitation.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="mt-6 text-center">
                <Link 
                    href="/auth/choose-role" 
                    className="text-sm font-medium text-white/80 hover:text-white inline-flex items-center gap-1"
                >
                    <ArrowLeft size={16} />
                    Back to role selection
                </Link>
            </div>
        </main>
    );
}
