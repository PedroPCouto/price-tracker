'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { PlusCircle, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ProductFormProps {
  onProductAdded?: () => void;
}

export default function ProductForm({ onProductAdded }: ProductFormProps) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [tag, setTag] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e?.preventDefault?.();

    if (!name?.trim() || !url?.trim()) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, url }),
      });

      if (!response?.ok) {
        throw new Error('Failed to add product');
      }

      toast({
        title: 'Success',
        description: 'Product added successfully',
      });

      setName('');
      setUrl('');
      onProductAdded?.();
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: 'Error',
        description: 'Failed to add product',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 shadow-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name" className="text-sm font-medium">
            Nome do produto
          </Label>
          <Input
            id="name"
            type="text"
            value={name ?? ''}
            onChange={(e) => setName(e?.target?.value ?? '')}
            placeholder="Geladeira Inox 300L"
            className="mt-1.5"
            disabled={loading}
          />
        </div>

        <div>
          <Label htmlFor="url" className="text-sm font-medium">
            URL
          </Label>
          <Input
            id="url"
            type="url"
            value={url ?? ''}
            onChange={(e) => setUrl(e?.target?.value ?? '')}
            placeholder="https://exemplo.com/produto"
            className="mt-1.5"
            disabled={loading}
          />
        </div>

        <div>
          <Label htmlFor="tag" className="text-sm font-medium">
            Tag
          </Label>
          <Input
            id="tag"
            type="text"
            value={tag ?? ''}
            onChange={(e) => setTag(e?.target?.value ?? '')}
            placeholder="Geladeira, Eletrodoméstico (Separar por vírgula)"
            className="mt-1.5"
            disabled={loading}
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adicionando...
            </>
          ) : (
            <>
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicione Produto
            </>
          )}
        </Button>
      </form>
    </Card>
  );
}
