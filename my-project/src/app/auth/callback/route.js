// app/auth/callback/route.js
import { NextResponse } from "next/server";
import { createClient } from "../../../../utils/supabase/server";

async function getUserRole(supabase, userId) {
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
}

async function createUserProfile(supabase, user) {
  try {
    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    if (!existingProfile) {
      // Create profile with default student role for OAuth users
      const { error } = await supabase.from("profiles").insert({
        id: user.id,
        email: user.email,
        role: "student", // Default role for OAuth sign-ups
        created_at: new Date().toISOString(),
      });

      if (error) {
        console.error("Error creating user profile:", error.message);
      }
    }
  } catch (err) {
    console.error("Error in createUserProfile:", err.message);
  }
}

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // Get the authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Ensure user profile exists (for OAuth users)
        await createUserProfile(supabase, user);
        
        // Get user role and redirect to appropriate dashboard
        const role = await getUserRole(supabase, user.id);
        const redirectPath = role === "teacher" ? "/dashboard" : "/student-dashboard";
        
        const forwardedHost = request.headers.get("x-forwarded-host");
        const isLocalEnv = process.env.NODE_ENV === "development";
        
        // Use custom redirect path or the role-based one
        const finalPath = next && next !== "/" ? next : redirectPath;
        
        if (isLocalEnv) {
          return NextResponse.redirect(`${origin}${finalPath}`);
        } else if (forwardedHost) {
          return NextResponse.redirect(`https://${forwardedHost}${finalPath}`);
        } else {
          return NextResponse.redirect(`${origin}${finalPath}`);
        }
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}