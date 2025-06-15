"use client";

import { motion } from "framer-motion";
import type { FC, ReactNode } from "react";

interface AnimatedSectionProps {
    children: ReactNode;
    className?: string;
    delay?: number;
}

const AnimatedSection: FC<AnimatedSectionProps> = ({
    children,
    className,
    delay = 0.2,
}) => {
    return (
        <motion.section
            className={className}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay }}
        >
            {children}
        </motion.section>
    );
};

export default AnimatedSection;
