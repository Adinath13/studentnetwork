import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react"

const ResetPasswordPage = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: '', color: '' });
    const navigate = useNavigate();
    const location = useLocation();
    const resetToken = location.state?.resetToken;
    const email = location.state?.email;

    useEffect(() => {
        if (!resetToken) {
            navigate('/forgot-password');
        }
    }, [resetToken, navigate]);

    useEffect(() => {
        // Calculate password strength
        if (newPassword.length === 0) {
            setPasswordStrength({ score: 0, text: '', color: '' });
            return;
        }

        let score = 0;
        if (newPassword.length >= 6) score++;
        if (newPassword.length >= 10) score++;
        if (/[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword)) score++;
        if (/\d/.test(newPassword)) score++;
        if (/[^a-zA-Z\d]/.test(newPassword)) score++;

        const strengths = [
            { score: 1, text: 'Weak', color: 'text-red-500' },
            { score: 2, text: 'Fair', color: 'text-orange-500' },
            { score: 3, text: 'Good', color: 'text-yellow-500' },
            { score: 4, text: 'Strong', color: 'text-green-500' },
            { score: 5, text: 'Very Strong', color: 'text-green-600' },
        ];

        const strength = strengths.find(s => s.score === score) || strengths[0];
        setPasswordStrength(strength);
    }, [newPassword]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Validation
        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters long');
            setIsLoading(false);
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ resetToken, newPassword }),
            });

            const data = await response.json();

            if (response.ok) {
                // Show success and redirect to login
                navigate('/login', {
                    state: {
                        message: 'Password reset successfully! You can now login with your new password.',
                        email
                    }
                });
            } else {
                setError(data.message || 'Failed to reset password. Please try again.');
            }
        } catch (err) {
            console.error('Reset password error:', err);
            setError('Network error. Please check your connection and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center px-4">
            <div className="relative w-full max-w-md">
                <Card className="w-full shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
                    <CardHeader className="space-y-1 pb-2">
                        <div className="flex justify-center mb-2">
                            <div className="p-3 bg-green-100 rounded-full">
                                <Lock className="h-8 w-8 text-green-600" />
                            </div>
                        </div>
                        <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-orange-400 to-pink-600 bg-clip-text text-transparent">
                            Reset Password
                        </CardTitle>
                        <CardDescription className="text-center text-gray-600">
                            Create a new password for your account
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="newPassword" className="font-semibold text-gray-700">New Password</Label>
                                <div className="relative">
                                    <Input
                                        id="newPassword"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter new password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        className="pr-10 bg-gray-50 border-gray-200 focus:ring-2 focus:ring-purple-500 transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                                {newPassword && (
                                    <div className="text-sm">
                                        Password strength: <span className={`font-semibold ${passwordStrength.color}`}>{passwordStrength.text}</span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="font-semibold text-gray-700">Confirm Password</Label>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Confirm new password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        className="pr-10 bg-gray-50 border-gray-200 focus:ring-2 focus:ring-purple-500 transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                                {confirmPassword && newPassword === confirmPassword && (
                                    <div className="flex items-center gap-1 text-sm text-green-600">
                                        <CheckCircle2 className="h-4 w-4" />
                                        Passwords match
                                    </div>
                                )}
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                                <p className="text-xs text-blue-800 font-medium mb-1">Password Requirements:</p>
                                <ul className="text-xs text-blue-700 space-y-1">
                                    <li>• At least 6 characters long</li>
                                    <li>• Mix of uppercase and lowercase letters (recommended)</li>
                                    <li>• Include numbers and special characters (recommended)</li>
                                </ul>
                            </div>

                            <Button
                                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 rounded-lg shadow-lg"
                                type="submit"
                                disabled={isLoading || newPassword !== confirmPassword || newPassword.length < 6}
                            >
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Reset Password
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-2 pt-2 pb-6">
                        <Link
                            to="/login"
                            className="text-sm text-center text-gray-600 hover:text-purple-600 font-medium"
                        >
                            Back to Login
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
