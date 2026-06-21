export interface TacticEntry {
  icon: string; fm: string; label: string; counter: string;
  gp: { icon: string; text: string };
  p: number; s: number; t: number; sr: number; badge: string;
  f: string; fL: number; m: string; mL: number; d: string; dL: number;
  mrk: string; mrkOn: boolean; off: string; offOn: boolean;
  markChar: string; offChar: string; note: string;
  optionB?: { p: number; s: number; t: number };
  location: 'home' | 'away';
  strength: 'stronger' | 'equal' | 'weaker';
  oppKey: string; oppLabel: string;
}

export const OPP_LIST = [
  {key:'433ab',  label:'4-3-3A/B Wing Play',    icon:'⚡'},
  {key:'442ab',  label:'4-4-2A/B Passing',       icon:'⚽'},
  {key:'4231',   label:'4-2-3-1 Shoot on Sight', icon:'🎯'},
  {key:'451',    label:'4-5-1 Shoot on Sight',   icon:'🛡'},
  {key:'523ab',  label:'5-2-3A/B Counter',       icon:'⚔️'},
  {key:'532',    label:'5-3-2 Counter',           icon:'🏰'},
  {key:'5311',   label:'5-3-1-1 Counter',         icon:'👁'},
  {key:'541ab',  label:'5-4-1A/B Shoot on Sight', icon:'🔒'},
  {key:'631ab',  label:'6-3-1A/B Counter',        icon:'🔐'},
  {key:'442b',   label:'4-4-2B Passing',          icon:'💠'},
];

export const TD: TacticEntry[] = [
  // ── HOME + STRONGER ───────────────────────────────────────────────
  {icon:'🔥',fm:'4-3-3-A',label:'4-3-3A/B Wing Play',counter:'4-3-3A/B Wing Play',
   gp:{icon:'🏃',text:'Wing Play'},p:65,s:70,t:75,sr:95,badge:'STRONG',
   f:'Attack only',fL:2,m:'Stay in position',mL:1,d:'Defend deep',dL:0,
   mrk:'Zone marking',mrkOn:true,off:'No',offOn:false,markChar:'🧍',offChar:'🚩',
   note:'Ev + Güçlüyüz: Kanatlarla karşılık ver — Baskı 65/Stil 70/Tempo 75',
   optionB:{p:69,s:66,t:72},
   location:'home',strength:'stronger',oppKey:'433ab',oppLabel:'4-3-3A/B Wing Play'},

  {icon:'🔥',fm:'4-3-3-A',label:'4-4-2A/B Passing',counter:'4-3-3A/B Wing Play',
   gp:{icon:'🏃',text:'Wing Play'},p:66,s:60,t:76,sr:90,badge:'STRONG',
   f:'Attack only',fL:2,m:'Stay in position',mL:1,d:'Defend deep',dL:0,
   mrk:'Zone marking',mrkOn:true,off:'No',offOn:false,markChar:'🧍',offChar:'🚩',
   note:'Ev + Güçlüyüz: 4-3-3 kanatlarla ez — Baskı 66/Stil 60/Tempo 76',
   optionB:{p:69,s:64,t:73},
   location:'home',strength:'stronger',oppKey:'442ab',oppLabel:'4-4-2A/B Passing'},

  {icon:'🔥',fm:'4-3-3-B',label:'4-2-3-1 Shoot on Sight',counter:'4-3-3B Wing Play',
   gp:{icon:'🏃',text:'Wing Play'},p:69,s:69,t:79,sr:88,badge:'STRONG',
   f:'Attack only',fL:2,m:'Protect the defence',mL:0,d:'Defend deep',dL:0,
   mrk:'Zone marking',mrkOn:true,off:'No',offOn:false,markChar:'🧍',offChar:'🚩',
   note:'Ev + Güçlüyüz: 4-3-3B ile ez — Baskı 69/Stil 69/Tempo 79',
   optionB:{p:65,s:72,t:76},
   location:'home',strength:'stronger',oppKey:'4231',oppLabel:'4-2-3-1 Shoot on Sight'},

  {icon:'🔥',fm:'4-3-3-A',label:'4-5-1 Shoot on Sight',counter:'4-3-3A/B Wing Play',
   gp:{icon:'🏃',text:'Wing Play'},p:66,s:61,t:76,sr:88,badge:'STRONG',
   f:'Attack only',fL:2,m:'Protect the defence',mL:0,d:'Defend deep',dL:0,
   mrk:'Zone marking',mrkOn:true,off:'No',offOn:false,markChar:'🧍',offChar:'🚩',
   note:'Ev + Güçlüyüz: 4-3-3 ile ez — Baskı 66/Stil 61/Tempo 76',
   optionB:{p:69,s:58,t:73},
   location:'home',strength:'stronger',oppKey:'451',oppLabel:'4-5-1 Shoot on Sight'},

  {icon:'🔥',fm:'4-3-3-A',label:'5-2-3A/B Counter',counter:'4-3-3A/B Wing Play',
   gp:{icon:'🏃',text:'Wing Play'},p:55,s:70,t:65,sr:92,badge:'STRONG',
   f:'Attack only',fL:2,m:'Stay in position',mL:1,d:'Defend deep',dL:0,
   mrk:'Zone marking',mrkOn:true,off:'No',offOn:false,markChar:'🧍',offChar:'🚩',
   note:'Ev + Güçlüyüz: 4-3-3 kanatlarla ez — Baskı 55/Stil 70/Tempo 65',
   optionB:{p:59,s:67,t:68},
   location:'home',strength:'stronger',oppKey:'523ab',oppLabel:'5-2-3A/B Counter'},

  {icon:'🔥',fm:'4-3-3-A',label:'5-3-2 Counter',counter:'4-3-3A Wing Play',
   gp:{icon:'🏃',text:'Wing Play'},p:65,s:60,t:70,sr:90,badge:'STRONG',
   f:'Attack only',fL:2,m:'Stay in position',mL:1,d:'Defend deep',dL:0,
   mrk:'Zone marking',mrkOn:true,off:'No',offOn:false,markChar:'🧍',offChar:'🚩',
   note:'Ev + Güçlüyüz: 4-3-3A kanatlarla — Baskı 65/Stil 60/Tempo 70',
   optionB:{p:69,s:57,t:73},
   location:'home',strength:'stronger',oppKey:'532',oppLabel:'5-3-2 Counter'},

  {icon:'🔥',fm:'4-3-3-A',label:'5-3-1-1 Counter',counter:'4-3-3A/B Wing Play',
   gp:{icon:'🏃',text:'Wing Play'},p:75,s:60,t:60,sr:90,badge:'STRONG',
   f:'Attack only',fL:2,m:'Stay in position',mL:1,d:'Defend deep',dL:0,
   mrk:'Zone marking',mrkOn:true,off:'No',offOn:false,markChar:'🧍',offChar:'🚩',
   note:'Ev + Güçlüyüz: 4-3-3 kanatlarla — Baskı 75/Stil 60/Tempo 60',
   optionB:{p:71,s:63,t:63},
   location:'home',strength:'stronger',oppKey:'5311',oppLabel:'5-3-1-1 Counter'},

  {icon:'🔥',fm:'4-3-3-A',label:'5-4-1A/B Shoot on Sight',counter:'4-3-3A/B Wing Play',
   gp:{icon:'🏃',text:'Wing Play'},p:72,s:70,t:62,sr:88,badge:'STRONG',
   f:'Attack only',fL:2,m:'Protect the defence',mL:0,d:'Defend deep',dL:0,
   mrk:'Zone marking',mrkOn:true,off:'No',offOn:false,markChar:'🧍',offChar:'🚩',
   note:'Ev + Güçlüyüz: 4-3-3 kanatlarla — Baskı 72/Stil 70/Tempo 62',
   optionB:{p:68,s:73,t:65},
   location:'home',strength:'stronger',oppKey:'541ab',oppLabel:'5-4-1A/B Shoot on Sight'},

  {icon:'🔥',fm:'4-3-3-A',label:'6-3-1A/B Counter',counter:'4-3-3A Wing Play',
   gp:{icon:'🏃',text:'Wing Play'},p:55,s:65,t:70,sr:90,badge:'STRONG',
   f:'Attack only',fL:2,m:'Stay in position',mL:1,d:'Defend deep',dL:0,
   mrk:'Zone marking',mrkOn:true,off:'No',offOn:false,markChar:'🧍',offChar:'🚩',
   note:'Ev + Güçlüyüz: 4-3-3A kanatlarla — Baskı 55/Stil 65/Tempo 70',
   optionB:{p:58,s:62,t:73},
   location:'home',strength:'stronger',oppKey:'631ab',oppLabel:'6-3-1A/B Counter'},

  // ── HOME + EQUAL ──────────────────────────────────────────────────
  {icon:'🔥',fm:'4-3-3-A',label:'4-3-3A/B Wing Play',counter:'4-3-3A Wing Play',
   gp:{icon:'🏃',text:'Wing Play'},p:52,s:60,t:60,sr:78,badge:'SOLID',
   f:'Attack only',fL:2,m:'Protect the defence',mL:0,d:'Defend deep',dL:0,
   mrk:'Zone marking',mrkOn:true,off:'No',offOn:false,markChar:'🧍',offChar:'🚩',
   note:'Ev + Eşitiz: 4-3-3A ile karşılık — Baskı 52/Stil 60/Tempo 60',
   optionB:{p:55,s:57,t:63},
   location:'home',strength:'equal',oppKey:'433ab',oppLabel:'4-3-3A/B Wing Play'},

  {icon:'🔥',fm:'4-3-3-A',label:'4-4-2A/B Passing',counter:'4-3-3A/B Wing Play',
   gp:{icon:'🏃',text:'Wing Play'},p:55,s:60,t:60,sr:72,badge:'SOLID',
   f:'Attack only',fL:2,m:'Protect the defence',mL:0,d:'Defend deep',dL:0,
   mrk:'Zone marking',mrkOn:true,off:'No',offOn:false,markChar:'🧍',offChar:'🚩',
   note:'Ev + Eşitiz: 4-3-3 kanatlarla — Baskı 55/Stil 60/Tempo 60',
   optionB:{p:59,s:57,t:63},
   location:'home',strength:'equal',oppKey:'442ab',oppLabel:'4-4-2A/B Passing'},

  {icon:'🔥',fm:'4-3-3-B',label:'4-2-3-1 Shoot on Sight',counter:'4-3-3B Wing Play',
   gp:{icon:'🏃',text:'Wing Play'},p:65,s:70,t:75,sr:82,badge:'SOLID',
   f:'Attack only',fL:2,m:'Protect the defence',mL:0,d:'Defend deep',dL:0,
   mrk:'Zone marking',mrkOn:true,off:'No',offOn:false,markChar:'🧍',offChar:'🚩',
   note:'Ev + Eşitiz: 4-3-3B ile — Baskı 65/Stil 70/Tempo 75',
   optionB:{p:69,s:66,t:72},
   location:'home',strength:'equal',oppKey:'4231',oppLabel:'4-2-3-1 Shoot on Sight'},

  {icon:'⚡',fm:'5-2-3-A',label:'4-5-1 Shoot on Sight',counter:'5-2-3A Counter Attack',
   gp:{icon:'⚡',text:'Counter Attack'},p:33,s:33,t:63,sr:68,badge:'SOLID',
   f:'Attack only',fL:2,m:'Protect the defence',mL:0,d:'Defend deep',dL:0,
   mrk:'Zone marking',mrkOn:true,off:'No',offOn:false,markChar:'🧍',offChar:'🚩',
   note:'Ev + Eşitiz: 5-2-3A kontra — Baskı 33/Stil 33/Tempo 63',
   optionB:{p:36,s:30,t:66},
   location:'home',strength:'equal',oppKey:'451',oppLabel:'4-5-1 Shoot on Sight'},

  {icon:'⚡',fm:'5-2-3-A',label:'5-2-3A/B Counter',counter:'5-2-3A/B Counter Attack',
   gp:{icon:'⚡',text:'Counter Attack'},p:29,s:29,t:75,sr:70,badge:'SOLID',
   f:'Attack only',fL:2,m:'Protect the defence',mL:0,d:'Defend deep',dL:0,
   mrk:'Zone marking',mrkOn:true,off:'No',offOn:false,markChar:'🧍',offChar:'🚩',
   note:'Ev + Eşitiz: 5-2-3 kontra — Baskı 29/Stil 29/Tempo 75',
   optionB:{p:32,s:32,t:72},
   location:'home',strength:'equal',oppKey:'523ab',oppLabel:'5-2-3A/B Counter'},

  {icon:'🔥',fm:'4-3-3-A',label:'5-3-2 Counter',counter:'4-3-3A Wing Play',
   gp:{icon:'🏃',text:'Wing Play'},p:55,s:60,t:75,sr:75,badge:'SOLID',
   f:'Attack only',fL:2,m:'Protect the defence',mL:0,d:'Defend deep',dL:0,
   mrk:'Zone marking',mrkOn:true,off:'No',offOn:false,markChar:'🧍',offChar:'🚩',
   note:'Ev + Eşitiz: 4-3-3A — Baskı 55/Stil 60/Tempo 75',
   optionB:{p:62,s:62,t:72},
   location:'home',strength:'equal',oppKey:'532',oppLabel:'5-3-2 Counter'},

  {icon:'⚡',fm:'5-2-3-A',label:'5-3-1-1 Counter',counter:'5-2-3A Counter Attack',
   gp:{icon:'⚡',text:'Counter Attack'},p:32,s:21,t:65,sr:68,badge:'SOLID',
   f:'Attack only',fL:2,m:'Protect the defence',mL:0,d:'Defend deep',dL:0,
   mrk:'Zone marking',mrkOn:true,off:'No',offOn:false,markChar:'🧍',offChar:'🚩',
   note:'Ev + Eşitiz: 5-2-3A kontra — Baskı 32/Stil 21/Tempo 65',
   optionB:{p:35,s:18,t:62},
   location:'home',strength:'equal',oppKey:'5311',oppLabel:'5-3-1-1 Counter'},

  {icon:'🔥',fm:'4-3-3-A',label:'5-4-1A/B Shoot on Sight',counter:'4-3-3A/B Wing Play',
   gp:{icon:'🏃',text:'Wing Play'},p:60,s:55,t:65,sr:75,badge:'SOLID',
   f:'Attack only',fL:2,m:'Protect the defence',mL:0,d:'Defend deep',dL:0,
   mrk:'Zone marking',mrkOn:true,off:'No',offOn:false,markChar:'🧍',offChar:'🚩',
   note:'Ev + Eşitiz: 4-3-3 kanatlarla — Baskı 60/Stil 55/Tempo 65',
   optionB:{p:64,s:52,t:68},
   location:'home',strength:'equal',oppKey:'541ab',oppLabel:'5-4-1A/B Shoot on Sight'},

  {icon:'🔥',fm:'4-3-3-A',label:'6-3-1A/B Counter',counter:'4-3-3A Wing Play',
   gp:{icon:'🏃',text:'Wing Play'},p:50,s:65,t:75,sr:75,badge:'SOLID',
   f:'Attack only',fL:2,m:'Stay in position',mL:1,d:'Defend deep',dL:0,
   mrk:'Zone marking',mrkOn:true,off:'No',offOn:false,markChar:'🧍',offChar:'🚩',
   note:'Ev + Eşitiz: 4-3-3A kanatlarla — Baskı 50/Stil 65/Tempo 75',
   optionB:{p:54,s:57,t:72},
   location:'home',strength:'equal',oppKey:'631ab',oppLabel:'6-3-1A/B Counter'},

  // ── HOME + WEAKER ─────────────────────────────────────────────────
  {icon:'⚡',fm:'5-2-3-A',label:'4-3-3A/B Wing Play',counter:'5-2-3A Counter Attack',
   gp:{icon:'⚡',text:'Counter Attack'},p:22,s:32,t:72,sr:58,badge:'AVERAGE',
   f:'Attack only',fL:2,m:'Protect the defence',mL:0,d:'Defend deep',dL:0,
   mrk:'Zone marking',mrkOn:true,off:'No',offOn:false,markChar:'🧍',offChar:'🚩',
   note:'Ev + Zayıfız: Kontra ile karşılık — Baskı 22/Stil 32/Tempo 72',
   optionB:{p:25,s:29,t:75},
   location:'home',strength:'weaker',oppKey:'433ab',oppLabel:'4-3-3A/B Wing Play'},

  {icon:'⚡',fm:'5-2-3-A',label:'4-4-2A/B Passing',counter:'5-2-3A Counter Attack',
   gp:{icon:'⚡',text:'Counter Attack'},p:22,s:21,t:72,sr:60,badge:'AVERAGE',
   f:'Attack only',fL:2,m:'Protect the defence',mL:0,d:'Defend deep',dL:0,
   mrk:'Zone marking',mrkOn:true,off:'No',offOn:false,markChar:'🧍',offChar:'🚩',
   note:'Ev + Zayıfız: 5-2-3A kontra — Baskı 22/Stil 21/Tempo 72',
   optionB:{p:25,s:18,t:69},
   location:'home',strength:'weaker',oppKey:'442ab',oppLabel:'4-4-2A/B Passing'},

  {icon:'⚡',fm:'5-2-3-A',label:'4-2-3-1 Shoot on Sight',counter:'5-2-3A Counter Attack',
   gp:{icon:'⚡',text:'Counter Attack'},p:22,s:8,t:68,sr:60,badge:'AVERAGE',
   f:'Attack only',fL:2,m:'Protect the defence',mL:0,d:'Defend deep',dL:0,
   mrk:'Zone marking',mrkOn:true,off:'No',offOn:false,markChar:'🧍',offChar:'🚩',
   note:'Ev + Zayıfız: 5-2-3A kontra — Baskı 22/Stil 8/Tempo 68',
   optionB:{p:25,s:11,t:65},
   location:'home',strength:'weaker',oppKey:'4231',oppLabel:'4-2-3-1 Shoot on Sight'},

  {icon:'⚡',fm:'5-2-3-A',label:'4-5-1 Shoot on Sight',counter:'5-2-3A Counter Attack',
   gp:{icon:'⚡',text:'Counter Attack'},p:34,s:12,t:62,sr:58,badge:'AVERAGE',
   f:'Attack only',fL:2,m:'Protect the defence',mL:0,d:'Defend deep',dL:0,
   mrk:'Zone marking',mrkOn:true,off:'No',offOn:false,markChar:'🧍',offChar:'🚩',
   note:'Ev + Zayıfız: 5-2-3A kontra — Baskı 34/Stil 12/Tempo 62',
   optionB:{p:37,s:15,t:65},
   location:'home',strength:'weaker',oppKey:'451',oppLabel:'4-5-1 Shoot on Sight'},

  {icon:'⚡',fm:'5-2-3-A',label:'5-2-3A/B Counter',counter:'5-2-3A/B Counter Attack',
   gp:{icon:'⚡',text:'Counter Attack'},p:26,s:32,t:70,sr:60,badge:'AVERAGE',
   f:'Attack only',fL:2,m:'Protect the defence',mL:0,d:'Defend deep',dL:0,
   mrk:'Zone marking',mrkOn:true,off:'No',offOn:false,markChar:'🧍',offChar:'🚩',
   note:'Ev + Zayıfız: 5-2-3 kontra — Baskı 26/Stil 32/Tempo 70',
   optionB:{p:29,s:35,t:67},
   location:'home',strength:'weaker',oppKey:'523ab',oppLabel:'5-2-3A/B Counter'},

  {icon:'⚡',fm:'5-2-3-A',label:'5-3-2 Counter',counter:'5-2-3A Counter Attack',
   gp:{icon:'⚡',text:'Counter Attack'},p:26,s:16,t:70,sr:60,badge:'AVERAGE',
   f:'Attack only',fL:2,m:'Protect the defence',mL:0,d:'Defend deep',dL:0,
   mrk:'Zone marking',mrkOn:true,off:'No',offOn:false,markChar:'🧍',offChar:'🚩',
   note:'Ev + Zayıfız: 5-2-3A kontra — Baskı 26/Stil 16/Tempo 70',
   optionB:{p:29,s:13,t:73},
   location:'home',strength:'weaker',oppKey:'532',oppLabel:'5-3-2 Counter'},

  {icon:'⚡',fm:'5-2-3-A',label:'5-3-1-1 Counter',counter:'5-2-3A Counter Attack',
   gp:{icon:'⚡',text:'Counter Attack'},p:19,s:15,t:65,sr:55,badge:'AVERAGE',
   f:'Attack only',fL:2,m:'Protect the defence',mL:0,d:'Defend deep',dL:0,
   mrk:'Zone marking',mrkOn:true,off:'No',offOn:false,markChar:'🧍',offChar:'🚩',
   note:'Ev + Zayıfız: 5-2-3A kontra — Baskı 19/Stil 15/Tempo 65',
   optionB:{p:22,s:12,t:68},
   location:'home',strength:'weaker',oppKey:'5311',oppLabel:'5-3-1-1 Counter'},

  {icon:'⚡',fm:'5-2-3-A',label:'5-4-1A/B Shoot on Sight',counter:'5-2-3A/B Counter Attack',
   gp:{icon:'⚡',text:'Counter Attack'},p:29,s:21,t:65,sr:60,badge:'AVERAGE',
   f:'Attack only',fL:2,m:'Protect the defence',mL:0,d:'Defend deep',dL:0,
   mrk:'Zone marking',mrkOn:true,off:'No',offOn:false,markChar:'🧍',offChar:'🚩',
   note:'Ev + Zayıfız: 5-2-3 kontra — Baskı 29/Stil 21/Tempo 65',
   optionB:{p:32,s:24,t:62},
   location:'home',strength:'weaker',oppKey:'541ab',oppLabel:'5-4-1A/B Shoot on Sight'},

  {icon:'⚡',fm:'5-2-3-A',label:'6-3-1A/B Counter',counter:'5-2-3A Counter Attack',
   gp:{icon:'⚡',text:'Counter Attack'},p:39,s:20,t:79,sr:62,badge:'AVERAGE',
   f:'Attack only',fL:2,m:'Protect the defence',mL:0,d:'Defend deep',dL:0,
   mrk:'Zone marking',mrkOn:true,off:'No',offOn:false,markChar:'🧍',offChar:'🚩',
   note:'Ev + Zayıfız: 5-2-3A kontra — Baskı 39/Stil 20/Tempo 79',
   optionB:{p:35,s:23,t:76},
   location:'home',strength:'weaker',oppKey:'631ab',oppLabel:'6-3-1A/B Counter'},

  // ── AWAY + STRONGER ───────────────────────────────────────────────
  {icon:'⚡',fm:'5-2-3-A',label:'4-3-3A/B Wing Play',counter:'5-2-3A Counter Attack',
   gp:{icon:'⚡',text:'Counter Attack'},p:39,s:26,t:75,sr:75,badge:'SOLID',
   f:'Attack only',fL:2,m:'Protect the defence',mL:0,d:'Defend deep',dL:0,
   mrk:'Zone marking',mrkOn:true,off:'No',offOn:false,markChar:'🧍',offChar:'🚩',
   note:'Deplasman + Güçlüyüz: 5-2-3A kontra — Baskı 39/Stil 26/Tempo 75',
   optionB:{p:43,s:22,t:71},
   location:'away',strength:'stronger',oppKey:'433ab',oppLabel:'4-3-3A/B Wing Play'},

  {icon:'⚡',fm:'5-2-3-A',label:'4-4-2A/B Passing',counter:'5-2-3A Counter Attack',
   gp:{icon:'⚡',text:'Counter Attack'},p:35,s:15,t:75,sr:72,badge:'SOLID',
   f:'Attack only',fL:2,m:'Protect the defence',mL:0,d:'Defend deep',dL:0,
   mrk:'Zone marking',mrkOn:true,off:'No',offOn:false,markChar:'🧍',offChar:'🚩',
   note:'Deplasman + Güçlüyüz: 5-2-3A kontra — Baskı 35/Stil 15/Tempo 75',
   optionB:{p:43,s:22,t:71},
   location:'away',strength:'stronger',oppKey:'442ab',oppLabel:'4-4-2A/B Passing'},

  {icon:'⚡',fm:'5-2-3-A',label:'4-2-3-1 Shoot on Sight',counter:'5-2-3A Counter Attack',
   gp:{icon:'⚡',text:'Counter Attack'},p:49,s:19,t:79,sr:78,badge:'SOLID',
   f:'Attack only',fL:2,m:'Protect the defence',mL:0,d:'Defend deep',dL:0,
   mrk:'Zone marking',mrkOn:true,off:'No',offOn:false,markChar:'🧍',offChar:'🚩',
   note:'Deplasman + Güçlüyüz: 5-2-3A kontra — Baskı 49/Stil 19/Tempo 79',
   optionB:{p:45,s:23,t:75},
   location:'away',strength:'stronger',oppKey:'4231',oppLabel:'4-2-3-1 Shoot on Sight'},

  {icon:'⚡',fm:'5-2-3-A',label:'4-5-1 Shoot on Sight',counter:'5-2-3A Counter Attack',
   gp:{icon:'⚡',text:'Counter Attack'},p:49,s:19,t:79,sr:75,badge:'SOLID',
   f:'Attack only',fL:2,m:'Protect the defence',mL:0,d:'Defend deep',dL:0,
   mrk:'Zone marking',mrkOn:true,off:'No',offOn:false,markChar:'🧍',offChar:'🚩',
   note:'Deplasman + Güçlüyüz: 5-2-3A kontra — Baskı 49/Stil 19/Tempo 79',
   optionB:{p:52,s:22,t:76},
   location:'away',strength:'stronger',oppKey:'451',oppLabel:'4-5-1 Shoot on Sight'},

  {icon:'⚡',fm:'5-2-3-A',label:'5-2-3A/B Counter',counter:'5-2-3A Counter Attack',
   gp:{icon:'⚡',text:'Counter Attack'},p:32,s:16,t:77,sr:72,badge:'SOLID',
   f:'Attack only',fL:2,m:'Protect the defence',mL:0,d:'Defend deep',dL:0,
   mrk:'Zone marking',mrkOn:true,off:'No',offOn:false,markChar:'🧍',offChar:'🚩',
   note:'Deplasman + Güçlüyüz: 5-2-3A kontra — Baskı 32/Stil 16/Tempo 77',
   optionB:{p:35,s:19,t:74},
   location:'away',strength:'stronger',oppKey:'523ab',oppLabel:'5-2-3A/B Counter'},

  {icon:'⚡',fm:'5-2-3-A',label:'5-3-2 Counter',counter:'5-2-3A Counter Attack',
   gp:{icon:'⚡',text:'Counter Attack'},p:36,s:16,t:66,sr:70,badge:'SOLID',
   f:'Attack only',fL:2,m:'Protect the defence',mL:0,d:'Defend deep',dL:0,
   mrk:'Zone marking',mrkOn:true,off:'No',offOn:false,markChar:'🧍',offChar:'🚩',
   note:'Deplasman + Güçlüyüz: 5-2-3A kontra — Baskı 36/Stil 16/Tempo 66',
   optionB:{p:39,s:19,t:69},
   location:'away',strength:'stronger',oppKey:'532',oppLabel:'5-3-2 Counter'},

  {icon:'⚡',fm:'5-2-3-A',label:'5-3-1-1 Counter',counter:'5-2-3A Counter Attack',
   gp:{icon:'⚡',text:'Counter Attack'},p:24,s:20,t:74,sr:70,badge:'SOLID',
   f:'Attack only',fL:2,m:'Protect the defence',mL:0,d:'Defend deep',dL:0,
   mrk:'Zone marking',mrkOn:true,off:'No',offOn:false,markChar:'🧍',offChar:'🚩',
   note:'Deplasman + Güçlüyüz: 5-2-3A kontra — Baskı 24/Stil 20/Tempo 74',
   optionB:{p:28,s:24,t:71},
   location:'away',strength:'stronger',oppKey:'5311',oppLabel:'5-3-1-1 Counter'},

  {icon:'⚡',fm:'5-2-3-A',label:'5-4-1A/B Shoot on Sight',counter:'5-2-3A Counter Attack',
   gp:{icon:'⚡',text:'Counter Attack'},p:33,s:21,t:60,sr:68,badge:'SOLID',
   f:'Attack only',fL:2,m:'Protect the defence',mL:0,d:'Defend deep',dL:0,
   mrk:'Zone marking',mrkOn:true,off:'No',offOn:false,markChar:'🧍',offChar:'🚩',
   note:'Deplasman + Güçlüyüz: 5-2-3A kontra — Baskı 33/Stil 21/Tempo 60',
   optionB:{p:36,s:24,t:63},
   location:'away',strength:'stronger',oppKey:'541ab',oppLabel:'5-4-1A/B Shoot on Sight'},

  {icon:'🔥',fm:'4-3-3-A',label:'6-3-1A/B Counter',counter:'4-3-3A/B Wing Play',
   gp:{icon:'🏃',text:'Wing Play'},p:60,s:50,t:70,sr:78,badge:'SOLID',
   f:'Attack only',fL:2,m:'Protect the defence',mL:0,d:'Defend deep',dL:0,
   mrk:'Zone marking',mrkOn:true,off:'No',offOn:false,markChar:'🧍',offChar:'🚩',
   note:'Deplasman + Güçlüyüz: 4-3-3 kanatlarla — Baskı 60/Stil 50/Tempo 70',
   optionB:{p:64,s:47,t:73},
   location:'away',strength:'stronger',oppKey:'631ab',oppLabel:'6-3-1A/B Counter'},

  {icon:'🔥',fm:'4-3-3-B',label:'4-4-2B Passing',counter:'4-3-3B Wing Play',
   gp:{icon:'🏃',text:'Wing Play'},p:66,s:56,t:66,sr:78,badge:'SOLID',
   f:'Attack only',fL:2,m:'Protect the defence',mL:0,d:'Defend deep',dL:0,
   mrk:'Zone marking',mrkOn:true,off:'No',offOn:false,markChar:'🧍',offChar:'🚩',
   note:'Deplasman + Güçlüyüz: 4-3-3B kanatlarla — Baskı 66/Stil 56/Tempo 66',
   optionB:{p:63,s:59,t:69},
   location:'away',strength:'stronger',oppKey:'442b',oppLabel:'4-4-2B Passing'},

  // ── AWAY + EQUAL ──────────────────────────────────────────────────
  {icon:'⚡',fm:'5-2-3-A',label:'4-3-3A/B Wing Play',counter:'5-2-3A Counter Attack',
   gp:{icon:'⚡',text:'Counter Attack'},p:32,s:16,t:66,sr:65,badge:'AVERAGE',
   f:'Attack only',fL:2,m:'Protect the defence',mL:0,d:'Defend deep',dL:0,
   mrk:'Zone marking',mrkOn:true,off:'No',offOn:false,markChar:'🧍',offChar:'🚩',
   note:'Deplasman + Eşitiz: 5-2-3A kontra — Baskı 32/Stil 16/Tempo 66',
   optionB:{p:35,s:19,t:69},
   location:'away',strength:'equal',oppKey:'433ab',oppLabel:'4-3-3A/B Wing Play'},

  {icon:'⚡',fm:'5-2-3-A',label:'4-4-2A/B Passing',counter:'5-2-3A Counter Attack',
   gp:{icon:'⚡',text:'Counter Attack'},p:25,s:9,t:60,sr:62,badge:'AVERAGE',
   f:'Attack only',fL:2,m:'Protect the defence',mL:0,d:'Defend deep',dL:0,
   mrk:'Zone marking',mrkOn:true,off:'No',offOn:false,markChar:'🧍',offChar:'🚩',
   note:'Deplasman + Eşitiz: 5-2-3A kontra — Baskı 25/Stil 9/Tempo 60',
   location:'away',strength:'equal',oppKey:'442ab',oppLabel:'4-4-2A/B Passing'},

  {icon:'⚡',fm:'5-2-3-A',label:'4-2-3-1 Shoot on Sight',counter:'5-2-3A Counter Attack',
   gp:{icon:'⚡',text:'Counter Attack'},p:32,s:12,t:70,sr:68,badge:'SOLID',
   f:'Attack only',fL:2,m:'Protect the defence',mL:0,d:'Defend deep',dL:0,
   mrk:'Zone marking',mrkOn:true,off:'No',offOn:false,markChar:'🧍',offChar:'🚩',
   note:'Deplasman + Eşitiz: 5-2-3A kontra — Baskı 32/Stil 12/Tempo 70',
   optionB:{p:35,s:16,t:67},
   location:'away',strength:'equal',oppKey:'4231',oppLabel:'4-2-3-1 Shoot on Sight'},

  {icon:'⚡',fm:'5-2-3-A',label:'4-5-1 Shoot on Sight',counter:'5-2-3A Counter Attack',
   gp:{icon:'⚡',text:'Counter Attack'},p:32,s:12,t:70,sr:65,badge:'AVERAGE',
   f:'Attack only',fL:2,m:'Protect the defence',mL:0,d:'Defend deep',dL:0,
   mrk:'Zone marking',mrkOn:true,off:'No',offOn:false,markChar:'🧍',offChar:'🚩',
   note:'Deplasman + Eşitiz: 5-2-3A kontra — Baskı 32/Stil 12/Tempo 70',
   optionB:{p:29,s:15,t:73},
   location:'away',strength:'equal',oppKey:'451',oppLabel:'4-5-1 Shoot on Sight'},

  {icon:'⚡',fm:'5-2-3-A',label:'5-2-3A/B Counter',counter:'5-2-3A Counter Attack',
   gp:{icon:'⚡',text:'Counter Attack'},p:16,s:9,t:72,sr:62,badge:'AVERAGE',
   f:'Attack only',fL:2,m:'Protect the defence',mL:0,d:'Defend deep',dL:0,
   mrk:'Zone marking',mrkOn:true,off:'No',offOn:false,markChar:'🧍',offChar:'🚩',
   note:'Deplasman + Eşitiz: 5-2-3A kontra — Baskı 16/Stil 9/Tempo 72',
   optionB:{p:19,s:13,t:69},
   location:'away',strength:'equal',oppKey:'523ab',oppLabel:'5-2-3A/B Counter'},

  {icon:'⚡',fm:'5-2-3-A',label:'5-3-2 Counter',counter:'5-2-3A Counter Attack',
   gp:{icon:'⚡',text:'Counter Attack'},p:25,s:9,t:60,sr:60,badge:'AVERAGE',
   f:'Attack only',fL:2,m:'Protect the defence',mL:0,d:'Defend deep',dL:0,
   mrk:'Zone marking',mrkOn:true,off:'No',offOn:false,markChar:'🧍',offChar:'🚩',
   note:'Deplasman + Eşitiz: 5-2-3A kontra — Baskı 25/Stil 9/Tempo 60',
   optionB:{p:22,s:12,t:64},
   location:'away',strength:'equal',oppKey:'532',oppLabel:'5-3-2 Counter'},

  {icon:'⚡',fm:'5-2-3-A',label:'5-3-1-1 Counter',counter:'5-2-3A Counter Attack',
   gp:{icon:'⚡',text:'Counter Attack'},p:11,s:32,t:70,sr:62,badge:'AVERAGE',
   f:'Attack only',fL:2,m:'Protect the defence',mL:0,d:'Defend deep',dL:0,
   mrk:'Zone marking',mrkOn:true,off:'No',offOn:false,markChar:'🧍',offChar:'🚩',
   note:'Deplasman + Eşitiz: 5-2-3A kontra — Baskı 11/Stil 32/Tempo 70',
   optionB:{p:15,s:29,t:67},
   location:'away',strength:'equal',oppKey:'5311',oppLabel:'5-3-1-1 Counter'},

  {icon:'⚡',fm:'5-2-3-A',label:'5-4-1A/B Shoot on Sight',counter:'5-2-3A Counter Attack',
   gp:{icon:'⚡',text:'Counter Attack'},p:33,s:13,t:73,sr:62,badge:'AVERAGE',
   f:'Attack only',fL:2,m:'Protect the defence',mL:0,d:'Defend deep',dL:0,
   mrk:'Zone marking',mrkOn:true,off:'No',offOn:false,markChar:'🧍',offChar:'🚩',
   note:'Deplasman + Eşitiz: 5-2-3A kontra — Baskı 33/Stil 13/Tempo 73',
   optionB:{p:30,s:16,t:70},
   location:'away',strength:'equal',oppKey:'541ab',oppLabel:'5-4-1A/B Shoot on Sight'},

  {icon:'⚡',fm:'5-2-3-A',label:'6-3-1A/B Counter',counter:'5-2-3A Counter Attack',
   gp:{icon:'⚡',text:'Counter Attack'},p:36,s:24,t:74,sr:65,badge:'AVERAGE',
   f:'Attack only',fL:2,m:'Protect the defence',mL:0,d:'Defend deep',dL:0,
   mrk:'Zone marking',mrkOn:true,off:'No',offOn:false,markChar:'🧍',offChar:'🚩',
   note:'Deplasman + Eşitiz: 5-2-3A kontra — Baskı 36/Stil 24/Tempo 74',
   optionB:{p:33,s:21,t:71},
   location:'away',strength:'equal',oppKey:'631ab',oppLabel:'6-3-1A/B Counter'},

  {icon:'⚡',fm:'5-2-3-A',label:'4-4-2B Passing',counter:'5-2-3A Counter Attack',
   gp:{icon:'⚡',text:'Counter Attack'},p:16,s:12,t:62,sr:62,badge:'AVERAGE',
   f:'Attack only',fL:2,m:'Protect the defence',mL:0,d:'Defend deep',dL:0,
   mrk:'Zone marking',mrkOn:true,off:'No',offOn:false,markChar:'🧍',offChar:'🚩',
   note:'Deplasman + Eşitiz: 5-2-3A kontra — Baskı 16/Stil 12/Tempo 62',
   optionB:{p:19,s:15,t:65},
   location:'away',strength:'equal',oppKey:'442b',oppLabel:'4-4-2B Passing'},

  // ── AWAY + WEAKER ─────────────────────────────────────────────────
  {icon:'⚡',fm:'5-2-3-A',label:'4-3-3A/B Wing Play',counter:'5-2-3A Counter Attack',
   gp:{icon:'⚡',text:'Counter Attack'},p:20,s:11,t:65,sr:52,badge:'AVERAGE',
   f:'Attack only',fL:2,m:'Protect the defence',mL:0,d:'Defend deep',dL:0,
   mrk:'Zone marking',mrkOn:true,off:'No',offOn:false,markChar:'🧍',offChar:'🚩',
   note:'Deplasman + Zayıfız: 5-2-3A kontra — Baskı 20/Stil 11/Tempo 65',
   optionB:{p:24,s:15,t:62},
   location:'away',strength:'weaker',oppKey:'433ab',oppLabel:'4-3-3A/B Wing Play'},

  {icon:'⚡',fm:'5-2-3-A',label:'4-4-2A/B Passing',counter:'5-2-3A Counter Attack',
   gp:{icon:'⚡',text:'Counter Attack'},p:22,s:21,t:72,sr:55,badge:'AVERAGE',
   f:'Attack only',fL:2,m:'Protect the defence',mL:0,d:'Defend deep',dL:0,
   mrk:'Zone marking',mrkOn:true,off:'No',offOn:false,markChar:'🧍',offChar:'🚩',
   note:'Deplasman + Zayıfız: 5-2-3A kontra — Baskı 22/Stil 21/Tempo 72',
   optionB:{p:25,s:13,t:66},
   location:'away',strength:'weaker',oppKey:'442ab',oppLabel:'4-4-2A/B Passing'},

  {icon:'⚡',fm:'5-2-3-A',label:'4-2-3-1 Shoot on Sight',counter:'5-2-3A Counter Attack',
   gp:{icon:'⚡',text:'Counter Attack'},p:15,s:3,t:67,sr:52,badge:'AVERAGE',
   f:'Attack only',fL:2,m:'Protect the defence',mL:0,d:'Defend deep',dL:0,
   mrk:'Zone marking',mrkOn:true,off:'No',offOn:false,markChar:'🧍',offChar:'🚩',
   note:'Deplasman + Zayıfız: 5-2-3A kontra — Baskı 15/Stil 3/Tempo 67',
   optionB:{p:19,s:7,t:69},
   location:'away',strength:'weaker',oppKey:'4231',oppLabel:'4-2-3-1 Shoot on Sight'},

  {icon:'⚡',fm:'5-2-3-A',label:'4-5-1 Shoot on Sight',counter:'5-2-3A Counter Attack',
   gp:{icon:'⚡',text:'Counter Attack'},p:15,s:3,t:67,sr:50,badge:'AVERAGE',
   f:'Attack only',fL:2,m:'Protect the defence',mL:0,d:'Defend deep',dL:0,
   mrk:'Zone marking',mrkOn:true,off:'No',offOn:false,markChar:'🧍',offChar:'🚩',
   note:'Deplasman + Zayıfız: 5-2-3A kontra — Baskı 15/Stil 3/Tempo 67',
   optionB:{p:18,s:6,t:64},
   location:'away',strength:'weaker',oppKey:'451',oppLabel:'4-5-1 Shoot on Sight'},

  {icon:'⚡',fm:'5-2-3-A',label:'5-2-3A/B Counter',counter:'5-2-3A Counter Attack',
   gp:{icon:'⚡',text:'Counter Attack'},p:9,s:22,t:65,sr:52,badge:'AVERAGE',
   f:'Attack only',fL:2,m:'Protect the defence',mL:0,d:'Defend deep',dL:0,
   mrk:'Zone marking',mrkOn:true,off:'No',offOn:false,markChar:'🧍',offChar:'🚩',
   note:'Deplasman + Zayıfız: 5-2-3A kontra — Baskı 9/Stil 22/Tempo 65',
   optionB:{p:13,s:19,t:62},
   location:'away',strength:'weaker',oppKey:'523ab',oppLabel:'5-2-3A/B Counter'},

  {icon:'⚡',fm:'5-2-3-A',label:'5-3-2 Counter',counter:'5-2-3A Counter Attack',
   gp:{icon:'⚡',text:'Counter Attack'},p:22,s:9,t:69,sr:52,badge:'AVERAGE',
   f:'Attack only',fL:2,m:'Protect the defence',mL:0,d:'Defend deep',dL:0,
   mrk:'Zone marking',mrkOn:true,off:'No',offOn:false,markChar:'🧍',offChar:'🚩',
   note:'Deplasman + Zayıfız: 5-2-3A kontra — Baskı 22/Stil 9/Tempo 69',
   location:'away',strength:'weaker',oppKey:'532',oppLabel:'5-3-2 Counter'},

  {icon:'⚡',fm:'5-2-3-A',label:'5-3-1-1 Counter',counter:'5-2-3A Counter Attack',
   gp:{icon:'⚡',text:'Counter Attack'},p:8,s:11,t:62,sr:50,badge:'AVERAGE',
   f:'Attack only',fL:2,m:'Protect the defence',mL:0,d:'Defend deep',dL:0,
   mrk:'Zone marking',mrkOn:true,off:'No',offOn:false,markChar:'🧍',offChar:'🚩',
   note:'Deplasman + Zayıfız: 5-2-3A kontra — Baskı 8/Stil 11/Tempo 62',
   optionB:{p:12,s:15,t:65},
   location:'away',strength:'weaker',oppKey:'5311',oppLabel:'5-3-1-1 Counter'},

  {icon:'⚡',fm:'5-2-3-A',label:'5-4-1A/B Shoot on Sight',counter:'5-2-3A Counter Attack',
   gp:{icon:'⚡',text:'Counter Attack'},p:13,s:11,t:62,sr:50,badge:'AVERAGE',
   f:'Attack only',fL:2,m:'Protect the defence',mL:0,d:'Defend deep',dL:0,
   mrk:'Zone marking',mrkOn:true,off:'No',offOn:false,markChar:'🧍',offChar:'🚩',
   note:'Deplasman + Zayıfız: 5-2-3A kontra — Baskı 13/Stil 11/Tempo 62',
   optionB:{p:16,s:14,t:65},
   location:'away',strength:'weaker',oppKey:'541ab',oppLabel:'5-4-1A/B Shoot on Sight'},

  {icon:'⚡',fm:'5-2-3-A',label:'6-3-1A/B Counter',counter:'5-2-3A Counter Attack',
   gp:{icon:'⚡',text:'Counter Attack'},p:20,s:17,t:70,sr:52,badge:'AVERAGE',
   f:'Attack only',fL:2,m:'Protect the defence',mL:0,d:'Defend deep',dL:0,
   mrk:'Zone marking',mrkOn:true,off:'No',offOn:false,markChar:'🧍',offChar:'🚩',
   note:'Deplasman + Zayıfız: 5-2-3A kontra — Baskı 20/Stil 17/Tempo 70',
   optionB:{p:23,s:14,t:67},
   location:'away',strength:'weaker',oppKey:'631ab',oppLabel:'6-3-1A/B Counter'},

  {icon:'🎯',fm:'4-5-1',label:'4-4-2B Passing',counter:'4-5-1 Shoot on Sight',
   gp:{icon:'🎯',text:'Shoot on Sight'},p:25,s:15,t:65,sr:55,badge:'AVERAGE',
   f:'Attack only',fL:2,m:'Protect the defence',mL:0,d:'Defend deep',dL:0,
   mrk:'Zone marking',mrkOn:true,off:'No',offOn:false,markChar:'🧍',offChar:'🚩',
   note:'Deplasman + Zayıfız: 4-5-1 ile — Baskı 25/Stil 15/Tempo 65',
   optionB:{p:22,s:18,t:62},
   location:'away',strength:'weaker',oppKey:'442b',oppLabel:'4-4-2B Passing'},
];

// ─── WEEKLY SLIDER ENGINE ─────────────────────────────────────────────
// Each matchup rotates ±4 from its own base values — per-entry salt keeps every
// matchup unique; Option B uses a different salt offset so A ≠ B.
const _WEEK_SEED: number = (() => {
  const now = new Date();
  const d   = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const y0  = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const wk  = Math.ceil((((d.getTime() - y0.getTime()) / 86400000) + 1) / 7);
  return d.getUTCFullYear() * 100 + wk;
})();

function _si(seed: number, salt: number, mn: number, mx: number): number {
  let h = ((seed * 1664525) ^ (salt * 1013904223)) >>> 0;
  h = (Math.imul(h ^ (h >>> 16), 0x45d9f3b)) >>> 0;
  h = (Math.imul(h ^ (h >>> 16), 0x45d9f3b)) >>> 0;
  h = (h ^ (h >>> 16)) >>> 0;
  return mn + (h % (mx - mn + 1));
}

const _DELTA = 4;

TD.forEach((e, i) => {
  const b = i * 7;
  const baseP = e.p, baseS = e.s, baseT = e.t;
  e.p = _si(_WEEK_SEED, b + 1, Math.max(0, baseP - _DELTA), Math.min(100, baseP + _DELTA));
  e.s = _si(_WEEK_SEED, b + 2, Math.max(0, baseS - _DELTA), Math.min(100, baseS + _DELTA));
  e.t = _si(_WEEK_SEED, b + 3, Math.max(0, baseT - _DELTA), Math.min(100, baseT + _DELTA));
  if (e.optionB) {
    const bP = e.optionB.p, bS = e.optionB.s, bT = e.optionB.t;
    e.optionB.p = _si(_WEEK_SEED, b + 4, Math.max(0, bP - _DELTA), Math.min(100, bP + _DELTA));
    e.optionB.s = _si(_WEEK_SEED, b + 5, Math.max(0, bS - _DELTA), Math.min(100, bS + _DELTA));
    e.optionB.t = _si(_WEEK_SEED, b + 6, Math.max(0, bT - _DELTA), Math.min(100, bT + _DELTA));
  }
});
