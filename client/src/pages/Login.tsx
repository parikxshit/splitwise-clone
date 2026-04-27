import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import api from '@/api/axios'
import { setCredentials } from '@/store/slices/authSlice'
import { loginSchema, LoginFormData } from '@/validations/auth.schema'
import type { AppDispatch } from '@/store'
import type { LoginResponse } from '@/types'

function Login() {
    const navigate = useNavigate()
    const dispatch = useDispatch<AppDispatch>()

    const [formData, setFormData] = useState<LoginFormData>({
        email: '',
        password: '',
    })

    const [fieldErrors, setFieldErrors] = useState<Partial<LoginFormData>>({})
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

        const result = loginSchema.safeParse(formData)

        if (!result.success) {
            const errors = result.error.flatten().fieldErrors
            setFieldErrors({
                email: errors.email?.[0],
                password: errors.password?.[0],
            })
            return
        }

        setLoading(true)

        try {
            const response = await api.post<{ data: LoginResponse }>('/auth/login', result.data)
            const { user, accessToken, refreshToken } = response.data.data

            dispatch(setCredentials({ user, accessToken }))
            localStorage.setItem('refreshToken', refreshToken)

            navigate('/dashboard')
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
                    <CardTitle className="text-2xl">Welcome back</CardTitle>
                    <CardDescription>Enter your credentials to sign in</CardDescription>
                </CardHeader>

                <CardContent>
                    {serverError && (
                        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
                            {serverError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
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
                            {loading ? 'Signing in...' : 'Login'}
                        </Button>
                    </form>

                    <p className="text-sm text-gray-500 mt-4 text-center">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-blue-600 hover:underline">Register</Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}

export default Login