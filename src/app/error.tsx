'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Server Component Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background mesh-gradient flex flex-col items-center justify-center p-6 text-center">
      <div className="w-24 h-24 bg-red-500/10 rounded-[2rem] flex items-center justify-center mb-8 animate-pulse">
        <AlertCircle className="w-12 h-12 text-red-500" />
      </div>
      
      <h1 className="text-4xl font-black tracking-tighter mb-4 uppercase italic">
        Protocol <span className="text-red-500">Breach</span>
      </h1>
      
      <p className="text-muted-foreground max-w-md mb-12 font-medium">
        An unexpected error occurred during the asset synchronization sequence. 
        {error.digest && (
          <span className="block mt-2 font-mono text-[10px] opacity-50">
            Error Digest: {error.digest}
          </span>
        )}
      </p>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs">
        <Button 
          onClick={() => reset()}
          className="h-14 rounded-xl font-bold flex items-center gap-2 shadow-xl shadow-primary/20"
        >
          <RefreshCcw className="w-4 h-4" />
          Retry Sequence
        </Button>
        <Button 
          variant="outline"
          onClick={() => window.location.href = '/'}
          className="h-14 rounded-xl font-bold flex items-center gap-2 border-2"
        >
          <Home className="w-4 h-4" />
          Return Home
        </Button>
      </div>

      <div className="mt-12 pt-12 border-t border-border/50 w-full max-w-md">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">Diagnostic Information</p>
        <div className="bg-muted/50 p-6 rounded-2xl text-left overflow-auto max-h-48 border border-border/50 shadow-inner">
          <p className="text-[10px] font-mono leading-relaxed text-red-400">
            {error.message || 'The secure session has been terminated by the host.'}
          </p>
        </div>
      </div>
    </div>
  );
}
