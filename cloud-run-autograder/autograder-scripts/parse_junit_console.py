#!/usr/bin/env python3
"""
Fast JUnit console output parser for autograder results.
Parses the console output from JUnit Platform Console Launcher.
"""

import sys
import json
import re

def parse_junit_console_output(output_file, results_file):
    try:
        with open(output_file, 'r', encoding='utf-8') as f:
            output = f.read()
        
        # Initialize results structure
        results = {
            "totalPointsAchieved": 0,
            "maxTotalPoints": 0,
            "testResults": [],
            "feedback": ""
        }
        
        # Look for test summary line
        # Format: "Test run finished after 123 ms"
        # Or: "Tests run: 5, Failures: 1, Errors: 0, Skipped: 0"
        
        # Parse individual test results
        # Look for lines like: "✓ testMethodName()" or "✗ testMethodName()"
        test_pattern = r'([✓✗])\s+(\w+)\(\)'
        test_matches = re.findall(test_pattern, output)
        
        if not test_matches:
            # Fallback: look for JUnit 5 display names
            test_pattern = r'([✓✗])\s+(.+?)(?:\s+\[Method|\()'
            test_matches = re.findall(test_pattern, output)
        
        total_tests = len(test_matches)
        passed_tests = sum(1 for status, _ in test_matches if status == '✓')
        
        # If no symbols found, try parsing from summary
        if total_tests == 0:
            # Look for "Tests run: X, Failures: Y, Errors: Z"
            summary_match = re.search(r'Tests run: (\d+), Failures: (\d+), Errors: (\d+)', output)
            if summary_match:
                total_tests = int(summary_match.group(1))
                failures = int(summary_match.group(2))
                errors = int(summary_match.group(3))
                passed_tests = total_tests - failures - errors
                
                # Create generic test results
                for i in range(total_tests):
                    test_name = f"test{i+1}"
                    passed = i < passed_tests
                    results["testResults"].append({
                        "name": test_name,
                        "passed": passed,
                        "points": 1 if passed else 0,
                        "maxPoints": 1,
                        "feedback": "Passed" if passed else "Failed"
                    })
        else:
            # Create detailed test results
            for i, (status, test_name) in enumerate(test_matches):
                passed = status == '✓'
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
        
        # Add overall feedback
        if results["totalPointsAchieved"] == results["maxTotalPoints"]:
            results["feedback"] = "All tests passed! Great work!"
        else:
            failed_count = results["maxTotalPoints"] - results["totalPointsAchieved"]
            results["feedback"] = f"{results['totalPointsAchieved']}/{results['maxTotalPoints']} tests passed. {failed_count} test(s) failed."
        
        # If no tests were found at all, it's likely a compilation error
        if not results["testResults"]:
            results = {
                "error": "No tests found or executed",
                "details": "Check compilation errors or test configuration",
                "rawOutput": output[-1000:]  # Last 1000 chars of output
            }
        
        # Write results
        with open(results_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2)
        
        print(f"Parsed {len(results.get('testResults', []))} test results")
        
    except Exception as e:
        error_result = {
            "error": "Failed to parse test results",
            "details": str(e)
        }
        with open(results_file, 'w', encoding='utf-8') as f:
            json.dump(error_result, f, indent=2)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python3 parse_junit_console.py <output_file> <results_file>")
        sys.exit(1)
    
    parse_junit_console_output(sys.argv[1], sys.argv[2])