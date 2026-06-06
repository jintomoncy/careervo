import { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    stream: '',
    interests: [],
    answers: {}
  });

  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      if (currentUser) {
        try {
          const docRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && isMounted) {
            const data = docSnap.data();
            setUserProfile(prev => ({ 
              ...prev, 
              ...data,
              name: data.firstName ? `${data.firstName} ${data.lastName || ''}`.trim() : prev.name,
              stream: data.plusTwoStream || data.stream || prev.stream,
              interests: data.selectedInterests || prev.interests
            }));
          } else if (isMounted) {
            setUserProfile(prev => ({
              ...prev,
              email: currentUser.email,
              name: currentUser.displayName || prev.name,
              uid: currentUser.uid
            }));
          }
        } catch (err) {
          console.error("Error fetching user profile:", err);
        }
      }
    };
    fetchProfile();
    return () => { isMounted = false; };
  }, [currentUser]);

  const updateProfile = (updates) => {
    setUserProfile(prev => ({ ...prev, ...updates }));
  };

  return (
    <UserContext.Provider value={{ userProfile, updateProfile }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
