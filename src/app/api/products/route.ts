import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        priceHistory: {
          orderBy: { checkedAt: "desc" },
          take: 1,
        },
      },
    });

    const formattedProducts =
      products?.map((product: any) => ({
        id: product?.id ?? "",
        name: product?.name ?? "",
        url: product?.url ?? "",
        tags: product?.tags ?? "",
        website: product?.website ?? "",
        createdAt: product?.createdAt?.toISOString() ?? "",
        currentPrice: product?.priceHistory?.[0]?.price ?? null,
        currency: product?.priceHistory?.[0]?.currency ?? "BRL",
        lastChecked:
          product?.priceHistory?.[0]?.checkedAt?.toISOString() ?? null,
      })) ?? [];

    return NextResponse.json(formattedProducts);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, url, tag, currentPrice } = body ?? {};

    if (!name || !url) {
      return NextResponse.json(
        { error: "Name and URL are required" },
        { status: 400 },
      );
    }

    let website = "Unknown";
    try {
      const urlObj = new URL(url);
      website = urlObj?.hostname?.replace(/^www\./, "") ?? "Unknown";
    } catch (e) {
      console.error("Invalid URL:", e);
    }

    let priceSelector = null;

    if (currentPrice) {
      try {
        const response = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
          },
        });
        
        if (response.ok) {
          const html = await response.text();
          const $ = cheerio.load(html);

          const targetElement = $(`*:contains("${currentPrice}")`).last();

          if (targetElement.length > 0) {
            const tagName = targetElement.prop("tagName")?.toLowerCase() || "";
            const id = targetElement.attr("id") ? `#${targetElement.attr("id")}` : "";
            const classes = targetElement.attr("class") 
              ? `.${targetElement.attr("class")?.trim().split(/\s+/).join(".")}` 
              : "";
            
            priceSelector = `${tagName}${id}${classes}`;
          }
        }
      } catch (err) {
        console.error("Failed to fetch HTML or generate selector:", err);
      }
    }

    const product = await prisma.product.create({
      data: {
        name,
        url,
        website,
        tags: tag ?? "",
        priceSelector: priceSelector ?? "",
      },
    });

    await prisma.priceHistory.create({
      data: {
        productId: product?.id ?? "",
        price: currentPrice ? String(currentPrice) : 0,
        currency: "BRL",
      },
    });

    return NextResponse.json({
      id: product?.id ?? "",
      name: product?.name ?? "",
      url: product?.url ?? "",
      website: product?.website ?? "",
      createdAt: product?.createdAt?.toISOString() ?? "",
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 },
    );
  }
}