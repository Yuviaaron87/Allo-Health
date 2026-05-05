'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Lock, User, Zap, ShieldCheck, Mail, ArrowRight } from 'lucide-react';

function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // Handle Login
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          toast.error('Access Denied: Invalid Credentials');
        } else {
          toast.success('Handshake Verified. Welcome back.');
          router.push(callbackUrl);
          router.refresh();
        }
      } else {
        // Handle Registration
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name }),
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.error || 'Registration failed');
        } else {
          toast.success('Account Created. Initializing auto-login...');
          
          // Auto-login after registration
          const loginResult = await signIn('credentials', {
            email,
            password,
            redirect: false,
          });

          if (loginResult?.error) {
            toast.error('Auto-login failed. Please sign in manually.');
            setIsLogin(true);
          } else {
            router.push(callbackUrl);
            router.refresh();
          }
        }
      }
    } catch (error) {
      toast.error('System Authentication Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {!isLogin && (
          <div className="space-y-2">
            <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Full Name</Label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={!isLogin}
                className="pl-12 h-14 bg-white/5 border-white/10 rounded-xl focus:border-primary/50 focus:ring-primary/20 text-white font-mono placeholder:opacity-30"
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Email Identity</Label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              id="email"
              type="email"
              placeholder="admin@allostock.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pl-12 h-14 bg-white/5 border-white/10 rounded-xl focus:border-primary/50 focus:ring-primary/20 text-white font-mono placeholder:opacity-30"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Access Key</Label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="pl-12 h-14 bg-white/5 border-white/10 rounded-xl focus:border-primary/50 focus:ring-primary/20 text-white font-mono placeholder:opacity-30"
            />
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={loading}
          className="w-full h-14 text-sm font-black uppercase tracking-widest rounded-xl neon-button bg-primary hover:bg-primary/90 text-white mt-4"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 fill-white" />
              {isLogin ? 'Initialize Handshake' : 'Establish Protocol'}
            </div>
          )}
        </Button>
      </form>

      <div className="text-center">
        <button
          type="button"
          onClick={() => setIsLogin(!isLogin)}
          className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-2 mx-auto group"
        >
          {isLogin ? "Request New Access Node" : "Existing Node Login"}
          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Neon Background Elements */}
      <div className="absolute inset-0 cyber-grid opacity-20" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[150px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[150px]" />
      
      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-700">
        <Card className="bg-black/60 backdrop-blur-2xl border-2 border-primary/30 neon-border rounded-[2rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,1)]">
          <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary to-transparent" />
          
          <CardHeader className="text-center pt-10 pb-6">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl border border-primary/50 flex items-center justify-center neon-border animate-pulse">
                <ShieldCheck className="w-8 h-8 text-primary neon-text" />
              </div>
            </div>
            <CardTitle className="text-3xl font-black tracking-tighter text-white neon-text uppercase italic">
              Terminal <span className="text-primary">Access</span>
            </CardTitle>
            <CardDescription className="text-muted-foreground font-bold text-[10px] uppercase tracking-[0.3em] mt-2">
              Secure Asset Management Protocol
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Suspense fallback={<div className="h-64 flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
              <AuthForm />
            </Suspense>
          </CardContent>

          <CardFooter className="pb-10 pt-4 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-[9px] font-black text-muted-foreground uppercase tracking-tighter">
              <div className="w-1 h-1 rounded-full bg-green-500 animate-ping" />
              Auth Node: Stable
            </div>
            <p className="text-[8px] text-center text-muted-foreground/50 uppercase tracking-widest leading-relaxed">
              Unauthorized access to this terminal is strictly monitored by the protocol.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
