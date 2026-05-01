
import { motion } from 'framer-motion';

interface ProgressBarProps {
  percentage: number;
}

export function ProgressBar({ percentage }: ProgressBarProps) {
  return (
    <div className="relative h-6 w-full overflow-hidden rounded-full bg-brand-sand/50 shadow-inner">
      <motion.div
        className="h-full bg-gradient-to-r from-brand-turquoise to-brand-ocean"
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
    </div>
  );
}
