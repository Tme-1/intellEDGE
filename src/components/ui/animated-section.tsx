'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  accentColor?: 'blue' | 'cyan' | 'orange' | 'purple' | 'green';
}

export function AnimatedSection({ children, className = '', id, accentColor = 'blue' }: AnimatedSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-100px" });

  const accentStyles = {
    blue: 'from-edx-blue/20 to-edx-light-blue/10 shadow-[0_8px_32px_0_rgba(0,97,155,0.15)]',
    cyan: 'from-cyan-400/20 to-cyan-300/10 shadow-[0_8px_32px_0_rgba(34,211,238,0.15)]',
    orange: 'from-orange-400/20 to-orange-300/10 shadow-[0_8px_32px_0_rgba(251,146,60,0.15)]',
    purple: 'from-purple-400/20 to-purple-300/10 shadow-[0_8px_32px_0_rgba(192,132,252,0.15)]',
    green: 'from-green-400/20 to-green-300/10 shadow-[0_8px_32px_0_rgba(74,222,128,0.15)]',
  };

  return (
    <motion.div
      ref={ref}
      id={id}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`relative backdrop-blur-sm bg-white/30 ${accentStyles[accentColor]} ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 pointer-events-none" />
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
} 