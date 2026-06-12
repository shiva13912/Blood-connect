// LocalStorage keys
const KEYS = {
  USERS: 'bloodconnect_users',
  DONORS: 'bloodconnect_donors',
  REQUESTS: 'bloodconnect_requests',
  NOTIFICATIONS: 'bloodconnect_notifications',
  CURRENT_USER: 'bloodconnect_current_user',
};

// Seed Data
const DEFAULT_USERS = [
  {
    id: 'user_admin',
    name: 'System Admin',
    email: 'admin@bloodconnect.ai',
    role: 'admin',
    password: 'admin123',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user_donor',
    name: 'John Donor',
    email: 'donor@bloodconnect.ai',
    role: 'donor',
    password: 'donor123',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user_requester',
    name: 'Sarah Requester',
    email: 'requester@bloodconnect.ai',
    role: 'requester',
    password: 'request123',
    createdAt: new Date().toISOString(),
  }
];

const DEFAULT_DONORS = [];

const DEFAULT_REQUESTS = [];

const DB_VERSION = 2;

// LocalStorage accessors
const getLocalStorageItem = (key, defaultValue) => {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return defaultValue;
  }
};

const setLocalStorageItem = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Initialize DB if empty
export const initMockDb = () => {
  getLocalStorageItem(KEYS.USERS, DEFAULT_USERS);
  getLocalStorageItem(KEYS.NOTIFICATIONS, []);

  // Version migration: resets donors/requests to new defaults (empty arrays)
  // to clear old cached demo/seed data from localStorage
  const dbVersion = parseInt(localStorage.getItem('bloodconnect_db_version') || '0', 10);
  if (dbVersion < DB_VERSION) {
    localStorage.setItem(KEYS.DONORS, JSON.stringify(DEFAULT_DONORS));
    localStorage.setItem(KEYS.REQUESTS, JSON.stringify(DEFAULT_REQUESTS));
    localStorage.setItem('bloodconnect_db_version', String(DB_VERSION));
  } else {
    getLocalStorageItem(KEYS.DONORS, DEFAULT_DONORS);
    getLocalStorageItem(KEYS.REQUESTS, DEFAULT_REQUESTS);
  }
};

// Start initialization
initMockDb();

export const mockDb = {
  // Auth Services
  auth: {
    login: async (email, password) => {
      const users = getLocalStorageItem(KEYS.USERS, DEFAULT_USERS);
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
      if (!user) throw new Error('Invalid email or password');
      
      const { password: _, ...userWithoutPassword } = user;
      setLocalStorageItem(KEYS.CURRENT_USER, userWithoutPassword);
      return userWithoutPassword;
    },
    
    register: async (name, email, password, role = 'donor') => {
      const users = getLocalStorageItem(KEYS.USERS, DEFAULT_USERS);
      if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error('Email already registered');
      }
      
      const newUser = {
        id: 'user_' + Math.random().toString(36).substr(2, 9),
        name,
        email,
        role,
        password,
        createdAt: new Date().toISOString()
      };
      
      users.push(newUser);
      setLocalStorageItem(KEYS.USERS, users);
      
      const { password: _, ...userWithoutPassword } = newUser;
      setLocalStorageItem(KEYS.CURRENT_USER, userWithoutPassword);
      return userWithoutPassword;
    },
    
    loginWithGoogle: async () => {
      const gUser = {
        id: 'user_google_' + Math.random().toString(36).substr(2, 9),
        name: 'Google User',
        email: 'google.user@example.com',
        role: 'donor',
        createdAt: new Date().toISOString()
      };
      
      const users = getLocalStorageItem(KEYS.USERS, DEFAULT_USERS);
      if (!users.some(u => u.email.toLowerCase() === gUser.email.toLowerCase())) {
        users.push(gUser);
        setLocalStorageItem(KEYS.USERS, users);
        
        // Auto-create donor profile
        const donors = getLocalStorageItem(KEYS.DONORS, DEFAULT_DONORS);
        donors.push({
          id: 'donor_' + gUser.id,
          name: gUser.name,
          age: 25,
          gender: 'Male',
          bloodGroup: 'O+',
          city: 'New York',
          phone: '',
          email: gUser.email,
          eligibility: true,
          lastDonationDate: '',
          totalDonations: 0,
          availability: true,
          profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${gUser.name}`,
          createdAt: new Date().toISOString()
        });
        setLocalStorageItem(KEYS.DONORS, donors);
      }
      
      const activeUser = users.find(u => u.email.toLowerCase() === gUser.email.toLowerCase());
      setLocalStorageItem(KEYS.CURRENT_USER, activeUser);
      return activeUser;
    },
    
    logout: async () => {
      localStorage.removeItem(KEYS.CURRENT_USER);
      return true;
    },
    
    getCurrentUser: () => {
      const user = localStorage.getItem(KEYS.CURRENT_USER);
      return user ? JSON.parse(user) : null;
    },
    
    resetPassword: async (email) => {
      const users = getLocalStorageItem(KEYS.USERS, DEFAULT_USERS);
      const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
      if (!exists) throw new Error('No user found with this email');
      return true;
    }
  },

  // Firestore Database Services
  db: {
    // Donors Collection
    getDonors: async () => {
      return getLocalStorageItem(KEYS.DONORS, DEFAULT_DONORS);
    },
    
    getDonorById: async (id) => {
      const donors = getLocalStorageItem(KEYS.DONORS, DEFAULT_DONORS);
      return donors.find(d => d.id === id) || null;
    },
    
    getDonorByEmail: async (email) => {
      const donors = getLocalStorageItem(KEYS.DONORS, DEFAULT_DONORS);
      return donors.find(d => d.email.toLowerCase() === email.toLowerCase()) || null;
    },

    addDonor: async (donor) => {
      const donors = getLocalStorageItem(KEYS.DONORS, DEFAULT_DONORS);
      const newDonor = {
        ...donor,
        id: donor.id || 'donor_' + Math.random().toString(36).substr(2, 9),
        createdAt: donor.createdAt || new Date().toISOString()
      };
      donors.push(newDonor);
      setLocalStorageItem(KEYS.DONORS, donors);
      return newDonor;
    },

    updateDonor: async (id, updatedFields) => {
      const donors = getLocalStorageItem(KEYS.DONORS, DEFAULT_DONORS);
      const index = donors.findIndex(d => d.id === id);
      if (index === -1) throw new Error('Donor profile not found');
      
      donors[index] = {
        ...donors[index],
        ...updatedFields,
        age: updatedFields.age ? parseInt(updatedFields.age) : donors[index].age,
        totalDonations: updatedFields.totalDonations !== undefined ? parseInt(updatedFields.totalDonations) : donors[index].totalDonations
      };
      setLocalStorageItem(KEYS.DONORS, donors);
      return donors[index];
    },

    deleteDonor: async (id) => {
      const donors = getLocalStorageItem(KEYS.DONORS, DEFAULT_DONORS);
      const filtered = donors.filter(d => d.id !== id);
      setLocalStorageItem(KEYS.DONORS, filtered);
      return true;
    },

    // Requests Collection
    getRequests: async () => {
      const reqs = getLocalStorageItem(KEYS.REQUESTS, DEFAULT_REQUESTS);
      // Sort by creation date descending
      return [...reqs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },

    addRequest: async (request) => {
      const requests = getLocalStorageItem(KEYS.REQUESTS, DEFAULT_REQUESTS);
      const newRequest = {
        ...request,
        id: 'req_' + Math.random().toString(36).substr(2, 9),
        status: request.status || 'Pending',
        createdAt: new Date().toISOString()
      };
      requests.push(newRequest);
      setLocalStorageItem(KEYS.REQUESTS, requests);
      return newRequest;
    },

    updateRequest: async (id, updatedFields) => {
      const requests = getLocalStorageItem(KEYS.REQUESTS, DEFAULT_REQUESTS);
      const index = requests.findIndex(r => r.id === id);
      if (index === -1) throw new Error('Request not found');
      
      requests[index] = { ...requests[index], ...updatedFields };
      setLocalStorageItem(KEYS.REQUESTS, requests);
      return requests[index];
    },

    deleteRequest: async (id) => {
      const requests = getLocalStorageItem(KEYS.REQUESTS, DEFAULT_REQUESTS);
      const filtered = requests.filter(r => r.id !== id);
      setLocalStorageItem(KEYS.REQUESTS, filtered);
      return true;
    },

    // Users Collection
    getUsers: async () => {
      const users = getLocalStorageItem(KEYS.USERS, DEFAULT_USERS);
      return users.map(({ password: _, ...u }) => u);
    },

    updateUser: async (id, updatedFields) => {
      const users = getLocalStorageItem(KEYS.USERS, DEFAULT_USERS);
      const index = users.findIndex(u => u.id === id);
      if (index === -1) throw new Error('User not found');
      
      users[index] = { ...users[index], ...updatedFields };
      setLocalStorageItem(KEYS.USERS, users);
      const { password: _, ...userWithoutPassword } = users[index];
      return userWithoutPassword;
    },

    deleteUser: async (id) => {
      const users = getLocalStorageItem(KEYS.USERS, DEFAULT_USERS);
      const filtered = users.filter(u => u.id !== id);
      setLocalStorageItem(KEYS.USERS, filtered);
      return true;
    },

    // Notifications Collection
    addNotification: async (notification) => {
      const notifications = getLocalStorageItem(KEYS.NOTIFICATIONS, []);
      const newNotification = {
        ...notification,
        id: 'notif_' + Math.random().toString(36).substr(2, 9),
        read: false,
        createdAt: new Date().toISOString()
      };
      notifications.push(newNotification);
      setLocalStorageItem(KEYS.NOTIFICATIONS, notifications);
      return newNotification;
    },

    getNotifications: async (userId) => {
      const notifications = getLocalStorageItem(KEYS.NOTIFICATIONS, []);
      return notifications
        .filter(n => n.recipientId === userId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 50);
    },

    markNotificationAsRead: async (notificationId) => {
      const notifications = getLocalStorageItem(KEYS.NOTIFICATIONS, []);
      const index = notifications.findIndex(n => n.id === notificationId);
      if (index !== -1) {
        notifications[index].read = true;
        setLocalStorageItem(KEYS.NOTIFICATIONS, notifications);
      }
      return true;
    }
  },

  // Storage Mock Service
  storage: {
    uploadProfileImage: async (fileOrPath, donorName) => {
      // Simulate file upload delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // If it's a file object, we can use URL.createObjectURL or simulated Dicebear SVG
      const seedName = encodeURIComponent(donorName || 'bloodconnect');
      return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seedName}`;
    }
  }
};
