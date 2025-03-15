import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 🟢 GET - Fetch All Parts or Parts by Product ID
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId"); // Fetch parts by product ID

  try {
    if (productId) {
      const parts = await prisma.part.findMany({ where: { productId } });
      return NextResponse.json(parts);
    }

    const parts = await prisma.part.findMany();
    return NextResponse.json(parts);
  } catch (error) {
    return NextResponse.json({ error: "Error fetching parts" }, { status: 500 });
  }
}

// 🟢 POST - Add a Part to a Product
export async function POST(req: Request) {
  try {
    const { productId, name, motionType, pos1, pos2, value,unite } = await req.json();
    const part = await prisma.part.create({
      data: { productId, name, motionType, pos1, pos2, value,unite },
    });
    return NextResponse.json(part, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Error creating part" }, { status: 500 });
  }
}

// 🟢 DELETE - Remove a Part
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "Part ID required" }, { status: 400 });

  try {
    await prisma.part.delete({ where: { id } });
    return NextResponse.json({ message: "Part deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Error deleting part" }, { status: 500 });
  }
}
