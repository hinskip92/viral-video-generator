import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const BASE_PATH = 'D:/WK Season 4 Masters/Test/For Review'; // Adjust this to your actual base path
const BASE_URL = 'http://localhost:3000/videos'; // Base URL for serving videos

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  let folder = searchParams.get('folder');
  
  if (!folder) {
    return NextResponse.json({ error: 'Folder parameter is required' }, { status: 400 });
  }

  // Resolve the full path
  folder = path.join(BASE_PATH, folder);

  try {
    console.log('Attempting to read folder:', folder);
    if (!fs.existsSync(folder)) {
      console.log('Folder does not exist:', folder);
      return NextResponse.json({ error: 'Folder does not exist' }, { status: 404 });
    }

    const files = fs.readdirSync(folder);
    const metadataPath = path.join(folder, 'viral_clips_metadata.json');
    let allMetadata = [];
    
    if (fs.existsSync(metadataPath)) {
      const rawMetadata = fs.readFileSync(metadataPath, 'utf8');
      allMetadata = JSON.parse(rawMetadata);
      console.log('Metadata loaded:', allMetadata);
    } else {
      console.log('Metadata file not found:', metadataPath);
    }

    const videos = files
      .filter(file => file.endsWith('.mp4') || file.endsWith('.mov'))
      .map((file, index) => {
        const metadata = allMetadata[index] || {}; // Associate metadata by index

        return {
          name: file,
          path: `${BASE_URL}/${encodeURIComponent(folder)}/${encodeURIComponent(file)}`, // Use HTTP URL
          metadata
        };
      });

    console.log('Videos found:', videos);
    return NextResponse.json(videos);
  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json({ error: 'Failed to fetch videos', details: error.message }, { status: 500 });
  }
}