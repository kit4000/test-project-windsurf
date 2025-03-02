import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";

export async function GET(
  request: Request,
  { params }: { params: { industryId: string } }
) {
  const { industryId } = params;

  try {
    const hearingItems = await prisma.hearingItem.findMany({
      where: {
        industryId,
      },
      orderBy: {
        order: "asc",
      },
    });

    return NextResponse.json({ hearingItems });
  } catch (error) {
    console.error("Error fetching hearing items:", error);
    return NextResponse.json(
      { error: "Failed to fetch hearing items" },
      { status: 500 }
    );
  }
}
