// File: app/api/grade-cloud/route.js
// Cloud Run based autograding API endpoint

import { createClient } from '../../../../utils/supabase/client';
import { NextResponse } from 'next/server';

const supabase = createClient();

export async function POST(request) {
  const { studentCode, testing_path } = await request.json();
  
  console.log("Cloud Run grading request received:", { testing_path });
  
  // Get Cloud Run service URL from environment
  const cloudRunUrl = process.env.CLOUD_RUN_AUTOGRADER_URL;
  if (!cloudRunUrl) {
    console.error("CLOUD_RUN_AUTOGRADER_URL environment variable not set");
    return NextResponse.json({ 
      error: 'Cloud Run autograder service not configured' 
    }, { status: 500 });
  }

  try {
    // Download test file from Supabase Storage
    console.log(`Downloading test file: ${testing_path}`);
    const testFileData = await getAssignmentTestFile(testing_path);
    
    if (!testFileData) {
      throw new Error('Failed to download test file from Supabase');
    }

    // Convert test file to base64 for API transmission
    const testFileBuffer = await testFileData.arrayBuffer();
    const testFileBase64 = Buffer.from(testFileBuffer).toString('base64');
    const testFileName = testing_path.split('/').pop(); // Extract filename

    console.log(`Sending grading request to Cloud Run: ${cloudRunUrl}/grade`);

    // Send request to Cloud Run service
    const cloudRunResponse = await fetch(`${cloudRunUrl}/grade`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        studentCode: studentCode,
        testFileData: testFileBase64,
        testFileName: testFileName
      }),
      // 10 minute timeout for complex grading
      signal: AbortSignal.timeout(600000)
    });

    if (!cloudRunResponse.ok) {
      const errorBody = await cloudRunResponse.json().catch(() => ({}));
      throw new Error(
        errorBody.error || `Cloud Run service failed with status: ${cloudRunResponse.status}`
      );
    }

    const gradingResult = await cloudRunResponse.json();
    console.log("Received grading result from Cloud Run:", gradingResult);

    // Return the results in the same format as the original API
    return NextResponse.json(gradingResult);

  } catch (error) {
    console.error("Cloud Run grading process failed:", error);
    
    // Handle timeout errors specifically
    if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
      return NextResponse.json({ 
        error: 'Grading request timed out. Please try again with simpler code.',
        details: 'The grading process took too long to complete'
      }, { status: 408 });
    }

    // Handle network errors
    if (error.message.includes('fetch')) {
      return NextResponse.json({ 
        error: 'Failed to connect to grading service',
        details: 'The Cloud Run autograder service is temporarily unavailable'
      }, { status: 503 });
    }

    return NextResponse.json({ 
      error: 'Grading failed on the server.',
      details: error.message 
    }, { status: 500 });
  }
}

// Helper function to download test file from Supabase Storage
async function getAssignmentTestFile(path) {
  try {
    console.log("Fetching assignment test file:", path);
    
    if (!path) {
      console.error("No test file path provided");
      return null;
    }

    // Download the file from Supabase Storage
    const { data, error } = await supabase
      .storage
      .from('testing')
      .download(path);

    if (error) {
      console.error("Error downloading test file:", error.message);
      return null;
    }

    if (!data) {
      console.error("No data received from Supabase Storage");
      return null;
    }

    console.log("Test file downloaded successfully");
    return data; // This is a Blob object
  } catch (error) {
    console.error("Exception in getAssignmentTestFile:", error);
    return null;
  }
}