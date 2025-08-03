# CORRECTED: Switch to a more standard, full-featured base image.
# The 'eclipse-temurin' version is based on Debian and includes 'apt-get'.
FROM maven:3.8.5-eclipse-temurin-17

# Install Python using the correct package manager for this image.
# This command updates the package index, installs python3, and then cleans up
# the cache to keep the final image size small.
RUN apt-get update && \
    apt-get install -y python3 && \
    rm -rf /var/lib/apt/lists/*

# Set up a workspace inside the container.
WORKDIR /autograder

# Copy our two custom helper scripts into the container.
COPY run.sh .
COPY translate_results.py .

# Make our main script executable.
RUN chmod +x run.sh

# Use ENTRYPOINT to ensure our script is always the main command executed.
ENTRYPOINT ["./run.sh"]