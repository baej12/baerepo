import { useEffect, useRef } from 'react';

export const CustomCursor = () => {
    const cursorRef = useRef<HTMLDivElement>(null);
    const trailTimerRef = useRef<number>(0);
    const clickTimeoutRef = useRef<number>(0);

    useEffect(() => {
        const cursor = cursorRef.current;
        if (!cursor) return;

        let mouseX = 0;
        let mouseY = 0;
        let cursorX = 0;
        let cursorY = 0;
        const isHistoryRoute = window.location.pathname === '/history';

        const handleMouseMove = (e: MouseEvent) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            const target = e.target as HTMLElement | null;
            const isOverMap = !!target?.closest('.us-history-map');
            if (isOverMap) {
                cursor.classList.add('cursor-hidden');
                return;
            }

            cursor.classList.remove('cursor-hidden');

            // Check for edge proximity and create particles
            const edgeThreshold = 50;
            const { innerWidth, innerHeight } = window;
            
            if (!isHistoryRoute && (mouseX < edgeThreshold || mouseX > innerWidth - edgeThreshold ||
                mouseY < edgeThreshold || mouseY > innerHeight - edgeThreshold)) {
                createEdgeParticles(mouseX, mouseY);
            }

            // Create trail effect
            if (!isHistoryRoute && Date.now() - trailTimerRef.current > 50) {
                createTrail(mouseX, mouseY);
                trailTimerRef.current = Date.now();
            }
        };

        const createTrail = (x: number, y: number) => {
            const trail = document.createElement('div');
            trail.className = 'cursor-trail';
            trail.style.left = `${x}px`;
            trail.style.top = `${y}px`;
            document.body.appendChild(trail);
            
            setTimeout(() => trail.remove(), 600);
        };

        const createEdgeParticles = (x: number, y: number) => {
            const particleCount = 5;
            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('div');
                particle.className = 'edge-particle';
                particle.style.left = `${x}px`;
                particle.style.top = `${y}px`;
                
                const angle = (Math.PI * 2 * i) / particleCount;
                const distance = 50 + Math.random() * 30;
                const tx = Math.cos(angle) * distance;
                const ty = Math.sin(angle) * distance;
                
                particle.style.setProperty('--tx', `${tx}px`);
                particle.style.setProperty('--ty', `${ty}px`);
                
                document.body.appendChild(particle);
                setTimeout(() => particle.remove(), 800);
            }
        };

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.closest('.us-history-map')) {
                cursor.classList.add('cursor-hidden');
                cursor.classList.remove('hover');
                return;
            }

            cursor.classList.remove('cursor-hidden');

            if (target.tagName === 'A' || target.tagName === 'BUTTON' || 
                target.closest('a') || target.closest('button') ||
                target.classList.contains('job-item') ||
                target.classList.contains('project-card') ||
                target.classList.contains('page-navigator') ||
                target.classList.contains('resume-link')) {
                cursor.classList.add('hover');
            } else {
                cursor.classList.remove('hover');
            }
        };

        const handleMouseDown = () => {
            cursor.classList.add('click');
        };

        const handleMouseUp = () => {
            // Clear existing timeout
            if (clickTimeoutRef.current) {
                clearTimeout(clickTimeoutRef.current);
            }
            
            // Delay removal for smooth fade back to default
            clickTimeoutRef.current = window.setTimeout(() => {
                cursor.classList.remove('click');
            }, 200);
        };

        const handleDragStart = (e: DragEvent) => {
            e.preventDefault();
            return false;
        };

        const animate = () => {
            const dx = mouseX - cursorX;
            const dy = mouseY - cursorY;
            
            cursorX += dx * 0.2;
            cursorY += dy * 0.2;
            
            cursor.style.left = `${cursorX}px`;
            cursor.style.top = `${cursorY}px`;
            
            requestAnimationFrame(animate);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseover', handleMouseOver);
        document.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('dragstart', handleDragStart);
        animate();

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseover', handleMouseOver);
            document.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('dragstart', handleDragStart);
            if (clickTimeoutRef.current) {
                clearTimeout(clickTimeoutRef.current);
            }
        };
    }, []);

    return <div ref={cursorRef} className="custom-cursor" />;
};
