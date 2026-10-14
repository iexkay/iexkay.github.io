(() => {
    const canvas = document.getElementById('ambient-network');
    const context = canvas.getContext('2d');
    if (!context) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let width, height, points, frame;
    const pointer = { x: -1000, y: -1000 };
    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = width * ratio;
        canvas.height = height * ratio;
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        points = Array.from({ length: Math.min(65, Math.max(25, Math.floor(width * height / 18000))) }, () => ({
            x: Math.random() * width, y: Math.random() * height,
            vx: (Math.random() - .5) * .25, vy: (Math.random() - .5) * .25,
            radius: Math.random() * 1.2 + .7
        }));
        if (reducedMotion.matches) draw(0);
    }
    let previous = 0;
    function draw(time) {
        const delta = Math.min((time - previous) / 16.67 || 1, 2);
        previous = time;
        context.clearRect(0, 0, width, height);
        points.forEach((point, index) => {
            if (!reducedMotion.matches) {
                point.x += point.vx * delta;
                point.y += point.vy * delta;
                if (point.x < 0 || point.x > width) point.vx *= -1;
                if (point.y < 0 || point.y > height) point.vy *= -1;
            }
            for (let next = index + 1; next < points.length; next++) {
                const other = points[next];
                const distance = Math.hypot(point.x - other.x, point.y - other.y);
                if (distance < 160) {
                    context.strokeStyle = `rgba(129,140,248,${(1 - distance / 160) * .16})`;
                    context.lineWidth = .7;
                    context.beginPath(); context.moveTo(point.x, point.y); context.lineTo(other.x, other.y); context.stroke();
                }
            }
            const nearby = Math.hypot(point.x - pointer.x, point.y - pointer.y) < 180;
            context.fillStyle = nearby ? 'rgba(103,232,249,.65)' : 'rgba(165,180,252,.35)';
            context.beginPath(); context.arc(point.x, point.y, point.radius, 0, Math.PI * 2); context.fill();
            if (nearby && !reducedMotion.matches) {
                context.strokeStyle = 'rgba(103,232,249,.12)';
                context.beginPath(); context.moveTo(point.x, point.y); context.lineTo(pointer.x, pointer.y); context.stroke();
            }
        });
        if (!reducedMotion.matches && !document.hidden) frame = requestAnimationFrame(draw);
    }
    function start() {
        cancelAnimationFrame(frame);
        previous = 0;
        if (!document.hidden) draw(performance.now());
    }
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', event => { pointer.x = event.clientX; pointer.y = event.clientY; }, { passive: true });
    document.addEventListener('pointerleave', () => { pointer.x = pointer.y = -1000; });
    document.addEventListener('visibilitychange', start);
    reducedMotion.addEventListener('change', start);
    resize(); start();
})();
