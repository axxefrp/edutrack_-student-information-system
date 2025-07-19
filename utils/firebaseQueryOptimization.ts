import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  startAfter, 
  where, 
  onSnapshot, 
  QueryDocumentSnapshot, 
  DocumentData,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../firebase-config';

// Configuration for different collections
export const COLLECTION_CONFIGS = {
  students: {
    pageSize: 50,
    orderField: 'name',
    cacheTime: 5 * 60 * 1000, // 5 minutes
  },
  teachers: {
    pageSize: 30,
    orderField: 'name',
    cacheTime: 10 * 60 * 1000, // 10 minutes
  },
  classes: {
    pageSize: 25,
    orderField: 'name',
    cacheTime: 10 * 60 * 1000,
  },
  subjects: {
    pageSize: 20,
    orderField: 'name',
    cacheTime: 30 * 60 * 1000, // 30 minutes (subjects change rarely)
  },
  grades: {
    pageSize: 100,
    orderField: 'dateAssigned',
    cacheTime: 2 * 60 * 1000, // 2 minutes (grades update frequently)
  },
  pointTransactions: {
    pageSize: 50,
    orderField: 'timestamp',
    cacheTime: 1 * 60 * 1000, // 1 minute
  },
  messages: {
    pageSize: 30,
    orderField: 'timestamp',
    cacheTime: 30 * 1000, // 30 seconds (real-time messaging)
  },
  events: {
    pageSize: 20,
    orderField: 'date',
    cacheTime: 60 * 60 * 1000, // 1 hour
  },
  resources: {
    pageSize: 25,
    orderField: 'uploadedAt',
    cacheTime: 15 * 60 * 1000, // 15 minutes
  }
};

// Cache interface
interface CacheEntry<T> {
  data: T[];
  timestamp: number;
  lastDoc?: QueryDocumentSnapshot<DocumentData>;
}

// In-memory cache
const cache = new Map<string, CacheEntry<any>>();

// Cache management
export const clearCache = (collectionName?: string) => {
  if (collectionName) {
    cache.delete(collectionName);
  } else {
    cache.clear();
  }
};

export const isCacheValid = (collectionName: string): boolean => {
  const entry = cache.get(collectionName);
  if (!entry) return false;
  
  const config = COLLECTION_CONFIGS[collectionName as keyof typeof COLLECTION_CONFIGS];
  const now = Date.now();
  return (now - entry.timestamp) < config.cacheTime;
};

// Optimized query builder
export const createOptimizedQuery = (
  collectionName: string,
  filters?: { field: string; operator: any; value: any }[],
  customLimit?: number
) => {
  const config = COLLECTION_CONFIGS[collectionName as keyof typeof COLLECTION_CONFIGS];
  if (!config) {
    throw new Error(`No configuration found for collection: ${collectionName}`);
  }

  let q = query(
    collection(db, collectionName),
    orderBy(config.orderField),
    limit(customLimit || config.pageSize)
  );

  // Add filters if provided
  if (filters) {
    filters.forEach(filter => {
      q = query(q, where(filter.field, filter.operator, filter.value));
    });
  }

  return q;
};

// Optimized listener with caching
export const createOptimizedListener = <T>(
  collectionName: string,
  callback: (data: T[]) => void,
  errorCallback?: (error: Error) => void,
  filters?: { field: string; operator: any; value: any }[],
  customLimit?: number
): Unsubscribe => {
  
  // Check cache first
  if (isCacheValid(collectionName) && !filters) {
    const cachedData = cache.get(collectionName)?.data || [];
    callback(cachedData);
  }

  const q = createOptimizedQuery(collectionName, filters, customLimit);
  
  return onSnapshot(
    q,
    (snapshot) => {
      const data = snapshot.docs.map(doc => ({ 
        ...doc.data(), 
        id: doc.id 
      } as T));
      
      // Update cache
      const lastDoc = snapshot.docs[snapshot.docs.length - 1];
      cache.set(collectionName, {
        data,
        timestamp: Date.now(),
        lastDoc
      });
      
      console.log(`📊 Optimized ${collectionName} loaded:`, data.length, 'documents');
      callback(data);
    },
    (error) => {
      console.error(`❌ Error in optimized ${collectionName} listener:`, error);
      if (errorCallback) {
        errorCallback(error);
      }
    }
  );
};

// Pagination support
export const loadMoreData = async <T>(
  collectionName: string,
  callback: (data: T[], hasMore: boolean) => void
): Promise<void> => {
  const cacheEntry = cache.get(collectionName);
  if (!cacheEntry?.lastDoc) {
    console.warn(`No pagination data available for ${collectionName}`);
    return;
  }

  const config = COLLECTION_CONFIGS[collectionName as keyof typeof COLLECTION_CONFIGS];
  const q = query(
    collection(db, collectionName),
    orderBy(config.orderField),
    startAfter(cacheEntry.lastDoc),
    limit(config.pageSize)
  );

  return new Promise((resolve, reject) => {
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const newData = snapshot.docs.map(doc => ({ 
          ...doc.data(), 
          id: doc.id 
        } as T));
        
        // Update cache with combined data
        const combinedData = [...cacheEntry.data, ...newData];
        const lastDoc = snapshot.docs[snapshot.docs.length - 1];
        
        cache.set(collectionName, {
          data: combinedData,
          timestamp: Date.now(),
          lastDoc
        });
        
        const hasMore = newData.length === config.pageSize;
        callback(newData, hasMore);
        unsubscribe();
        resolve();
      },
      (error) => {
        console.error(`❌ Error loading more ${collectionName}:`, error);
        unsubscribe();
        reject(error);
      }
    );
  });
};

// Performance monitoring
export const getPerformanceStats = () => {
  const stats = {
    totalCachedCollections: cache.size,
    cacheDetails: {} as Record<string, { size: number; age: number }>
  };

  cache.forEach((entry, collectionName) => {
    stats.cacheDetails[collectionName] = {
      size: entry.data.length,
      age: Date.now() - entry.timestamp
    };
  });

  return stats;
};

// Cleanup function for memory management
export const cleanupExpiredCache = () => {
  const now = Date.now();
  const expiredKeys: string[] = [];

  cache.forEach((entry, key) => {
    const config = COLLECTION_CONFIGS[key as keyof typeof COLLECTION_CONFIGS];
    if (config && (now - entry.timestamp) > config.cacheTime) {
      expiredKeys.push(key);
    }
  });

  expiredKeys.forEach(key => cache.delete(key));
  
  if (expiredKeys.length > 0) {
    console.log(`🧹 Cleaned up ${expiredKeys.length} expired cache entries`);
  }
};

// Auto cleanup every 5 minutes
setInterval(cleanupExpiredCache, 5 * 60 * 1000);
