"use client";

import React, { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Spinner,
  Alert,
  Chip,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { createClient } from "../../../../utils/supabase/client";

export default function JoinClassroomPage({ params }) {
  const router = useRouter();
  const supabase = createClient();

  // Unwrap the params Promise using React.use()
  const unwrappedParams = use(params);
  const { token: joinCode } = unwrappedParams;

  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [classData, setClassData] = useState(null);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    validateCodeAndUser();
  }, [joinCode]);

  const validateCodeAndUser = async () => {
    try {
      setLoading(true);

      // Run auth check and classroom lookup in parallel
      const [userResult, classroomResult] = await Promise.all([
        supabase.auth.getUser(),
        supabase
          .from("classes")
          .select("id, name, teacher_id")
          .eq("join_id", parseInt(joinCode))
          .single(),
      ]);

      const currentUser = userResult.data.user;
      setUser(currentUser);

      if (classroomResult.error || !classroomResult.data) {
        setError("Invalid class code");
        setLoading(false);
        return;
      }

      const classroom = classroomResult.data;
      setClassData(classroom);

      // If user is authenticated, check enrollment in a single query
      if (currentUser) {
        const { data: existingEnrollment } = await supabase
          .from("enrollments")
          .select("id")
          .eq("student_id", currentUser.id)
          .eq("class_id", classroom.id)
          .maybeSingle();

        if (existingEnrollment) {
          router.push("/student-dashboard");
          return;
        }
      }
    } catch (err) {
      console.error("Error validating join code:", err);
      setError("Failed to validate join code");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClassroom = async () => {
    try {
      setJoining(true);

      // Get user info for enrollment
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("email")
        .eq("id", user.id)
        .single();

      if (userError || !userData) {
        setError("User data not found");
        return;
      }

      // Create enrollment directly
      const { error: enrollmentError } = await supabase
        .from("enrollments")
        .insert({
          student_id: user.id,
          class_id: classData.id,
          enrolled_at: new Date().toISOString(),
          full_name: user.user_metadata?.full_name || "Student",
          email: userData.email,
        });

      if (enrollmentError) {
        console.error("Error creating enrollment:", enrollmentError);
        setError("Failed to join classroom");
        return;
      }

      // Success - redirect to student dashboard
      router.push("/student-dashboard");
    } catch (err) {
      console.error("Error joining classroom:", err);
      setError("Failed to join classroom");
    } finally {
      setJoining(false);
    }
  };

  const handleSignUp = () => {
    // Redirect to authentication with join context
    router.push(
      `/authentication?join_code=${joinCode}&redirect_after_auth=true`
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardBody className="flex flex-col items-center gap-4 py-8">
            <Spinner size="lg" color="primary" />
            <p className="text-center text-foreground-600">
              Validating join link...
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 bg-danger-100 rounded-full">
                <Icon
                  icon="lucide:alert-circle"
                  className="text-2xl text-danger"
                />
              </div>
              <h1 className="text-xl font-semibold text-danger">
                Join Link Error
              </h1>
            </div>
          </CardHeader>
          <CardBody className="text-center space-y-4">
            <Alert color="danger" variant="flat">
              {error}
            </Alert>
            <Button
              color="primary"
              variant="flat"
              onPress={() => router.push("/")}
            >
              Go to Homepage
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (!user) {
    // User is not authenticated - show signup/signin options
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1e2b22] via-[#1e1f2b] to-[#2b1e2e] p-4">
        <Card className="w-full max-w-md bg-zinc-900/20 border border-zinc-800">
          <CardHeader className="text-center items-center flex justify-center">
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="p-3 bg-success-100 rounded-full">
                <Icon icon="lucide:users" className="text-2xl text-success" />
              </div>
              <h1 className="text-xl font-semibold">Join Classroom</h1>
              <Chip color="primary" variant="flat">
                {classData?.name}
              </Chip>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-foreground-600">
                You've been invited to join <strong>{classData?.name}</strong>
              </p>
              <p className="text-sm text-foreground-500">
                Sign up or sign in to join this classroom
              </p>
            </div>

            <div className="space-y-3">
              <Button
                color="primary"
                className="w-full"
                size="lg"
                onPress={handleSignUp}
                startContent={<Icon icon="lucide:user-plus" />}
              >
                Create Account & Join
              </Button>

              <Button
                color="primary"
                variant="bordered"
                className="w-full"
                size="lg"
                onPress={handleSignUp}
                startContent={<Icon icon="lucide:log-in" />}
              >
                Sign In & Join
              </Button>
            </div>

            <div className="text-center pt-4">
              <p className="text-xs text-foreground-400">
                By joining, you'll be automatically enrolled in this classroom
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  // User is authenticated and joining
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1e2b22] via-[#1e1f2b] to-[#2b1e2e] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center items-center flex justify-center">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="p-3 bg-success-100 rounded-full">
              <Icon icon="lucide:users" className="text-2xl text-success" />
            </div>
            <h1 className="text-xl font-semibold">Join Classroom</h1>
            <Chip color="primary" variant="flat">
              {classData?.name}
            </Chip>
          </div>
        </CardHeader>
        <CardBody className="text-center space-y-4">
          {joining ? (
            <>
              <Spinner size="lg" color="primary" />
              <p className="text-foreground-600">
                Adding you to the classroom...
              </p>
            </>
          ) : (
            <>
              <p className="text-foreground-600">
                You're about to join <strong>{classData?.name}</strong>
              </p>
              <Button
                color="primary"
                size="lg"
                className="w-full"
                onPress={handleJoinClassroom}
                startContent={<Icon icon="lucide:user-check" />}
              >
                Join Classroom
              </Button>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
