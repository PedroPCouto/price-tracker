"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2, RefreshCw, TrendingDown, ExternalLink, Filter } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import PriceChart from "./price-chart";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "./ui/input";
import "@/components/styles.css";

interface Product {
  id: string;
  name: string;
  url: string;
  website: string;
  createdAt: string;
  currentPrice: number | null;
  currency: string;
  lastChecked: string | null;
  tags: string;
}

interface ProductListProps {
  refreshTrigger?: number;
}

export default function ProductList({ refreshTrigger }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingPrice, setCheckingPrice] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  const [filter, setFilter] = useState(""); 

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


    const openFilterModal = () => {
    const modal = document?.getElementById?.("filter_modal");
    if (modal) {
      modal?.classList?.toggle?.("occulted");
    }
  }
  

  const filterByTag = (tag: string) => {
    console.log("Filtering by tag:", tag);
    const filter = tag?.trim()?.toLowerCase();
    console.log("Filtering by tag:", filter);
    if (!filter) {
      setFilter("");
      fetchProducts();
      return;
    }

    const filtered = products?.filter((product) => {
      const tags = product?.tags?.split?.(",")?.map?.((t: string) => t?.trim()?.toLowerCase());
      for (const t of tags) {
        if (t.includes(filter)) {
          return true;
        }
      }
      return false;
    });
    setFilter(tag);
    setProducts(filtered ?? []);
  }

  if (products?.length === 0) {
    return (
      <>
      <div className="relative flex justify-end mb-6">
        <Button
          variant="outline"
          className="flex items-center gap-2 border-2 border-primary/30 hover:border-primary hover:bg-primary/5 transition-all duration-200 px-4 py-2 rounded-xl shadow-sm"
          onClick={openFilterModal}
          disabled={loading}
        >
          <Filter className="h-4 w-4 text-primary" />
        </Button>

        <div
          id="filter_modal"
          className="drop_down occulted absolute top-12 right-0 z-50 bg-background border border-border rounded-2xl shadow-xl p-4 w-64 flex flex-col gap-3"
        >
          <p className="text-sm font-semibold text-foreground">Filtrar por tag</p>
          <Input
            placeholder="Digite uma tag..."
            className="rounded-lg border-border focus:ring-2 focus:ring-primary/30"
            onChange={(e) => filterByTag(e.target.value)}
            value={filter}
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 text-xs rounded-lg hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
              onClick={() => filterByTag("")}
            >
              Limpar
            </Button>
            <Button
              variant="outline"
              className="flex-1 text-xs rounded-lg hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors"
              onClick={openFilterModal}
            >
              Fechar
            </Button>
          </div>
        </div>
      </div>
      <Card className="p-12 text-center shadow-lg">
        <TrendingDown className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Sem produtos ainda</h3>
        <p className="text-muted-foreground">
          Adicione um produto para começar a monitorar
        </p>
      </Card>
      </>
    );
  }



  return (
    <>
      <div className="relative flex justify-end mb-6">
        <Button
          variant="outline"
          className="flex items-center gap-2 border-2 border-primary/30 hover:border-primary hover:bg-primary/5 transition-all duration-200 px-4 py-2 rounded-xl shadow-sm"
          onClick={openFilterModal}
          disabled={loading}
        >
          <Filter className="h-4 w-4 text-primary" />
        </Button>

        <div
          id="filter_modal"
          className="drop_down occulted absolute top-12 right-0 z-50 bg-background border border-border rounded-2xl shadow-xl p-4 w-64 flex flex-col gap-3"
        >
          <p className="text-sm font-semibold text-foreground">Filtrar por tag</p>
          <Input
            placeholder="Digite uma tag..."
            className="rounded-lg border-border focus:ring-2 focus:ring-primary/30"
            onChange={(e) => filterByTag(e.target.value)}
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 text-xs rounded-lg hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
              onClick={() => filterByTag("")}
            >
              Limpar
            </Button>
            <Button
              variant="outline"
              className="flex-1 text-xs rounded-lg hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors"
              onClick={openFilterModal}
            >
              Fechar
            </Button>
          </div>
        </div>
      </div>
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
                {product?.tags && (
                  <div className="mt-2">
                    {product?.tags?.split?.(",")?.map?.((tag: string) => (
                      <span
                        key={tag}
                        className="inline-block bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded mr-2"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
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
