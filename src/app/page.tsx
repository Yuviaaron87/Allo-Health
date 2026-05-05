import db from '@/lib/db';
import ProductCard from '@/components/ProductCard';
import { Package, Truck, ShieldCheck, Zap, ArrowRight, Layers, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut } from '@/auth';

async function getProducts() {
  const products = await db.product.findMany({
    include: {
      inventory: {
        include: {
          warehouse: true,
        },
      },
    },
  });

  return products.map((product) => ({
    ...product,
    inventory: product.inventory.map((inv) => ({
      warehouseId: inv.warehouseId,
      warehouseName: inv.warehouse.name,
      totalStock: inv.totalStock,
      reservedStock: inv.reservedStock,
      availableStock: inv.totalStock - inv.reservedStock,
    })),
  }));
}

export default async function Home() {
  const products = await getProducts();

  return (
    <div className="min-h-screen bg-background mesh-gradient relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-screen pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Navigation Header */}
      <header className="fixed top-0 w-full z-50 glass-panel border-b-0">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
              <Layers className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase">Allo<span className="text-primary">Stock</span></span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <nav className="flex items-center gap-6">
              <a href="#" className="text-sm font-semibold hover:text-primary transition-colors">Products</a>
              <a href="#" className="text-sm font-semibold hover:text-primary transition-colors">Warehouses</a>
              <a href="#" className="text-sm font-semibold hover:text-primary transition-colors">Analytics</a>
            </nav>
            <form action={async () => {
              'use server';
              await signOut();
            }}>
              <Button variant="outline" className="rounded-full px-6 font-bold border-2 flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto pt-48 pb-24 px-6 relative">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 text-secondary-foreground text-xs font-bold uppercase tracking-widest mb-8 border border-secondary/20 animate-in fade-in duration-1000">
            <Zap className="w-3 h-3 fill-current" />
            <span>Industrial Grade Inventory Engine</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black leading-[0.9] mb-8 reveal-text">
            PRECISION <br />
            <span className="text-lux opacity-80">RESERVATIONS.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mb-12 animate-in fade-in slide-in-from-left-8 duration-1000 delay-300">
            The elite stock-locking protocol for multi-warehouse global commerce. Experience zero race conditions, atomic synchronization, and instant fulfillment.
          </p>
          
          <div className="flex flex-wrap gap-4 animate-in fade-in slide-in-from-top-4 duration-1000 delay-500">
            <Button className="h-16 px-10 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 hover:scale-[1.03] transition-all">
              Explore Catalog <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <div className="flex -space-x-4 items-center pl-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-12 h-12 rounded-full border-4 border-background bg-muted flex items-center justify-center overflow-hidden">
                  <img src={`https://i.pravatar.cc/150?u=${i}`} alt="user" className="w-full h-full object-cover" />
                </div>
              ))}
              <div className="pl-6 text-sm font-bold text-muted-foreground">
                Trusted by 2,000+ teams
              </div>
            </div>
          </div>
        </div>

        {/* Feature Floating Tags */}
        <div className="absolute top-1/2 right-12 hidden lg:flex flex-col gap-6 -translate-y-1/2">
          {[
            { icon: <ShieldCheck className="text-green-500" />, text: "Atomic Locking" },
            { icon: <Truck className="text-blue-500" />, text: "Swift Logistics" },
            { icon: <Package className="text-orange-500" />, text: "Global Sync" }
          ].map((feature, i) => (
            <div key={i} className="glass-panel p-4 rounded-2xl flex items-center gap-4 hover:translate-x-[-10px] transition-transform duration-500 cursor-default">
              <div className="p-3 bg-background/50 rounded-xl shadow-inner">
                {feature.icon}
              </div>
              <span className="font-bold text-sm">{feature.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Product Section */}
      <section id="catalog" className="container mx-auto py-24 px-6 relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <h2 className="text-4xl font-black mb-4">Elite <span className="text-primary">Inventory</span></h2>
            <p className="text-muted-foreground font-medium max-w-lg">
              Live availability tracking across our global fulfillment network.
            </p>
          </div>
          <div className="flex items-center gap-2 p-1 bg-muted rounded-xl border">
            <Button variant="ghost" size="sm" className="bg-background shadow-sm font-bold rounded-lg px-6">Grid</Button>
            <Button variant="ghost" size="sm" className="font-bold rounded-lg px-6">Table</Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/50 py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Layers className="text-white w-5 h-5" />
                </div>
                <span className="text-xl font-black tracking-tighter uppercase">Allo Stock</span>
              </div>
              <p className="text-muted-foreground max-w-sm mb-8">
                The world's most advanced inventory reservation protocol. Built for reliability, speed, and precision.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-6 uppercase text-xs tracking-widest text-primary">Platform</h4>
              <ul className="space-y-4 text-sm font-semibold">
                <li><a href="#" className="hover:text-primary transition-colors">Fulfillment</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">API Docs</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 uppercase text-xs tracking-widest text-primary">Company</h4>
              <ul className="space-y-4 text-sm font-semibold">
                <li><a href="#" className="hover:text-primary transition-colors">About</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
            <p>© 2026 Allo Stock Protocol. All rights reserved.</p>
            <div className="flex gap-8">
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
              <a href="#">Security</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
