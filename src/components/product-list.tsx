"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2, RefreshCw, TrendingDown, ExternalLink } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import PriceChart from "./price-chart";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Product {
  id: string;
  name: string;
  url: string;
  website: string;
  createdAt: string;
  currentPrice: number | null;
  currency: string;
  lastChecked: string | null;
}

interface ProductListProps {
  refreshTrigger?: number;
}

export default function ProductList({ refreshTrigger }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingPrice, setCheckingPrice] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      if (!response?.ok) {
        throw new Error("Failed to fetch products");
      }
      const data = await response.json();
      setProducts(data ?? []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [refreshTrigger]);

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (!response?.ok) {
        throw new Error("Failed to delete product");
      }

      toast({
        title: "Success",
        description: "Product deleted successfully",
      });

      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const handleCheckPrice = async (id: string) => {
    setCheckingPrice(id);

    try {
      const response = await fetch(`/api/products/${id}/check-price`, {
        method: "POST",
      });

      if (!response?.ok) {
        const error = await response.json();
        throw new Error(error?.error ?? "Erro ao checar o preço");
      }

      toast({
        title: "Sucesso",
        description: "Dados atualizados com sucesso",
      });

      fetchProducts();
    } catch (error: any) {
      console.error("Error checking price:", error);
      toast({
        title: "Error",
        description: error?.message ?? "Erro ao checar o preço",
        variant: "destructive",
      });
    } finally {
      setCheckingPrice(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (products?.length === 0) {
    return (
      <Card className="p-12 text-center shadow-lg">
        <TrendingDown className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Sem produtos ainda</h3>
        <p className="text-muted-foreground">
          Adicione um produto para começar a monitorar
        </p>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products?.map?.((product) => (
          <Card
            key={product?.id}
            className="p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
            onClick={() => setSelectedProduct(product?.id ?? null)}
          >
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-1">
                  {product?.name ?? ""}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {product?.website ?? ""}
                </p>
              </div>

              {product?.currentPrice ? (
                <div className="bg-primary/10 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">
                    Preço atual
                  </p>
                  <p className="text-2xl font-bold">
                    {product?.currency ?? "BRL"}{" "}
                    {product?.currentPrice?.toFixed?.(2) ?? "0.00"}
                  </p>
                  {product?.lastChecked && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Atualizado:{" "}
                      {new Date(
                        product?.lastChecked ?? "",
                      )?.toLocaleDateString?.()}
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">
                    Sem valores ainda
                  </p>
                </div>
              )}

              <div
                className="flex gap-2"
                onClick={(e) => e?.stopPropagation?.()}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleCheckPrice(product?.id ?? "")}
                  disabled={checkingPrice === product?.id}
                >
                  {checkingPrice === product?.id ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window?.open?.(product?.url ?? "", "_blank")}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(product?.id ?? "")}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog
        open={!!selectedProduct}
        onOpenChange={() => setSelectedProduct(null)}
      >
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {products?.find?.((p) => p?.id === selectedProduct)?.name ??
                "Histórico de preços"}
            </DialogTitle>
          </DialogHeader>
          {selectedProduct && <PriceChart productId={selectedProduct} />}
        </DialogContent>
      </Dialog>
    </>
  );
}
