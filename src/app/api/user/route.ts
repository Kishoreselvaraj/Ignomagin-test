import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id"); // Fetch by database ID
  const userId = searchParams.get("userId"); // Fetch by custom userId
  const username = searchParams.get("username"); // Fetch by username

  try {
    let user;
    if (id) {
      // Fetch user by database ID
      user = await prisma.user.findUnique({ where: { id } });
    } else if (userId) {
      // Fetch user by custom userId (for login)
      user = await prisma.user.findUnique({ where: { userId } });
    } else if (username) {
      // Fetch user by username (for login)
      user = await prisma.user.findUnique({ where: { username } });
    } else {
      // Fetch all users if no parameters are provided
      const users = await prisma.user.findMany();
      return NextResponse.json(users);
    }

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "Error fetching user(s)" }, { status: 500 });
  }
} 
export async function POST(req: Request) {
  try {
    const { username, userId, password, role } = await req.json();
    const user = await prisma.user.create({
      data: { username, userId, password, role },
    });
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Error creating user" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "User ID required" }, { status: 400 });

  try {
    const { username, userId, password, role } = await req.json();
    const user = await prisma.user.update({
      where: { id },
      data: { username, userId, password, role },
    });
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "Error updating user" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id"); // Get user ID from query params
  
    if (!id) return NextResponse.json({ error: "User ID required" }, { status: 400 });
  
    try {
      await prisma.user.delete({ where: { id } });
      return NextResponse.json({ message: "User deleted successfully" });
    } catch (error) {
      return NextResponse.json({ error: "Error deleting user" }, { status: 500 });
    }
  }

