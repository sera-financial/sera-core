'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import CapturePhoto from '@/components/CapturePhoto';
import axios from 'axios';
import { useRouter } from 'next/router';
const API_KEY = 'XfmvRCZToSgHhxtQlYdP'; // Use your actual API key

export default function UploadPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const accountId = searchParams.get('accountId');

  const [uploadMethod, setUploadMethod] = useState(null);

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
        <FileUpload id={id} accountId={accountId} />
      )}

      {uploadMethod === 'camera' && (
        <CapturePhoto />
      )}
    </div>
  );
}

function FileUpload({ id, accountId }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [ocrResult, setOcrResult] = useState(null);

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

    try {
      console.log('Account ID:', accountId);
      const ocrData = await runOCR(file);
      setOcrResult(ocrData.extractedText);
      setUploadStatus('OCR completed successfully');
      console.log('OCR Data:', ocrData);

      // Extract vendor and amount from OCR result
      const ocrContent = JSON.parse(ocrData.extractedText.choices[0].message.content);
      const vendor = ocrContent.vendor;
      const amount = ocrContent.amount;

      console.log('Vendor:', vendor, 'Amount:', amount);

      // Add transaction to Capital One API
      const transactionResponse = await fetch(
        `http://api.nessieisreal.com/accounts/${accountId}/purchases?key=575fbd2b0728ae7c870640023404c388`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            merchant_id: "57cf75cea73e494d8675ec49", // Example merchant ID
            medium: "balance",
            purchase_date: new Date().toISOString().split('T')[0],
            amount: amount, // Amount from OCR
            description: `Purchase at ${vendor}` // Vendor from OCR
          }),
        }
      );

      const transactionData = await transactionResponse.json();
      console.log('Transaction Data:', transactionData);

    } catch (error) {
      console.error('OCR error:', error);
      setUploadStatus('OCR failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  async function runOCR(file) {
    try {
      // Read the image file as a base64 string
      const reader = new FileReader();
      reader.readAsDataURL(file);

      const base64Image = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = (error) => reject(error);
      });

      // Prepare data for OCR request
      const data = {
        image: {
          type: 'base64',
          value: base64Image
        }
      };

      // Make a request to the OCR endpoint
      const ocrResponse = await axios.post(
        `https://infer.roboflow.com/doctr/ocr?api_key=${API_KEY}`,
        data,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `API-Key ${API_KEY}`
          }
        }
      );

      // Extract text from the response using backend API
      const extractedText = await axios.post('http://100.94.213.94:3001/api/ai/ocr-extraction', { ocrResponse: ocrResponse.data });

      return {
        ocrResponse: ocrResponse.data,
        extractedText: extractedText.data
      };

    } catch (error) {
      console.error('Error during OCR:', error.response ? error.response.data : error.message);
      throw error;
    }
  };



  return (
    <>
      {ocrResult === null && (
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
          {ocrResult && <pre className="mt-4 text-center">{JSON.stringify(ocrResult, null, 2)}</pre>}
        </form>
      )}

      {ocrResult && (
        <p className="text-center mx-auto">
          <i className="fa-solid fa-check-circle text-green-500 text-4xl"></i>
          <br></br>
          <h1 className="text-2xl font-bold">You are all done!</h1>
          <p>
            We have successfully processed your receipt. You can now close this window.
          </p>
        </p>
      )}
    </>
  );
}
