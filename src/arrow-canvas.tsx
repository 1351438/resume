import React, { useEffect, useRef, useCallback } from 'react';

interface Point {
    x: number;
    y: number;
    active: boolean;
}

const ArrowBackgroundCanvas: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const mouseRef = useRef<Point>({
        x: -1000,
        y: -1000,
        active: false
    });

    const getDistance = useCallback((x1: number, y1: number, x2: number, y2: number) =>
        Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2), []);

    const lerp = useCallback((start: number, end: number, amt: number) =>
        (1 - amt) * start + amt * end, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let lines: Line[] = [];
        let time = 0;
        let animationFrameId: number;
        let width: number;
        let height: number;

        const config = {
            gridSpacing: 40,
            lineLength: 15,
            mouseRadius: 300,
            ease: 0.1,
            baseColor: { h: 220, s: 10, l: 20 },
            activeColor: { h: 180, s: 80, l: 60 }
        };

        class Line {
            x: number;
            y: number;
            angle: number = 0;
            targetAngle: number = 0;
            hue: number = config.baseColor.h;
            sat: number = config.baseColor.s;
            light: number = config.baseColor.l;
            alpha: number = 0.3;

            constructor(x: number, y: number) {
                this.x = x;
                this.y = y;
            }

            update(time: number, mouse: Point) {
                const dist = getDistance(this.x, this.y, mouse.x, mouse.y);

                if (dist < config.mouseRadius && mouse.active) {
                    const dy = mouse.y - this.y;
                    const dx = mouse.x - this.x;
                    this.targetAngle = Math.atan2(dy, dx);

                    const strength = 1 - dist / config.mouseRadius;
                    this.hue = lerp(config.baseColor.h, config.activeColor.h, strength);
                    this.sat = lerp(config.baseColor.s, config.activeColor.s, strength);
                    this.light = lerp(config.baseColor.l, config.activeColor.l, strength);
                    this.alpha = lerp(0.3, 0.9, strength);
                } else {
                    const noise = Math.sin(0.005 * this.x + 0.001 * time) + Math.cos(0.005 * this.y + 0.001 * time);
                    this.targetAngle = 0.5 * noise;

                    this.hue = lerp(this.hue, config.baseColor.h, 0.1);
                    this.sat = lerp(this.sat, config.baseColor.s, 0.1);
                    this.light = lerp(this.light, config.baseColor.l, 0.1);
                    this.alpha = lerp(this.alpha, 0.3, 0.1);
                }

                let da = this.targetAngle - this.angle;
                while (da > Math.PI) da -= 2 * Math.PI;
                while (da < -Math.PI) da += 2 * Math.PI;
                this.angle += da * config.ease;
            }

            draw(context: CanvasRenderingContext2D) {
                context.save();
                context.translate(this.x, this.y);
                context.rotate(this.angle);

                context.strokeStyle = `hsla(${this.hue}, ${this.sat}%, ${this.light}%, ${this.alpha})`;
                context.lineWidth = 2;
                context.lineCap = 'round';

                context.beginPath();
                context.moveTo(-config.lineLength / 2, 0);
                context.lineTo(config.lineLength / 2, 0);

                if (this.alpha > 0.5) {
                    context.lineTo(config.lineLength / 2 - 4, -3);
                    context.moveTo(config.lineLength / 2, 0);
                    context.lineTo(config.lineLength / 2 - 4, 3);
                }

                context.stroke();
                context.restore();
            }
        }

        const init = () => {
            lines = [];
            width = window.innerWidth;
            height = window.innerHeight;

            const dpr = window.devicePixelRatio || 1;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.scale(dpr, dpr);

            const cols = Math.floor(width / config.gridSpacing);
            const rows = Math.floor(height / config.gridSpacing);
            const offsetX = (width - cols * config.gridSpacing) / 2 + config.gridSpacing / 2;
            const offsetY = (height - rows * config.gridSpacing) / 2 + config.gridSpacing / 2;

            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    const x = offsetX + i * config.gridSpacing;
                    const y = offsetY + j * config.gridSpacing;
                    lines.push(new Line(x, y));
                }
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, width, height);
            time += 1;
            lines.forEach(line => {
                line.update(time, mouseRef.current);
                line.draw(ctx);
            });
            animationFrameId = requestAnimationFrame(animate);
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY, active: true };
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches.length > 0) {
                mouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, active: true };
            }
        };

        const handleMouseLeave = () => {
            mouseRef.current = { x: -1000, y: -1000, active: false };
        };

        window.addEventListener('resize', init);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('touchmove', handleTouchMove);
        window.addEventListener('mouseleave', handleMouseLeave);

        init();
        animate();

        return () => {
            window.removeEventListener('resize', init);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('mouseleave', handleMouseLeave);
            cancelAnimationFrame(animationFrameId);
        };
    }, [getDistance, lerp]);

    return (
        <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: -1,
            backgroundColor: "#0a0b10",
            overflow: "hidden"
        }}>
            <canvas
                ref={canvasRef}
                style={{
                    display: "block",
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    zIndex: 1,
                    willChange: "transform"
                }}
            />
            <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
                zIndex: 2,
                background: "radial-gradient(circle, rgba(0,0,0,0) 50%, rgba(0,0,0,0.6) 100%)"
            }} />
        </div>
    );
};

export default ArrowBackgroundCanvas;