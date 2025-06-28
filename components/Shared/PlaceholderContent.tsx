import React from 'react';

interface PlaceholderContentProps {
  title: string;
  message?: string;
}

const PlaceholderContent: React.FC<PlaceholderContentProps> = ({ title, message }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-white rounded-lg shadow-xl">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-20 h-20 text-primary-300 mb-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.813-5.813m0 0L11.42 15.17m3.75-7.5L11.42 15.17m0 0L7.5 11.42m3.92-3.92L7.5 11.42m0 0L3.75 7.5m3.75 3.92L3.75 7.5m0 0L2.25 6S.75 4.5 2.25 3C3.75 1.5 6 2.25 6 2.25l1.5 1.5M12 6.75l2.25-2.25m0 0l2.25 2.25M12 6.75V11.25m0 0A2.25 2.25 0 0 0 9.75 13.5m2.25-2.25A2.25 2.25 0 0 1 14.25 13.5m0 0V9m0 0" />
      </svg>
      <h2 className="text-2xl font-semibold text-gray-700 mb-3">{title}</h2>
      <p className="text-gray-500 max-w-md">
        {message || `The '${title}' feature is currently under development and will be available soon. Thank you for your patience!`}
      </p>
    </div>
  );
};

export default PlaceholderContent;
