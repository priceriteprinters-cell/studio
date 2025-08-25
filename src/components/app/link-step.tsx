
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ArrowRight, Clipboard } from 'lucide-react';
import type { PostFormData } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

interface LinkStepProps {
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
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function LinkStep({ formData, onUpdate, onBack, onNext }: LinkStepProps) {
  const { toast } = useToast();

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.startsWith('http')) {
        onUpdate({ link: text });
        toast({ title: 'Pasted from clipboard!' });
        onNext();
      } else {
        onUpdate({ link: text });
        toast({ variant: 'destructive', title: 'Invalid Link', description: 'Please paste a valid URL starting with http.' });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Failed to paste', description: 'Could not read from clipboard.' });
    }
  };
  
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    onUpdate({ link: url });
    if(url && url.startsWith('http')) {
      // If user types a valid url, we could also auto-next, but it might be annoying.
      // onNext(); 
    }
  }

  const isNextDisabled = !formData.link || !formData.link.startsWith('http');

  return (
    <motion.div 
      className="p-4 sm:p-6 min-h-[300px] flex flex-col justify-between"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <div>
        <motion.h3 variants={itemVariants} className="font-headline text-xl sm:text-2xl font-semibold mb-2">Enter Link</motion.h3>
        <motion.p variants={itemVariants} className="text-muted-foreground mb-6 text-sm sm:text-base">Provide the main link for your post.</motion.p>
        
        <motion.div variants={itemVariants} className="space-y-4">
          <div>
            <Label htmlFor="link" className="flex items-center justify-between mb-2">
              <span className="text-sm">Original Link</span>
              <Button variant="ghost" size="sm" onClick={handlePaste}>
                <Clipboard className="w-3.5 h-3.5 mr-1.5" />
                Paste & Next
              </Button>
            </Label>
            <Input
              id="link"
              placeholder="https://your-protected-link.com/..."
              value={formData.link}
              onChange={handleUrlChange}
            />
             {formData.link && !formData.link.startsWith('http') && (
              <p className="text-sm text-destructive mt-2">Please enter a valid URL (e.g., https://...)</p>
            )}
          </div>
        </motion.div>
      </div>
      
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

    