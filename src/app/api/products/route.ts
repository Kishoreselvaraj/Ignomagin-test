import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 🟢 GET - Fetch All Products (with parts) or a Single Product
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id"); // Fetch by product ID

  try {
    if (id) {
      const product = await prisma.product.findUnique({
        where: { id },
        include: { parts: true }, // Include related parts
      });

      if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

      return NextResponse.json(product);
    }

    const products = await prisma.product.findMany({ include: { parts: true } });
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: "Error fetching product(s)" }, { status: 500 });
  }
}

// 🟢 POST - Create a New Product
export async function POST(req: Request) {
  try {
    const { name } = await req.json();
    const product = await prisma.product.create({ data: { name } });
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Error creating product" }, { status: 500 });
  }
}

// 🟢 PUT - Update Product Name
export async function PUT(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "Product ID required" }, { status: 400 });

  try {
    const { name } = await req.json();
    const product = await prisma.product.update({
      where: { id },
      data: { name },
    });
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: "Error updating product" }, { status: 500 });
  }
}

// 🟢 DELETE - Remove a Product
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "Product ID required" }, { status: 400 });

  try {
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Error deleting product" }, { status: 500 });
  }
}
