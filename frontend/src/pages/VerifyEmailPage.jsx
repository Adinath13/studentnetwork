import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle, Mail } from "lucide-react";

const VerifyEmailPage = () => {
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('');
    const { token } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/auth/verify-email/${token}`);
                const data = await response.json();

                if (response.ok && data.success) {
                    setStatus('success');
                    setMessage(data.message);
                } else {
                    setStatus('error');
                    setMessage(data.message || 'Verification failed');
                }
            } catch (error) {
                setStatus('error');
                setMessage('An error occurred during verification. Please try again.');
                console.error('Verification error:', error);
            }
        };

        if (token) {
            verifyEmail();
        }
    }, [token]);

    const handleLoginRedirect = () => {
        navigate('/login');
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center px-4 py-12">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500" />

            <div className="relative w-full max-w-md">
                <Card className="w-full shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
                    <CardHeader className="space-y-1 pb-2">
                        <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-orange-400 to-pink-600 bg-clip-text text-transparent">
                            Email Verification
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        {status === 'verifying' && (
                            <div className="flex flex-col items-center justify-center space-y-4 py-8">
                                <Loader2 className="h-16 w-16 animate-spin text-purple-600" />
                                <p className="text-lg text-gray-600">Verifying your email...</p>
                            </div>
                        )}

                        {status === 'success' && (
                            <div className="flex flex-col items-center justify-center space-y-4 py-8">
                                <div className="rounded-full bg-green-100 p-4">
                                    <CheckCircle2 className="h-16 w-16 text-green-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-green-600">Success!</h3>
                                <p className="text-center text-gray-600">{message}</p>
                                <Button
                                    onClick={handleLoginRedirect}
                                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 rounded-lg shadow-lg mt-4"
                                >
                                    Go to Login
                                </Button>
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="flex flex-col items-center justify-center space-y-4 py-8">
                                <div className="rounded-full bg-red-100 p-4">
                                    <XCircle className="h-16 w-16 text-red-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-red-600">Verification Failed</h3>
                                <p className="text-center text-gray-600">{message}</p>
                                <div className="w-full space-y-2 mt-4">
                                    <Button
                                        onClick={() => navigate('/registration-success')}
                                        className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold py-3 rounded-lg shadow-lg"
                                    >
                                        <Mail className="mr-2 h-4 w-4" />
                                        Resend Verification Email
                                    </Button>
                                    <Button
                                        onClick={handleLoginRedirect}
                                        variant="outline"
                                        className="w-full border-2 border-gray-300 hover:border-purple-500 hover:bg-purple-50 font-bold py-3 rounded-lg"
                                    >
                                        Back to Login
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-2 pt-2 pb-6">
                        <div className="text-xs text-center text-gray-500">
                            Need help? Contact support
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default VerifyEmailPage;
