#!/bin/bash
# Fast autograder script without Maven overhead
# For simple Java test cases

echo "INFO: Fast autograder script started."

# Create simple directory structure
mkdir -p compiled
mkdir -p results

# For now, just use the original Maven approach but with simpler structure
# The JUnit standalone approach has compatibility issues with different test formats

echo "INFO: Creating simplified Maven project..."

# Create minimal project structure
mkdir -p src/main/java
mkdir -p src/test/java

# Copy student code
cp source/Solution.java src/main/java/

# Find and copy test file
TEACHER_TEST_FILE=$(find tests -name '*.java' | head -1)
if [ -z "$TEACHER_TEST_FILE" ]; then
    echo "ERROR: No .java test file found." >&2
    echo '{ "error": "No .java test file was provided." }' > results/results.json
    exit 0
fi

cp "$TEACHER_TEST_FILE" src/test/java/

# Create minimal pom.xml (same as the original but simpler)
cat > pom.xml <<'EOF'
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.example</groupId>
    <artifactId>autograder-test</artifactId>
    <version>1.0-SNAPSHOT</version>
    <properties>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>
    <dependencies>
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter-api</artifactId>
            <version>5.8.2</version>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter-engine</artifactId>
            <version>5.8.2</version>
            <scope>test</scope>
        </dependency>
    </dependencies>
    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-surefire-plugin</artifactId>
                <version>3.0.0-M5</version>
                <configuration>
                    <redirectTestOutputToFile>false</redirectTestOutputToFile>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
EOF

echo "INFO: Running Maven test (with cached dependencies)..."
# Use Maven but dependencies should be cached, making it faster
mvn test -q > results/raw_output.log 2>&1 || true

# Find the XML report
LATEST_REPORT=$(find target/surefire-reports -name '*.xml' -printf '%T@ %p\n' 2>/dev/null | sort -n | tail -1 | cut -f2- -d' ')

if [ -z "$LATEST_REPORT" ] || [ ! -f "$LATEST_REPORT" ]; then
    echo "ERROR: Could not find JUnit XML report." >&2
    echo '{ "error": "Code failed to compile or tests could not run. Check raw_output.log for details." }' > results/results.json
    exit 0
fi

echo "INFO: Translating results..."
SCRIPT_DIR="$(dirname "${BASH_SOURCE[0]}")"
python3 "$SCRIPT_DIR/translate_results.py" "$LATEST_REPORT" results/results.json

echo "INFO: Fast grading complete."