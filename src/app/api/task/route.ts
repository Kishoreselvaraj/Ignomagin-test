import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

// Handle CORS for OPTIONS requests
export async function OPTIONS() {
  return NextResponse.json({}, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}

// Create (POST) Task
export async function POST(req: NextRequest) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    const contentType = req.headers.get("content-type");

    if (contentType !== "application/json") {
      return NextResponse.json(
        { error: "Invalid content type" },
        { status: 400, headers }
      );
    }

    let body;
    try {
      body = await req.json();
    } catch (jsonError) {
      console.error("Failed to parse JSON:", jsonError);
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400, headers }
      );
    }

    if (!body || Object.keys(body).length === 0) {
      console.error("Empty or null payload received.");
      return NextResponse.json(
        { error: "Empty or invalid payload" },
        { status: 400, headers }
      );
    }

    const {
      cycleCount,
      motionType,
      part,
      pos1,
      pos2,
      posUnit,
      productId,
      restTime,
      runTime,
      speed,
      speedUnit,
      taskName,
      testMethod,
      totalCycleCount,
      totalRunTime
    } = body;
    console.log("Received task:", cycleCount, motionType, part, pos1, pos2, posUnit, productId, restTime, runTime, speed, speedUnit, taskName, testMethod, totalCycleCount, totalRunTime);

    const newTask = await prisma.task.create({
      data: {
        cycleCount: parseInt(body.cycleCount),
        motionType: body.motionType,
        part: body.part,
        pos1: parseFloat(body.pos1),
        pos2: parseFloat(body.pos2),
        posUnit: body.posUnit,
        productId: body.productId,
        restTime: parseFloat(body.restTime),
        runTime: parseFloat(body.runTime),
        speed: parseFloat(body.speed),
        speedUnit: body.speedUnit,
        taskName: body.taskName,
        testMethod: body.testMethod,
        totalCycleCount: parseInt(body.totalCycleCount),
        totalRunTime: parseFloat(body.totalRunTime)
      }
    });

    console.log("Task created:", newTask);
    return NextResponse.json(newTask, { status: 201, headers });

  } catch (error: unknown) {
    console.error("Prisma Error:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "Duplicate record conflict" },
          { status: 409, headers }
        );
      }
      return NextResponse.json(
        { error: `Database error: ${error.code}`, message: error.message },
        { status: 400, headers }
      );
    } else if (error instanceof Prisma.PrismaClientValidationError) {
      return NextResponse.json(
        { error: "Validation error", message: error.message },
        { status: 400, headers }
      );
    } else {
      return NextResponse.json(
        { error: "Internal server error", message: (error as Error).message },
        { status: 500, headers }
      );
    }
  }
}

// Read (GET) Task by ID or All Tasks
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (id) {
      const task = await prisma.task.findUnique({
        where: { id },
      });

      if (!task) {
        return NextResponse.json(
          { error: "Task not found" },
          { status: 404, headers: { "Access-Control-Allow-Origin": "*" } }
        );
      }

      return NextResponse.json(task, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json"
        }
      });
    } else {
      const tasks = await prisma.task.findMany();

      return NextResponse.json(tasks, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json"
        }
      });
    }
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Error fetching tasks" },
      { status: 500, headers: { "Access-Control-Allow-Origin": "*" } }
    );
  }
}

// Update (PUT) Task by ID
export async function PUT(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type");

    if (contentType !== "application/json") {
      return NextResponse.json({ error: "Invalid content type" }, { status: 400 });
    }

    const body = await req.json().catch(() => null);

    if (!body || typeof body !== "object" || Object.keys(body).length === 0) {
      return NextResponse.json({ error: "Empty or invalid payload" }, { status: 400 });
    }

    const { id, ...data } = body;

    if (!id || Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Missing ID or data" }, { status: 400 });
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: data,
    });

    return NextResponse.json(updatedTask, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Error updating task:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    } else {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return NextResponse.json({ error: "Error updating task", message: errorMessage }, { status: 500 });
    }
  }
}

// Delete (DELETE) Task by ID
export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing task ID" },
        { status: 400 }
      );
    }

    await prisma.task.delete({
      where: { id }
    });

    return NextResponse.json(
      { message: "Task deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "Error deleting task" },
      { status: 500 }
    );
  }
}