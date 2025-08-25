import React from 'react';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-3", className)}>
      <div className="p-2 bg-primary rounded-lg">
        <Send className="w-6 h-6 text-primary-foreground" />
      </div>
      <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground">
        Telegram <span className="text-primary">AutoPost</span>
      </h1>
    </div>
  );
}
