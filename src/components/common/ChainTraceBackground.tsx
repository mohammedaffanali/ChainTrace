'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

interface NodePoint {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  isAccent?: boolean;
}

interface EdgeConnection {
  from: number;
  to: number;
}

export default function ChainTraceBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Check reduced motion & data-saver
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isSaveData = (navigator as any).connection?.saveData === true;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Responsive node count
    const getNodeCount = () => {
      if (width < 640) return 8;
      if (width < 1024) return 14;
      return 22;
    };

    const nodeCount = getNodeCount();
    const nodes: NodePoint[] = [];

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        id: i,
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 2,
        isAccent: i % 4 === 0,
      });
    }

    // Precompute nearest connections
    const edges: EdgeConnection[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 220) {
          edges.push({ from: i, to: j });
        }
      }
    }

    // Pulse animation trackers
    interface Pulse {
      edgeIdx: number;
      progress: number;
      speed: number;
    }
    const pulses: Pulse[] = [];
    if (!prefersReducedMotion && !isSaveData) {
      for (let p = 0; p < Math.min(6, Math.floor(edges.length / 4)); p++) {
        pulses.push({
          edgeIdx: Math.floor(Math.random() * edges.length),
          progress: Math.random(),
          speed: 0.003 + Math.random() * 0.004,
        });
      }
    }

    // Theme detection
    const getThemeColors = () => {
      const isDark = document.documentElement.classList.contains('dark');
      if (isDark) {
        return {
          nodeFill: 'rgba(59, 130, 246, 0.45)',
          accentNodeFill: 'rgba(200, 169, 107, 0.7)',
          lineStroke: 'rgba(34, 48, 72, 0.5)',
          pulseStroke: 'rgba(6, 182, 212, 0.85)',
          pulseGlow: 'rgba(6, 182, 212, 0.5)',
        };
      } else {
        return {
          nodeFill: 'rgba(21, 94, 239, 0.35)',
          accentNodeFill: 'rgba(166, 124, 50, 0.65)',
          lineStroke: 'rgba(217, 214, 206, 0.65)',
          pulseStroke: 'rgba(21, 94, 239, 0.75)',
          pulseGlow: 'rgba(21, 94, 239, 0.3)',
        };
      }
    };

    let colors = getThemeColors();

    const handleThemeChange = () => {
      colors = getThemeColors();
    };
    window.addEventListener('chaintrace-theme-change', handleThemeChange);

    // Animation Loop via GSAP ticker for 60fps & auto-sync
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Move nodes slightly if not reduced motion
      if (!prefersReducedMotion && !isSaveData) {
        nodes.forEach((n) => {
          n.x += n.vx;
          n.y += n.vy;

          if (n.x < 0 || n.x > width) n.vx *= -1;
          if (n.y < 0 || n.y > height) n.vy *= -1;
        });
      }

      // 2. Draw Connections
      edges.forEach((edge) => {
        const n1 = nodes[edge.from];
        const n2 = nodes[edge.to];
        const dx = n1.x - n2.x;
        const dy = n1.y - n2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 260) {
          const alpha = 1 - dist / 260;
          ctx.strokeStyle = colors.lineStroke;
          ctx.lineWidth = 1;
          ctx.globalAlpha = alpha * 0.7;
          ctx.beginPath();
          ctx.moveTo(n1.x, n1.y);
          ctx.lineTo(n2.x, n2.y);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      });

      // 3. Draw Moving Pulses (Transaction packets)
      if (!prefersReducedMotion && !isSaveData && edges.length > 0) {
        pulses.forEach((pulse) => {
          pulse.progress += pulse.speed;
          if (pulse.progress > 1) {
            pulse.progress = 0;
            pulse.edgeIdx = Math.floor(Math.random() * edges.length);
          }

          const edge = edges[pulse.edgeIdx];
          if (!edge) return;
          const n1 = nodes[edge.from];
          const n2 = nodes[edge.to];

          const px = n1.x + (n2.x - n1.x) * pulse.progress;
          const py = n1.y + (n2.y - n1.y) * pulse.progress;

          ctx.fillStyle = colors.pulseStroke;
          ctx.beginPath();
          ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // 4. Draw Nodes
      nodes.forEach((n) => {
        ctx.fillStyle = n.isAccent ? colors.accentNodeFill : colors.nodeFill;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    gsap.ticker.add(render);

    // Resize listener
    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      gsap.ticker.remove(render);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('chaintrace-theme-change', handleThemeChange);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
    >
      {/* Fallback architectural grid in CSS for immediate render or no-JS */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border-subtle)_1px,transparent_1px),linear-gradient(to_bottom,var(--border-subtle)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35"></div>

      {/* Canvas for GSAP animated blockchain topology */}
      <canvas
        ref={canvasRef}
        className={`w-full h-full block transition-opacity duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
}
