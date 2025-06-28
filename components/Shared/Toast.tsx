
import React from 'react';
import { ToastNotification } from '../../types';

interface ToastProps {
  notification: ToastNotification;
  onDismiss: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ notification, onDismiss }) => {
  const { id, message, type, title } = notification;

  let bgColor = 'bg-blue-500';
  let textColor = 'text-white';
  let iconPath = "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"; // Info icon

  if (type === 'success') {
    bgColor = 'bg-green-500';
    iconPath = "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"; // Success icon
  } else if (type === 'error') {
    bgColor = 'bg-red-500';
    iconPath = "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"; // Error icon
  }


  return (
    <>
      <style>{`
        @keyframes toast-in {
          '0%': { opacity: '0', transform: 'translateX(100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        }
        .animate-toast-in {
          animation: toast-in 0.35s ease-out forwards;
        }
      `}</style>
      <div
        className={`relative flex items-start p-4 mb-3 rounded-lg shadow-xl text-sm ${bgColor} ${textColor} transition-all duration-300 ease-in-out transform opacity-0 animate-toast-in`}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-3 flex-shrink-0">
          <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
        </svg>
        <div className="flex-grow">
          {title && <h4 className="font-bold mb-1">{title}</h4>}
          <p>{message}</p>
        </div>
        <button
          onClick={() => onDismiss(id)}
          className={`ml-4 -mr-1 -mt-1 p-1 rounded-full hover:bg-black hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-white transition-colors`}
          aria-label="Dismiss notification"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </>
  );
};

export default Toast;
