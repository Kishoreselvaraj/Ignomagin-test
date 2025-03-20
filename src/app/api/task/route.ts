import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Create a new task
export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type");

    if (contentType !== "application/json") {
      return NextResponse.json({ error: "Invalid content type" }, { status: 400 });
    }

    const body = await req.json();

    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json({ error: "Empty or invalid payload" }, { status: 400 });
    }

    const { taskName, pos1, pos2, speed, cycleCount, runTime, motionType, part, productId, totalCycleCount, totalRunTime, restTime } = body;

    if (!taskName || !motionType || !part) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newTask = await prisma.task.create({
      data: {
        taskName,
        pos1,
        pos2,
        speed,
        cycleCount,
        runTime,
        motionType,
        part,
        productId,
        totalCycleCount,
        totalRunTime,
        restTime,
      },
    });

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error("Prisma Error:", error);

    const errorMessage = error instanceof Error ? error.message : "Error creating task";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// Fetch all tasks
export async function GET() {
  try {
    const tasks = await prisma.task.findMany();
    return NextResponse.json(tasks, { status: 200 });
  } catch (error) {
    console.error("Prisma Error:", error);
    return NextResponse.json({ error: "Error fetching tasks" }, { status: 500 });
  }
}

// Edit (Update) a task by ID
export async function PATCH(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type");

    if (contentType !== "application/json") {
      return NextResponse.json({ error: "Invalid content type" }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
    }

    const body = await req.json();

    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json({ error: "Empty or invalid payload" }, { status: 400 });
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: body,
    });

    return NextResponse.json({ message: "Task updated successfully", updatedTask }, { status: 200 });
  } catch (error) {
    console.error("Prisma Error:", error);

    const errorMessage = error instanceof Error ? error.message : "Error updating task";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
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
      where: { id },
    });

    return NextResponse.json({ message: "Task deleted successfully", deletedTask }, { status: 200 });
  } catch (error) {
    console.error("Prisma Error:", error);

    const errorMessage = error instanceof Error ? error.message : "Error deleting task";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
