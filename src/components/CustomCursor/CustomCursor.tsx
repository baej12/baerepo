import { useEffect, useRef } from 'react';

export const CustomCursor = () => {
    const cursorRef = useRef<HTMLDivElement>(null);
    const trailTimerRef = useRef<number>(0);

    useEffect(() => {
        const cursor = cursorRef.current;
        if (!cursor) return;

        let mouseX = 0;
        let mouseY = 0;
        let cursorX = 0;
        let cursorY = 0;

        const handleMouseMove = (e: MouseEvent) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            // Check for edge proximity and create particles
            const edgeThreshold = 50;
            const { innerWidth, innerHeight } = window;
            
            if (mouseX < edgeThreshold || mouseX > innerWidth - edgeThreshold ||
                mouseY < edgeThreshold || mouseY > innerHeight - edgeThreshold) {
                createEdgeParticles(mouseX, mouseY);
            }

            // Create trail effect
            if (Date.now() - trailTimerRef.current > 50) {
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
            if (target.tagName === 'A' || target.tagName === 'BUTTON' || 
                target.closest('a') || target.closest('button') ||
                target.classList.contains('job-item') ||
                target.classList.contains('project-card') ||
                target.classList.contains('page-navigator')) {
                cursor.classList.add('hover');
            } else {
                cursor.classList.remove('hover');
            }
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
        animate();

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseover', handleMouseOver);
        };
    }, []);

    return <div ref={cursorRef} className="custom-cursor" />;
};
