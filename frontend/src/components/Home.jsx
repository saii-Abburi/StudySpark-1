import React, { useState } from "react";
import Hero from "./Hero";
import { 
  CheckCircle, 
  HelpCircle, 
  Mail, 
  Phone, 
  MapPin, 
  ChevronDown, 
  Zap, 
  Target, 
  ShieldCheck 
} from "lucide-react";

const Home = () => {
  const [activeFaq, setActiveFaq] = useState(null);

  const faqs = [
    { q: "How does the 45-day plan work?", a: "Our 45-day plan is a structured roadmap covering the most high-yield topics first. It includes daily targets, revision notes, and practice tests to ensure total coverage before the EAMCET exam." },
    { q: "Are the mock tests exactly like the real EAMCET?", a: "Yes! Our mock tests are designed to mimic the actual EAMCET exam pattern, difficulty level, and timing to give you a real-world experience." },
    { q: "Can I access the resources on mobile?", a: "Absolutely. StudySpark is fully responsive and works perfectly on smartphones, tablets, and laptops." },
    { q: "What are premium resources?", a: "Premium resources are exclusive, hand-crafted study materials and advanced mock tests designed by top rankers for students aiming for the highest percentiles." },
  ];

  return (
    <div className="w-full bg-black">
      <Hero />

      {/* ── About Section ── */}
      <section id="about" className="py-24 border-t border-dark-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-primary-500 font-black uppercase tracking-[0.3em] text-sm mb-4">Our Mission</h2>
            <h3 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-6">Revolutionizing EAMCET Prep</h3>
            <p className="text-slate-400 text-lg leading-relaxed">StudySpark was built by students, for students. We understand the pressure of competitive exams, which is why we've focused on high-yield content and AI-driven analysis to save you time and maximize your rank.</p>
          </div>
          
          <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <Target className="w-8 h-8 text-primary-500" />, title: "Focused Learning", desc: "No more wasting time on low-weightage topics. We tell you exactly what to study." },
              { icon: <Zap className="w-8 h-8 text-amber-500" />, title: "Instant Feedback", desc: "Get detailed analysis of your performance immediately after every practice test." },
              { icon: <ShieldCheck className="w-8 h-8 text-green-500" />, title: "Retained Access", desc: "Your purchase is for the entire season. Access your notes and tests anytime." }
            ].map((f, i) => (
              <div key={i} className="p-8 bg-dark-900 border border-dark-800 hover:border-primary-500/50 transition-colors group">
                <div className="mb-6 group-hover:scale-110 transition-transform">{f.icon}</div>
                <h4 className="text-xl font-bold text-white uppercase tracking-wide mb-3">{f.title}</h4>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ Section ── */}
      <section id="faq" className="py-24 bg-dark-900/50 border-t border-dark-800">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-primary-500 font-black uppercase tracking-[0.3em] text-sm mb-4">Common Questions</h2>
            <h3 className="text-4xl font-black text-white uppercase tracking-tight">Everything You Need To Know</h3>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-dark-800 bg-black">
                <button 
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-dark-900 transition-colors"
                >
                  <span className="font-bold text-white uppercase tracking-wide text-sm">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-primary-500 transition-transform ${activeFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {activeFaq === i && (
                  <div className="px-6 pb-6 pt-0 text-slate-400 text-sm leading-relaxed border-t border-dark-800 mt-2 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact Section ── */}
      <section id="contact" className="py-24 border-t border-dark-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <h2 className="text-primary-500 font-black uppercase tracking-[0.3em] text-sm mb-4">Contact Us</h2>
              <h3 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-8">Let's Talk Results</h3>
              <p className="text-slate-400 text-lg leading-relaxed mb-10">Have questions about our plans or resources? Our team is here to help you navigate your preparation journey.</p>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-500/10 border border-primary-500/20 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Email Us</p>
                    <p className="text-white font-bold">support@studyspark.in</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-500/10 border border-primary-500/20 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Our Office</p>
                    <p className="text-white font-bold">Tech Park, Hyderabad, IN</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-dark-900 p-8 border border-dark-800 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 blur-3xl rounded-full"></div>
              <form className="space-y-4 relative z-10" onSubmit={e => e.preventDefault()}>
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="First Name" className="w-full px-4 py-3 bg-black border border-dark-700 focus:border-primary-500 outline-none text-white font-bold text-sm" />
                  <input type="text" placeholder="Last Name" className="w-full px-4 py-3 bg-black border border-dark-700 focus:border-primary-500 outline-none text-white font-bold text-sm" />
                </div>
                <input type="email" placeholder="Email Address" className="w-full px-4 py-3 bg-black border border-dark-700 focus:border-primary-500 outline-none text-white font-bold text-sm" />
                <textarea placeholder="Your Message" rows="4" className="w-full px-4 py-3 bg-black border border-dark-700 focus:border-primary-500 outline-none text-white font-bold text-sm resize-none"></textarea>
                <button className="w-full py-4 bg-primary-500 hover:bg-primary-600 text-white font-black uppercase tracking-widest text-sm transition-colors">Send Message</button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;