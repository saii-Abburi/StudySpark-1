import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Atom, FlaskConical, ArrowRight } from 'lucide-react';
import api from '../services/api';

const SubjectOverview = () => {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        // Use full URL to bypass interceptors if needed, or stick to api 
        // to troubleshoot the loop. Adding console logs.
        console.log('SubjectOverview: Fetching priorities...');
        api.get('/resources/priorities')
            .then(res => {
                if (res.data) {
                    console.log('SubjectOverview: Data received successfully');
                    setStats(res.data);
                }
            })
            .catch(err => {
                console.error('SubjectOverview: API Fetch error:', err);
                // If 401, this might trigger the interceptor loop
            });
    }, []);

    const subjects = [
        {
            id: 'Mathematics',
            name: 'Mathematics',
            icon: <Calculator className="text-blue-500" />,
            tests: 120,
            weightage: '35%',
            description: 'Master calculus, algebra, and coordinate geometry with our comprehensive practice modules.',
        },
        {
            id: 'Physics',
            name: 'Physics',
            icon: <Atom className="text-purple-500" />,
            tests: 95,
            weightage: '30%',
            description: 'Understand mechanics, electricity, and modern physics through targeted practice sessions.',
        },
        {
            id: 'Chemistry',
            name: 'Chemistry',
            icon: <FlaskConical className="text-green-500" />,
            tests: 85,
            weightage: '25%',
            description: 'Excel in organic, inorganic, and physical chemistry with our structured learning approach.',
        },
    ];

    return (
        <section id="subjects" className="section-padding bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-primary-500 font-black uppercase tracking-[0.3em] text-sm mb-4">Preparation Scope</h2>
                    <h3 className="text-4xl md:text-5xl font-black text-black dark:text-white uppercase tracking-tight mb-6">
                        Subject-Wise <span className="text-accent underline decoration-accent/30 underline-offset-8">Overview</span>
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto font-medium">
                        Comprehensive preparation across EAMCET subjects with topic-wise breakdown engineered for success.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {subjects.map((subject, index) => {
                        const topicCount = stats ? stats[subject.id]?.length : 0;
                        const highYieldCount = stats ? stats[subject.id]?.filter(t => {
                            const minWeight = parseInt(t.weight.split('-')[0]) || 0;
                            // Subject-specific thresholds to accurately reflect high-yield topics
                            if (subject.id === 'Mathematics') return minWeight >= 3;
                            if (subject.id === 'Physics') return minWeight >= 2;
                            if (subject.id === 'Chemistry') return minWeight >= 2;
                            return minWeight >= 3;
                        }).length : 0;

                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                whileHover={{ y: -5 }}
                                className="p-8 rounded-3xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-2xl hover:shadow-accent/5 transition-all group overflow-hidden relative"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
                                
                                <div className="w-16 h-16 rounded-2xl bg-white dark:bg-gray-900 flex items-center justify-center mb-6 shadow-lg border border-gray-200 dark:border-gray-700 group-hover:scale-110 transition-transform">
                                    {subject.icon}
                                </div>

                                <h3 className="text-2xl font-black text-black dark:text-white uppercase tracking-tight mb-4">{subject.name}</h3>

                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between items-center bg-white/50 dark:bg-black/20 p-3 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                                        <span className="text-xs font-black uppercase tracking-widest text-gray-500">Core Topics</span>
                                        <span className="font-black text-accent">{topicCount || '--'}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-white/50 dark:bg-black/20 p-3 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                                        <span className="text-xs font-black uppercase tracking-widest text-gray-500">High Yield</span>
                                        <span className="font-black text-red-500">{highYieldCount || '--'}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-white/50 dark:bg-black/20 p-3 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                                        <span className="text-xs font-black uppercase tracking-widest text-gray-500">Weightage</span>
                                        <span className="font-black text-black dark:text-white">{subject.weightage}</span>
                                    </div>
                                </div>

                                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-8 font-medium">
                                    {subject.description}
                                </p>

                                <button className="w-full bg-black dark:bg-white text-white dark:text-black py-4 font-black uppercase tracking-widest text-xs flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all shadow-xl">
                                    Start Practice <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={16} />
                                </button>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default SubjectOverview;