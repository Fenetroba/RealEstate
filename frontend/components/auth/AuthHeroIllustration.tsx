'use client';

import Image, { type StaticImageData } from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';

interface AuthHeroIllustrationProps {
  src: StaticImageData | string;
  containerClassName?: string;
  imageClassName?: string;
  priority?: boolean;
}

export function AuthHeroIllustration({
  src,
  containerClassName = 'pointer-events-none absolute top-0 right-0 z-0 w-1/2',
  imageClassName = 'w-full h-auto select-none object-contain',
  priority = false,
}: AuthHeroIllustrationProps) {
  const reduceMotion = useReducedMotion();

  const houseLoop = reduceMotion
    ? { y: 0, x: 0, rotate: 0, scale: 1 }
    : {
        y: [0, -12, -6, -14, 0],
        x: [0, 6, -3, 5, 0],
        rotate: [0, 0.5, -0.3, 0.4, 0],
        scale: [1, 1.015, 1.008, 1.02, 1],
      };

  const glowLoop = reduceMotion
    ? { scale: 1, opacity: 0.4 }
    : {
        scale: [1, 1.1, 1.04, 1.12, 1],
        opacity: [0.3, 0.5, 0.38, 0.52, 0.3],
      };

  return (
    <motion.div
      className={containerClassName}
      aria-hidden
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.9, ease: 'easeOut' }}
    >
      <motion.div
        className="absolute -right-4 top-8 size-48 rounded-full bg-accent/20 blur-3xl"
        animate={glowLoop}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        animate={houseLoop}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <Image src={src} alt="" priority={priority} className={imageClassName} />
      </motion.div>
    </motion.div>
  );
}
