'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import CapturePhoto from '@/components/CapturePhoto';

export default function UploadPage() {
  const [uploadMethod, setUploadMethod] = useState(null);
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">Upload Receipt</h1>
      
      {!uploadMethod && (
        <div className="space-y-4">
          <button
            onClick={() => setUploadMethod('file')}
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Upload from Device
          </button>
          <button
            onClick={() => setUploadMethod('camera')}
            className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Take Photo
          </button>
        </div>
      )}

      {uploadMethod === 'file' && (
        <FileUpload id={id} />
      )}

      {uploadMethod === 'camera' && (
        <CapturePhoto />
      )}
    </div>
  );
}

function FileUpload({ id }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setUploadStatus('Please select a file');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('receipt', file);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/upload/${id}`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setUploadStatus('File uploaded successfully');
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
    <form onSubmit={handleSubmit} className="w-full max-w-xs">
      <input
        type="file"
        onChange={handleFileChange}
        className="mb-4 w-full"
        accept="image/*"
      />
      <button
        type="submit"
        disabled={uploading}
        className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
      {uploadStatus && <p className="mt-4 text-center">{uploadStatus}</p>}
    </form>
  );
}
