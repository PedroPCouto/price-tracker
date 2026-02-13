'use client';

import { useState } from 'react';
import ProductForm from '@/components/product-form';
import ProductList from '@/components/product-list';
import { TrendingDown } from 'lucide-react';

export default function Home() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleProductAdded = () => {
    setRefreshTrigger((prev) => (prev ?? 0) + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingDown className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Rastreador de preços</h1>
              <p className="text-sm text-muted-foreground">
                Ta aí =)
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-4">Adicone um produto</h2>
            <ProductForm onProductAdded={handleProductAdded} />
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">Produtos monitorados</h2>
            <ProductList refreshTrigger={refreshTrigger} />
          </section>
        </div>
      </main>
    </div>
  );
}
