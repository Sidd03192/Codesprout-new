// Example integration of the enhanced Cloud Run grading system
// This shows how to update your existing components to use the new grading utilities

import React, { useState } from 'react';
import { useGrading } from './src/app/hooks/useGrading';
import GradingStatus from './src/app/components/grading/GradingStatus';

const ExampleAssignmentComponent = ({ assignment, studentCode, onGradingComplete }) => {
  const {
    isGrading,
    gradingProgress,
    gradingError,
    gradingResult,
    submitForGrading,
    clearGradingState,
    getErrorSuggestions,
    canRetry,
    progressMessage,
    progressStatus
  } = useGrading();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!studentCode || !assignment?.testing_url) {
      alert('Please complete your code before submitting');
      return;
    }

    setIsSubmitting(true);
    clearGradingState();

    try {
      // Submit for grading with the enhanced client
      const gradingResult = await submitForGrading(
        studentCode, 
        assignment.testing_url,
        {
          timeout: 300000, // 5 minute timeout
          retries: 2
        }
      );

      // Handle successful grading
      console.log('Grading completed:', gradingResult);
      
      // You can now process the results as before
      // The gradingResult has the same structure as your original API
      if (onGradingComplete) {
        onGradingComplete(gradingResult);
      }

    } catch (error) {
      console.error('Grading submission failed:', error);
      // Error is already handled by the useGrading hook
      // The GradingStatus component will show appropriate error messages
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    handleSubmit();
  };

  return (
    <div className="space-y-4">
      {/* Your existing component content */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">{assignment?.title}</h2>
        
        {/* Code editor would go here */}
        <div className="mb-4">
          <textarea
            value={studentCode}
            onChange={(e) => setStudentCode(e.target.value)}
            className="w-full h-64 p-3 border rounded font-mono text-sm"
            placeholder="Write your code here..."
          />
        </div>

        {/* Enhanced grading status component */}
        <GradingStatus
          isGrading={isGrading}
          progressStatus={progressStatus}
          progressMessage={progressMessage}
          gradingError={gradingError}
          errorSuggestions={getErrorSuggestions()}
          canRetry={canRetry}
          onRetry={handleRetry}
        />

        {/* Submit button with improved state handling */}
        <div className="flex justify-end space-x-3 mt-4">
          <button
            onClick={clearGradingState}
            disabled={isGrading || isSubmitting}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
          >
            Clear
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={isGrading || isSubmitting || !studentCode}
            className={`px-6 py-2 rounded font-medium transition-colors ${
              isGrading || isSubmitting
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isGrading || isSubmitting ? 'Grading...' : 'Submit & Grade'}
          </button>
        </div>

        {/* Display grading results */}
        {gradingResult && !gradingError && (
          <div className="mt-6 p-4 border rounded-lg bg-green-50">
            <h3 className="font-semibold text-green-800 mb-3">Grading Results</h3>
            
            <div className="mb-4">
              <span className="text-lg font-bold text-green-700">
                Score: {gradingResult.totalPointsAchieved} / {gradingResult.maxTotalPoints}
              </span>
              <span className="ml-2 text-sm text-gray-600">
                ({Math.round((gradingResult.totalPointsAchieved / gradingResult.maxTotalPoints) * 100)}%)
              </span>
            </div>

            {gradingResult.testResults && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Test Results:</h4>
                {gradingResult.testResults.map((test, index) => (
                  <div key={index} className={`p-2 rounded ${
                    test.status === 'passed' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{test.name}</span>
                      <span className={`text-sm ${
                        test.status === 'passed' ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {test.pointsAchieved} / {test.maxPoints} points
                      </span>
                    </div>
                    {test.message && (
                      <p className="text-sm text-gray-600 mt-1">{test.message}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExampleAssignmentComponent;

/* 
MIGRATION GUIDE:
================

To update your existing components to use the Cloud Run grading system:

1. Replace direct fetch calls to /api/grade with the useGrading hook:
   
   OLD:
   ```javascript
   const response = await fetch('/api/grade', {
     method: 'POST',
     body: JSON.stringify({ studentCode, testing_path })
   });
   ```
   
   NEW:
   ```javascript
   const result = await submitForGrading(studentCode, testing_path);
   ```

2. Replace loading states with the GradingStatus component:
   
   OLD:
   ```javascript
   {isLoading && <div>Grading...</div>}
   ```
   
   NEW:
   ```javascript
   <GradingStatus
     isGrading={isGrading}
     progressStatus={progressStatus}
     progressMessage={progressMessage}
     gradingError={gradingError}
     errorSuggestions={getErrorSuggestions()}
     canRetry={canRetry}
     onRetry={handleRetry}
   />
   ```

3. The grading result format remains the same, so your existing result processing code should work without changes.

4. To enable Cloud Run grading, simply set the environment variable:
   CLOUD_RUN_AUTOGRADER_URL=https://your-service-url
   
   If not set, the system will fall back to local Docker grading.
*/