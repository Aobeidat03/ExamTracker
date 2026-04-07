import React from 'react';

/**
 * Spinner component.
 * @param {boolean} fullScreen - If true, centers in the viewport.
 * @param {'sm'|'md'|'lg'} size
 */
export default function LoadingSpinner({ fullScreen = false, size = 'md' }) {
  const sizeClass = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-[3px]',
  }[size];

  const spinner = (
    <div
      className={`animate-spin rounded-full border-transparent border-t-current ${sizeClass}`}
      role="status"
      aria-label="Loading"
    />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50 z-50">
        <div className="text-navy-800">{React.cloneElement(spinner, { className: `${spinner.props.className} h-12 w-12 border-[3px]` })}</div>
      </div>
    );
  }

  return spinner;
}
