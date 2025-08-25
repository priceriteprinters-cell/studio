
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Send, Image as ImageIcon, FileText, Link as LinkIcon, Lock, Tv } from 'lucide-react';
import type { PostFormData } from '@/lib/types';
import Image from 'next/image';
import { TELEGRAM_CHANNEL_IDS } from '@/lib/telegram';
import { motion } from 'framer-motion';

interface ReviewStepProps {
  formData: PostFormData;
  onBack: () => void;
  onProcess: () => void;
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
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 150 } },
};

export function ReviewStep({ formData, onBack, onProcess }: ReviewStepProps) {
  const { image, caption, link, settings } = formData;
  const imagePreview = image.base64 || image.url;

  return (
    <motion.div 
      className="p-4 sm:p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <motion.h3 variants={itemVariants} className="font-headline text-xl sm:text-2xl font-semibold mb-2">Review & Post</motion.h3>
      <motion.p variants={itemVariants} className="text-muted-foreground mb-6 text-sm sm:text-base">Please confirm the details below.</motion.p>
      
      <div className="space-y-4 max-h-[50vh] sm:max-h-none overflow-y-auto pr-2">
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center gap-3 pb-4">
              <ImageIcon className="w-5 h-5 text-primary" />
              <CardTitle className="text-base sm:text-lg">Image</CardTitle>
            </CardHeader>
            <CardContent>
              {imagePreview ? (
                  <Image src={imagePreview} alt="Review" width={400} height={225} className="rounded-lg object-contain w-full max-h-48" unoptimized />
              ) : (
                <p className="text-muted-foreground text-sm">No image provided.</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center gap-3 pb-4">
              <FileText className="w-5 h-5 text-primary" />
              <CardTitle className="text-base sm:text-lg">Caption</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-xs sm:text-sm text-muted-foreground bg-secondary/50 p-3 rounded-md max-h-28 overflow-y-auto">{caption}</p>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-4">
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="flex flex-row items-center gap-3 pb-4">
                <LinkIcon className="w-5 h-5 text-primary" />
                <CardTitle className="text-base sm:text-lg">Link</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs sm:text-sm">
                <p className="break-all text-muted-foreground">{link}</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="flex flex-row items-center gap-3 pb-4">
                <Lock className="w-5 h-5 text-primary" />
                <CardTitle className="text-base sm:text-lg">Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-xs sm:text-sm">
                <p><strong>Placement:</strong> <span className="capitalize">{settings.linkPlacement}</span></p>
                <p><strong>Lock Count:</strong> {settings.lockCount}</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
        
        <motion.div variants={itemVariants}>
          <Card>
              <CardHeader className="flex flex-row items-center gap-3 pb-4">
                <Tv className="w-5 h-5 text-primary" />
                <CardTitle className="text-base sm:text-lg">Channels</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs sm:text-sm">
                  <p className="mb-2">
                      Posting to <strong>{settings.selectedChannels.length}</strong> of <strong>{TELEGRAM_CHANNEL_IDS.length}</strong> channels.
                  </p>
                  <div className="max-h-24 overflow-y-auto space-y-1 pr-1">
                      {settings.selectedChannels.map(channelId => {
                          const channel = TELEGRAM_CHANNEL_IDS.find(c => c.id === channelId);
                          return <div key={channelId} className="text-muted-foreground text-xs p-1.5 bg-secondary/50 rounded-md">{channel ? channel.name : channelId}</div>;
                      })}
                  </div>
              </CardContent>
          </Card>
        </motion.div>
      </div>
      
      <motion.div variants={itemVariants} className="mt-8 flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Button onClick={onProcess} className="bg-green-600 hover:bg-green-700 text-white">
          Confirm & Post <Send className="w-4 h-4 ml-2" />
        </Button>
      </motion.div>
    </motion.div>
  );
}

    