const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs").promises;
const path = require("path");
const { exec } = require("child_process");
const { promisify } = require("util");
const unzipper = require("unzipper");
const { createReadStream } = require("fs");

const execPromise = promisify(exec);
const app = express();
const PORT = process.env.PORT || 8080;

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "This is codesprout, at your service!",
    status: "running",
    timestamp: new Date().toISOString(),
  });
});

// Health check endpoint for Cloud Run
app.get("/health", (req, res) => {
  res
    .status(200)
    .json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Main autograding endpoint
app.post("/grade", async (req, res) => {
  const jobId = uuidv4();
  
  console.log(`[${jobId}] === GRADING REQUEST DEBUG ===`);
  console.log(`[${jobId}] just a check`);
  console.log(`[${jobId}] Content-Type:`, req.headers['content-type']);
  console.log(`[${jobId}] Request method:`, req.method);
  console.log(`[${jobId}] Request URL:`, req.url);
  console.log(`[${jobId}] Body keys:`, Object.keys(req.body || {}));
  console.log(`[${jobId}] Files:`, req.files ? 'present' : 'not present');
  
  // Handle both multipart and JSON requests
  const handleMultipart = upload.fields([
    { name: "studentCode", maxCount: 1 },
    { name: "testFile", maxCount: 1 },
  ]);

  // Only use multer if Content-Type is multipart/form-data
  if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
    console.log(`[${jobId}] Using multipart handler`);
    return new Promise((resolve, reject) => {
      handleMultipart(req, res, (err) => {
        if (err) {
          console.error(`[${jobId}] Multer error:`, err);
          return reject(err);
        }
        processGradeRequest(req, res, jobId).then(resolve).catch(reject);
      });
    });
  } else {
    console.log(`[${jobId}] Using JSON handler`);
    // Handle JSON requests directly
    return processGradeRequest(req, res, jobId);
  }
});

async function processGradeRequest(req, res, jobId) {
    console.log(`[${jobId}] Processing grade request`);

    try {
      console.log(`[${jobId}] Processing grading request`);
      
      // Extract student code and test file
      const studentCode =
        req.body.studentCode ||
        (req.files?.studentCode
          ? req.files.studentCode[0].buffer.toString("utf8")
          : null);

      if (!studentCode) {
        return res.status(400).json({
          error: "Student code is required",
          jobId,
        });
      }

      let testFileBuffer = null;
      let testFileName = null;

      if (req.files?.testFile) {
        testFileBuffer = req.files.testFile[0].buffer;
        testFileName = req.files.testFile[0].originalname;
      } else if (req.body.testFileData && req.body.testFileName) {
        // Base64 encoded test file data
        try {
          testFileBuffer = Buffer.from(req.body.testFileData, "base64");
          testFileName = req.body.testFileName;
        } catch (decodeError) {
          console.error(`[${jobId}] Base64 decode error:`, decodeError);
          return res.status(400).json({
            error: "Invalid base64 test file data",
            jobId,
          });
        }
      }

      if (!testFileBuffer || !testFileName) {
        return res.status(400).json({
          error: "Test file is required",
          jobId,
        });
      }

      console.log(`[${jobId}] Processing test file: ${testFileName}`);

      // Create temporary directory for this job
      const jobDir = path.join("/tmp", `autograder-${jobId}`);
      await fs.mkdir(jobDir, { recursive: true });

      try {
        const result = await processAutograding(
          jobId,
          jobDir,
          studentCode,
          testFileBuffer,
          testFileName
        );

        console.log(`[${jobId}] Grading completed successfully`);
        res.json({
          jobId,
          success: true,
          ...result,
        });
      } finally {
        // Cleanup temporary directory
        try {
          await fs.rm(jobDir, { recursive: true, force: true });
          console.log(`[${jobId}] Cleaned up temporary directory`);
        } catch (cleanupError) {
          console.error(`[${jobId}] Error cleaning up:`, cleanupError);
        }
      }
    } catch (error) {
      console.error(`[${jobId}] Grading failed:`, error);
      res.status(500).json({
        error: "Autograding failed",
        details: error.message,
        jobId,
      });
    }
}

async function processAutograding(
  jobId,
  jobDir,
  studentCode,
  testFileBuffer,
  testFileName
) {
  // Create directory structure
  const sourceDir = path.join(jobDir, "source");
  const testsDir = path.join(jobDir, "tests");
  const resultsDir = path.join(jobDir, "results");

  await fs.mkdir(sourceDir, { recursive: true });
  await fs.mkdir(testsDir, { recursive: true });
  await fs.mkdir(resultsDir, { recursive: true });

  console.log(`[${jobId}] Created directory structure`);

  // Handle test file (zip or single file)
  const isZipFile = testFileName.endsWith(".zip");

  if (isZipFile) {
    console.log(`[${jobId}] Extracting zip file`);
    const tempZipPath = path.join(jobDir, "temp-tests.zip");
    await fs.writeFile(tempZipPath, testFileBuffer);

    await new Promise((resolve, reject) => {
      createReadStream(tempZipPath)
        .pipe(unzipper.Extract({ path: testsDir }))
        .on("finish", resolve)
        .on("error", reject);
    });

    await fs.unlink(tempZipPath);
  } else {
    console.log(`[${jobId}] Saving single test file`);
    const filePath = path.join(testsDir, testFileName);
    await fs.writeFile(filePath, testFileBuffer);
  }

  // Save student code
  await fs.writeFile(path.join(sourceDir, "Solution.java"), studentCode);
  console.log(`[${jobId}] Saved student code`);

  // Run autograder script with smart selection
  console.log(`[${jobId}] Starting autograder execution`);
  const startTime = Date.now();

  // Smart script selection based on test complexity
  const isSimpleTest = !isZipFile && testFileName.endsWith('.java');
  let scriptName = isSimpleTest ? "run-fast.sh" : "run.sh";
  let autograderScript = path.join(__dirname, "autograder-scripts", scriptName);
  
  console.log(`[${jobId}] Selected ${scriptName} for ${isSimpleTest ? 'simple Java' : 'complex'} test`);
  
  let command = `cd "${jobDir}" && timeout 60s bash "${autograderScript}"`;

  try {
    await execPromise(command);
    const endTime = Date.now();
    console.log(`[${jobId}] Autograder execution completed in ${endTime - startTime}ms`);
  } catch (error) {
    const endTime = Date.now();
    console.log(`[${jobId}] Autograder execution failed in ${endTime - startTime}ms`);
    
    // If fast script failed (exit code 1 = fallback needed), try Maven script
    if (isSimpleTest && error.code === 1) {
      console.log(`[${jobId}] Fast script requested fallback, trying Maven script`);
      scriptName = "run.sh";
      autograderScript = path.join(__dirname, "autograder-scripts", scriptName);
      command = `cd "${jobDir}" && timeout 60s bash "${autograderScript}"`;
      
      const fallbackStartTime = Date.now();
      try {
        await execPromise(command);
        const fallbackEndTime = Date.now();
        console.log(`[${jobId}] Maven fallback completed in ${fallbackEndTime - fallbackStartTime}ms`);
      } catch (fallbackError) {
        console.error(`[${jobId}] Both scripts failed:`, fallbackError.message);
        // Let the error be handled by the results parsing below
      }
    } else {
      console.error(`[${jobId}] Script execution error:`, error.message);
      // Let the error be handled by the results parsing below
    }
  }

  // Read and return results with comprehensive error handling
  const resultsPath = path.join(resultsDir, "results.json");
  
  console.log(`[${jobId}] Reading results from: ${resultsPath}`);

  try {
    // Check if results.json exists and is readable
    await fs.access(resultsPath);
    const resultsData = await fs.readFile(resultsPath, "utf8");
    
    // Validate JSON format
    let results;
    try {
      results = JSON.parse(resultsData);
      console.log(`[${jobId}] Successfully parsed results.json`);
    } catch (parseError) {
      console.error(`[${jobId}] Invalid JSON in results.json:`, parseError.message);
      throw new Error(`Invalid JSON format: ${parseError.message}`);
    }

    // Validate results structure
    if (results.error) {
      console.log(`[${jobId}] Results contain error:`, results.error);
      return results; // Return error results as-is
    }

    // Validate successful results structure
    if (typeof results.totalPointsAchieved !== 'number' || 
        typeof results.maxTotalPoints !== 'number' || 
        !Array.isArray(results.testResults)) {
      console.error(`[${jobId}] Invalid results structure:`, Object.keys(results));
      throw new Error("Results missing required fields");
    }

    console.log(`[${jobId}] Valid results: ${results.totalPointsAchieved}/${results.maxTotalPoints} points`);
    return results;

  } catch (error) {
    console.error(`[${jobId}] Failed to read results.json:`, error.message);

    // Comprehensive error recovery
    let errorDetails = "Unknown error occurred during grading";
    let rawOutput = "";

    // Try to gather diagnostic information
    try {
      const resultsFiles = await fs.readdir(resultsDir);
      console.log(`[${jobId}] Files in results directory:`, resultsFiles);

      // Look for specific error files
      const errorFiles = ['compile_errors.log', 'raw_output.log', 'test_output.log'];
      for (const errorFile of errorFiles) {
        try {
          const errorContent = await fs.readFile(path.join(resultsDir, errorFile), "utf8");
          if (errorContent.trim()) {
            console.log(`[${jobId}] Found ${errorFile}:`, errorContent.substring(0, 200));
            if (errorFile === 'compile_errors.log' && errorContent.trim()) {
              errorDetails = `Compilation failed: ${errorContent.trim()}`;
            } else if (errorFile === 'raw_output.log') {
              rawOutput = errorContent;
            }
          }
        } catch (e) {
          // File doesn't exist or can't be read - continue checking others
        }
      }

      // If no specific error found, try to read any log file
      if (errorDetails === "Unknown error occurred during grading") {
        for (const file of resultsFiles) {
          if (file.endsWith('.log') || file.endsWith('.txt')) {
            try {
              const content = await fs.readFile(path.join(resultsDir, file), "utf8");
              if (content.trim()) {
                console.log(`[${jobId}] Content of ${file}:`, content.substring(0, 200));
                rawOutput = content;
                errorDetails = `Script execution failed - check logs`;
                break;
              }
            } catch (e) {
              // Continue to next file
            }
          }
        }
      }

    } catch (e) {
      console.error(`[${jobId}] Could not read results directory:`, e.message);
      errorDetails = "Could not access grading results";
    }

    // Return comprehensive error response
    return {
      error: "Autograder execution failed",
      details: errorDetails,
      rawOutput: rawOutput || "No output captured",
      totalPointsAchieved: 0,
      maxTotalPoints: 1,
      testResults: [],
      feedback: "Grading failed - please check your code and try again"
    };
  }
}

// Global error handler
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);
  res.status(500).json({
    error: "Internal server error",
    details: error.message,
  });
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Cloud Run Autograder service listening on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("Received SIGTERM, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("Received SIGINT, shutting down gracefully");
  process.exit(0);
});
