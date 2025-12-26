import React, { useEffect, useRef } from 'react';

const Snow = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        let width = window.innerWidth;
        let height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        const snowflakes = [];
        const count = 100; // Manageable count

        for (let i = 0; i < count; i++) {
            snowflakes.push({
                x: Math.random() * width,
                y: Math.random() * height,
                opacity: Math.random(),
                speedX: Math.random() * 1 - 0.5,
                speedY: Math.random() * 1 + 0.5,
                radius: Math.random() * 2 + 1,
            });
        }

        const draw = () => {
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.beginPath();
            for (let i = 0; i < count; i++) {
                const f = snowflakes[i];
                ctx.moveTo(f.x, f.y);
                ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2, true);
            }
            ctx.fill();
            move();
            requestAnimationFrame(draw);
        };

        const move = () => {
            for (let i = 0; i < count; i++) {
                const f = snowflakes[i];
                f.x += f.speedX;
                f.y += f.speedY;

                if (f.y > height) {
                    f.y = 0;
                    f.x = Math.random() * width;
                }
                if (f.x > width) {
                    f.x = 0;
                } else if (f.x < 0) {
                    f.x = width;
                }
            }
        };

        let animationFrameId = requestAnimationFrame(draw);

        const handleResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };

        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                pointerEvents: 'none',
                zIndex: 9999
            }}
        />
    );
};

export default Snow;
