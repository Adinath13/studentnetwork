import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'student'
    });
    const [isLoading, setIsLoading] = useState(false);
    const { register, error } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRoleChange = (value) => {
        setFormData({ ...formData, role: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await register(formData);
            // Redirect to registration success page with email
            navigate('/registration-success', { state: { email: response.email || formData.email } });
        } catch (err) {
            // Error handled in context
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center px-4 py-12">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500" />

            <div className="relative w-full max-w-md">
                <Card className="w-full shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
                    <CardHeader className="space-y-1 pb-2">
                        <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-orange-400 to-pink-600 bg-clip-text text-transparent">
                            Create Account
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
                                <Label htmlFor="name" className="font-semibold text-gray-700">Full Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="bg-gray-50 border-gray-200 focus:ring-2 focus:ring-purple-500 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="font-semibold text-gray-700">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="bg-gray-50 border-gray-200 focus:ring-2 focus:ring-purple-500 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" className="font-semibold text-gray-700">Password</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="bg-gray-50 border-gray-200 focus:ring-2 focus:ring-purple-500 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role" className="font-semibold text-gray-700">I am a</Label>
                                <Select onValueChange={handleRoleChange} defaultValue={formData.role}>
                                    <SelectTrigger className="bg-gray-50 border-gray-200 focus:ring-2 focus:ring-purple-500 transition-all">
                                        <SelectValue placeholder="Select your role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="student">Student</SelectItem>
                                        <SelectItem value="alumni">Alumni</SelectItem>
                                        <SelectItem value="tpo">TPO</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-lg"
                                type="submit"
                                disabled={isLoading}
                            >
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Sign Up
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-2 pt-2 pb-6">
                        <div className="text-sm text-center text-gray-600">
                            Already have an account?{" "}
                            <Link to="/login" className="text-orange-500 hover:text-orange-600 font-bold hover:underline">
                                Login
                            </Link>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default RegisterPage;
