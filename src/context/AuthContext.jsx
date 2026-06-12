import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

function loadSession() {
  try {
    const token = localStorage.getItem('bc_token');
    const user = localStorage.getItem('bc_user');
    if (token && user) return { token, user: JSON.parse(user) };
  } catch {}
  return null;
}

export const AuthProvider = ({ children }) => {
  const session = loadSession();
  const [currentUser, setCurrentUser] = useState(session?.user || null);
  const [loading, setLoading] = useState(!session);

  useEffect(() => {
    if (session) setLoading(false);
    else setLoading(false);
  }, []);

  const saveSession = (token, user) => {
    localStorage.setItem('bc_token', token);
    localStorage.setItem('bc_user', JSON.stringify(user));
    setCurrentUser(user);
  };

  const login = async (email, password) => {
    const { user, token } = await api.login(email, password);
    saveSession(token, user);
    return user;
  };

  const register = async (name, email, password, role) => {
    const { user, token } = await api.register(name, email, password, role);
    saveSession(token, user);
    return user;
  };

  const loginWithGoogle = async () => {
    return new Promise((resolve, reject) => {
      const width = 500, height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      const popup = window.open(
        `https://accounts.google.com/o/oauth2/v2/auth?client_id=291683238864-5p5o5k5j5k5j5k5j5k5j5k5j5k5j5k5j.apps.googleusercontent.com&redirect_uri=${encodeURIComponent(window.location.origin + '/auth/callback')}&response_type=token&scope=email%20profile`,
        'Google Login', `width=${width},height=${height},left=${left},top=${top}`
      );
      const timer = setInterval(async () => {
        if (popup.closed) { clearInterval(timer); reject(new Error('Login cancelled')); return; }
        try {
          if (popup.location.hash) {
            const params = new URLSearchParams(popup.location.hash.substring(1));
            const accessToken = params.get('access_token');
            if (accessToken) {
              const profileRes = await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${accessToken}`);
              const profile = await profileRes.json();
              popup.close();
              clearInterval(timer);
              const { user, token } = await api.loginWithGoogle(profile.name, profile.email, profile.picture);
              saveSession(token, user);
              resolve(user);
            }
          }
        } catch {}
      }, 500);
    });
  };

  const logout = async () => {
    localStorage.removeItem('bc_token');
    localStorage.removeItem('bc_user');
    setCurrentUser(null);
  };

  const resetPassword = async (email) => {
    await api.forgotPassword(email);
    return true;
  };

  const updateProfileState = (updatedFields) => {
    setCurrentUser(prev => prev ? { ...prev, ...updatedFields } : null);
  };

  const value = {
    currentUser,
    loading,
    isAdmin: currentUser?.role === 'admin',
    login,
    register,
    loginWithGoogle,
    logout,
    resetPassword,
    updateProfileState,
    isDonor: currentUser?.role === 'donor',
    isRequester: currentUser?.role === 'requester',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export default AuthContext;
