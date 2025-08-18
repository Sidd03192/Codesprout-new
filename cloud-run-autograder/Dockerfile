# Cloud Run optimized Dockerfile for Java autograder
FROM maven:3.8.5-eclipse-temurin-17 AS dependency-cache

# Create a minimal pom.xml for dependency caching
WORKDIR /cache
COPY <<EOF pom.xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.example</groupId>
    <artifactId>autograder-cache</artifactId>
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
            </plugin>
        </plugins>
    </build>
</project>
EOF

# Pre-download dependencies and plugins
RUN mvn dependency:go-offline -B

# Final Cloud Run optimized image
FROM maven:3.8.5-eclipse-temurin-17

# Install Python and Node.js for the API server
RUN apt-get update && \
    apt-get install -y python3 python3-pip curl && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# Copy cached Maven repository from previous stage
COPY --from=dependency-cache /root/.m2 /root/.m2

# Set up workspace
WORKDIR /app

# Copy autograder scripts
COPY autograder-scripts/ ./autograder-scripts/
COPY package.json ./
COPY server.js ./

# Install Node.js dependencies for the API server
RUN npm install

# Make scripts executable and fix line endings
RUN chmod +x autograder-scripts/*.sh && \
    sed -i 's/\r$//' autograder-scripts/*.sh && \
    sed -i 's/\r$//' autograder-scripts/*.py

# Expose port for Cloud Run
EXPOSE 8080

# Health check for Cloud Run
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Start the API server
CMD ["npm", "start"]