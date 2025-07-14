'use client';

import { useState, useEffect } from 'react';

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const breakpoints = {
  xs: 475,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export const useResponsive = () => {
  const [screenSize, setScreenSize] = useState<Breakpoint>('lg');
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      
      if (width >= breakpoints['2xl']) {
        setScreenSize('2xl');
      } else if (width >= breakpoints.xl) {
        setScreenSize('xl');
      } else if (width >= breakpoints.lg) {
        setScreenSize('lg');
      } else if (width >= breakpoints.md) {
        setScreenSize('md');
      } else if (width >= breakpoints.sm) {
        setScreenSize('sm');
      } else {
        setScreenSize('xs');
      }

      setIsMobile(width < breakpoints.md);
      setIsTablet(width >= breakpoints.md && width < breakpoints.lg);
      setIsDesktop(width >= breakpoints.lg);
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  const isBreakpoint = (breakpoint: Breakpoint) => {
    return screenSize === breakpoint;
  };

  const isAboveBreakpoint = (breakpoint: Breakpoint) => {
    const currentIndex = Object.keys(breakpoints).indexOf(screenSize);
    const targetIndex = Object.keys(breakpoints).indexOf(breakpoint);
    return currentIndex >= targetIndex;
  };

  return {
    screenSize,
    isMobile,
    isTablet,
    isDesktop,
    isBreakpoint,
    isAboveBreakpoint,
  };
};