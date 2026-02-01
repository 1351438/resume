import {useEffect, useRef} from "react";

type MouseState = {
    x: number;
    y: number;
    isActive: boolean;
};

type Config = {
    gridSize: number;
    fragmentCount: number;
    snapRadius: number;
    snapSpeed: number;
    driftSpeed: number;
    baseColor: string;
    activeColor: string;
};

type FragmentType =
    | "LINE_H"
    | "LINE_V"
    | "CORNER_TL"
    | "CORNER_TR"
    | "CORNER_BL"
    | "CORNER_BR"
    | "CROSS";

export default function BlueprintCanvas() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const mouse = useRef<MouseState>({
        x: -1000,
        y: -1000,
        isActive: false,
    });

    const config = useRef<Config>({
        gridSize: 50,
        fragmentCount: 150,
        snapRadius: 250,
        snapSpeed: 0.15,
        driftSpeed: 0.4,
        baseColor: "100, 100, 100",
        activeColor: "255, 255, 255",
    });

    const fragmentTypes = useRef<FragmentType[]>([
        "LINE_H",
        "LINE_V",
        "CORNER_TL",
        "CORNER_TR",
        "CORNER_BL",
        "CORNER_BR",
        "CROSS",
    ]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let width = 0;
        let height = 0;
        let animationId = 0;
        let fragments: Fragment[] = [];

        class Fragment {
            x = 0;
            y = 0;
            tx = 0;
            ty = 0;
            vx = 0;
            vy = 0;
            angle = 0;
            va = 0;
            locked = false;
            opacity = 0.3;
            type: FragmentType;

            constructor() {
                this.type =
                    fragmentTypes.current[
                        Math.floor(Math.random() * fragmentTypes.current.length)
                        ];
                this.init();
            }

            init() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.tx = this.x;
                this.ty = this.y;
                this.vx = (Math.random() - 0.5) * config.current.driftSpeed;
                this.vy = (Math.random() - 0.5) * config.current.driftSpeed;
                this.angle = Math.random() * Math.PI * 2;
                this.va = (Math.random() - 0.5) * 0.02;
            }

            update() {
                const m = mouse.current;
                const dx = m.x - this.x;
                const dy = m.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const snapThreshold = 0.7 * config.current.gridSize;

                if (m.isActive && dist < config.current.snapRadius) {
                    const gx =
                        Math.round(this.x / config.current.gridSize) *
                        config.current.gridSize;
                    const gy =
                        Math.round(this.y / config.current.gridSize) *
                        config.current.gridSize;

                    if (
                        Math.sqrt((this.x - gx) ** 2 + (this.y - gy) ** 2) < snapThreshold
                    ) {
                        this.locked = true;
                        this.tx = gx;
                        this.ty = gy;
                    } else {
                        this.locked = false;
                    }

                    this.x += (this.tx - this.x) * config.current.snapSpeed;
                    this.y += (this.ty - this.y) * config.current.snapSpeed;

                    let a = this.angle % (Math.PI * 2);
                    if (a > Math.PI) a -= Math.PI * 2;
                    if (a < -Math.PI) a += Math.PI * 2;
                    this.angle += (0 - a) * config.current.snapSpeed;

                    this.opacity = Math.min(this.opacity + 0.08, 1);
                } else {
                    this.locked = false;
                    this.x += this.vx;
                    this.y += this.vy;
                    this.angle += this.va;

                    if (this.x < -config.current.gridSize)
                        this.x = width + config.current.gridSize;
                    if (this.x > width + config.current.gridSize)
                        this.x = -config.current.gridSize;
                    if (this.y < -config.current.gridSize)
                        this.y = height + config.current.gridSize;
                    if (this.y > height + config.current.gridSize)
                        this.y = -config.current.gridSize;

                    this.opacity = Math.max(this.opacity - 0.02, 0.15);
                }
            }

            draw() {
                if (!ctx) return;
                if (this.opacity < 0.1) return;

                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.angle);

                const color = this.locked
                    ? config.current.activeColor
                    : config.current.baseColor;

                ctx.strokeStyle = `rgba(${color}, ${this.opacity})`;
                ctx.lineWidth = this.locked ? 2 : 1;
                ctx.lineCap = "round";

                const s = config.current.gridSize / 2;
                ctx.beginPath();

                switch (this.type) {
                    case "LINE_H":
                        ctx.moveTo(-s + 4, 0);
                        ctx.lineTo(s - 4, 0);
                        break;
                    case "LINE_V":
                        ctx.moveTo(0, -s + 4);
                        ctx.lineTo(0, s - 4);
                        break;
                    case "CORNER_TL":
                        ctx.moveTo(0, s - 4);
                        ctx.lineTo(0, 0);
                        ctx.lineTo(s - 4, 0);
                        break;
                    case "CORNER_TR":
                        ctx.moveTo(-s + 4, 0);
                        ctx.lineTo(0, 0);
                        ctx.lineTo(0, s - 4);
                        break;
                    case "CORNER_BL":
                        ctx.moveTo(0, -s + 4);
                        ctx.lineTo(0, 0);
                        ctx.lineTo(s - 4, 0);
                        break;
                    case "CORNER_BR":
                        ctx.moveTo(-s + 4, 0);
                        ctx.lineTo(0, 0);
                        ctx.lineTo(0, -s + 4);
                        break;
                    case "CROSS":
                        ctx.moveTo(0, -s + 4);
                        ctx.lineTo(0, s - 4);
                        ctx.moveTo(-s + 4, 0);
                        ctx.lineTo(s - 4, 0);
                        break;
                }

                ctx.stroke();

                if (this.locked) {
                    ctx.fillStyle = `rgba(255,255,255,${this.opacity})`;
                    ctx.fillRect(-1.5, -1.5, 3, 3);
                }
                ctx.restore();
            }


            drawGrid(
                gridSize: number
            ) {
                if (!ctx) return;
                ctx.beginPath();
                ctx.strokeStyle = "rgba(163,163,163,0.02)";
                ctx.lineWidth = 0.3;

                // vertical lines
                for (let x = 0; x <= width; x += gridSize) {
                    ctx.moveTo(x, 0);
                    ctx.lineTo(x, height);
                }

                // horizontal lines
                for (let y = 0; y <= height; y += gridSize) {
                    ctx.moveTo(0, y);
                    ctx.lineTo(width, y);
                }

                ctx.stroke();
            }
        }

        const resize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;

            fragments = [];
            for (let i = 0; i < config.current.fragmentCount; i++) {
                fragments.push(new Fragment());
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, width, height);
            fragments.forEach((f) => {
                f.update();
                f.draw();
                // f.drawGrid(150)
            });
            animationId = requestAnimationFrame(animate);
        };

        const onMouseMove = (e: MouseEvent) => {
            mouse.current.x = e.clientX;
            mouse.current.y = e.clientY;
            mouse.current.isActive = true;
        };

        const onMouseOut = () => {
            mouse.current.isActive = false;
        };

        resize();
        animate();



        window.addEventListener("resize", resize);
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseout", onMouseOut);

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener("resize", resize);
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseout", onMouseOut);
        };
    }, []);

    return (
        <div
            style={{
                position: "absolute",
                inset: 0,
                top: 0, left: 0, right: 0, bottom: 0,
                zIndex: 1,
                backgroundColor: "rgba(255,255,255,0)",
                overflow: "hidden",
                pointerEvents: 'none'
            }}
        >
            <canvas
                ref={canvasRef}
                style={{width: "100%", height: "100%", display: "block"}}
            />
        </div>
    );
}
