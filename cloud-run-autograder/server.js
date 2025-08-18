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
app.post(
  "/grade",
  upload.fields([
    { name: "studentCode", maxCount: 1 },
    { name: "testFile", maxCount: 1 },
  ]),
  async (req, res) => {
    const jobId = uuidv4();
    console.log(`[${jobId}] Grading job started`);

    try {
      // Extract student code and test file
      const studentCode =
        req.body.studentCode ||
        (req.files.studentCode
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

      if (req.files.testFile) {
        testFileBuffer = req.files.testFile[0].buffer;
        testFileName = req.files.testFile[0].originalname;
      } else if (req.body.testFileData && req.body.testFileName) {
        // Base64 encoded test file data
        testFileBuffer = Buffer.from(req.body.testFileData, "base64");
        testFileName = req.body.testFileName;
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
);

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

  const autograderScript = path.join(__dirname, "autograder-scripts", "run.sh");
  const command = `cd "${jobDir}" && bash "${autograderScript}"`;

  await execPromise(command);
  console.log(`[${jobId}] Autograder execution completed`);

  // Read and return results
  const resultsPath = path.join(resultsDir, "results.json");

  try {
    await fs.access(resultsPath);
    const resultsData = await fs.readFile(resultsPath, "utf8");
    const results = JSON.parse(resultsData);

    console.log(`[${jobId}] Results parsed successfully`);
    return results;
  } catch (error) {
    console.error(`[${jobId}] Results file not found or invalid`);

    // Try to read raw output for debugging
    const rawOutputPath = path.join(resultsDir, "raw_output.log");
    let rawOutput = "";

    try {
      rawOutput = await fs.readFile(rawOutputPath, "utf8");
    } catch (e) {
      rawOutput = "No raw output available";
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
