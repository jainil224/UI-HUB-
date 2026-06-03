import { useState, useEffect } from 'react';
import { isMobile as isMobileDevice } from 'react-device-detect';

export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(isMobileDevice || window.innerWidth < 768);
    };
    
    // Set initial value on mount to prevent SSR hydration mismatches
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
};
