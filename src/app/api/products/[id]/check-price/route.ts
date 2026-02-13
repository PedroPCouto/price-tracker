import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 },
      );
    }

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const priceData = await scrapePrice(product?.url ?? "");

    if (!priceData?.price) {
      return NextResponse.json(
        { error: "Could not extract price from URL" },
        { status: 400 },
      );
    }

    const priceHistory = await prisma.priceHistory.create({
      data: {
        productId: id,
        price: priceData?.price ?? 0,
        currency: priceData?.currency ?? "BRL",
      },
    });

    return NextResponse.json({
      id: priceHistory?.id ?? "",
      price: priceHistory?.price ?? 0,
      currency: priceHistory?.currency ?? "BRL",
      checkedAt: priceHistory?.checkedAt?.toISOString() ?? "",
    });
  } catch (error) {
    console.error("Error checking price:", error);
    return NextResponse.json(
      { error: "Failed to check price" },
      { status: 500 },
    );
  }
}

async function scrapePrice(
  url: string,
): Promise<{ price: number; currency: string } | null> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    if (!response?.ok) {
      console.error("Failed to fetch URL:", response?.status);
      return null;
    }

    const html = await response.text();

    const pricePatterns = [
      /\$([0-9,]+\.?[0-9]{0,2})/,
      /€([0-9,]+\.?[0-9]{0,2})/,
      /£([0-9,]+\.?[0-9]{0,2})/,
      /([0-9,]+\.?[0-9]{0,2})\s*BRL/i,
      /price[:\s]+([0-9,]+\.?[0-9]{0,2})/i,
      /"price"\s*:\s*"?([0-9,]+\.?[0-9]{0,2})/i,
    ];

    let price: number | null = null;
    let currency = "BRL";

    for (const pattern of pricePatterns ?? []) {
      const match = html?.match?.(pattern);
      if (match?.[1]) {
        const priceStr = match[1]?.replace?.(/,/g, "") ?? "";
        price = parseFloat(priceStr);

        if (pattern?.source?.includes("€")) {
          currency = "EUR";
        } else if (pattern?.source?.includes("£")) {
          currency = "GBP";
        } else {
          currency = "BRL";
        }

        if (!isNaN(price ?? NaN) && price && price > 0) {
          break;
        }
      }
    }

    if (price && price > 0) {
      return { price, currency };
    }

    return null;
  } catch (error) {
    console.error("Error scraping price:", error);
    return null;
  }
}
