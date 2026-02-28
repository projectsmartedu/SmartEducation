import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { authAPI } from '../services/api';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const socketRef = useRef(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = useCallback(async () => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
            // If offline, use stored user data directly
            if (!navigator.onLine) {
                try {
                    const parsed = JSON.parse(storedUser);
                    setUser(parsed);
                    // connect socket only if online
                    // (we skip since offline)
                } catch {
                    setUser(null);
                }
                setLoading(false);
                return;
            }
            try {
                const response = await authAPI.getMe();
                setUser(response.data);
                // Update stored user with fresh data
                localStorage.setItem('user', JSON.stringify(response.data));
                // connect socket
                connectSocket(response.data);
            } catch (error) {
                console.error('Auth check failed:', error);
                // If it's a network error (offline/server down), use stored user
                if (!error.response) {
                    try {
                        setUser(JSON.parse(storedUser));
                    } catch {
                        setUser(null);
                    }
                } else {
                    // Actual auth failure (401, etc.)
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setUser(null);
                }
            }
            }
            setLoading(false);
        }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const connectSocket = (u) => {
        try {
            if (!u) return;
            if (socketRef.current) return;
            const backend = process.env.REACT_APP_API_URL || 'http://localhost:5000';
            const socket = io(backend, { transports: ['websocket', 'polling'] });
            socketRef.current = socket;

            socket.on('connect', () => {
                socket.emit('register', { userId: u._id, role: u.role });
            });

            const pushNotification = (n) => {
                setNotifications(prev => [n, ...prev].slice(0, 100));
                toast.success(n.message || 'New notification');
            };

            socket.on('courseCreated', ({ course }) => {
                pushNotification({ type: 'course', message: `New course: ${course.title}`, data: course });
            });
            socket.on('topicCreated', ({ topic, courseId }) => {
                pushNotification({ type: 'topic', message: `New topic: ${topic.title}`, data: { topic, courseId } });
            });
            socket.on('newDoubt', ({ doubt }) => {
                pushNotification({ type: 'doubt', message: 'A student submitted a new doubt', data: doubt });
            });
            socket.on('doubtAnswered', ({ doubt }) => {
                pushNotification({ type: 'doubtAnswered', message: 'Your doubt has an answer', data: doubt });
            });
            socket.on('deadlineAlert', ({ alert }) => {
                pushNotification({ type: 'deadline', message: alert.message || 'Deadline approaching', data: alert });
            });
        } catch (e) {
            console.error('Socket connect error', e);
        }
    };

    const login = async (email, password) => {
        const response = await authAPI.login({ email, password });
        const { token, ...userData } = response.data;

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        connectSocket(userData);

        return userData;
    };

    const logout = async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        }
    };

    const value = {
        user,
        notifications,
        login,
        logout,
        loading,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
