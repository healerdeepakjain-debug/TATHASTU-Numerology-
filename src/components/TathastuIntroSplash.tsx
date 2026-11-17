import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, SkipForward } from 'lucide-react';
import {
  TATHASTU_BRAND_NAME,
  TATHASTU_LOGO_PATH,
  TATHASTU_TAGLINE,
} from '../utils/tathastuStore';
import { useResponsiveViewport } from '../utils/useResponsiveViewport';

interface TathastuIntroSplashProps {
  onComplete: () => void;
  durationMs?: number;
}

interface CosmicParticle {
  angle: number;
  radius: number;
  speed: number;
  size: number;
  alpha: number;
  hue: 'gold' | 'emerald' | 'cyan' | 'white';
  drift: number;
}

interface OrbitingGraha {
  orbitRadiusFactor: number;
  angle: number;
  speed: number;
  size: number;
  color: string;
}

export const TathastuIntroSplash: React.FC<TathastuIntroSplashProps> = ({
  onComplete,
  durationMs = 3800,
}) => {
  const { isMobile } = useResponsiveViewport();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const [isFadingOut, setIsFadingOut] = useState(false);
  const [progress, setProgress] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const completedRef = useRef(false);

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const effectiveDuration = prefersReducedMotion ? 1300 : durationMs;

  const stopAmbientSound = () => {
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
  };

  const finishIntro = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    setIsFadingOut(true);
    stopAmbientSound();
    window.setTimeout(() => {
      onComplete();
    }, 460);
  };

  const handleToggleSacredSound = () => {
    if (soundEnabled) {
      stopAmbientSound();
      setSoundEnabled(false);
      return;
    }

    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
      masterGain.gain.exponentialRampToValueAtTime(0.11, ctx.currentTime + 0.5);
      masterGain.connect(ctx.destination);

      // Sacred 136.1 Hz Om Earth-Year frequency + 432 Hz celestial harmonic shimmer
      const freqs = [136.1, 272.2, 432];
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = idx === 2 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(f, ctx.currentTime);
        oscGain.gain.setValueAtTime(idx === 0 ? 0.55 : idx === 1 ? 0.25 : 0.14, ctx.currentTime);
        osc.connect(oscGain);
        oscGain.connect(masterGain);
        osc.start();
      });

      setSoundEnabled(true);
    } catch {
      setSoundEnabled(false);
    }
  };

  useEffect(() => {
    const startTime = performance.now();
    const progressTimer = window.setInterval(() => {
      const elapsed = performance.now() - startTime;
      const pct = Math.min(100, (elapsed / effectiveDuration) * 100);
      setProgress(pct);
      if (elapsed >= effectiveDuration) {
        window.clearInterval(progressTimer);
        finishIntro();
      }
    }, 32);

    return () => {
      window.clearInterval(progressTimer);
      stopAmbientSound();
    };
  }, [effectiveDuration]);

  // 60FPS Real-Time Animated Spiritual Mandala, Cosmic Rays, Navagraha Orbits & Golden Aura Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrame = 0;
    let width = window.innerWidth;
    let height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const particleCount = isMobile ? 54 : 88;
    const particles: CosmicParticle[] = Array.from({ length: particleCount }, (_, i) => ({
      angle: (Math.PI * 2 * i) / particleCount + Math.random() * 0.4,
      radius: 20 + Math.random() * Math.max(width, height) * 0.52,
      speed: 0.25 + Math.random() * 0.55,
      size: 1.1 + Math.random() * 2.6,
      alpha: 0.35 + Math.random() * 0.6,
      hue: i % 5 === 0 ? 'emerald' : i % 7 === 0 ? 'cyan' : i % 3 === 0 ? 'white' : 'gold',
      drift: (Math.random() - 0.5) * 0.008,
    }));

    const grahas: OrbitingGraha[] = [
      { orbitRadiusFactor: 0.26, angle: 0.2, speed: 0.015, size: 4.5, color: '#fbbf24' },
      { orbitRadiusFactor: 0.31, angle: 1.4, speed: -0.012, size: 3.8, color: '#e2e8f0' },
      { orbitRadiusFactor: 0.36, angle: 2.3, speed: 0.01, size: 4.2, color: '#f59e0b' },
      { orbitRadiusFactor: 0.41, angle: 3.1, speed: 0.008, size: 3.6, color: '#34d399' },
      { orbitRadiusFactor: 0.46, angle: 4.2, speed: -0.007, size: 4.0, color: '#f472b6' },
      { orbitRadiusFactor: 0.51, angle: 5.0, speed: 0.006, size: 4.2, color: '#60a5fa' },
      { orbitRadiusFactor: 0.56, angle: 0.9, speed: -0.005, size: 3.6, color: '#fb7185' },
      { orbitRadiusFactor: 0.62, angle: 3.9, speed: 0.0045, size: 3.9, color: '#c084fc' },
      { orbitRadiusFactor: 0.68, angle: 2.0, speed: -0.004, size: 3.5, color: '#fcd34d' },
    ];

    const startTime = performance.now();

    const drawFrame = (now: number) => {
      const t = (now - startTime) * 0.001;
      const cx = width / 2;
      const cy = isMobile ? height * 0.41 : height * 0.42;
      const baseRadius = Math.min(width, height) * (isMobile ? 0.36 : 0.32);

      // Deep Cosmic Backdrop
      const bgGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, Math.max(width, height) * 0.85);
      bgGrad.addColorStop(0, '#1e1038');
      bgGrad.addColorStop(0.45, '#0b081d');
      bgGrad.addColorStop(1, '#020617');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Volumetric Rotating Spiritual Aura Light Beams radiating from center logo
      if (!prefersReducedMotion) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(t * 0.14);
        const rayCount = 12;
        for (let r = 0; r < rayCount; r++) {
          ctx.rotate((Math.PI * 2) / rayCount);
          const rayGrad = ctx.createLinearGradient(0, 0, baseRadius * 2.1, 0);
          rayGrad.addColorStop(0, 'rgba(251, 191, 36, 0.22)');
          rayGrad.addColorStop(0.45, 'rgba(245, 158, 11, 0.07)');
          rayGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
          ctx.fillStyle = rayGrad;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(baseRadius * 2.1, -baseRadius * 0.22);
          ctx.lineTo(baseRadius * 2.1, baseRadius * 0.22);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }

      // Sacred 12-Petal Lotus Mandala & Concentric Sri Yantra Rings
      const drawLotusRing = (
        radius: number,
        petals: number,
        rot: number,
        strokeColor: string,
        lineWidth: number
      ) => {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rot);
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = lineWidth;

        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.stroke();

        for (let p = 0; p < petals; p++) {
          const a = (Math.PI * 2 * p) / petals;
          const x1 = Math.cos(a) * (radius * 0.72);
          const y1 = Math.sin(a) * (radius * 0.72);
          const x2 = Math.cos(a) * (radius * 1.05);
          const y2 = Math.sin(a) * (radius * 1.05);
          const cx1 = Math.cos(a - 0.14) * (radius * 0.94);
          const cy1 = Math.sin(a - 0.14) * (radius * 0.94);
          const cx2 = Math.cos(a + 0.14) * (radius * 0.94);
          const cy2 = Math.sin(a + 0.14) * (radius * 0.94);

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.quadraticCurveTo(cx1, cy1, x2, y2);
          ctx.quadraticCurveTo(cx2, cy2, x1, y1);
          ctx.stroke();
        }
        ctx.restore();
      };

      const pulse = 1 + Math.sin(t * 2.2) * 0.035;
      drawLotusRing(baseRadius * 0.95 * pulse, 12, t * 0.18, 'rgba(251, 191, 36, 0.38)', 1.25);
      drawLotusRing(baseRadius * 1.28, 16, -t * 0.12, 'rgba(245, 158, 11, 0.24)', 1.0);
      drawLotusRing(baseRadius * 1.62, 24, t * 0.07, 'rgba(16, 185, 129, 0.16)', 0.9);

      // Interlocking Sacred Triangles (Yantra Core)
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-t * 0.22);
      ctx.strokeStyle = 'rgba(253, 224, 71, 0.3)';
      ctx.lineWidth = 1.1;
      for (let tri = 0; tri < 2; tri++) {
        ctx.rotate(Math.PI / 3);
        const trR = baseRadius * 0.88;
        ctx.beginPath();
        for (let k = 0; k < 3; k++) {
          const ang = (Math.PI * 2 * k) / 3;
          const px = Math.cos(ang) * trR;
          const py = Math.sin(ang) * trR;
          if (k === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
      }
      ctx.restore();

      // 9 Orbiting Navagraha Planets with Glow
      if (!prefersReducedMotion) {
        grahas.forEach((g) => {
          g.angle += g.speed;
          const r = baseRadius * (1.1 + g.orbitRadiusFactor * 1.35);
          const gx = cx + Math.cos(g.angle) * r;
          const gy = cy + Math.sin(g.angle) * r * 0.92;

          ctx.beginPath();
          ctx.strokeStyle = 'rgba(251, 191, 36, 0.07)';
          ctx.lineWidth = 0.7;
          ctx.ellipse(cx, cy, r, r * 0.92, 0, 0, Math.PI * 2);
          ctx.stroke();

          ctx.save();
          ctx.shadowColor = g.color;
          ctx.shadowBlur = 12;
          ctx.fillStyle = g.color;
          ctx.beginPath();
          ctx.arc(gx, gy, g.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
      }

      // Luminous Ascending Pranic Particles
      particles.forEach((p) => {
        if (!prefersReducedMotion) {
          p.radius += p.speed;
          p.angle += p.drift;
          if (p.radius > Math.max(width, height) * 0.65) {
            p.radius = 22;
          }
        }
        const px = cx + Math.cos(p.angle) * p.radius;
        const py = cy + Math.sin(p.angle) * p.radius;
        const fill =
          p.hue === 'emerald'
            ? `rgba(52, 211, 153, ${p.alpha})`
            : p.hue === 'cyan'
            ? `rgba(56, 189, 248, ${p.alpha})`
            : p.hue === 'white'
            ? `rgba(255, 251, 235, ${p.alpha})`
            : `rgba(251, 191, 36, ${p.alpha})`;
        ctx.fillStyle = fill;
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Central Golden Aura Halo behind Brand Logo
      const haloGrad = ctx.createRadialGradient(cx, cy, 12, cx, cy, baseRadius * 0.85);
      haloGrad.addColorStop(0, 'rgba(254, 243, 199, 0.45)');
      haloGrad.addColorStop(0.35, 'rgba(245, 158, 11, 0.25)');
      haloGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, baseRadius * 0.85, 0, Math.PI * 2);
      ctx.fill();

      animFrame = window.requestAnimationFrame(drawFrame);
    };

    animFrame = window.requestAnimationFrame(drawFrame);

    return () => {
      window.cancelAnimationFrame(animFrame);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [isMobile, prefersReducedMotion]);

  return (
    <div
      role="dialog"
      aria-label="Tathastu Divine Light Spiritual Welcome Animation"
      className={`fixed inset-0 z-[999998] flex flex-col items-center justify-between overflow-hidden bg-slate-950 transition-opacity duration-500 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* 60fps Animated Spiritual Video Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      {/* Top Controls Bar: Sacred Sound Toggle + Skip Intro */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 pt-4 sm:pt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={handleToggleSacredSound}
          className="min-h-[42px] px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-amber-500/40 text-amber-200 text-xs font-bold flex items-center gap-2 backdrop-blur-md cursor-pointer transition-all"
        >
          {soundEnabled ? (
            <>
              <Volume2 className="w-4 h-4 text-emerald-400" />
              <span>Om Resonance ON</span>
            </>
          ) : (
            <>
              <VolumeX className="w-4 h-4 text-amber-400" />
              <span>Tap for Sacred Om Sound</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={finishIntro}
          className="min-h-[42px] px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/35 border border-amber-400/60 text-amber-100 text-xs font-extrabold flex items-center gap-1.5 backdrop-blur-md cursor-pointer transition-all"
        >
          <span>Skip Intro</span>
          <SkipForward className="w-4 h-4 text-amber-300" />
        </button>
      </div>

      {/* Center Stage: Brand Logo Reveal + Sacred Spiritual Typography */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 my-auto">
        <div className="relative flex items-center justify-center mb-5 sm:mb-6 tathastu-intro-logo-wrap">
          {/* Outer Rotating Halo Ring */}
          <div className="absolute w-40 h-40 sm:w-52 sm:h-52 rounded-full border-2 border-dashed border-amber-400/65 tathastu-intro-ring-spin" />
          <div className="absolute w-34 h-34 sm:w-44 sm:h-44 rounded-full border border-emerald-400/50 tathastu-intro-ring-reverse" />

          {/* Circular Brand Logo Medallion */}
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full p-1 bg-gradient-to-br from-amber-200 via-amber-500 to-amber-700 shadow-[0_0_55px_rgba(245,158,11,0.75)] tathastu-intro-breathe">
            <img
              src={TATHASTU_LOGO_PATH}
              alt={TATHASTU_BRAND_NAME}
              className="w-full h-full rounded-full object-cover border-2 border-slate-950"
            />
          </div>
        </div>

        <div className="text-amber-300 font-serif text-lg sm:text-xl font-bold tracking-[0.25em] mb-1.5 tathastu-intro-fade-up">
          ॐ श्री गणेशाय नमः
        </div>

        <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl font-black tracking-wider bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-500 bg-clip-text text-transparent drop-shadow-[0_4px_24px_rgba(245,158,11,0.45)] tathastu-intro-fade-up">
          {TATHASTU_BRAND_NAME}
        </h1>

        <p className="mt-2 text-xs sm:text-base font-serif italic text-emerald-300 tracking-widest tathastu-intro-fade-up">
          {TATHASTU_TAGLINE}
        </p>

        <p className="mt-3 text-[11px] sm:text-xs text-amber-200/80 max-w-md leading-relaxed tathastu-intro-fade-up">
          Vedic &amp; Chaldean Numerology • 7-Chakra Aura Alignment • Live Shubh Muhurat
        </p>
      </div>

      {/* Bottom Progress Bar */}
      <div className="relative z-10 w-full max-w-md mx-auto px-6 pb-8 sm:pb-10 space-y-2 text-center">
        <div className="w-full h-1.5 rounded-full bg-slate-900/90 border border-amber-500/30 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 via-yellow-300 to-emerald-400 transition-all duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-300/80">
          {isMobile ? 'Optimizing Mobile Spiritual Experience...' : 'Awakening Sacred Cosmic Blueprint...'}
        </div>
      </div>
    </div>
  );
};
