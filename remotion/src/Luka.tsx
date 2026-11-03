import React from 'react';
import {AbsoluteFill, OffthreadVideo, Html5Audio, Sequence, staticFile, useCurrentFrame, interpolate, Easing} from 'remotion';

// "Luka komplekti" — cinematic interview-style edit:
// punch-in "camera" cuts on a single take, defocus transitions, B-roll cutaways
// (wood / chairs / boucle), word-by-word captions = small white sans lead-in
// + big lime italic serif keyword, black serif name titles.

export const FPS = 30;
export const SRC_DUR = 31.43;
const W = 1080;
const H = 1920;
const LIME = '#D9EC86';
const SRC = staticFile('luka.mp4');

const fontCss = `
@font-face{font-family:'Serif';src:url('${staticFile('InstrumentSerif-Italic.ttf')}');font-style:italic}
@font-face{font-family:'Sans';src:url('${staticFile('Inter-Medium.otf')}');font-weight:500}`;

const f = (s: number) => Math.round(s * FPS);

// ---------------- shots (timeline seconds; src = where in the source take) ----------------
type Shot = {a: number; b: number; src: number; s0: number; s1: number; fx: number; fy: number; box?: boolean};
const SHOTS: Shot[] = [
  {a: 0, b: 1.14, src: 0, s0: 1.0, s1: 1.05, fx: 0.6, fy: 0.45},
  {a: 1.14, b: 2.5, src: 1.14, s0: 1.55, s1: 1.62, fx: 0.68, fy: 0.5},
  {a: 2.5, b: 4.66, src: 2.5, s0: 1.0, s1: 1.05, fx: 0.55, fy: 0.4},
  {a: 4.66, b: 5.52, src: 4.66, s0: 1.7, s1: 1.76, fx: 0.66, fy: 0.3},
  {a: 5.52, b: 7.86, src: 5.52, s0: 2.0, s1: 2.25, fx: 0.42, fy: 0.74}, // wood top macro
  {a: 7.86, b: 10.6, src: 7.86, s0: 1.1, s1: 1.02, fx: 0.55, fy: 0.4},
  {a: 10.6, b: 11.46, src: 10.6, s0: 1.6, s1: 1.66, fx: 0.62, fy: 0.3},
  {a: 11.46, b: 12.9, src: 22.0, s0: 1.9, s1: 2.0, fx: 0.4, fy: 0.8}, // chairs B-roll
  {a: 12.9, b: 13.8, src: 12.9, s0: 1.4, s1: 1.45, fx: 0.6, fy: 0.4},
  {a: 13.8, b: 15.4, src: 27.0, s0: 1.7, s1: 1.85, fx: 0.3, fy: 0.88}, // chairs B-roll
  {a: 15.4, b: 17.2, src: 24.2, s0: 2.3, s1: 2.45, fx: 0.35, fy: 0.86}, // boucle macro
  {a: 17.2, b: 18.6, src: 17.2, s0: 1.25, s1: 1.3, fx: 0.76, fy: 0.45},
  {a: 18.6, b: 20.08, src: 18.6, s0: 1.75, s1: 1.8, fx: 0.77, fy: 0.42},
  {a: 20.08, b: 22.0, src: 20.08, s0: 1.0, s1: 1.07, fx: 0.5, fy: 0.6}, // hero wide
  {a: 22.0, b: 23.02, src: 9.0, s0: 1.75, s1: 1.82, fx: 0.2, fy: 0.95},
  {a: 23.02, b: 25.36, src: 18.0, s0: 1.25, s1: 1.33, fx: 0.32, fy: 0.68, box: true}, // letterbox on paper
  {a: 25.36, b: 26.52, src: 25.36, s0: 1.4, s1: 1.45, fx: 0.82, fy: 0.5},
  {a: 26.52, b: 27.3, src: 26.52, s0: 1.8, s1: 1.85, fx: 0.82, fy: 0.5},
  {a: 27.3, b: 28.5, src: 27.3, s0: 1.0, s1: 1.06, fx: 0.5, fy: 0.55},
  {a: 28.5, b: SRC_DUR, src: 28.5, s0: 1.0, s1: 1.1, fx: 0.85, fy: 0.45},
];
const BLUR_CUTS = [2.5, 13.8, 20.08, 23.02, 27.3, 28.5];

const transformFor = (s: number, fx: number, fy: number, bw: number, bh: number) => {
  // scale the full 1080x1920 frame about (fx,fy), keep it covering the bw x bh box
  const sw = W * s;
  const sh = H * s;
  let tx = bw / 2 - fx * sw;
  let ty = bh / 2 - fy * sh;
  tx = Math.min(0, Math.max(bw - sw, tx));
  ty = Math.min(0, Math.max(bh - sh, ty));
  return `translate(${tx}px, ${ty}px) scale(${s})`;
};

const ShotView: React.FC<{shot: Shot}> = ({shot}) => {
  const frame = useCurrentFrame();
  const dur = f(shot.b) - f(shot.a);
  const p = interpolate(frame, [0, dur], [0, 1], {extrapolateRight: 'clamp'});
  const s = shot.s0 + (shot.s1 - shot.s0) * p;
  const video = (bw: number, bh: number) => (
    <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, transformOrigin: '0 0', transform: transformFor(s, shot.fx, shot.fy, bw, bh)}}>
      <OffthreadVideo src={SRC} muted startFrom={f(shot.src)} style={{width: W, height: H}} />
    </div>
  );
  if (shot.box) {
    const bh = 720;
    const enter = interpolate(frame, [0, 7], [0, 1], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
    return (
      <AbsoluteFill style={{background: '#EDEBE6'}}>
        <div style={{position: 'absolute', left: 0, top: (H - bh) / 2, width: W, height: bh, overflow: 'hidden',
          clipPath: `inset(${(1 - enter) * 50}% 0 ${(1 - enter) * 50}% 0)`}}>
          {video(W, bh)}
        </div>
      </AbsoluteFill>
    );
  }
  return <AbsoluteFill style={{overflow: 'hidden'}}>{video(W, H)}</AbsoluteFill>;
};

// ---------------- captions ----------------
type Chunk = {small: [number, string][]; key?: [number, string]; end: number; y?: number};
const CHUNKS: Chunk[] = [
  {small: [[1.14, 'bu'], [1.34, 'gal'], [1.48, 'katta']], key: [1.92, 'o‘zgarishlar'], end: 2.55},
  {small: [[2.6, 'Avvalo,'], [3.12, 'bu']], key: [3.18, 'komplektimizni'], end: 3.66},
  {small: [[3.7, 'ana'], [3.82, 'endi'], [4.08, 'sakkizta'], [4.4, 'emas,']], key: [4.66, 'o‘nta'], end: 5.48},
  {small: [[6.04, 'qismlari'], [6.4, 'ham'], [6.56, 'to‘liq']], key: [5.52, 'mexanizm'], end: 6.96},
  {small: [[7.0, 'to‘qqiz'], [7.5, 'shpomdan']], key: [7.86, 'ishlatdik'], end: 8.66},
  {small: [[8.72, 'Negaki,'], [9.24, 'ko‘rinish']], key: [9.78, 'jihatidan'], end: 10.55},
  {small: [[10.6, 'uyingizga'], [11.0, 'tushganida']], key: [11.46, 'dizaynlaringizga'], end: 12.85},
  {small: [[12.9, 'har'], [13.06, 'tarafini']], key: [13.38, 'o‘yladik'], end: 13.76},
  {small: [[14.26, 'o‘sha'], [14.45, 'siz'], [14.64, 'sevgan'], [14.88, 'dizaynda']], key: [13.8, 'Stullar'], end: 15.36},
  {small: [[15.4, 'qolgan']], key: [15.92, 'materiallari'], end: 17.15},
  {small: [[17.2, 'o‘tirganingizda'], [17.72, 'sizga']], key: [17.88, 'fiksatsiya'], end: 18.55},
  {small: [[18.6, 'bemalol'], [19.02, 'mazza'], [19.15, 'qilib']], key: [19.28, 'dam olib'], end: 20.02},
  {small: [[20.08, 'bu'], [20.22, 'komplektimiz'], [20.86, 'bugun']], key: [21.36, 'o‘n kishilik'], end: 21.96},
  {small: [[22.0, 'ana'], [22.32, 'endi'], [22.56, 'siz'], [22.66, 'bemalol']], key: [23.02, 'mehmonxonangizga'], end: 23.76, y: 930},
  {small: [[23.8, 'yoki-da']], key: [24.3, 'mini zalga'], end: 25.3, y: 930},
  {small: [[25.88, 'har'], [26.1, 'qayoqqa'], [26.36, 'qo‘yib']], key: [25.36, 'kuxnyaga'], end: 26.48},
  {small: [[26.52, 'ishlata'], [26.7, 'olasiz']], end: 27.26},
  {small: [[27.84, 'yaratildi']], key: [27.3, 'Universalligi'], end: 28.46},
  {small: [[28.96, 'sizga'], [29.14, 'har'], [29.34, 'doim'], [29.46, 'eng']], key: [29.66, 'yaxshisini'], end: 30.5},
  {small: [[30.58, 'taklif'], [30.7, 'etadi']], end: SRC_DUR},
];

const pop = (frame: number, at: number, len = 5) => {
  const p = interpolate(frame, [f(at), f(at) + len], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  return p;
};

const ChunkView: React.FC<{c: Chunk}> = ({c}) => {
  const frame = useCurrentFrame();
  const start = Math.min(c.small[0]?.[0] ?? 99, c.key?.[0] ?? 99);
  if (frame < f(start) || frame >= f(c.end)) return null;
  const out = interpolate(frame, [f(c.end) - 3, f(c.end)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const keyLen = c.key ? c.key[1].length : 0;
  const keySize = Math.min(210, 940 / (keyLen * 0.4));
  const y = c.y ?? 1180;
  return (
    <div style={{position: 'absolute', left: 0, width: W, top: y, display: 'flex', flexDirection: 'column', alignItems: 'center',
      opacity: out, filter: `blur(${(1 - out) * 10}px)`}}>
      <div style={{display: 'flex', gap: 14, fontFamily: 'Sans', fontWeight: 500, fontSize: 52, color: 'white', letterSpacing: -0.6,
        textShadow: '0 2px 14px rgba(0,0,0,0.45)', position: 'relative', zIndex: 2}}>
        {c.small.map(([t, w], i) => {
          const p = pop(frame, t, 4);
          return (
            <span key={i} style={{opacity: p, transform: `translateY(${(1 - p) * 14}px)`, filter: `blur(${(1 - p) * 6}px)`}}>{w}</span>
          );
        })}
      </div>
      {c.key && (() => {
        const p = pop(frame, c.key[0], 6);
        return (
          <div style={{fontFamily: 'Serif', fontStyle: 'italic', fontSize: keySize, lineHeight: 0.9, color: LIME, marginTop: -keySize * 0.26,
            letterSpacing: -keySize * 0.02, whiteSpace: 'nowrap', textShadow: '0 3px 10px rgba(0,0,0,0.35), 0 6px 34px rgba(0,0,0,0.45)',
            opacity: p, transform: `scale(${1.1 - 0.1 * p})`, filter: `blur(${(1 - p) * 12}px)`}}>
            {c.key[1]}
          </div>
        );
      })()}
    </div>
  );
};

// ---------------- black serif name title ----------------
const NameTitle: React.FC<{name: string; sub?: string; subAt?: number; at: number; end: number}> = ({name, sub, subAt, at, end}) => {
  const frame = useCurrentFrame();
  if (frame < f(at) || frame >= f(end)) return null;
  const p = pop(frame, at, 8);
  const ps = sub ? pop(frame, subAt ?? at, 6) : 0;
  const out = interpolate(frame, [f(end) - 4, f(end)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'absolute', left: 78, top: 400, opacity: out, filter: `blur(${(1 - out) * 14}px)`}}>
      <div style={{fontFamily: 'Serif', fontStyle: 'italic', fontSize: 300, lineHeight: 0.85, color: '#151413', letterSpacing: -8,
        opacity: p, transform: `translateY(${(1 - p) * 20}px)`, filter: `blur(${(1 - p) * 16}px)`}}>{name}</div>
      {sub && (
        <div style={{fontFamily: 'Sans', fontWeight: 500, fontSize: 62, color: '#1d1b19', letterSpacing: -1, marginTop: -4, marginLeft: 18,
          opacity: ps, transform: `translateY(${(1 - ps) * 10}px)`}}>{sub}</div>
      )}
    </div>
  );
};

// ---------------- defocus transitions ----------------
const blurAt = (frame: number) => {
  let b = 0;
  for (const c of BLUR_CUTS) {
    const d = Math.abs(frame - f(c));
    if (d < 6) b = Math.max(b, 26 * Math.pow(1 - d / 6, 1.6));
  }
  return b;
};

export const Luka: React.FC = () => {
  const frame = useCurrentFrame();
  const blur = blurAt(frame);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <style>{fontCss}</style>
      <AbsoluteFill style={{filter: `blur(${blur}px) saturate(0.86) contrast(1.06) brightness(0.97) sepia(0.07)`, transform: `scale(${1 + blur / 400})`}}>
        {SHOTS.map((s, i) => (
          <Sequence key={i} from={f(s.a)} durationInFrames={f(s.b) - f(s.a)}>
            <ShotView shot={s} />
          </Sequence>
        ))}
      </AbsoluteFill>
      {/* soft vignette + low scrim for caption legibility */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 85% 70% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.32) 100%)'}} />
      <AbsoluteFill style={{background: 'linear-gradient(to bottom, rgba(0,0,0,0) 48%, rgba(0,0,0,0.30) 68%, rgba(0,0,0,0.22) 100%)',
        opacity: frame >= f(23.02) && frame < f(25.36) ? 0.35 : 1}} />
      <NameTitle name="Luka" sub="komplekti" subAt={0.48} at={0.03} end={1.12} />
      <NameTitle name="Inmoda" at={28.5} end={SRC_DUR} />
      {CHUNKS.map((c, i) => <ChunkView key={i} c={c} />)}
      <Html5Audio src={SRC} />
      {BLUR_CUTS.map((c, i) => (
        <Sequence key={i} from={Math.max(0, f(c) - 6)} durationInFrames={20}>
          <Html5Audio src={staticFile('sfx/whoosh.wav')} volume={0.16} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
