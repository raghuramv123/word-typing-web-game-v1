import { createContext, useContext, useState } from 'react';
import { api, storage } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => (storage.getToken() ? storage.getUser() : null));

  const finish = (res) => {
    const u = { username: res.username, role: res.role };
    storage.save(res.token, u);
    setUser(u);
  };

  const value = {
    user,
    login: async (username, password) => finish(await api.login(username, password)),
    register: async (username, password) => finish(await api.register(username, password)),
    logout: () => {
      storage.clear();
      setUser(null);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
