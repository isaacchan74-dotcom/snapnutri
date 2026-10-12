import { useEffect, useRef } from 'react';

import { dioramaFx, duration, layout } from '../theme/tokens';
import type { BackgroundOption } from '../types/character';

type DioramaParticlesProps = {
  scene: BackgroundOption;
};

type Layer = 'back' | 'front';

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  w: number;
  h: number;
  color: string;
  layer: Layer;
  wobble: number;
  phase: number;
  alpha: number;
  trail: number;
};

export function DioramaParticles({ scene }: DioramaParticlesProps) {
  const backRef = useRef<HTMLCanvasElement>(null);
  const frontRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const back = backRef.current;
    const front = frontRef.current;
    if (!back || !front) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const particles: Particle[] = [];
    let skyStars: { x: number; y: number }[] = [];
    let width = 1;
    let height = 1;
    let raf = 0;
    let nextBurst = performance.now() + duration.normal;
    let last = performance.now();
    let windDir = Math.random() < 0.5 ? 1 : -1;

    const resize = () => {
      const parent = back.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width / layout.particleScale));
      height = Math.max(1, Math.round(rect.height / layout.particleScale));
      for (const canvas of [back, front]) {
        canvas.width = width;
        canvas.height = height;
      }
      if (scene === 'bluebell') {
        const img = parent.querySelector<HTMLImageElement>('.diorama__backdrop');
        if (img?.complete && img.naturalWidth > 0) {
          skyStars = findSkyStars(img, width, height);
        }
      }
    };

    const spawnBurst = () => {
      if (scene === 'meadow') windDir = Math.random() < 0.5 ? 1 : -1;
      if (scene === 'bluebell') {
        const count = 3 + Math.floor(Math.random() * 3);
        const pool = [...skyStars];
        for (let i = 0; i < count; i += 1) {
          const pick =
            pool.length > 0
              ? pool.splice(Math.floor(Math.random() * pool.length), 1)[0]
              : {
                  x: Math.floor(width * (0.06 + Math.random() * 0.88)),
                  y: Math.floor(2 + Math.random() * Math.max(1, height * 0.3 - 4)),
                };
          particles.push(makeParticle(scene, width, height, windDir, [pick]));
        }
        return;
      }
      const count = 3 + Math.floor(Math.random() * 4);
      for (let i = 0; i < count; i += 1) {
        particles.push(makeParticle(scene, width, height, windDir, skyStars));
      }
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      if (now >= nextBurst) {
        spawnBurst();
        nextBurst =
          now + duration.particleBurstMin + Math.random() * (duration.particleBurstMax - duration.particleBurstMin);
      }

      stepParticles(particles, scene, dt, width, height);
      paint(back, particles, 'back');
      paint(front, particles, 'front');
      raf = requestAnimationFrame(tick);
    };

    resize();
    spawnBurst();
    const parent = back.parentElement;
    const img = parent?.querySelector<HTMLImageElement>('.diorama__backdrop');
    const onImage = () => resize();
    img?.addEventListener('load', onImage);
    const observer = new ResizeObserver(resize);
    if (parent) observer.observe(parent);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      img?.removeEventListener('load', onImage);
    };
  }, [scene]);

  return (
    <>
      <canvas ref={backRef} className="diorama__fx diorama__fx--back" aria-hidden />
      <canvas ref={frontRef} className="diorama__fx diorama__fx--front" aria-hidden />
    </>
  );
}

function stepParticles(
  particles: Particle[],
  scene: BackgroundOption,
  dt: number,
  width: number,
  height: number,
) {
  for (const particle of particles) {
    particle.life += dt;
    particle.phase += dt * 2;
    if (scene === 'blossom') {
      particle.x += (particle.vx + Math.sin(particle.phase) * particle.wobble) * dt;
      particle.y += particle.vy * dt;
    } else if (scene === 'meadow') {
      particle.x += particle.vx * dt;
      particle.y += Math.sin(particle.phase) * particle.wobble * dt;
    }
  }

  for (let i = particles.length - 1; i >= 0; i -= 1) {
    const particle = particles[i];
    if (
      particle.life >= particle.maxLife ||
      particle.x < -12 ||
      particle.x > width + 12 ||
      particle.y < -12 ||
      particle.y > height + 12
    ) {
      particles.splice(i, 1);
    }
  }
}

function paint(canvas: HTMLCanvasElement, particles: Particle[], layer: Layer) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const particle of particles) {
    if (particle.layer !== layer) continue;
    const fade = fadeAmount(particle.life, particle.maxLife) * particle.alpha;
    if (particle.trail < 0) {
      drawTwinkle(ctx, particle, fade);
      continue;
    }
    ctx.globalAlpha = fade;
    ctx.fillStyle = particle.color;
    ctx.fillRect(Math.round(particle.x), Math.round(particle.y), particle.w, particle.h);
  }
  ctx.globalAlpha = 1;
}

function drawTwinkle(ctx: CanvasRenderingContext2D, particle: Particle, fade: number) {
  const x = Math.round(particle.x);
  const y = Math.round(particle.y);
  const s = particle.w;
  ctx.globalAlpha = fade;
  ctx.fillStyle = dioramaFx.starGlow;
  ctx.fillRect(x, y, 1, 1);
  if (s < 2) return;
  ctx.globalAlpha = fade * 0.75;
  ctx.fillStyle = dioramaFx.starGlowSoft;
  ctx.fillRect(x - 1, y, 1, 1);
  ctx.fillRect(x + 1, y, 1, 1);
  ctx.fillRect(x, y - 1, 1, 1);
  ctx.fillRect(x, y + 1, 1, 1);
  if (s < 3) return;
  ctx.globalAlpha = fade * 0.45;
  ctx.fillRect(x - 2, y, 1, 1);
  ctx.fillRect(x + 2, y, 1, 1);
}

function fadeAmount(life: number, maxLife: number): number {
  const t = life / maxLife;
  if (t < 0.12) return t / 0.12;
  if (t > 0.72) return (1 - t) / 0.28;
  return 1;
}

function makeParticle(
  scene: BackgroundOption,
  width: number,
  height: number,
  windDir: number,
  skyStars: { x: number; y: number }[] = [],
): Particle {
  const layer: Layer = Math.random() < 0.55 ? 'back' : 'front';
  const palette = dioramaFx[scene];
  const color = palette[Math.floor(Math.random() * palette.length)];

  if (scene === 'blossom') {
    return {
      x: width * (0.02 + Math.random() * 0.42),
      y: height * (Math.random() * 0.22 - 0.04),
      vx: 6 + Math.random() * 10,
      vy: 14 + Math.random() * 16,
      life: 0,
      maxLife: 3.2 + Math.random() * 2.4,
      w: Math.random() < 0.5 ? 2 : 1,
      h: Math.random() < 0.5 ? 1 : 2,
      color,
      layer,
      wobble: 3 + Math.random() * 4,
      phase: Math.random() * Math.PI * 2,
      alpha: 0.85,
      trail: 0,
    };
  }

  if (scene === 'meadow') {
    const fromLeft = windDir > 0;
    return {
      x: fromLeft ? -6 : width + 4,
      y: height * (0.18 + Math.random() * 0.55),
      vx: windDir * (28 + Math.random() * 22),
      vy: 0,
      life: 0,
      maxLife: 2.4 + Math.random() * 1.6,
      w: 3 + Math.floor(Math.random() * 5),
      h: 1,
      color,
      layer,
      wobble: 2 + Math.random() * 3,
      phase: Math.random() * Math.PI * 2,
      alpha: 0.28 + Math.random() * 0.18,
      trail: 0,
    };
  }

  const skyCeiling = height * 0.3;
  const spot =
    skyStars.length > 0 ? skyStars[Math.floor(Math.random() * skyStars.length)] : null;

  return {
    x: spot ? spot.x : Math.floor(width * (0.06 + Math.random() * 0.88)),
    y: spot ? spot.y : Math.floor(2 + Math.random() * Math.max(1, skyCeiling - 4)),
    vx: 0,
    vy: 0,
    life: 0,
    maxLife: 1.1 + Math.random() * 1.2,
    w: 1 + Math.floor(Math.random() * 3),
    h: 1,
    color: dioramaFx.starGlow,
    layer,
    wobble: 0,
    phase: 0,
    alpha: 1,
    trail: -1,
  };
}

function findSkyStars(img: HTMLImageElement, width: number, height: number) {
  const off = document.createElement('canvas');
  off.width = width;
  off.height = height;
  const ctx = off.getContext('2d', { willReadFrequently: true });
  if (!ctx) return [];
  ctx.imageSmoothingEnabled = false;
  drawCover(ctx, img, width, height);
  const { data } = ctx.getImageData(0, 0, width, height);
  const maxY = Math.floor(height * 0.3);
  const points: { x: number; y: number }[] = [];

  for (let y = 1; y < maxY; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const i = (y * width + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const lum = (r + g + b) / 3;
      if (lum < 165) continue;

      let neighborLum = 0;
      let count = 0;
      for (let dy = -1; dy <= 1; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          if (dx === 0 && dy === 0) continue;
          const ni = ((y + dy) * width + (x + dx)) * 4;
          neighborLum += (data[ni] + data[ni + 1] + data[ni + 2]) / 3;
          count += 1;
        }
      }
      if (count === 0 || neighborLum / count > lum - 18) continue;
      if (points.some((point) => Math.abs(point.x - x) + Math.abs(point.y - y) < 3)) continue;
      points.push({ x, y });
    }
  }

  return points;
}

function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, dw: number, dh: number) {
  const ir = img.naturalWidth / img.naturalHeight;
  const dr = dw / dh;
  let sx = 0;
  let sy = 0;
  let sw = img.naturalWidth;
  let sh = img.naturalHeight;
  if (ir > dr) {
    sw = img.naturalHeight * dr;
    sx = (img.naturalWidth - sw) / 2;
  } else {
    sh = img.naturalWidth / dr;
    sy = (img.naturalHeight - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, dw, dh);
}
