import { createClient } from "../../utils/supabase/server";
export const fetchAssignments = async () => {
  // check user
  const supabase = await createClient();
  const { data: user, error: userError } = await supabase.auth.getUser();

  if (userError) {
    console.error("Error fetching user:", userError); // chck this fora user error
    return [];
  }
  const { data, error } = await supabase
    .from("assignments")
    .select("*")
    .eq("id", 17)
    .single();

  if (error) {
    console.error("Error fetching assignments:", error);
    return [];
  }

  return data;
};
