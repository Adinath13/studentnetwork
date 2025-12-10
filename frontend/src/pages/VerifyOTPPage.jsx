import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ShieldCheck, ArrowLeft, RefreshCw } from "lucide-react"

const VerifyOTPPage = () => {
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [error, setError] = useState('');
    const [attemptsRemaining, setAttemptsRemaining] = useState(5);
    const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes in seconds
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    useEffect(() => {
        if (!email) {
            navigate('/forgot-password');
            return;
        }

        // Countdown timer
        const timer = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [email, navigate]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, otp }),
            });

            const data = await response.json();

            if (response.ok) {
                // Navigate to reset password page with reset token
                navigate('/reset-password', {
                    state: {
                        resetToken: data.resetToken,
                        email
                    }
                });
            } else {
                setError(data.message || 'Invalid OTP. Please try again.');
                if (data.attemptsRemaining !== undefined) {
                    setAttemptsRemaining(data.attemptsRemaining);
                }
            }
        } catch (err) {
            console.error('Verify OTP error:', err);
            setError('Network error. Please check your connection and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setIsResending(true);
        setError('');

        try {
            const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.status === 429) {
                setError(data.message);
            } else if (response.ok) {
                setTimeRemaining(600); // Reset timer
                setAttemptsRemaining(5); // Reset attempts
                setOtp(''); // Clear OTP input
            } else {
                setError(data.message || 'Failed to resend OTP.');
            }
        } catch (err) {
            console.error('Resend OTP error:', err);
            setError('Network error. Please try again.');
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center px-4">
            <div className="relative w-full max-w-md">
                <Card className="w-full shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
                    <CardHeader className="space-y-1 pb-2">
                        <div className="flex justify-center mb-2">
                            <div className="p-3 bg-purple-100 rounded-full">
                                <ShieldCheck className="h-8 w-8 text-purple-600" />
                            </div>
                        </div>
                        <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-orange-400 to-pink-600 bg-clip-text text-transparent">
                            Verify OTP
                        </CardTitle>
                        <CardDescription className="text-center text-gray-600">
                            Enter the 6-digit code sent to<br />
                            <span className="font-semibold text-purple-600">{email}</span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
                                    {error}
                                </div>
                            )}

                            {/* Timer */}
                            <div className="text-center">
                                <div className={`text-2xl font-bold ${timeRemaining < 60 ? 'text-red-500' : 'text-purple-600'}`}>
                                    {formatTime(timeRemaining)}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">Time remaining</div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="otp" className="font-semibold text-gray-700">OTP Code</Label>
                                <Input
                                    id="otp"
                                    type="text"
                                    placeholder="000000"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    required
                                    maxLength={6}
                                    className="text-center text-2xl font-bold tracking-widest bg-gray-50 border-gray-200 focus:ring-2 focus:ring-purple-500 transition-all"
                                />
                                <div className="text-xs text-gray-500 text-center">
                                    Attempts remaining: <span className="font-semibold text-purple-600">{attemptsRemaining}</span>
                                </div>
                            </div>

                            <Button
                                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold py-3 rounded-lg shadow-lg"
                                type="submit"
                                disabled={isLoading || otp.length !== 6 || timeRemaining === 0}
                            >
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Verify OTP
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                className="w-full border-purple-200 text-purple-600 hover:bg-purple-50"
                                onClick={handleResendOTP}
                                disabled={isResending}
                            >
                                {isResending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                        Resend OTP
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-2 pt-2 pb-6">
                        <Link
                            to="/forgot-password"
                            className="text-sm text-center text-gray-600 hover:text-purple-600 font-medium flex items-center justify-center gap-1"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Forgot Password
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default VerifyOTPPage;
