'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function CapturePhoto() {
  const [capturedImage, setCapturedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const videoRef = useRef(null);
  const { id } = useParams();

  useEffect(() => {
    startCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Error accessing camera:", err);
      setUploadStatus('Error accessing camera. Please ensure you have given permission.');
    }
  };

  const capturePhoto = () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    setCapturedImage(canvas.toDataURL('image/jpeg'));
  };

  const handleUpload = async () => {
    if (!capturedImage) {
      setUploadStatus('Please capture an image first');
      return;
    }

    setUploading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/upload/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: capturedImage }),
      });

      if (response.ok) {
        setUploadStatus('Image uploaded successfully');
        // Send message to parent window if in iframe
        if (window.opener) {
          window.opener.postMessage({ type: 'UPLOAD_SUCCESS', imageUrl: capturedImage }, '*');
        }
      } else {
        setUploadStatus('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mt-8 w-full max-w-md">
      <h2 className="text-xl font-bold mb-4">Capture Photo</h2>
      <video ref={videoRef} autoPlay playsInline className="mb-4 w-full" />
      <button onClick={capturePhoto} className="mb-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full">
        Capture Photo
      </button>
      {capturedImage && (
        <div className="mt-4">
          <img src={capturedImage} alt="Captured" className="mb-2 w-full" />
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      )}
      {uploadStatus && <p className="mt-4 text-center">{uploadStatus}</p>}
    </div>
  );
}
