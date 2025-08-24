import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import {
  getUserRole,
  getRoleBasedRedirectPath,
} from "../../utils/auth/roles.js";

export async function updateSession(request) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const currentPath = request.nextUrl.pathname;
  console.log("🚀 Middleware triggered for path:", currentPath);

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()

  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("🔐 Middleware - User found:", !!user, user?.id);

  // Handle unauthenticated users
  if (!user) {
    console.log(
      "❌ No user, checking if path is allowed for unauthenticated users"
    );
    // Allow access to authentication pages and auth callback
    if (
      currentPath.startsWith("/authentication") ||
      currentPath.startsWith("/auth/callback") ||
      currentPath === "/"
    ) {
      console.log("✅ Allowing unauthenticated access to:", currentPath);
      return supabaseResponse;
    }

    // Redirect to authentication for protected routes
    console.log("🔒 Redirecting unauthenticated user to /authentication");
    const url = request.nextUrl.clone();
    url.pathname = "/authentication";
    return NextResponse.redirect(url);
  }

  // Handle authenticated users - role-based routing
  console.log("👤 User authenticated, getting role...");
  const { role } = await getUserRole(request);
  console.log("🎭 User role determined:", role);

  // If user is on root path, redirect to appropriate dashboard
  if (currentPath === "/") {
    const redirectPath = getRoleBasedRedirectPath(role);
    console.log("🏠 Redirecting from root to:", redirectPath);
    const url = request.nextUrl.clone();
    url.pathname = redirectPath;
    return NextResponse.redirect(url);
  }

  // Protect dashboard routes based on role
  if (currentPath.startsWith("/dashboard") && role === "student") {
    console.log(
      "🚫 Student trying to access teacher dashboard, redirecting to student dashboard"
    );
    const url = request.nextUrl.clone();
    url.pathname = "/student-dashboard";
    return NextResponse.redirect(url);
  }

  if (currentPath.startsWith("/student-dashboard") && role === "teacher") {
    console.log(
      "🚫 Teacher trying to access student dashboard, redirecting to teacher dashboard"
    );
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from authentication pages
  if (currentPath.startsWith("/authentication")) {
    const redirectPath = getRoleBasedRedirectPath(role);
    console.log(
      "🔄 Redirecting authenticated user away from auth page to:",
      redirectPath
    );
    const url = request.nextUrl.clone();
    url.pathname = redirectPath;
    return NextResponse.redirect(url);
  }

  console.log("✅ Middleware allowing access to:", currentPath);

  return supabaseResponse;
}
