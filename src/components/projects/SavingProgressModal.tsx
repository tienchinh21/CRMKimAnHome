import React from "react";

interface SavingProgressModalProps {
  progress: {
    step: string;
    progress: number;
  } | null;
}

const SavingProgressModal: React.FC<SavingProgressModalProps> = ({
  progress,
}) => {
  if (!progress) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/80 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <div className="text-center">
          {/* Simple Spinner */}
          <div className="w-8 h-8 border-2 border-gray-300 border-t-teal-600 rounded-full animate-spin mx-auto mb-4"></div>

          {/* Content */}
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            {progress.step}
          </h3>
          <p className="text-sm text-gray-600 mb-4">Đang xử lý...</p>

          {/* Simple Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div
              className="bg-teal-600 h-1 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress.progress}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavingProgressModal;
