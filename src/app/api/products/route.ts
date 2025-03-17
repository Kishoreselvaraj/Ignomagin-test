import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

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
    console.error("Error fetching parts:", error);
    return NextResponse.json({ error: "Error fetching product(s)" }, { status: 500 });
  }
}

// 🟢 POST - Create a New Product with Image Upload
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const image = formData.get("image");

    if (!name) {
      return NextResponse.json({ error: "Product name is required" }, { status: 400 });
    }

    let imageUrl = null;

    if (image && image instanceof Blob) {
      // Ensure uploads folder exists
      const uploadDir = path.join(process.cwd(), "public/uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Generate unique filename
      const fileName = `${Date.now()}-${image.name}`;
      const filePath = path.join(uploadDir, fileName);

      // Save file locally
      const buffer = await image.arrayBuffer();
      fs.writeFileSync(filePath, Buffer.from(buffer));

      // Store image URL relative to public folder
      imageUrl = `/uploads/${fileName}`;
    }

    // Create Product in the database
    const product = await prisma.product.create({
      data: { name, imageUrl },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
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
    console.error("Error updating product:", error);
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
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: "Error deleting product" }, { status: 500 });
  }
}
