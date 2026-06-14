import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLang } from '../contexts/LanguageContext';
import { OPP_LIST, TD } from '../data/tacticDatabase';
import './MatchCoach.css';

type Loc = 'home' | 'away';
type Str = 'stronger' | 'equal' | 'weaker';

// ── i18n ──────────────────────────────────────────────────────────────
const MC_I18N: Record<string, Record<string, string>> = {
  badge:       { tr:'MAÇÖNCESI ANALİZ', en:'PRE-MATCH ANALYSIS', hu:'MECCS ELŐTTI ELEMZÉS', ar:'تحليل ما قبل المباراة', pt:'ANÁLISE PRÉ-JOGO' },
  title:       { tr:'Koç Kartı', en:'Coach Card', hu:'Edző Kártya', ar:'بطاقة المدرب', pt:'Ficha do Treinador' },
  subtitle:    { tr:'Formasyonunu ve sahayı seç — deterministik motor bu haftanın taktik profilini hesaplar.', en:'Select your scenario — the deterministic engine calculates this week\'s tactical profile.', hu:'Válaszd ki a forgatókönyvet — a motor kiszámítja ezen hét taktikai profilját.', ar:'اختر السيناريو — يحسب المحرك الملف التكتيكي لهذا الأسبوع.', pt:'Selecione o cenário — o motor calcula o perfil tático desta semana.' },
  locLabel:    { tr:'Maç Yeri', en:'Match Location', hu:'Meccs Helyszíne', ar:'مكان المباراة', pt:'Local do Jogo' },
  strLabel:    { tr:'Güç Durumu', en:'Relative Strength', hu:'Relatív Erő', ar:'القوة النسبية', pt:'Força Relativa' },
  oppLabel:    { tr:'Rakip Formasyon', en:'Opponent Formation', hu:'Ellenfél Felállása', ar:'تشكيلة الخصم', pt:'Formação Adversária' },
  home:        { tr:'Ev Sahibi', en:'Home', hu:'Hazai', ar:'ملعب الأرضية', pt:'Casa' },
  away:        { tr:'Deplasman', en:'Away', hu:'Vendég', ar:'أرضية الخصم', pt:'Fora' },
  stronger:    { tr:'Güçlüyüz', en:'Stronger', hu:'Erősebbek', ar:'أقوى', pt:'Mais Forte' },
  equal:       { tr:'Eşit', en:'Equal', hu:'Egyenlő', ar:'متكافئ', pt:'Igual' },
  weaker:      { tr:'Zayıfız', en:'Weaker', hu:'Gyengébbek', ar:'أضعف', pt:'Mais Fraco' },
  confidence:  { tr:'Güven Skoru', en:'Confidence Score', hu:'Megbízhatósági Pontszám', ar:'درجة الثقة', pt:'Índice de Confiança' },
  winLabel:    { tr:'GALİBİYET', en:'WIN', hu:'GYŐZELEM', ar:'فوز', pt:'VITÓRIA' },
  drawLabel:   { tr:'BERABERE', en:'DRAW', hu:'DÖNTETLEN', ar:'تعادل', pt:'EMPATE' },
  lossLabel:   { tr:'MAĞLUBİYET', en:'LOSS', hu:'VERESÉG', ar:'خسارة', pt:'DERROTA' },
  counter:     { tr:'Kontra Formasyon', en:'Counter Formation', hu:'Kontra Felállás', ar:'تشكيلة مضادة', pt:'Formação Contra' },
  gamePlan:    { tr:'Oyun Planı', en:'Game Plan', hu:'Játékterv', ar:'خطة اللعب', pt:'Plano de Jogo' },
  sliders:     { tr:'Optimal Slider Değerleri', en:'Optimal Slider Values', hu:'Optimális Csúszkaértékek', ar:'القيم المثلى للمنزلقات', pt:'Valores Ideais dos Controles' },
  pressure:    { tr:'Baskı', en:'Pressure', hu:'Nyomás', ar:'ضغط', pt:'Pressão' },
  style:       { tr:'Stil', en:'Style', hu:'Stílus', ar:'أسلوب', pt:'Estilo' },
  tempo:       { tr:'Tempo', en:'Tempo', hu:'Tempó', ar:'إيقاع', pt:'Ritmo' },
  coachNote:   { tr:'Koç Notu', en:'Coach Note', hu:'Edző Megjegyzése', ar:'ملاحظة المدرب', pt:'Nota do Treinador' },
  selectHint:  { tr:'Maç yerini, güç durumunu ve rakip formasyonu seçerek taktik analizini oluştur.', en:'Select location, strength, and opponent to generate your match analysis.', hu:'Válaszd ki a helyszínt, erőt és ellenfelet az elemzés elkészítéséhez.', ar:'اختر الموقع والقوة والخصم لإنشاء التحليل.', pt:'Selecione local, força e adversário para gerar sua análise.' },
  badgeStrong: { tr:'GÜÇLÜ', en:'STRONG', hu:'ERŐS', ar:'قوي', pt:'FORTE' },
  badgeSolid:  { tr:'SAĞLAM', en:'SOLID', hu:'SZILÁRD', ar:'صلب', pt:'SÓLIDO' },
  badgeAvg:    { tr:'ORTALAMA', en:'AVERAGE', hu:'ÁTLAGOS', ar:'متوسط', pt:'MÉDIO' },
  optionA:     { tr:'Seçenek A', en:'Option A', hu:'A lehetőség', ar:'الخيار أ', pt:'Opção A' },
  optionB:     { tr:'Seçenek B', en:'Option B', hu:'B lehetőség', ar:'الخيار ب', pt:'Opção B' },
  forwards:    { tr:'Forvetler', en:'Forwards', hu:'Csatárok', ar:'المهاجمون', pt:'Avançados' },
  midfield:    { tr:'Orta Saha', en:'Midfield', hu:'Középpálya', ar:'خط الوسط', pt:'Meio-campo' },
  defence:     { tr:'Savunma', en:'Defence', hu:'Védelem', ar:'الدفاع', pt:'Defesa' },
  offside:     { tr:'Ofsayt Tuzağı', en:'Offside Trap', hu:'Lestcsapda', ar:'فخ التسلل', pt:'Armadilha de Impedimento' },
  marking:     { tr:'İşaretleme', en:'Marking', hu:'Fedezés', ar:'المراقبة', pt:'Marcação' },
};

function mc(key: string, lang: string): string {
  return MC_I18N[key]?.[lang] ?? MC_I18N[key]?.en ?? key;
}

// ── Coach notes per scenario ──────────────────────────────────────────
const NOTES: Record<string, Record<string, string>> = {
  'home-stronger': {
    tr: 'Ev sahibi ve güçlüsün — rakip seni durduramayacak. Yüksek baskıyla başla, kanatları kullan ve gol fırsatlarında acımasız ol.',
    en: 'Home advantage with superior strength — opponent cannot contain your press. Attack with intensity from the first whistle and be clinical on your chances.',
    hu: 'Hazai pályán és erősebbek vagytok — nyomj magas tempóban és légy klinikus a gólszerzésben.',
    ar: 'ميزة الأرضية مع التفوق — الخصم لا يستطيع احتواء ضغطك. هاجم بكثافة من الصافرة الأولى.',
    pt: 'Em casa com superioridade — adversário não suporta sua pressão. Ataque com intensidade desde o início.',
  },
  'home-equal': {
    tr: 'Dengeli maç ama ev avantajı senin yanında. Savunma disiplinini koru, rakibin hatalarını kontr ataklarla değerlendir.',
    en: 'Level contest but home advantage is your edge. Stay disciplined defensively and exploit transitions — one moment of quality wins this.',
    hu: 'Kiegyensúlyozott meccs, de a hazai pálya előny. Maradj fegyelmezett és kontrázz a hibáikra.',
    ar: 'منافسة متكافئة لكن الأرضية في صفك. كن منضبطاً دفاعياً واستغل الانتقالات.',
    pt: 'Partida equilibrada com fator casa. Seja disciplinado defensivamente e explore as transições.',
  },
  'home-weaker': {
    tr: 'Ev önünde zor ama her şey mümkün. Savunma kompakt kal, dikkatli bekle — tek bir kontr atak her şeyi değiştirebilir.',
    en: 'Tough match at home but anything is possible on your own turf. Stay compact, absorb pressure, and punish on the counter.',
    hu: 'Nehéz meccs otthon, de minden lehetséges. Legyél kompakt, szívd fel a nyomást és büntess kontrán.',
    ar: 'مباراة صعبة في الملعب لكن كل شيء ممكن. ابق مدمجاً وامتص الضغط واعاقب في الهجمات المرتدة.',
    pt: 'Partida difícil em casa mas tudo é possível. Fique compacto, absorva e contra-ataque.',
  },
  'away-stronger': {
    tr: 'Deplasmanda güçlüsün — rakibin seni durduracak silahı yok. Erken gol vur, maçı erkenden kapatmaya çalış.',
    en: 'Strong away performance — opponent lacks the tools to stop you. Strike early, build your lead, and close it out with controlled possession.',
    hu: 'Erős idegenben — az ellenfél nem tudja megállítani. Ütj hamar és zárd be a meccset.',
    ar: 'قوي في ملعب الخصم — لا يملك الأدوات لإيقافك. سجّل مبكراً وأغلق المباراة.',
    pt: 'Forte fora de casa — adversário não tem como te parar. Marque cedo e feche o jogo.',
  },
  'away-equal': {
    tr: 'Deplasmanda eşit güç. İlk yarı kompakt geç, devre arasından sonra baskıyı artır — sabır bu maçı kazandırır.',
    en: 'Level contest away from home. Stay compact in the first half, increase pressure after the break — patience is your weapon.',
    hu: 'Egyenlő erők idegenben. Első félben kompakt, második félben nyomj — a türelem a fegyver.',
    ar: 'تكافؤ خارج الملعب. كن مدمجاً في الشوط الأول ثم زد الضغط بعد الاستراحة — الصبر هو سلاحك.',
    pt: 'Equilíbrio fora de casa. Compacto no primeiro tempo, pressão no segundo — paciência é sua arma.',
  },
  'away-weaker': {
    tr: 'Deplasmanda zorlu pozisyon. Geri çekil, savunmayı sağlamlaştır ve bir kontr atak fırsatını bekle. Tek gol her şeyi değiştirebilir.',
    en: 'Underdog away — absorb, defend deep, and be lethal on the break. One clear chance is all you need to take something from this game.',
    hu: 'Esélytelenként idegenben — szívd fel, védekezz mélyen és légy halálos kontrán. Egy esély elég.',
    ar: 'المغلوب على أمره بعيداً — امتص الضغط ودافع عمقاً وكن قاتلاً في الهجمات المرتدة.',
    pt: 'Azarão fora — absorva, defenda fundo e seja letal no contra-ataque. Uma chance é o suficiente.',
  },
};

// ── Probability calculator ────────────────────────────────────────────
function calcProbs(sr: number, loc: Loc, str: Str) {
  let win  = sr * 0.58;
  let loss = (100 - sr) * 0.52;

  if (loc === 'home') { win += 6; loss -= 4; }
  else               { win -= 4; loss += 6; }

  if (str === 'stronger') { win += 11; loss -= 9; }
  else if (str === 'weaker') { win -= 15; loss += 11; }

  let draw = 100 - win - loss;

  const sum = win + draw + loss;
  win  = Math.round((win  / sum) * 100);
  loss = Math.round((loss / sum) * 100);
  draw = 100 - win - loss;

  return {
    win:  Math.max(5,  Math.min(88, win)),
    draw: Math.max(5,  Math.min(55, draw)),
    loss: Math.max(5,  Math.min(82, loss)),
  };
}

function calcConfidence(win: number, sr: number): number {
  // Weighted raw: win prob (65%) + tactic quality (35%)
  const raw = win * 0.65 + sr * 0.35;
  // Scale upward: map typical 35-75 range → 52-98
  const scaled = Math.round(raw * 1.18 + 14);
  return Math.max(52, Math.min(98, scaled));
}

// ── Badge color ───────────────────────────────────────────────────────
function badgeColor(badge: string): { bg: string; text: string; glow: string } {
  if (badge === 'STRONG')   return { bg: 'rgba(34,197,94,0.14)',  text: '#22c55e', glow: 'rgba(34,197,94,0.35)' };
  if (badge === 'SOLID')    return { bg: 'rgba(34,211,238,0.14)', text: '#22d3ee', glow: 'rgba(34,211,238,0.35)' };
  return                           { bg: 'rgba(251,191,36,0.12)', text: '#fbbf24', glow: 'rgba(251,191,36,0.3)' };
}

function badgeLabel(badge: string, lang: string): string {
  if (badge === 'STRONG')  return mc('badgeStrong', lang);
  if (badge === 'SOLID')   return mc('badgeSolid', lang);
  return mc('badgeAvg', lang);
}

// ── Confidence dial (SVG) ─────────────────────────────────────────────
function ConfDial({ value, color }: { value: number; color: string }) {
  const R = 52;
  const cx = 70; const cy = 70;
  const circ = 2 * Math.PI * R;
  const arc = (value / 100) * circ * 0.75;
  const offset = circ * 0.125;

  return (
    <svg width="140" height="140" viewBox="0 0 140 140" className="mc-dial-svg">
      {/* track */}
      <circle
        cx={cx} cy={cy} r={R}
        fill="none"
        stroke="rgba(255,255,255,0.07)"
        strokeWidth="8"
        strokeDasharray={`${circ * 0.75} ${circ * 0.25}`}
        strokeDashoffset={-offset}
        strokeLinecap="round"
        transform="rotate(135, 70, 70)"
      />
      {/* fill */}
      <motion.circle
        cx={cx} cy={cy} r={R}
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeDasharray={`${arc} ${circ - arc}`}
        strokeDashoffset={-offset}
        strokeLinecap="round"
        transform="rotate(135, 70, 70)"
        style={{ filter: `drop-shadow(0 0 8px ${color})` }}
        initial={{ strokeDasharray: `0 ${circ}` }}
        animate={{ strokeDasharray: `${arc} ${circ - arc}` }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      />
      {/* glow ring */}
      <circle
        cx={cx} cy={cy} r={R}
        fill="none"
        stroke={color}
        strokeWidth="16"
        strokeDasharray={`${arc} ${circ - arc}`}
        strokeDashoffset={-offset}
        strokeLinecap="round"
        transform="rotate(135, 70, 70)"
        opacity={0.06}
      />
    </svg>
  );
}

// ── Animated counter ──────────────────────────────────────────────────
function AnimCounter({ to, duration = 1.1 }: { to: number; duration?: number }) {
  const [val, setVal] = useState(0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const from = 0;
    function step(now: number) {
      const p = Math.min((now - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(from + (to - from) * eased));
      if (p < 1) frameRef.current = requestAnimationFrame(step);
    }
    frameRef.current = requestAnimationFrame(step);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [to, duration]);

  return <>{val}</>;
}

// ── Slider bar ────────────────────────────────────────────────────────
function McBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="mc-bar-row">
      <div className="mc-bar-label">{label}</div>
      <div className="mc-bar-track">
        <motion.div
          className="mc-bar-fill"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
        />
      </div>
      <div className="mc-bar-val" style={{ color }}>{value}</div>
    </div>
  );
}

// ── Line pill ─────────────────────────────────────────────────────────
function LinePill({ text, level }: { text: string; level: number }) {
  const colors = ['#60a5fa','#a78bfa','#f97316','#ef4444'];
  const c = colors[Math.min(level, 3)];
  return (
    <span className="mc-line-pill" style={{ background: `${c}18`, border: `1px solid ${c}40`, color: c }}>
      {text}
    </span>
  );
}

// ── Prob bar ──────────────────────────────────────────────────────────
function ProbBar({ label, pct, color, delay = 0 }: { label: string; pct: number; color: string; delay?: number }) {
  return (
    <div className="mc-prob-row">
      <div className="mc-prob-label">{label}</div>
      <div className="mc-prob-track">
        <motion.div
          className="mc-prob-fill"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.3 + delay }}
        />
      </div>
      <div className="mc-prob-pct" style={{ color }}>{pct}%</div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────
export default function MatchCoach() {
  const { lang, t } = useLang();
  const [loc, setLoc] = useState<Loc>('home');
  const [str, setStr] = useState<Str>('equal');
  const [oppKey, setOppKey] = useState('433ab');
  const [activeOpt, setActiveOpt] = useState<'A' | 'B'>('A');

  const entry = TD.find(e => e.location === loc && e.strength === str && e.oppKey === oppKey);
  const hasResult = !!entry;

  const probs  = entry ? calcProbs(entry.sr, loc, str) : { win: 0, draw: 0, loss: 0 };
  const conf   = entry ? calcConfidence(probs.win, entry.sr) : 0;
  const bdg    = entry ? badgeColor(entry.badge) : { bg: '', text: '#fff', glow: '' };
  const noteKey = `${loc}-${str}`;
  const note   = NOTES[noteKey]?.[lang] ?? NOTES[noteKey]?.en ?? '';

  const dispP = activeOpt === 'B' && entry?.optionB ? entry.optionB.p : (entry?.p ?? 0);
  const dispS = activeOpt === 'B' && entry?.optionB ? entry.optionB.s : (entry?.s ?? 0);
  const dispT = activeOpt === 'B' && entry?.optionB ? entry.optionB.t : (entry?.t ?? 0);

  const confColor = conf >= 80 ? '#22c55e' : conf >= 65 ? '#22d3ee' : '#fbbf24';

  function pitchVal(val: string): string {
    switch (val) {
      case 'Attack only':         return t('pitch.attackOnly');
      case 'Mixed':               return t('pitch.mixed') || 'Mixed';
      case 'Hold up play':        return t('pitch.holdUpPlay') || 'Hold up play';
      case 'Protect the defence': return t('pitch.protectDefense');
      case 'Stay in position':    return t('pitch.stayBack');
      case 'Box to box':          return t('pitch.boxToBox') || 'Box to box';
      case 'Defend deep':         return t('pitch.defendDeep');
      case 'Normal':              return t('pitch.normal') || 'Normal';
      case 'High line':           return t('pitch.highLine') || 'High line';
      case 'Zone marking':        return t('pitch.zoneMarking');
      case 'Man marking':         return t('pitch.manMarking');
      default:                    return val;
    }
  }

  // Filter opps that have data for current loc+str
  const visOpp = OPP_LIST.filter(o => TD.some(e => e.location === loc && e.strength === str && e.oppKey === o.key));

  // When loc/str changes, ensure selected opp is valid
  useEffect(() => {
    const valid = TD.some(e => e.location === loc && e.strength === str && e.oppKey === oppKey);
    if (!valid) {
      const first = TD.find(e => e.location === loc && e.strength === str);
      if (first) setOppKey(first.oppKey);
    }
    setActiveOpt('A');
  }, [loc, str]);

  const resultKey = `${loc}-${str}-${oppKey}-${activeOpt}`;

  return (
    <section className="mc-section" id="match-coach">
      <div className="mc-glow mc-glow-l" />
      <div className="mc-glow mc-glow-r" />

      <div className="mc-inner">
        {/* ── Header ── */}
        <div className="mc-header">
          <span className="mc-badge-pill">
            <span className="mc-badge-dot" />
            {mc('badge', lang)}
          </span>
          <h2 className="mc-title">{mc('title', lang)}</h2>
          <p className="mc-subtitle">{mc('subtitle', lang)}</p>
        </div>

        {/* ── Selector Grid ── */}
        <div className="mc-selector-grid">
          {/* Location */}
          <div className="mc-sel-card">
            <div className="mc-sel-label">{mc('locLabel', lang)}</div>
            <div className="mc-toggle-row">
              {(['home', 'away'] as Loc[]).map(l => (
                <button
                  key={l}
                  className={`mc-toggle-btn${loc === l ? ' active' : ''}`}
                  onClick={() => setLoc(l)}
                  style={loc === l ? { background: 'rgba(34,211,238,0.15)', color: '#22d3ee', borderColor: 'rgba(34,211,238,0.4)' } : {}}
                >
                  <span className="mc-toggle-icon">{l === 'home' ? '🏟️' : '✈️'}</span>
                  {mc(l, lang)}
                </button>
              ))}
            </div>
          </div>

          {/* Strength */}
          <div className="mc-sel-card">
            <div className="mc-sel-label">{mc('strLabel', lang)}</div>
            <div className="mc-str-row">
              {([['stronger','🔥'],['equal','⚖️'],['weaker','📉']] as [Str, string][]).map(([s, icon]) => (
                <button
                  key={s}
                  className={`mc-str-btn${str === s ? ' active' : ''}`}
                  onClick={() => setStr(s)}
                  style={str === s ? {
                    background: s === 'stronger' ? 'rgba(34,197,94,0.15)' : s === 'equal' ? 'rgba(34,211,238,0.15)' : 'rgba(239,68,68,0.15)',
                    color: s === 'stronger' ? '#22c55e' : s === 'equal' ? '#22d3ee' : '#ef4444',
                    borderColor: s === 'stronger' ? 'rgba(34,197,94,0.4)' : s === 'equal' ? 'rgba(34,211,238,0.4)' : 'rgba(239,68,68,0.4)',
                  } : {}}
                >
                  <span>{icon}</span> {mc(s, lang)}
                </button>
              ))}
            </div>
          </div>

          {/* Opponent */}
          <div className="mc-sel-card mc-opp-card">
            <div className="mc-sel-label">{mc('oppLabel', lang)}</div>
            <div className="mc-opp-grid">
              {visOpp.map(o => (
                <button
                  key={o.key}
                  className={`mc-opp-btn${oppKey === o.key ? ' active' : ''}`}
                  onClick={() => { setOppKey(o.key); setActiveOpt('A'); }}
                  style={oppKey === o.key ? { background: 'rgba(34,211,238,0.13)', borderColor: 'rgba(34,211,238,0.38)', color: '#22d3ee' } : {}}
                >
                  <span className="mc-opp-icon">{o.icon}</span>
                  <span className="mc-opp-lbl">{o.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Result Panel ── */}
        <AnimatePresence mode="wait">
          {!hasResult ? (
            <motion.div
              key="hint"
              className="mc-hint"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              <span className="mc-hint-icon">📊</span>
              <span>{mc('selectHint', lang)}</span>
            </motion.div>
          ) : (
            <motion.div
              key={resultKey}
              className="mc-result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* ── Row 1: Confidence + Probability ── */}
              <div className="mc-row-top">
                {/* Confidence Dial */}
                <div className="mc-conf-block">
                  <div className="mc-dial-wrap">
                    <ConfDial value={conf} color={confColor} />
                    <div className="mc-dial-center">
                      <div className="mc-dial-num" style={{ color: confColor }}>
                        <AnimCounter key={resultKey + '-conf'} to={conf} />
                      </div>
                      <div className="mc-dial-sub">{mc('confidence', lang)}</div>
                    </div>
                  </div>
                  <div className="mc-badge-chip" style={{ background: bdg.bg, color: bdg.text, boxShadow: `0 0 14px ${bdg.glow}` }}>
                    {badgeLabel(entry.badge, lang)}
                  </div>
                </div>

                {/* W/D/L Probability */}
                <div className="mc-prob-block">
                  <div className="mc-block-label">{lang === 'tr' ? 'Maç Senaryosu' : 'Match Scenario'}</div>
                  <ProbBar label={mc('winLabel', lang)}  pct={probs.win}  color="#22c55e" delay={0} />
                  <ProbBar label={mc('drawLabel', lang)} pct={probs.draw} color="#22d3ee" delay={0.08} />
                  <ProbBar label={mc('lossLabel', lang)} pct={probs.loss} color="#ef4444" delay={0.16} />
                </div>
              </div>

              {/* ── Row 2: Counter Formation + Game Plan ── */}
              <div className="mc-counter-row">
                <div className="mc-counter-left">
                  <div className="mc-block-label">{mc('counter', lang)}</div>
                  <div className="mc-counter-fm">{entry.fm.replace(/-/g, '–')}</div>
                  <div className="mc-counter-opp">{entry.counter}</div>
                </div>
                <div className="mc-gp-block">
                  <div className="mc-gp-icon">{entry.gp.icon}</div>
                  <div className="mc-gp-text">{entry.gp.text}</div>
                  <div className="mc-block-label" style={{ marginTop: 4 }}>{mc('gamePlan', lang)}</div>
                </div>
              </div>

              {/* ── Row 3: Option A/B + Sliders ── */}
              <div className="mc-sliders-block">
                <div className="mc-sliders-header">
                  <div className="mc-block-label">{mc('sliders', lang)}</div>
                  {entry.optionB && (
                    <div className="mc-opt-toggle">
                      {(['A','B'] as const).map(opt => (
                        <button
                          key={opt}
                          className={`mc-opt-btn${activeOpt === opt ? ' active' : ''}`}
                          onClick={() => setActiveOpt(opt)}
                          style={activeOpt === opt ? {
                            background: opt === 'A' ? 'rgba(255,215,0,0.18)' : 'rgba(34,211,238,0.18)',
                            color: opt === 'A' ? '#ffd700' : '#22d3ee',
                            borderColor: opt === 'A' ? 'rgba(255,215,0,0.4)' : 'rgba(34,211,238,0.4)',
                          } : {}}
                        >
                          {mc(opt === 'A' ? 'optionA' : 'optionB', lang)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="mc-bars-grid">
                  <McBar key={`p-${resultKey}`} label={mc('pressure', lang)} value={dispP} color="#22d3ee" />
                  <McBar key={`s-${resultKey}`} label={mc('style', lang)}    value={dispS} color="#a78bfa" />
                  <McBar key={`t-${resultKey}`} label={mc('tempo', lang)}    value={dispT} color="#f97316" />
                </div>
              </div>

              {/* ── Row 4: Line Tactics ── */}
              <div className="mc-line-row">
                <div className="mc-line-group">
                  <div className="mc-line-label">{mc('forwards', lang)}</div>
                  <LinePill text={pitchVal(entry.f)} level={entry.fL} />
                </div>
                <div className="mc-line-group">
                  <div className="mc-line-label">{mc('midfield', lang)}</div>
                  <LinePill text={pitchVal(entry.m)} level={entry.mL} />
                </div>
                <div className="mc-line-group">
                  <div className="mc-line-label">{mc('defence', lang)}</div>
                  <LinePill text={pitchVal(entry.d)} level={entry.dL} />
                </div>
                <div className="mc-line-group">
                  <div className="mc-line-label">{mc('marking', lang)}</div>
                  <LinePill text={entry.mrk === 'Zone marking' ? pitchVal(entry.mrk) : pitchVal(entry.mrk)} level={entry.mrkOn ? 1 : 0} />
                </div>
                {entry.offOn && (
                  <div className="mc-line-group">
                    <div className="mc-line-label">{mc('offside', lang)}</div>
                    <LinePill text={entry.off} level={2} />
                  </div>
                )}
              </div>

              {/* ── Row 5: Coach Note ── */}
              <div className="mc-note-block">
                <div className="mc-note-header">
                  <span className="mc-note-icon">🎙️</span>
                  <span className="mc-note-title">{mc('coachNote', lang)}</span>
                </div>
                <p className="mc-note-text">{note}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
