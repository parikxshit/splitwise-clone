import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import api from '@/api/axios'
import { registerSchema, RegisterFormData } from '@/validations/auth.schema'

function Register() {
    const navigate = useNavigate()

    const [formData, setFormData] = useState<RegisterFormData>({
        name: '',
        email: '',
        password: '',
    })

    const [fieldErrors, setFieldErrors] = useState<Partial<RegisterFormData>>({})
    const [serverError, setServerError] = useState<string | null>(null)
    const [loading, setLoading] = useState<boolean>(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
        setFieldErrors({ ...fieldErrors, [e.target.name]: '' })
    }

    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()
        setServerError(null)
        setFieldErrors({})

        const result = registerSchema.safeParse(formData)

        if (!result.success) {
            const errors = result.error.flatten().fieldErrors
            setFieldErrors({
                name: errors.name?.[0],
                email: errors.email?.[0],
                password: errors.password?.[0],
            })
            return
        }

        setLoading(true)

        try {
            await api.post('/auth/register', result.data)
            navigate('/login')
        } catch (err: unknown) {
            if (err && typeof err === 'object' && 'response' in err) {
                const axiosError = err as { response: { data: { message: string } } }
                setServerError(axiosError.response?.data?.message || 'Something went wrong')
            } else {
                setServerError('Something went wrong')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <Card className="w-full max-w-md shadow-md">
                <CardHeader>
                    <CardTitle className="text-2xl">Create an account</CardTitle>
                    <CardDescription>Enter your details to get started</CardDescription>
                </CardHeader>

                <CardContent>
                    {serverError && (
                        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
                            {serverError}
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
                                className={fieldErrors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}
                            />
                            {fieldErrors.name && (
                                <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>
                            )}
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
                                className={fieldErrors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}
                            />
                            {fieldErrors.email && (
                                <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>
                            )}
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
                                className={fieldErrors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}
                            />
                            {fieldErrors.password && (
                                <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>
                            )}
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

export default Register