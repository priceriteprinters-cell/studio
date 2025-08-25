
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { PostFormData } from '@/lib/types';
import { TELEGRAM_CHANNEL_IDS } from '@/lib/telegram';
import { motion } from 'framer-motion';

interface ChannelStepProps {
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
      staggerChildren: 0.07,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 10 },
  visible: { opacity: 1, scale: 1, y: 0 },
};

export function ChannelStep({ formData, onUpdate, onBack, onNext }: ChannelStepProps) {

  const handleChannelSelection = (channelId: string) => {
    const currentSelection = formData.settings.selectedChannels;
    const newSelection = currentSelection.includes(channelId)
      ? currentSelection.filter(id => id !== channelId)
      : [...currentSelection, channelId];
    onUpdate({ settings: { ...formData.settings, selectedChannels: newSelection } });
  };

  const handleSelectAllChannels = (checked: boolean) => {
    const allChannelIds = TELEGRAM_CHANNEL_IDS.map(c => c.id);
    onUpdate({ settings: { ...formData.settings, selectedChannels: checked ? allChannelIds : [] } });
  };

  const isNextDisabled = formData.settings.selectedChannels.length === 0;

  const allChannelsSelected = formData.settings.selectedChannels.length === TELEGRAM_CHANNEL_IDS.length;
  
  return (
    <motion.div 
      className="p-4 sm:p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <motion.h3 variants={itemVariants} className="font-headline text-xl sm:text-2xl font-semibold mb-2">Select Channels</motion.h3>
      <motion.p variants={itemVariants} className="text-muted-foreground mb-6 text-sm sm:text-base">Choose where the post will be published.</motion.p>
      
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-base sm:text-lg">Distribution Channels</CardTitle>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="select-all" 
                  checked={allChannelsSelected}
                  onCheckedChange={handleSelectAllChannels}
                  aria-label="Select all channels"
                />
                <Label htmlFor="select-all" className="text-xs sm:text-sm font-medium">Select All</Label>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 max-h-[220px] sm:max-h-[300px] overflow-y-auto p-2 sm:p-4">
              {TELEGRAM_CHANNEL_IDS.map((channel, i) => (
                  <motion.div
                    key={channel.id}
                    custom={i}
                    variants={itemVariants}
                  >
                    <Label 
                        htmlFor={channel.id} 
                        className="flex items-center space-x-3 p-3 rounded-lg border-2 has-[:checked]:border-primary has-[:checked]:bg-primary/5 transition-all cursor-pointer"
                    >
                        <Checkbox 
                            id={channel.id} 
                            checked={formData.settings.selectedChannels.includes(channel.id)}
                            onCheckedChange={() => handleChannelSelection(channel.id)}
                        />
                        <span className="font-normal text-sm">{channel.name}</span>
                    </Label>
                  </motion.div>
              ))}
          </CardContent>
        </Card>
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

    