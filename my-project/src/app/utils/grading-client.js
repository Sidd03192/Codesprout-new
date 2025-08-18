// Enhanced client-side grading utilities for Cloud Run integration
// Provides better error handling, timeout management, and user feedback

export class GradingClient {
  constructor() {
    this.maxRetries = 2;
    this.baseTimeout = 120000; // 2 minutes base timeout
    this.maxTimeout = 600000;  // 10 minutes max timeout
  }

  /**
   * Submit code for grading with enhanced error handling and retry logic
   * @param {string} studentCode - The student's code to grade
   * @param {string} testingPath - Path to the test file in storage
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Grading results
   */
  async submitForGrading(studentCode, testingPath, options = {}) {
    const {
      onProgress = () => {},
      retries = this.maxRetries,
      timeout = this.baseTimeout
    } = options;

    onProgress({ 
      status: 'submitting', 
      message: 'Submitting code for grading...' 
    });

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const result = await this.makeGradingRequest(
          studentCode, 
          testingPath, 
          timeout,
          onProgress
        );
        
        onProgress({ 
          status: 'completed', 
          message: 'Grading completed successfully!' 
        });
        
        return result;

      } catch (error) {
        console.error(`Grading attempt ${attempt + 1} failed:`, error);
        
        // Don't retry on certain types of errors
        if (this.isNonRetryableError(error)) {
          throw error;
        }
        
        // If this was the last attempt, throw the error
        if (attempt === retries) {
          throw error;
        }
        
        // Wait before retrying (exponential backoff)
        const waitTime = Math.min(1000 * Math.pow(2, attempt), 10000);
        onProgress({ 
          status: 'retrying', 
          message: `Attempt ${attempt + 1} failed. Retrying in ${waitTime/1000}s...` 
        });
        
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  /**
   * Make the actual grading request
   * @private
   */
  async makeGradingRequest(studentCode, testingPath, timeout, onProgress) {
    onProgress({ 
      status: 'processing', 
      message: 'Processing your submission...' 
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeout);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/grade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentCode,
          testing_path: testingPath,
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new GradingError(
          errorData.error || `Request failed with status ${response.status}`,
          response.status,
          errorData.details
        );
      }

      onProgress({ 
        status: 'parsing', 
        message: 'Processing results...' 
      });

      const result = await response.json();
      
      // Validate the response structure
      if (!this.isValidGradingResult(result)) {
        throw new GradingError('Invalid response format received from server');
      }

      return result;

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new GradingError(
          'Grading request timed out. Your code may have infinite loops or be too complex.',
          408,
          'The grading process exceeded the maximum allowed time.'
        );
      }
      
      throw error;
    }
  }

  /**
   * Check if an error should not be retried
   * @private
   */
  isNonRetryableError(error) {
    if (error instanceof GradingError) {
      // Don't retry client errors (4xx) except timeouts
      return error.status >= 400 && error.status < 500 && error.status !== 408;
    }
    return false;
  }

  /**
   * Validate grading result structure
   * @private
   */
  isValidGradingResult(result) {
    if (!result || typeof result !== 'object') {
      return false;
    }

    // Check for error response
    if (result.error) {
      return true; // Error responses are valid
    }

    // Check for successful grading result
    return (
      typeof result.totalPointsAchieved === 'number' &&
      typeof result.maxTotalPoints === 'number' &&
      Array.isArray(result.testResults)
    );
  }

  /**
   * Get user-friendly error message
   */
  getErrorMessage(error) {
    if (error instanceof GradingError) {
      return error.message;
    }

    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return 'Unable to connect to the grading service. Please check your internet connection and try again.';
    }

    return 'An unexpected error occurred during grading. Please try again.';
  }

  /**
   * Get suggested actions for different error types
   */
  getErrorSuggestions(error) {
    if (error instanceof GradingError) {
      switch (error.status) {
        case 408:
          return [
            'Check for infinite loops in your code',
            'Ensure your code completes within reasonable time',
            'Try submitting a simpler version first'
          ];
        case 503:
          return [
            'The grading service is temporarily unavailable',
            'Please wait a moment and try again',
            'Contact support if the problem persists'
          ];
        default:
          return ['Review your code for syntax errors', 'Try again in a moment'];
      }
    }

    return ['Check your internet connection', 'Refresh the page and try again'];
  }
}

/**
 * Custom error class for grading-specific errors
 */
export class GradingError extends Error {
  constructor(message, status = 500, details = null) {
    super(message);
    this.name = 'GradingError';
    this.status = status;
    this.details = details;
  }
}

// Export a default instance
export const gradingClient = new GradingClient();