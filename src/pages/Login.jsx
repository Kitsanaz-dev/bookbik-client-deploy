import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { Mail, Lock, User, ArrowLeft, Eye, EyeOff } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Min 6 characters"),
});

const registerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Min 6 characters"),
  phone: z.string().optional(),
});

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const { login, register: authRegister } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  const loginForm = useForm({ resolver: zodResolver(loginSchema) });
  const registerForm = useForm({ resolver: zodResolver(registerSchema) });

  const activeForm = isRegister ? registerForm : loginForm;
  const { register, handleSubmit, formState: { errors, isSubmitting } } = activeForm;

  const onSubmit = async (data) => {
    setError("");
    try {
      if (isRegister) {
        await authRegister(data.name, data.email, data.password, data.phone);
      } else {
        await login(data.email, data.password);
      }
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat flex items-center justify-center px-4 animate-fade-in">
      <div className="w-full max-w-md">

        <div className="bg-card rounded-3xl shadow-xl border border-border p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-2xl mx-auto mb-4">P</div>
            <h1 className="text-2xl font-extrabold text-foreground">
              {isRegister ? "Create Account" : "Welcome Back"}
            </h1>
            <p className="text-muted-foreground text-sm mt-2">
              {isRegister ? "Sign up to start booking" : "Sign in to continue booking"}
            </p>
          </div>

          {error && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-xl mb-6 font-medium">{error}</div>}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {isRegister && (
              <div>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input {...register("name")} type="text" placeholder="Full Name"
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-ring outline-none text-sm" />
                </div>
                {errors.name && <p className="text-destructive text-xs mt-1">{errors.name.message}</p>}
              </div>
            )}

            <div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input {...register("email")} type="email" placeholder="Email"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-ring outline-none text-sm" />
              </div>
              {errors.email && <p className="text-destructive text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input {...register("password")} type={showPassword ? "text" : "password"} placeholder="Password"
                  className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-ring outline-none text-sm" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-destructive text-xs mt-1">{errors.password.message}</p>}
            </div>

            {isRegister && (
              <div>
                <input {...register("phone")} type="tel" placeholder="Phone (optional)"
                  className="w-full pl-4 pr-4 py-3.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-ring outline-none text-sm" />
              </div>
            )}

            <button type="submit" disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {isSubmitting ? "Processing..." : isRegister ? "Create Account" : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
            <button onClick={() => { setIsRegister(!isRegister); setError(""); }}
              className="text-primary font-bold hover:underline">
              {isRegister ? "Sign In" : "Sign Up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
