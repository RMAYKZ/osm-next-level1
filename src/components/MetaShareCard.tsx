import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getWeeklyMetaSliders, getISOWeekNumber } from '../utils/tacticEngine';
import { useLang } from '../contexts/LanguageContext';
import './MetaShareCard.css';

// ── Types ─────────────────────────────────────────────────────────────────────

type BLang = 'tr' | 'en' | 'hu' | 'ar' | 'pt';

interface BI {
  badge: string; title: string; subtitle: string;
  nextUpdate: string; d: string; h: string; m: string; s: string;
  btn: string; btnDone: string;
  homeLabel: string; awayLabel: string;
  stronger: string; equal: string;
  shareNote: string; liveNote: string;
}

// ── i18n ─────────────────────────────────────────────────────────────────────

const BI18N: Record<BLang, BI> = {
  tr: {
    badge: 'HAFTALIK META ÖZET',
    title: 'Bu Haftanın Taktik Özeti',
    subtitle: 'Her Pazartesi yenilenen deterministik motor — 3 kritik senaryo için bu haftanın en iyi slider değerleri.',
    nextUpdate: 'Sonraki güncelleme',
    d: 'GÜN', h: 'SAAT', m: 'DAK', s: 'SN',
    btn: 'Kartı İndir (PNG)', btnDone: 'İndirildi ✓',
    homeLabel: 'EV MAÇI', awayLabel: 'DEPLASMAN',
    stronger: 'GÜÇLÜ RAKİP', equal: 'DENK RAKİP',
    shareNote: 'Discord · WhatsApp · Telegram gruplarında paylaş',
    liveNote: 'Her Pazartesi otomatik güncellenir · Deterministik motor',
  },
  en: {
    badge: 'WEEKLY META BRIEF',
    title: "This Week's Tactic Brief",
    subtitle: 'Deterministic engine refreshed every Monday — optimal slider values across 3 critical scenarios this week.',
    nextUpdate: 'Next refresh in',
    d: 'DAYS', h: 'HRS', m: 'MIN', s: 'SEC',
    btn: 'Download Card (PNG)', btnDone: 'Downloaded ✓',
    homeLabel: 'HOME', awayLabel: 'AWAY',
    stronger: 'vs STRONGER', equal: 'vs EQUAL',
    shareNote: 'Share in Discord · WhatsApp · Telegram groups',
    liveNote: 'Auto-updates every Monday · Deterministic engine',
  },
  hu: {
    badge: 'HETI META ÖSSZEFOGLALÓ',
    title: 'Ezen Hét Taktikai Összefoglalója',
    subtitle: 'Minden hétfőn frissülő motor — 3 kulcsszcenárió optimális csúszkaértékei ezen a héten.',
    nextUpdate: 'Következő frissítés',
    d: 'NAP', h: 'ÓRA', m: 'PERC', s: 'MP',
    btn: 'Kártya Letöltése (PNG)', btnDone: 'Letöltve ✓',
    homeLabel: 'HAZAI', awayLabel: 'VENDÉG',
    stronger: 'ERŐSEBB ELLEN', equal: 'EGYENLŐ ELLEN',
    shareNote: 'Oszd meg Discord · WhatsApp · Telegram csoportokban',
    liveNote: 'Automatikus frissítés minden hétfőn · Determinisztikus motor',
  },
  ar: {
    badge: 'ملخص الأسلوب الأسبوعي',
    title: 'ملخص التكتيك هذا الأسبوع',
    subtitle: 'المحرك التحديدي يتجدد كل اثنين — القيم المثلى لـ3 سيناريوهات حاسمة هذا الأسبوع.',
    nextUpdate: 'التحديث التالي خلال',
    d: 'أيام', h: 'ساعات', m: 'دقائق', s: 'ثواني',
    btn: 'تنزيل البطاقة', btnDone: 'تم التنزيل ✓',
    homeLabel: 'ملعب المنزل', awayLabel: 'ملعب الخصم',
    stronger: 'مقابل أقوى', equal: 'مقابل متكافئ',
    shareNote: 'شارك في مجموعات Discord · WhatsApp · Telegram',
    liveNote: 'يتحدث تلقائياً كل اثنين · المحرك التحديدي',
  },
  pt: {
    badge: 'RESUMO META SEMANAL',
    title: 'Resumo Tático desta Semana',
    subtitle: 'Motor determinístico atualizado toda segunda — valores ótimos de slider para 3 cenários críticos desta semana.',
    nextUpdate: 'Próxima atualização em',
    d: 'DIAS', h: 'HRS', m: 'MIN', s: 'SEG',
    btn: 'Baixar Cartão (PNG)', btnDone: 'Baixado ✓',
    homeLabel: 'EM CASA', awayLabel: 'FORA',
    stronger: 'vs MAIS FORTE', equal: 'vs IGUAL',
    shareNote: 'Compartilhe no Discord · WhatsApp · Telegram',
    liveNote: 'Atualiza automaticamente toda segunda · Motor determinístico',
  },
};

// ── Countdown ─────────────────────────────────────────────────────────────────

function calcTimeLeft() {
  const now = new Date();
  const day = now.getUTCDay(); // 0=Sun 1=Mon … 6=Sat
  const daysUntil = day === 0 ? 1 : day === 1 ? 7 : 8 - day;
  const nextMonday = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + daysUntil);
  const diff = Math.max(0, nextMonday - now.getTime());
  return {
    days:  Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    mins:  Math.floor((diff % 3_600_000) / 60_000),
    secs:  Math.floor((diff % 60_000) / 1_000),
  };
}

function useCountdown() {
  const [val, setVal] = useState(calcTimeLeft);
  useEffect(() => {
    const id = setInterval(() => setVal(calcTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);
  return val;
}

// ── Gradient helpers ───────────────────────────────────────────────────────────

function pGrad(v: number) {
  if (v >= 70) return 'linear-gradient(90deg,#f43f5e,#9161f5)';
  if (v >= 45) return 'linear-gradient(90deg,#f5a623,#f43f5e)';
  if (v >= 25) return 'linear-gradient(90deg,#10d9a1,#5b8af7)';
  return 'linear-gradient(90deg,#5b8af7,#9161f5)';
}
function sGrad(v: number) {
  if (v >= 70) return 'linear-gradient(90deg,#f43f5e,#9161f5)';
  if (v >= 45) return 'linear-gradient(90deg,#10d9a1,#5b8af7)';
  return 'linear-gradient(90deg,#5b8af7,#9161f5)';
}
function tGrad(v: number) {
  if (v >= 70) return 'linear-gradient(90deg,#f5a623,#f43f5e)';
  if (v >= 45) return 'linear-gradient(90deg,#10d9a1,#5b8af7)';
  return 'linear-gradient(90deg,#5b8af7,#9161f5)';
}

// ── Canvas helpers ────────────────────────────────────────────────────────────

function rrect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const cr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + cr, y);
  ctx.arcTo(x + w, y,     x + w, y + h, cr);
  ctx.arcTo(x + w, y + h, x,     y + h, cr);
  ctx.arcTo(x,     y + h, x,     y,     cr);
  ctx.arcTo(x,     y,     x + w, y,     cr);
  ctx.closePath();
}

// ── PNG generator ─────────────────────────────────────────────────────────────

interface ScSnap { scenario: string; formation: string; p: number; s: number; t: number; }

function generatePNG(scenarios: ScSnap[], weekNum: number): string {
  const W = 1080, H = 540;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, W, H);

  // Header
  ctx.font = '900 20px Arial, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.fillText('OSM NEXT LEVEL', 54, 44);

  ctx.font = '700 12px Arial, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.textAlign = 'right';
  ctx.fillText(`WEEK ${weekNum} · ${new Date().getUTCFullYear()}`, W - 54, 44);

  // Header divider
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(54, 60); ctx.lineTo(W - 54, 60); ctx.stroke();

  // Subtitle
  ctx.font = '600 10px Arial, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  ctx.textAlign = 'center';
  ctx.fillText("THIS WEEK'S META BRIEF · OPTIMAL SLIDER VALUES · osnextlevel.com", W / 2, 80);

  // Three columns
  const CY = 100, CH = 384, CW = 300, GAP = 36;
  const COL_X = [54, 54 + CW + GAP, 54 + (CW + GAP) * 2];

  scenarios.forEach((sc, i) => {
    const cx = COL_X[i], cy = CY;

    // Card bg + border
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    rrect(ctx, cx, cy, CW, CH, 12); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    rrect(ctx, cx, cy, CW, CH, 12); ctx.stroke();

    // Scenario label
    ctx.font = '700 9px Arial, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.textAlign = 'left';
    ctx.fillText(sc.scenario, cx + 20, cy + 26);

    // Formation name
    ctx.font = '900 44px "Arial Black", Arial, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(sc.formation, cx + 20, cy + 76);

    // Divider
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx + 20, cy + 90); ctx.lineTo(cx + CW - 20, cy + 90); ctx.stroke();

    // "OPTIMAL SLIDERS" eyebrow
    ctx.font = '700 8px Arial, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.22)';
    ctx.fillText('OPTIMAL SLIDERS', cx + 20, cy + 108);

    // Slider draw helper
    const bx = cx + 20, bw = CW - 40, bh = 8;
    const drawBar = (label: string, val: number, iy: number) => {
      ctx.font = '700 9px Arial, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.42)';
      ctx.textAlign = 'left';
      ctx.fillText(label, bx, iy);

      ctx.font = '800 15px Arial, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'right';
      ctx.fillText(String(val), cx + CW - 20, iy);
      ctx.textAlign = 'left';

      // Track
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      rrect(ctx, bx, iy + 7, bw, bh, 4); ctx.fill();

      // Fill
      const fw = Math.max(4, bw * val / 100);
      ctx.fillStyle = '#ffffff';
      rrect(ctx, bx, iy + 7, fw, bh, 4); ctx.fill();
    };

    drawBar('PRESSURE', sc.p, cy + 134);
    drawBar('STYLE',    sc.s, cy + 176);
    drawBar('TEMPO',    sc.t, cy + 218);
  });

  // Footer
  ctx.font = '700 12px Arial, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText('osnextlevel.com', W / 2, H - 28);

  ctx.font = '500 9px Arial, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  ctx.fillText('16 YEARS OF TACTICAL EXPERTISE  ·  DETERMINISTIC ENGINE  ·  GLOBAL OSM COMMUNITY', W / 2, H - 12);

  return canvas.toDataURL('image/png');
}

// ── Sub-components ────────────────────────────────────────────────────────────

function BriefSliderBar({ label, value, gradient, delay = 0 }: {
  label: string; value: number; gradient: string; delay?: number;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ color: 'rgba(255,255,255,0.42)', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</span>
        <motion.span
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: delay + 0.45 }}
          style={{ color: '#ffffff', fontWeight: 800, fontSize: 20, letterSpacing: '-0.02em', lineHeight: 1 }}
        >{value}</motion.span>
      </div>
      <div style={{ height: 8, borderRadius: 99, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }} animate={{ width: `${value}%` }}
          transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1], delay }}
          style={{ height: '100%', borderRadius: 99, background: gradient, position: 'relative' }}
        >
          <motion.div
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 1.6, delay: delay + 0.6, ease: 'easeInOut' }}
            style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.3) 50%,transparent 100%)',
              pointerEvents: 'none',
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}

function CountUnit({ value, label }: { value: number; label: string }) {
  const str = String(value).padStart(2, '0');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 52 }}>
      <div style={{
        position: 'relative',
        background: 'rgba(91,138,247,0.08)',
        border: '1px solid rgba(91,138,247,0.2)',
        borderRadius: 10,
        padding: '10px 8px 8px',
        minWidth: 52,
        textAlign: 'center',
        overflow: 'hidden',
      }}>
        <AnimatePresence mode="popLayout">
          <motion.span
            key={str}
            initial={{ y: -16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{
              display: 'block',
              fontFamily: "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif",
              fontSize: 'clamp(26px, 3.8vw, 44px)',
              fontWeight: 900,
              color: '#ffffff',
              lineHeight: 1,
              letterSpacing: '-0.02em',
            }}
          >{str}</motion.span>
        </AnimatePresence>
        {/* subtle top tint */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(180deg,rgba(255,255,255,0.03) 0%,transparent 60%)',
        }} />
      </div>
      <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase' }}>{label}</span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

const _isMobile = typeof window !== "undefined" && window.innerWidth < 768;
const CARD: React.CSSProperties = {
  background: _isMobile ? 'rgba(91,138,247,0.05)' : 'rgba(91,138,247,0.04)',
  ...(_isMobile ? {} : { backdropFilter: 'blur(20px)' }),
  border: '1px solid rgba(91,138,247,0.16)',
  borderRadius: 16,
  boxShadow: '0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(91,138,247,0.08)',
};

export default function MetaShareCard() {
  const { lang, t } = useLang();
  const w = BI18N[(lang as BLang)] ?? BI18N.en;
  const cd = useCountdown();
  const weekNum = getISOWeekNumber();
  const [downloaded, setDownloaded] = useState(false);

  // Deterministic weekly values for the 3 scenarios
  const s1 = getWeeklyMetaSliders('5-2-3', 'home', 'stronger') ?? { pressure: 25, style: 23, tempo: 65 };
  const s2 = getWeeklyMetaSliders('5-2-3', 'away', 'equal')    ?? { pressure: 12, style: 22, tempo: 68 };
  const s3 = getWeeklyMetaSliders('4-3-3', 'home', 'stronger') ?? { pressure: 68, style: 60, tempo: 67 };

  const scenarios = [
    { label: `${w.homeLabel} · ${w.stronger}`, formation: '5-2-3', p: s1.pressure, s: s1.style, t: s1.tempo },
    { label: `${w.awayLabel} · ${w.equal}`,    formation: '5-2-3', p: s2.pressure, s: s2.style, t: s2.tempo },
    { label: `${w.homeLabel} · ${w.stronger}`, formation: '4-3-3', p: s3.pressure, s: s3.style, t: s3.tempo },
  ];

  // Week progress 0–100 (Mon 00:00 UTC = 0, Sun 23:59:59 = ~100)
  const remaining = cd.days * 86400 + cd.hours * 3600 + cd.mins * 60 + cd.secs;
  const weekProgress = Math.max(0, Math.min(100, Math.round((604800 - remaining) / 604800 * 100)));

  function handleDownload() {
    const dataURL = generatePNG([
      { scenario: `HOME · vs STRONGER`, formation: '5-2-3', p: s1.pressure, s: s1.style, t: s1.tempo },
      { scenario: `AWAY · vs EQUAL`,    formation: '5-2-3', p: s2.pressure, s: s2.style, t: s2.tempo },
      { scenario: `HOME · vs STRONGER`, formation: '4-3-3', p: s3.pressure, s: s3.style, t: s3.tempo },
    ], weekNum);
    if (!dataURL) return;
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = `osm-meta-week${weekNum}-${new Date().getUTCFullYear()}.png`;
    a.click();
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2800);
  }

  return (
    <section id="weekly-brief" className="mscard-section">

      {/* ── Section Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 0.55 }}
        style={{ textAlign: 'center', marginBottom: 48 }}
      >
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px',
          borderRadius: 99, background: 'rgba(91,138,247,0.08)', border: '1px solid rgba(91,138,247,0.28)',
          marginBottom: 20,
        }}>
          <motion.span
            animate={{ opacity: [1, 0.35, 1] }} transition={{ duration: 2, repeat: Infinity }}
            style={{ width: 6, height: 6, borderRadius: '50%', background: '#5b8af7', display: 'inline-block' }}
          />
          <span style={{ color: '#7eb8ff', fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            {w.badge}
          </span>
        </div>

        <h2 style={{
          fontSize: 'clamp(28px,5vw,46px)', fontWeight: 900, lineHeight: 1.08,
          letterSpacing: '-0.02em', margin: '0 0 14px', color: '#ffffff',
        }}>{w.title}</h2>

        <p style={{
          color: 'rgba(255,255,255,0.42)', fontSize: 'clamp(13px,2vw,15px)', lineHeight: 1.7,
          maxWidth: 620, margin: '0 auto 24px', textAlign: 'center',
        }}>{w.subtitle}</p>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px',
          borderRadius: 99, background: 'rgba(16,217,161,0.08)', border: '1px solid rgba(16,217,161,0.25)',
        }}>
          <motion.span
            animate={{ opacity: [1, 0.35, 1] }} transition={{ duration: 2, repeat: Infinity }}
            style={{ width: 6, height: 6, borderRadius: '50%', background: '#10d9a1', display: 'inline-block' }}
          />
          <span style={{ color: '#4aedc0', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em' }}>
            {w.liveNote}
          </span>
        </div>
      </motion.div>

      {/* ── Countdown Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.06 }}
        style={{ ...CARD, padding: '32px 28px', marginBottom: 14, textAlign: 'center' }}
      >
        <div style={{
          fontSize: 10.5, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.3)',
          textTransform: 'uppercase', marginBottom: 26,
        }}>{w.nextUpdate}</div>

        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          gap: 'clamp(10px, 2.5vw, 28px)',
        }}>
          <CountUnit value={cd.days}  label={w.d} />
          <motion.span
            animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1, repeat: Infinity }}
            style={{ fontSize: 'clamp(22px,3.5vw,38px)', fontWeight: 900, color: 'rgba(255,255,255,0.2)', lineHeight: 1, paddingBottom: 24 }}
          >:</motion.span>
          <CountUnit value={cd.hours} label={w.h} />
          <motion.span
            animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
            style={{ fontSize: 'clamp(22px,3.5vw,38px)', fontWeight: 900, color: 'rgba(255,255,255,0.2)', lineHeight: 1, paddingBottom: 24 }}
          >:</motion.span>
          <CountUnit value={cd.mins}  label={w.m} />
          <motion.span
            animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1, repeat: Infinity }}
            style={{ fontSize: 'clamp(22px,3.5vw,38px)', fontWeight: 900, color: 'rgba(255,255,255,0.2)', lineHeight: 1, paddingBottom: 24 }}
          >:</motion.span>
          <CountUnit value={cd.secs}  label={w.s} />
        </div>

        {/* Week progress bar */}
        <div style={{ marginTop: 28, maxWidth: 420, margin: '28px auto 0' }}>
          <div style={{ height: 3, borderRadius: 99, background: 'rgba(255,255,255,0.06)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${weekProgress}%` }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
              style={{ height: '100%', borderRadius: 99, background: 'linear-gradient(90deg,#5b8af7,#9161f5)' }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.22)', fontWeight: 700, letterSpacing: '0.08em' }}>MON</span>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.22)', fontWeight: 700, letterSpacing: '0.08em' }}>SUN</span>
          </div>
        </div>
      </motion.div>

      {/* ── Three Scenario Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 14, marginBottom: 14 }}>
        {scenarios.map((sc, i) => (
          <motion.div
            key={sc.formation + sc.label}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.45, delay: i * 0.09 }}
            style={{ ...CARD, padding: '22px 20px' }}
          >
            <div style={{ marginBottom: 14 }}>
              <div style={{
                fontSize: 9, fontWeight: 800, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.3)',
                textTransform: 'uppercase', marginBottom: 8,
              }}>{sc.label}</div>
              <div style={{
                fontSize: 'clamp(32px,5vw,44px)', fontWeight: 900, color: '#ffffff',
                letterSpacing: '-0.02em', lineHeight: 1,
                fontFamily: "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif",
              }}>{sc.formation}</div>
            </div>

            <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 16 }} />

            <BriefSliderBar label={t('anti.pressure')} value={sc.p} gradient={pGrad(sc.p)} delay={i * 0.07} />
            <BriefSliderBar label={t('anti.style')}    value={sc.s} gradient={sGrad(sc.s)} delay={i * 0.07 + 0.1} />
            <BriefSliderBar label={t('anti.tempo')}    value={sc.t} gradient={tGrad(sc.t)} delay={i * 0.07 + 0.2} />
          </motion.div>
        ))}
      </div>

      {/* ── Download Button ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 0.45, delay: 0.28 }}
        style={{ textAlign: 'center', paddingTop: 10 }}
      >
        <button
          onClick={handleDownload}
          className="mscard-btn"
          style={{
            background: downloaded ? 'rgba(16,217,161,0.12)' : 'linear-gradient(135deg,#5b8af7,#9161f5)',
            border: `1px solid ${downloaded ? 'rgba(16,217,161,0.4)' : 'transparent'}`,
            color: '#ffffff',
          }}
        >
          <span style={{ fontSize: 17 }}>{downloaded ? '✓' : '↓'}</span>
          {downloaded ? w.btnDone : w.btn}
        </button>
        <p style={{ marginTop: 10, fontSize: 10.5, color: 'rgba(255,255,255,0.22)', letterSpacing: '0.05em' }}>
          PNG · 1080×540 · {w.shareNote}
        </p>
      </motion.div>

    </section>
  );
}
