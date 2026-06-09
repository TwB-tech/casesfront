import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ReyaContext = createContext(null);

const STORAGE_KEY = 'reya_companion_v1';

const loadCompanionState = () => {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  } catch {
    return null;
  }
};

const saveCompanionState = (state) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore storage errors
  }
};

export const ReyaProvider = ({ children }) => {
  const [companion, setCompanion] = useState(() => loadCompanionState());

  useEffect(() => {
    saveCompanionState(companion);
  }, [companion]);

  const initUser = useCallback((user) => {
    setCompanion((prev) => {
      const base = prev || {};
      return {
        ...base,
        userId: user?.id || prev?.userId || null,
        username: user?.username || prev?.username || '',
        role: user?.role || prev?.role || 'individual',
        organization_id: user?.organization_id || prev?.organization_id || null,
        preferences: prev?.preferences || {
          memoryTtlMs: 1000 * 60 * 60 * 24 * 30,
          keepSummaries: true,
          tone: 'warm',
        },
        tags: prev?.tags || [],
        favorites: prev?.favorites || [],
        lastActiveAt: new Date().toISOString(),
      };
    });
  }, []);

  const addTag = useCallback((tag) => {
    const value = typeof tag === 'string' ? tag.trim() : '';
    if (!value) return;
    setCompanion((prev) => {
      const tags = Array.isArray(prev?.tags) ? prev.tags : [];
      const exists = tags.some((t) => t.toLowerCase() === value.toLowerCase());
      if (exists) return prev;
      return { ...prev, tags: [...tags, value], lastActiveAt: new Date().toISOString() };
    });
  }, []);

  const toggleFavorite = useCallback((item) => {
    const key = typeof item === 'object' && item !== null ? (item.id || item.label || JSON.stringify(item)) : String(item);
    setCompanion((prev) => {
      const favorites = Array.isArray(prev?.favorites) ? prev.favorites : [];
      const exists = favorites.some((f) => f.key === key);
      const nextFavorites = exists ? favorites.filter((f) => f.key !== key) : [...favorites, { key, value: item }];
      return { ...prev, favorites: nextFavorites, lastActiveAt: new Date().toISOString() };
    });
  }, []);

  const updatePreferences = useCallback((patch) => {
    setCompanion((prev) => {
      const preferences = { ...(prev?.preferences || {}), ...patch };
      return { ...prev, preferences, lastActiveAt: new Date().toISOString() };
    });
  }, []);

  const value = {
    companion,
    initUser,
    addTag,
    toggleFavorite,
    updatePreferences,
  };

  return <ReyaContext.Provider value={value}>{children}</ReyaContext.Provider>;
};

export const useReya = () => {
  const ctx = useContext(ReyaContext);
  if (!ctx) {
    return {
      companion: null,
      initUser: () => {},
      addTag: () => {},
      toggleFavorite: () => {},
      updatePreferences: () => {},
    };
  }
  return ctx;
};

export default ReyaContext;
