import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { api, tokenStorage } from './lib/api';

const anonymousUser = { id: null, name: '', email: '', isAdmin: false };
const UserContext = createContext(null);

const normalizeUser = (user) => ({
  id: user?._id || user?.id || null,
  name: user?.name || '',
  email: user?.email || '',
  isAdmin: Boolean(user?.isAdmin),
});

export function UserProvider({ children }) {
  const [user, setUser] = useState(anonymousUser);
  const [isLoading, setIsLoading] = useState(() => Boolean(tokenStorage.get()));

  const signOut = useCallback(() => {
    tokenStorage.clear();
    setUser(anonymousUser);
  }, []);

  const signIn = useCallback((token, account) => {
    tokenStorage.set(token);
    setUser(normalizeUser(account));
  }, []);

  useEffect(() => {
    const token = tokenStorage.get();
    if (!token) return undefined;

    const controller = new AbortController();
    let active = true;
    api('/booknook/users/details', { token, signal: controller.signal })
      .then((account) => {
        if (active) setUser(normalizeUser(account));
      })
      .catch((error) => {
        if (active && error.name !== 'AbortError') signOut();
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [signOut]);

  const value = useMemo(
    () => ({ user, isLoading, signIn, signOut }),
    [user, isLoading, signIn, signOut],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export default UserContext;
