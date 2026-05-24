import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user has an active session on load
  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUser({
            id: data.id,
            username: data.username,
            email: data.email,
            fullName: data.fullName,
            phone: data.phone,
            address: data.address,
            role: data.role // ROLE_USER, ROLE_ADMIN, ROLE_WORKER
          });
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Session check failed:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const login = async (username, password) => {
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append('username', username);
      params.append('password', password);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params
      });

      const data = await response.json();
      if (response.ok && data.success) {
        // Fetch current user details after successful login
        await checkSession();
        return true;
      } else {
        setError(data.error || "Invalid username or password");
        return false;
      }
    } catch (err) {
      setError("Connection error. Please try again.");
      return false;
    }
  };

  const logout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST'
      });
      if (response.ok) {
        setUser(null);
        setError(null);
        return true;
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
    // Fallback: reset state
    setUser(null);
    return false;
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, checkSession, setError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
