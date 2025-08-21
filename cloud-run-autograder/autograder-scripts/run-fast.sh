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
    
    # Debug: Write raw output for debugging
    print(f"DEBUG: Raw JUnit output (first 500 chars):\n{output[:500]}", file=sys.stderr)
    
    # Initialize results
    results = {
        "totalPointsAchieved": 0,
        "maxTotalPoints": 0,
        "testResults": [],
        "feedback": ""
    }
    
    # Multiple parsing strategies for different JUnit 5 output formats
    
    # Strategy 1: Look for symbols with test names
    test_pattern_symbols = r'([✓✗✔✘])\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(\)'
    symbol_matches = re.findall(test_pattern_symbols, output)
    
    # Strategy 2: Look for JUnit 5 tree format with different patterns
    # This handles the tree format with ANSI colors and extracts test names and points
    # Remove ANSI escape codes first for easier parsing
    clean_output = re.sub(r'\x1B\[[0-9;]*[mK]', '', output)
    
    # Multiple patterns to try for tree format
    tree_patterns = [
        r'│\s*└─\s*([a-zA-Z_][a-zA-Z0-9_]*(?:_Points_\d+)?)\(\)\s*([✓✗✔✘])',
        r'└─\s*([a-zA-Z_][a-zA-Z0-9_]*(?:_Points_\d+)?)\(\)\s*([✓✗✔✘])',
        r'([a-zA-Z_][a-zA-Z0-9_]*(?:_Points_\d+)?)\(\)\s*([✓✗✔✘])'
    ]
    
    tree_matches = []
    for pattern in tree_patterns:
        matches = re.findall(pattern, clean_output)
        if matches:
            tree_matches = matches
            print(f"DEBUG: Tree pattern '{pattern}' found {len(matches)} matches: {matches}", file=sys.stderr)
            break
    
    # Debug: Print what we're trying to match
    print(f"DEBUG: Clean output snippet:\n{clean_output[:500]}", file=sys.stderr)
    
    # Also look for simpler tree patterns
    test_pattern_tree_simple = r'└─\s*([✓✗✔✘])\s+([a-zA-Z_][a-zA-Z0-9_]*(?:_Points_\d+)?)\s*\(\)'
    tree_simple_matches = re.findall(test_pattern_tree_simple, clean_output)
    
    # Strategy 3: Look for simpler patterns without symbols
    test_pattern_simple = r'([a-zA-Z_][a-zA-Z0-9_]*)\s*\(\)\s*(SUCCESSFUL|FAILED)'
    simple_matches = re.findall(test_pattern_simple, output)
    
    # Strategy 4: Look for summary lines
    summary_patterns = [
        r'(\d+)\s+tests?\s+successful,?\s*(\d+)\s+tests?\s+failed',
        r'Test run finished after .* \[(\d+) tests successful, (\d+) failed\]',
        r'(\d+)\s+passed,?\s*(\d+)\s+failed'
    ]
    
    def extract_points_from_name(test_name):
        """Extract points from test name like 'testName_Points_100'"""
        import re
        points_match = re.search(r'_Points_(\d+)', test_name)
        return int(points_match.group(1)) if points_match else 1
    
    def clean_test_name(test_name):
        """Remove _Points_X suffix from test name for display"""
        import re
        return re.sub(r'_Points_\d+', '', test_name)
    
    matches_found = False
    
    # Try tree matches first (most specific to our format)
    if tree_matches:
        print(f"DEBUG: Found {len(tree_matches)} tree matches: {tree_matches}", file=sys.stderr)
        for test_name, symbol in tree_matches:
            print(f"DEBUG: Processing tree match - test_name: '{test_name}', symbol: '{symbol}'", file=sys.stderr)
            passed = symbol in ['✓', '✔']
            max_points = extract_points_from_name(test_name)
            clean_name = clean_test_name(test_name)
            results["testResults"].append({
                "name": clean_name,
                "passed": passed,
                "points": max_points if passed else 0,
                "maxPoints": max_points,
                "feedback": f"Earned {max_points if passed else 0}/{max_points} points"
            })
        matches_found = True
    
    # Try simple tree matches  
    elif tree_simple_matches:
        print(f"DEBUG: Found {len(tree_simple_matches)} simple tree matches", file=sys.stderr)
        for symbol, test_name in tree_simple_matches:
            passed = symbol in ['✓', '✔']
            max_points = extract_points_from_name(test_name)
            clean_name = clean_test_name(test_name)
            results["testResults"].append({
                "name": clean_name,
                "passed": passed,
                "points": max_points if passed else 0,
                "maxPoints": max_points,
                "feedback": f"Earned {max_points if passed else 0}/{max_points} points"
            })
        matches_found = True
    
    # Try symbol matches
    elif symbol_matches:
        print(f"DEBUG: Found {len(symbol_matches)} symbol matches", file=sys.stderr)
        for symbol, test_name in symbol_matches:
            passed = symbol in ['✓', '✔']
            max_points = extract_points_from_name(test_name)
            clean_name = clean_test_name(test_name)
            results["testResults"].append({
                "name": clean_name,
                "passed": passed,
                "points": max_points if passed else 0,
                "maxPoints": max_points,
                "feedback": f"Earned {max_points if passed else 0}/{max_points} points"
            })
        matches_found = True
    
    # Try simple pattern matches
    elif simple_matches:
        print(f"DEBUG: Found {len(simple_matches)} simple matches", file=sys.stderr)
        for test_name, status in simple_matches:
            passed = status == 'SUCCESSFUL'
            max_points = extract_points_from_name(test_name)
            clean_name = clean_test_name(test_name)
            results["testResults"].append({
                "name": clean_name,
                "passed": passed,
                "points": max_points if passed else 0,
                "maxPoints": max_points,
                "feedback": f"Earned {max_points if passed else 0}/{max_points} points"
            })
        matches_found = True
    
    # Try summary patterns
    if not matches_found:
        for pattern in summary_patterns:
            summary_match = re.search(pattern, output, re.IGNORECASE)
            if summary_match:
                print(f"DEBUG: Found summary match with pattern: {pattern}", file=sys.stderr)
                successful = int(summary_match.group(1))
                failed = int(summary_match.group(2))
                total = successful + failed
                
                for i in range(total):
                    test_name = f"test_{i+1}"
                    passed = i < successful
                    results["testResults"].append({
                        "name": test_name,
                        "passed": passed,
                        "points": 1 if passed else 0,
                        "maxPoints": 1,
                        "feedback": "Passed" if passed else "Failed"
                    })
                matches_found = True
                break
    
    # If still no matches, try to extract any meaningful info
    if not matches_found:
        print("DEBUG: No standard patterns matched, checking for error indicators", file=sys.stderr)
        
        # Check if there are any compilation or runtime errors
        if "error" in output.lower() or "exception" in output.lower():
            results["testResults"].append({
                "name": "compilation_or_runtime_test",
                "passed": False,
                "points": 0,
                "maxPoints": 1,
                "feedback": "Code contains errors - check console output"
            })
        elif "BUILD SUCCESSFUL" in output or "success" in output.lower():
            results["testResults"].append({
                "name": "build_test",
                "passed": True,
                "points": 1,
                "maxPoints": 1,
                "feedback": "Code compiled and ran successfully"
            })
        else:
            # Last resort: create a diagnostic result
            results["testResults"].append({
                "name": "unknown_test",
                "passed": False,
                "points": 0,
                "maxPoints": 1,
                "feedback": "Could not parse test results - contact instructor"
            })
    
    # Calculate totals
    results["maxTotalPoints"] = sum(test["maxPoints"] for test in results["testResults"])
    results["totalPointsAchieved"] = sum(test["points"] for test in results["testResults"])
    
    # Set feedback
    if results["totalPointsAchieved"] == results["maxTotalPoints"]:
        results["feedback"] = "All tests passed! Excellent work!"
    else:
        failed_count = results["maxTotalPoints"] - results["totalPointsAchieved"]
        results["feedback"] = f"{results['totalPointsAchieved']}/{results['maxTotalPoints']} tests passed. {failed_count} test(s) failed."
    
    # Ensure we have at least one test result
    if not results["testResults"]:
        print("DEBUG: No test results generated, creating fallback result", file=sys.stderr)
        # Check if the grading process succeeded at all
        if "Test run finished" in output or "BUILD SUCCESS" in output:
            results["testResults"].append({
                "name": "grading_process",
                "passed": True,
                "points": 1,
                "maxPoints": 1,
                "feedback": "Code executed successfully but test output format not recognized"
            })
        else:
            results["testResults"].append({
                "name": "grading_process",
                "passed": False,
                "points": 0,
                "maxPoints": 1,
                "feedback": "Grading process completed but results unclear - check logs"
            })
        results["maxTotalPoints"] = sum(test["maxPoints"] for test in results["testResults"])
        results["totalPointsAchieved"] = sum(test["points"] for test in results["testResults"])
    
    # Add raw output to results for debugging
    results["rawOutput"] = output
    
    # Write results
    with open('results/results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"SUCCESS: Parsed {len(results['testResults'])} test results")
    print(f"DEBUG: Total points: {results['totalPointsAchieved']}/{results['maxTotalPoints']}", file=sys.stderr)

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