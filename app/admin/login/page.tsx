"use client";
import { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";
import { getCookie } from '@/lib/cookieUtils';

type LoginForm = {
  phone: string;
  password: string;
};

export default function AdminLogin() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<LoginForm>({
    mode: "onChange",
  });
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Check if user is already logged in
  useEffect(() => {
    console.log("Login page - checking if already logged in");
    // Only check manually if there's a parameter in the URL indicating to check
    const shouldCheck = new URLSearchParams(window.location.search).get('check') === 'true';
    
    if (shouldCheck) {
      const token = getCookie('refreshToken');
      console.log("Refresh token present:", !!token);
      
      if (token) {
        console.log("Redirecting to dashboard from login page");
        router.push('/admin/dashboard');
      }
    }
  }, [router]);

  const onSubmit: SubmitHandler<LoginForm> = async (data) => {
    setIsLoading(true);
    setServerError(null);
    try {
      console.log("Submitting login form");
      const res = await fetch("/api/admin/login", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
      const result = await res.json();
      console.log("Login response:", result);
      
      if (res.ok && result.accessToken) {
        console.log("Login successful, redirecting to dashboard");
        
        // Also store the refresh token in localStorage as a backup
        if (result.refreshToken) {
          localStorage.setItem('refreshTokenBackup', result.refreshToken);
          console.log("Stored refresh token in localStorage");
        }
        
        // The refreshToken is set by the server as an HTTP-only cookie
        // Wait a moment to ensure cookie is set before redirecting
        setTimeout(() => {
          router.push("/admin/dashboard");
        }, 1000); // Give it a full second to ensure the cookie is set
      } else {
        console.log("Login failed:", result.error);
        setServerError(result.error || "Invalid phone number or password!");
        reset({ phone: data.phone, password: "" });
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setServerError("Something went wrong—check your connection!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-primary w-full">
      <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 w-full max-w-md mx-auto">
        <h2 className="text-4xl font-extrabold text-center text-gray-800">Admin Login</h2>
        <p className="text-center text-gray-600 mt-2 mb-6">
          Enter your phone number and password to sign in as admin
        </p>
        {serverError && (
          <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-center text-sm animate-fade-in">
            {serverError}
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <input
              type="tel"
              placeholder="Mobile Phone Number (09337932893)"
              className={`w-full p-3 border ${errors.phone ? "border-red-500" : "border-gray-500"} rounded-md focus:ring-2 focus:ring-primary focus:outline-none transition-all duration-200`}
              disabled={isLoading}
              {...register("phone", {
                required: "Phone number is required",
                pattern: {
                  value: /^\d{11}$/,
                  message: "Must be an 11-digit phone number"
                }
              })}
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1 animate-fade-in">
                {errors.phone.message}
              </p>
            )}
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              className={`w-full p-3 border ${errors.password ? "border-red-500" : "border-gray-500"} rounded-md focus:ring-2 focus:ring-primary focus:outline-none transition-all duration-200`}
              disabled={isLoading}
              {...register("password", {
                required: "Password is required",
                minLength: { value: 6, message: "Password must be at least 6 characters" }
              })}
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1 animate-fade-in">
                {errors.password.message}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black hover:opacity-75 text-white py-3 rounded-md font-bold text-lg transition-opacity duration-200 disabled:bg-opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
        </form>
        <p className="text-xs text-gray-500 text-center mt-6">
          By proceeding you agree to our{" "}
          <a href="#" className="underline hover:text-gray-700 transition-colors duration-200">
            Terms and Conditions
          </a>{" "}
          and confirm you have read our{" "}
          <a href="#" className="underline hover:text-gray-700 transition-colors duration-200">
            Privacy Policy
          </a>.
        </p>
        <div className="flex justify-center mt-6">
          <div className="bg-black hover:opacity-75 px-4 py-2 text-white font-bold rounded-md transition-opacity duration-200">
            cookies
          </div>
        </div>
      </div>
    </div>
  );
}