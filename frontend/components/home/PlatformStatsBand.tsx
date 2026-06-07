'use client';

import { motion } from 'framer-motion';

import { platformStats } from '@/lib/constants/landing';
import { gridStatsClass, typeStatLabel, typeStatValue } from '@/lib/responsive';
import { cn } from '@/lib/utils';

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export function HeroPlatformStats() {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-20px' }}
      variants={containerVariants}
      className="mt-8 sm:mt-10"
    >
      <div className={cn(gridStatsClass(4), 'lg:gap-y-0')}>
        {platformStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            variants={itemVariants}
            className={cn(
              'text-center lg:text-left',
              index > 0 && 'lg:border-l lg:border-border lg:pl-8 xl:pl-8 2xl:pl-10 3xl:pl-10 4xl:pl-10',
            )}
          >
            <div className="inline-flex flex-col items-center lg:items-start">
              <p className={typeStatValue}>{stat.value}</p>
              <span
                className="mt-2 block h-px w-10 rounded-full bg-accent sm:w-12 md:w-14 2xl:w-16"
                aria-hidden
              />
            </div>
            <p className={cn(typeStatLabel, 'mt-3')}>{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
