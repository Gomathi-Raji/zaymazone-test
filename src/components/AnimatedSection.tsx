import { motion, Variants } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { artisanAnimations, reducedMotionVariants } from "@/lib/animations";
import { cn } from "@/lib/utils";

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  animation?: keyof typeof artisanAnimations;
  delay?: number;
  once?: boolean;
  threshold?: number;
}

export const AnimatedSection = ({
  children,
  className,
  animation = "section",
  delay = 0,
  once = true,
  threshold = 0.1,
}: AnimatedSectionProps) => {
  const [ref, inView] = useInView({
    threshold,
    triggerOnce: once,
  });

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const variants = prefersReducedMotion ? reducedMotionVariants : (artisanAnimations[animation] as Variants);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={variants}
      className={cn(className)}
      style={{ transitionDelay: `${delay}s` }}
    >
      {children}
    </motion.div>
  );
};