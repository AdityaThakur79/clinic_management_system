import { useEffect, useCallback } from 'react';
import Lenis from 'lenis';

const useLenis = () => {
  // Scroll to a specific element
  const scrollTo = useCallback((target, options = {}) => {
    if (window.lenis) {
      window.lenis.scrollTo(target, {
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        ...options
      });
    } else {
      // Fallback for native scroll
      if (typeof target === 'string') {
        const element = document.querySelector(target);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } else if (typeof target === 'number') {
        window.scrollTo({ top: target, behavior: 'smooth' });
      }
    }
  }, []);

  // Scroll to top
  const scrollToTop = useCallback(() => {
    scrollTo(0);
  }, [scrollTo]);

  // Start/stop Lenis
  const start = useCallback(() => {
    if (window.lenis) {
      window.lenis.start();
    }
  }, []);

  const stop = useCallback(() => {
    if (window.lenis) {
      window.lenis.stop();
    }
  }, []);

  // Get current scroll position
  const getScroll = useCallback(() => {
    if (window.lenis) {
      return window.lenis.scroll;
    }
    return window.pageYOffset || document.documentElement.scrollTop;
  }, []);

  return {
    scrollTo,
    scrollToTop,
    start,
    stop,
    getScroll
  };
};

export default useLenis; 