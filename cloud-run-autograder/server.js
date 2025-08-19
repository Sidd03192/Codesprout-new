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

  // Run autograder script
  console.log(`[${jobId}] Starting autograder execution`);
  const startTime = Date.now();

  // Use the reliable original script for now
  const autograderScript = path.join(__dirname, "autograder-scripts", "run.sh");
  
  const command = `cd "${jobDir}" && bash "${autograderScript}"`;

  await execPromise(command);
  const endTime = Date.now();
  console.log(`[${jobId}] Autograder execution completed in ${endTime - startTime}ms`);

  // Read and return results
  const resultsPath = path.join(resultsDir, "results.json");

  console.log(`[${jobId}] === RESULTS DEBUG ===`);
  console.log(`[${jobId}] Looking for results at: ${resultsPath}`);
  
  // List all files in results directory
  try {
    const resultsFiles = await fs.readdir(resultsDir);
    console.log(`[${jobId}] Files in results directory:`, resultsFiles);
  } catch (e) {
    console.log(`[${jobId}] Could not read results directory:`, e.message);
  }

  // List all files in job directory
  try {
    const allFiles = await fs.readdir(jobDir);
    console.log(`[${jobId}] Files in job directory:`, allFiles);
  } catch (e) {
    console.log(`[${jobId}] Could not read job directory:`, e.message);
  }

  try {
    await fs.access(resultsPath);
    const resultsData = await fs.readFile(resultsPath, "utf8");
    console.log(`[${jobId}] Raw results.json content:`, resultsData.substring(0, 500));
    const results = JSON.parse(resultsData);

    console.log(`[${jobId}] Results parsed successfully`);
    return results;
  } catch (error) {
    console.error(`[${jobId}] Results file error:`, error.message);

    // Try to read raw output for debugging
    const rawOutputPath = path.join(resultsDir, "raw_output.log");
    let rawOutput = "";

    try {
      rawOutput = await fs.readFile(rawOutputPath, "utf8");
      console.log(`[${jobId}] Raw output content:`, rawOutput.substring(0, 500));
    } catch (e) {
      console.log(`[${jobId}] No raw output file:`, e.message);
      rawOutput = "No raw output available";
    }

    // Try to read any other log files
    try {
      const logFiles = await fs.readdir(resultsDir);
      for (const file of logFiles) {
        if (file.endsWith('.log') || file.endsWith('.txt')) {
          try {
            const content = await fs.readFile(path.join(resultsDir, file), "utf8");
            console.log(`[${jobId}] Content of ${file}:`, content.substring(0, 300));
          } catch (e) {
            console.log(`[${jobId}] Could not read ${file}:`, e.message);
          }
        }
      }
    } catch (e) {
      console.log(`[${jobId}] Could not list log files:`, e.message);
    }

    return {
      error: "Autograder did not produce valid results",
      details: "Check compilation errors or test configuration",
      rawOutput,
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
