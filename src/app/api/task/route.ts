import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Create a new task
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { taskName, pos1, pos2, speed, cycleCount, runTime, motion, part } = body;

    if (!taskName || !motion || !part) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newTask = await prisma.task.create({
      data: { taskName, pos1, pos2, speed, cycleCount, runTime, motion, part },
    });

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error("Prisma Error:", error);
    return NextResponse.json({ error: "Error creating task" }, { status: 500 });
  }
}

// Fetch all tasks
export async function GET(req: NextRequest) {
  try {
    const body = await req.json();
    console.log(body)
    const tasks = await prisma.task.findMany();
    return NextResponse.json(tasks, { status: 200 });
  } catch (error) {
    console.error("Prisma Error:", error);
    return NextResponse.json({ error: "Error fetching tasks" }, { status: 500 });
  }
}

// Delete a task by ID
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
    }

    const deletedTask = await prisma.task.delete({
      where: { id }, // Use id as a string to match database type
    });

    return NextResponse.json({ message: "Task deleted successfully", deletedTask }, { status: 200 });
  } catch (error) {
    console.error("Prisma Error:", error);
    return NextResponse.json({ error: "Error deleting task" }, { status: 500 });
  }
}
