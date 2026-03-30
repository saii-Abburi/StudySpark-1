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
  Clock,
  LayoutDashboard
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const planData = [
  { day: 1, phase: 1, phaseName: "High Weightage", math: "Trigonometry (identities + basic problems)", physics: "Laws of Motion (basics + FBD)", chem: "GOC (classification + inductive effect)" },
  { day: 2, phase: 1, phaseName: "High Weightage", math: "Trigonometry (equations + advanced problems)", physics: "Laws of Motion (friction)", chem: "GOC (resonance + stability)" },
  { day: 3, phase: 1, phaseName: "High Weightage", math: "Trigonometry (mixed MCQs)", physics: "Laws of Motion (numericals)", chem: "GOC (isomerism basics)" },
  { day: 4, phase: 1, phaseName: "High Weightage", math: "Integration (standard formulas)", physics: "Work, Energy, Power (concepts)", chem: "Aldehydes & Ketones (intro)" },
  { day: 5, phase: 1, phaseName: "High Weightage", math: "Integration (substitution method)", physics: "WEP (numericals)", chem: "Aldehydes (reactions)" },
  { day: 6, phase: 1, phaseName: "High Weightage", math: "Integration (definite basics)", physics: "WEP (mixed problems)", chem: "Ketones (reactions + MCQs)" },
  { day: 7, phase: 1, phaseName: "High Weightage", math: "Vectors (addition + direction cosines)", physics: "Rotational Motion (basics)", chem: "Aldehydes & Ketones (revision)" },
  { day: 8, phase: 1, phaseName: "High Weightage", math: "Vectors (dot + cross product)", physics: "Rotational Motion (torque)", chem: "Chemical Equilibrium (concepts)" },
  { day: 9, phase: 1, phaseName: "High Weightage", math: "Vectors (MCQs)", physics: "Rotational Motion (numericals)", chem: "Chemical Equilibrium (problems)" },
  { day: 10, phase: 1, phaseName: "High Weightage", math: "Circle (standard equations)", physics: "Fluids (pressure, buoyancy)", chem: "States of Matter (gas laws)" },
  { day: 11, phase: 1, phaseName: "High Weightage", math: "Circle (tangent, normals)", physics: "Fluids (viscosity)", chem: "States of Matter (numericals)" },
  { day: 12, phase: 1, phaseName: "High Weightage", math: "Circle (MCQs)", physics: "Fluids (revision)", chem: "States of Matter (revision)" },
  { day: 13, phase: 1, phaseName: "High Weightage", math: "Functions (types + graphs)", physics: "Current Electricity (Ohm’s law)", chem: "Chemical Equilibrium (revision)" },
  { day: 14, phase: 1, phaseName: "High Weightage", math: "Functions (inverse + composition)", physics: "Current Electricity (circuits)", chem: "GOC (full revision)" },
  { day: 15, phase: 1, phaseName: "High Weightage", math: "Functions (MCQs)", physics: "Current Electricity (numericals)", chem: "Organic mixed MCQs" },
  { day: 16, phase: 2, phaseName: "Rank Boosters", math: "Matrices (basics)", physics: "Motion in Plane", chem: "Chemical Bonding (VSEPR)" },
  { day: 17, phase: 2, phaseName: "Rank Boosters", math: "Matrices (determinants)", physics: "Projectile motion", chem: "Bonding (hybridization)" },
  { day: 18, phase: 2, phaseName: "Rank Boosters", math: "Complex Numbers", physics: "Motion MCQs", chem: "Bonding (revision)" },
  { day: 19, phase: 2, phaseName: "Rank Boosters", math: "Definite Integration", physics: "Ray Optics (reflection)", chem: "Stoichiometry" },
  { day: 20, phase: 2, phaseName: "Rank Boosters", math: "Definite Integration problems", physics: "Refraction", chem: "Stoichiometry numericals" },
  { day: 21, phase: 2, phaseName: "Rank Boosters", math: "Definite Integration MCQs", physics: "Optics MCQs", chem: "Stoichiometry revision" },
  { day: 22, phase: 2, phaseName: "Rank Boosters", math: "Straight Line", physics: "Magnetism basics", chem: "Solid State" },
  { day: 23, phase: 2, phaseName: "Rank Boosters", math: "Parabola", physics: "Moving Charges", chem: "Solid State MCQs" },
  { day: 24, phase: 2, phaseName: "Rank Boosters", math: "Coordinate Geometry MCQs", physics: "Magnetism numericals", chem: "Solid State revision" },
  { day: 25, phase: 2, phaseName: "Rank Boosters", math: "Probability", physics: "Thermodynamics", chem: "Solutions" },
  { day: 26, phase: 2, phaseName: "Rank Boosters", math: "P&C", physics: "Thermodynamics numericals", chem: "Solutions numericals" },
  { day: 27, phase: 2, phaseName: "Rank Boosters", math: "Probability MCQs", physics: "Thermodynamics revision", chem: "Solutions revision" },
  { day: 28, phase: 2, phaseName: "Rank Boosters", math: "Differentiation", physics: "Semiconductors", chem: "Electrochemistry" },
  { day: 29, phase: 2, phaseName: "Rank Boosters", math: "Differentiation problems", physics: "Semiconductors MCQs", chem: "Electrochemistry numericals" },
  { day: 30, phase: 2, phaseName: "Rank Boosters", math: "Differentiation MCQs", physics: "Revision", chem: "Electrochemistry revision" },
  { day: 31, phase: 3, phaseName: "Quick Kills", math: "Binomial + Quadratics", physics: "Oscillations", chem: "Atomic Structure" },
  { day: 32, phase: 3, phaseName: "Quick Kills", math: "Binomial + Quadratics", physics: "Oscillations", chem: "Atomic Structure" },
  { day: 33, phase: 3, phaseName: "Quick Kills", math: "Limits & Continuity", physics: "Waves", chem: "S Block + Hydrogen" },
  { day: 34, phase: 3, phaseName: "Quick Kills", math: "Limits & Continuity", physics: "Waves", chem: "S Block + Hydrogen" },
  { day: 35, phase: 3, phaseName: "Quick Kills", math: "3D + Plane", physics: "Gravitation", chem: "P Block" },
  { day: 36, phase: 3, phaseName: "Quick Kills", math: "3D + Plane", physics: "Gravitation", chem: "P Block" },
  { day: 37, phase: 3, phaseName: "Quick Kills", math: "Remaining small topics", physics: "EM Waves + Dual Nature", chem: "Organic small chapters" },
  { day: 38, phase: 3, phaseName: "Quick Kills", math: "Remaining small topics", physics: "EM Waves + Dual Nature", chem: "Organic small chapters" },
  { day: 39, phase: 3, phaseName: "Quick Kills", fullSyllabus: "Full syllabus quick revision + MCQs" },
  { day: 40, phase: 3, phaseName: "Quick Kills", fullSyllabus: "Full syllabus quick revision + MCQs" },
  { day: 41, phase: 4, phaseName: "Make or Break", math: "Full Math revision + 100 MCQs" },
  { day: 42, phase: 4, phaseName: "Make or Break", physics: "Full Physics revision + numericals" },
  { day: 43, phase: 4, phaseName: "Make or Break", chem: "Full Chemistry revision (organic focus)" },
  { day: 44, phase: 4, phaseName: "Make or Break", mockTest: "FULL MOCK TEST (3 hrs)" },
  { day: 45, phase: 4, phaseName: "Make or Break", final: "Weak areas only | Formula revision | Light practice" }
];

const phases = [
  { id: 1, name: "PHASE 1", fullTitle: "Max Marks Zone", range: "Day 1-15", icon: <Flame className="w-5 h-5" />, color: "bg-red-500" },
  { id: 2, name: "PHASE 2", fullTitle: "Rank Boosters", range: "Day 16-30", icon: <Zap className="w-5 h-5" />, color: "bg-amber-500" },
  { id: 3, name: "PHASE 3", fullTitle: "Quick Kills", range: "Day 31-40", icon: <Target className="w-5 h-5" />, color: "bg-blue-500" },
  { id: 4, name: "PHASE 4", fullTitle: "Make or Break", range: "Day 41-45", icon: <Shield className="w-5 h-5" />, color: "bg-purple-500" },
];

export default function Plan45Days() {
  const navigate = useNavigate();
  const [activePhase, setActivePhase] = useState(1);

  const filteredDays = planData.filter(d => d.phase === activePhase);

  const handleTopicClick = (topic, subject) => {
    // Clean up topic string for search (remove subtext in parentheses)
    const searchQuery = topic.split('(')[0].split('+')[0].split('|')[0].trim();
    navigate(`/dashboard/materials?topic=${encodeURIComponent(searchQuery)}&subject=${subject || ''}`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-primary-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-500">45-Day Elite Roadmap</span>
          </div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tight">
            Strategic <span className="text-primary-500 underline decoration-primary-500/30 underline-offset-8">Rank Booster</span>
          </h1>
          <p className="text-slate-400 mt-4 max-w-xl font-medium">
            A comprehensive 45-day path optimized for consistent performers. Follow the 10-11 hour structure to dominate your exam.
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

      {/* Daily Structure Strip */}
      <div className="p-1 px-1 bg-gradient-to-r from-dark-800 via-dark-700 to-dark-800 border border-dark-700">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-0.5 divide-x divide-dark-700 bg-dark-900/50 p-4">
          <div className="px-4 py-2">
            <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1">Math (3.5h)</p>
            <p className="text-xs font-bold text-white uppercase">Concept + Prob</p>
          </div>
          <div className="px-4 py-2">
            <p className="text-[9px] font-black text-purple-500 uppercase tracking-widest mb-1">Physics (3h)</p>
            <p className="text-xs font-bold text-white uppercase">Numericals</p>
          </div>
          <div className="px-4 py-2">
            <p className="text-[9px] font-black text-green-500 uppercase tracking-widest mb-1">Chem (2.5h)</p>
            <p className="text-xs font-bold text-white uppercase">Concept + Mem</p>
          </div>
          <div className="px-4 py-2">
            <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-1">Revision (2h)</p>
            <p className="text-xs font-bold text-white uppercase">Mixed MCQs</p>
          </div>
          <div className="px-4 py-2 bg-primary-500/10 col-span-2 md:col-span-1 border-t md:border-t-0 border-dark-700">
            <p className="text-[9px] font-black text-primary-500 uppercase tracking-widest mb-1">Total Effort</p>
            <p className="text-xs font-bold text-white uppercase">10-11 HRS/DAY</p>
          </div>
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
                {activePhase === 1 && "The first 15 days focus on high-yield, heavy-weightage chapters. Mastering these provides a solid mark foundation."}
                {activePhase === 2 && "A critical 15-day stretch for rank boosting. Transition from core concepts to specialized rank-deciding topics."}
                {activePhase === 3 && "Fast coverage zone. Quickly tackle low-weight topics while starting the full-syllabus revision transition."}
                {activePhase === 4 && "Final make-or-break sprint. Full revisions, mock simulations, and addressing your final weak areas."}
              </p>
              <div className="pt-6 border-t border-dark-700 flex flex-col gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-primary-500" /> 10+ Hours Active Study
                </div>
                <div className="flex items-center gap-3">
                  <LayoutDashboard className="w-4 h-4 text-primary-500" /> Topic Sync Enabled
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
                  transition={{ duration: 0.3, delay: idx * 0.03 }}
                  className="bg-dark-800 border border-dark-700 p-6 hover:border-primary-500/30 transition-all group overflow-hidden relative"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <span className="text-6xl font-black">{day.day}</span>
                  </div>
                  
                  <div className="flex items-center justify-between mb-6">
                    <span className="bg-primary-500 px-3 py-1 text-[10px] font-black text-white uppercase tracking-[0.2em] shadow-lg">Day {day.day}</span>
                    <CheckCircle2 size={16} className="text-dark-700 group-hover:text-primary-500/50 transition-colors" />
                  </div>

                  <div className="space-y-3 relative z-10">
                    {day.math && (
                      <button 
                        onClick={() => handleTopicClick(day.math, 'Mathematics')}
                        className="w-full text-left group/item flex items-start gap-3 p-3 bg-dark-900/50 hover:bg-primary-500/5 border border-dark-700 transition-all active:scale-[0.98]"
                      >
                        <BookOpen className="w-4 h-4 text-blue-500 mt-0.5" />
                        <div>
                          <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Mathematics</p>
                          <p className="text-sm font-bold text-white group-hover/item:text-primary-500 transition-colors uppercase tracking-tight line-clamp-2">{day.math}</p>
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
                          <p className="text-sm font-bold text-white group-hover/item:text-primary-500 transition-colors uppercase tracking-tight line-clamp-2">{day.physics}</p>
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
                          <p className="text-sm font-bold text-white group-hover/item:text-primary-500 transition-colors uppercase tracking-tight line-clamp-2">{day.chem}</p>
                        </div>
                        <ArrowRight className="w-3 h-3 ml-auto mt-auto opacity-0 group-hover/item:opacity-100 transition-opacity group-hover/item:text-primary-500" />
                      </button>
                    )}

                    {day.fullSyllabus && (
                      <div className="p-4 bg-orange-500/10 border border-orange-500/30">
                        <p className="text-xs font-black text-orange-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                          <Zap size={14} /> Power Revision
                        </p>
                        <p className="text-sm font-bold text-white uppercase tracking-tight">{day.fullSyllabus}</p>
                      </div>
                    )}

                    {day.mockTest && (
                      <button 
                        onClick={() => navigate('/dashboard')}
                        className="w-full text-center p-6 bg-red-600 hover:bg-red-700 transition-colors group/mock shadow-2xl"
                      >
                        <p className="text-sm font-black text-white uppercase tracking-[0.3em] mb-2">Final Simulation</p>
                        <h4 className="text-2xl font-black text-white uppercase">{day.mockTest}</h4>
                        <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-black uppercase text-white/70 tracking-widest group-hover/mock:text-white transition-colors">
                           Enter Test Center <ChevronRight size={14} className="group-hover/mock:translate-x-1 transition-transform" />
                        </div>
                      </button>
                    )}

                    {day.final && (
                      <div className="p-6 bg-primary-500/10 border border-primary-500/30 text-center">
                        <p className="text-[10px] font-black text-primary-500 uppercase tracking-[0.3em] mb-3">Pre-Exam Checkpoint</p>
                        <p className="text-sm font-bold text-white uppercase tracking-tight leading-relaxed">{day.final}</p>
                      </div>
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
