
'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, Clipboard, Link as LinkIcon, ArrowRight, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { compressImage } from '@/lib/utils';
import type { PostFormData } from '@/lib/types';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface PhotoStepProps {
  formData: PostFormData;
  onUpdate: (data: Partial<PostFormData>) => void;
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
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
};

export function PhotoStep({ formData, onUpdate, onNext }: PhotoStepProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(formData.image.method === 'url' ? formData.image.url : formData.image.base64);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({ variant: 'destructive', title: 'Invalid File', description: 'Please select an image file.' });
      return;
    }
    setLoading(true);
    try {
      const compressedBase64 = await compressImage(file);
      onUpdate({ image: { ...formData.image, method: 'upload', file, base64: compressedBase64, url: '' } });
      setPreview(compressedBase64);
      onNext();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to process image.' });
    } finally {
      setLoading(false);
    }
  };

  const processPastedImage = async (file: File) => {
    setLoading(true);
    try {
      const compressedBase64 = await compressImage(file);
      onUpdate({ image: { ...formData.image, method: 'paste', file, base64: compressedBase64, url: '' } });
      setPreview(compressedBase64);
      toast({ title: 'Image Pasted!', description: 'The image from your clipboard has been loaded.' });
      onNext();
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to process pasted image.' });
    } finally {
      setLoading(false);
    }
  };
  
  const handlePasteButtonClick = async () => {
    if (!navigator.clipboard?.read) {
        toast({ variant: 'destructive', title: 'Unsupported Browser', description: 'Your browser does not support clipboard image pasting.' });
        return;
    }
    try {
        const items = await navigator.clipboard.read();
        for (const item of items) {
            const imageType = item.types.find(type => type.startsWith('image/'));
            if (imageType) {
                const blob = await item.getType(imageType);
                const file = new File([blob], "pasted-image.png", { type: imageType });
                await processPastedImage(file);
                return; 
            }
        }
        toast({ variant: 'destructive', title: 'No Image Found', description: 'Could not find an image in your clipboard.' });
    } catch (err) {
        console.error(err);
        toast({ variant: 'destructive', title: 'Permission Denied', description: 'Could not access clipboard. Please allow access in your browser.' });
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    onUpdate({ image: { ...formData.image, method: 'url', url, base64: '', file: null } });
    if(url && url.startsWith('http')) {
        setPreview(url);
        onNext();
    } else if (url === '') {
        setPreview(null);
    } else {
        setPreview(url);
    }
  }

  const isNextDisabled = !formData.image.base64 && !formData.image.url;

  return (
    <motion.div 
      className="p-4 sm:p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <motion.h3 variants={itemVariants} className="font-headline text-xl sm:text-2xl font-semibold mb-2">Add a Photo</motion.h3>
      <motion.p variants={itemVariants} className="text-muted-foreground mb-6 text-sm sm:text-base">Choose a method to add an image for your post.</motion.p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-start">
        <motion.div variants={itemVariants}>
          <Tabs defaultValue="paste" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="paste"><Clipboard className="w-4 h-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Paste</span></TabsTrigger>
              <TabsTrigger value="upload"><Upload className="w-4 h-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Upload</span></TabsTrigger>
              <TabsTrigger value="url"><LinkIcon className="w-4 h-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">URL</span></TabsTrigger>
            </TabsList>
            <TabsContent value="upload" className="mt-4">
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={(e) => handleFileChange(e.target.files?.[0] || null)} />
              <Button className="w-full" onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-4 h-4 mr-2" /> Choose a file
              </Button>
            </TabsContent>
            <TabsContent value="paste" className="mt-4">
              <Button className="w-full" onClick={handlePasteButtonClick} disabled={loading}>
                <Clipboard className="w-4 h-4 mr-2" /> Paste Image from Clipboard
              </Button>
              <p className="text-xs text-muted-foreground mt-2">Click the button to paste an image.</p>
            </TabsContent>
            <TabsContent value="url" className="mt-4">
              <Input placeholder="https://example.com/image.jpg" value={formData.image.url} onChange={handleUrlChange} />
            </TabsContent>
          </Tabs>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Card className="w-full aspect-video flex items-center justify-center bg-muted/50 border-2 border-dashed">
            <CardContent className="p-0 w-full h-full flex items-center justify-center">
              {loading ? (
                <div className="text-muted-foreground text-sm">Compressing...</div>
              ) : preview ? (
                <Image src={preview} alt="Preview" width={400} height={225} className="object-contain w-full h-full rounded-lg" unoptimized/>
              ) : (
                <div className="text-center text-muted-foreground p-4">
                  <ImageIcon className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2" />
                  <p className="text-sm">Image Preview</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={itemVariants} className="mt-8 flex justify-end">
        <Button onClick={onNext} disabled={isNextDisabled || loading}>
          Next <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </motion.div>
    </motion.div>
  );
}

    