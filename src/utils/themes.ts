import { ThemeId } from '../types/index.ts';

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  badge: string;
  description: string;
  bgClass: string;
  cardBg: string;
  cardBorder: string;
  accentText: string;
  accentBg: string;
  glowColor: string;
  previewColors: [string, string, string];
}

export const THEMES: Record<ThemeId, ThemeDefinition> = {
  casio: {
    id: 'casio',
    name: 'Casio Retro Emerald',
    badge: 'Vintage Watch',
    description: 'Classic LCD digital watch palette with warm emerald phosphors',
    bgClass: 'bg-[#06120b] text-[#bbf7d0]',
    cardBg: 'bg-[#0b1e13]/80 backdrop-blur-md',
    cardBorder: 'border-[#1e462f]',
    accentText: 'text-emerald-400',
    accentBg: 'bg-emerald-500 hover:bg-emerald-400 text-black',
    glowColor: 'shadow-emerald-950/60',
    previewColors: ['#06120b', '#10b981', '#0b1e13'],
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight OLED',
    badge: 'OLED Black',
    description: 'Deep obsidian backdrop with high-contrast electric cyan highlights',
    bgClass: 'bg-[#030712] text-slate-100',
    cardBg: 'bg-[#0b1329]/70 backdrop-blur-md',
    cardBorder: 'border-cyan-900/40',
    accentText: 'text-cyan-400',
    accentBg: 'bg-cyan-500 hover:bg-cyan-400 text-slate-950',
    glowColor: 'shadow-cyan-950/60',
    previewColors: ['#030712', '#06b6d4', '#0f172a'],
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyber Neon',
    badge: 'Vibrant',
    description: 'Futuristic midnight purple infused with neon magenta and amber',
    bgClass: 'bg-[#090514] text-purple-100',
    cardBg: 'bg-[#150d2e]/70 backdrop-blur-md',
    cardBorder: 'border-purple-800/40',
    accentText: 'text-fuchsia-400',
    accentBg: 'bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white',
    glowColor: 'shadow-fuchsia-950/60',
    previewColors: ['#090514', '#d946ef', '#1e1b4b'],
  },
  sunset: {
    id: 'sunset',
    name: 'Warm Sunset',
    badge: 'Warm',
    description: 'Cozy charcoal bronze with warm amber and sunset glow',
    bgClass: 'bg-[#0f0b09] text-amber-100',
    cardBg: 'bg-[#1c1512]/70 backdrop-blur-md',
    cardBorder: 'border-amber-900/40',
    accentText: 'text-amber-400',
    accentBg: 'bg-amber-500 hover:bg-amber-400 text-stone-950',
    glowColor: 'shadow-amber-950/60',
    previewColors: ['#0f0b09', '#f59e0b', '#292524'],
  },
  slate: {
    id: 'slate',
    name: 'Nordic Slate',
    badge: 'Minimal',
    description: 'Clean monochrome steel slate with frosty glacier accents',
    bgClass: 'bg-[#0b0f17] text-slate-200',
    cardBg: 'bg-[#131b2a]/70 backdrop-blur-md',
    cardBorder: 'border-slate-800',
    accentText: 'text-sky-400',
    accentBg: 'bg-sky-500 hover:bg-sky-400 text-slate-950',
    glowColor: 'shadow-sky-950/60',
    previewColors: ['#0b0f17', '#38bdf8', '#1e293b'],
  },
  forest: {
    id: 'forest',
    name: 'Zen Forest',
    badge: 'Calming',
    description: 'Deep spruce moss with gentle sage and mint accents',
    bgClass: 'bg-[#07130e] text-emerald-100',
    cardBg: 'bg-[#0d221a]/70 backdrop-blur-md',
    cardBorder: 'border-emerald-900/40',
    accentText: 'text-teal-400',
    accentBg: 'bg-teal-500 hover:bg-teal-400 text-slate-950',
    glowColor: 'shadow-teal-950/60',
    previewColors: ['#07130e', '#14b8a6', '#064e3b'],
  },
};
