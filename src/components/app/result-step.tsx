'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, RefreshCw, Clipboard, Trash2 } from 'lucide-react';
import type { ProcessingResult } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { TELEGRAM_CHANNEL_IDS } from '@/lib/telegram';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { motion } from 'framer-motion';


interface ResultStepProps {
  result: ProcessingResult;
  onReset: () => void;
  onDelete: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { ease: 'easeOut', duration: 0.3 } },
};

const StatusIcon = ({ status }: { status: boolean }) => {
  return status ? (
    <CheckCircle2 className="w-5 h-5 text-green-500" />
  ) : (
    <XCircle className="w-5 h-5 text-destructive" />
  );
};

export function ResultStep({ result, onReset, onDelete }: ResultStepProps) {
  const { toast } = useToast();
  
  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied to clipboard!' });
  };

  const successfulPosts = result.steps?.telegram?.results?.filter(r => r.success).length ?? 0;
  const totalPosts = result.steps?.telegram?.results?.length ?? 0;
  const canDelete = result.success && successfulPosts > 0;

  return (
    <motion.div 
      className="p-4 sm:p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <motion.div variants={itemVariants} className="text-center mb-6">
        {result.success ? (
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
        ) : (
          <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
        )}
        <h3 className="font-headline text-2xl font-semibold">
          {result.success ? 'Post Processed Successfully!' : 'Processing Failed'}
        </h3>
        {result.success && <p className="text-muted-foreground mt-1">Successfully posted to {successfulPosts}/{totalPosts} channels.</p>}
        {result.error && <p className="text-destructive mt-2">{result.error}</p>}
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-4">
        {result.success && result.formattedCaption && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Final Caption</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => handleCopyToClipboard(result.formattedCaption!)}>
                  <Clipboard className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm">{result.formattedCaption}</p>
            </CardContent>
          </Card>
        )}

        {result.success && result.finalUrl && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Final Link</CardTitle>
               <Button variant="ghost" size="icon" onClick={() => handleCopyToClipboard(result.finalUrl!)}>
                  <Clipboard className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <a href={result.finalUrl} target="_blank" rel="noopener noreferrer" className="text-primary break-all text-sm hover:underline">
                {result.finalUrl}
              </a>
            </CardContent>
          </Card>
        )}

        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="pipeline-status">
                 <AccordionTrigger>
                    <span className="text-lg font-semibold">Pipeline Status</span>
                 </AccordionTrigger>
                 <AccordionContent>
                    <Card>
                      <CardContent className="space-y-2 text-sm pt-6">
                        <div className="flex justify-between items-center"><span>Bypass.vip</span> <StatusIcon status={result.pipelineStatus.bypass} /></div>
                        <div className="flex justify-between items-center"><span>Rentry.co</span> <StatusIcon status={result.pipelineStatus.rentry} /></div>
                        <div className="flex justify-between items-center"><span>Lockr.so</span> <StatusIcon status={result.pipelineStatus.lockr} /></div>
                        <div className="flex justify-between items-center"><span>URL Shortener</span> <StatusIcon status={result.pipelineStatus.tinyurl} /></div>
                        <div className="flex justify-between items-center"><span>Gemini AI</span> <StatusIcon status={result.pipelineStatus.gemini} /></div>
                        <div className="flex justify-between items-center"><span>Telegram Post</span> <StatusIcon status={result.pipelineStatus.telegram} /></div>
                        <div className="flex justify-between items-center"><span>Admin Notification</span> <StatusIcon status={result.pipelineStatus.admin} /></div>
                      </CardContent>
                    </Card>
                 </AccordionContent>
            </AccordionItem>
            {result.steps?.telegram?.results && (
                 <AccordionItem value="telegram-details">
                    <AccordionTrigger>
                        <span className="text-lg font-semibold">Telegram Post Details</span>
                    </AccordionTrigger>
                    <AccordionContent>
                        <Card>
                          <CardContent className="space-y-2 text-sm pt-6">
                            {result.steps.telegram.results.map(res => {
                                const channel = TELEGRAM_CHANNEL_IDS.find(c => c.id === res.channel);
                                return (
                                    <div key={res.channel} className="flex justify-between items-center">
                                        <span>{channel ? channel.name : res.channel}</span>
                                        <div className="flex items-center gap-2">
                                            {res.error && <span className="text-xs text-muted-foreground truncate max-w-[150px]">{res.error}</span>}
                                            <StatusIcon status={res.success} />
                                        </div>
                                    </div>
                                )
                            })}
                          </CardContent>
                        </Card>
                    </AccordionContent>
                </AccordionItem>
            )}
        </Accordion>
      </motion.div>
      
      <motion.div variants={itemVariants} className="mt-8 flex justify-center gap-4">
        <Button onClick={onReset}>
          <RefreshCw className="w-4 h-4 mr-2" /> Start New Post
        </Button>
        {canDelete && (
            <Button variant="destructive" onClick={onDelete}>
                <Trash2 className="w-4 h-4 mr-2" /> Delete Post
            </Button>
        )}
      </motion.div>
    </motion.div>
  );
}
