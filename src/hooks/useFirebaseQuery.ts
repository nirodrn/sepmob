import { useState, useEffect } from 'react';
import { onValue, Query } from 'firebase/database';

export function useFirebaseQuery<T>(query: Query | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = onValue(
      query,
      (snapshot) => {
        try {
          const value = snapshot.val();
          setData(value);
          setError(null);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error('Firebase Query Error:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [query]);

  return { data, loading, error };
}
