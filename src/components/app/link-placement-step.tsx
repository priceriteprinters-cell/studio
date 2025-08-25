
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, ArrowRight, Text, MousePointerClick, Combine, Send, Lock, Zap } from 'lucide-react';
import type { PostFormData } from '@/lib/types';
import { motion } from 'framer-motion';

interface LinkPlacementStepProps {
  formData: PostFormData;
  onUpdate: (data: { settings: Partial<PostFormData['settings']> }) => void;
  onBack: () => void;
  onNext: () => void;
  onThreeLocksPreset: () => void;
  onDirectPost: () => void;
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
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 },
};


export function LinkPlacementStep({ formData, onUpdate, onBack, onNext, onThreeLocksPreset, onDirectPost }: LinkPlacementStepProps) {
  
  const handleValueChange = (value: 'caption' | 'button' | 'both') => {
    onUpdate({ settings: { ...formData.settings, linkPlacement: value } });
    onNext();
  };
  
  return (
    <motion.div 
      className="p-4 sm:p-6 flex flex-col"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <div>
        <motion.h3 variants={itemVariants} className="font-headline text-xl sm:text-2xl font-semibold mb-2">Link Placement & Shortcuts</motion.h3>
        <motion.p variants={itemVariants} className="text-muted-foreground mb-6 text-sm sm:text-base">Choose how the final link will be displayed, or use a shortcut to post faster.</motion.p>
        
        <motion.div variants={itemVariants}>
          <RadioGroup
            value={formData.settings.linkPlacement}
            onValueChange={handleValueChange}
            className="space-y-2 sm:space-y-3"
          >
            <Label htmlFor="both-placement" className="flex items-center space-x-4 p-3 sm:p-4 rounded-lg border-2 has-[:checked]:border-primary has-[:checked]:bg-primary/5 transition-all cursor-pointer">
              <RadioGroupItem value="both" id="both-placement" className="sr-only" />
              <div className="p-2 bg-primary/10 rounded-md text-primary">
                <Combine className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <p className="font-semibold text-sm sm:text-base">Both</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Show in the caption and as a button.</p>
              </div>
            </Label>
            <Label htmlFor="caption-placement" className="flex items-center space-x-4 p-3 sm:p-4 rounded-lg border-2 has-[:checked]:border-primary has-[:checked]:bg-primary/5 transition-all cursor-pointer">
              <RadioGroupItem value="caption" id="caption-placement" className="sr-only" />
              <div className="p-2 bg-primary/10 rounded-md text-primary">
                <Text className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <p className="font-semibold text-sm sm:text-base">In Caption</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Only show the link in the caption text.</p>
              </div>
            </Label>
            <Label htmlFor="button-placement" className="flex items-center space-x-4 p-3 sm:p-4 rounded-lg border-2 has-[:checked]:border-primary has-[:checked]:bg-primary/5 transition-all cursor-pointer">
              <RadioGroupItem value="button" id="button-placement" className="sr-only" />
              <div className="p-2 bg-primary/10 rounded-md text-primary">
                <MousePointerClick className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <p className="font-semibold text-sm sm:text-base">As Button</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Only show the link as a button.</p>
              </div>
            </Label>
          </RadioGroup>
        </motion.div>
      </div>
      
      <motion.div variants={itemVariants} className="mt-8 flex justify-between items-center flex-wrap gap-2">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={onThreeLocksPreset}>
                Post with 3 Locks <Lock className="w-4 h-4 ml-2" />
            </Button>
             <Button variant="destructive" onClick={onDirectPost}>
                Direct Post <Zap className="w-4 h-4 ml-2" />
            </Button>
            <Button onClick={onNext}>
                Next <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

    