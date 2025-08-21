"use client";
import React, { useState, useEffect, useCallback } from "react";
import { CodingInterface } from "../../../components/student-workspace";
import {
  getAssignmentDetails,
  fetchStudentData,
  saveAssignment,
} from "../../api";
import { Spinner } from "@heroui/react";
import { createClient } from "../../../../../utils/supabase/client.jsx";

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Assignment page error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-full bg-gradient-to-br from-[#1e2b22] via-[#1e1f2b] to-[#2b1e2e] flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Something went wrong</h2>
            <p className="text-white/70 mb-6">Failed to load assignment page</p>
            <button 
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Simple cache key generator
const getCacheKey = (assignmentId) => `assignment_${assignmentId}`;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// Basic data validation
const isValidAssignmentData = (data) => {
  return (
    data &&
    typeof data.id !== "undefined" &&
    typeof data.title === "string" &&
    typeof data.description !== "undefined"
  );
};

function AssignmentPage({ params }) {
  const [assignmentData, setAssignmentData] = useState(null);
  const [submissionData, setSubmissionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assignmentId, setAssignmentId] = useState(null);

  // Handle async params
  useEffect(() => {
    const resolveParams = async () => {
      try {
        console.log('Resolving params:', params);
        const resolvedParams = await params;
        console.log('Resolved params:', resolvedParams);
        setAssignmentId(resolvedParams.id);
      } catch (error) {
        console.error('Error resolving params:', error);
        setError('Failed to resolve assignment ID');
        setLoading(false);
      }
    };
    resolveParams();
  }, [params]);

  // Get cached data with expiration check (browser-safe)
  const getCachedData = useCallback((id) => {
    // Check if we're in the browser
    if (typeof window === "undefined") return null;

    try {
      const cacheKey = getCacheKey(id);
      const cached = sessionStorage.getItem(cacheKey);

      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);

      // Check if cache is expired
      if (Date.now() - timestamp > CACHE_DURATION) {
        sessionStorage.removeItem(cacheKey);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error reading cache:", error);
      return null;
    }
  }, []);

  // Cache data with timestamp (browser-safe)
  const setCachedData = useCallback((id, data) => {
    // Check if we're in the browser
    if (typeof window === "undefined") return;

    try {
      const cacheKey = getCacheKey(id);
      const cacheEntry = {
        data,
        timestamp: Date.now(),
      };
      sessionStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
    } catch (error) {
      console.error("Error setting cache:", error);
    }
  }, []);

  // Fetch assignment data with caching
  const fetchAssignmentData = useCallback(
    async (id) => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        // Try cached data first
        const cachedData = getCachedData(id);
        if (cachedData) {
          console.log("Loading from cache");
          setAssignmentData(cachedData.assignmentData);
          setSubmissionData(cachedData.submissionData);
          setLoading(false);
          return;
        }

        console.log("Fetching fresh data for assignment:", id);

        // Fetch both assignment and submission data in parallel
        const [assignmentDetails, studentSubmission] = await Promise.all([
          getAssignmentDetails(id),
          fetchStudentData(id),
        ]);

        if (!assignmentDetails) {
          throw new Error("Assignment not found");
        }

        // Basic validation
        if (!isValidAssignmentData(assignmentDetails)) {
          throw new Error("Invalid assignment data received");
        }

        // Update state
        setAssignmentData(assignmentDetails);
        setSubmissionData(studentSubmission);

        // Cache the combined data
        setCachedData(id, {
          assignmentData: assignmentDetails,
          submissionData: studentSubmission,
        });

        setLoading(false);
        console.log("Assignment data loaded successfully");
      } catch (err) {
        console.error("Error fetching assignment data:", err);
        setError(err.message || "Failed to load assignment data");
        setLoading(false);
      }
    },
    [getCachedData, setCachedData]
  );

  // Load data when assignmentId changes
  useEffect(() => {
    if (assignmentId) {
      fetchAssignmentData(assignmentId);
    }
  }, [assignmentId, fetchAssignmentData]);

  // Handle save/submit assignment
  const handleSaveAssignment = useCallback(
    async (code, isSubmit = false) => {
      if (!assignmentId || !assignmentData) return null;

      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          throw new Error("User not authenticated");
        }

        const result = await saveAssignment(
          code,
          user.id,
          assignmentId,
          isSubmit,
          new Date().toISOString(),
          assignmentData.testing_url,
          assignmentData.rubric
        );

        if (result === "success") {
          // Update local state and cache
          const updatedSubmission = {
            ...submissionData,
            submitted_code: code,
            status: isSubmit ? "submitted" : "draft",
            submitted_at: isSubmit
              ? new Date().toISOString()
              : submissionData?.submitted_at,
          };

          setSubmissionData(updatedSubmission);

          // Update cache
          setCachedData(assignmentId, {
            assignmentData,
            submissionData: updatedSubmission,
          });
        }

        return result;
      } catch (err) {
        console.error("Error saving assignment:", err);
        throw err;
      }
    },
    [assignmentId, assignmentData, submissionData, setCachedData]
  );

  // Loading state
  if (loading) {
    return (
      <div className="h-screen w-full bg-gradient-to-br from-[#1e2b22] via-[#1e1f2b] to-[#2b1e2e] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" color="secondary" />
          <p className="text-white/70">Loading assignment...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-screen w-full bg-gradient-to-br from-[#1e2b22] via-[#1e1f2b] to-[#2b1e2e] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-4">
            Error Loading Assignment
          </h2>
          <p className="text-white/70 mb-6">{error}</p>
          <button
            onClick={() => fetchAssignmentData(assignmentId)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <ErrorBoundary>
      <CodingInterface
        id={assignmentId}
        role="student"
        assignmentData={assignmentData}
        submissionData={submissionData}
        onSaveAssignment={handleSaveAssignment}
      />
    </ErrorBoundary>
  );
}

export default function AssignmentPageWrapper(props) {
  return (
    <ErrorBoundary>
      <AssignmentPage {...props} />
    </ErrorBoundary>
  );
}
