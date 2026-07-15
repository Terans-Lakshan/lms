import axios from 'axios';
import { createContext, useState, useEffect, useRef } from 'react';

// eslint-disable-next-line react-refresh/only-export-components
export const UserContext = createContext();

export function UserContextProvider({ children }) {
    const [user, setUser] = useState(null);
    const fetched = useRef(false);

    useEffect(() => {
        if (fetched.current) return;
        fetched.current = true;

        const token = localStorage.getItem('token');
        if (!token) return;

        axios.get('/api/auth/profile', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(({ data }) => {
                setUser(data);
            })
            .catch((error) => {
                console.error('Error fetching user profile:', error);
            });
    }, []);

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
}