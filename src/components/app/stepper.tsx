
'use client';

import React from 'react';

interface StepperProps {
  currentStep: number;
  totalSteps: number;
  title: string;
}

export function Stepper({ currentStep, totalSteps, title }: StepperProps) {
  return (
    <div className="flex items-center justify-center gap-3">
        <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">
            <span>{currentStep}</span>
        </div>
        <div className="flex flex-col text-left">
            <span className="text-xs text-muted-foreground">Step {currentStep} of {totalSteps}</span>
            <span className="font-semibold text-foreground">{title}</span>
        </div>
    </div>
  );
}
