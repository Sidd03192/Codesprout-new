"use client";
import { redirect } from "next/navigation";
import { createClient } from "../../../../utils/supabase/client";
const supabase = createClient();
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";

function AuthFormContent() {
  const searchParams = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = () => setIsVisible((v) => !v);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [alertType, setAlertType] = useState("success"); // "success" | "danger"
  const [alertTitle, setAlertTitle] = useState("");
  const [alertDescription, setAlertDescription] = useState("");
  const [alertVisible, setAlertVisible] = useState(false);
  const [role, setRole] = useState("student");
  const [joinToken, setJoinToken] = useState(null);
  const [joinContext, setJoinContext] = useState(null);

  useEffect(() => {
    const token = searchParams.get('join_token');
    if (token) {
      setJoinToken(token);
      // Default to student role for join links
      setRole("student");
      // Validate token and get classroom info
      validateJoinToken(token);
    }
  }, [searchParams]);

  const validateJoinToken = async (token) => {
    try {
      const response = await fetch(`/api/classroom/join/${token}`);
      if (response.ok) {
        const data = await response.json();
        setJoinContext(data);
      }
    } catch (error) {
      console.error('Error validating join token:', error);
    }
  };

  const showAlert = (type, title, description) => {
    setAlertType(type);
    setAlertTitle(title);
    setAlertDescription(description);
    setAlertVisible(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        // Validate passwords match
        if (password !== confirmPassword) {
          showAlert(
            "danger",
            "Password Mismatch",
            "Passwords do not match. Please try again."
          );
          setLoading(false);
          return;
        }

        // Sign up user
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) {
          console.error("Error signing up:", signUpError.message);
          showAlert(
            "danger",
            "Sign Up Failed",
            signUpError.message || "An error occurred during sign up."
          );
        } else {
          showAlert(
            "success",
            "Account Created Successfully!",
            "We've sent you a confirmation email. Please check your inbox to verify your account."
          );

          // Only update database if user was created successfully
          if (data.user) {
            await updateDatabase(data.user);
            
            // Handle join token if present (after email verification)
            if (joinToken) {
              showAlert(
                "success",
                "Account Created Successfully!",
                `Please verify your email, then you'll be automatically joined to ${joinContext?.class_name || 'the classroom'}.`
              );
            } else if (!data.user.email_confirmed_at) {
              // User needs to verify email before redirect
              showAlert(
                "success",
                "Account Created Successfully!",
                "Please check your email and verify your account to complete registration."
              );
            } else {
              // Email already confirmed, redirect immediately
              const dashboardPath = role === "teacher" ? "/dashboard" : "/student-dashboard";
              showAlert(
                "success", 
                "Account Created Successfully!",
                `Welcome! Redirecting to your ${role} dashboard...`
              );
              setTimeout(() => {
                redirect(dashboardPath);
              }, 2000);
            }
          }
        }
      } else {
        // Sign in user
        const { data, error: signInError } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });

        if (signInError) {
          console.error("Error signing in:", signInError.message);
          showAlert(
            "danger",
            "Sign In Failed",
            signInError.message || "An error occurred during sign in."
          );
        } else {
          // Successful sign in - handle join token if present
          if (joinToken) {
            await handleJoinTokenAfterAuth(data.user.id);
          } else {
            // Normal redirect to appropriate dashboard
            const userRole = await getUserRole(data.user.id);
            const dashboardPath =
              userRole === "teacher" ? "/dashboard" : "/student-dashboard";
            redirect(dashboardPath);
          }
        }
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      showAlert(
        "danger",
        "Error",
        "An unexpected error occurred. Please try again."
      );
    }

    setLoading(false);
  };

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
      });

      if (error) {
        console.error("OAuth Sign-in Error:", error.message);
        showAlert(
          "danger",
          "Sign In Failed",
          error.message || "An error occurred during Google sign in."
        );
      } else {
        console.log("OAuth redirecting…", data);
      }
    } catch (err) {
      console.error("Unexpected error during Google Sign-in:", err.message);
      showAlert(
        "danger",
        "Error",
        "An unexpected error occurred during Google sign in."
      );
    }
  };

  const handleJoinTokenAfterAuth = async (userId) => {
    try {
      const response = await fetch(`/api/classroom/join/${joinToken}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        showAlert(
          "success",
          "Successfully Joined Classroom!",
          `Welcome to ${data.class_name}. Redirecting to your dashboard...`
        );
        
        // Redirect to student dashboard after a brief delay
        setTimeout(() => {
          redirect('/student-dashboard');
        }, 2000);
      } else {
        showAlert(
          "warning", 
          "Authentication Successful",
          `Signed in successfully, but couldn't join classroom: ${data.error}. Redirecting to dashboard...`
        );
        
        setTimeout(() => {
          redirect('/student-dashboard');
        }, 3000);
      }
    } catch (error) {
      console.error('Error processing join token:', error);
      showAlert(
        "warning",
        "Authentication Successful", 
        "Signed in successfully, but couldn't join classroom. Redirecting to dashboard..."
      );
      
      setTimeout(() => {
        redirect('/student-dashboard');
      }, 3000);
    }
  };

  const getUserRole = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user role:", error.message);
        return "student"; // Default to student if error
      }

      return data?.role || "student";
    } catch (err) {
      console.error("Unexpected error fetching user role:", err.message);
      return "student";
    }
  };

  const updateDatabase = async (user) => {
    console.log("Updating database for user:", user);
    try {
      // Use upsert to handle cases where profile might already exist
      const { data, error } = await supabase.from("profiles").upsert(
        [
          {
            id: user.id,
            email: user.email,
            created_at: new Date().toISOString(),
            role: role,
          },
        ],
        {
          onConflict: "id",
        }
      );

      if (error) {
        console.error("Error updating user profile:", error.message);
      } else {
        console.log("User profile updated successfully:", data);
      }
    } catch (err) {
      console.error("Unexpected error during database update:", err.message);
    }
  };

  const validatePassword = (value) => {
    if (value.length < 6) {
      return "Password must be at least 6 characters long";
    }
    return value === "admin" ? "Nice try!" : null;
  };

  const validateConfirmPassword = (value) => {
    if (isSignUp && value !== password) {
      return "Passwords do not match";
    }
    return null;
  };

  return (
    <div className="relative w-full h-full">
      {alertVisible && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-full">
          <Alert
            variant={alertType === "danger" ? "destructive" : alertType === "success" ? "success" : "default"}
            onClose={() => setAlertVisible(false)}
          >
            <AlertTitle>{alertTitle}</AlertTitle>
            <AlertDescription>
              {alertDescription}
              {alertType === "success" && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="ml-4 mt-2"
                  onClick={() => window.open("https://mail.google.com", "_blank")}
                >
                  Verify
                </Button>
              )}
            </AlertDescription>
          </Alert>
        </div>
      )}

      <div className="flex h-full w-full items-center justify-center px-4">
        <div className="flex w-full max-w-sm flex-col gap-4 rounded-large">
          <div className="flex flex-col items-center pb-6">
            <Image
              aria-hidden
              src="/2.png"
              alt="Globe icon"
              width={90}
              height={90}
            />

            <p className="text-xl font-medium">
              {joinContext 
                ? (isSignUp ? "Join Classroom" : "Join Classroom") 
                : (isSignUp ? "Create an Account" : "Welcome Back")
              }
            </p>
            <p className="text-small text-default-500">
              {joinContext 
                ? `${isSignUp ? 'Create an account' : 'Sign in'} to join ${joinContext.class_name}`
                : (isSignUp
                  ? "Sign up to start your journey"
                  : "Log in to your account to continue")
              }
            </p>
            {joinContext && (
              <div className="mt-2 p-2 bg-primary-50 rounded-lg border border-primary-200">
                <p className="text-xs text-primary-700 text-center">
                  🎓 You've been invited to join <strong>{joinContext.class_name}</strong>
                </p>
              </div>
            )}
          </div>

          <form
            className="flex flex-col gap-3"
            onSubmit={handleSubmit}
          >
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email Address *</label>
              <Input
                required
                id="email"
                name="email"
                placeholder="Enter your email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">Password *</label>
              <div className="relative">
                <Input
                  required
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  type={isVisible ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={toggleVisibility}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {isVisible ? (
                    <Icon
                      className="text-2xl text-muted-foreground"
                      icon="solar:eye-closed-linear"
                    />
                  ) : (
                    <Icon
                      className="text-2xl text-muted-foreground"
                      icon="solar:eye-bold"
                    />
                  )}
                </button>
              </div>
            </div>

            {isSignUp && (
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password *</label>
                <Input
                  required
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  type={isVisible ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            )}

            <div className="flex w-full items-center justify-between px-1 py-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" name="remember" />
                <label htmlFor="remember" className="text-sm">Remember me</label>
              </div>
              {!isSignUp && (
                <Link className="text-sm text-muted-foreground hover:text-primary" href="#">
                  Forgot password?
                </Link>
              )}
            </div>

            {isSignUp && !joinContext && (
              <div className="flex justify-center py-2">
                <div className="flex items-center space-x-2 border rounded-full px-2 py-1 bg-gray-100">
                  <span
                    className={`text-sm px-2 py-1 rounded-full cursor-pointer transition ${
                      role === "student"
                        ? "bg-primary text-white"
                        : "text-gray-600"
                    }`}
                    onClick={() => setRole("student")}
                  >
                    Student
                  </span>
                  <span
                    className={`text-sm px-2 py-1 rounded-full cursor-pointer transition ${
                      role === "teacher"
                        ? "bg-primary text-white"
                        : "text-gray-600"
                    }`}
                    onClick={() => setRole("teacher")}
                  >
                    Teacher
                  </span>
                </div>
              </div>
            )}

            <Button
              className="w-full"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  {isSignUp ? "Signing Up..." : "Signing In..."}
                </>
              ) : (
                isSignUp ? "Sign Up" : "Sign In"
              )}
            </Button>
          </form>

          <div className="flex items-center gap-4 py-2">
            <Separator className="flex-1" />
            <p className="shrink-0 text-sm text-muted-foreground">OR</p>
            <Separator className="flex-1" />
          </div>

          <div className="flex flex-col gap-2">
            <Button
              onClick={signInWithGoogle}
              variant="outline"
              className="w-full"
            >
              <Icon icon="flat-color-icons:google" width={24} className="mr-2" />
              Continue with Google
            </Button>
            <Button
              variant="outline"
              className="w-full"
            >
              <Icon icon="fe:github" width={24} className="mr-2" />
              Continue with GitHub
            </Button>
          </div>

          <p className="text-center text-sm">
            {isSignUp
              ? "Already have an account?"
              : "Need to create an account?"}{" "}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary hover:underline"
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AuthForm() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Spinner /></div>}>
      <AuthFormContent />
    </Suspense>
  );
}
