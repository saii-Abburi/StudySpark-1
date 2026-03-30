import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  ChevronRight, 
  Zap, 
  Target, 
  Shield, 
  Flame, 
  ArrowRight,
  BookOpen,
  Atom,
  FlaskConical,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const planData = [
  {
    day: 1,
    phase: 1,
    phaseName: "Maximum Marks Zone",
    math: "Trigonometry (identities + equations)",
    physics: "Laws of Motion (basics)",
    chem: "GOC (basics)"
  },
  {
    day: 2,
    phase: 1,
    phaseName: "Maximum Marks Zone",
    math: "Trigonometry (advanced problems)",
    physics: "Laws of Motion (friction + numericals)",
    chem: "GOC (resonance + stability)"
  },
  {
    day: 3,
    phase: 1,
    phaseName: "Maximum Marks Zone",
    math: "Integration (formulas)",
    physics: "Work, Energy, Power",
    chem: "Aldehydes (intro + reactions)"
  },
  {
    day: 4,
    phase: 1,
    phaseName: "Maximum Marks Zone",
    math: "Integration (problems)",
    physics: "WEP numericals",
    chem: "Ketones + MCQs"
  },
  {
    day: 5,
    phase: 1,
    phaseName: "Maximum Marks Zone",
    math: "Vectors (full)",
    physics: "Rotational Motion (basics)",
    chem: "Aldehydes & Ketones revision"
  },
  {
    day: 6,
    phase: 1,
    phaseName: "Maximum Marks Zone",
    math: "Vectors MCQs",
    physics: "Rotational Motion (numericals)",
    chem: "Chemical Equilibrium"
  },
  {
    day: 7,
    phase: 1,
    phaseName: "Maximum Marks Zone",
    math: "Circle",
    physics: "Fluids",
    chem: "States of Matter"
  },
  {
    day: 8,
    phase: 1,
    phaseName: "Maximum Marks Zone",
    math: "Circle MCQs",
    physics: "Fluids numericals",
    chem: "States MCQs"
  },
  {
    day: 9,
    phase: 1,
    phaseName: "Maximum Marks Zone",
    math: "Functions",
    physics: "Current Electricity",
    chem: "Chemical Equilibrium (problems)"
  },
  {
    day: 10,
    phase: 1,
    phaseName: "Maximum Marks Zone",
    math: "Functions MCQs",
    physics: "Current Electricity numericals",
    chem: "GOC revision + organic MCQs"
  },
  {
    day: 11,
    phase: 2,
    phaseName: "Rank Boost Zone",
    math: "Matrices",
    physics: "Motion in Plane",
    chem: "Chemical Bonding"
  },
  {
    day: 12,
    phase: 2,
    phaseName: "Rank Boost Zone",
    math: "Complex Numbers",
    physics: "Projectile",
    chem: "Bonding (hybridization)"
  },
  {
    day: 13,
    phase: 2,
    phaseName: "Rank Boost Zone",
    math: "Definite Integration",
    physics: "Ray Optics",
    chem: "Stoichiometry"
  },
  {
    day: 14,
    phase: 2,
    phaseName: "Rank Boost Zone",
    math: "Definite Integration MCQs",
    physics: "Optics numericals",
    chem: "Stoichiometry MCQs"
  },
  {
    day: 15,
    phase: 2,
    phaseName: "Rank Boost Zone",
    math: "Straight Line",
    physics: "Magnetism",
    chem: "Solid State"
  },
  {
    day: 16,
    phase: 2,
    phaseName: "Rank Boost Zone",
    math: "Parabola",
    physics: "Moving Charges",
    chem: "Solid State MCQs"
  },
  {
    day: 17,
    phase: 2,
    phaseName: "Rank Boost Zone",
    math: "Probability",
    physics: "Thermodynamics",
    chem: "Solutions"
  },
  {
    day: 18,
    phase: 2,
    phaseName: "Rank Boost Zone",
    math: "P&C",
    physics: "Thermodynamics numericals",
    chem: "Solutions MCQs"
  },
  {
    day: 19,
    phase: 2,
    phaseName: "Rank Boost Zone",
    math: "Differentiation",
    physics: "Semiconductors",
    chem: "Electrochemistry"
  },
  {
    day: 20,
    phase: 2,
    phaseName: "Rank Boost Zone",
    math: "Differentiation MCQs",
    physics: "Revision",
    chem: "Electrochemistry MCQs"
  },
  {
    day: 21,
    phase: 3,
    phaseName: "Fast Coverage",
    math: "Binomial + Quadratics",
    physics: "Oscillations",
    chem: "Atomic Structure"
  },
  {
    day: 22,
    phase: 3,
    phaseName: "Fast Coverage",
    math: "Limits & Continuity",
    physics: "Waves",
    chem: "S Block"
  },
  {
    day: 23,
    phase: 3,
    phaseName: "Fast Coverage",
    math: "3D + Plane",
    physics: "Gravitation",
    chem: "Hydrogen + P Block"
  },
  {
    day: 24,
    phase: 3,
    phaseName: "Fast Coverage",
    math: "Remaining small topics",
    physics: "EM Waves + Dual Nature",
    chem: "Organic small chapters"
  },
  {
    day: 25,
    phase: 3,
    phaseName: "Fast Coverage",
    fullSyllabus: "Full syllabus mixed MCQs (ALL subjects)"
  },
  {
    day: 26,
    phase: 3,
    phaseName: "Fast Coverage",
    weakTopics: "Weak topics revision (based on Day 25)"
  },
  {
    day: 27,
    phase: 4,
    phaseName: "Final Push",
    math: "Full Math revision + 100 MCQs"
  },
  {
    day: 28,
    phase: 4,
    phaseName: "Final Push",
    physics: "Full Physics revision + numericals"
  },
  {
    day: 29,
    phase: 4,
    phaseName: "Final Push",
    chem: "Full Chemistry revision (organic focus)"
  },
  {
    day: 30,
    phase: 4,
    phaseName: "Final Push",
    mockTest: "FULL MOCK TEST"
  }
];

const phases = [
  { id: 1, name: "PHASE 1", fullTitle: "Maximum Marks Zone", range: "Day 1-10", icon: <Flame className="w-5 h-5" />, color: "bg-red-500" },
  { id: 2, name: "PHASE 2", fullTitle: "Rank Boost Zone", range: "Day 11-20", icon: <Zap className="w-5 h-5" />, color: "bg-amber-500" },
  { id: 3, name: "PHASE 3", fullTitle: "Fast Coverage", range: "Day 21-26", icon: <Target className="w-5 h-5" />, color: "bg-blue-500" },
  { id: 4, name: "PHASE 4", fullTitle: "Final Push", range: "Day 27-30", icon: <Shield className="w-5 h-5" />, color: "bg-purple-500" },
];

export default function Plan30Days() {
  const navigate = useNavigate();
  const [activePhase, setActivePhase] = useState(1);

  const filteredDays = planData.filter(d => d.phase === activePhase);

  const handleTopicClick = (topic, subject) => {
    // Clean up topic string for search (remove subtext in parentheses)
    const searchQuery = topic.split('(')[0].split('+')[0].trim();
    navigate(`/dashboard/materials?topic=${encodeURIComponent(searchQuery)}&subject=${subject || ''}`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-primary-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-500">Mission EAMCET 2024</span>
          </div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tight">
            30-Day <span className="text-primary-500 underline decoration-primary-500/30 underline-offset-8">Battle Plan</span>
          </h1>
          <p className="text-slate-400 mt-4 max-w-xl font-medium">
            A high-intensity roadmap designed to maximize your score in 30 days. Click on any topic to jump directly to study materials.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {phases.map(p => (
            <button
              key={p.id}
              onClick={() => setActivePhase(p.id)}
              className={`px-4 py-2 border transition-all flex items-center gap-2 group ${
                activePhase === p.id 
                ? 'bg-primary-500 border-primary-500 text-white shadow-[0_0_20px_rgba(var(--primary-500-rgb),0.3)]' 
                : 'bg-dark-800 border-dark-700 text-slate-400 hover:border-primary-500/50 hover:text-white'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${activePhase === p.id ? 'bg-white' : p.color}`}></span>
              <span className="text-[10px] font-black uppercase tracking-widest">{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Phase Info Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-dark-800 border border-dark-700 p-8 sticky top-28">
            <div className={`w-12 h-12 ${phases[activePhase-1].color} flex items-center justify-center mb-6 shadow-xl`}>
              {phases[activePhase-1].icon}
            </div>
            <h2 className="text-xs font-black text-primary-500 uppercase tracking-[0.2em] mb-2">{phases[activePhase-1].name}</h2>
            <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-4">{phases[activePhase-1].fullTitle}</h3>
            <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest bg-dark-900/50 p-3 mb-8">
              <Calendar className="w-4 h-4 text-primary-500" />
              {phases[activePhase-1].range}
            </div>
            
            <div className="space-y-4">
              <p className="text-slate-400 text-sm leading-relaxed font-medium">
                {activePhase === 1 && "Start strong with topics that contribute to 40% of the question paper. These are heavy-weight chapters you cannot miss."}
                {activePhase === 2 && "Push your rank higher by mastering moderate chapters and refining techniques in optics and electricity."}
                {activePhase === 3 && "Quickly touch upon remaining topics and finalize your revision patterns across all three subjects."}
                {activePhase === 4 && "The final grind. Full revision cycles and a comprehensive mock test to simulate exam conditions."}
              </p>
              <div className="pt-6 border-t border-dark-700 flex flex-col gap-3">
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-green-500" /> Topic Completion Tracking
                </div>
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-green-500" /> Direct Resource Sync
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Days Grid */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="wait">
              {filteredDays.map((day, idx) => (
                <motion.div
                  key={day.day}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="bg-dark-800 border border-dark-700 p-6 hover:border-primary-500/30 transition-all group overflow-hidden relative"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <span className="text-6xl font-black">{day.day}</span>
                  </div>
                  
                  <div className="flex items-center justify-between mb-6">
                    <span className="bg-primary-500 px-3 py-1 text-[10px] font-black text-white uppercase tracking-[0.2em] shadow-lg">Day {day.day}</span>
                    {day.phase === 4 && <span className="text-red-500 p-1 animate-pulse"><Flame size={16} /></span>}
                  </div>

                  <div className="space-y-4 relative z-10">
                    {day.math && (
                      <button 
                        onClick={() => handleTopicClick(day.math, 'Mathematics')}
                        className="w-full text-left group/item flex items-start gap-3 p-3 bg-dark-900/50 hover:bg-primary-500/5 border border-dark-700 transition-all active:scale-[0.98]"
                      >
                        <BookOpen className="w-4 h-4 text-blue-500 mt-0.5" />
                        <div>
                          <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Mathematics</p>
                          <p className="text-sm font-bold text-white group-hover/item:text-primary-500 transition-colors uppercase tracking-tight">{day.math}</p>
                        </div>
                        <ArrowRight className="w-3 h-3 ml-auto mt-auto opacity-0 group-hover/item:opacity-100 transition-opacity group-hover/item:text-primary-500" />
                      </button>
                    )}

                    {day.physics && (
                      <button 
                        onClick={() => handleTopicClick(day.physics, 'Physics')}
                        className="w-full text-left group/item flex items-start gap-3 p-3 bg-dark-900/50 hover:bg-primary-500/5 border border-dark-700 transition-all active:scale-[0.98]"
                      >
                        <Atom className="w-4 h-4 text-purple-500 mt-0.5" />
                        <div>
                          <p className="text-[9px] font-black text-purple-500 uppercase tracking-widest">Physics</p>
                          <p className="text-sm font-bold text-white group-hover/item:text-primary-500 transition-colors uppercase tracking-tight">{day.physics}</p>
                        </div>
                        <ArrowRight className="w-3 h-3 ml-auto mt-auto opacity-0 group-hover/item:opacity-100 transition-opacity group-hover/item:text-primary-500" />
                      </button>
                    )}

                    {day.chem && (
                      <button 
                        onClick={() => handleTopicClick(day.chem, 'Chemistry')}
                        className="w-full text-left group/item flex items-start gap-3 p-3 bg-dark-900/50 hover:bg-primary-500/5 border border-dark-700 transition-all active:scale-[0.98]"
                      >
                        <FlaskConical className="w-4 h-4 text-green-500 mt-0.5" />
                        <div>
                          <p className="text-[9px] font-black text-green-500 uppercase tracking-widest">Chemistry</p>
                          <p className="text-sm font-bold text-white group-hover/item:text-primary-500 transition-colors uppercase tracking-tight">{day.chem}</p>
                        </div>
                        <ArrowRight className="w-3 h-3 ml-auto mt-auto opacity-0 group-hover/item:opacity-100 transition-opacity group-hover/item:text-primary-500" />
                      </button>
                    )}

                    {/* Special entries for Phase 3/4 */}
                    {day.fullSyllabus && (
                      <div className="p-4 bg-orange-500/10 border border-orange-500/30">
                        <p className="text-xs font-black text-orange-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                          <Zap size={14} /> Full Practice
                        </p>
                        <p className="text-sm font-bold text-white uppercase tracking-tight">{day.fullSyllabus}</p>
                      </div>
                    )}

                    {day.weakTopics && (
                      <div className="p-4 bg-blue-500/10 border border-blue-500/30">
                        <p className="text-xs font-black text-blue-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                          <Target size={14} /> Remedial Focus
                        </p>
                        <p className="text-sm font-bold text-white uppercase tracking-tight">{day.weakTopics}</p>
                      </div>
                    )}

                    {day.mockTest && (
                      <button 
                        onClick={() => navigate('/dashboard')}
                        className="w-full text-center p-6 bg-red-600 hover:bg-red-700 transition-colors group/mock shadow-2xl"
                      >
                        <p className="text-sm font-black text-white uppercase tracking-[0.3em] mb-2">Battle Simulation</p>
                        <h4 className="text-2xl font-black text-white uppercase">Full Mock Test</h4>
                        <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-black uppercase text-white/70 tracking-widest group-hover/mock:text-white transition-colors">
                          Go to Test Center <ChevronRight size={14} className="group-hover/mock:translate-x-1 transition-transform" />
                        </div>
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
