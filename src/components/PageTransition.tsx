import { ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (children !== displayChildren) {
      setIsTransitioning(true);
      const timeout = setTimeout(() => {
        setDisplayChildren(children);
        setIsTransitioning(false);
      }, 150);
      return () => clearTimeout(timeout);
    }
  }, [children, displayChildren]);

  return (
    <div
      className={cn(
        'transition-all duration-200 ease-out',
        isTransitioning 
          ? 'opacity-0 translate-y-2 scale-[0.99]' 
          : 'opacity-100 translate-y-0 scale-100'
      )}
      key={location.pathname}
    >
      {displayChildren}
    </div>
  );
}
