import React, { useState, useEffect } from 'react';
import { auth, db } from '../../firebase-config';
import { collection, getDocs, connectFirestoreEmulator } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

interface ConnectionStatus {
  auth: 'connected' | 'disconnected' | 'error';
  firestore: 'connected' | 'disconnected' | 'error';
  collections: {
    users: number;
    students: number;
    teachers: number;
    classes: number;
  };
  errors: string[];
}

const FirebaseConnectionTest: React.FC = () => {
  const [status, setStatus] = useState<ConnectionStatus>({
    auth: 'disconnected',
    firestore: 'disconnected',
    collections: { users: 0, students: 0, teachers: 0, classes: 0 },
    errors: []
  });
  const [testing, setTesting] = useState(false);

  const testConnections = async () => {
    setTesting(true);
    const newStatus: ConnectionStatus = {
      auth: 'disconnected',
      firestore: 'disconnected',
      collections: { users: 0, students: 0, teachers: 0, classes: 0 },
      errors: []
    };

    try {
      // Test Auth connection
      const authTest = new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          newStatus.auth = 'connected';
          console.log('🔐 Auth state:', user ? 'Authenticated' : 'Not authenticated');
          unsubscribe();
          resolve(user);
        });
      });
      await authTest;
    } catch (error: any) {
      newStatus.auth = 'error';
      newStatus.errors.push(`Auth error: ${error.message}`);
      console.error('🔐 Auth connection failed:', error);
    }

    // Test Firestore collections
    const collections = ['users', 'students', 'teachers', 'classes'];
    for (const collectionName of collections) {
      try {
        const collectionRef = collection(db, collectionName);
        const snapshot = await getDocs(collectionRef);
        newStatus.collections[collectionName as keyof typeof newStatus.collections] = snapshot.docs.length;
        console.log(`📊 ${collectionName}:`, snapshot.docs.length, 'documents');
        
        if (newStatus.firestore !== 'error') {
          newStatus.firestore = 'connected';
        }
      } catch (error: any) {
        newStatus.firestore = 'error';
        newStatus.errors.push(`${collectionName} error: ${error.message}`);
        console.error(`❌ ${collectionName} collection failed:`, error);
      }
    }

    setStatus(newStatus);
    setTesting(false);
  };

  useEffect(() => {
    testConnections();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600';
      case 'error': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return '✅';
      case 'error': return '❌';
      default: return '⏳';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          🔥 Firebase Connection Status
        </h3>
        <button
          onClick={testConnections}
          disabled={testing}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
        >
          {testing ? 'Testing...' : 'Retest'}
        </button>
      </div>

      <div className="space-y-4">
        {/* Auth Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
          <span className="font-medium text-gray-700 dark:text-gray-300">Authentication</span>
          <span className={`flex items-center gap-2 ${getStatusColor(status.auth)}`}>
            {getStatusIcon(status.auth)} {status.auth}
          </span>
        </div>

        {/* Firestore Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
          <span className="font-medium text-gray-700 dark:text-gray-300">Firestore</span>
          <span className={`flex items-center gap-2 ${getStatusColor(status.firestore)}`}>
            {getStatusIcon(status.firestore)} {status.firestore}
          </span>
        </div>

        {/* Collections Status */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-700 dark:text-gray-300">Collections:</h4>
          {Object.entries(status.collections).map(([name, count]) => (
            <div key={name} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
              <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{name}</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {count} documents
              </span>
            </div>
          ))}
        </div>

        {/* Errors */}
        {status.errors.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-red-600">Errors:</h4>
            {status.errors.map((error, index) => (
              <div key={index} className="p-2 bg-red-50 dark:bg-red-900/20 rounded-md">
                <span className="text-sm text-red-700 dark:text-red-400">{error}</span>
              </div>
            ))}
          </div>
        )}

        {/* Debug Info */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
          <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">Debug Info:</h4>
          <div className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
            <div>Environment: {import.meta.env.MODE || 'production'}</div>
            <div>Domain: {window.location.hostname}</div>
            <div>Protocol: {window.location.protocol}</div>
            <div>Firebase Project: {import.meta.env.VITE_FIREBASE_PROJECT_ID || 'edutrack-sis'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirebaseConnectionTest;
