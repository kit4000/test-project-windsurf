import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";

export async function GET() {
  try {
    const industries = await prisma.industry.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({ industries });
  } catch (error) {
    console.error("Error fetching industries:", error);
    return NextResponse.json(
      { error: "Failed to fetch industries" },
      { status: 500 }
    );
  }
}
