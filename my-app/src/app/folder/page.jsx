// Remove "use server" - this is for server actions, not page components
import React from "react";
import { Button } from "@heroui/react";
import { createClient } from "../../../utils/supabase/server";
import { fetchAssignments } from "../api";
const Page = async () => {
  const supabase = await createClient(); // Add await here

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(); // Destructure correctly

  const assignments = await fetchAssignments(); // Fetch assignments
  console.log("User data:", user);
  console.log("Error:", error);

  // Page components must return JSX
  return (
    <div className="p-8">
      <Button color="primary">Sign Out</Button>
      <h1 className="text-2xl font-bold mb-4">User Info</h1>
      {user ? (
        <div className="bg-green-50 p-4 rounded-md">
          <h2 className="text-lg font-semibold text-green-800">Logged In</h2>
          <p className="text-green-700">Email: {user.email}</p>
          <p className="text-green-700">ID: {user.id}</p>
          <pre className="mt-2 text-xs bg-green-100 p-2 rounded overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
          <pre className="mt-2 text-xs bg-green-100 p-2 rounded overflow-auto">
            {JSON.stringify(assignments, null, 2)}
          </pre>
        </div>
      ) : (
        <div className="bg-red-50 p-4 rounded-md">
          <h2 className="text-lg font-semibold text-red-800">Not Logged In</h2>
          <p className="text-red-700">Please log in to see user data</p>
          {error && (
            <p className="text-red-600 text-sm mt-2">Error: {error.message}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Page;
