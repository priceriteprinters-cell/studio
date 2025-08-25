
'use client';

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const pipelineSteps = [
  'Bypassing link with Bypass.vip...',
  'Creating content page with Rentry.co...',
  'Protecting link with Lockr.so...',
  'Shortening URL with TinyURL...',
  'Formatting caption with Gemini AI...',
  'Posting photo to Telegram...',
  'Sending admin notification...',
  'Finalizing...',
];

export function ProcessingStep() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prevStep) => (prevStep + 1) % pipelineSteps.length);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 min-h-[350px] sm:min-h-[400px]">
      <Loader2 className="w-12 h-12 sm:w-16 sm:h-16 animate-spin text-primary mb-6" />
      <h2 className="font-headline text-2xl sm:text-3xl font-bold mb-4">Processing Your Post...</h2>
      <p className="text-muted-foreground max-w-md mb-8 text-sm sm:text-base">
        Hold tight! We're running your content through our pipeline. This may take a moment.
      </p>
      <div className="w-full max-w-sm h-6 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-center text-sm text-muted-foreground"
          >
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            <span>{pipelineSteps[currentStep]}</span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
