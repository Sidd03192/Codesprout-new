"use client";
import React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  Button,
  useDisclosure,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { Sidebar } from "../components/student-sidebar";
import { useEffect, useCallback } from "react";
import { createClient } from "../../../utils/supabase/client";
// Add student page imports
import { StudentOverview } from "./overview";
import { StudentAssignments } from "./assignments";
import { StudentGrades } from "./grades";
import { StudentCourses } from "./courses";
import { getAssignmentsData } from "./api";
import { insertUserIfNew } from "../dashboard/api";

export default function StudentDashboard() {
  const supabase = createClient();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [assignments, setAssignments] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  // Add active page state
  const [activePage, setActivePage] = React.useState("overview");

  // Add user type state (teacher or student)
  const [userType, setUserType] = React.useState("student"); // "teacher" or "student"

  // Mock session for demo purposes
  const [session, setSession] = React.useState(null); // null = logged out, object = logged in

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        console.log("session:", session);
      }
    );
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    insertUserIfNew("student");
  }, []);

  const handleRefresh = () => {
    console.log("Refreshing assignments...");
    // include logic to put a cooldown on the refresh button
    fetchAndScheduleAssignments();
  };

  const fetchAndScheduleAssignments = useCallback(async () => {
    if (!session) {
      console.log("No session found", session);
      return;
    }
    setIsLoading(true);
    console.log("Fetching assignments for student ID:", session.user.id);
    const result = await getAssignmentsData(session.user.id);
    console.log("fetch result", result);

    if (result.error) {
      setError(result.error);
      setIsLoading(false);
      return;
    }

    setAssignments(result.visibleAssignments || []);
    setIsLoading(false);

    // look for future assignmetns

    if (result.nextStartTime) {
      const startTime = new Date(result.nextStartTime).getTime();
      const now = Date.now();
      const delay = startTime - now;

      if (delay > 0) {
        console.log(
          `Checking for new assignments in ${Math.round(delay / 1000)} seconds.`
        );

        const timerId = setTimeout(() => {
          console.log("Scheduled time reached! Refreshing list...");
          fetchAndScheduleAssignments();
        }, delay);

        return () => clearTimeout(timerId);
      }
    }
  }, [session?.user?.id]);

  useEffect(() => {
    // Only try to fetch data if the session actually exists
    if (session) {
      fetchAndScheduleAssignments();
    }
  }, [session?.user?.id, fetchAndScheduleAssignments]);
  // For mobile view
  const isMobile = React.useMemo(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 768;
    }
    return false;
  }, []);

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarCollapsed(true);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      onOpen();
    } else {
      setIsSidebarCollapsed(!isSidebarCollapsed);
    }
  };

  // Render the active page component based on user type
  const renderActivePage = () => {
    switch (activePage) {
      case "overview":
        return <StudentOverview />;
      case "assignments":
        return (
          <StudentAssignments
            session={session}
            assignments={assignments}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            error={error}
            setError={setError}
            handleRefresh={handleRefresh}
          />
        );
      case "grades":
        return <StudentGrades />;
      case "courses":
        return session?.user ? (
          <StudentCourses user_id={session.user.id} />
        ) : (
          <div>Loading session...</div>
        );
      default:
        return <StudentOverview />;
    }
  };

  // Handle page change
  const handlePageChange = (page) => {
    console.log("Changing page to:", page);
    setActivePage(page);
  };

  // Toggle between teacher and student view (for demo purposes)
  const toggleUserType = () => {
    setUserType(userType === "teacher" ? "student" : "teacher");
    setActivePage("overview");
  };

  // Handle login/dashboard navigation
  const handleLogin = () => {
    // Mock login for demo
    setSession({
      user: {
        name: userType === "teacher" ? "John Doe" : "Alex Johnson",
        email:
          userType === "teacher"
            ? "john.doe@example.com"
            : "alex.johnson@example.com",
        image: `https://img.heroui.chat/image/avatar?w=40&h=40&u=${
          userType === "teacher" ? "teacher1" : "student1"
        }`,
      },
    });
  };

  const handleDashboard = () => {
    // Navigate to dashboard
    setActivePage("overview");
  };

  return (
    <div className="flex flex-col h-screen w-full bg-gradient-to-br from-[#1e2b22] via-[#1e1f2b] to-[#2b1e2e]">
      {/* Add navbar at the top */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <div
            className={`h-full transition-all duration-300 ${
              isSidebarCollapsed ? "w-16" : "w-64"
            } border-r border-divider bg-zinc-900/50`}
          >
            <Sidebar
              isCollapsed={isSidebarCollapsed}
              activePage={activePage}
              setActivePage={handlePageChange}
              userType={userType}
            />
          </div>
        )}

        {/* Mobile Drawer */}
        {isMobile && (
          <Drawer isOpen={isOpen} onOpenChange={onOpenChange} placement="left">
            <DrawerContent>
              {(onClose) => (
                <>
                  <DrawerHeader className="border-b border-divider">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="rounded-full bg-content3 p-1">
                          <Icon
                            icon={
                              userType === "teacher"
                                ? "lucide:book-open"
                                : "lucide:graduation-cap"
                            }
                            className="text-foreground"
                          />
                        </div>
                        <span className="font-semibold">
                          {userType === "teacher" ? "Teacher" : "Student"}{" "}
                          Dashboard
                        </span>
                      </div>
                      <Button isIconOnly variant="light" onPress={onClose}>
                        <Icon icon="lucide:x" />
                      </Button>
                    </div>
                  </DrawerHeader>
                  <DrawerBody className="p-0">
                    <Sidebar
                      isCollapsed={false}
                      activePage={activePage}
                      setActivePage={(page) => {
                        handlePageChange(page);
                        onClose();
                      }}
                      userType={userType}
                    />
                  </DrawerBody>
                </>
              )}
            </DrawerContent>
          </Drawer>
        )}

        {/* Main Content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header - Modified to remove duplicate functionality now in navbar */}
          <header className="flex h-14 items-center border-b border-divider px-4 bg-zinc-900/50">
            <Button
              isIconOnly
              variant="light"
              onPress={toggleSidebar}
              className="mr-2"
            >
              <Icon
                icon={
                  isSidebarCollapsed ? "lucide:menu" : "lucide:panel-left-close"
                }
                className="text-lg"
              />
            </Button>
            <div className="flex items-center gap-2">
              <Icon
                icon={
                  userType === "teacher"
                    ? activePage === "overview"
                      ? "lucide:layout-dashboard"
                      : activePage === "assignments"
                      ? "lucide:file-text"
                      : activePage === "gradebook"
                      ? "lucide:bar-chart-2"
                      : "lucide:users"
                    : activePage === "overview"
                    ? "lucide:layout-dashboard"
                    : activePage === "assignments"
                    ? "lucide:file-text"
                    : activePage === "grades"
                    ? "lucide:bar-chart-2"
                    : "lucide:book"
                }
                className="text-lg"
              />
              <h1 className="text-lg font-medium capitalize">{activePage}</h1>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto p-4  ">
            {renderActivePage()}
          </main>
        </div>
      </div>
    </div>
  );
}
