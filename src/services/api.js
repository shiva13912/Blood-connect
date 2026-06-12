const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

function getToken() {
  try { return localStorage.getItem('bc_token'); } catch { return null; }
}

async function request(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  const token = getToken();
  if (token) opts.headers.Authorization = `Bearer ${token}`;
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${API}${path}`, opts);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export const api = {
  // Auth
  login: (email, password) => request('POST', '/auth/login', { email, password }),
  register: (name, email, password, role) => request('POST', '/auth/register', { name, email, password, role }),
  loginWithGoogle: (name, email, photoURL) => request('POST', '/auth/google', { name, email, photoURL }),
  forgotPassword: (email) => request('POST', '/auth/forgot-password', { email }),

  // Donors
  getDonors: () => request('GET', '/donors'),
  getDonorsByBloodGroup: (bg, city) => request('GET', `/donors/blood-group/${bg}${city ? `?city=${city}` : ''}`),
  getDonorById: (id) => request('GET', `/donors/${id}`),
  getDonorByEmail: (email) => request('GET', `/donors/email/${encodeURIComponent(email)}`),
  addDonor: (donor) => request('POST', '/donors', donor),
  updateDonor: (id, fields) => request('PUT', `/donors/${id}`, fields),
  deleteDonor: (id) => request('DELETE', `/donors/${id}`),

  // Requests
  getRequests: () => request('GET', '/requests'),
  getRequestsByBloodGroup: (bg, city) => request('GET', `/requests/blood-group/${bg}${city ? `?city=${city}` : ''}`),
  addRequest: (reqData) => request('POST', '/requests', reqData),
  updateRequest: (id, fields) => request('PUT', `/requests/${id}`, fields),
  deleteRequest: (id) => request('DELETE', `/requests/${id}`),

  // Users
  getUsers: () => request('GET', '/users'),
  getUserByEmail: (email) => request('GET', `/users/email/${encodeURIComponent(email)}`),
  updateUser: (id, fields) => request('PUT', `/users/${id}`, fields),
  deleteUser: (id) => request('DELETE', `/users/${id}`),

  // Notifications
  addNotification: (n) => request('POST', '/notifications', n),
  getNotifications: (userId, email) => request('GET', `/notifications/user/${userId}${email ? `?email=${encodeURIComponent(email)}` : ''}`),
  markNotificationAsRead: (id) => request('PUT', `/notifications/${id}/read`),

  // Stats
  getStats: () => request('GET', '/stats'),

  // Upload
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const token = getToken();
    const res = await fetch(`${API}/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!res.ok) throw new Error('Upload failed');
    return res.json();
  },

  // Notifications (convenience wrappers for notificationService)
  sendDonorNotification: async (request) => {
    const users = await api.getUsers();
    const seen = new Set();
    const donors = users.filter(u => u.role === 'donor');
    for (const donor of donors) {
      if (seen.has(donor.email?.toLowerCase())) continue;
      seen.add(donor.email.toLowerCase());
      await api.addNotification({
        recipientId: donor.id,
        recipientEmail: donor.email,
        recipientName: donor.name,
        type: 'emergency_request',
        title: `Emergency Blood Request - ${request.bloodGroup}`,
        message: `Urgent: ${request.patientName} needs ${request.bloodGroup} blood at ${request.hospital} (${request.city}). Contact: ${request.contactNumber}`,
        requestId: request.id,
        requestData: request,
      }).catch(() => {});
    }
  },
  sendAdminNotification: async (request) => {
    const users = await api.getUsers();
    const admins = users.filter(u => u.role === 'admin');
    for (const admin of admins) {
      await api.addNotification({
        recipientId: admin.id,
        recipientEmail: admin.email,
        recipientName: admin.name,
        type: 'emergency_request_admin',
        title: `New Emergency Request - ${request.bloodGroup}`,
        message: `Emergency blood request created: ${request.patientName} at ${request.hospital}`,
        requestId: request.id,
        requestData: request,
      }).catch(() => {});
    }
  },
  getUserNotifications: (userId, userEmail) => api.getNotifications(userId, userEmail),
  markAsRead: (id) => api.markNotificationAsRead(id),

  subscribeDonors: (callback) => {
    const fetchData = async () => { try { callback(await api.getDonors()); } catch {} };
    fetchData();
    const id = setInterval(fetchData, 5000);
    return () => clearInterval(id);
  },
  subscribeRequests: (callback) => {
    const fetchData = async () => { try { callback(await api.getRequests()); } catch {} };
    fetchData();
    const id = setInterval(fetchData, 5000);
    return () => clearInterval(id);
  },

  sendPushNotification: async (title, options = {}) => {
    try {
      if ('Notification' in window) {
        if (Notification.permission === 'granted') {
          return new Notification(title, { icon: '/blood-drop-icon.png', badge: '/blood-drop-icon.png', ...options });
        } else if (Notification.permission !== 'denied') {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            return new Notification(title, { icon: '/blood-drop-icon.png', badge: '/blood-drop-icon.png', ...options });
          }
        }
      }
    } catch (e) { console.error('Push notification error:', e); }
  },
};
