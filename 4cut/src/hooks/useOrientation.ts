import { useState, useEffect } from 'react';

type OrientationType = 'portrait' | 'landscape';

/**
 * 화면의 세로/가로 모드를 감지하는 React Hook
 * @returns {'portrait' | 'landscape'} 현재 화면 방향
 */
export function useOrientation(): OrientationType {
    const [orientation, setOrientation] = useState<OrientationType>('portrait');

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const mediaQuery = window.matchMedia('(orientation: landscape)');

        const handleOrientationChange = (e: MediaQueryListEvent) => {
            setOrientation(e.matches ? 'landscape' : 'portrait');
        };

        setOrientation(mediaQuery.matches ? 'landscape' : 'portrait');

        mediaQuery.addEventListener('change', handleOrientationChange);

        return () => {
            mediaQuery.removeEventListener('change', handleOrientationChange);
        };
    }, []);

    return orientation;
}