'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Timer, ArrowLeft, CheckCircle2, XCircle, ShieldCheck, Box, CreditCard, Lock, ArrowUpRight } from 'lucide-react';
import React from 'react';

interface Reservation {
  id: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  status: string;
  expiresAt: string;
  product: { name: string };
  warehouse: { name: string };
}

export default function ReservationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchReservation() {
      try {
        const res = await fetch(`/api/reservations/${id}`);
        if (!res.ok) {
          toast.error('Secure link invalid or expired');
          router.push('/');
          return;
        }
        const data = await res.json();
        setReservation(data);
        setLoading(false);
      } catch (error) {
        toast.error('Encryption handshake failed');
        router.push('/');
      }
    }

    fetchReservation();
  }, [id, router]);

  useEffect(() => {
    if (!reservation || reservation.status !== 'PENDING') return;

    const interval = setInterval(() => {
      const expiresAt = new Date(reservation.expiresAt).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, expiresAt - now);
      setTimeLeft(diff);

      if (diff === 0) {
        clearInterval(interval);
        setReservation((prev) => prev ? { ...prev, status: 'RELEASED' } : null);
        toast.error('Hold period expired');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [reservation]);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleConfirm = async () => {
    setActionLoading('confirm');
    try {
      const res = await fetch(`/api/reservations/${id}/confirm`, { method: 'POST' });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Fulfillment request denied');
        if (res.status === 410) setReservation((prev) => prev ? { ...prev, status: 'RELEASED' } : null);
        return;
      }

      toast.success('Asset acquisition confirmed');
      setReservation((prev) => prev ? { ...prev, status: 'CONFIRMED' } : null);
    } catch (error) {
      toast.error('Transaction synchronization failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRelease = async () => {
    setActionLoading('release');
    try {
      const res = await fetch(`/api/reservations/${id}/release`, { method: 'POST' });
      if (!res.ok) {
        toast.error('Release sequence aborted');
        return;
      }

      toast.success('Inventory released to global pool');
      setReservation((prev) => prev ? { ...prev, status: 'RELEASED' } : null);
      setTimeout(() => router.push('/'), 1500);
    } catch (error) {
      toast.error('Communication timeout');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-screen bg-background mesh-gradient gap-8">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-primary/20 rounded-full" />
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin absolute top-0" />
      </div>
      <div className="text-center">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-primary animate-pulse">Establishing Secure Session</p>
      </div>
    </div>
  );
  
  if (!reservation) return null;

  const isPending = reservation.status === 'PENDING';
  const isConfirmed = reservation.status === 'CONFIRMED';
  const isReleased = reservation.status === 'RELEASED';

  return (
    <div className="min-h-screen bg-background mesh-gradient flex flex-col items-center py-24 px-6 relative">
      <div className="w-full max-w-2xl relative z-10">
        <Button 
          variant="ghost" 
          className="mb-12 group text-xs font-black uppercase tracking-widest hover:bg-white/5" 
          onClick={() => router.push('/')}
        >
          <ArrowLeft className="mr-3 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> 
          Abort to Control Center
        </Button>

        <Card className="glass-panel border-none rounded-[2.5rem] overflow-hidden">
          {/* Header Badge */}
          <div className="flex justify-center -mt-6">
            <div className={`px-8 py-3 rounded-2xl shadow-xl border font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 ${isConfirmed ? 'bg-green-500 border-green-400 text-white' : isReleased ? 'bg-red-500 border-red-400 text-white' : 'bg-primary border-primary/50 text-white'}`}>
              <Lock className="w-3 h-3" />
              {isConfirmed ? 'Access Granted' : isReleased ? 'Hold Released' : 'Atomic Lock Active'}
            </div>
          </div>
          
          <CardHeader className="text-center pt-12 pb-10 px-12">
            <div className="flex justify-center mb-8">
              <div className={`w-24 h-24 rounded-3xl flex items-center justify-center shadow-inner ${isConfirmed ? 'bg-green-500/10' : isReleased ? 'bg-red-500/10' : 'bg-primary/10'}`}>
                {isConfirmed && <CheckCircle2 className="h-12 w-12 text-green-500" />}
                {isReleased && <XCircle className="h-12 w-12 text-red-500" />}
                {isPending && <Box className="h-12 w-12 text-primary" />}
              </div>
            </div>
            <CardTitle className="text-5xl font-black tracking-tighter mb-4 leading-[0.9]">
              {isConfirmed ? 'ACQUISITION <br/>COMPLETE.' : isReleased ? 'ASSET <br/>RELEASED.' : 'CONFIRM <br/>ALLOCATION.'}
            </CardTitle>
            <CardDescription className="text-sm font-semibold max-w-sm mx-auto leading-relaxed">
              {isPending ? 'Proprietary atomic locking protocol has secured your units. Finalize fulfillment below.' : isConfirmed ? 'The transaction has been synchronized across all nodes.' : 'The hold has been terminated. Stock returned to pool.'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-10 px-12 pb-12">
            {/* Status Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 rounded-3xl bg-card border border-border/50 shadow-inner group hover:border-primary/30 transition-all">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground block mb-3">Asset Identifier</span>
                <p className="text-xl font-black mb-1">{reservation.product.name}</p>
                <div className="flex items-center gap-2">
                  <Badge className="rounded-lg text-[9px] font-black uppercase">Qty: {reservation.quantity}</Badge>
                  <ArrowUpRight className="w-3 h-3 text-muted-foreground" />
                </div>
              </div>
              <div className="p-6 rounded-3xl bg-card border border-border/50 shadow-inner group hover:border-primary/30 transition-all">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground block mb-3">Origin Node</span>
                <p className="text-xl font-black mb-1">{reservation.warehouse.name}</p>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3 h-3 text-primary" />
                  <span className="text-[9px] font-black uppercase text-primary">Verified Location</span>
                </div>
              </div>
            </div>

            {isPending && (
              <div className="p-1 rounded-[2rem] bg-gradient-to-br from-primary/20 via-primary/5 to-transparent shadow-2xl">
                <div className="bg-card/40 backdrop-blur-md rounded-[1.8rem] py-12 px-8 text-center relative overflow-hidden group">
                  <div className="absolute inset-0 shimmer opacity-10" />
                  <Timer className="w-8 h-8 text-primary mx-auto mb-4 animate-pulse" />
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-2">Synchronization Window</p>
                  <div className="text-7xl font-black tabular-nums tracking-tighter text-lux">
                    {formatTime(timeLeft)}
                  </div>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-6 p-12 pt-0">
            {isPending ? (
              <>
                <Button 
                  className="w-full h-20 text-xl font-black rounded-[1.5rem] shadow-[0_20px_40px_rgba(0,0,0,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all bg-primary group" 
                  onClick={handleConfirm}
                  disabled={actionLoading !== null}
                >
                  {actionLoading === 'confirm' ? (
                    <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-6 h-6" />
                      Finalize Acquisition
                    </div>
                  )}
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full h-14 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-red-500 hover:bg-red-500/5" 
                  onClick={handleRelease}
                  disabled={actionLoading !== null}
                >
                  {actionLoading === 'release' ? 'Terminating...' : 'De-allocate Stock'}
                </Button>
              </>
            ) : (
              <Button 
                className="w-full h-20 text-xl font-black rounded-[1.5rem] hover:scale-[1.02] transition-all" 
                onClick={() => router.push('/')}
              >
                Return to Grid
              </Button>
            )}
          </CardFooter>
        </Card>
        
        <div className="mt-12 flex justify-center items-center gap-6 opacity-40">
          <div className="h-px w-12 bg-border" />
          <span className="text-[9px] font-black uppercase tracking-[0.3em]">Encrypted Session Protocol v4.0</span>
          <div className="h-px w-12 bg-border" />
        </div>
      </div>
    </div>
  );
}
