const DB_NAME = 'athlete-os';
const DB_VERSION = 7;

export const STORE_KEY_PATHS = {
  campaigns: 'id',
  weeklyBlueprints: 'id',
  missions: 'id',
  setLogs: 'id',
  integrity: 'campaignId',
  settings: 'id',
  bodyMeasurements: 'id',
  dailyHealth: 'localDate',
  garminActivities: 'sourceActivityId',
  integrationSyncState: 'integration',
  backupSnapshots: 'id',
  exerciseLibrary: 'id'
};

const STORES = {
  campaigns: {
    keyPath: 'id',
    indexes: [
      { name: 'status', keyPath: 'status' },
      { name: 'updatedAt', keyPath: 'updatedAt' }
    ]
  },
  weeklyBlueprints: { keyPath: 'id', indexes: [{ name: 'campaignId', keyPath: 'campaignId' }, { name: 'dayOfWeek', keyPath: 'dayOfWeek' }] },
  missions: { keyPath: 'id', indexes: [{ name: 'date', keyPath: 'date' }, { name: 'status', keyPath: 'status' }] },
  setLogs: { keyPath: 'id', indexes: [{ name: 'missionId', keyPath: 'missionId' }, { name: 'exerciseId', keyPath: 'exerciseId' }] },
  integrity: { keyPath: 'campaignId' },
  settings: { keyPath: 'id' },
  bodyMeasurements: {
    keyPath: 'id',
    indexes: [
      { name: 'date', keyPath: 'date', unique: true },
      { name: 'recordedAt', keyPath: 'recordedAt' },
      { name: 'source', keyPath: 'source' }
    ]
  },
  dailyHealth: { keyPath: 'localDate' },
  garminActivities: {
    keyPath: 'sourceActivityId',
    indexes: [
      { name: 'startedAt', keyPath: 'startedAt' },
      { name: 'type', keyPath: 'type' }
    ]
  },
  integrationSyncState: { keyPath: 'integration' },
  backupSnapshots: {
    keyPath: 'id',
    indexes: [{ name: 'createdAt', keyPath: 'createdAt' }]
  },
  exerciseLibrary: {
    keyPath: 'id',
    indexes: [
      { name: 'nameNormalized', keyPath: 'nameNormalized' },
      { name: 'category', keyPath: 'category' },
      { name: 'trackingType', keyPath: 'trackingType' },
      { name: 'active', keyPath: 'active' }
    ]
  }
};

let dbPromise = null;

export function openDB() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        const tx = event.target.transaction;
        for (const [name, config] of Object.entries(STORES)) {
          let store;
          if (!db.objectStoreNames.contains(name)) {
            store = db.createObjectStore(name, { keyPath: config.keyPath });
            (config.indexes || []).forEach((idx) => {
              const options = idx.unique ? { unique: true } : {};
              store.createIndex(idx.name, idx.keyPath, options);
            });
          } else if (config.indexes?.length) {
            store = tx.objectStore(name);
            for (const idx of config.indexes) {
              if (!store.indexNames.contains(idx.name)) {
                const options = idx.unique ? { unique: true } : {};
                store.createIndex(idx.name, idx.keyPath, options);
              }
            }
          }
        }
      };
    });
  }
  return dbPromise;
}

export async function clearStore(storeName) {
  const keyPath = STORE_KEY_PATHS[storeName];
  if (!keyPath) throw new Error(`Unknown store: ${storeName}`);
  const existing = await getAll(storeName);
  for (const item of existing) {
    await remove(storeName, item[keyPath]);
  }
}

export async function clearAllStores(storeNames) {
  for (const storeName of storeNames) {
    await clearStore(storeName);
  }
}

export async function get(storeName, key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const req = tx.objectStore(storeName).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function getAll(storeName) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const req = tx.objectStore(storeName).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function put(storeName, value) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const req = tx.objectStore(storeName).put(value);
    req.onsuccess = () => resolve(value);
    req.onerror = () => reject(req.error);
  });
}

export async function remove(storeName, key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const req = tx.objectStore(storeName).delete(key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getByIndex(storeName, indexName, value) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const index = tx.objectStore(storeName).index(indexName);
    const req = index.getAll(value);
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function getOneByIndex(storeName, indexName, value) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const index = tx.objectStore(storeName).index(indexName);
    const req = index.get(value);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function putAll(storeName, values) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    for (const value of values) {
      store.put(value);
    }
    tx.oncomplete = () => resolve(values.length);
    tx.onerror = () => reject(tx.error);
  });
}

export async function runTransaction(storeNames, mode, fn) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeNames, mode);
    Promise.resolve(fn(tx))
      .then(resolve)
      .catch(reject);
    tx.onerror = () => reject(tx.error);
  });
}

export function generateId(prefix = 'id') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function todayDateString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getWeekStart(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
