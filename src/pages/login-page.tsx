import { useEffect, useRef } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Navigate, useNavigate } from "react-router-dom";
import { loginSchema, type LoginFormData } from "../schemas/loginSchema.js";
import { useAuth } from "../context/auth-context.js";
import { useNotification } from "../context/notification-context.js";
import { getErrorMessage } from "../api/api-instance.js";

const LoginPage = () => {
    const { user, loading, login } = useAuth();
    const { showNotification } = useNotification();
    const navigate = useNavigate();
    const emailRef = useRef<HTMLInputElement | null>(null);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: ""
        }
    });

    const { ref: emailRegisterRef, ...emailField } = register("email");

    useEffect(() => {
        emailRef.current?.focus();
    }, [loading])

    const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
        try {
            const me = await login(data);
            showNotification(`Welcome, ${me.fullName}`, "success");
            navigate("/requests", { replace: true });
        } catch (error) {
            showNotification(`Login failed: ${getErrorMessage(error)}`, "error");
        }
    }

    if (loading) return <div>Session is loading...</div>
    if (user) return <Navigate to="/requests" replace />

    return (
        <div className="max-w-sm">
            <h2 className="text-xl font-bold mb-2">Login</h2>
            <form className="flex flex-col gap-2" onSubmit={handleSubmit(onSubmit)}>
                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    type="text"
                    className="border p-1"
                    {...emailField}
                    ref={(element) => {
                        emailRegisterRef(element);
                        emailRef.current = element;
                    }}
                />
                {errors.email && <p className="text-red-900">{errors.email.message}</p>}

                <label htmlFor="password">Password</label>
                <input id="password" type="password" className="border p-1" {...register("password")} />
                {errors.password && <p className="text-red-900">{errors.password.message}</p>}

                <button type="submit" className="border px-2 bg-gray-200" disabled={isSubmitting}>
                    {isSubmitting ? "Signing in..." : "Sign in"}
                </button>
            </form>
        </div>
    )
}

export default LoginPage;
