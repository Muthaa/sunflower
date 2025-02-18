import React, { useEffect, useRef, useState } from "react";

const maxSeeds = 300; // Increased to 300 seeds
const animationDuration = 5000; // 8 seconds for full formation
const resetDuration = 4000; // 4 seconds for reset transition
const staggerDelay = 40; // Delay between each seed's movement
const tau = Math.PI * 2;
const scaleFactor = 1 / 40;
const phi = (Math.sqrt(5) + 1) / 2;
const outerCircleRadius = 0.8 * 300; // **Increased outer circle distance**

const Sunflower = () => {
    const canvasRef = useRef(null);
    const [positions, setPositions] = useState([]);
    const [isResetting, setIsResetting] = useState(false);
    const startTimeRef = useRef(null);

    useEffect(() => {
        initializeSeeds();
        startAnimation();
    }, []);

    const initializeSeeds = () => {
        const initialPositions = [];
        for (let i = 0; i < maxSeeds; i++) {
            const angle = tau * i / maxSeeds;
            const radius = outerCircleRadius; // Seeds start **farther out**
            initialPositions.push({
                x: radius * Math.cos(angle),
                y: radius * Math.sin(angle),
                progress: 0,
                delay: i * staggerDelay, // Each seed moves with a delay
            });
        }
        setPositions(initialPositions);
    };

    const startAnimation = () => {
        startTimeRef.current = performance.now();
        setIsResetting(false);
        animateSeeds("inward");
    };

    const startReset = () => {
        startTimeRef.current = performance.now();
        setIsResetting(true);
        animateSeeds("outward");
    };

    const animateSeeds = (direction) => {
        const animate = (time) => {
            const elapsedTime = time - startTimeRef.current;
            const duration = direction === "inward" ? animationDuration : resetDuration;

            setPositions((prevPositions) =>
                prevPositions.map((seed, index) => {
                    const progress = Math.min(
                        Math.max(elapsedTime - seed.delay, 0) / duration,
                        1
                    ); // Delay movement for each seed
                    const easedProgress = slowEasing(progress);

                    let targetX, targetY;

                    if (direction === "inward") {
                        // Move to sunflower pattern
                        const targetTheta = index * tau / phi;
                        const targetRadius = Math.sqrt(index) * scaleFactor * 300;
                        targetX = targetRadius * Math.cos(targetTheta);
                        targetY = targetRadius * Math.sin(targetTheta);
                    } else {
                        // Reset back to one seed in the center and others in a **wider circle**
                        if (index === 0) {
                            targetX = 0;
                            targetY = 0;
                        } else {
                            const angle = tau * index / maxSeeds;
                            const radius = outerCircleRadius; // **Seeds go to a wider outer circle**
                            targetX = radius * Math.cos(angle);
                            targetY = radius * Math.sin(angle);
                        }
                    }

                    return {
                        x: seed.x + (targetX - seed.x) * easedProgress,
                        y: seed.y + (targetY - seed.y) * easedProgress,
                        progress: easedProgress,
                        delay: seed.delay, // Keep delay consistent
                    };
                })
            );

            if (elapsedTime < duration + maxSeeds * staggerDelay) {
                requestAnimationFrame(animate);
            } else {
                if (direction === "inward") {
                    setTimeout(startReset, 2000); // Hold shape before resetting
                } else {
                    setTimeout(startAnimation, 2000); // Hold reset state before reforming
                }
            }
        };

        requestAnimationFrame(animate);
    };

    useEffect(() => {
        drawSunflower();
    }, [positions]);

    const drawSunflower = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);

        positions.forEach((seed) => {
            drawSeed(ctx, seed.x, seed.y);
        });

        ctx.restore();
    };

    const drawSeed = (ctx, x, y) => {
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, tau);
        ctx.fillStyle = "orange";
        ctx.fill();
    };

    // **Slower easing function for gradual movement**
    const slowEasing = (t) => Math.pow(t, 1.5); // Slower easing function

    return (
        <div style={{ textAlign: "center" }}>
            <canvas ref={canvasRef} width={800} height={600} />
        </div>
    );
};

export default Sunflower;
