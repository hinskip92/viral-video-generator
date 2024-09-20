import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const BASE_PATH = 'D:/WK Season 4 Masters/Test/For Review'; // Adjust this to your actual base path

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Range',
};

export async function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders });
}

export async function GET(request, { params }) {
  try {
    const filePath = path.join(BASE_PATH, ...params.path);
    console.log('Attempting to stream video:', filePath);

    if (!fs.existsSync(filePath)) {
      console.log('File not found:', filePath);
      return NextResponse.json({ error: 'File not found' }, { status: 404, headers: corsHeaders });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = request.headers.get('range');

    console.log('File exists. Size:', fileSize, 'Range:', range);

    const mimeType = filePath.endsWith('.mp4') ? 'video/mp4' : 'video/quicktime'; // Set correct MIME type

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(filePath, {start, end});
      const head = {
        ...corsHeaders,
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': mimeType, // Ensure the correct MIME type
      };
      console.log('Streaming with range. Headers:', head);
      return new NextResponse(file, { status: 206, headers: head });
    } else {
      const head = {
        ...corsHeaders,
        'Content-Length': fileSize,
        'Content-Type': mimeType, // Ensure the correct MIME type
      };
      console.log('Streaming without range. Headers:', head);
      const file = fs.createReadStream(filePath);
      return new NextResponse(file, { headers: head });
    }
  } catch (error) {
    console.error('Error streaming video:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500, headers: corsHeaders });
  }
}