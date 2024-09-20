import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execPromise = promisify(exec);

// This should be a configuration value, possibly stored in an environment variable
const BASE_PATH = 'D:/WK Season 4 Masters/Test/For Review'; // Adjust this to your actual base path

function getFullPath(folderName) {
  return path.join(BASE_PATH, folderName);
}

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('Received request body:', body);

    let { inputFolder, outputFolder } = body;

    if (!inputFolder) {
      console.log('Missing input folder');
      return NextResponse.json({ error: 'Input folder is required' }, { status: 400 });
    }

    // Map folder names to full paths
    inputFolder = getFullPath(inputFolder);
    outputFolder = outputFolder ? getFullPath(outputFolder) : path.join(inputFolder, 'Viral_Clips');

    console.log('Full input folder path:', inputFolder);
    console.log('Full output folder path:', outputFolder);

    // Check if the input folder exists
    if (!fs.existsSync(inputFolder)) {
      console.log('Input folder does not exist');
      return NextResponse.json({ error: 'Input folder does not exist' }, { status: 400 });
    }

    // Create the output folder if it doesn't exist
    if (!fs.existsSync(outputFolder)) {
      fs.mkdirSync(outputFolder, { recursive: true });
    }

    // Execute the Python script
    const scriptPath = path.join(process.cwd(), 'viral.py');
    const command = `python "${scriptPath}" "${inputFolder}" "${outputFolder}"`;
    
    console.log('Executing command:', command);

    const { stdout, stderr } = await execPromise(command);

    // Log both stdout and stderr for debugging
    console.log('Python script stdout:', stdout);
    console.log('Python script stderr:', stderr);

    // Check if the script execution was successful
    if (stderr && !stderr.includes('INFO')) {
      console.error('Python script error:', stderr);
      return NextResponse.json({ error: 'Error executing Python script', details: stderr }, { status: 500 });
    }

    // If we reach here, the script executed successfully
    return NextResponse.json({ 
      message: 'Videos processed successfully', 
      output: stdout + stderr,
      outputFolder: outputFolder // Return the actual output folder path
    });
  } catch (error) {
    console.error('Error processing videos:', error);
    return NextResponse.json({ error: 'Failed to process videos', details: error.message }, { status: 500 });
  }
}