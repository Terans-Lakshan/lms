import axios from 'axios';
import { createContext, useState , useEffect } from 'react';

// eslint-disable-next-line react-refresh/only-export-components
export const UserContext = createContext();

export function UserContextProvider({ children }) {
    const [user, setUser] = useState(null);
    useEffect(() => {
        if(!user){
            axios.get('/profile').then(({data})=>{
                setUser(data);
            });
        }
    });

//   const fetchUserData = async () => {
//     try {
//       const response = await axios.get('/api/user');
//       return response.data;
//     } catch (error) {
//       console.error('Error fetching user data:', error);
//       return null;
//     }
//   };

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}