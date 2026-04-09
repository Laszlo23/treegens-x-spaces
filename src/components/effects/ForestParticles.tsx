"use client";

/**
 * Ambient “canopy” particles — canvas layer behind the dashboard.
 * Respects prefers-reduced-motion by fading movement intensity.
 */

import { useEffect, useRef } from "react";

type Particle = { x: number; y: number; vx: number; vy: number; r: number; a: number };

export function ForestParticles() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const surface: HTMLCanvasElement = el;
    const ctxRaw = surface.getContext("2d");
    if (!ctxRaw) return;
    const ctx: CanvasRenderingContext2D = ctxRaw;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const speed = reduced ? 0.15 : 0.45;

    let w = 0;
    let h = 0;
    let particles: Particle[] = [];
    let raf = 0;

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      surface.width = w;
      surface.height = h;
      const n = Math.min(90, Math.floor((w * h) / 18000));
      particles = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        r: 1 + Math.random() * 2.2,
        a: 0.12 + Math.random() * 0.35,
      }));
    }

    function frame() {
      ctx.fillStyle = "rgba(6, 12, 10, 0.35)";
      ctx.fillRect(0, 0, surface.width, surface.height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 8);
        grd.addColorStop(0, `rgba(213, 226, 107, ${p.a})`);
        grd.addColorStop(1, "rgba(61, 70, 32, 0)");
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!reduced && particles.length > 2) {
        ctx.strokeStyle = "rgba(192, 202, 94, 0.08)";
        ctx.lineWidth = 0.5;
        for (let i = 0; i < particles.length; i += 3) {
          const a = particles[i];
          const b = particles[(i + 7) % particles.length];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 160) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(frame);
    }

    resize();
    window.addEventListener("resize", resize);
    frame();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
      aria-hidden
    />
  );
}
