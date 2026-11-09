import React, { useEffect, useRef, useState } from 'react';
import { usePortal } from '../../context/PortalContext';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  color: string;
  alpha: number;
  pulseSpeed: number;
  pulsePhase: number;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface ParticlesBackgroundProps {
  interactive?: boolean;
  density?: 'low' | 'normal' | 'high';
  className?: string;
}

export const ParticlesBackground: React.FC<ParticlesBackgroundProps> = ({
  interactive = true,
  density = 'normal',
  className = '',
}) => {
  const { isDarkMode } = usePortal();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number | null; y: number | null; radius: number }>({
    x: null,
    y: null,
    radius: 140,
  });

  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Color palette adhering to Civil Engineering Blueprint theme
    const isDark = isDarkMode;
    const colors = isDark
      ? [
          'rgba(56, 189, 248, ',  // Bright Cyan / Steel
          'rgba(40, 120, 168, ',  // Steel Blue
          'rgba(255, 212, 59, ',  // Construction Safety Gold
          'rgba(186, 214, 235, ', // Blueprint Frost
        ]
      : [
          'rgba(22, 75, 120, ',   // Blueprint Blue
          'rgba(40, 120, 168, ',  // Steel Blue
          'rgba(229, 189, 46, ',  // Safety Gold
          'rgba(70, 77, 82, ',    // Structural Charcoal
        ];

    // Determine particle count based on screen width and density setting
    const baseCount = width < 768 ? 32 : width < 1200 ? 55 : 85;
    const countMultiplier = density === 'low' ? 0.6 : density === 'high' ? 1.4 : 1.0;
    const particleCount = Math.floor(baseCount * countMultiplier);

    const particles: Particle[] = [];
    const sparks: Spark[] = [];

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      const colorPrefix = colors[Math.floor(Math.random() * colors.length)];
      const baseRadius = Math.random() * 1.8 + 1.2;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        radius: baseRadius,
        baseRadius,
        color: colorPrefix,
        alpha: Math.random() * 0.45 + 0.25,
        pulseSpeed: Math.random() * 0.03 + 0.015,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }

    // Resize listener
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Mouse interactive tracker
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      setIsHovering(true);
    };

    const handleMouseLeave = () => {
      mouseRef.current.x = null;
      mouseRef.current.y = null;
      setIsHovering(false);
    };

    // Click burst effect for delightful student interactivity
    const handleClick = (e: MouseEvent) => {
      const clickX = e.clientX;
      const clickY = e.clientY;
      const sparkColors = ['#FFD43B', '#38BDF8', '#87B7DD', '#FFFFFF'];

      for (let i = 0; i < 12; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 1.5;
        sparks.push({
          x: clickX,
          y: clickY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0,
          maxLife: Math.floor(Math.random() * 25 + 20),
          color: sparkColors[Math.floor(Math.random() * sparkColors.length)],
          size: Math.random() * 2.5 + 1.5,
        });
      }
    };

    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseleave', handleMouseLeave);
      window.addEventListener('click', handleClick);
    }

    // Visibility change optimization
    let isTabVisible = true;
    const handleVisibilityChange = () => {
      isTabVisible = document.visibilityState === 'visible';
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Render loop
    const maxLinkDistance = width < 768 ? 95 : 130;
    const mouseLinkDistance = 160;

    const render = () => {
      if (!isTabVisible) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // 1. Update and draw sparks
      for (let s = sparks.length - 1; s >= 0; s--) {
        const spark = sparks[s];
        spark.x += spark.vx;
        spark.y += spark.vy;
        spark.vx *= 0.95;
        spark.vy *= 0.95;
        spark.life++;

        const progress = spark.life / spark.maxLife;
        const currentAlpha = 1 - progress;

        ctx.beginPath();
        ctx.arc(spark.x, spark.y, spark.size * (1 - progress * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = spark.color;
        ctx.globalAlpha = currentAlpha;
        ctx.shadowColor = spark.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;

        if (spark.life >= spark.maxLife) {
          sparks.splice(s, 1);
        }
      }

      // 2. Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Move particle
        p.x += p.vx;
        p.y += p.vy;

        // Bounce at boundaries with slight margin
        if (p.x < 0 || p.x > width) p.vx = -p.vx;
        if (p.y < 0 || p.y > height) p.vy = -p.vy;

        // Subtle pulsing size effect
        p.pulsePhase += p.pulseSpeed;
        p.radius = p.baseRadius + Math.sin(p.pulsePhase) * 0.5;

        // Interactive mouse repulsion/attraction
        if (mouseRef.current.x !== null && mouseRef.current.y !== null) {
          const dx = mouseRef.current.x - p.x;
          const dy = mouseRef.current.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouseLinkDistance) {
            // Draw CAD link between mouse and node
            const linkAlpha = (1 - dist / mouseLinkDistance) * 0.35;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouseRef.current.x, mouseRef.current.y);
            ctx.strokeStyle = isDark ? `rgba(56, 189, 248, ${linkAlpha})` : `rgba(22, 75, 120, ${linkAlpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();

            // Gentle gravity pull towards cursor
            p.x += (dx / dist) * 0.3;
            p.y += (dy / dist) * 0.3;
          }
        }

        // Draw particle node
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.5, p.radius), 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.fill();

        // 3. Connect close particles with CAD structural truss links
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxLinkDistance) {
            const lineAlpha = (1 - dist / maxLinkDistance) * 0.16;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `${p.color}${lineAlpha})`;
            ctx.lineWidth = 0.85;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (interactive) {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseleave', handleMouseLeave);
        window.removeEventListener('click', handleClick);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [interactive, density, isDarkMode]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 transition-opacity duration-700 ${className}`}
      style={{ opacity: 0.88 }}
      aria-hidden="true"
    />
  );
};

