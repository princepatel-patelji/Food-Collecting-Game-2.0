const Storage = {
  DB_VERSION: 1,
  STORE_NAME: 'gameHistory',
  db: null,
  
  async init() {
    return new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) {
        console.warn('IndexedDB not supported, using localStorage fallback');
        this.useLocalStorage = true;
        resolve();
        return;
      }
      
      const request = indexedDB.open('chaiCatchDB', this.DB_VERSION);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME, { keyPath: 'id', autoIncrement: true });
        }
      };
      
      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve();
      };
      
      request.onerror = (event) => {
        console.error('IndexedDB error:', event.target.error);
        this.useLocalStorage = true;
        resolve();
      };
    });
  },
  
  async add(record) {
    try {
      if (this.useLocalStorage) {
        const history = this.getLocalStorageHistory();
        record.id = history.length ? Math.max(...history.map(r => r.id)) + 1 : 1;
        history.push(record);
        this.setLocalStorageHistory(history);
        return record.id;
      }
      
      const transaction = this.db.transaction(this.STORE_NAME, 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const addRequest = store.add(record);
      
      return new Promise((resolve, reject) => {
        addRequest.onsuccess = () => resolve(addRequest.result);
        addRequest.onerror = () => reject(addRequest.error);
      });
    } catch (error) {
      console.error('Error adding record:', error);
      throw error;
    }
  },
  
  async getAll() {
    try {
      if (this.useLocalStorage) {
        return this.getLocalStorageHistory();
      }
      
      const transaction = this.db.transaction(this.STORE_NAME, 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.getAll();
      
      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error getting all records:', error);
      return [];
    }
  },
  
  async clear() {
    try {
      if (this.useLocalStorage) {
        localStorage.removeItem('chaiHistory');
        return;
      }
      
      const transaction = this.db.transaction(this.STORE_NAME, 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.clear();
      
      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error clearing history:', error);
      throw error;
    }
  },
  
  getLocalStorageHistory() {
    try {
      const saved = localStorage.getItem('chaiHistory');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.warn('Failed to parse history from localStorage');
      return [];
    }
  },
  
  setLocalStorageHistory(history) {
    try {
      localStorage.setItem('chaiHistory', JSON.stringify(history));
    } catch (error) {
      console.warn('Failed to save history to localStorage');
    }
  }
};

// Initialize storage
Storage.init();