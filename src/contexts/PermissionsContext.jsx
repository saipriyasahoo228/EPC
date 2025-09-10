import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { getMyPermissions } from '../allapi/access';
import { getToken, isUserAuthenticated } from '../auth';

const PermissionsContext = createContext({
  user: null,
  loading: true,
  permMapBySlug: {},
  can: () => false,
  hasAny: () => false,
  refresh: async () => {},
});

export const PermissionProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [permMapBySlug, setPermMapBySlug] = useState({});
  const lastFetchedAt = useRef(0);

  const normalize = (data) => {
    const map = {};
    const items = Array.isArray(data?.modules) ? data.modules : [];
    for (const item of items) {
      const slug = item?.module?.slug;
      const perms = item?.permissions || {};
      if (slug) {
        map[slug] = {
          can_read: Boolean(perms.can_read),
          can_create: Boolean(perms.can_create),
          can_update: Boolean(perms.can_update),
          can_delete: Boolean(perms.can_delete),
        };
      }
    }
    return map;
  };

  const loadFromStorage = () => {
    try {
      const raw = localStorage.getItem('permissions_cache');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed;
    } catch {
      return null;
    }
  };

  const saveToStorage = (payload) => {
    try {
      localStorage.setItem('permissions_cache', JSON.stringify(payload));
    } catch {
      // ignore
    }
  };

  const fetchPermissions = useCallback(async () => {
    // If user is not authenticated, do not call the API — avoid 401->logout loops
    const { accessToken } = getToken();
    if (!accessToken || !isUserAuthenticated()) {
      setUser(null);
      setPermMapBySlug({});
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await getMyPermissions();
      const map = normalize(data);
      setUser(data?.user || null);
      setPermMapBySlug(map);
      lastFetchedAt.current = Date.now();
      saveToStorage({ user: data?.user || null, permMapBySlug: map, ts: lastFetchedAt.current });
    } catch (e) {
      // On failure, try cache; otherwise lock down
      const cached = loadFromStorage();
      if (cached) {
        setUser(cached.user || null);
        setPermMapBySlug(cached.permMapBySlug || {});
      } else {
        setUser(null);
        setPermMapBySlug({});
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPermissions();
    const onFocus = () => {
      const TEN_MIN = 10 * 60 * 1000;
      if (Date.now() - lastFetchedAt.current > TEN_MIN) {
        fetchPermissions();
      }
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [fetchPermissions]);

  const can = useCallback(
    (slug, action) => {
      if (!slug || !action) return false;
      const entry = permMapBySlug[slug];
      return Boolean(entry?.[action]);
    },
    [permMapBySlug]
  );

  const hasAny = useCallback(
    (slug, actions = []) => {
      const entry = permMapBySlug[slug];
      if (!entry) return false;
      return actions.some((a) => entry[a]);
    },
    [permMapBySlug]
  );

  const ctx = useMemo(() => ({
    user,
    loading,
    permMapBySlug,
    can,
    hasAny,
    refresh: fetchPermissions,
  }), [user, loading, permMapBySlug, can, hasAny, fetchPermissions]);

  return (
    <PermissionsContext.Provider value={ctx}>{children}</PermissionsContext.Provider>
  );
};

export const usePermissions = () => useContext(PermissionsContext);

// Convenience hook to get all action permissions for a module in one call
// Usage:
//   const perms = useModulePermissions('maintenance');
//   <Button disabled={!perms.canCreate}>Save</Button>
export const useModulePermissions = (slug) => {
  const ctx = useContext(PermissionsContext);
  const { can, loading } = ctx;
  return useMemo(
    () => ({
      loading,
      canRead: can(slug, 'can_read'),
      canCreate: can(slug, 'can_create'),
      canUpdate: can(slug, 'can_update'),
      canDelete: can(slug, 'can_delete'),
    }),
    [can, loading, slug]
  );
};
