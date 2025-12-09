import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Mail } from "lucide-react"

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [emailNotVerified, setEmailNotVerified] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const { login, error } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setEmailNotVerified(false);
        try {
            const user = await login(email, password);
            navigate(`/${user.role}-dashboard`);
        } catch (err) {
            // Check if error is due to unverified email
            if (err.response?.data?.emailNotVerified) {
                setEmailNotVerified(true);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendVerification = async () => {
        setIsResending(true);
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
                navigate('/registration-success', { state: { email } });
            }
        } catch (error) {
            console.error('Resend error:', error);
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center px-4">
            {/* Background Gradient */}
            {/* Background Gradient - Handled in Layout */}

            <div className="relative w-full max-w-md">
                <Card className="w-full shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
                    <CardHeader className="space-y-1 pb-2">
                        <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-orange-400 to-pink-600 bg-clip-text text-transparent">
                            Login
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                                    {error}
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="font-semibold text-gray-700">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="bg-gray-50 border-gray-200 focus:ring-2 focus:ring-purple-500 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="font-semibold text-gray-700">Password</Label>
                                    <Link
                                        to="/forgot-password"
                                        className="text-sm font-medium text-purple-600 hover:text-purple-500"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="bg-gray-50 border-gray-200 focus:ring-2 focus:ring-purple-500 transition-all"
                                />
                            </div>
                            <Button
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-lg"
                                type="submit"
                                disabled={isLoading}
                            >
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Login
                            </Button>

                            {emailNotVerified && (
                                <Button
                                    type="button"
                                    onClick={handleResendVerification}
                                    disabled={isResending}
                                    className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold py-3 rounded-lg shadow-lg"
                                >
                                    {isResending ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Mail className="mr-2 h-4 w-4" />
                                            Resend Verification Email
                                        </>
                                    )}
                                </Button>
                            )}

                        </form>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-2 pt-2 pb-6">
                        <div className="text-sm text-center text-gray-600">
                            Don't have an account?{" "}
                            <Link to="/register" className="text-orange-500 hover:text-orange-600 font-bold hover:underline">
                                Sign Up
                            </Link>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default LoginPage;

