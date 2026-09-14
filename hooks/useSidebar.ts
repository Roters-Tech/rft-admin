'use client';

import { useEffect, useState } from 'react';

export function useSidebar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsCollapsed(width >= 768 && width < 1024);
      if (width >= 768) {
        setIsMobileOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    isMobileOpen,
    isCollapsed,
    openMobile: () => setIsMobileOpen(true),
    closeMobile: () => setIsMobileOpen(false),
  };
}
