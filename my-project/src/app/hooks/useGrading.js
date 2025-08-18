// React hook for handling grading operations with enhanced UX
import { useState, useCallback } from 'react';
import { gradingClient, GradingError } from '../utils/grading-client';

export function useGrading() {
  const [isGrading, setIsGrading] = useState(false);
  const [gradingProgress, setGradingProgress] = useState(null);
  const [gradingError, setGradingError] = useState(null);
  const [gradingResult, setGradingResult] = useState(null);

  const submitForGrading = useCallback(async (studentCode, testingPath, options = {}) => {
    setIsGrading(true);
    setGradingError(null);
    setGradingResult(null);
    setGradingProgress({ status: 'starting', message: 'Preparing submission...' });

    try {
      const result = await gradingClient.submitForGrading(studentCode, testingPath, {
        ...options,
        onProgress: (progress) => {
          setGradingProgress(progress);
        }
      });

      setGradingResult(result);
      setGradingProgress({ status: 'completed', message: 'Grading completed!' });
      
      return result;

    } catch (error) {
      console.error('Grading failed:', error);
      setGradingError(error);
      setGradingProgress({ 
        status: 'error', 
        message: gradingClient.getErrorMessage(error) 
      });
      
      throw error;
    } finally {
      setIsGrading(false);
    }
  }, []);

  const clearGradingState = useCallback(() => {
    setGradingError(null);
    setGradingResult(null);
    setGradingProgress(null);
  }, []);

  const getErrorSuggestions = useCallback(() => {
    if (!gradingError) return [];
    return gradingClient.getErrorSuggestions(gradingError);
  }, [gradingError]);

  const isRetryableError = useCallback(() => {
    if (!gradingError) return false;
    return !(gradingError instanceof GradingError) || 
           gradingError.status >= 500 || 
           gradingError.status === 408;
  }, [gradingError]);

  return {
    // State
    isGrading,
    gradingProgress,
    gradingError,
    gradingResult,
    
    // Actions
    submitForGrading,
    clearGradingState,
    
    // Helpers
    getErrorSuggestions,
    isRetryableError,
    
    // Computed properties
    canRetry: isRetryableError(),
    progressMessage: gradingProgress?.message || '',
    progressStatus: gradingProgress?.status || 'idle'
  };
}