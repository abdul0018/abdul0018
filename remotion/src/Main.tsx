import React from 'react';
import {AbsoluteFill, OffthreadVideo, Html5Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig, spring, interpolate} from 'remotion';
import {Hand, Activity, CarFront, SearchX, Truck, ClipboardCheck, Ban, TriangleAlert, Heart, Gauge, PhoneCall, ThumbsUp, LucideIcon} from 'lucide-react';

const FPS = 30;
const GOLD = '#E8C26A';
const fontCss = `
@font-face{font-family:'InterX';src:url('${staticFile('Inter-ExtraBold.otf')}');font-weight:800}
@font-face{font-family:'InterX';src:url('${staticFile('Inter-Bold.otf')}');font-weight:700}`;

// ---- speech phrases (timings measured from the audio) ----
const PHRASES: [number, number, string][] = [
  [1.35, 2.9, 'Tak, hammaga assalomu alaykum.'],
  [4.25, 6.7, 'Vibrastandga diagnostika uchun kelib, BYD Han olib qolganmiz.'],
  [8.15, 10.8, 'Bu mashinani aybini BYDdagilar ham topolmagan ekan.'],
  [11.6, 13.0, 'Shuning uchun bizga jo‘natib yuborishibdi.'],
  [15.35, 16.55, 'Biz tekshirib berdik mashinani.'],
  [17.65, 20.0, 'Bu diagnostika qilish uchun vibrastandni keragi ham yo‘q edi.'],
  [20.0, 20.7, 'Stupichasidan,'],
  [21.25, 22.45, 'muammo stupichadan bo‘lib chiqdi.'],
  [23.2, 24.85, 'Biz ko‘ngillari uchun vibrastandga qo‘yib,'],
  [25.5, 26.5, 'diagnostika qilib beryapmiz.'],
  [27.85, 30.15, 'Bizning xizmatlarimiz kerak bo‘lsa, bemalol aloqaga chiqib berasizlar.'],
  [30.65, 31.6, 'Salomat bo‘ling.'],
];
type W = {w: string; s: number; e: number};
const groups: W[][] = [];
for (const [s, e, text] of PHRASES) {
  const words = text.split(' ');
  const total = words.reduce((a, w) => a + w.length + 1, 0);
  let t = s;
  const ws = words.map((w) => { const d = ((w.length + 1) / total) * (e - s); const o = {w, s: t, e: t + d}; t += d; return o; });
  for (let i = 0; i < ws.length; i += 4) groups.push(ws.slice(i, i + 4));
}

// ---- icon cues ----
type Cue = {t: number; d: number; Icon: LucideIcon; label: string; sfx: string; color: string; anim?: 'wave' | 'drive' | 'shake' | 'pulse' | 'spin'};
const CUES: Cue[] = [
  {t: 1.3, d: 2.0, Icon: Hand, label: 'ASSALOMU ALAYKUM', sfx: 'pop', color: GOLD, anim: 'wave'},
  {t: 4.2, d: 1.3, Icon: Activity, label: 'DIAGNOSTIKA', sfx: 'whoosh', color: '#4FD1E8', anim: 'pulse'},
  {t: 5.6, d: 1.6, Icon: CarFront, label: 'BYD HAN', sfx: 'pop', color: GOLD},
  {t: 8.1, d: 2.9, Icon: SearchX, label: 'BYD TOPOLMADI', sfx: 'buzz', color: '#FF5A5A', anim: 'shake'},
  {t: 11.55, d: 2.0, Icon: Truck, label: 'BIZGA YUBORISHDI', sfx: 'swoosh_up', color: GOLD, anim: 'drive'},
  {t: 15.3, d: 2.0, Icon: ClipboardCheck, label: 'TEKSHIRDIK', sfx: 'ding', color: '#4ADE80'},
  {t: 17.6, d: 2.35, Icon: Ban, label: 'VIBRASTAND SHART EMAS', sfx: 'thud', color: '#FF9F43'},
  {t: 20.0, d: 2.7, Icon: TriangleAlert, label: 'MUAMMO: STUPICHA', sfx: 'alert', color: '#FF4040', anim: 'pulse'},
  {t: 23.15, d: 1.9, Icon: Heart, label: 'KO‘NGIL UCHUN', sfx: 'pop', color: '#FF6FA8', anim: 'pulse'},
  {t: 25.45, d: 2.0, Icon: Gauge, label: 'VIBRASTAND TEST', sfx: 'whoosh', color: '#4FD1E8', anim: 'spin'},
  {t: 27.8, d: 2.6, Icon: PhoneCall, label: 'ALOQAGA CHIQING', sfx: 'ring', color: '#4ADE80', anim: 'shake'},
  {t: 30.6, d: 1.5, Icon: ThumbsUp, label: 'SALOMAT BO‘LING', sfx: 'chime', color: GOLD},
];

const Badge: React.FC<{c: Cue}> = ({c}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const dur = Math.round(c.d * fps);
  const inS = spring({frame: f, fps, config: {damping: 11, stiffness: 160}});
  const out = interpolate(f, [dur - 8, dur], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const lab = spring({frame: f - 5, fps, config: {damping: 14}});
  let tx = 0, rot = 0, sc = 1;
  if (c.anim === 'wave') rot = Math.sin(f / 3) * 18 * Math.min(1, f / 10);
  if (c.anim === 'shake') tx = Math.sin(f * 2.2) * 7 * interpolate(f, [0, 25], [1, 0.3], {extrapolateRight: 'clamp'});
  if (c.anim === 'pulse') sc = 1 + Math.sin(f / 3.2) * 0.06;
  if (c.anim === 'spin') rot = Math.sin(f / 6) * 40;
  if (c.anim === 'drive') tx = interpolate(inS, [0, 1], [-500, 0]);
  const ringScale = 1 + ((f % 30) / 30) * 0.5;
  const ringOp = (1 - (f % 30) / 30) * 0.5;
  return (
    <AbsoluteFill style={{alignItems: 'center', top: 250, opacity: out}}>
      <div style={{position: 'relative', width: 190, height: 190, transform: `translateX(${tx}px) scale(${(c.anim === 'drive' ? 1 : inS) * sc})`}}>
        <div style={{position: 'absolute', inset: 0, borderRadius: '50%', border: `4px solid ${c.color}`, transform: `scale(${ringScale})`, opacity: ringOp}} />
        <div style={{position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(12,12,16,0.62)', backdropFilter: 'blur(14px)',
          border: `4px solid ${c.color}`, boxShadow: `0 0 40px ${c.color}88, 0 14px 40px rgba(0,0,0,.55)`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <c.Icon size={100} color={c.color} strokeWidth={2.2} style={{transform: `rotate(${rot}deg)`}} />
        </div>
      </div>
      <div style={{marginTop: 26, padding: '12px 30px', borderRadius: 40, background: 'rgba(12,12,16,0.7)', border: `2px solid ${c.color}66`,
        fontFamily: 'InterX', fontWeight: 800, fontSize: 40, letterSpacing: 4, color: '#fff',
        opacity: lab, transform: `translateY(${(1 - lab) * 30}px)`, boxShadow: '0 10px 30px rgba(0,0,0,.45)'}}>
        {c.label}
      </div>
    </AbsoluteFill>
  );
};

const Captions: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const g = groups.find((g) => t >= g[0].s - 0.05 && t <= g[g.length - 1].e + 0.25);
  if (!g) return null;
  const gs = Math.round(g[0].s * FPS);
  const ap = spring({frame: f - gs, fps: FPS, config: {damping: 15, stiffness: 200}});
  return (
    <AbsoluteFill style={{justifyContent: 'flex-start', alignItems: 'center', top: 1330}}>
      <div style={{maxWidth: 960, textAlign: 'center', lineHeight: 1.18, transform: `scale(${0.85 + 0.15 * ap})`, opacity: ap}}>
        {g.map((w, i) => {
          const active = t >= w.s && t < w.e + 0.05;
          const done = t >= w.e;
          return [
            <span key={i} style={{display: 'inline-block', fontFamily: 'InterX', fontWeight: 800, fontSize: 72,
              color: active ? GOLD : '#fff', opacity: active || done ? 1 : 0.55,
              transform: `scale(${active ? 1.1 : 1})`,
              textShadow: '0 4px 0 rgba(0,0,0,.55), 0 0 22px rgba(0,0,0,.85), 0 0 40px rgba(0,0,0,.6), 0 0 4px rgba(0,0,0,.9)', WebkitTextStroke: '2px rgba(0,0,0,.35)'}}>
              {w.w.toUpperCase()}
            </span>
            ].concat(i < g.length - 1 ? [<span key={'s'+i} style={{fontSize: 72, fontFamily: 'InterX'}}>{'\u00A0 '}</span>] : []);
        })}
      </div>
    </AbsoluteFill>
  );
};

export const Main: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <style>{fontCss}</style>
    <OffthreadVideo src={staticFile('src.mp4')} />
    {CUES.map((c, i) => (
      <Sequence key={i} from={Math.round(c.t * FPS)} durationInFrames={Math.round(c.d * FPS)}>
        <Badge c={c} />
        <Html5Audio src={staticFile(`sfx/${c.sfx}.wav`)} volume={0.45} />
      </Sequence>
    ))}
    <Captions />
  </AbsoluteFill>
);
