// src/core/auth.ts
import { useState, useEffect } from 'react';
import type { Track } from './types';

export type SchoolClassLevel = '9' | '10' | '11' | '12';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  track: Track;
  classLevel?: SchoolClassLevel;
  stream?: 'science' | 'commerce' | 'arts' | 'general';
  avatar?: string;
  createdAt: number;
}

const AUTH_STORAGE_KEY = 'ai_edu_current_user';
const USERS_DB_KEY = 'ai_edu_registered_users';

// Demo Default Profiles for quick testing
export const DEMO_PROFILES: UserProfile[] = [
  {
    id: 'demo-9',
    name: 'Aarav Sharma',
    email: 'aarav.class9@demo.edu',
    track: 'school',
    classLevel: '9',
    stream: 'general',
    avatar: '👨‍🎓',
    createdAt: Date.now(),
  },
  {
    id: 'demo-10',
    name: 'Priya Patel',
    email: 'priya.class10@demo.edu',
    track: 'school',
    classLevel: '10',
    stream: 'general',
    avatar: '👩‍🎓',
    createdAt: Date.now(),
  },
  {
    id: 'demo-11',
    name: 'Rohan Verma',
    email: 'rohan.class11@demo.edu',
    track: 'school',
    classLevel: '11',
    stream: 'science',
    avatar: '👨‍🔬',
    createdAt: Date.now(),
  },
  {
    id: 'demo-12',
    name: 'Ananya Iyer',
    email: 'ananya.class12@demo.edu',
    track: 'school',
    classLevel: '12',
    stream: 'science',
    avatar: '👩‍🔬',
    createdAt: Date.now(),
  },
];

export function getStoredUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // Ignore storage parse error
  }
  return null;
}

export function setStoredUser(user: UserProfile | null) {
  if (user) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
  window.dispatchEvent(new Event('auth_state_changed'));
}

export function registerUser(profile: Omit<UserProfile, 'id' | 'createdAt'>): UserProfile {
  const newUser: UserProfile = {
    ...profile,
    id: 'user_' + Date.now(),
    createdAt: Date.now(),
  };

  try {
    const usersRaw = localStorage.getItem(USERS_DB_KEY);
    const users: UserProfile[] = usersRaw ? JSON.parse(usersRaw) : [];
    users.push(newUser);
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
  } catch {
    // Ignore DB error
  }

  setStoredUser(newUser);
  return newUser;
}

export function loginUser(email: string, _password?: string): UserProfile {
  // Check if exists in demo or DB
  const demoMatch = DEMO_PROFILES.find((p) => p.email.toLowerCase() === email.toLowerCase());
  if (demoMatch) {
    setStoredUser(demoMatch);
    return demoMatch;
  }

  try {
    const usersRaw = localStorage.getItem(USERS_DB_KEY);
    const users: UserProfile[] = usersRaw ? JSON.parse(usersRaw) : [];
    const match = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (match) {
      setStoredUser(match);
      return match;
    }
  } catch {
    // Ignore
  }

  // Fallback auto-create student profile if fresh login
  const defaultUser: UserProfile = {
    id: 'user_' + Date.now(),
    name: email.split('@')[0] || 'Student',
    email,
    track: 'school',
    classLevel: '10',
    avatar: '🎓',
    createdAt: Date.now(),
  };
  setStoredUser(defaultUser);
  return defaultUser;
}

export function logoutUser() {
  setStoredUser(null);
}

export function updateClassLevel(newClass: SchoolClassLevel, newStream?: 'science' | 'commerce' | 'arts' | 'general') {
  const current = getStoredUser();
  if (current) {
    const updated: UserProfile = {
      ...current,
      classLevel: newClass,
      stream: newStream || current.stream,
    };
    setStoredUser(updated);
  }
}

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(() => getStoredUser());

  useEffect(() => {
    const handleAuthChange = () => {
      setUser(getStoredUser());
    };

    window.addEventListener('auth_state_changed', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('auth_state_changed', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  return {
    user,
    isAuthenticated: Boolean(user),
    login: loginUser,
    signup: registerUser,
    logout: logoutUser,
    updateClass: updateClassLevel,
  };
}
