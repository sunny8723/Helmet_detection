"use client";

import React, { useRef, useEffect, useState } from 'react';

import { useTheme } from "./ThemeProvider";

export const VisualEffects = () => {
  const { theme } = useTheme();
  
  return (
    <div className={`fixed inset-0 pointer-events-none z-0 overflow-hidden transition-opacity duration-1000 ${theme === 'light' ? 'opacity-30' : 'opacity-100'}`}>
      <DottedGrid />
      <PerspectiveGrid />
      <ParticleMesh />
    </div>
  );
};

const DottedGrid = () => {
  const { theme } = useTheme();
  return (
    <div 
      className="absolute inset-0 z-0 opacity-[0.05] transition-colors duration-300"
      style={{
        backgroundImage: `radial-gradient(circle, ${theme === 'dark' ? '#4a5d71' : '#000000'} 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
      }}
    />
  );
};

const PerspectiveGrid = () => {
  const { theme } = useTheme();
  return (
    <div 
      className="absolute bottom-0 left-[-50%] w-[200%] h-[100%] origin-bottom"
      style={{
        perspective: '1000px',
        transform: 'rotateX(60deg)',
      }}
    >
      <div 
        className="absolute inset-0 animate-[grid-scroll_25s_linear_infinite]"
        style={{
          backgroundImage: `
            linear-gradient(to right, ${theme === 'dark' ? 'rgba(207, 179, 110, 0.05)' : 'rgba(0, 0, 0, 0.05)'} 1px, transparent 1px),
            linear-gradient(to bottom, ${theme === 'dark' ? 'rgba(207, 179, 110, 0.05)' : 'rgba(0, 0, 0, 0.05)'} 1px, transparent 1px)
          `,
          backgroundSize: '120px 120px',
          maskImage: 'linear-gradient(to bottom, transparent, black 40%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 40%)',
        }}
      />
      
      {/* Pulse Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-t ${theme === 'dark' ? 'from-[#cfb36e]/5' : 'from-transparent'} to-transparent animate-pulse opacity-20`} />
      
      <style jsx>{`
        @keyframes grid-scroll {
          from { background-position: 0 0; }
          to { background-position: 0 1000px; }
        }
      `}</style>
    </div>
  );
};

const ParticleMesh = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    const particleCount = 50;
    const connectionDistance = 180;
    const mouseRadius = 250;

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      baseX: number;
      baseY: number;

      constructor(w: number, h: number) {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
        this.size = Math.random() * 1.5;
        this.baseX = this.x;
        this.baseY = this.y;
      }

      update(w: number, h: number, mouse: { x: number; y: number }) {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > w) this.vx *= -1;
        if (this.y < 0 || this.y > h) this.vy *= -1;

        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < mouseRadius) {
          const force = (mouseRadius - dist) / mouseRadius;
          const angle = Math.atan2(dy, dx);
          this.x -= Math.cos(angle) * force * 1.5;
          this.y -= Math.sin(angle) * force * 1.5;
        }
      }

      draw(context: CanvasRenderingContext2D) {
        context.beginPath();
        context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        context.fillStyle = theme === 'dark' ? 'rgba(207, 179, 110, 0.15)' : 'rgba(0, 0, 0, 0.15)';
        context.fill();
      }
    }

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(canvas.width, canvas.height));
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        p1.update(canvas.width, canvas.height, mouseRef.current);
        p1.draw(ctx);

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            ctx.beginPath();
            ctx.strokeStyle = theme === 'dark' 
              ? `rgba(207, 179, 110, ${0.08 * (1 - dist / connectionDistance)})`
              : `rgba(0, 0, 0, ${0.08 * (1 - dist / connectionDistance)})`;
            ctx.lineWidth = 0.4;
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleResize = () => {
      init();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);
    init();
    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  const blendMode = theme === 'dark' ? 'mix-blend-screen' : 'mix-blend-multiply';

  return (
    <canvas 
      ref={canvasRef} 
      className={`absolute inset-0 opacity-40 ${blendMode}`}
    />
  );
};
