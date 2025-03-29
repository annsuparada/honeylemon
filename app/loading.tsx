import React from 'react';

const LoadingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-900 text-white">
      <span className="loading loading-bars loading-lg mb-4"></span>
      <h1 className="text-2xl font-semibold">Loading, please wait...</h1>
    </div>
  );
};

export default LoadingPage;
