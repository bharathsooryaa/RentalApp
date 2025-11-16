"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, User, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomFormField } from "@/components/FormField";
import { signUpSchema, type SignUpFormData } from "@/lib/schemas";
import { useAuth } from "@/components/AuthProvider";

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { signUp } = useAuth();

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      role: "tenant",
    },
  });

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);
    try {
      // Sign up with Supabase
      const result = await signUp({
        email: data.email,
        password: data.password,
        userData: {
          name: data.name,
          phone: data.phone,
          role: data.role,
        },
      });

      if (result.user) {
        // User created successfully - redirect to dashboard
        console.log("User signed up successfully:", result);
        alert("Account created successfully! Welcome to RentalApp!");
        router.push("/landing");
      }
    } catch (error: any) {
      console.error("Sign up error:", error);
      
      // Handle specific error messages
      if (error.message?.includes("already registered")) {
        alert("This email is already registered. Please try signing in instead.");
      } else {
        alert(`Sign up failed: ${error.message || "Please try again."}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-2xl bg-black/80 backdrop-blur-sm border-gray-800">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight text-white">
            Create your account
          </CardTitle>
          <p className="text-sm text-gray-300">
            Sign up to start your rental journey
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-3">
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <CustomFormField
                    name="name"
                    label=""
                    type="text"
                    placeholder="Enter your full name"
                    inputClassName="pl-10 bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-400 focus:border-blue-500"
                  />
                </div>

                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <CustomFormField
                    name="email"
                    label=""
                    type="email"
                    placeholder="Enter your email"
                    inputClassName="pl-10 bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-400 focus:border-blue-500"
                  />
                </div>

                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <CustomFormField
                    name="phone"
                    label=""
                    type="text"
                    placeholder="Enter your phone number"
                    inputClassName="pl-10 bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-400 focus:border-blue-500"
                  />
                </div>

                <div className="relative">


                </div>
                {/* Role Selection */}
                <div className="space-y-2">
                  <p className="text-sm text-gray-300 font-medium">I am a:</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant={form.watch("role") === "tenant" ? "default" : "outline"}
                      className={`w-full ${
                        form.watch("role") === "tenant"
                          ? "bg-blue-600 hover:bg-blue-700 text-white border-0"
                          : "border-gray-700 bg-gray-900/50 text-gray-300 hover:bg-gray-800/50 hover:text-white"
                      }`}
                      onClick={() => form.setValue("role", "tenant")}
                    >
                      Tenant
                    </Button>
                    <Button
                      type="button"
                      variant={form.watch("role") === "manager" ? "default" : "outline"}
                      className={`w-full ${
                        form.watch("role") === "manager"
                          ? "bg-blue-600 hover:bg-blue-700 text-white border-0"
                          : "border-gray-700 bg-gray-900/50 text-gray-300 hover:bg-gray-800/50 hover:text-white"
                      }`}
                      onClick={() => form.setValue("role", "manager")}
                    >
                      Manager
                    </Button>
                  </div>
                </div>
                
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <CustomFormField
                    name="password"
                    label=""
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    inputClassName="pl-10 pr-10 bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-400 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-200 transition-colors"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <CustomFormField
                    name="confirmPassword"
                    label=""
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    inputClassName="pl-10 pr-10 bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-400 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-200 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white border-0"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
            </form>
          </Form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-black px-2 text-gray-400">Or</span>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              variant="outline"
              type="button"
              className="w-full border-gray-700 bg-gray-900/50 text-white hover:bg-gray-800/50 hover:text-white"
              onClick={() => {
                // TODO: Implement Google sign up
                alert("Google sign up not implemented yet");
              }}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-300">
              Already have an account?{" "}
              <Link
                href="/signin"
                className="font-medium text-blue-400 hover:text-blue-300 hover:underline transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>

          {/* Terms and Privacy */}
          <div className="text-center pt-4">
            <p className="text-xs text-gray-400">
              By creating an account, you agree to our{" "}
              <Link
                href="/terms"
                className="text-blue-400 hover:text-blue-300 hover:underline"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="text-blue-400 hover:text-blue-300 hover:underline"
              >
                Privacy Policy
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;