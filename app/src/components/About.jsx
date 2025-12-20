import React, { useState } from 'react';
import { 
  Github, FileText, Zap, Map, ArrowLeft, 
  Sparkles, Moon, Sun, ArrowRight 
} from 'lucide-react';

const AboutPage = () => {
  // 1. STATE: Default to Dark Mode (true)
  const [isDarkMode, setIsDarkMode] = useState(true);

  // 2. THEME CONFIGURATION
  // This boils down the visual differences into variables.
  // It makes the JSX much easier to read.
  const theme = isDarkMode ? {
    // Dark Mode (Hacker Style)
    container: "bg-zinc-950",
    textMain: "text-zinc-100",
    textSub: "text-zinc-400",
    textAccent: "text-zinc-400",
    cardBg: "bg-zinc-900/50 border-zinc-800",
    badge: "bg-zinc-900 border-zinc-800 text-zinc-400",
    backBtn: "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900",
    divider: "border-zinc-900",
    iconColor: "text-zinc-400",
    toggleBtn: "bg-zinc-900 text-zinc-400 hover:text-white"
  } : {
    // Light Mode (Silver Industrial Style)
    // using arbitrary value for the specific hex you liked
    container: "bg-[#C8C0C0]", 
    textMain: "text-gray-900",
    textSub: "text-gray-700",
    textAccent: "text-gray-800",
    cardBg: "bg-gray-900/10 border-gray-900/5",
    badge: "bg-gray-900/10 border-gray-900/10 text-gray-800",
    backBtn: "text-gray-700 hover:text-gray-900 hover:bg-gray-900/10",
    divider: "border-gray-900/20",
    iconColor: "text-gray-800",
    toggleBtn: "bg-gray-900/10 text-gray-800 hover:bg-gray-900/20"
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 font-sans relative transition-colors duration-500 ease-in-out ${theme.container}`}>
      
      {/* --- NAVIGATION CONTROLS --- */}
      
      {/* Top Left: Back Button */}
      <a href="/" className={`absolute top-6 left-6 flex items-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all group ${theme.backBtn}`}>
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform"/>
        <span className="hidden sm:inline animate-pulse">Back to dashboard</span>
      </a>

      {/* Top Right: Theme Toggle */}
      <button 
        onClick={() => setIsDarkMode(!isDarkMode)}
        className={`absolute top-6 right-6 p-2.5 rounded-full transition-all hover:scale-105 active:scale-95 ${theme.toggleBtn}`}
        aria-label="Toggle Theme"
      >
        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      {/* --- MAIN CONTENT --- */}
      <div className="w-full max-w-2xl space-y-12 mt-12 md:mt-0">

        {/* IDENTITY SECTION */}
        <div className="space-y-4 text-center">
          <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full border text-xs font-semibold transition-colors duration-300 ${theme.badge}`}>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            v0.1.0 Beta
          </div>
        
          <h1 
            className={`text-[90px] font-bold font-jolly tracking-tight transition-colors duration-300 ${theme.textMain}`}
            style={{ textShadow: "0 4px 4px rgba(0,0,0,0.35)" }}
          >
            Zandar
          </h1>
          
          <p className={`text-2xl font-serif max-w-[1000px] mx-auto transition-colors duration-300 ${theme.textSub}`}>
            Zandar is a customizable, local & privacy-first browser startpage designed to replace boring homepages with a clean and productive dashboard.
          </p>

          {/* Action Buttons Row */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <ActionButton href="https://github.com/yadneshx17/zandar" icon={Github} label="GitHub" theme={theme} />
            <ActionButton href="#" icon={FileText} label="Changelog" theme={theme} />
            {/* Feature Request - keeping the indigo tint consistent but adapting to light/dark */}
            <a href="#" className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-colors border ${isDarkMode ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20' : 'bg-indigo-600/10 text-indigo-900 border-indigo-700/10 hover:bg-indigo-600/20'}`}>
              <Zap size={16} />
              Request Feature
            </a>
          </div>
        </div>

        <hr className={`transition-colors duration-300 ${theme.divider}`} />

        {/* GRID SECTION */}
        <div className="grid md:grid-cols-2 gap-10">
          
          {/* What's New */}
          <div className="space-y-6">
            <div className={`flex items-center gap-2 d text-xl transition-colors duration-300 ${theme.textMain}`}>
              <Sparkles size={20} className="text-emerald-500" />
              <h2 className='font-bold'>What's in</h2>
              <span>v0.1.0</span>
            </div>
            
            <ul className="space-y-4">
              <FeatureItem theme={theme} title="Drag & Drop Layout" desc="Complete control over your grid." />
              <FeatureItem theme={theme} title="Local-First Storage" desc="No login. Data stays on device." />
              <FeatureItem theme={theme} title="Auto-Fetch Titles" desc="Instantly retrieve page titles from URLs so you never have to type them manually." />
              <FeatureItem theme={theme} title="Background Presets" desc="Curated aesthetic controls." />
              <FeatureItem theme={theme} title="Import / Export" desc="Backup your setup in JSON." />
            </ul>
          </div>

          {/* Roadmap */}
          <div className="space-y-6">
            <div className={`flex items-center gap-2 font-bold text-xl transition-colors duration-300 ${theme.textMain}`}>
              <Map size={20} className="text-purple-500" />
              <h2>Roadmap</h2>
            </div>
            
            <ul className="space-y-4">
              <RoadmapItem theme={theme} title="Browser Extension" desc="Save links to Zandar instantly & Full new-tab integration" />
              <RoadmapItem theme={theme} title="Cloud Sync" desc="Optional encrypted sync." />
              <RoadmapItem theme={theme} title="Keyboard Shortcuts" desc="Navigate without a mouse." />
              <RoadmapItem theme={theme} title="Utility Widgets" desc="Notes, weather, and calculator." />
            </ul>
          </div>

        </div>

        {/* FOOTER */}
        <div className={`pt-8 border-t text-center transition-colors duration-300 ${theme.divider}`}>
            <p className={`text-xs font-medium transition-colors duration-300 ${theme.textSub}`}>
                Designed for Focus. Crafted by Yadnesh.
            </p>
        </div>

      </div>
    </div>
  );
};

// --- HELPER COMPONENTS ---

const ActionButton = ({ href, icon: Icon, label, theme }) => (
  <a href={href} className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-colors border border-transparent ${theme.cardBg} ${theme.textAccent} hover:border-current`}>
    <Icon size={16} />
    {label}
  </a>
);

const FeatureItem = ({ title, desc, theme }) => (
  <li className="group flex flex-col gap-0.5">
    <span className={`text-sm font-bold transition-colors duration-300 group-hover:text-emerald-500 ${theme.textMain}`}>
      {title}
    </span>
    <span className={`text-xs font-medium transition-colors duration-300 ${theme.textSub}`}>{desc}</span>
  </li>
);

const RoadmapItem = ({ title, desc, theme }) => (
  <li className="group flex flex-col gap-0.5 opacity-60 hover:opacity-100 transition-opacity">
    <span className={`text-sm font-bold transition-colors duration-300 group-hover:text-purple-500 ${theme.textMain}`}>
      {title}
    </span>
    <span className={`text-xs font-medium transition-colors duration-300 ${theme.textSub}`}>{desc}</span>
  </li>
);

export default AboutPage;