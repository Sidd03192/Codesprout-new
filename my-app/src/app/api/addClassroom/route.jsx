import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_API_KEY // This bypasses RLS
);
export async function POST(req) {
  try {
    const body = await req.json();
    console.log("Received body:", body);

    const { name, term, teacherId } = body;

    // Get the current user first
    console.log("teacherId:", teacherId);

    // Validation
    if (!name || !term || !Array.isArray(term)) {
      console.error("Validation error:", { name, term });
      return NextResponse.json(
        { error: "Missing or invalid name or term" },
        { status: 400 }
      );
    }

    if (!teacherId) {
      console.error("No authenticated user found");
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Use current timestamp for created_at
    const createdAt = new Date().toISOString();

    console.log("Inserting into database:", {
      name,
      term,
      teacherId,
      createdAt,
    });

    const { data, error } = await supabase.from("classes").insert([
      {
        name: name,
        term: term,
        created_at: createdAt,
        teacher_id: teacherId,
      },
    ]);

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        {
          error: "Failed to add classroom to database",
          details: error.message,
        },
        { status: 500 }
      );
    }

    console.log("Insert successful:", data);
    return NextResponse.json(
      { message: "Classroom added successfully!", data },
      { status: 200 }
    );
  } catch (err) {
    console.error("Unexpected server error:", err);
    return NextResponse.json(
      { error: "Unexpected server error", details: err.message },
      { status: 500 }
    );
  }
}

const getCurrentUserId = async () => {
  try {
    const currentSession = await supabase.auth.getSession();

    console.log(currentSession);
    if (currentSession.data.session) {
      return currentSession.data.session.user.id;
    } else {
      console.log("Cant find sesssion!!!");
    }
  } catch (err) {
    console.error("Error in getCurrentUserId:", err);
    return null;
  }
};
