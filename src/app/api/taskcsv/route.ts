// pages/api/taskcsv/route.ts
import fs from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

const csvFilePath = path.join(process.cwd(), 'data', 'hardware_settings.csv');

// Ensure the directory exists
if (!fs.existsSync(path.dirname(csvFilePath))) {
  fs.mkdirSync(path.dirname(csvFilePath), { recursive: true });
}

// Ensure the file exists
if (!fs.existsSync(csvFilePath)) {
  fs.writeFileSync(csvFilePath, 'joint,xyz\n');
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const { action, task } = await req.json();

    let csvContent = `joint,${task.part}\n`;
    csvContent += `start_pos,${task.pos1}\n`;
    csvContent += `end_pos,${task.pos2}\n`;
    csvContent += `status,${action}\n`;
    csvContent += `C2Complete,${task.totalCycle}\n`;
    csvContent += `CC_complete,${task.currentCycle}\n`;

    await fs.promises.writeFile(csvFilePath, csvContent);
    return new NextResponse(JSON.stringify({ message: 'CSV file updated successfully' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error updating CSV file:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to update CSV file' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}