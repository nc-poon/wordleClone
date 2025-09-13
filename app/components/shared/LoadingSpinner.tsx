import React from "react";
import "./LoadingSpinner.css";
export interface LoadingSpinnerProps {
  message?: string;
}

export default function LoadingSpinner({
  message = "Loading game...",
}: LoadingSpinnerProps) {
  return (
    <div className="text-center p-8 animate-pulse">
      <div className="loading-spinner"></div>
      <p className="mt-4 text-slate-500">{message}</p>
    </div>
  );
}
