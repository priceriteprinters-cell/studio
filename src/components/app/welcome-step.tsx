
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Bot, FileText, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface WelcomeStepProps {
  onStart: () => void;
  onUseTestData: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { ease: 'easeOut', duration: 0.5 } },
};

const iconVariants = {
  hidden: { scale: 0.5, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20,
      delay: 0.1
    }
  },
};

export function WelcomeStep({ onStart, onUseTestData }: WelcomeStepProps) {
  return (
    <motion.div 
      className="flex flex-col items-center justify-center text-center p-4 sm:p-8 min-h-[350px] sm:min-h-[400px]"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <motion.div variants={iconVariants} className="relative mb-6">
        <div className="absolute -inset-2 bg-primary/20 rounded-full blur-xl"></div>
        <div className="relative bg-primary text-primary-foreground rounded-full p-3 sm:p-4">
          <Bot className="w-10 h-10 sm:w-12 sm:h-12" />
        </div>
      </motion.div>
      <motion.h2 variants={itemVariants} className="font-headline text-2xl sm:text-3xl font-bold mb-2">Welcome to AutoPost</motion.h2>
      <motion.p variants={itemVariants} className="text-muted-foreground max-w-md mb-8 text-sm sm:text-base">
        Your automated assistant for creating and publishing Telegram posts. Let's get started.
      </motion.p>
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
        <Button size="lg" onClick={onStart}>
          <FileText className="mr-2 h-5 w-5" />
          Create New Post
        </Button>
        <Button size="lg" variant="secondary" onClick={onUseTestData}>
          <Zap className="mr-2 h-5 w-5" />
          Run a Test Post
        </Button>
      </motion.div>
    </motion.div>
  );
}
