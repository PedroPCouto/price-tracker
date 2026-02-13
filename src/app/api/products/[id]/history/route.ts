import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
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

    const history = await prisma.priceHistory.findMany({
      where: { productId: id },
      orderBy: { checkedAt: "asc" },
    });

    const formattedHistory =
      history?.map((entry: any) => ({
        id: entry?.id ?? "",
        price: entry?.price ?? 0,
        currency: entry?.currency ?? "BRL",
        checkedAt: entry?.checkedAt?.toISOString() ?? "",
      })) ?? [];

    return NextResponse.json(formattedHistory);
  } catch (error) {
    console.error("Error fetching price history:", error);
    return NextResponse.json(
      { error: "Failed to fetch price history" },
      { status: 500 },
    );
  }
}
