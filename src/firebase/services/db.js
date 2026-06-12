import { db } from '../config';
import {
  collection, getDocs, getDoc, addDoc, updateDoc, deleteDoc, doc,
  query, orderBy, where, serverTimestamp, onSnapshot
} from 'firebase/firestore';

const DONORS = 'donors';
const REQUESTS = 'requests';
const USERS = 'users';
const NOTIFICATIONS = 'notifications';

const snapArr = (snap) => snap.docs.map(d => ({ id: d.id, ...d.data() }));

export const dbService = {

  // -------- Donors --------
  getDonors: async () => {
    const snap = await getDocs(query(collection(db, DONORS), orderBy('name', 'asc')));
    return snapArr(snap);
  },

  getDonorsByBloodGroup: async (bloodGroup, city = null, pageSize = 20) => {
    const c = [where('bloodGroup', '==', bloodGroup), where('eligibility', '==', true), where('availability', '==', true), orderBy('name', 'asc')];
    if (city) c.push(where('city', '==', city));
    const snap = await getDocs(query(collection(db, DONORS), ...c));
    return snapArr(snap).slice(0, pageSize);
  },

  getDonorById: async (id) => {
    const snap = await getDoc(doc(db, DONORS, id));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  },

  getDonorByEmail: async (email) => {
    const snap = await getDocs(query(collection(db, DONORS), where('email', '==', email)));
    return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
  },

  addDonor: async (donor) => {
    const docRef = await addDoc(collection(db, DONORS), {
      name: donor.name || '',
      age: donor.age || 30,
      gender: donor.gender || 'Male',
      bloodGroup: donor.bloodGroup || 'O+',
      city: donor.city || '',
      phone: donor.phone || '',
      email: donor.email || '',
      eligibility: donor.eligibility ?? true,
      lastDonationDate: donor.lastDonationDate || '',
      totalDonations: donor.totalDonations || 0,
      availability: donor.availability ?? true,
      profileImage: donor.profileImage || '',
      createdAt: serverTimestamp(),
    });
    return { id: docRef.id, ...donor, createdAt: new Date().toISOString() };
  },

  updateDonor: async (id, updatedFields) => {
    const cleaned = { ...updatedFields };
    if (cleaned.age !== undefined) cleaned.age = Number(cleaned.age);
    if (cleaned.totalDonations !== undefined) cleaned.totalDonations = Number(cleaned.totalDonations);
    await updateDoc(doc(db, DONORS, id), { ...cleaned, updatedAt: serverTimestamp() });
    return { id, ...cleaned };
  },

  deleteDonor: async (id) => {
    await deleteDoc(doc(db, DONORS, id));
    return true;
  },

  // -------- Requests --------
  getRequests: async () => {
    const snap = await getDocs(query(collection(db, REQUESTS), orderBy('createdAt', 'desc')));
    return snapArr(snap);
  },

  getRequestsByBloodGroup: async (bloodGroup, city = null, pageSize = 20) => {
    const c = [where('bloodGroup', '==', bloodGroup), where('status', '==', 'Pending'), orderBy('createdAt', 'desc')];
    if (city) c.push(where('city', '==', city));
    const snap = await getDocs(query(collection(db, REQUESTS), ...c));
    return snapArr(snap).slice(0, pageSize);
  },

  addRequest: async (request) => {
    const docRef = await addDoc(collection(db, REQUESTS), {
      patientName: request.patientName || '',
      bloodGroup: request.bloodGroup || 'O+',
      hospital: request.hospital || '',
      city: request.city || '',
      contactNumber: request.contactNumber || '',
      urgency: request.urgency || 'Medium',
      status: request.status || 'Pending',
      createdBy: request.createdBy || 'anonymous',
      createdAt: serverTimestamp(),
    });
    return { id: docRef.id, ...request, status: request.status || 'Pending', createdAt: new Date().toISOString() };
  },

  updateRequest: async (id, updatedFields) => {
    await updateDoc(doc(db, REQUESTS, id), { ...updatedFields, updatedAt: serverTimestamp() });
    return { id, ...updatedFields };
  },

  deleteRequest: async (id) => {
    await deleteDoc(doc(db, REQUESTS, id));
    return true;
  },

  // -------- Users --------
  getUsers: async () => {
    const snap = await getDocs(query(collection(db, USERS), orderBy('name', 'asc')));
    return snapArr(snap);
  },

  getUserByEmail: async (email) => {
    const snap = await getDocs(query(collection(db, USERS), where('email', '==', email)));
    return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
  },

  addUser: async (user) => {
    const docRef = await addDoc(collection(db, USERS), {
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'donor',
      createdAt: serverTimestamp(),
    });
    return { id: docRef.id, ...user, createdAt: new Date().toISOString() };
  },

  updateUser: async (id, fields) => {
    await updateDoc(doc(db, USERS, id), { ...fields, updatedAt: serverTimestamp() });
    return { id, ...fields };
  },

  deleteUser: async (id) => {
    await deleteDoc(doc(db, USERS, id));
    return true;
  },

  // -------- Notifications --------
  addNotification: async (n) => {
    const docRef = await addDoc(collection(db, NOTIFICATIONS), {
      recipientId: n.recipientId || '',
      recipientEmail: n.recipientEmail || '',
      recipientName: n.recipientName || '',
      type: n.type || 'info',
      title: n.title || '',
      message: n.message || '',
      requestId: n.requestId || null,
      requestData: n.requestData || null,
      isRead: false,
      createdAt: serverTimestamp(),
    });
    return { id: docRef.id, ...n, isRead: false, createdAt: new Date().toISOString() };
  },

  getNotifications: async (userId, userEmail = null) => {
    let snap;
    if (userEmail) {
      snap = await getDocs(query(
        collection(db, NOTIFICATIONS),
        where('recipientEmail', '==', userEmail),
        orderBy('createdAt', 'desc')
      ));
    } else {
      snap = await getDocs(query(
        collection(db, NOTIFICATIONS),
        where('recipientId', '==', userId),
        orderBy('createdAt', 'desc')
      ));
    }
    return snapArr(snap).slice(0, 50);
  },

  markNotificationAsRead: async (id) => {
    await updateDoc(doc(db, NOTIFICATIONS, id), { isRead: true });
    return true;
  },

  // -------- Real-time Subscriptions (Firestore onSnapshot) --------
  subscribeDonors: (callback) => {
    const q = query(collection(db, DONORS), orderBy('name', 'asc'));
    return onSnapshot(q,
      (snap) => callback(snapArr(snap)),
      (err) => console.warn('subscribeDonors error:', err)
    );
  },

  subscribeRequests: (callback) => {
    const q = query(collection(db, REQUESTS), orderBy('createdAt', 'desc'));
    return onSnapshot(q,
      (snap) => callback(snapArr(snap)),
      (err) => console.warn('subscribeRequests error:', err)
    );
  },
};
