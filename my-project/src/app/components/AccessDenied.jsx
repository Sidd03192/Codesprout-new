"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import { createClient } from "../../../utils/supabase/client";

const AccessDenied = ({ userRole = "student" }) => {
  const router = useRouter();

  const handleGoToStudentDashboard = () => {
    router.push("/student-dashboard");
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/authentication");
  };

  return (
    <div className="flex h-screen w-full bg-gradient-to-br from-[#1e2b22] via-[#1e1f2b] to-[#2b1e2e] items-center justify-center p-4">
      <Card className="max-w-md w-full bg-zinc-900/50 border border-zinc-800">
        <CardContent className="text-center p-8">
          <div className="mb-6">
            <div className="rounded-full bg-red-500/20 w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <Icon 
                icon="lucide:shield-x" 
                className="text-4xl text-red-400"
              />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Access Restricted</h1>
            <p className="text-zinc-400 mb-6">
              This teacher dashboard is not accessible with your current role: <span className="text-white font-semibold">{userRole}</span>
            </p>
          </div>
          
          <div className="space-y-3">
            <Button
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={handleGoToStudentDashboard}
            >
              <Icon icon="lucide:graduation-cap" className="text-lg" />
              Go to Student Dashboard
            </Button>

            <Button
              variant="outline"
              className="w-full border-zinc-600 text-zinc-300 hover:bg-zinc-800"
              onClick={handleSignOut}
            >
              <Icon icon="lucide:log-out" className="text-lg" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessDenied;