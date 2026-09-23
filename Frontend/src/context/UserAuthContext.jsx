import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  fetchCurrentUser,
  getCachedUser,
  loginUser,
  loginWithGoogle,
  logoutUser,
  registerUser,
} from "../services/userAuth";

const UserAuthContext = createContext(null);

export function UserAuthProvider({ children }) {
  const [user, setUser] = useState(getCachedUser);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetchCurrentUser()
      .then((current) => setUser(current))
      .finally(() => setReady(true));
  }, []);

  const value = useMemo(
    () => ({
      user,
      ready,
      isLoggedIn: Boolean(user),
      async register(payload) {
        const data = await registerUser(payload);
        setUser(data.user);
        return data;
      },
      async login(payload) {
        const data = await loginUser(payload);
        setUser(data.user);
        return data;
      },
      async googleLogin(credential) {
        const data = await loginWithGoogle(credential);
        setUser(data.user);
        return data;
      },
      adoptSession(data) {
        setUser(data.user || getCachedUser());
      },
      async logout() {
        await logoutUser();
        setUser(null);
      },
    }),
    [user, ready]
  );

  return <UserAuthContext.Provider value={value}>{children}</UserAuthContext.Provider>;
}

export function useUserAuth() {
  const context = useContext(UserAuthContext);
  if (!context) throw new Error("useUserAuth must be used within UserAuthProvider");
  return context;
}
