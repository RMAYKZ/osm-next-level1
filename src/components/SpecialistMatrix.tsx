import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLang } from '../contexts/LanguageContext';
import './SpecialistMatrix.css';

type Pos = 'FWD' | 'MID' | 'DEF' | 'GK' | '';

interface PlayerInput {
  name: string;
  age: string;
  overall: string;
  attack: string;
  defense: string;
  position: Pos;
}

interface ParsedPlayer {
  name: string;
  age: number;
  overall: number;
  attack: number;
  defense: number;
  position: Pos;
}

const EMPTY_PLAYER = (): PlayerInput => ({ name: '', age: '', overall: '', attack: '', defense: '', position: '' });

const SM18N: Record<string, Record<string, string>> = {
  badge:     { tr: 'Motor Analizi', en: 'Engine Analysis', hu: 'Motor Elemzés', ar: 'تحليل المحرك', pt: 'Análise do Motor' },
  title:     { tr: 'Uzman Seçim Matrisi', en: 'Specialist Selection Matrix', hu: 'Szakértő Kiválasztási Mátrix', ar: 'مصفوفة اختيار المتخصص', pt: 'Matriz de Seleção de Especialistas' },
  sub:       { tr: '4 oyuncuya ait verileri gir — motor, oyun mekaniğine göre optimal rolleri hesaplar.', en: 'Enter up to 4 player stats — the engine calculates optimal specialist roles based on game mechanics.', hu: 'Adj meg legfeljebb 4 játékos adatot — a motor kiszámítja az optimális szerepeket.', ar: 'أدخل بيانات ما يصل إلى 4 لاعبين — يحسب المحرك الأدوار المثلى.', pt: 'Insira os dados de até 4 jogadores — o motor calcula os papéis ideais.' },
  playerLbl: { tr: 'Oyuncu', en: 'Player', hu: 'Játékos', ar: 'لاعب', pt: 'Jogador' },
  nameLbl:   { tr: 'İsim', en: 'Name', hu: 'Név', ar: 'الاسم', pt: 'Nome' },
  ageLbl:    { tr: 'Yaş', en: 'Age', hu: 'Kor', ar: 'العمر', pt: 'Idade' },
  ovrLbl:    { tr: 'Güç', en: 'OVR', hu: 'Erő', ar: 'القوة', pt: 'Força' },
  atkLbl:    { tr: 'Hücum', en: 'ATK', hu: 'Táma', ar: 'الهجوم', pt: 'ATA' },
  defLbl:    { tr: 'Savunma', en: 'DEF', hu: 'Véd', ar: 'الدفاع', pt: 'DEF' },
  posHint:   { tr: 'Pozisyon seç', en: 'Select position', hu: 'Pozíció kiválasztása', ar: 'اختر المركز', pt: 'Selecione a posição' },
  resultHdr: { tr: 'Motor-Optimize Uzmanlar', en: 'Engine-Optimized Specialists', hu: 'Motor-Optimalizált Szakértők', ar: 'متخصصون محسّنون بالمحرك', pt: 'Especialistas Otimizados pelo Motor' },
  captain:   { tr: 'KAPTAN', en: 'CAPTAIN', hu: 'KAPITÁNY', ar: 'القائد', pt: 'CAPITÃO' },
  penalty:   { tr: 'PENALTI ATICI', en: 'PENALTY TAKER', hu: 'TIZENEGYESRÚGÓ', ar: 'ضارب الجزاء', pt: 'COBRADOR DE PÊNALTI' },
  freekick:  { tr: 'SERBEST VURUŞ', en: 'FREE KICK', hu: 'SZABADRÚGÁS', ar: 'ركلة حرة', pt: 'FALTA' },
  playmaker: { tr: 'OYUN KURUCU', en: 'PLAYMAKER', hu: 'JÁTÉKSZERVEZŐ', ar: 'صانع اللعب', pt: 'ARMADOR' },
  capLogic:  { tr: 'En yaşlı · Eşitlikte en yüksek güç', en: 'Highest age · Tie-break: highest OVR', hu: 'Legidősebb · Döntetlennél: legmagasabb erő', ar: 'الأكبر سناً · عند التعادل: أعلى قوة', pt: 'Maior idade · Empate: maior poder' },
  penLogic:  { tr: 'En yüksek hücum gücüne sahip forvet', en: 'Forward with highest Attack Power', hu: 'Legmagasabb támadóerőjű csatár', ar: 'مهاجم بأعلى قوة هجوم', pt: 'Atacante com maior poder de ataque' },
  fkLogic:   { tr: 'Dengeli genel güce sahip en iyi forvet', en: 'Forward prioritizing balanced OVR + ATK', hu: 'Kiegyensúlyozott statisztikájú legjobb csatár', ar: 'مهاجم يجمع بين الهجوم والتوازن', pt: 'Atacante com melhor ATK + equilíbrio geral' },
  pmLogic:   { tr: 'En düşük savunma / en yüksek hücum orta saha', en: 'Midfielder: lowest DEF (pure playmaker) or highest ATK', hu: 'Középpályás: legalacsonyabb védelem / legmagasabb támadás', ar: 'لاعب وسط: أدنى دفاع / أعلى هجوم', pt: 'Meio-campo: menor DEF (criador puro) ou maior ATK' },
  noFwds:    { tr: 'Kadroda forvet yok', en: 'No Forwards in squad', hu: 'Nincs csatár a keretben', ar: 'لا يوجد مهاجم في المجموعة', pt: 'Nenhum atacante no elenco' },
  noMids:    { tr: 'Kadroda orta saha yok', en: 'No Midfielders in squad', hu: 'Nincs középpályás a keretben', ar: 'لا يوجد لاعب وسط في المجموعة', pt: 'Nenhum meio-campista no elenco' },
  fillFirst:  { tr: 'Sonuçları görmek için en az 1 oyuncu doldur', en: 'Fill at least 1 complete player to see results', hu: 'Tölts ki legalább 1 játékost az eredményekhez', ar: 'أضف لاعباً كاملاً واحداً على الأقل لرؤية النتائج', pt: 'Preencha pelo menos 1 jogador completo para ver resultados' },
  resetBtn:  { tr: 'Sıfırla', en: 'Reset', hu: 'Visszaállítás', ar: 'إعادة ضبط', pt: 'Redefinir' },
  ageShort:  { tr: 'Yaş', en: 'Age', hu: 'Kor', ar: 'عمر', pt: 'Idade' },
};

function sm(key: string, lang: string): string {
  return SM18N[key]?.[lang] ?? SM18N[key]?.en ?? key;
}

function parsePlayer(p: PlayerInput): ParsedPlayer | null {
  if (!p.name.trim() || !p.age || !p.overall || !p.attack || !p.defense || !p.position) return null;
  return {
    name: p.name.trim(),
    age: parseInt(p.age) || 0,
    overall: parseInt(p.overall) || 0,
    attack: parseInt(p.attack) || 0,
    defense: parseInt(p.defense) || 0,
    position: p.position,
  };
}

function calcSpecialists(inputs: PlayerInput[]) {
  const valid = inputs.map(parsePlayer).filter(Boolean) as ParsedPlayer[];
  if (!valid.length) return null;

  const captain = [...valid].sort((a, b) => b.age - a.age || b.overall - a.overall)[0];

  const fwds = valid.filter(p => p.position === 'FWD');
  const penalty = fwds.length
    ? [...fwds].sort((a, b) => b.attack - a.attack)[0]
    : null;

  const freekick = fwds.length
    ? [...fwds].sort((a, b) => (b.attack * 0.6 + b.overall * 0.4) - (a.attack * 0.6 + a.overall * 0.4))[0]
    : null;

  const mids = valid.filter(p => p.position === 'MID');
  const playmaker = mids.length
    ? [...mids].sort((a, b) => (b.attack - b.defense) - (a.attack - a.defense) || b.overall - a.overall)[0]
    : null;

  return { captain, penalty, freekick, playmaker, hasFwds: fwds.length > 0, hasMids: mids.length > 0 };
}

const POS_LABELS: Record<Pos, string> = { FWD: 'FWD', MID: 'MID', DEF: 'DEF', GK: 'GK', '': '' };
const POS_COLOR: Record<string, string> = {
  FWD: '#ff4757', MID: '#00e5ff', DEF: '#34d399', GK: '#ffd700',
};
const ROLE_ICONS: Record<string, string> = {
  captain: '⭐', penalty: '⚽', freekick: '🎯', playmaker: '🧠',
};

function StatPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <span className="sm-stat-pill" style={{ color, borderColor: `${color}33`, background: `${color}0d` }}>
      {label} {value}
    </span>
  );
}

function RoleRow({
  roleKey, roleLabel, logic, player, noPlayerMsg, isLast, lang,
}: {
  roleKey: string; roleLabel: string; logic: string; player: ParsedPlayer | null;
  noPlayerMsg: string; isLast?: boolean; lang: string;
}) {
  return (
    <motion.div
      className={`sm-role-row${isLast ? ' last' : ''}`}
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="sm-role-left">
        <span className="sm-role-icon">{ROLE_ICONS[roleKey]}</span>
        <div>
          <div className="sm-role-label">{roleLabel}</div>
          <div className="sm-role-logic">{logic}</div>
        </div>
      </div>
      <div className="sm-role-right">
        {player ? (
          <>
            <span className="sm-role-name">{player.name}</span>
            <div className="sm-role-stats">
              {roleKey === 'captain' && <>
                <StatPill label={sm('ageShort', lang)} value={player.age} color="#ffd700" />
                <StatPill label="OVR" value={player.overall} color="#00e5ff" />
              </>}
              {roleKey === 'penalty' && <>
                <StatPill label="ATK" value={player.attack} color="#ff4757" />
                <StatPill label="OVR" value={player.overall} color="#00e5ff" />
              </>}
              {roleKey === 'freekick' && <>
                <StatPill label="ATK" value={player.attack} color="#ff4757" />
                <StatPill label="OVR" value={player.overall} color="#a78bfa" />
              </>}
              {roleKey === 'playmaker' && <>
                <StatPill label="ATK" value={player.attack} color="#00e5ff" />
                <StatPill label="DEF" value={player.defense} color="rgba(255,255,255,0.35)" />
              </>}
            </div>
          </>
        ) : (
          <span className="sm-role-empty">{noPlayerMsg}</span>
        )}
      </div>
    </motion.div>
  );
}

function PlayerCard({
  index, player, onChange, lang,
}: {
  index: number; player: PlayerInput;
  onChange: (field: keyof PlayerInput, value: string) => void;
  lang: string;
}) {
  const posColor = player.position ? POS_COLOR[player.position] : 'rgba(255,255,255,0.15)';
  const isComplete = !!(player.name && player.age && player.overall && player.attack && player.defense && player.position);

  return (
    <div className={`sm-player-card${isComplete ? ' complete' : ''}`} style={{ '--pos-color': posColor } as React.CSSProperties}>
      <div className="sm-player-head">
        <span className="sm-player-num">
          {sm('playerLbl', lang)} {index + 1}
          {isComplete && <span className="sm-complete-dot" />}
        </span>
        <div className="sm-pos-group">
          {(['FWD', 'MID', 'DEF', 'GK'] as Pos[]).map(pos => (
            <button
              key={pos}
              className={`sm-pos-btn${player.position === pos ? ' active' : ''}`}
              style={player.position === pos ? { background: `${POS_COLOR[pos]}18`, border: `1px solid ${POS_COLOR[pos]}55`, color: POS_COLOR[pos] } : {}}
              onClick={() => onChange('position', player.position === pos ? '' : pos)}
            >
              {POS_LABELS[pos]}
            </button>
          ))}
        </div>
      </div>

      <input
        className="sm-name-input"
        placeholder={sm('nameLbl', lang)}
        value={player.name}
        onChange={e => onChange('name', e.target.value)}
        maxLength={30}
      />

      <div className="sm-stat-row">
        {(['age', 'overall', 'attack', 'defense'] as const).map((field) => (
          <div key={field} className="sm-stat-field">
            <label className="sm-stat-label">
              {sm(field === 'age' ? 'ageLbl' : field === 'overall' ? 'ovrLbl' : field === 'attack' ? 'atkLbl' : 'defLbl', lang)}
            </label>
            <input
              className="sm-stat-input"
              type="number"
              min={field === 'age' ? 16 : 1}
              max={field === 'age' ? 50 : 100}
              placeholder="—"
              value={(player as unknown as Record<string, string>)[field]}
              onChange={e => onChange(field, e.target.value)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SpecialistMatrix() {
  const { lang } = useLang();
  const [players, setPlayers] = useState<PlayerInput[]>([EMPTY_PLAYER(), EMPTY_PLAYER(), EMPTY_PLAYER(), EMPTY_PLAYER()]);

  const update = (i: number, field: keyof PlayerInput, value: string) => {
    setPlayers(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p));
  };

  const reset = () => setPlayers([EMPTY_PLAYER(), EMPTY_PLAYER(), EMPTY_PLAYER(), EMPTY_PLAYER()]);

  const result = useMemo(() => calcSpecialists(players), [players]);

  return (
    <section id="specialist-matrix" className="sm-section">
      {/* Ambient glow */}
      <div aria-hidden className="sm-glow sm-glow-tl" />
      <div aria-hidden className="sm-glow sm-glow-br" />

      <motion.div
        className="sm-inner"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Header */}
        <div className="sm-header">
          <div className="sm-badge">
            <span className="sm-badge-dot" />
            {sm('badge', lang)}
          </div>
          <h2 className="sm-title">{sm('title', lang)}</h2>
          <p className="sm-subtitle">{sm('sub', lang)}</p>
        </div>

        {/* Player input grid */}
        <div className="sm-grid">
          {players.map((p, i) => (
            <PlayerCard key={i} index={i} player={p} onChange={(f, v) => update(i, f, v)} lang={lang} />
          ))}
        </div>

        <div className="sm-actions">
          <button className="sm-reset-btn" onClick={reset}>{sm('resetBtn', lang)}</button>
        </div>

        {/* Result card */}
        <AnimatePresence mode="wait">
          {result ? (
            <motion.div
              key="result"
              className="sm-result-card"
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Shimmer */}
              <motion.div
                className="sm-result-shimmer"
                animate={{ x: ['-140%', '260%'] }}
                transition={{ repeat: Infinity, repeatDelay: 5, duration: 1, ease: [0.16, 1, 0.3, 1] }}
              />

              <div className="sm-result-header">
                <span className="sm-result-icon">⚙️</span>
                <div>
                  <div className="sm-result-title">{sm('resultHdr', lang)}</div>
                  <div className="sm-result-sub">OSM Engine v26/27</div>
                </div>
              </div>

              <div className="sm-roles">
                <RoleRow
                  roleKey="captain" lang={lang}
                  roleLabel={sm('captain', lang)}
                  logic={sm('capLogic', lang)}
                  player={result.captain ?? null}
                  noPlayerMsg={sm('fillFirst', lang)}
                />
                <RoleRow
                  roleKey="penalty" lang={lang}
                  roleLabel={sm('penalty', lang)}
                  logic={sm('penLogic', lang)}
                  player={result.penalty ?? null}
                  noPlayerMsg={sm('noFwds', lang)}
                />
                <RoleRow
                  roleKey="freekick" lang={lang}
                  roleLabel={sm('freekick', lang)}
                  logic={sm('fkLogic', lang)}
                  player={result.freekick ?? null}
                  noPlayerMsg={sm('noFwds', lang)}
                />
                <RoleRow
                  roleKey="playmaker" lang={lang}
                  roleLabel={sm('playmaker', lang)}
                  logic={sm('pmLogic', lang)}
                  player={result.playmaker ?? null}
                  noPlayerMsg={sm('noMids', lang)}
                  isLast
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              className="sm-result-empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <span className="sm-result-empty-icon">📋</span>
              <span>{sm('fillFirst', lang)}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
