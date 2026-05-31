import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

interface SkeletonContextType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  triggerLoading: (duration?: number) => void;
}

const SkeletonContext = createContext<SkeletonContextType | undefined>(undefined);

export const SkeletonProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);

  const triggerLoading = useCallback((duration: number = 1500) => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, duration);
  }, []);

  useEffect(() => {
    // Automatically trigger on mount
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SkeletonContext.Provider value={{ isLoading, setIsLoading, triggerLoading }}>
      {children}
    </SkeletonContext.Provider>
  );
};

export const useSkeleton = () => {
  const context = useContext(SkeletonContext);
  if (context === undefined) {
    throw new Error('useSkeleton must be used within a SkeletonProvider');
  }
  return context;
};
