'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { ShoppingCart, MapPin, Check, Boxes, Globe } from 'lucide-react';

interface Inventory {
  warehouseId: string;
  warehouseName: string;
  totalStock: number;
  reservedStock: number;
  availableStock: number;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  inventory: Inventory[];
}

export default function ProductCard({ product }: { product: Product }) {
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  const handleReserve = async (warehouseId: string) => {
    setLoading(warehouseId);
    try {
      const idempotencyKey = uuidv4();
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify({
          productId: product.id,
          warehouseId,
          quantity: 1,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          toast.error('Not enough stock available');
        } else {
          toast.error(data.error || 'Something went wrong');
        }
        return;
      }

      toast.success('Reservation successful. Finalizing details...');
      router.push(`/reservations/${data.id}`);
    } catch (error) {
      toast.error('Failed to connect to fulfillment server');
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card className="premium-card group h-full flex flex-col rounded-3xl overflow-hidden">
      {/* Decorative Header */}
      <div className="p-8 pb-0">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Boxes className="w-4 h-4 text-primary" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Certified Asset</span>
          </div>
          <div className="flex items-center gap-1">
            <Globe className="w-3 h-3 text-muted-foreground" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase">{product.inventory.length} Regions</span>
          </div>
        </div>
        
        <CardTitle className="text-3xl font-black mb-2 group-hover:text-primary transition-colors leading-tight">
          {product.name}
        </CardTitle>
        <CardDescription className="text-sm font-medium text-muted-foreground/80 leading-relaxed mb-6">
          {product.description}
        </CardDescription>
      </div>

      <CardContent className="px-8 flex-grow">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-px flex-grow bg-border/50" />
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Fulfillment Centers</span>
            <div className="h-px flex-grow bg-border/50" />
          </div>
          
          <div className="space-y-2">
            {product.inventory.map((inv) => (
              <div 
                key={inv.warehouseId} 
                className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-transparent hover:border-primary/20 hover:bg-muted/50 transition-all group/item"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-bold">{inv.warehouseName}</span>
                  <div className="flex items-center gap-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${inv.availableStock > 0 ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                      {inv.availableStock > 0 ? 'In Stock' : 'Depleted'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className={`text-sm font-black ${inv.availableStock > 0 ? '' : 'text-muted-foreground'}`}>
                      {inv.availableStock}
                    </span>
                    <p className="text-[8px] font-bold uppercase text-muted-foreground leading-none">Units</p>
                  </div>
                  <Button
                    size="icon"
                    className={`rounded-xl w-10 h-10 ${inv.availableStock > 0 ? 'shadow-lg shadow-primary/20' : 'grayscale opacity-20'}`}
                    disabled={inv.availableStock <= 0 || loading === inv.warehouseId}
                    onClick={() => handleReserve(inv.warehouseId)}
                  >
                    {loading === inv.warehouseId ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <ShoppingCart className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-8 pt-0 mt-4 flex items-center justify-between border-t border-border/20 pt-6">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-green-500/10 rounded-lg">
            <Check className="w-3 h-3 text-green-500" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest">Atomic Lock Ready</span>
        </div>
        <Badge variant="outline" className="text-[9px] font-mono opacity-50 border-none px-0 uppercase tracking-tighter">
          UUID: {product.id.substring(0, 8)}
        </Badge>
      </CardFooter>
    </Card>
  );
}
