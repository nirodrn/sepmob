import { useState, useEffect } from 'react';
import { ref, onValue, push, set, update, remove } from 'firebase/database';
import { database } from '../config/firebase';
import { useAuth } from '../context/AuthContext';

export function useFirebaseData<T>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dataRef = ref(database, path);
    
    const unsubscribe = onValue(dataRef, 
      (snapshot) => {
        try {
          const value = snapshot.val();
          setData(value);
          setError(null);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [path]);

  return { data, loading, error };
}

export function useFirebaseActions() {
  const { currentUser } = useAuth();

  const addData = async (path: string, data: any) => {
    if (!currentUser) throw new Error('User not authenticated');
    
    const dataRef = ref(database, path);
    const newRef = push(dataRef);
    await set(newRef, {
      ...data,
      id: newRef.key,
      createdAt: Date.now(),
      createdBy: currentUser.uid
    });
    return newRef.key;
  };

  const setData = async (path: string, data: any) => {
    if (!currentUser) throw new Error('User not authenticated');
    
    const dataRef = ref(database, path);
    await set(dataRef, {
      ...data,
      createdAt: Date.now(),
      createdBy: currentUser.uid
    });
  };

  const updateData = async (path: string, data: any) => {
    if (!currentUser) throw new Error('User not authenticated');
    
    const dataRef = ref(database, path);
    await update(dataRef, {
      ...data,
      updatedAt: Date.now(),
      updatedBy: currentUser.uid
    });
  };

  const deleteData = async (path: string) => {
    if (!currentUser) throw new Error('User not authenticated');
    
    const dataRef = ref(database, path);
    await remove(dataRef);
  };

  return { addData, setData, updateData, deleteData };
}
