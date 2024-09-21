'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/navigation';
import { ArrowUpIcon, ArrowDownIcon, PlusIcon } from '@heroicons/react/24/solid';
import QRCode from 'qrcode';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState('/transactions');
  const [qrCodeData, setQrCodeData] = useState('');
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [ocrResult, setOcrResult] = useState(null);

  useEffect(() => {
    const fetchAccountId = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/users/account', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        return data.user.accountId[0]; // Adjust this based on your API response structure
      } catch (error) {
        console.error('Error fetching account ID:', error);
        return null;
      }
    };

    const fetchTransactions = async (accountId) => {
      try {
        const response = await fetch(`http://api.nessieisreal.com/accounts/${accountId}/purchases?key=575fbd2b0728ae7c870640023404c388`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        setTransactions(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };

    const initialize = async () => {
      const accountId = await fetchAccountId();
      if (accountId) {
        fetchTransactions(accountId);
      }
    };

    initialize();
  }, []);

  const handleSeraAIClick = () => {
    console.log('SeraAI clicked');
  };

  function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  async function generateQRCode() {
    const uniqueId = Math.random().toString(36).substring(2, 15);
    return uniqueId;
  }

  function checkForUpload(uniqueId) {
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/check-upload/${uniqueId}`;
    console.log('Checking upload at URL:', url);

    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error('Upload not found');
        }
        return response.json();
      })
      .then(data => {
        if (data.imageUrl) {
          setUploadedImageUrl(data.imageUrl);
          setOcrResult(data.ocrResult);
        }
      })
      .catch(error => console.error('Error checking upload:', error));
  }

  async function setupHandoff() {
    const uniqueId = await generateQRCode();
    
    // Create the full URL for the upload page
    const uploadUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/upload/${uniqueId}`;
    console.log('QR Code URL:', uploadUrl); // Add this line
    
    // Generate QR code with the full URL
    const qr = await QRCode.toDataURL(uploadUrl);
    setQrCodeData(qr);
    
    const uploadListener = setInterval(() => {
      checkForUpload(uniqueId);
    }, 5000); // Check every 5 seconds

    // Clear the listener after 5 minutes to prevent indefinite checking
    setTimeout(() => {
      clearInterval(uploadListener);
      console.log('QR code expired');
    }, 5 * 60 * 1000);
  }

  // Call this function when you want to start the handoff process
  // setupHandoff();

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation onSeraAIClick={handleSeraAIClick} currentPage={currentPage} />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Transactions</h1>
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            {loading ? (
              <div className="flex items-center justify-center min-h-screen">
                <div className="spinner-border animate-spin inline-block w-20 h-20 border-4 border-t-blue-500 border-b-blue-500 border-r-transparent border-l-transparent rounded-full" role="status"></div>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {transaction.type === 'expense' ? (
                          <ArrowDownIcon className="h-5 w-5 text-red-500" />
                        ) : (
                          <ArrowUpIcon className="h-5 w-5 text-green-500" />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{transaction.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'}`}>
                          ${transaction.amount.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.purchase_date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* QR Code Section (moved below the table) */}
          <div className="mt-6">
            <button
              onClick={setupHandoff}
              className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded flex items-center"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Upload a Receipt
            </button>
            {qrCodeData && (
              <div className="mt-4">
                <img src={qrCodeData} alt="QR Code" />
              </div>
            )}
            {uploadedImageUrl && (
              <div className="mt-4">
                <h2 className="text-xl font-bold">Uploaded Receipt:</h2>
                <img src={uploadedImageUrl} alt="Uploaded Receipt" className="mt-2 max-w-md" />
              </div>
            )}
            {ocrResult && (
              <div className="mt-4">
                <h2 className="text-xl font-bold">OCR Result:</h2>
                <pre className="mt-2 bg-gray-100 p-4 rounded overflow-auto">
                  {JSON.stringify(ocrResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}