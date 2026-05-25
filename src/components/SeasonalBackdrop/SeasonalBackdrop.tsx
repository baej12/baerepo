import React, { useMemo } from 'react';
import './SeasonalBackdrop.css';

type Season = 'winter' | 'spring' | 'summer' | 'fall';

type PixelParticle = {
  id: number;
  startX: number;
  drift: number;
  duration: number;
  delay: number;
  scale: number;
  rot: number;
  primary?: string;
  secondary?: string;
  angle?: number;
  radius?: number;
  shape?: 'sun';
};

type HolidaySprite = {
  id: number;
  type: 'tree' | 'sleigh' | 'egg' | 'bunny' | 'beachball' | 'surfboard' | 'pumpkin' | 'ghost';
  startX: number;
  startY: number;
  duration: number;
  delay: number;
  scale: number;
};

const detectSeason = (now = new Date()): Season => {
  // Dev override: ?season=spring|summer|fall|winter or window.__SEASON_OVERRIDE to preview.
  let override: string | null = null;
  try {
    const params = new URLSearchParams(window.location.search);
    override = params.get('season') || (window as any).__SEASON_OVERRIDE || null;
  } catch (_) {
    override = null;
  }

  if (override && ['winter', 'spring', 'summer', 'fall'].includes(override)) {
    return override as Season;
  }

  const month = now.getMonth(); // 0-indexed
  if (month === 11 || month <= 1) return 'winter';
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  return 'fall';
};

const rotationForSeason = (season: Season) => {
  switch (season) {
    case 'spring':
      return (Math.random() * 16 - 8); // slight sway
    case 'summer':
      return Math.random() * 360; // full rotations for suns
    case 'fall':
      return (Math.random() * 40 - 20); // more tilt for leaves
    default:
      return 0;
  }
};

const paletteForSeason = (season: Season) => {
  switch (season) {
    case 'spring':
      return [
        { primary: '#f2a7c6', secondary: '#7dd3a8' },
        { primary: '#d9b8ff', secondary: '#8bd7b5' },
        { primary: '#f4b7a7', secondary: '#9ee6be' },
        { primary: '#f0c6dd', secondary: '#a7e5c1' },
      ];
    case 'summer':
      return [
        { primary: '#ffe9a8', secondary: '#fcd34d' },
        { primary: '#ffe8b6', secondary: '#fbbf24' },
        { primary: '#fff1c2', secondary: '#fcdba1' },
        { primary: '#ffefc7', secondary: '#ffd166' },
      ];
    case 'fall':
      return [
        { primary: '#f4b79a', secondary: '#e99a6f' },
        { primary: '#f0a56c', secondary: '#d97a4f' },
        { primary: '#f5c7a1', secondary: '#e38b60' },
        { primary: '#e9a38a', secondary: '#d77f5c' },
        { primary: '#d88c73', secondary: '#c76a4d' },
      ];
    default:
      return [
        { primary: '#dbeafe', secondary: '#bfdbfe' },
        { primary: '#e7f5ef', secondary: '#d7ece0' }, // muted holiday mint
        { primary: '#f4d7d7', secondary: '#d7b7b7' }, // muted holiday berry
      ];
  }
};

const buildParticles = (count: number, season: Season): PixelParticle[] =>
  Array.from({ length: count }, (_, id) => {
    // Bias positions toward the edges so particles sit near the sides.
    const side = Math.random() < 0.5 ? Math.random() * 22 : 78 + Math.random() * 22;
    const drift = (Math.random() * 16 - 8); // gentle horizontal sway
    const palette = paletteForSeason(season);
    const color = palette[Math.floor(Math.random() * palette.length)] ?? palette[0];

    const isSummer = season === 'summer';
    const angle = isSummer ? Math.random() * 360 : undefined;
    const radius = isSummer ? 30 + Math.random() * 18 : undefined;
    const duration = isSummer ? 9 + Math.random() * 5 : 12 + Math.random() * 10;
    const shape: PixelParticle['shape'] = isSummer ? 'sun' : undefined;

    return {
      id,
      startX: side,
      drift,
      duration,
      delay: Math.random() * 10,
      scale: 0.7 + Math.random() * 0.6,
      rot: rotationForSeason(season),
      primary: color.primary,
      secondary: color.secondary,
      angle,
      radius,
      shape,
    };
  });

const buildHolidaySprites = (season: Season): HolidaySprite[] => {
  const spritesMap = {
    winter: ['sleigh'] as const,
    spring: [] as const,
    summer: [] as const,
    fall: [] as const,
  };
  const sprites = [...spritesMap[season]];

  return sprites.map((type, idx) => ({
    id: idx,
    type,
    startX: idx === 0 ? 8 + Math.random() * 8 : 84 + Math.random() * 8,
    startY: type === 'sleigh' ? 8 : 15 + Math.random() * 70,
    duration: 18 + Math.random() * 12,
    delay: Math.random() * 8,
    scale: 0.8 + Math.random() * 0.4,
  }));
};

export const SeasonalBackdrop: React.FC = () => {
  const season = detectSeason();
  const particles = useMemo(() => {
    const isCompactViewport = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;
    return buildParticles(isCompactViewport ? 24 : 42, season);
  }, [season]);
  const holidaySprites = useMemo(() => buildHolidaySprites(season), [season]);

  return (
    <div className={`seasonal-backdrop seasonal-backdrop--${season}`} aria-hidden="true">
      <div className="seasonal-backdrop__layer">
        {particles.map((p) => (
          <div
            key={p.id}
            className={`pixel-particle pixel-particle--${season}${p.shape ? ` pixel-particle--${season}-${p.shape}` : ''}`}
            style={{
              '--start-x': `${p.startX}vw`,
              '--drift': `${p.drift}vw`,
              '--scale': p.scale,
              '--rot': `${p.rot}deg`,
              '--angle': `${p.angle ?? 0}deg`,
              '--radius': `${p.radius ?? 0}vh`,
              '--particle-primary': p.primary,
              '--particle-secondary': p.secondary,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
            } as React.CSSProperties}
          />
        ))}
      </div>
      <div className="seasonal-backdrop__sprites">
        {holidaySprites.map((s) => (
          <div
            key={s.id}
            className={`holiday-sprite holiday-sprite--${s.type}`}
            style={{
              left: `${s.startX}vw`,
              top: `${s.startY}vh`,
              '--sprite-scale': s.scale,
              animationDuration: `${s.duration}s`,
              animationDelay: `${s.delay}s`,
            } as React.CSSProperties}
          />
        ))}
      </div>
    </div>
  );
};
