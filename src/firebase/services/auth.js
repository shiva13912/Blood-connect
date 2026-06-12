import { auth } from '../config';
import { dbService } from './db';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
} from 'firebase/auth';

function buildUserProfile(firebaseUser, role = 'donor') {
  return {
    id: firebaseUser.uid,
    name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
    email: firebaseUser.email,
    role,
  };
}

export const authService = {
  login: async (email, password) => {
    const { user: firebaseUser } = await signInWithEmailAndPassword(auth, email, password);
    const profile = await dbService.getUserByEmail(firebaseUser.email);
    if (profile) return profile;
    return buildUserProfile(firebaseUser, 'donor');
  },

  register: async (name, email, password, role = 'donor') => {
    const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
    const userProfile = buildUserProfile(firebaseUser, role);
    userProfile.name = name;
    await dbService.addUser({ name, email, role });
    if (role === 'donor') {
      dbService.addDonor({
        name,
        email,
        role: 'donor',
        profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      }).catch(e => console.warn('Could not create donor profile:', e));
    }
    return userProfile;
  },

  loginWithGoogle: async () => {
    const provider = new GoogleAuthProvider();
    const { user: firebaseUser } = await signInWithPopup(auth, provider);
    const existing = await dbService.getUserByEmail(firebaseUser.email);
    if (existing) return existing;
    const name = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Google User';
    const profile = buildUserProfile(firebaseUser, 'donor');
    profile.name = name;
    await dbService.addUser({ name, email: firebaseUser.email, role: 'donor' });
    dbService.addDonor({
      name,
      email: firebaseUser.email,
      role: 'donor',
      profileImage: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    }).catch(e => console.warn('Could not create donor profile:', e));
    return profile;
  },

  logout: async () => {
    await signOut(auth);
  },

  resetPassword: async (email) => {
    await sendPasswordResetEmail(auth, email);
    return true;
  },
};
