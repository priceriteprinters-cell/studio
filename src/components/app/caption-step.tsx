
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, ArrowRight, Clipboard } from 'lucide-react';
import type { PostFormData } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

interface CaptionStepProps {
  formData: PostFormData;
  onUpdate: (data: Partial<PostFormData>) => void;
  onBack: () => void;
  onNext: () => void;
}

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

export function CaptionStep({ formData, onUpdate, onBack, onNext }: CaptionStepProps) {
  const { toast } = useToast();

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      onUpdate({ caption: text });
      toast({ title: 'Pasted from clipboard!' });
      onNext();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Failed to paste', description: 'Could not read from clipboard.' });
    }
  };

  const isNextDisabled = !formData.caption;

  return (
    <motion.div 
      className="p-4 sm:p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <motion.h3 variants={itemVariants} className="font-headline text-xl sm:text-2xl font-semibold mb-2">Add Caption</motion.h3>
      <motion.p variants={itemVariants} className="text-muted-foreground mb-6 text-sm sm:text-base">Enter the main text for your post.</motion.p>
      
      <motion.div variants={itemVariants} className="space-y-4">
        <div>
          <Label htmlFor="caption" className="flex items-center justify-between mb-2">
            <span className="text-sm">Original Caption</span>
            <Button variant="ghost" size="sm" onClick={handlePaste}>
              <Clipboard className="w-3.5 h-3.5 mr-1.5" />
              Paste & Next
            </Button>
          </Label>
          <Textarea
            id="caption"
            placeholder="Enter the main text for your post..."
            value={formData.caption}
            onChange={(e) => onUpdate({ caption: e.target.value })}
            className="min-h-[180px] sm:min-h-[200px]"
            />
        </div>
      </motion.div>
      
      <motion.div variants={itemVariants} className="mt-8 flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Button onClick={onNext} disabled={isNextDisabled}>
          Next <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </motion.div>
    </motion.div>
  );
}

    