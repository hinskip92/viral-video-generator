'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Loader2 } from 'lucide-react';
import ReactPlayer from 'react-player';

const ViralVideoGenerator = () => {
  const [inputFolder, setInputFolder] = useState('');
  const [outputFolder, setOutputFolder] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState('');
  const router = useRouter();
  const inputRef = useRef(null);
  const outputRef = useRef(null);

  const handleFolderSelect = (e, setFolder) => {
    const files = e.target.files;
    if (files.length > 0) {
      const folderName = files[0].webkitRelativePath.split('/')[0];
      console.log('Selected folder:', folderName);
      setFolder(folderName);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setError('');

    console.log('Sending request with:', { inputFolder, outputFolder });

    try {
      const response = await fetch('/api/process-videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          inputFolder, 
          outputFolder: outputFolder || undefined
        }),
      });

      const data = await response.json();
      console.log('Received response:', data);

      if (response.ok) {
        alert('Videos processed successfully!');
        console.log('Process output:', data.output);
        await fetchVideos(data.outputFolder);
      } else {
        throw new Error(data.error || 'Failed to process videos');
      }
    } catch (error) {
      setError('Error processing videos: ' + error.message);
      console.error('Detailed error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFetchVideos = () => {
    const folder = outputFolder || `${inputFolder}/Viral_Clips`;
    fetchVideos(folder);
  };

  const fetchVideos = async (folder) => {
    setIsFetching(true);
    setError('');
    try {
      const response = await fetch(`/api/get-videos?folder=${encodeURIComponent(folder)}`);
      if (response.ok) {
        const data = await response.json();
        setVideos(data);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch videos');
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
      setError('Error fetching videos: ' + error.message);
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Viral Video Generator</h1>
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="mb-4">
          <label htmlFor="inputFolder" className="block mb-2">Input Folder:</label>
          <div className="flex items-center">
            <Input
              type="text"
              id="inputFolder"
              value={inputFolder}
              readOnly
              placeholder="Select input folder"
              className="flex-grow mr-2"
            />
            <Button type="button" onClick={() => inputRef.current.click()}>
              Browse
            </Button>
            <input
              ref={inputRef}
              type="file"
              webkitdirectory="true"
              directory="true"
              style={{ display: 'none' }}
              onChange={(e) => handleFolderSelect(e, setInputFolder)}
            />
          </div>
        </div>
        <div className="mb-4">
          <label htmlFor="outputFolder" className="block mb-2">Output Folder (optional):</label>
          <div className="flex items-center">
            <Input
              type="text"
              id="outputFolder"
              value={outputFolder}
              readOnly
              placeholder="Select output folder (optional)"
              className="flex-grow mr-2"
            />
            <Button type="button" onClick={() => outputRef.current.click()}>
              Browse
            </Button>
            <input
              ref={outputRef}
              type="file"
              webkitdirectory="true"
              directory="true"
              style={{ display: 'none' }}
              onChange={(e) => handleFolderSelect(e, setOutputFolder)}
            />
          </div>
        </div>
        <div className="flex space-x-2">
          <Button type="submit" disabled={isProcessing}>
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Process Videos'
            )}
          </Button>
          <Button type="button" onClick={handleFetchVideos} disabled={isFetching}>
            {isFetching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Fetching...
              </>
            ) : (
              'Fetch Generated Videos'
            )}
          </Button>
        </div>
      </form>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <h2 className="text-xl font-semibold mb-4">Generated Viral Videos</h2>
      {videos.length === 0 ? (
        <p>No videos generated yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((video, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader>
                <CardTitle>{video.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <ReactPlayer 
                  url={video.path} 
                  controls 
                  width="100%"
                  height="100%"
                  onError={(e) => {
                    console.error('Video error:', e);
                    let errorMessage = 'Unknown error occurred';
                    if (e.target.error && e.target.error.message) {
                      errorMessage = e.target.error.message;
                    } else if (e.target.error && e.target.error.code) {
                      switch (e.target.error.code) {
                        case 1:
                          errorMessage = "The fetching process for the media resource was aborted by the user agent at the user's request.";
                          break;
                        case 2:
                          errorMessage = "A network error occurred while fetching the media resource.";
                          break;
                        case 3:
                          errorMessage = "An error occurred while decoding the media resource.";
                          break;
                        case 4:
                          errorMessage = "The media resource indicated by the src attribute or assigned media provider object was not suitable.";
                          break;
                      }
                    }
                    console.error(`Error playing video: ${errorMessage}`);
                    alert(`Error playing video: ${errorMessage}`);
                  }}
                />
                <div className="text-sm">
                  <p><strong>Video Path:</strong> {video.path}</p>
                  <p><strong>Entertainment Score:</strong> {video.metadata.entertainment_score}</p>
                  <p><strong>Educational Score:</strong> {video.metadata.educational_score}</p>
                  <p><strong>Clarity Score:</strong> {video.metadata.clarity_score}</p>
                  <p><strong>Shareability Score:</strong> {video.metadata.shareability_score}</p>
                  <p><strong>Length Score:</strong> {video.metadata.length_score}</p>
                  <p><strong>Text Hook:</strong> {video.metadata.text_hook}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViralVideoGenerator;