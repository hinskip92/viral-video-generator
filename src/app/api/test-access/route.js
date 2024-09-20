import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const BASE_PATH = 'D:/WK Season 4 Masters/Test/For Review'; // Adjust this to your actual base path

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const filePath = searchParams.get('path');

  if (!filePath) {
    return NextResponse.json({ error: 'Path parameter is required' }, { status: 400 });
  }

  const fullPath = path.join(BASE_PATH, filePath);

  try {
    const stats = fs.statSync(fullPath);
    return NextResponse.json({
      exists: true,
      isFile: stats.isFile(),
      size: stats.size,
      path: fullPath
    });
  } catch (error) {
    return NextResponse.json({
      exists: false,
      error: error.message,
      path: fullPath
    });
  }
}