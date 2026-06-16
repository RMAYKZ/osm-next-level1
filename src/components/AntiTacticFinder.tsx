import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLang } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useSavedTactics } from '../contexts/SavedTacticsContext';
import { analytics } from '../lib/analytics';
import './AntiTacticFinder.css';
import HomeTacticHero from './HomeTacticHero';
import { TacticEntry, OPP_LIST, TD } from '../data/tacticDatabase';

interface PlayerDef { r: string; x: number; y: number; c: string; s: string; }
interface ArrowDef  { x1: number; y1: number; x2: number; y2: number; cx: number; cy: number; c: string; w: number; }

const FM: Record<string, PlayerDef[]> = {
  '4-3-3-A': [
    {r:'GK',  x:.50, y:.06, c:'#ffd700', s:'gk'},
    {r:'LB',  x:.10, y:.22, c:'rgba(255,255,255,0.45)', s:'def'},
    {r:'CB',  x:.34, y:.20, c:'rgba(255,255,255,0.45)', s:'def'},
    {r:'CB',  x:.66, y:.20, c:'rgba(255,255,255,0.45)', s:'def'},
    {r:'RB',  x:.90, y:.22, c:'rgba(255,255,255,0.45)', s:'def'},
    {r:'CM',  x:.24, y:.50, c:'rgba(255,255,255,0.55)', s:'mid'},
    {r:'CAM', x:.50, y:.56, c:'rgba(255,255,255,0.55)', s:'mid'},
    {r:'CM',  x:.76, y:.50, c:'rgba(255,255,255,0.55)', s:'mid'},
    {r:'LW',  x:.10, y:.82, c:'rgba(255,255,255,0.9)', s:'fwd'},
    {r:'ST',  x:.50, y:.86, c:'rgba(255,255,255,0.9)', s:'fwd'},
    {r:'RW',  x:.90, y:.82, c:'rgba(255,255,255,0.9)', s:'fwd'},
  ],
  '4-3-3-B': [
    {r:'GK',  x:.50, y:.06, c:'#ffd700', s:'gk'},
    {r:'LB',  x:.10, y:.22, c:'rgba(255,255,255,0.45)', s:'def'},
    {r:'CB',  x:.34, y:.20, c:'rgba(255,255,255,0.45)', s:'def'},
    {r:'CB',  x:.66, y:.20, c:'rgba(255,255,255,0.45)', s:'def'},
    {r:'RB',  x:.90, y:.22, c:'rgba(255,255,255,0.45)', s:'def'},
    {r:'CM',  x:.22, y:.52, c:'rgba(255,255,255,0.55)', s:'mid'},
    {r:'CDM', x:.50, y:.44, c:'rgba(255,255,255,0.55)', s:'mid'},
    {r:'CM',  x:.78, y:.52, c:'rgba(255,255,255,0.55)', s:'mid'},
    {r:'LW',  x:.10, y:.82, c:'rgba(255,255,255,0.9)', s:'fwd'},
    {r:'ST',  x:.50, y:.86, c:'rgba(255,255,255,0.9)', s:'fwd'},
    {r:'RW',  x:.90, y:.82, c:'rgba(255,255,255,0.9)', s:'fwd'},
  ],
  '4-5-1': [
    {r:'GK',  x:.50, y:.06, c:'#ffd700', s:'gk'},
    {r:'LB',  x:.10, y:.22, c:'rgba(255,255,255,0.45)', s:'def'},
    {r:'CB',  x:.34, y:.20, c:'rgba(255,255,255,0.45)', s:'def'},
    {r:'CB',  x:.66, y:.20, c:'rgba(255,255,255,0.45)', s:'def'},
    {r:'RB',  x:.90, y:.22, c:'rgba(255,255,255,0.45)', s:'def'},
    {r:'LM',  x:.08, y:.50, c:'rgba(255,255,255,0.55)', s:'mid'},
    {r:'CM',  x:.30, y:.52, c:'rgba(255,255,255,0.55)', s:'mid'},
    {r:'CDM', x:.50, y:.46, c:'rgba(255,255,255,0.55)', s:'mid'},
    {r:'CM',  x:.70, y:.52, c:'rgba(255,255,255,0.55)', s:'mid'},
    {r:'RM',  x:.92, y:.50, c:'rgba(255,255,255,0.55)', s:'mid'},
    {r:'ST',  x:.50, y:.82, c:'rgba(255,255,255,0.9)', s:'fwd'},
  ],
  '4-2-3-1': [
    {r:'GK',  x:.50, y:.06, c:'#ffd700', s:'gk'},
    {r:'LB',  x:.10, y:.22, c:'rgba(255,255,255,0.45)', s:'def'},
    {r:'CB',  x:.34, y:.20, c:'rgba(255,255,255,0.45)', s:'def'},
    {r:'CB',  x:.66, y:.20, c:'rgba(255,255,255,0.45)', s:'def'},
    {r:'RB',  x:.90, y:.22, c:'rgba(255,255,255,0.45)', s:'def'},
    {r:'CM',  x:.36, y:.40, c:'rgba(255,255,255,0.55)', s:'mid'},
    {r:'CM',  x:.64, y:.40, c:'rgba(255,255,255,0.55)', s:'mid'},
    {r:'LM',  x:.12, y:.64, c:'rgba(255,255,255,0.55)', s:'mid'},
    {r:'CAM', x:.50, y:.66, c:'rgba(255,255,255,0.55)', s:'mid'},
    {r:'RM',  x:.88, y:.64, c:'rgba(255,255,255,0.55)', s:'mid'},
    {r:'ST',  x:.50, y:.84, c:'rgba(255,255,255,0.9)', s:'fwd'},
  ],
  '4-4-2-A': [
    {r:'GK',  x:.50, y:.06, c:'#ffd700', s:'gk'},
    {r:'LB',  x:.10, y:.22, c:'rgba(255,255,255,0.45)', s:'def'},
    {r:'CB',  x:.34, y:.20, c:'rgba(255,255,255,0.45)', s:'def'},
    {r:'CB',  x:.66, y:.20, c:'rgba(255,255,255,0.45)', s:'def'},
    {r:'RB',  x:.90, y:.22, c:'rgba(255,255,255,0.45)', s:'def'},
    {r:'LM',  x:.08, y:.50, c:'rgba(255,255,255,0.55)', s:'mid'},
    {r:'CM',  x:.34, y:.50, c:'rgba(255,255,255,0.55)', s:'mid'},
    {r:'CM',  x:.66, y:.50, c:'rgba(255,255,255,0.55)', s:'mid'},
    {r:'RM',  x:.92, y:.50, c:'rgba(255,255,255,0.55)', s:'mid'},
    {r:'ST',  x:.36, y:.82, c:'rgba(255,255,255,0.9)', s:'fwd'},
    {r:'ST',  x:.64, y:.82, c:'rgba(255,255,255,0.9)', s:'fwd'},
  ],
  '4-4-2-B': [
    {r:'GK',  x:.50, y:.06, c:'#ffd700', s:'gk'},
    {r:'LB',  x:.10, y:.22, c:'rgba(255,255,255,0.45)', s:'def'},
    {r:'CB',  x:.34, y:.20, c:'rgba(255,255,255,0.45)', s:'def'},
    {r:'CB',  x:.66, y:.20, c:'rgba(255,255,255,0.45)', s:'def'},
    {r:'RB',  x:.90, y:.22, c:'rgba(255,255,255,0.45)', s:'def'},
    {r:'CDM', x:.50, y:.38, c:'rgba(255,255,255,0.55)', s:'mid'},
    {r:'CM',  x:.24, y:.48, c:'rgba(255,255,255,0.55)', s:'mid'},
    {r:'CAM', x:.50, y:.56, c:'rgba(255,255,255,0.55)', s:'mid'},
    {r:'CM',  x:.76, y:.48, c:'rgba(255,255,255,0.55)', s:'mid'},
    {r:'ST',  x:.34, y:.82, c:'rgba(255,255,255,0.9)', s:'fwd'},
    {r:'ST',  x:.66, y:.82, c:'rgba(255,255,255,0.9)', s:'fwd'},
  ],
  '5-2-3-A': [
    {r:'GK',  x:.50, y:.06, c:'#ffd700', s:'gk'},
    {r:'LB',  x:.06, y:.24, c:'rgba(255,255,255,0.45)', s:'def'},
    {r:'CB',  x:.26, y:.20, c:'rgba(255,255,255,0.45)', s:'def'},
    {r:'CB',  x:.50, y:.18, c:'rgba(255,255,255,0.45)', s:'def'},
    {r:'CB',  x:.74, y:.20, c:'rgba(255,255,255,0.45)', s:'def'},
    {r:'RB',  x:.94, y:.24, c:'rgba(255,255,255,0.45)', s:'def'},
    {r:'CM',  x:.34, y:.50, c:'rgba(255,255,255,0.55)', s:'mid'},
    {r:'CM',  x:.66, y:.50, c:'rgba(255,255,255,0.55)', s:'mid'},
    {r:'LW',  x:.10, y:.82, c:'rgba(255,255,255,0.9)', s:'fwd'},
    {r:'ST',  x:.50, y:.86, c:'rgba(255,255,255,0.9)', s:'fwd'},
    {r:'RW',  x:.90, y:.82, c:'rgba(255,255,255,0.9)', s:'fwd'},
  ],
  '5-2-3-B': [
    {r:'GK',  x:.50, y:.06, c:'#ffd700', s:'gk'},
    {r:'LB',  x:.06, y:.24, c:'rgba(255,255,255,0.45)', s:'def'},
    {r:'CB',  x:.26, y:.20, c:'rgba(255,255,255,0.45)', s:'def'},
    {r:'CB',  x:.50, y:.18, c:'rgba(255,255,255,0.45)', s:'def'},
    {r:'CB',  x:.74, y:.20, c:'rgba(255,255,255,0.45)', s:'def'},
    {r:'RB',  x:.94, y:.24, c:'rgba(255,255,255,0.45)', s:'def'},
    {r:'CDM', x:.34, y:.48, c:'rgba(255,255,255,0.55)', s:'mid'},
    {r:'CDM', x:.66, y:.48, c:'rgba(255,255,255,0.55)', s:'mid'},
    {r:'LW',  x:.10, y:.82, c:'rgba(255,255,255,0.9)', s:'fwd'},
    {r:'ST',  x:.50, y:.86, c:'rgba(255,255,255,0.9)', s:'fwd'},
    {r:'RW',  x:.90, y:.82, c:'rgba(255,255,255,0.9)', s:'fwd'},
  ],
  '5-3-2': [
    {r:'GK',  x:.50, y:.06, c:'#ffd700', s:'gk'},
    {r:'LB',  x:.06, y:.24, c:'rgba(255,255,255,0.45)', s:'def'},
    {r:'CB',  x:.26, y:.20, c:'rgba(255,255,255,0.45)', s:'def'},
    {r:'CB',  x:.50, y:.18, c:'rgba(255,255,255,0.45)', s:'def'},
    {r:'CB',  x:.74, y:.20, c:'rgba(255,255,255,0.45)', s:'def'},
    {r:'RB',  x:.94, y:.24, c:'rgba(255,255,255,0.45)', s:'def'},
    {r:'CM',  x:.22, y:.52, c:'rgba(255,255,255,0.55)', s:'mid'},
    {r:'CAM', x:.50, y:.58, c:'rgba(255,255,255,0.55)', s:'mid'},
    {r:'CM',  x:.78, y:.52, c:'rgba(255,255,255,0.55)', s:'mid'},
    {r:'ST',  x:.34, y:.82, c:'rgba(255,255,255,0.9)', s:'fwd'},
    {r:'ST',  x:.66, y:.82, c:'rgba(255,255,255,0.9)', s:'fwd'},
  ],
  '5-3-1-1': [
    {r:'GK',  x:.50, y:.06, c:'#ffd700', s:'gk'},
    {r:'LB',  x:.06, y:.24, c:'rgba(255,255,255,0.45)', s:'def'},
    {r:'CB',  x:.26, y:.20, c:'rgba(255,255,255,0.45)', s:'def'},
    {r:'CB',  x:.50, y:.18, c:'rgba(255,255,255,0.45)', s:'def'},
    {r:'CB',  x:.74, y:.20, c:'rgba(255,255,255,0.45)', s:'def'},
    {r:'RB',  x:.94, y:.24, c:'rgba(255,255,255,0.45)', s:'def'},
    {r:'CAM', x:.22, y:.52, c:'rgba(255,255,255,0.55)', s:'mid'},
    {r:'CM',  x:.50, y:.48, c:'rgba(255,255,255,0.55)', s:'mid'},
    {r:'CAM', x:.78, y:.52, c:'rgba(255,255,255,0.55)', s:'mid'},
    {r:'ST',  x:.50, y:.68, c:'rgba(255,255,255,0.9)', s:'fwd'},
    {r:'ST',  x:.50, y:.84, c:'rgba(255,255,255,0.9)', s:'fwd'},
  ],
  '5-4-1-A': [
    {r:'GK',  x:.50, y:.06, c:'#ffd700', s:'gk'},
    {r:'LB',  x:.06, y:.24, c:'rgba(255,255,255,0.45)', s:'def'},
    {r:'CB',  x:.26, y:.20, c:'rgba(255,255,255,0.45)', s:'def'},
    {r:'CB',  x:.50, y:.18, c:'rgba(255,255,255,0.45)', s:'def'},
    {r:'CB',  x:.74, y:.20, c:'rgba(255,255,255,0.45)', s:'def'},
    {r:'RB',  x:.94, y:.24, c:'rgba(255,255,255,0.45)', s:'def'},
    {r:'LM',  x:.10, y:.52, c:'rgba(255,255,255,0.55)', s:'mid'},
    {r:'CM',  x:.34, y:.50, c:'rgba(255,255,255,0.55)', s:'mid'},
    {r:'CM',  x:.66, y:.50, c:'rgba(255,255,255,0.55)', s:'mid'},
    {r:'RM',  x:.90, y:.52, c:'rgba(255,255,255,0.55)', s:'mid'},
    {r:'ST',  x:.50, y:.82, c:'rgba(255,255,255,0.9)', s:'fwd'},
  ],
  '5-4-1-B': [
    {r:'GK',  x:.50, y:.06, c:'#ffd700', s:'gk'},
    {r:'LB',  x:.06, y:.24, c:'rgba(255,255,255,0.45)', s:'def'},
    {r:'CB',  x:.26, y:.20, c:'rgba(255,255,255,0.45)', s:'def'},
    {r:'CB',  x:.50, y:.18, c:'rgba(255,255,255,0.45)', s:'def'},
    {r:'CB',  x:.74, y:.20, c:'rgba(255,255,255,0.45)', s:'def'},
    {r:'RB',  x:.94, y:.24, c:'rgba(255,255,255,0.45)', s:'def'},
    {r:'CDM', x:.50, y:.38, c:'rgba(255,255,255,0.55)', s:'mid'},
    {r:'CM',  x:.22, y:.50, c:'rgba(255,255,255,0.55)', s:'mid'},
    {r:'CAM', x:.50, y:.58, c:'rgba(255,255,255,0.55)', s:'mid'},
    {r:'CM',  x:.78, y:.50, c:'rgba(255,255,255,0.55)', s:'mid'},
    {r:'ST',  x:.50, y:.82, c:'rgba(255,255,255,0.9)', s:'fwd'},
  ],
  '6-3-1-A': [
    {r:'GK',  x:.50, y:.06, c:'#ffd700', s:'gk'},
    {r:'LB',  x:.06, y:.22, c:'rgba(255,255,255,0.45)', s:'def'},
    {r:'CB',  x:.24, y:.18, c:'rgba(255,255,255,0.45)', s:'def'},
    {r:'CB',  x:.42, y:.18, c:'rgba(255,255,255,0.45)', s:'def'},
    {r:'CB',  x:.58, y:.30, c:'rgba(255,255,255,0.45)', s:'def'},
    {r:'CB',  x:.76, y:.18, c:'rgba(255,255,255,0.45)', s:'def'},
    {r:'RB',  x:.94, y:.22, c:'rgba(255,255,255,0.45)', s:'def'},
    {r:'CM',  x:.22, y:.52, c:'rgba(255,255,255,0.55)', s:'mid'},
    {r:'CAM', x:.50, y:.62, c:'rgba(255,255,255,0.55)', s:'mid'},
    {r:'CM',  x:.78, y:.52, c:'rgba(255,255,255,0.55)', s:'mid'},
    {r:'ST',  x:.50, y:.82, c:'rgba(255,255,255,0.9)', s:'fwd'},
  ],
  '6-3-1-B': [
    {r:'GK',  x:.50, y:.06, c:'#ffd700', s:'gk'},
    {r:'LB',  x:.06, y:.22, c:'rgba(255,255,255,0.45)', s:'def'},
    {r:'CB',  x:.22, y:.18, c:'rgba(255,255,255,0.45)', s:'def'},
    {r:'CB',  x:.38, y:.16, c:'rgba(255,255,255,0.45)', s:'def'},
    {r:'CB',  x:.62, y:.16, c:'rgba(255,255,255,0.45)', s:'def'},
    {r:'CB',  x:.78, y:.18, c:'rgba(255,255,255,0.45)', s:'def'},
    {r:'RB',  x:.94, y:.22, c:'rgba(255,255,255,0.45)', s:'def'},
    {r:'CM',  x:.50, y:.42, c:'rgba(255,255,255,0.55)', s:'mid'},
    {r:'CAM', x:.24, y:.56, c:'rgba(255,255,255,0.55)', s:'mid'},
    {r:'CAM', x:.76, y:.56, c:'rgba(255,255,255,0.55)', s:'mid'},
    {r:'ST',  x:.50, y:.82, c:'rgba(255,255,255,0.9)', s:'fwd'},
  ],
};

const AR: Record<string, ArrowDef[]> = {
  '4-3-3-A': [
    {x1:.10,y1:.82,x2:.04,y2:.94,cx:.03,cy:.88,c:'rgba(255,255,255,0.9)',w:2.4},
    {x1:.90,y1:.82,x2:.96,y2:.94,cx:.97,cy:.88,c:'rgba(255,255,255,0.9)',w:2.4},
    {x1:.50,y1:.86,x2:.50,y2:.95,cx:.50,cy:.91,c:'rgba(255,255,255,0.9)',w:2.6},
    {x1:.24,y1:.50,x2:.16,y2:.72,cx:.14,cy:.62,c:'rgba(255,255,255,0.55)',w:1.6},
    {x1:.76,y1:.50,x2:.84,y2:.72,cx:.86,cy:.62,c:'rgba(255,255,255,0.55)',w:1.6},
    {x1:.50,y1:.56,x2:.50,y2:.76,cx:.50,cy:.67,c:'rgba(255,255,255,0.55)',w:1.4},
  ],
  '4-3-3-B': [
    {x1:.10,y1:.82,x2:.04,y2:.94,cx:.03,cy:.88,c:'rgba(255,255,255,0.9)',w:2.4},
    {x1:.90,y1:.82,x2:.96,y2:.94,cx:.97,cy:.88,c:'rgba(255,255,255,0.9)',w:2.4},
    {x1:.50,y1:.86,x2:.50,y2:.95,cx:.50,cy:.91,c:'rgba(255,255,255,0.9)',w:2.6},
    {x1:.22,y1:.52,x2:.14,y2:.72,cx:.12,cy:.63,c:'rgba(255,255,255,0.55)',w:1.6},
    {x1:.78,y1:.52,x2:.86,y2:.72,cx:.88,cy:.63,c:'rgba(255,255,255,0.55)',w:1.6},
    {x1:.50,y1:.44,x2:.50,y2:.66,cx:.50,cy:.56,c:'rgba(255,255,255,0.55)',w:1.3},
  ],
  '4-5-1': [
    {x1:.50,y1:.82,x2:.50,y2:.93,cx:.50,cy:.88,c:'rgba(255,255,255,0.9)',w:2.4},
    {x1:.08,y1:.50,x2:.05,y2:.68,cx:.03,cy:.60,c:'rgba(255,255,255,0.55)',w:1.6},
    {x1:.92,y1:.50,x2:.95,y2:.68,cx:.97,cy:.60,c:'rgba(255,255,255,0.55)',w:1.6},
    {x1:.30,y1:.52,x2:.38,y2:.68,cx:.32,cy:.61,c:'rgba(255,255,255,0.55)',w:1.3},
    {x1:.70,y1:.52,x2:.62,y2:.68,cx:.68,cy:.61,c:'rgba(255,255,255,0.55)',w:1.3},
    {x1:.50,y1:.46,x2:.50,y2:.68,cx:.50,cy:.58,c:'rgba(255,255,255,0.55)',w:1.3},
  ],
  '4-2-3-1': [
    {x1:.50,y1:.84,x2:.50,y2:.94,cx:.50,cy:.90,c:'rgba(255,255,255,0.9)',w:2.6},
    {x1:.12,y1:.64,x2:.07,y2:.78,cx:.05,cy:.72,c:'rgba(255,255,255,0.55)',w:1.7},
    {x1:.88,y1:.64,x2:.93,y2:.78,cx:.95,cy:.72,c:'rgba(255,255,255,0.55)',w:1.7},
    {x1:.50,y1:.66,x2:.50,y2:.78,cx:.50,cy:.73,c:'rgba(255,255,255,0.55)',w:1.4},
    {x1:.36,y1:.40,x2:.12,y2:.60,cx:.20,cy:.52,c:'rgba(255,255,255,0.55)',w:1.2},
    {x1:.64,y1:.40,x2:.88,y2:.60,cx:.80,cy:.52,c:'rgba(255,255,255,0.55)',w:1.2},
  ],
  '4-4-2-A': [
    {x1:.36,y1:.82,x2:.28,y2:.93,cx:.29,cy:.88,c:'rgba(255,255,255,0.9)',w:2.2},
    {x1:.64,y1:.82,x2:.72,y2:.93,cx:.71,cy:.88,c:'rgba(255,255,255,0.9)',w:2.2},
    {x1:.08,y1:.50,x2:.06,y2:.70,cx:.04,cy:.61,c:'rgba(255,255,255,0.55)',w:1.6},
    {x1:.92,y1:.50,x2:.94,y2:.70,cx:.96,cy:.61,c:'rgba(255,255,255,0.55)',w:1.6},
    {x1:.34,y1:.50,x2:.34,y2:.68,cx:.34,cy:.60,c:'rgba(255,255,255,0.55)',w:1.3},
    {x1:.66,y1:.50,x2:.66,y2:.68,cx:.66,cy:.60,c:'rgba(255,255,255,0.55)',w:1.3},
  ],
  '4-4-2-B': [
    {x1:.34,y1:.82,x2:.26,y2:.93,cx:.27,cy:.88,c:'rgba(255,255,255,0.9)',w:2.2},
    {x1:.66,y1:.82,x2:.74,y2:.93,cx:.73,cy:.88,c:'rgba(255,255,255,0.9)',w:2.2},
    {x1:.24,y1:.48,x2:.16,y2:.68,cx:.14,cy:.59,c:'rgba(255,255,255,0.55)',w:1.5},
    {x1:.76,y1:.48,x2:.84,y2:.68,cx:.86,cy:.59,c:'rgba(255,255,255,0.55)',w:1.5},
    {x1:.50,y1:.56,x2:.50,y2:.74,cx:.50,cy:.66,c:'rgba(255,255,255,0.55)',w:1.3},
    {x1:.50,y1:.38,x2:.50,y2:.54,cx:.50,cy:.47,c:'rgba(255,255,255,0.55)',w:1.2},
  ],
  '5-2-3-A': [
    {x1:.10,y1:.82,x2:.04,y2:.94,cx:.03,cy:.88,c:'rgba(255,255,255,0.9)',w:2.4},
    {x1:.90,y1:.82,x2:.96,y2:.94,cx:.97,cy:.88,c:'rgba(255,255,255,0.9)',w:2.4},
    {x1:.50,y1:.86,x2:.50,y2:.95,cx:.50,cy:.91,c:'rgba(255,255,255,0.9)',w:2.6},
    {x1:.06,y1:.24,x2:.06,y2:.46,cx:.04,cy:.36,c:'rgba(255,255,255,0.45)',w:1.4},
    {x1:.94,y1:.24,x2:.94,y2:.46,cx:.96,cy:.36,c:'rgba(255,255,255,0.45)',w:1.4},
    {x1:.34,y1:.50,x2:.34,y2:.70,cx:.34,cy:.61,c:'rgba(255,255,255,0.55)',w:1.4},
    {x1:.66,y1:.50,x2:.66,y2:.70,cx:.66,cy:.61,c:'rgba(255,255,255,0.55)',w:1.4},
  ],
  '5-2-3-B': [
    {x1:.10,y1:.82,x2:.04,y2:.94,cx:.03,cy:.88,c:'rgba(255,255,255,0.9)',w:2.4},
    {x1:.90,y1:.82,x2:.96,y2:.94,cx:.97,cy:.88,c:'rgba(255,255,255,0.9)',w:2.4},
    {x1:.50,y1:.86,x2:.50,y2:.95,cx:.50,cy:.91,c:'rgba(255,255,255,0.9)',w:2.6},
    {x1:.06,y1:.24,x2:.06,y2:.46,cx:.04,cy:.36,c:'rgba(255,255,255,0.45)',w:1.4},
    {x1:.94,y1:.24,x2:.94,y2:.46,cx:.96,cy:.36,c:'rgba(255,255,255,0.45)',w:1.4},
    {x1:.34,y1:.48,x2:.34,y2:.68,cx:.34,cy:.59,c:'rgba(255,255,255,0.55)',w:1.4},
    {x1:.66,y1:.48,x2:.66,y2:.68,cx:.66,cy:.59,c:'rgba(255,255,255,0.55)',w:1.4},
  ],
  '5-3-2': [
    {x1:.34,y1:.82,x2:.26,y2:.93,cx:.27,cy:.88,c:'rgba(255,255,255,0.9)',w:2.2},
    {x1:.66,y1:.82,x2:.74,y2:.93,cx:.73,cy:.88,c:'rgba(255,255,255,0.9)',w:2.2},
    {x1:.06,y1:.24,x2:.06,y2:.46,cx:.04,cy:.36,c:'rgba(255,255,255,0.45)',w:1.4},
    {x1:.94,y1:.24,x2:.94,y2:.46,cx:.96,cy:.36,c:'rgba(255,255,255,0.45)',w:1.4},
    {x1:.22,y1:.52,x2:.30,y2:.70,cx:.24,cy:.62,c:'rgba(255,255,255,0.55)',w:1.4},
    {x1:.78,y1:.52,x2:.70,y2:.70,cx:.76,cy:.62,c:'rgba(255,255,255,0.55)',w:1.4},
  ],
  '5-3-1-1': [
    {x1:.50,y1:.84,x2:.50,y2:.94,cx:.50,cy:.90,c:'rgba(255,255,255,0.9)',w:2.4},
    {x1:.50,y1:.68,x2:.50,y2:.80,cx:.50,cy:.75,c:'rgba(255,255,255,0.9)',w:2.0},
    {x1:.06,y1:.24,x2:.06,y2:.46,cx:.04,cy:.36,c:'rgba(255,255,255,0.45)',w:1.4},
    {x1:.94,y1:.24,x2:.94,y2:.46,cx:.96,cy:.36,c:'rgba(255,255,255,0.45)',w:1.4},
    {x1:.22,y1:.52,x2:.30,y2:.62,cx:.24,cy:.58,c:'rgba(255,255,255,0.55)',w:1.3},
    {x1:.78,y1:.52,x2:.70,y2:.62,cx:.76,cy:.58,c:'rgba(255,255,255,0.55)',w:1.3},
  ],
  '5-4-1-A': [
    {x1:.50,y1:.82,x2:.50,y2:.93,cx:.50,cy:.88,c:'rgba(255,255,255,0.9)',w:2.4},
    {x1:.06,y1:.24,x2:.06,y2:.46,cx:.04,cy:.36,c:'rgba(255,255,255,0.45)',w:1.5},
    {x1:.94,y1:.24,x2:.94,y2:.46,cx:.96,cy:.36,c:'rgba(255,255,255,0.45)',w:1.5},
    {x1:.10,y1:.52,x2:.08,y2:.70,cx:.06,cy:.62,c:'rgba(255,255,255,0.55)',w:1.4},
    {x1:.90,y1:.52,x2:.92,y2:.70,cx:.94,cy:.62,c:'rgba(255,255,255,0.55)',w:1.4},
    {x1:.50,y1:.50,x2:.50,y2:.68,cx:.50,cy:.60,c:'rgba(255,255,255,0.55)',w:1.3},
  ],
  '5-4-1-B': [
    {x1:.50,y1:.82,x2:.50,y2:.93,cx:.50,cy:.88,c:'rgba(255,255,255,0.9)',w:2.4},
    {x1:.06,y1:.24,x2:.06,y2:.46,cx:.04,cy:.36,c:'rgba(255,255,255,0.45)',w:1.5},
    {x1:.94,y1:.24,x2:.94,y2:.46,cx:.96,cy:.36,c:'rgba(255,255,255,0.45)',w:1.5},
    {x1:.22,y1:.50,x2:.28,y2:.66,cx:.23,cy:.59,c:'rgba(255,255,255,0.55)',w:1.4},
    {x1:.78,y1:.50,x2:.72,y2:.66,cx:.77,cy:.59,c:'rgba(255,255,255,0.55)',w:1.4},
    {x1:.50,y1:.58,x2:.50,y2:.74,cx:.50,cy:.67,c:'rgba(255,255,255,0.55)',w:1.3},
  ],
  '6-3-1-A': [
    {x1:.50,y1:.82,x2:.50,y2:.93,cx:.50,cy:.88,c:'rgba(255,255,255,0.9)',w:2.4},
    {x1:.06,y1:.22,x2:.06,y2:.44,cx:.04,cy:.34,c:'rgba(255,255,255,0.45)',w:1.3},
    {x1:.94,y1:.22,x2:.94,y2:.44,cx:.96,cy:.34,c:'rgba(255,255,255,0.45)',w:1.3},
    {x1:.22,y1:.52,x2:.28,y2:.68,cx:.23,cy:.61,c:'rgba(255,255,255,0.55)',w:1.3},
    {x1:.78,y1:.52,x2:.72,y2:.68,cx:.77,cy:.61,c:'rgba(255,255,255,0.55)',w:1.3},
    {x1:.50,y1:.62,x2:.50,y2:.76,cx:.50,cy:.70,c:'rgba(255,255,255,0.55)',w:1.3},
  ],
  '6-3-1-B': [
    {x1:.50,y1:.82,x2:.50,y2:.93,cx:.50,cy:.88,c:'rgba(255,255,255,0.9)',w:2.4},
    {x1:.06,y1:.22,x2:.06,y2:.44,cx:.04,cy:.34,c:'rgba(255,255,255,0.45)',w:1.3},
    {x1:.94,y1:.22,x2:.94,y2:.44,cx:.96,cy:.34,c:'rgba(255,255,255,0.45)',w:1.3},
    {x1:.24,y1:.56,x2:.30,y2:.70,cx:.25,cy:.64,c:'rgba(255,255,255,0.55)',w:1.3},
    {x1:.76,y1:.56,x2:.70,y2:.70,cx:.75,cy:.64,c:'rgba(255,255,255,0.55)',w:1.3},
    {x1:.50,y1:.42,x2:.50,y2:.60,cx:.50,cy:.52,c:'rgba(255,255,255,0.55)',w:1.2},
  ],
};


// ─── CANVAS HELPERS ───────────────────────────────────────────────────
function toXY(nx: number, ny: number, cw: number, ch: number, pad: number) {
  const pl = pad, pr = cw - pad, pt = pad, pb = ch - pad;
  return { x: pl + nx * (pr - pl), y: pb - ny * (pb - pt) };
}

function drawBg(ctx: CanvasRenderingContext2D, cw: number, ch: number, pad: number) {
  const pl = pad, pr = cw - pad, pt = pad, pb = ch - pad, pw = pr - pl, ph = pb - pt;
  const ns = 8;
  // Green grass base
  ctx.fillStyle = '#0f4a20';
  ctx.fillRect(pl, pt, pw, ph);
  // Alternating stripes
  for (let i = 0; i < ns; i++) {
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)';
    ctx.fillRect(pl, pt + i * (ph / ns), pw, ph / ns);
  }
  // Bright field markings
  ctx.strokeStyle = 'rgba(255,255,255,0.82)'; ctx.lineWidth = 1; ctx.strokeRect(pl, pt, pw, ph);
  ctx.beginPath(); ctx.moveTo(pl, pt + ph / 2); ctx.lineTo(pr, pt + ph / 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(pl + pw / 2, pt + ph / 2, ph * .12, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.beginPath(); ctx.arc(pl + pw / 2, pt + ph / 2, 2, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 0.8;
  ctx.strokeRect(pl + pw * .22, pb - ph * .26, pw * .56, ph * .26);
  ctx.strokeRect(pl + pw * .35, pb - ph * .11, pw * .30, ph * .11);
  ctx.strokeRect(pl + pw * .22, pt, pw * .56, ph * .26);
  ctx.strokeRect(pl + pw * .35, pt, pw * .30, ph * .11);
  ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.lineWidth = 1.4;
  ctx.strokeRect(pl + pw * .36, pb, pw * .28, 6);
  ctx.strokeRect(pl + pw * .36, pt - 6, pw * .28, 6);
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.beginPath(); ctx.arc(pl + pw * .5, pt + ph * .18, 1.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(pl + pw * .5, pb - ph * .18, 1.5, 0, Math.PI * 2); ctx.fill();
  const vg = ctx.createRadialGradient(cw / 2, ch / 2, ch * .2, cw / 2, ch / 2, ch * .75);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.3)');
  ctx.fillStyle = vg; ctx.fillRect(0, 0, cw, ch);
}

function drawCurvedArrow(
  ctx: CanvasRenderingContext2D,
  x1: number, y1: number, cpx: number, cpy: number, x2: number, y2: number,
  col: string, lw: number, progress: number
) {
  if (progress <= 0) return;
  ctx.save();
  ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.shadowColor = col; ctx.shadowBlur = 7; ctx.globalAlpha = 0.88;
  const steps = 40;
  ctx.beginPath();
  for (let i = 0; i <= steps * progress; i++) {
    const t = i / steps;
    const bx = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * cpx + t * t * x2;
    const by = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * cpy + t * t * y2;
    i === 0 ? ctx.moveTo(bx, by) : ctx.lineTo(bx, by);
  }
  ctx.stroke();
  if (progress >= 0.98) {
    const t = 0.96;
    const bx2 = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * cpx + t * t * x2;
    const by2 = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * cpy + t * t * y2;
    const angle = Math.atan2(y2 - by2, x2 - bx2);
    const al = lw * 3.5, aa = 0.42;
    ctx.globalAlpha = 0.95; ctx.fillStyle = col;
    ctx.beginPath(); ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - al * Math.cos(angle - aa), y2 - al * Math.sin(angle - aa));
    ctx.lineTo(x2 - al * Math.cos(angle + aa), y2 - al * Math.sin(angle + aa));
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

function drawDot(
  ctx: CanvasRenderingContext2D,
  x1: number, y1: number, cpx: number, cpy: number, x2: number, y2: number,
  col: string, t: number
) {
  const bx = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * cpx + t * t * x2;
  const by = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * cpy + t * t * y2;
  const fade = t < 0.15 ? t / 0.15 : t > 0.85 ? (1 - t) / 0.15 : 1;
  ctx.save(); ctx.globalAlpha = 0.9 * fade;
  ctx.shadowColor = col; ctx.shadowBlur = 9;
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(bx, by, 2.8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(bx, by, 1.6, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawPlayer(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, role: string, _col: string, size: string,
  entranceProgress: number, pulsePhase: number
) {
  // monochrome: GK = white, DEF = rgba(255,255,255,0.6), MID = rgba(255,255,255,0.5), FWD = #ffffff
  const col =
    size === 'gk'  ? '#f5a623' :
    size === 'fwd' ? '#5b8af7' :
    size === 'mid' ? 'rgba(91,138,247,0.85)' :
    'rgba(16,217,161,0.85)';
  const r = size === 'fwd' ? 9 : size === 'gk' ? 9 : 8;
  const lw = size === 'fwd' ? 2.3 : size === 'gk' ? 2 : 1.8;
  if (size === 'fwd' || size === 'gk') {
    ctx.save(); ctx.globalAlpha = (1 - pulsePhase) * 0.35; ctx.strokeStyle = col; ctx.lineWidth = 0.9;
    ctx.shadowColor = col; ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.arc(x, y, r + pulsePhase * 9, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
  }
  ctx.save(); ctx.globalAlpha = entranceProgress;
  const sc2 = 0.1 + 0.9 * entranceProgress;
  ctx.translate(x, y); ctx.scale(sc2, sc2); ctx.translate(-x, -y);
  ctx.shadowColor = col; ctx.shadowBlur = 10;
  ctx.fillStyle = '#071a10'; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
  ctx.shadowBlur = 0;
  const fs = role.length > 3 ? 4.5 : role.length > 2 ? 5 : 6;
  ctx.fillStyle = '#ffffff'; ctx.font = `700 ${fs}px Inter,sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(role, x, y + 0.5);
  ctx.restore();
}

// ─── PITCH LABEL TRANSLATOR ───────────────────────────────────────────
// Translates the mentality suffix in an OPP_LIST label without touching the formation prefix.
// Matches longest suffix first to avoid partial hits (e.g. "Counter" before "Counter Attack").
function translateOppLabel(label: string, t: (k: string) => string): string {
  const map: Array<[string, string]> = [
    ['Shoot on Sight', 'mentality.shootOnSight'],
    ['Counter Attack', 'mentality.counterAttack'],
    ['Passing Game',   'mentality.passingGame'],
    ['Wing Play',      'mentality.wingPlay'],
    ['Long Ball',      'mentality.longBall'],
    ['Passing',        'mentality.passingGame'],
    ['Counter',        'mentality.counterAttack'],
  ];
  for (const [raw, key] of map) {
    if (label.endsWith(raw)) {
      return label.slice(0, label.length - raw.length).trimEnd() + ' ' + t(key);
    }
  }
  return label;
}

function getTacticCount(): number {
  const now = new Date();
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86_400_000);
  const minuteOfDay = now.getHours() * 60 + now.getMinutes();
  const base = 8_000 + (dayOfYear * 73) % 6_000;
  return base + Math.floor(minuteOfDay * 8.5);
}

// Maps the English data strings stored in TacticEntry (f / m / d / mrk)
// to their active-language translation via the t() hook caller.
function pitchVal(val: string, t: (k: string) => string): string {
  switch (val) {
    case 'Attack only':         return t('pitch.attackOnly');
    case 'Protect the defence': return t('pitch.protectDefense');
    case 'Stay in position':    return t('pitch.stayBack');
    case 'Defend deep':         return t('pitch.defendDeep');
    case 'Zone marking':        return t('pitch.zoneMarking');
    case 'Man marking':         return t('pitch.manMarking');
    default:                    return val;
  }
}

// ─── ATF i18n ─────────────────────────────────────────────────────────
const ATF_DESC: Record<string, string> = {
  tr: "Rakip formasyonunu seç — deterministik motor bu haftanın kesin kontra taktik değerlerini hesaplar. Her Pazartesi otomatik güncellenir.",
  en: "Select the opponent's formation — the deterministic engine calculates this week's precise counter-tactic values. Auto-updates every Monday.",
  hu: "Válaszd ki az ellenfél felállását — a motor kiszámítja ezen a héten az optimális taktikát. Automatikus frissítés minden hétfőn.",
  ar: "اختر تشكيلة الخصم — يحسب المحرك قيم التكتيك المضاد الدقيقة لهذا الأسبوع. يتحدث تلقائياً كل اثنين.",
  pt: "Selecione a formação adversária — o motor calcula os valores do contra-tático desta semana. Atualiza toda segunda-feira.",
};
const ATF_LIVE: Record<string, string> = {
  tr: "Her Pazartesi otomatik güncellenir · Deterministik motor",
  en: "Auto-updates every Monday · Deterministic engine",
  hu: "Automatikus frissítés minden hétfőn",
  ar: "يتحدث تلقائياً كل اثنين",
  pt: "Atualiza automaticamente toda segunda-feira",
};
const ATF_SLIDERS: Record<string, string> = {
  tr: "Bu Haftanın Optimal Slider Değerleri",
  en: "This Week's Optimal Slider Values",
  hu: "Ezen Hét Optimális Csúszkaértékei",
  ar: "الإعدادات المثالية لهذا الأسبوع",
  pt: "Sliders Ideais desta Semana",
};
const ATF_SAVE_AUTH: Record<string, string> = {
  tr: 'Taktiği garajına kaydetmek için giriş yap',
  en: 'Sign in to save this tactic to your garage',
  hu: 'Jelentkezz be a taktika mentéséhez',
  ar: 'سجّل الدخول لحفظ هذه التكتيكية',
  pt: 'Faça login para salvar esta tática',
};

// ─── GRADIENT HELPERS ─────────────────────────────────────────────────
function _pGrad(v: number): string {
  if (v >= 70) return 'linear-gradient(90deg,#f43f5e,#9161f5)';
  if (v >= 45) return 'linear-gradient(90deg,#f5a623,#f43f5e)';
  if (v >= 25) return 'linear-gradient(90deg,#10d9a1,#5b8af7)';
  return 'linear-gradient(90deg,#5b8af7,#9161f5)';
}
function _sGrad(v: number): string {
  if (v >= 70) return 'linear-gradient(90deg,#f43f5e,#9161f5)';
  if (v >= 45) return 'linear-gradient(90deg,#10d9a1,#5b8af7)';
  return 'linear-gradient(90deg,#5b8af7,#9161f5)';
}
function _tGrad(v: number): string {
  if (v >= 70) return 'linear-gradient(90deg,#f5a623,#f43f5e)';
  if (v >= 45) return 'linear-gradient(90deg,#10d9a1,#5b8af7)';
  return 'linear-gradient(90deg,#5b8af7,#9161f5)';
}

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────
function ATFSliderBar({ label, value, gradient, delay = 0 }: {
  label: string; value: number; gradient: string; delay?: number;
}) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
        <span style={{ color: 'rgba(255,255,255,0.42)', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</span>
        <motion.span
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: delay + 0.5 }}
          style={{ color: '#ffffff', fontWeight: 800, fontSize: 22, letterSpacing: '-0.02em', lineHeight: 1 }}
        >{value}</motion.span>
      </div>
      <div style={{ height: 10, borderRadius: 99, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
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
              background: 'linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.35) 50%,transparent 100%)',
              pointerEvents: 'none',
            }}
          />
        </motion.div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        {[0, 25, 50, 75, 99].map(tick => (
          <span key={tick} style={{ fontSize: 9, color: 'rgba(255,255,255,0.18)' }}>{tick}</span>
        ))}
      </div>
    </div>
  );
}

function ATFLineTacticRow({ label, rawVal: _rawVal, displayVal, isLast }: {
  label: string; rawVal: string; displayVal: string; isLast?: boolean;
}) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '7px 0', borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.04)',
    }}>
      <span style={{ color: 'rgba(255,255,255,0.42)', fontSize: 11.5, fontWeight: 600, letterSpacing: '0.04em' }}>{label}</span>
      <span style={{
        fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
        color: '#7eb8ff', padding: '3px 10px', borderRadius: 99,
        background: 'rgba(91,138,247,0.08)', border: '1px solid rgba(91,138,247,0.22)',
      }}>{displayVal}</span>
    </div>
  );
}

// ─── COMPONENT ────────────────────────────────────────────────────────
function useIsMobile() {
  const [mobile, setMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = (e: MediaQueryListEvent) => setMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return mobile;
}

export default function AntiTacticFinder() {
  const isMobile = useIsMobile();
  const mainCanvasRef = useRef<HTMLCanvasElement>(null);
  const ltCanvasRef   = useRef<HTMLCanvasElement>(null);
  const mainRAFRef    = useRef<number | null>(null);
  const ltRAFRef      = useRef<number | null>(null);
  const mainStartRef  = useRef<number | null>(null);
  const ltStartRef    = useRef<number | null>(null);

  const [locActive,      setLocActive]      = useState<'HOME MATCH' | 'AWAY'>('HOME MATCH');
  const [strActive,      setStrActive]      = useState<'STRONGER' | 'EQUAL' | 'WEAKER'>('EQUAL');
  const [selectedOppKey, setSelectedOppKey] = useState('433ab');
  const [activeOption,   setActiveOption]   = useState<'A' | 'B'>('A');
  const [hasSelected,    setHasSelected]    = useState(true);
  const [counterDisplay, setCounterDisplay] = useState(0);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [saving, setSaving] = useState(false);

  const { t, lang } = useLang();
  const { user, signInWithGoogle } = useAuth();
  const { saveTactic, deleteTactic, isSaved, savedId } = useSavedTactics();
  const styleLabel = (gpt: string) => {
    if (gpt === 'Wing Play')      return t('mentality.wingPlay');
    if (gpt === 'Counter Attack') return t('mentality.counterAttack');
    if (gpt === 'Shoot on Sight') return t('mentality.shootOnSight');
    if (gpt === 'Passing Game')   return t('mentality.passingGame');
    if (gpt === 'Long Ball')      return t('mentality.longBall');
    return gpt;
  };

  function getEntry(loc: string, str: string, oppKey: string): TacticEntry | undefined {
    const l = loc === 'HOME MATCH' ? 'home' : 'away';
    const s = str.toLowerCase() as 'stronger' | 'equal' | 'weaker';
    return TD.find(e => e.location === l && e.strength === s && e.oppKey === oppKey);
  }

  function pick(): TacticEntry {
    return getEntry(locActive, strActive, selectedOppKey) ?? TD[0];
  }

  // When location changes, if the selected opp has no data for new loc, reset to first available
  function handleLocChange(loc: 'HOME MATCH' | 'AWAY') {
    setLocActive(loc);
    setActiveOption('A');
    const l = loc === 'HOME MATCH' ? 'home' : 'away';
    const s = strActive.toLowerCase() as 'stronger' | 'equal' | 'weaker';
    const hasMatch = TD.some(e => e.location === l && e.strength === s && e.oppKey === selectedOppKey);
    if (!hasMatch) {
      const first = TD.find(e => e.location === l && e.strength === s);
      if (first) setSelectedOppKey(first.oppKey);
    }
  }

  const visibleOpps = OPP_LIST.filter(o => {
    const l = locActive === 'HOME MATCH' ? 'home' : 'away';
    const s = strActive.toLowerCase() as 'stronger' | 'equal' | 'weaker';
    return TD.some(e => e.location === l && e.strength === s && e.oppKey === o.key);
  });

  const d = pick();
  const comboKey = `${locActive}-${strActive}-${selectedOppKey}-${activeOption}`;
  const tacticSaved = isSaved(comboKey);

  useEffect(() => { if (user) setShowAuthPrompt(false); }, [user]);

  useEffect(() => {
    const target = getTacticCount();
    const duration = 1200;
    const start = performance.now();
    let raf: number | null = null;
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setCounterDisplay(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { if (raf !== null) cancelAnimationFrame(raf); };
  }, []);

  useEffect(() => {
    function renderMain(fmKey: string) {
      if (mainRAFRef.current) { cancelAnimationFrame(mainRAFRef.current); mainRAFRef.current = null; }
      mainStartRef.current = null;
      const canvas = mainCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d')!;
      const cw = canvas.width, ch = canvas.height, pad = 9;
      const players = FM[fmKey] || FM['4-4-2-A'];
      const arrows  = AR[fmKey] || AR['4-4-2-A'];
      const ARROW_START = 0.55, ARROW_STAGGER = 0.1, ARROW_DUR = 0.5;
      const PLAYER_STAGGER = 0.07;

      // Stop the loop after all animations complete (~3s) to prevent infinite CPU drain on mobile
      const MAIN_MAX = 3.2;
      function frame(ts: number) {
        if (!mainStartRef.current) mainStartRef.current = ts;
        const el = (ts - mainStartRef.current) / 1000;
        ctx.clearRect(0, 0, cw, ch);
        drawBg(ctx, cw, ch, pad);
        arrows.forEach((a, i) => {
          const delay = ARROW_START + i * ARROW_STAGGER;
          const prog  = Math.min(Math.max((el - delay) / ARROW_DUR, 0), 1);
          const p1 = toXY(a.x1, a.y1, cw, ch, pad);
          const p2 = toXY(a.x2, a.y2, cw, ch, pad);
          const cp = toXY(a.cx, a.cy, cw, ch, pad);
          drawCurvedArrow(ctx, p1.x, p1.y, cp.x, cp.y, p2.x, p2.y, a.c, a.w, prog);
          if (prog >= 1) {
            const dotT = ((el - delay - ARROW_DUR + i * 0.15) * 0.4) % 1;
            drawDot(ctx, p1.x, p1.y, cp.x, cp.y, p2.x, p2.y, a.c, Math.max(0, dotT));
          }
        });
        players.forEach((p, i) => {
          const delay = i * PLAYER_STAGGER;
          const prog  = Math.min(Math.max((el - delay) / 0.3, 0), 1);
          if (prog <= 0) return;
          const { x, y } = toXY(p.x, p.y, cw, ch, pad);
          const pulse = (el * 0.55 + i * 0.22) % 1;
          drawPlayer(ctx, x, y, p.r, p.c, p.s, prog, pulse);
        });
        if (el < MAIN_MAX) {
          mainRAFRef.current = requestAnimationFrame(frame);
        } else {
          mainRAFRef.current = null;
        }
      }
      mainRAFRef.current = requestAnimationFrame(frame);
    }

    function renderLT(fwdTxt: string, midTxt: string) {
      if (ltRAFRef.current) { cancelAnimationFrame(ltRAFRef.current); ltRAFRef.current = null; }
      ltStartRef.current = null;
      const canvas = ltCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d')!;
      const cw = canvas.width, ch = canvas.height, pad = 6;

      function toL(nx: number, ny: number) { return toXY(nx, ny, cw, ch, pad); }
      function arrow(x1: number, y1: number, cpx: number, cpy: number, x2: number, y2: number, col: string, lw: number, prog: number) {
        drawCurvedArrow(ctx, x1, y1, cpx, cpy, x2, y2, col, lw, prog);
      }

      function frame(ts: number) {
        if (!ltStartRef.current) ltStartRef.current = ts;
        const el = (ts - ltStartRef.current) / 1000;
        ctx.clearRect(0, 0, cw, ch);
        drawBg(ctx, cw, ch, pad);

        // FWD — blue upward arrow
        { const p1 = toL(.5, .78), p2 = toL(.5, .93), cp = toL(.5, .86);
          const pr = Math.min(el / 0.4, 1);
          arrow(p1.x, p1.y, cp.x, cp.y, p2.x, p2.y, 'rgba(255,255,255,0.85)', 3.5, pr); }
        if (fwdTxt === 'Hold up play' || fwdTxt === 'Hold Up Play') {
          const p1 = toL(.5, .76), p2 = toL(.5, .83), cp = toL(.5, .80);
          const pr = Math.min(el / 0.4, 1);
          ctx.save(); ctx.globalAlpha = 0.4;
          arrow(p1.x, p1.y, cp.x, cp.y, p2.x, p2.y, 'rgba(255,255,255,0.85)', 2, pr);
          ctx.restore();
        }

        // MID
        const md = 0.2, mp = Math.min(Math.max((el - md) / 0.4, 0), 1);
        const cx = toL(.5, .5);
        if (midTxt === 'Stay in position') {
          [{ dx: .22, dy: 0 }, { dx: -.22, dy: 0 }, { dx: 0, dy: .10 }, { dx: 0, dy: -.10 }].forEach(({ dx, dy }) => {
            const e = toL(.5 + dx, .5 + dy);
            arrow(cx.x, cx.y, (cx.x + e.x) / 2, (cx.y + e.y) / 2, e.x, e.y, 'rgba(255,255,255,0.55)', 2, mp);
          });
          ctx.save(); ctx.globalAlpha = mp; ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.shadowColor = 'rgba(255,255,255,0.55)'; ctx.shadowBlur = 6;
          ctx.beginPath(); ctx.arc(cx.x, cx.y, 3.5, 0, Math.PI * 2); ctx.fill(); ctx.restore();
        } else if (midTxt === 'Box to box' || midTxt === 'Box to Box') {
          const p1l = toL(.5, .56), cpl = toL(.28, .44), p2l = toL(.16, .50);
          const p1r = toL(.5, .56), cpr = toL(.72, .44), p2r = toL(.84, .50);
          arrow(p1l.x, p1l.y, cpl.x, cpl.y, p2l.x, p2l.y, 'rgba(255,255,255,0.55)', 2, mp);
          arrow(p1r.x, p1r.y, cpr.x, cpr.y, p2r.x, p2r.y, 'rgba(255,255,255,0.55)', 2, mp);
        } else if (midTxt === 'Get forward' || midTxt === 'Get Forward') {
          const pa = toL(.36, .50), pb2 = toL(.36, .70), pco = toL(.36, .61);
          const pa2 = toL(.64, .50), pb3 = toL(.64, .70), pco2 = toL(.64, .61);
          arrow(pa.x, pa.y, pco.x, pco.y, pb2.x, pb2.y, 'rgba(255,255,255,0.55)', 2, mp);
          arrow(pa2.x, pa2.y, pco2.x, pco2.y, pb3.x, pb3.y, 'rgba(255,255,255,0.55)', 2, mp);
        } else if (midTxt === 'Protect the defence' || midTxt === 'Protect Def.') {
          const p1l = toL(.38, .52), cpl = toL(.30, .38), p2l = toL(.26, .30);
          const p1r = toL(.62, .52), cpr = toL(.70, .38), p2r = toL(.74, .30);
          arrow(p1l.x, p1l.y, cpl.x, cpl.y, p2l.x, p2l.y, 'rgba(255,255,255,0.55)', 2, mp);
          arrow(p1r.x, p1r.y, cpr.x, cpr.y, p2r.x, p2r.y, 'rgba(255,255,255,0.55)', 2, mp);
        } else if (midTxt === 'Normal') {
          const p1 = toL(.5, .50), p2 = toL(.5, .68), cp = toL(.5, .60);
          arrow(p1.x, p1.y, cp.x, cp.y, p2.x, p2.y, 'rgba(255,255,255,0.55)', 2, mp);
        } else {
          const p1 = toL(.5, .5), p2 = toL(.5, .70), cp = toL(.5, .61);
          arrow(p1.x, p1.y, cp.x, cp.y, p2.x, p2.y, 'rgba(255,255,255,0.55)', 2, mp);
        }

        // DEF — orange downward arrow
        { const p1 = toL(.5, .28), p2 = toL(.5, .14), cp = toL(.5, .21);
          const pr = Math.min(Math.max((el - .35) / .4, 0), 1);
          arrow(p1.x, p1.y, cp.x, cp.y, p2.x, p2.y, 'rgba(255,255,255,0.55)', 3, pr);
          ctx.save(); ctx.globalAlpha = Math.min(el / .55, .85); ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.shadowColor = 'rgba(255,255,255,0.55)'; ctx.shadowBlur = 5;
          ctx.beginPath(); ctx.arc(p1.x, p1.y, 3, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }

        if (el > 1.2) {
          const fp1 = toL(.5, .78), fp2 = toL(.5, .93), fcp = toL(.5, .86);
          drawDot(ctx, fp1.x, fp1.y, fcp.x, fcp.y, fp2.x, fp2.y, 'rgba(255,255,255,0.85)', ((el - 1.2) * .5) % 1);
        }
        // Stop after animations complete to prevent infinite CPU drain on mobile
        if (el < 3.0) {
          ltRAFRef.current = requestAnimationFrame(frame);
        } else {
          ltRAFRef.current = null;
        }
      }
      ltRAFRef.current = requestAnimationFrame(frame);
    }

    const entry = pick();
    renderMain(entry.fm);
    renderLT(entry.f, entry.m);

    return () => {
      if (mainRAFRef.current) { cancelAnimationFrame(mainRAFRef.current); mainRAFRef.current = null; }
      if (ltRAFRef.current)   { cancelAnimationFrame(ltRAFRef.current);   ltRAFRef.current   = null; }
    };
  }, [locActive, strActive, selectedOppKey]);

  useEffect(() => {
    if (!hasSelected) return;
    analytics.antiTacticSearch(
      selectedOppKey,
      locActive === 'HOME MATCH' ? 'home' : 'away',
      strActive.toLowerCase(),
    );
  }, [locActive, strActive, selectedOppKey, hasSelected]);

  function doReset() {
    setLocActive('HOME MATCH');
    setStrActive('EQUAL');
    setSelectedOppKey('433ab');
    setActiveOption('A');
    setHasSelected(true);
  }

  return (
    <section id="anti-taktik" className="atf-wrap">
      {/* ambient glows — static on mobile to prevent GPU drain */}
      <motion.div
        aria-hidden="true"
        animate={isMobile ? { opacity: 0.22 } : { opacity: [0.14, 0.38, 0.14] }}
        transition={isMobile ? {} : { duration: 7, repeat: Infinity }}
        style={{ position:'absolute', top:'4%', right:'-10%', width:'48%', height:'58%', borderRadius:'50%', background:'radial-gradient(ellipse, rgba(91,138,247,0.08) 0%, transparent 70%)', filter:'blur(90px)', pointerEvents:'none', zIndex:0 }}
      />
      <div aria-hidden="true" style={{ position:'absolute', bottom:'8%', left:'-8%', width:'40%', height:'50%', borderRadius:'50%', background:'radial-gradient(ellipse, rgba(16,217,161,0.07) 0%, transparent 70%)', filter:'blur(80px)', pointerEvents:'none', zIndex:0 }} />

      {/* ── Section heading (outside card) ── */}
      <motion.div
        className="atf-head"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55 }}
      >
        <div className="atf-head-badge">
          <span className="atf-head-dot" />
          {t("anti.badge")}
        </div>
        <h2 className="atf-head-title">{t("anti.title")} <span>{t("anti.title2")}</span></h2>
        <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: 'clamp(13px,2vw,15px)', lineHeight: 1.7, maxWidth: 640, margin: '14px auto 20px', textAlign: 'center' }}>
          {ATF_DESC[lang] ?? ATF_DESC.en}
        </p>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 99, background: 'rgba(16,217,161,0.08)', border: '1px solid rgba(16,217,161,0.28)' }}>
          <motion.span
            animate={{ opacity: [1, 0.35, 1] }} transition={{ duration: 2, repeat: Infinity }}
            style={{ width: 6, height: 6, borderRadius: '50%', background: '#10d9a1', display: 'inline-block' }}
          />
          <span style={{ color: '#4aedc0', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em' }}>
            {ATF_LIVE[lang] ?? ATF_LIVE.en}
          </span>
        </div>
      </motion.div>

      <div className="root">
        <div className="page-hdr">
          <motion.div
            className="counter-badge"
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="cbdot"></span>
            <span className="cbnum">{counterDisplay.toLocaleString()}</span>
            <span className="cblbl">{t("anti.tacticsToday")}</span>
          </motion.div>
          <button className="reset-btn" onClick={doReset}>{t("anti.reset")}</button>
        </div>

        <div className="body">
          {/* ── LEFT PANEL ── */}
          <div className="left">
            <div>
              <div className="slbl"><span className="snum">1</span> {t("tactical.step1")}</div>
              <div className="seg">
                <button className={`sbtn${locActive === 'HOME MATCH' ? ' on' : ''}`} onClick={() => handleLocChange('HOME MATCH')}>{t("tactical.home")}</button>
                <button className={`sbtn${locActive === 'AWAY' ? ' on' : ''}`}       onClick={() => handleLocChange('AWAY')}>{t("tactical.away")}</button>
              </div>
            </div>

            <div>
              <div className="slbl"><span className="snum">2</span> {t("tactical.step2")}</div>
              <div className="tlist">
                {visibleOpps.map((opp) => {
                  const entry = getEntry(locActive, strActive, opp.key);
                  const sr = entry?.sr ?? 0;
                  const isOn = selectedOppKey === opp.key;
                  return (
                    <motion.div
                      key={opp.key}
                      className={`ti${isOn ? ' on' : ''}`}
                      style={{ animationDelay: (visibleOpps.indexOf(opp) * 0.04) + 's', position: 'relative', overflow: 'hidden' }}
                      whileHover={{ scale: 1.015 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                      onClick={() => { setSelectedOppKey(opp.key); setActiveOption('A'); setHasSelected(true); }}
                    >
                      <AnimatePresence>
                        {isOn && (
                          <motion.div
                            key="ring"
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.22 }}
                            style={{
                              position: 'absolute', inset: 0, borderRadius: 12,
                              border: '1.5px solid rgba(255,255,255,0.35)',
                              boxShadow: '0 0 14px rgba(255,255,255,0.08), inset 0 0 10px rgba(255,255,255,0.03)',
                              pointerEvents: 'none',
                            }}
                          />
                        )}
                      </AnimatePresence>
                      <div className="tirow">
                        <motion.div
                          className="tico"
                          animate={isOn ? { scale: [1, 1.12, 1] } : { scale: 1 }}
                          transition={{ duration: 1.6, repeat: isOn ? Infinity : 0, ease: 'easeInOut' }}
                        >{opp.icon}</motion.div>
                        <div className="tiname">{translateOppLabel(opp.label, t)}</div>
                      </div>
                      <div className="barrow">
                        <div className="barbg"><div className="barfill" style={{ width: sr + '%' }}></div></div>
                        <div className="barpct">{sr}%</div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="slbl"><span className="snum">3</span> {t("tactical.step3")}</div>
              <div className="seg strseg">
                <button className={`sbtn${strActive === 'STRONGER' ? ' on' : ''}`} onClick={() => { setStrActive('STRONGER'); setActiveOption('A'); }}>{t("tactical.stronger")}</button>
                <button className={`sbtn${strActive === 'EQUAL'    ? ' on' : ''}`} onClick={() => { setStrActive('EQUAL');    setActiveOption('A'); }}>{t("tactical.equal")}</button>
                <button className={`sbtn${strActive === 'WEAKER'   ? ' on' : ''}`} onClick={() => { setStrActive('WEAKER');   setActiveOption('A'); }}>{t("tactical.weaker")}</button>
              </div>
            </div>
          </div>

          {/* ── RIGHT PANEL ── */}
          <div className="right">
            <div className="rsteplbl"><span className="snum">4</span> {t("anti.recommended")}</div>

            {/* ── EMPTY / RESULTS — Framer Motion crossfade ── */}
            <AnimatePresence mode="wait">
              {!hasSelected ? (
                <motion.div
                  key="empty"
                  className="atf-empty"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                >
                  <div style={{ position: 'relative', width: 68, height: 68, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
                      style={{
                        position: 'absolute', inset: 0, borderRadius: '50%',
                        border: '2.5px solid rgba(255,255,255,.1)',
                        borderTopColor: 'rgba(255,255,255,.85)',
                        filter: 'drop-shadow(0 0 7px rgba(255,255,255,.4)) drop-shadow(0 0 18px rgba(255,255,255,.15))',
                      }}
                    />
                    <motion.div
                      animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.25, 0.8] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                      style={{
                        width: 10, height: 10, borderRadius: '50%',
                        background: 'rgba(255,255,255,.6)',
                        boxShadow: '0 0 14px rgba(255,255,255,.7), 0 0 30px rgba(255,255,255,.3)',
                      }}
                    />
                  </div>
                  <div className="atf-empty-title">{t("anti.waitingTitle")}</div>
                  <div className="atf-empty-sub">{t("anti.waitingText")}</div>
                </motion.div>
              ) : (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
                >

            {/* ── COUNTER TACTIC HERO REVEAL ── */}
            <div className="tc-hero">
              {/* Shimmer sweep */}
              <motion.div
                animate={{ x: ['-140%', '280%'] }}
                transition={{ repeat: Infinity, repeatDelay: 4.5, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
                  background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.05) 50%, transparent 70%)',
                  transform: 'skewX(-12deg)',
                }}
              />
              {/* Top row: eyebrow + field tested badge + save */}
              <div className="tc-top">
                <div className="tc-eyebrow">
                  <span className="tc-dot" />
                  {t("anti.yourCounter")}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className="ftbadge">★ {t("anti.fieldTested")}</div>
                  <motion.button
                    whileHover={{ scale: 1.12 }}
                    whileTap={{ scale: 0.85 }}
                    onClick={async () => {
                      if (!user) { setShowAuthPrompt(v => !v); return; }
                      const id = savedId(comboKey);
                      if (id) { deleteTactic(id); return; }
                      setSaving(true);
                      setSaveError(false);
                      const dispP = activeOption === 'B' && d.optionB ? d.optionB.p : d.p;
                      const dispS = activeOption === 'B' && d.optionB ? d.optionB.s : d.s;
                      const dispT = activeOption === 'B' && d.optionB ? d.optionB.t : d.t;
                      try {
                        await saveTactic({
                          comboKey, location: d.location, strength: d.strength,
                          opponentKey: d.oppKey, opponentLabel: d.oppLabel || d.label,
                          counterFormation: d.counter, gamePlan: d.gp.text, gamePlanIcon: d.gp.icon,
                          pressure: dispP, style: dispS, tempo: dispT,
                          forwards: d.f, midfield: d.m, defence: d.d,
                          offside: d.offOn, marking: d.mrk,
                          badge: d.badge, successRate: d.sr, option: activeOption,
                        });
                      } catch (err) {
                        console.error('[Garage] saveTactic failed:', err);
                        setSaveError(true);
                        setTimeout(() => setSaveError(false), 4000);
                      } finally {
                        setSaving(false);
                      }
                    }}
                    disabled={saving}
                    aria-label={tacticSaved ? 'Garajdan kaldır' : 'Garaja kaydet'}
                    style={{
                      width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                      border: saveError
                        ? '1px solid rgba(255,255,255,0.3)'
                        : tacticSaved ? '1px solid rgba(255,255,255,0.35)' : '1px solid rgba(255,255,255,0.12)',
                      background: saveError
                        ? 'rgba(255,255,255,0.08)'
                        : tacticSaved ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)',
                      color: saveError
                        ? '#ffffff'
                        : tacticSaved ? '#ffffff' : 'rgba(255,255,255,0.38)',
                      fontSize: 15, cursor: saving ? 'default' : 'pointer', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', transition: 'all 0.2s ease',
                      opacity: saving ? 0.5 : 1,
                    }}
                  >
                    {saving ? '⏳' : saveError ? '✕' : tacticSaved ? '★' : '☆'}
                  </motion.button>
                </div>
              </div>
              {/* Giant counter tactic name — animates on change */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={d.counter}
                  className="tc-name"
                  initial={{ opacity: 0, y: 10, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
                  transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                >
                  {d.counter}
                </motion.div>
              </AnimatePresence>
              {/* Bottom: game plan + badges + opponent context */}
              <div className="tc-bottom">
                <div className="tc-gp">
                  <div className="gplbl">{t("anti.gamePlan")}</div>
                  <div className="gpico">{d.gp.icon}</div>
                  <div className="gptxt">{styleLabel(d.gp.text)}</div>
                </div>
                <div className="tc-meta">
                  <span style={{
                    fontSize: '8px', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase',
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.18)',
                    color: 'rgba(255,255,255,0.75)', borderRadius: '6px', padding: '3px 10px',
                    display: 'inline-flex', alignItems: 'center', gap: '3px',
                  }}>
                    {locActive === 'HOME MATCH' ? '🏠' : '✈️'}&nbsp;{locActive === 'HOME MATCH' ? t("anti.masterHome") : t("anti.masterAway")}
                  </span>
                  <span style={{
                    fontSize: '8px', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.18)',
                    color: 'rgba(255,255,255,0.8)',
                    borderRadius: '6px', padding: '3px 10px', display: 'inline-flex', alignItems: 'center',
                  }}>
                    {d.badge === 'STRONG' ? t("anti.badgeElite") : d.badge === 'SOLID' ? t("anti.badgeSolid") : t("anti.badgeSit")}
                  </span>
                  <div className="tc-vs">
                    <span className="tc-vs-lbl">{t("anti.oppPlays")}</span>
                    <span className="tc-vs-sep">|</span>
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={d.label}
                        className="tc-vs-val"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >{d.label}</motion.span>
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>

            {/* ── SAVE ERROR (Firestore write failed) ── */}
            <AnimatePresence>
              {saveError && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  style={{
                    background: 'rgba(239,68,68,0.1)', backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10,
                    padding: '10px 14px', marginBottom: 8,
                    fontSize: 11.5, color: '#fca5a5', lineHeight: 1.5, textAlign: 'center',
                  }}
                >
                  {lang === 'tr'
                    ? '⚠️ Garaja kaydedilemedi. Giriş yaptığından emin ol ve tekrar dene.'
                    : '⚠️ Could not save to garage. Make sure you\'re signed in and try again.'}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── AUTH PROMPT (save button → not logged in) ── */}
            <AnimatePresence>
              {showAuthPrompt && !user && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12,
                    padding: '14px 18px', display: 'flex', flexDirection: 'column',
                    gap: 12, alignItems: 'center',
                  }}
                >
                  <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.62)', textAlign: 'center', lineHeight: 1.5 }}>
                    {ATF_SAVE_AUTH[lang] ?? ATF_SAVE_AUTH.en}
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { signInWithGoogle().catch(console.error); setShowAuthPrompt(false); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '9px 20px', borderRadius: 9,
                      border: '1px solid rgba(255,255,255,0.14)',
                      background: 'rgba(255,255,255,0.07)',
                      color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Google ile Giriş Yap
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="midrow">
              <div className="main-pitch-wrap">
                <canvas ref={mainCanvasRef} id="mainCanvas" width="320" height="430" style={{ display: 'block', borderRadius: '10px' }} />
              </div>

              <div className="statscol">
                {/* ── OPTION A / B TOGGLE ── */}
                {d.optionB && (
                  <div style={{
                    display:'flex',gap:'4px',
                    background:'rgba(255,255,255,0.04)',
                    border:'1px solid rgba(255,255,255,0.1)',
                    borderRadius:'8px',padding:'3px',
                    marginBottom:'10px',
                  }}>
                    <button onClick={() => setActiveOption('A')} style={{
                      flex:1,padding:'5px 0',borderRadius:'6px',border:'none',
                      cursor:'pointer',fontSize:'11px',fontWeight:700,
                      letterSpacing:'0.05em',transition:'all 0.2s',
                      background: activeOption === 'A' ? '#ffffff' : 'transparent',
                      color: activeOption === 'A' ? '#000000' : 'rgba(255,255,255,0.4)',
                      boxShadow: 'none',
                    }}>
                      {t("anti.optA")} <span style={{opacity:0.7,fontSize:'9px'}}>({t("anti.optADefault")})</span>
                    </button>
                    <button onClick={() => setActiveOption('B')} style={{
                      flex:1,padding:'5px 0',borderRadius:'6px',border:'none',
                      cursor:'pointer',fontSize:'11px',fontWeight:700,
                      letterSpacing:'0.05em',transition:'all 0.2s',
                      background: activeOption === 'B' ? '#ffffff' : 'transparent',
                      color: activeOption === 'B' ? '#000000' : 'rgba(255,255,255,0.4)',
                      boxShadow: 'none',
                    }}>
                      {t("anti.optB")} <span style={{opacity:0.7,fontSize:'9px'}}>({t("anti.optBAlt")})</span>
                    </button>
                  </div>
                )}
                {(() => {
                    const dispP = activeOption === 'B' && d.optionB ? d.optionB.p : d.p;
                    const dispS = activeOption === 'B' && d.optionB ? d.optionB.s : d.s;
                    const dispT = activeOption === 'B' && d.optionB ? d.optionB.t : d.t;
                    const sliderKey = `${locActive}-${strActive}-${selectedOppKey}-${activeOption}`;
                    return (
                      <motion.div
                        key={sliderKey}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        style={{
                          background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)',
                          border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16,
                          padding: '20px 18px',
                          boxShadow: '0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 8 }}>
                          <span style={{ color: '#ffffff', fontWeight: 800, fontSize: 13, letterSpacing: '0.04em' }}>{ATF_SLIDERS[lang] ?? ATF_SLIDERS.en}</span>
                          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.22)', letterSpacing: '0.04em' }}>{ATF_LIVE[lang] ?? ATF_LIVE.en}</span>
                        </div>
                        <ATFSliderBar label={t("anti.pressure")} value={dispP} gradient={_pGrad(dispP)} delay={0} />
                        <ATFSliderBar label={t("anti.style")}    value={dispS} gradient={_sGrad(dispS)} delay={0.12} />
                        <ATFSliderBar label={t("anti.tempo")}    value={dispT} gradient={_tGrad(dispT)} delay={0.24} />
                      </motion.div>
                    );
                  })()}

                <div className="sucbox">
                  <div className="suctop">
                    <div className="suclbl">{t("anti.successRate")}</div>
                    <div className="sucval">
                      <span className="sucbadge">{d.badge}</span>
                      <span>{d.sr}%</span>
                    </div>
                  </div>
                  <div className="sucbar">
                    <div className="sucfill" style={{ width: d.sr + '%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="lt-header">{t("pitch.lineTactics")}</div>
                  <div className="lt-main">
                    <div className="lt-pitch-wrap">
                      <canvas ref={ltCanvasRef} id="ltCanvas" width="160" height="210" style={{ display: 'block' }} />
                    </div>
                    <div style={{ flex: 1, paddingTop: 4 }}>
                      <ATFLineTacticRow label={t("lt.forwards")} rawVal={d.f} displayVal={pitchVal(d.f, t)} />
                      <ATFLineTacticRow label={t("lt.midfield")} rawVal={d.m} displayVal={pitchVal(d.m, t)} />
                      <ATFLineTacticRow label={t("lt.defence")}  rawVal={d.d} displayVal={pitchVal(d.d, t)} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0 4px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <span style={{ color: 'rgba(255,255,255,0.42)', fontSize: 11.5, fontWeight: 600, letterSpacing: '0.04em' }}>{t("lt.offsides")}</span>
                        <span style={{
                          fontSize: 10.5, fontWeight: 700, padding: '3px 10px', borderRadius: 99,
                          background: 'rgba(255,255,255,0.06)',
                          border: '1px solid rgba(255,255,255,0.12)',
                          color: 'rgba(255,255,255,0.8)',
                        }}>{d.offOn ? t("pitch.offsideYes") : t("pitch.offsideNo")}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 7 }}>
                        <span style={{ color: 'rgba(255,255,255,0.42)', fontSize: 11.5, fontWeight: 600, letterSpacing: '0.04em' }}>{t("lt.marking")}</span>
                        <span style={{
                          fontSize: 10.5, fontWeight: 700, padding: '3px 10px', borderRadius: 99,
                          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)',
                        }}>{pitchVal(d.mrk, t)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="coach">{`${locActive === 'HOME MATCH' ? t('anti.locHome') : t('anti.locAway')} + ${strActive === 'STRONGER' ? t('anti.strStronger') : strActive === 'EQUAL' ? t('anti.strEqual') : t('anti.strWeaker')}: ${d.counter} — ${t('anti.pressure')} ${activeOption === 'B' && d.optionB ? d.optionB.p : d.p} / ${t('anti.style')} ${activeOption === 'B' && d.optionB ? d.optionB.s : d.s} / ${t('anti.tempo')} ${activeOption === 'B' && d.optionB ? d.optionB.t : d.t}`}</div>

                </motion.div>
              )}
            </AnimatePresence>

            <div className="alt-sep">
              <div className="alt-sep-line" />
              <div className="alt-sep-lbl">{t("anti.highValueAlt")}</div>
              <div className="alt-sep-line" />
            </div>
            <HomeTacticHero />
          </div>
        </div>
      </div>
    </section>
  );
}
