import React from 'react';

const ErrorMessage = ({ message, onRetry, showRetry = true }) => {
  if (!message) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
      <div className="flex items-center">
        <span className="text-red-500 text-lg mr-2">⚠️</span>
        <div className="flex-1">
          <p className="text-red-800 font-medium">Error</p>
          <p className="text-red-700 text-sm">{message}</p>
        </div>
        {showRetry && onRetry && (
          <button
            onClick={onRetry}
            className="btn btn-sm bg-red-600 hover:bg-red-700 text-white ml-4"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
