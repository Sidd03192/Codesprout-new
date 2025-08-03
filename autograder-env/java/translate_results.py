import xml.etree.ElementTree as ET
import json
import sys
import re # Import the regular expression module

def parse_junit_xml(xml_file_path):
    test_results = []
    total_possible_points = 0
    points_achieved = 0

    try:
        tree = ET.parse(xml_file_path)
        root = tree.getroot()
        
        for testcase in root.findall('testcase'):
            full_test_name = testcase.get('name')
            points = 1 # Default to 1 point if not specified
            clean_test_name = full_test_name

            # Use a regular expression to find "_Points_XX" at the end of the name
            match = re.search(r'_Points_(\d+)$', full_test_name)
            if match:
                points = int(match.group(1))
                clean_test_name = full_test_name[:match.start()]

            total_possible_points += points
            
            result = {
                "name": clean_test_name.replace('_', ' '), # Make name more readable
                "status": "passed",
                "message": "",
                "expected": "",
                "actual": "",
                "pointsAchieved": 0,
                "maxPoints": points
            }
            
            failure = testcase.find('failure')
            if failure is not None:
                result["status"] = "failed"
                failure_message = failure.get('message', '')
                result["message"] = failure_message
                
                # Try to parse "expected" and "actual" from standard JUnit messages
                expected_match = re.search(r'expected: <(.*?)>', failure_message)
                actual_match = re.search(r'but was: <(.*?)>', failure_message)
                if expected_match: result["expected"] = expected_match.group(1)
                if actual_match: result["actual"] = actual_match.group(1)
            else:
                # Only award points if the test passed
                points_achieved += points
                result["pointsAchieved"] = points
            print(result)
            test_results.append(result)

        return {
            "totalPointsAchieved": points_achieved,
            "maxTotalPoints": total_possible_points,
            "testResults": test_results,
        }
    except Exception as e:
        return {"error": f"Failed to parse XML report: {str(e)}"}

if __name__ == "__main__":
    input_file, output_file = sys.argv[1], sys.argv[2]
    results = parse_junit_xml(input_file)
    with open(output_file, 'w') as f:
        json.dump(results, f, indent=2)