"use client";

import { Landing } from "./landing-new/landing";
import { createClient } from "../../utils/supabase/client";
import { useEffect, useState } from "react";

export default function Home() {
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const supabase = createClient();

  useEffect(() => {
    let isMounted = true;
    
    // Add a timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      if (isMounted && isLoading) {
        console.warn("⏰ Loading timeout reached, forcing loading to false");
        setIsLoading(false);
        setError("Loading timed out. Please refresh the page.");
      }
    }, 10000); // 10 second timeout

    const getSessionData = async () => {
      try {
        console.log("📡 Getting session data...");
        
        // Test Supabase connection first
        const { data: testData, error: testError } = await supabase
          .from("users")
          .select("count")
          .limit(1);
        
        if (testError) {
          console.error("❌ Supabase connection test failed:", testError);
          throw new Error("Database connection failed");
        }
        
        console.log("✅ Supabase connection test passed");
        
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("❌ Session error:", sessionError);
          throw sessionError;
        }
        
        console.log("🔐 Session result:", { hasSession: !!currentSession });
        
        if (!isMounted) return;
        setSession(currentSession);
        
        if (currentSession?.user) {
          console.log("👤 User found, getting role for:", currentSession.user.id);
          
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("role")
            .eq("id", currentSession.user.id)
            .single();
          
          if (userError && userError.code !== 'PGRST116') { // PGRST116 is "not found"
            console.error("❌ User role error:", userError);
            // Don't throw here, just use default role
          }
          
          console.log("👨‍💼 User role result:", { userData, userError });
          
          if (!isMounted) return;
          setUserRole(userData?.role || "student");
        } else {
          console.log("❌ No user session found");
        }
        
        if (!isMounted) return;
        console.log("✅ Setting loading to false");
        setIsLoading(false);
        clearTimeout(loadingTimeout);
        
      } catch (error) {
        console.error("💥 Error getting session:", error);
        if (!isMounted) return;
        setError(error.message);
        setIsLoading(false);
        clearTimeout(loadingTimeout);
      }
    };

    getSessionData();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("🔄 Auth state changed:", { event, hasSession: !!session });
        
        if (!isMounted) return;
        setSession(session);
        
        if (session?.user) {
          try {
            console.log("👤 Auth change - getting user role for:", session.user.id);
            const { data: userData, error: userError } = await supabase
              .from("users")
              .select("role")
              .eq("id", session.user.id)
              .single();
            
            console.log("👨‍💼 Auth change - user role result:", { userData, userError });
            if (!isMounted) return;
            setUserRole(userData?.role || "student");
          } catch (error) {
            console.error("💥 Error getting user role on auth change:", error);
            if (!isMounted) return;
            setUserRole("student"); // Default fallback
          }
        } else {
          console.log("❌ Auth change - no user");
          if (!isMounted) return;
          setUserRole(null);
        }
        
        if (!isMounted) return;
        console.log("✅ Auth change - setting loading to false");
        setIsLoading(false);
        clearTimeout(loadingTimeout);
      }
    );

    return () => {
      console.log("🧹 Cleaning up auth subscription");
      isMounted = false;
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
  }, []); // Remove supabase dependency to prevent recreating

  console.log("🖼️ Render state:", { isLoading, hasSession: !!session, userRole, error });

  if (error) {
    return (
      <div className="flex h-screen w-full bg-gradient-to-br from-[#1e2b22] via-[#1e1f2b] to-[#2b1e2e] items-center justify-center">
        <div className="text-center text-white">
          <div className="text-red-400 mb-4">Error: {error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  

  return (
    <>
      <Landing session={session} userRole={userRole} />
    </>
  );
}