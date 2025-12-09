import { createContext, useState, useEffect, useContext } from 'react';
import axios from '../utils/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        checkUserLoggedIn();
    }, []);

    const checkUserLoggedIn = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const { data } = await axios.get('/auth/me');
                setUser(data);
            } catch (err) {
                console.error(err);
                localStorage.removeItem('token');
                setUser(null);
            }
        }
        setLoading(false);
    };

    const login = async (email, password) => {
        try {
            setError(null);
            const { data } = await axios.post('/auth/login', { email, password });
            localStorage.setItem('token', data.token);
            setUser(data);
            return data;
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
            throw err;
        }
    };

    const register = async (userData) => {
        try {
            setError(null);
            const { data } = await axios.post('/auth/register', userData);

            // If email verification is not required (auto-verified), log the user in
            if (!data.requiresVerification && data.token) {
                localStorage.setItem('token', data.token);
                setUser(data.user);
            }

            return data;
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
            throw err;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const refreshUser = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const { data } = await axios.get('/auth/me');
                setUser(data);
                return data;
            } catch (err) {
                console.error('Error refreshing user:', err);
                return null;
            }
        }
        return null;
    };

    return (
        <AuthContext.Provider value={{ user, loading, error, login, register, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};
