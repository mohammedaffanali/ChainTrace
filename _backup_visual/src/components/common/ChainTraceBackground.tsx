import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

interface ForensicNode {
  id: number;
  clusterId: number;
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
  radius: number;
  role: 'SUSPECT_TARGET' | 'VASP_SETTLEMENT' | 'PEELING_MULE' | 'BRIDGE_RELAY' | 'UNMAPPED_NODE';
  label: string;
  subLabel?: string;
  pulsePhase: number;
}

interface ForensicEdge {
  from: number;
  to: number;
  kind: 'ATTRIBUTION_PATH' | 'LAUNDER_FLOW' | 'CLUSTER_INTERIOR' | 'LATENT_PEER';
}

interface ChainTraceBackgroundProps {
  variant?: 'landing' | 'dashboard' | 'subtle';
}

export default function ChainTraceBackground({ variant = 'landing' }: ChainTraceBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const mousePos = useRef<{ x: number; y: number }>({ x: -2000, y: -2000 });

  useEffect(() => {
    setMounted(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isSaveData = (navigator as any).connection?.saveData === true;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const isDashboard = variant === 'dashboard' || variant === 'subtle';

    // -------------------------------------------------------------
    // STRUCTURED GRAPH TOPOLOGY: Real Investigation DAG Clusters
    // -------------------------------------------------------------
    const nodes: ForensicNode[] = [];
    const edges: ForensicEdge[] = [];

    // Cluster 1: West Flank - Suspect Inception & Peeling Chain
    const c1X = Math.min(width * 0.16, 260);
    const c1Y = height * 0.46;

    // Cluster 2: North East - LayerZero / Cross-Chain Bridge Transit
    const c2X = Math.max(width * 0.82, width - 280);
    const c2Y = height * 0.28;

    // Cluster 3: South East - Verified Institutional VASP Settlement Ring
    const c3X = Math.max(width * 0.78, width - 320);
    const c3Y = height * 0.72;

    // Build Suspect Cluster (West)
    nodes.push({
      id: 0,
      clusterId: 1,
      x: c1X - 60,
      y: c1Y - 40,
      baseX: c1X - 60,
      baseY: c1Y - 40,
      vx: (Math.random() - 0.5) * 0.12,
      vy: (Math.random() - 0.5) * 0.12,
      radius: 5,
      role: 'SUSPECT_TARGET',
      label: 'TARGET // 0x71C6...4397',
      subLabel: 'UNATTRIBUTED WALLET',
      pulsePhase: 0,
    });

    nodes.push({
      id: 1,
      clusterId: 1,
      x: c1X + 40,
      y: c1Y - 80,
      baseX: c1X + 40,
      baseY: c1Y - 80,
      vx: (Math.random() - 0.5) * 0.12,
      vy: (Math.random() - 0.5) * 0.12,
      radius: 3,
      role: 'PEELING_MULE',
      label: 'HOP 1 // RAPID SWEEP',
      subLabel: '24.5 ETH',
      pulsePhase: 1,
    });

    nodes.push({
      id: 2,
      clusterId: 1,
      x: c1X + 60,
      y: c1Y + 30,
      baseX: c1X + 60,
      baseY: c1Y + 30,
      vx: (Math.random() - 0.5) * 0.12,
      vy: (Math.random() - 0.5) * 0.12,
      radius: 3,
      role: 'PEELING_MULE',
      label: 'HOP 2 // CO-SPEND MULE',
      subLabel: 'SPLIT DIVERSIFICATION',
      pulsePhase: 2,
    });

    nodes.push({
      id: 3,
      clusterId: 1,
      x: c1X + 130,
      y: c1Y - 20,
      baseX: c1X + 130,
      baseY: c1Y - 20,
      vx: (Math.random() - 0.5) * 0.12,
      vy: (Math.random() - 0.5) * 0.12,
      radius: 3.5,
      role: 'BRIDGE_RELAY',
      label: 'RELAY // STARGATE LZ',
      subLabel: 'CROSS-CHAIN OUTFLOW',
      pulsePhase: 3,
    });

    // Suspect Edges (Direct Ingestion)
    edges.push({ from: 0, to: 1, kind: 'ATTRIBUTION_PATH' });
    edges.push({ from: 0, to: 2, kind: 'LAUNDER_FLOW' });
    edges.push({ from: 1, to: 3, kind: 'ATTRIBUTION_PATH' });
    edges.push({ from: 2, to: 3, kind: 'LAUNDER_FLOW' });

    // Build VASP Settlement Cluster (East)
    nodes.push({
      id: 4,
      clusterId: 3,
      x: c3X,
      y: c3Y,
      baseX: c3X,
      baseY: c3Y,
      vx: (Math.random() - 0.5) * 0.08,
      vy: (Math.random() - 0.5) * 0.08,
      radius: 6,
      role: 'VASP_SETTLEMENT',
      label: 'VASP CLUSTER // FIU-IND REG',
      subLabel: 'PRIMARY CANDIDATE (88.7%)',
      pulsePhase: 4,
    });

    nodes.push({
      id: 5,
      clusterId: 3,
      x: c3X - 70,
      y: c3Y - 50,
      baseX: c3X - 70,
      baseY: c3Y - 50,
      vx: (Math.random() - 0.5) * 0.1,
      vy: (Math.random() - 0.5) * 0.1,
      radius: 3,
      role: 'PEELING_MULE',
      label: 'INGESTION DESK 04',
      pulsePhase: 5,
    });

    nodes.push({
      id: 6,
      clusterId: 3,
      x: c3X + 70,
      y: c3Y - 30,
      baseX: c3X + 70,
      baseY: c3Y - 30,
      vx: (Math.random() - 0.5) * 0.1,
      vy: (Math.random() - 0.5) * 0.1,
      radius: 3,
      role: 'PEELING_MULE',
      label: 'HOT WALLET SWEEP',
      pulsePhase: 6,
    });

    nodes.push({
      id: 7,
      clusterId: 3,
      x: c3X - 20,
      y: c3Y + 65,
      baseX: c3X - 20,
      baseY: c3Y + 65,
      vx: (Math.random() - 0.5) * 0.1,
      vy: (Math.random() - 0.5) * 0.1,
      radius: 3,
      role: 'PEELING_MULE',
      label: 'OMNIBUS RESERVE',
      pulsePhase: 7,
    });

    // VASP Internal Cluster Edges
    edges.push({ from: 5, to: 4, kind: 'ATTRIBUTION_PATH' });
    edges.push({ from: 6, to: 4, kind: 'CLUSTER_INTERIOR' });
    edges.push({ from: 7, to: 4, kind: 'CLUSTER_INTERIOR' });

    // Long Latent Link connecting the Relay to VASP ingestion
    edges.push({ from: 3, to: 5, kind: 'ATTRIBUTION_PATH' });

    // Build Bridge / Multi-Sig Relayer (North East)
    nodes.push({
      id: 8,
      clusterId: 2,
      x: c2X,
      y: c2Y,
      baseX: c2X,
      baseY: c2Y,
      vx: (Math.random() - 0.5) * 0.08,
      vy: (Math.random() - 0.5) * 0.08,
      radius: 4,
      role: 'BRIDGE_RELAY',
      label: 'BRIDGED LIQUIDITY // WORMHOLE',
      subLabel: 'MINT VERIFIED',
      pulsePhase: 8,
    });

    nodes.push({
      id: 9,
      clusterId: 2,
      x: c2X - 60,
      y: c2Y + 40,
      baseX: c2X - 60,
      baseY: c2Y + 40,
      vx: (Math.random() - 0.5) * 0.1,
      vy: (Math.random() - 0.5) * 0.1,
      radius: 2.5,
      role: 'UNMAPPED_NODE',
      label: '0x19d6...b420',
      pulsePhase: 9,
    });

    edges.push({ from: 8, to: 9, kind: 'LAUNDER_FLOW' });
    edges.push({ from: 9, to: 6, kind: 'LATENT_PEER' });

    // Moving Forensic Flow Particles along Attribution Path
    interface Particle {
      edgeIdx: number;
      progress: number;
      speed: number;
    }
    const particles: Particle[] = [];
    if (!prefersReducedMotion && !isSaveData) {
      edges.forEach((edge, idx) => {
        if (edge.kind === 'ATTRIBUTION_PATH') {
          particles.push({ edgeIdx: idx, progress: Math.random(), speed: 0.0018 + Math.random() * 0.0015 });
          particles.push({ edgeIdx: idx, progress: (Math.random() + 0.5) % 1, speed: 0.0018 + Math.random() * 0.0015 });
        } else if (edge.kind === 'LAUNDER_FLOW') {
          particles.push({ edgeIdx: idx, progress: Math.random(), speed: 0.0012 + Math.random() * 0.001 });
        }
      });
    }

    // Color Palette: Deep Intelligence Theme
    const getColors = () => {
      const isDark = document.documentElement.classList.contains('dark');
      const op = isDashboard ? 0.45 : 0.88;

      if (isDark) {
        return {
          grid: 'rgba(30, 41, 59, ' + (0.35 * op) + ')',
          attributionPath: 'rgba(6, 182, 212, ' + (0.85 * op) + ')',
          launderPath: 'rgba(100, 116, 139, ' + (0.45 * op) + ')',
          clusterInterior: 'rgba(51, 65, 85, ' + (0.4 * op) + ')',
          suspectStroke: 'rgba(239, 68, 68, ' + (0.95 * op) + ')',
          suspectFill: 'rgba(239, 68, 68, ' + (0.85 * op) + ')',
          suspectHalo: 'rgba(239, 68, 68, ' + (0.15 * op) + ')',
          vaspStroke: 'rgba(234, 179, 8, ' + (0.95 * op) + ')',
          vaspFill: 'rgba(234, 179, 8, ' + (0.85 * op) + ')',
          vaspHalo: 'rgba(234, 179, 8, ' + (0.12 * op) + ')',
          relayFill: 'rgba(168, 85, 247, ' + (0.85 * op) + ')',
          muleFill: 'rgba(59, 130, 246, ' + (0.75 * op) + ')',
          particleAttribution: 'rgba(56, 189, 248, ' + (0.95 * op) + ')',
          particleLaunder: 'rgba(148, 163, 184, ' + (0.65 * op) + ')',
          textPrimary: 'rgba(226, 232, 240, ' + (0.75 * op) + ')',
          textMuted: 'rgba(148, 163, 184, ' + (0.5 * op) + ')',
          bracketStroke: 'rgba(71, 85, 105, ' + (0.35 * op) + ')',
        };
      } else {
        return {
          grid: 'rgba(226, 232, 240, ' + (0.55 * op) + ')',
          attributionPath: 'rgba(2, 132, 199, ' + (0.8 * op) + ')',
          launderPath: 'rgba(203, 213, 225, ' + (0.55 * op) + ')',
          clusterInterior: 'rgba(226, 232, 240, ' + (0.5 * op) + ')',
          suspectStroke: 'rgba(220, 38, 38, ' + (0.9 * op) + ')',
          suspectFill: 'rgba(220, 38, 38, ' + (0.85 * op) + ')',
          suspectHalo: 'rgba(220, 38, 38, ' + (0.12 * op) + ')',
          vaspStroke: 'rgba(202, 138, 4, ' + (0.9 * op) + ')',
          vaspFill: 'rgba(202, 138, 4, ' + (0.85 * op) + ')',
          vaspHalo: 'rgba(202, 138, 4, ' + (0.1 * op) + ')',
          relayFill: 'rgba(147, 51, 234, ' + (0.8 * op) + ')',
          muleFill: 'rgba(37, 99, 235, ' + (0.7 * op) + ')',
          particleAttribution: 'rgba(2, 132, 199, ' + (0.9 * op) + ')',
          particleLaunder: 'rgba(100, 116, 139, ' + (0.6 * op) + ')',
          textPrimary: 'rgba(30, 41, 59, ' + (0.75 * op) + ')',
          textMuted: 'rgba(100, 116, 139, ' + (0.5 * op) + ')',
          bracketStroke: 'rgba(203, 213, 225, ' + (0.4 * op) + ')',
        };
      }
    };

    let colors = getColors();
    const handleThemeChange = () => {
      colors = getColors();
    };
    window.addEventListener('chaintrace-theme-change', handleThemeChange);

    // Subtle breathing cycle
    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.015;

      // -------------------------------------------------------------
      // 1. RESTRAINED FORENSIC BRACKETS (Bounding Cluster Annotations)
      // -------------------------------------------------------------
      if (!isDashboard && width > 900) {
        ctx.strokeStyle = colors.bracketStroke;
        ctx.lineWidth = 1;
        ctx.setLineDash([]);

        // Bracket Cluster 1 (Suspect Inception Area)
        const b1X = c1X - 90;
        const b1Y = c1Y - 95;
        const b1W = 250;
        const b1H = 165;
        const arm = 14;

        // Top-left corner
        ctx.beginPath();
        ctx.moveTo(b1X + arm, b1Y);
        ctx.lineTo(b1X, b1Y);
        ctx.lineTo(b1X, b1Y + arm);
        ctx.stroke();

        // Bottom-right corner
        ctx.beginPath();
        ctx.moveTo(b1X + b1W - arm, b1Y + b1H);
        ctx.lineTo(b1X + b1W, b1Y + b1H);
        ctx.lineTo(b1X + b1W, b1Y + b1H - arm);
        ctx.stroke();

        // Label for Cluster 1
        ctx.font = '8px "JetBrains Mono", monospace';
        ctx.fillStyle = colors.textMuted;
        ctx.fillText('SECTOR A-01 // LAUNDER FLOW ORIGIN', b1X + 6, b1Y - 6);

        // Bracket Cluster 3 (VASP Attribution Cluster Area)
        const b3X = c3X - 100;
        const b3Y = c3Y - 80;
        const b3W = 200;
        const b3H = 175;

        // Top-right corner
        ctx.beginPath();
        ctx.moveTo(b3X + b3W - arm, b3Y);
        ctx.lineTo(b3X + b3W, b3Y);
        ctx.lineTo(b3X + b3W, b3Y + arm);
        ctx.stroke();

        // Bottom-left corner
        ctx.beginPath();
        ctx.moveTo(b3X + arm, b3Y + b3H);
        ctx.lineTo(b3X, b3Y + b3H);
        ctx.lineTo(b3X, b3Y + b3H - arm);
        ctx.stroke();

        ctx.fillText('SECTOR E-09 // ATTRIBUTED VASP ENCLAVE', b3X + 6, b3Y - 6);
      }

      // -------------------------------------------------------------
      // 2. EDGES: Directed Attribution Routes & Flow Vectors
      // -------------------------------------------------------------
      edges.forEach((edge) => {
        const n1 = nodes[edge.from];
        const n2 = nodes[edge.to];
        if (!n1 || !n2) return;

        ctx.beginPath();
        ctx.moveTo(n1.x, n1.y);

        if (edge.kind === 'ATTRIBUTION_PATH') {
          // Highlighted Attribution Vector (High Forensic Importance)
          ctx.strokeStyle = colors.attributionPath;
          ctx.lineWidth = 1.8;
          ctx.setLineDash([5, 4]);
          ctx.lineTo(n2.x, n2.y);
          ctx.stroke();
          ctx.setLineDash([]);
        } else if (edge.kind === 'LAUNDER_FLOW') {
          // Secondary Divergent Trail
          ctx.strokeStyle = colors.launderPath;
          ctx.lineWidth = 1;
          ctx.setLineDash([2, 3]);
          ctx.lineTo(n2.x, n2.y);
          ctx.stroke();
          ctx.setLineDash([]);
        } else {
          // Subtle Cluster Interior or Latent Link
          ctx.strokeStyle = colors.clusterInterior;
          ctx.lineWidth = 0.8;
          ctx.setLineDash([]);
          ctx.lineTo(n2.x, n2.y);
          ctx.stroke();
        }
      });

      // -------------------------------------------------------------
      // 3. PARTICLES: Moving Forensic Packet Pulses
      // -------------------------------------------------------------
      if (!prefersReducedMotion && !isSaveData) {
        particles.forEach((p) => {
          p.progress += p.speed;
          if (p.progress > 1) p.progress = 0;

          const edge = edges[p.edgeIdx];
          if (!edge) return;
          const n1 = nodes[edge.from];
          const n2 = nodes[edge.to];
          if (!n1 || !n2) return;

          const px = n1.x + (n2.x - n1.x) * p.progress;
          const py = n1.y + (n2.y - n1.y) * p.progress;

          ctx.fillStyle = edge.kind === 'ATTRIBUTION_PATH' ? colors.particleAttribution : colors.particleLaunder;
          ctx.beginPath();
          ctx.arc(px, py, edge.kind === 'ATTRIBUTION_PATH' ? 2.5 : 1.5, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // -------------------------------------------------------------
      // 4. NODES: Categorized Intelligence Entities
      // -------------------------------------------------------------
      nodes.forEach((n) => {
        // Micro organic breathing drift around anchor coordinate
        if (!prefersReducedMotion && !isSaveData) {
          n.x = n.baseX + Math.sin(time + n.id) * 3;
          n.y = n.baseY + Math.cos(time * 0.8 + n.id) * 3;

          // Gentle mouse proximity response
          const dx = n.x - mousePos.current.x;
          const dy = n.y - mousePos.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120 && dist > 0) {
            n.x += (dx / dist) * 0.8;
            n.y += (dy / dist) * 0.8;
          }
        }

        const pulse = Math.sin(time * 2 + n.pulsePhase);

        if (n.role === 'SUSPECT_TARGET') {
          // Suspect Target: Double Surveillance Reticle
          ctx.strokeStyle = colors.suspectStroke;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.radius + 5 + pulse, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = colors.suspectHalo;
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.radius * 2.8, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = colors.suspectFill;
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
          ctx.fill();
        } else if (n.role === 'VASP_SETTLEMENT') {
          // VASP Settlement Cluster: Concentric Golden Sovereign Halo
          ctx.fillStyle = colors.vaspHalo;
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.radius * 3 + pulse * 1.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = colors.vaspStroke;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.radius + 3, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = colors.vaspFill;
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
          ctx.fill();
        } else if (n.role === 'BRIDGE_RELAY') {
          // Bridge Relay: Diamond Shape
          ctx.fillStyle = colors.relayFill;
          ctx.beginPath();
          ctx.moveTo(n.x, n.y - n.radius - 1);
          ctx.lineTo(n.x + n.radius + 1, n.y);
          ctx.lineTo(n.x, n.y + n.radius + 1);
          ctx.lineTo(n.x - n.radius - 1, n.y);
          ctx.closePath();
          ctx.fill();
        } else {
          // Peeling Mule / Peer Node: Clean Technical Node
          ctx.fillStyle = colors.muleFill;
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
          ctx.fill();
        }

        // Labels: Clean, Professional, High Legibility
        if (n.label && !isDashboard && width > 768) {
          ctx.font = '9px "JetBrains Mono", monospace';
          ctx.fillStyle = colors.textPrimary;
          ctx.fillText(n.label, n.x + n.radius + 8, n.y + 3);

          if (n.subLabel) {
            ctx.font = '8px "JetBrains Mono", monospace';
            ctx.fillStyle = colors.textMuted;
            ctx.fillText(n.subLabel, n.x + n.radius + 8, n.y + 14);
          }
        }
      });
    };

    gsap.ticker.add(render);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      gsap.ticker.remove(render);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('chaintrace-theme-change', handleThemeChange);
    };
  }, [variant]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
    >
      {/* Precision Horizon Grid Vignette */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border-subtle)_1px,transparent_1px),linear-gradient(to_bottom,var(--border-subtle)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_75%_55%_at_50%_15%,#000_60%,transparent_100%)] opacity-35"></div>

      <canvas
        ref={canvasRef}
        className="w-full h-full block transition-opacity duration-700 opacity-100"
      />
    </div>
  );
}
