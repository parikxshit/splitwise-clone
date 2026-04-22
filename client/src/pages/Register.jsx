import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import api from "../api/axios";

function Register() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await api.post('/auth/register', formData)
            navigate('/login')
        } catch (error) {
            const message = err.response?.data?.message || 'Something went wrong'
            setError(message)
        } finally {
            setLoading(false);
        }
    }




    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Card className="w-full max-w-md shadow-md">
                <CardHeader>
                    <CardTitle className="text-2xl">Create an account</CardTitle>
                    <CardDescription>Enter your details to get started</CardDescription>
                </CardHeader>

                <CardContent>
                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                name="name"
                                type="text"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="john@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? 'Creating account...' : 'Register'}
                        </Button>
                    </form>

                    <p className="text-sm text-gray-500 mt-4 text-center">
                        Already have an account?{' '}
                        <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}

export default Register;