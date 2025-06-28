
import React, { useContext } from 'react';
import { AppContext } from '../../App';
import Toast from './Toast';

const ToastContainer: React.FC = () => {
  const context = useContext(AppContext);

  if (!context || !context.notifications || context.notifications.length === 0) {
    return null;
  }

  const { notifications, removeNotification } = context;

  return (
    <div className="fixed top-5 right-5 z-[100] w-full max-w-sm space-y-3">
      {notifications.map(notification => (
        <Toast 
          key={notification.id} 
          notification={notification} 
          onDismiss={removeNotification} 
        />
      ))}
    </div>
  );
};

export default ToastContainer;
