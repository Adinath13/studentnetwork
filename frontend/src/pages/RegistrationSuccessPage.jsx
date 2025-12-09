import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle, Clock, RefreshCw } from "lucide-react";

const RegistrationSuccessPage = () => {
    const [countdown, setCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [resendMessage, setResendMessage] = useState('');
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email || '';

    useEffect(() => {
        if (!email) {
            navigate('/register');
            return;
        }

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    setCanResend(true);
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [email, navigate]);

    const handleResendEmail = async () => {
        setIsResending(true);
        setResendMessage('');

        try {
            const response = await fetch('http://localhost:5000/api/auth/resend-verification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setResendMessage('✅ Verification email sent! Please check your inbox.');
                setCanResend(false);
                setCountdown(60);

                // Restart countdown
                const timer = setInterval(() => {
                    setCountdown((prev) => {
                        if (prev <= 1) {
                            setCanResend(true);
                            clearInterval(timer);
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            } else {
                setResendMessage(`❌ ${data.message || 'Failed to resend email'}`);
            }
        } catch (error) {
            setResendMessage('❌ An error occurred. Please try again.');
            console.error('Resend error:', error);
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center px-4 py-12">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500" />

            <div className="relative w-full max-w-md">
                <Card className="w-full shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
                    <CardHeader className="space-y-1 pb-2">
                        <div className="flex justify-center mb-4">
                            <div className="rounded-full bg-green-100 p-4">
                                <Mail className="h-12 w-12 text-green-600" />
                            </div>
                        </div>
                        <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-orange-400 to-pink-600 bg-clip-text text-transparent">
                            Check Your Email
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-4">
                        <div className="space-y-4">
                            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                                <div className="flex items-start">
                                    <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-semibold text-blue-900">
                                            Registration Successful!
                                        </p>
                                        <p className="text-sm text-blue-700 mt-1">
                                            We've sent a verification email to:
                                        </p>
                                        <p className="text-sm font-bold text-blue-900 mt-1 break-all">
                                            {email}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                                <div className="flex items-start">
                                    <Clock className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-semibold text-yellow-900">
                                            Next Steps
                                        </p>
                                        <ol className="text-sm text-yellow-700 mt-1 list-decimal list-inside space-y-1">
                                            <li>Check your email inbox</li>
                                            <li>Click the verification link</li>
                                            <li>Return here to log in</li>
                                        </ol>
                                    </div>
                                </div>
                            </div>

                            <div className="text-center space-y-2">
                                <p className="text-sm text-gray-600">
                                    Didn't receive the email?
                                </p>

                                {resendMessage && (
                                    <div className={`p-3 rounded text-sm ${resendMessage.includes('✅')
                                            ? 'bg-green-50 text-green-700 border border-green-200'
                                            : 'bg-red-50 text-red-700 border border-red-200'
                                        }`}>
                                        {resendMessage}
                                    </div>
                                )}

                                <Button
                                    onClick={handleResendEmail}
                                    disabled={!canResend || isResending}
                                    className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold py-3 rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isResending ? (
                                        <>
                                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                            Sending...
                                        </>
                                    ) : canResend ? (
                                        <>
                                            <Mail className="mr-2 h-4 w-4" />
                                            Resend Verification Email
                                        </>
                                    ) : (
                                        <>
                                            <Clock className="mr-2 h-4 w-4" />
                                            Resend in {countdown}s
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-2 pt-2 pb-6">
                        <Button
                            onClick={() => navigate('/login')}
                            variant="outline"
                            className="w-full border-2 border-gray-300 hover:border-purple-500 hover:bg-purple-50 font-bold py-3 rounded-lg"
                        >
                            Back to Login
                        </Button>
                        <div className="text-xs text-center text-gray-500 mt-2">
                            Check your spam folder if you don't see the email
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default RegistrationSuccessPage;
