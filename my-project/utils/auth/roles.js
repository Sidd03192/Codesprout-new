import { createServerClient } from "@supabase/ssr";

export async function getUserRole(request) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Middleware handles this differently
        },
      },
    }
  );
 
  try {
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    console.log("🔍 Middleware - User:", user?.id, "Error:", userError);

    if (userError || !user) {
      return { user: null, role: null, error: userError };
    }

    const { data: userData, error: roleError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    console.log("🎭 Middleware - User role data:", userData, "Error:", roleError);

    if (roleError) {
      console.error("❌ Error fetching user role:", roleError.message);
      return { user, role: "student", error: roleError }; // Default to student on error
    }

    const role = userData?.role || "student";
    console.log("✅ Middleware - Final role:", role);

    return { 
      user, 
      role, 
      error: null 
    };
  } catch (err) {
    console.error("Unexpected error in getUserRole:", err.message);
    return { user: null, role: null, error: err };
  }
}

export function getRoleBasedRedirectPath(role) {
  switch (role) {
    case "teacher":
      return "/dashboard";
    case "student":
      return "/student-dashboard";
    default:
      return "/student-dashboard"; // Default to student dashboard
  }
}