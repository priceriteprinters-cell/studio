
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft, ArrowRight, Lock } from 'lucide-react';
import type { PostFormData } from '@/lib/types';
import { motion } from 'framer-motion';

interface LockCountStepProps {
  formData: PostFormData;
  onUpdate: (data: { settings: Partial<PostFormData['settings']> }) => void;
  onBack: () => void;
  onNext: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' } },
};

export function LockCountStep({ formData, onUpdate, onBack, onNext }: LockCountStepProps) {

  const handleLockCountChange = (value: number[]) => {
    onUpdate({ settings: { ...formData.settings, lockCount: value[0] } });
  };

  return (
    <motion.div 
      className="p-4 sm:p-6 min-h-[300px] flex flex-col justify-between"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <div>
        <motion.h3 variants={itemVariants} className="font-headline text-xl sm:text-2xl font-semibold mb-2">Lock Count</motion.h3>
        <motion.p variants={itemVariants} className="text-muted-foreground mb-6 text-sm sm:text-base">How many times should the link be protected?</motion.p>
        
        <motion.div variants={itemVariants} className="py-4 sm:py-8 text-center">
            <div className="flex justify-center items-center gap-2 mb-4">
                <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                <span className="font-bold text-primary text-4xl sm:text-5xl font-headline">{formData.settings.lockCount}</span>
            </div>
          <Slider
            value={[formData.settings.lockCount]}
            onValueChange={handleLockCountChange}
            min={1}
            max={3}
            step={1}
            className="w-3/4 mx-auto"
          />
           <div className="flex justify-between text-xs sm:text-sm text-muted-foreground mt-2 w-3/4 mx-auto">
            <span>1</span>
            <span>2</span>
            <span>3</span>
          </div>
        </motion.div>
      </div>
      
      <motion.div variants={itemVariants} className="mt-8 flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Button onClick={onNext}>
          Next <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </motion.div>
    </motion.div>
  );
}

    