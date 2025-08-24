import { NextResponse } from "next/server";
import { createClient } from "../../../../utils/supabase/server";

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const classroomId = searchParams.get('id');

    if (!classroomId) {
      return NextResponse.json(
        { error: "Classroom ID is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // First, verify that the classroom belongs to the authenticated user
    const { data: classroom, error: classroomError } = await supabase
      .from("classes")
      .select("id, teacher_id, name")
      .eq("id", classroomId)
      .single();

    if (classroomError) {
      console.error("Error fetching classroom:", classroomError);
      return NextResponse.json(
        { error: "Classroom not found" },
        { status: 404 }
      );
    }

    if (classroom.teacher_id !== user.id) {
      return NextResponse.json(
        { error: "You don't have permission to delete this classroom" },
        { status: 403 }
      );
    }

    // Delete the classroom - enrollments will cascade automatically if FK is set up with CASCADE
    const { error: deleteError } = await supabase
      .from("classes")
      .delete()
      .eq("id", classroomId)
      .eq("teacher_id", user.id);

    if (deleteError) {
      console.error("Error deleting classroom:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete classroom" },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: `Classroom "${classroom.name}" has been deleted successfully` 
    });

  } catch (error) {
    console.error("Unexpected error in delete classroom:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}