// Enhanced grading status component for better user feedback
import React from 'react';
import { CheckCircle, AlertCircle, Clock, RefreshCw, XCircle } from 'lucide-react';

const GradingStatus = ({ 
  isGrading, 
  progressStatus, 
  progressMessage, 
  gradingError, 
  errorSuggestions = [],
  canRetry = false,
  onRetry 
}) => {
  const getStatusIcon = () => {
    switch (progressStatus) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'retrying':
        return <RefreshCw className="w-5 h-5 text-yellow-500 animate-spin" />;
      case 'submitting':
      case 'processing':
      case 'parsing':
        return <Clock className="w-5 h-5 text-blue-500 animate-pulse" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (progressStatus) {
      case 'completed':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'retrying':
        return 'border-yellow-200 bg-yellow-50';
      case 'submitting':
      case 'processing':
      case 'parsing':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  if (!isGrading && !gradingError && progressStatus !== 'completed') {
    return null;
  }

  return (
    <div className={`border rounded-lg p-4 ${getStatusColor()}`}>
      <div className="flex items-center space-x-3">
        {getStatusIcon()}
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">
            {progressMessage || 'Processing...'}
          </p>
          
          {isGrading && progressStatus !== 'error' && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-blue-500 h-1.5 rounded-full transition-all duration-500 ease-out"
                  style={{ 
                    width: progressStatus === 'completed' ? '100%' : '60%',
                    animation: progressStatus !== 'completed' ? 'pulse 2s infinite' : 'none'
                  }}
                />
              </div>
            </div>
          )}
          
          {gradingError && (
            <div className="mt-3">
              <p className="text-sm text-red-700 mb-2">
                {gradingError.message || 'An error occurred during grading'}
              </p>
              
              {gradingError.details && (
                <p className="text-xs text-red-600 mb-2">
                  Details: {gradingError.details}
                </p>
              )}
              
              {errorSuggestions.length > 0 && (
                <div className="text-xs text-red-600">
                  <p className="font-medium mb-1">Suggestions:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {errorSuggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {canRetry && onRetry && (
                <button
                  onClick={onRetry}
                  className="mt-2 inline-flex items-center px-3 py-1 text-xs font-medium text-red-700 bg-red-100 border border-red-300 rounded hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Try Again
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      
      {progressStatus === 'processing' && (
        <div className="mt-3 text-xs text-gray-600">
          <p>⏱️ This may take up to 2 minutes for complex code</p>
          <p>🔄 Using Cloud Run for scalable grading</p>
        </div>
      )}
      
      {progressStatus === 'completed' && (
        <div className="mt-2 text-xs text-green-700">
          ✅ Your code has been successfully graded!
        </div>
      )}
    </div>
  );
};

export default GradingStatus;