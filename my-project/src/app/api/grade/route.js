// File: app/api/grade/route.js
import { createClientForAPI } from '../../../../utils/supabase/server';
import { createClient } from '../../../../utils/supabase/client';
const supabase = createClient();
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import { createReadStream } from 'fs';
import path from 'path';
import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';
import unzipper from 'unzipper';

const execPromise = promisify(exec);


export async function POST(request) {
  const { studentCode, testing_path } = await request.json();
  console.log("Received student code and testing path:", testing_path);
  const jobDir = await fs.mkdtemp(path.join(os.tmpdir(), 'autograder-'));
    console.log(`Grading job started in temporary directory: ${jobDir}`);

  try {

    // Create the directory in server 
    const sourceDir = path.join(jobDir, 'source');
    const testsDir = path.join(jobDir, 'tests');
    const resultsDir = path.join(jobDir, 'results');
    await fs.mkdir(sourceDir);
    await fs.mkdir(testsDir);
    await fs.mkdir(resultsDir);

    console.log(`Downloading test file for assignment: ${testing_path}`);
    const testFileData = await getAssignmentTestFile(testing_path); // this shi is a file
     
    if (!testFileData) {
      throw new Error('Failed to download test file from Supabase');
    }

    const isZipFile = testing_path.endsWith('.zip');
    if (isZipFile) {
      // If it's a zip file, save it temporarily and then extract
      console.log('Detected .zip file, saving and extracting...');
      const tempZipPath = path.join(jobDir, 'temp-tests.zip');
      
      // Convert blob to buffer and save
      const buffer = await testFileData.arrayBuffer();
      await fs.writeFile(tempZipPath, Buffer.from(buffer));
      
      // Extract the zip file
      await new Promise((resolve, reject) => {
        createReadStream(tempZipPath)
          .pipe(unzipper.Extract({ path: testsDir }))
          .on('finish', resolve)
          .on('error', reject);
      });
      
      // Clean up the temporary zip file
      await fs.unlink(tempZipPath);
    } else {
      // If it's a single file, save it directly into the 'tests' directory
      console.log('Detected single file, saving...');
const fileName = path.basename(testing_path);
      const filePath = path.join(testsDir, fileName);
      console.log('File path:', filePath);
      // Convert blob to buffer and save
      const buffer = await testFileData.arrayBuffer();
      await fs.writeFile(filePath, Buffer.from(buffer));
    }
    console.log('Test files prepared successfully.');

    // Save the student's code to a file
    await fs.writeFile(path.join(sourceDir, 'Solution.java'), studentCode);

    // Get the Docker environment/image name from your assignment configuration
    // You'll need to modify this based on how you store the Docker environment info
    const environment = 'siddharth85/java-junit-autograder'; // A common base image for Java
    // Construct and run the Docker command
    // Convert Windows paths to Unix-style paths for Docker
    const sourceMount = sourceDir.replace(/\\/g, '/');
    const testsMount = testsDir.replace(/\\/g, '/');
    const resultsMount = resultsDir.replace(/\\/g, '/');
    
    const dockerCommand = `docker run --rm -v "${sourceMount}:/autograder/source" -v "${testsMount}:/autograder/tests" -v "${resultsMount}:/autograder/results" ${environment}`;
    
    console.log("Executing Docker container...");
    
    // CORRECTED: We now await the result of the command to capture its output.
    const { stdout, stderr } = await execPromise(dockerCommand);

    // If there was any output to the error stream, log it for debugging.
    if (stderr) {
      console.warn("Docker command produced an error stream:", stderr);
    }
    // Log the standard output for visibility.
    console.log("Docker command standard output:", stdout);

    const resultsPath = path.join(resultsDir, 'results.json');
        const resultsData = await fs.readFile(resultsPath, 'utf8');
    const results = JSON.parse(resultsData);
    // Check if results file exists
    try {
      await fs.access(resultsPath);
    } catch (accessError) {
      console.error('Results file not found:', resultsPath);
      return NextResponse.json({
        error: 'Autograder did not produce results file',
        details: 'The Docker container completed but no results.json was found'
      }, { status: 500 });
    }
     


    return NextResponse.json(results);

  } catch (error) {
    console.error("Autograding process failed:", error);
    return NextResponse.json({ error: 'Grading failed on the server.' }, { status: 500 });
  } finally {
    // Always clean up the temporary directory
    await fs.rm(jobDir, { recursive: true, force: true });
    console.log(`Cleaned up temporary directory: ${jobDir}`);
  }
}

// Helper function to download test file from Supabase Storage
async function getAssignmentTestFile(path) {
  // temp
  
  try {
    console.log("Fetching assignment test file:", path);
    
    if (!path) {
      console.error("No assignment ID provided, got null or undefined.");
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
    // const fileContent = await data.text()
    //     console.log("Test file downloaded successfully");

    // console.log('File contents:', fileContent)
    return data; // This is a Blob object
  } catch (error) {
    console.error("Exception in getAssignmentTestFile:", error);
    return null;
  }
}