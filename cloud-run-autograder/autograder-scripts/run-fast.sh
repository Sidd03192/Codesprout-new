#!/bin/bash
# Ultra-fast autograder script using direct Java compilation
# For single Java test files - bypasses Maven overhead entirely

set -e  # Exit on any error

echo "INFO: Starting fast autograder (direct compilation)"

# Validate required directories exist
if [ ! -d "source" ] || [ ! -d "tests" ]; then
    echo "ERROR: Required source or tests directory missing" >&2
    echo '{"error": "Invalid directory structure"}' > results/results.json
    exit 0
fi

# Find the test file
TEACHER_TEST_FILE=$(find tests -name '*.java' -type f | head -1)
if [ -z "$TEACHER_TEST_FILE" ]; then
    echo "ERROR: No .java test file found" >&2
    echo '{"error": "No Java test file provided"}' > results/results.json
    exit 0
fi

# Validate student code exists
if [ ! -f "source/Solution.java" ]; then
    echo "ERROR: No student Solution.java found" >&2
    echo '{"error": "No student code provided"}' > results/results.json
    exit 0
fi

echo "INFO: Found test file: $(basename "$TEACHER_TEST_FILE")"

# Create compilation directory
mkdir -p compiled

# JUnit standalone JAR path (pre-cached in Docker image)
JUNIT_JAR="/app/lib/junit-platform-console-standalone-1.9.3.jar"

# Verify JUnit JAR exists
if [ ! -f "$JUNIT_JAR" ]; then
    echo "ERROR: JUnit JAR not found at $JUNIT_JAR" >&2
    echo '{"error": "JUnit dependencies missing - falling back to Maven"}' > results/results.json
    exit 1  # Signal fallback needed
fi

echo "INFO: Compiling student code and tests"

# Compile student code and test together (no package structure needed)
javac -cp "$JUNIT_JAR" \
    -d compiled \
    source/Solution.java \
    "$TEACHER_TEST_FILE" \
    2> results/compile_errors.log

# Check compilation success
if [ $? -ne 0 ]; then
    echo "ERROR: Compilation failed"
    COMPILE_ERRORS=$(cat results/compile_errors.log 2>/dev/null || echo "Unknown compilation error")
    # Create proper JSON with escaped quotes
    python3 -c "
import json
result = {
    'error': 'Compilation failed',
    'details': '''$COMPILE_ERRORS''',
    'totalPointsAchieved': 0,
    'maxTotalPoints': 1,
    'testResults': []
}
with open('results/results.json', 'w') as f:
    json.dump(result, f, indent=2)
"
    exit 0
fi

echo "INFO: Running tests"

# Get test class name (without .java extension and path)
TEST_CLASS=$(basename "$TEACHER_TEST_FILE" .java)

# Run JUnit tests and capture output
cd compiled
timeout 30s java -cp ".:$JUNIT_JAR" \
    org.junit.platform.console.ConsoleLauncher \
    --scan-classpath \
    --disable-banner \
    --details=tree \
    > ../results/test_output.log 2>&1

TEST_EXIT_CODE=$?
cd ..

# Check for timeout
if [ $TEST_EXIT_CODE -eq 124 ]; then
    echo "ERROR: Tests timed out after 30 seconds"
    echo '{"error": "Tests timed out - possible infinite loop", "totalPointsAchieved": 0, "maxTotalPoints": 1, "testResults": []}' > results/results.json
    exit 0
fi

echo "INFO: Parsing test results"

# Parse JUnit console output to create results.json
python3 << 'EOF'
import re
import json
import sys

try:
    with open('results/test_output.log', 'r') as f:
        output = f.read()
    
    # Initialize results
    results = {
        "totalPointsAchieved": 0,
        "maxTotalPoints": 0,
        "testResults": [],
        "feedback": ""
    }
    
    # Parse test results from JUnit 5 output
    # Look for patterns like "✓ testMethodName()" or "✗ testMethodName()"
    test_pattern = r'([✓✗✔✘])\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(\)'
    matches = re.findall(test_pattern, output)
    
    if not matches:
        # Fallback: look for JUnit 5 display names or summary
        summary_match = re.search(r'(\d+) tests successful, (\d+) tests failed', output)
        if summary_match:
            successful = int(summary_match.group(1))
            failed = int(summary_match.group(2))
            total = successful + failed
            
            for i in range(total):
                test_name = f"test{i+1}"
                passed = i < successful
                results["testResults"].append({
                    "name": test_name,
                    "passed": passed,
                    "points": 1 if passed else 0,
                    "maxPoints": 1,
                    "feedback": "Passed" if passed else "Failed"
                })
        else:
            # No clear results found - create default failing result
            results["testResults"].append({
                "name": "unknown_test",
                "passed": False,
                "points": 0,
                "maxPoints": 1,
                "feedback": "Could not parse test results"
            })
    else:
        # Process individual test results
        for symbol, test_name in matches:
            passed = symbol in ['✓', '✔']
            results["testResults"].append({
                "name": test_name,
                "passed": passed,
                "points": 1 if passed else 0,
                "maxPoints": 1,
                "feedback": "Passed" if passed else "Failed"
            })
    
    # Calculate totals
    results["maxTotalPoints"] = len(results["testResults"])
    results["totalPointsAchieved"] = sum(test["points"] for test in results["testResults"])
    
    # Set feedback
    if results["totalPointsAchieved"] == results["maxTotalPoints"]:
        results["feedback"] = "All tests passed! Excellent work!"
    else:
        failed_count = results["maxTotalPoints"] - results["totalPointsAchieved"]
        results["feedback"] = f"{results['totalPointsAchieved']}/{results['maxTotalPoints']} tests passed. {failed_count} test(s) failed."
    
    # Ensure we have at least one test result
    if not results["testResults"]:
        results["testResults"].append({
            "name": "compilation_test",
            "passed": True,
            "points": 1,
            "maxPoints": 1,
            "feedback": "Code compiled successfully"
        })
        results["maxTotalPoints"] = 1
        results["totalPointsAchieved"] = 1
        results["feedback"] = "Code compiled but no tests found to run"
    
    # Write results
    with open('results/results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"SUCCESS: Parsed {len(results['testResults'])} test results")

except Exception as e:
    print(f"ERROR: Failed to parse results: {e}", file=sys.stderr)
    error_result = {
        "error": "Failed to parse test results",
        "details": str(e),
        "totalPointsAchieved": 0,
        "maxTotalPoints": 1,
        "testResults": []
    }
    with open('results/results.json', 'w') as f:
        json.dump(error_result, f, indent=2)
EOF

echo "INFO: Fast autograder completed successfully"