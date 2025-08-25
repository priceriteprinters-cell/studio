
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Stepper } from '@/components/app/stepper';
import { WelcomeStep } from '@/components/app/welcome-step';
import { PhotoStep } from '@/components/app/photo-step';
import { CaptionStep } from '@/components/app/caption-step';
import { LinkStep } from '@/components/app/link-step';
import { LinkPlacementStep } from '@/components/app/link-placement-step';
import { LockCountStep } from '@/components/app/lock-count-step';
import { ChannelStep } from '@/components/app/channel-step';
import { ReviewStep } from '@/components/app/review-step';
import { ProcessingStep } from '@/components/app/processing-step';
import { ResultStep } from '@/components/app/result-step';
import { Logo } from '@/components/logo';
import { TELEGRAM_CHANNEL_IDS } from '@/lib/telegram';

import type { PostFormData, ProcessingResult, FullPostData } from '@/lib/types';
import { processPost, deletePost } from './actions';
import { useToast } from "@/hooks/use-toast"
import { ThemeToggle } from '@/components/app/theme-toggle';
import { compressImage } from '@/lib/utils';

const testData: PostFormData = {
  image: {
    method: 'url',
    file: null,
    url: 'https://images.unsplash.com/photo-1526779259212-939e64788e3c?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8ZnJlZSUyMGltYWdlc3xlbnwwfHwwfHx8MA%3D%3D',
    base64: '',
  },
  caption: "Model: Starrysigh\n\n🌐 Starrysigh / Starry sigh / Starrysighh / Shutupsigh / Starry sighh (UPDATE)\n\n☁️ 32GB + PPVs, solo, s#x tapes, lesb#an collabs and more:",
  link: 'https://link-target.net/466612/KTOsJPAgmgif',
  settings: {
    linkPlacement: 'both',
    lockCount: 1,
    selectedChannels: TELEGRAM_CHANNEL_IDS.map(c => c.id),
  },
};


type Step = 'welcome' | 'photo' | 'caption' | 'link' | 'link-placement' | 'lock-count' | 'channels' | 'review' | 'processing' | 'result';

const stepsConfig: { id: Step; name: string }[] = [
  { id: 'photo', name: 'Photo' },
  { id: 'caption', name: 'Caption' },
  { id: 'link', name: 'Link' },
  { id: 'link-placement', name: 'Placement' },
  { id: 'lock-count', name: 'Lock Count' },
  { id: 'channels', name: 'Channels' },
  { id: 'review', name: 'Review & Post' },
];

const animationVariants = {
  slideIn: {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  },
  slideUp: {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -50 },
  },
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  scaleUp: {
      initial: { opacity: 0, scale: 0.8 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.8 },
  },
  springIn: {
      initial: { opacity: 0, y: 30, scale: 0.95 },
      animate: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 200, damping: 20 } },
      exit: { opacity: 0, y: -30, scale: 0.95 },
  },
};

const stepAnimations: Record<Step, keyof typeof animationVariants> = {
  welcome: 'scaleUp',
  photo: 'slideIn',
  caption: 'slideUp',
  link: 'slideIn',
  linkPlacement: 'slideUp',
  lockCount: 'scaleUp',
  channels: 'slideIn',
  review: 'springIn',
  processing: 'fadeIn',
  result: 'scaleUp',
};


export default function Home() {
  const [step, setStep] = useState<Step>('welcome');
  const [formData, setFormData] = useState<PostFormData>({
    image: { method: 'url', file: null, url: 'https://media.sketchfab.com/models/5f00e7996f374c2393c13e4af00fb765/thumbnails/d48d4d5a20af43ca8861cdf2c64260bc/04c39421fd0d4d27b8ab685782d6ff4e.jpeg', base64: '' },
    caption: '',
    link: '',
    settings: {
      linkPlacement: 'both',
      lockCount: 1,
      selectedChannels: TELEGRAM_CHANNEL_IDS.map(c => c.id),
    },
  });
  const [processingResult, setProcessingResult] = useState<ProcessingResult | null>(null);
  const { toast } = useToast();

  const updateFormData = (data: Partial<PostFormData> | { settings: Partial<PostFormData['settings']> }) => {
    if ('settings' in data && typeof data.settings === 'object' && !Array.isArray(data.settings)) {
      setFormData(prev => ({
        ...prev,
        settings: { ...prev.settings, ...data.settings }
      }));
    } else {
      setFormData(prev => ({ ...prev, ...(data as Partial<PostFormData>) }));
    }
  };


  const goToNextStep = () => {
    const currentStepIndex = stepsConfig.findIndex((s) => s.id === step);
    if (currentStepIndex < stepsConfig.length - 1) {
      setStep(stepsConfig[currentStepIndex + 1].id);
    }
  };

  const goToPrevStep = () => {
    const currentStepIndex = stepsConfig.findIndex((s) => s.id === step);
    if (currentStepIndex > 0) {
      setStep(stepsConfig[currentStepIndex - 1].id);
    } else {
      setStep('welcome');
    }
  };

  const handleThreeLocksDirectPost = async () => {
    const dataWithThreeLocks: PostFormData = {
      ...formData,
      settings: {
        ...formData.settings,
        lockCount: 3,
      },
    };
    await handleProcess(dataWithThreeLocks);
  };
  
  const handleStart = () => setStep('photo');
  
  const handleProcess = async (data?: PostFormData) => {
    setStep('processing');
    let result: ProcessingResult;

    const dataToProcess = { ...(data || formData) };

    try {
      if (dataToProcess.image.file && !dataToProcess.image.base64) {
        dataToProcess.image.base64 = await compressImage(dataToProcess.image.file);
      }
      
      const fullData: FullPostData = {
        ...dataToProcess,
        settings: {
          ...dataToProcess.settings,
          buttonText: '📦 Get Mega Access 📦',
        }
      };

      result = await processPost(fullData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      result = {
        success: false,
        error: errorMessage,
        pipelineStatus: { bypass: false, rentry: false, lockr: false, tinyurl: false, gemini: false, telegram: false, admin: false },
      };
    }
    
    setProcessingResult(result);
    setStep('result');

    if(!result.success && result.error && result.error.includes("A critical error occurred")){
      toast({
        variant: "destructive",
        title: "Pipeline Failed",
        description: result.error,
      })
    }
  };
  
  const handleUseTestData = async () => {
    await handleProcess(testData);
  };

  const handleReset = () => {
    setFormData({
      image: { method: 'url', file: null, url: 'https://media.sketchfab.com/models/5f00e7996f374c2393c13e4af00fb765/thumbnails/d48d4d5a20af43ca8861cdf2c64260bc/04c39421fd0d4d27b8ab685782d6ff4e.jpeg', base64: '' },
      caption: '',
      link: '',
      settings: {
        linkPlacement: 'both',
        lockCount: 1,
        selectedChannels: TELEGRAM_CHANNEL_IDS.map(c => c.id),
      },
    });
    setProcessingResult(null);
    setStep('welcome');
  };
  
  const handleDeletePost = async () => {
    if (!processingResult || !processingResult.steps?.telegram?.results) {
      toast({ variant: 'destructive', title: 'Error', description: 'No post details found to delete.' });
      return;
    }
    const sentMessages = processingResult.steps.telegram.results
        .filter(r => r.success && r.message_id)
        .map(r => ({ chatId: r.channel, messageId: r.message_id! }));
        
    if (sentMessages.length === 0) {
        toast({ title: 'Info', description: 'No messages to delete.' });
        return;
    }

    try {
        const result = await deletePost(sentMessages);
        if (result.success) {
            toast({ title: 'Success', description: 'Post deleted successfully from all channels.' });
        } else {
            toast({ variant: 'destructive', title: 'Deletion Failed', description: result.error || 'Could not delete post from one or more channels.' });
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during deletion.';
        toast({ variant: 'destructive', title: 'Deletion Error', description: errorMessage });
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'welcome':
        return <WelcomeStep onStart={handleStart} onUseTestData={handleUseTestData} />;
      case 'photo':
        return <PhotoStep formData={formData} onUpdate={updateFormData} onNext={goToNextStep} />;
      case 'caption':
        return <CaptionStep formData={formData} onUpdate={updateFormData} onBack={goToPrevStep} onNext={goToNextStep} />;
      case 'link':
        return <LinkStep formData={formData} onUpdate={updateFormData} onBack={goToPrevStep} onNext={goToNextStep} />;
      case 'link-placement':
        return <LinkPlacementStep formData={formData} onUpdate={updateFormData} onBack={goToPrevStep} onNext={goToNextStep} onThreeLocksPreset={handleThreeLocksDirectPost} onDirectPost={() => handleProcess()} />;
      case 'lock-count':
        return <LockCountStep formData={formData} onUpdate={updateFormData} onBack={goToPrevStep} onNext={goToNextStep} />;
      case 'channels':
        return <ChannelStep formData={formData} onUpdate={updateFormData} onBack={goToPrevStep} onNext={goToNextStep} />;
      case 'review':
        return <ReviewStep formData={formData} onBack={goToPrevStep} onProcess={() => handleProcess()} />;
      case 'processing':
        return <ProcessingStep />;
      case 'result':
        return processingResult && <ResultStep result={processingResult} onReset={handleReset} onDelete={handleDeletePost} />;
      default:
        return <WelcomeStep onStart={handleStart} onUseTestData={handleUseTestData} />;
    }
  };

  const currentStepConfig = stepsConfig.find((s) => s.id === step);
  const currentStepIndex = stepsConfig.findIndex((s) => s.id === step);
  const animationType = stepAnimations[step] || 'fadeIn';
  const selectedVariant = animationVariants[animationType];

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-2xl mx-auto">
        <header className="text-center mb-6 sm:mb-8 relative">
          <Logo />
          <div className="absolute top-0 right-0">
            <ThemeToggle />
          </div>
        </header>
        
        {step !== 'welcome' && step !== 'processing' && step !== 'result' && currentStepConfig && (
          <div className="mb-6 sm:mb-8">
            <Stepper 
              currentStep={currentStepIndex + 1} 
              totalSteps={stepsConfig.length}
              title={currentStepConfig.name}
            />
          </div>
        )}

        <Card className="shadow-2xl shadow-primary/10 border-none overflow-hidden rounded-2xl">
          <CardContent className="p-2 sm:p-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                variants={selectedVariant}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>
        <footer className="text-center mt-8 text-sm text-muted-foreground">
          <p>Powered by Next.js, Genkit AI, and Shadcn/UI</p>
        </footer>
      </div>
    </main>
  );
}

    