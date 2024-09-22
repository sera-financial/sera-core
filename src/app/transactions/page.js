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
  const [loading, setLoading] = useState(false );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

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
        console.log('Fetched transactions:', data);

        const descriptions = data.map(transaction => transaction.description);
        console.log('Transaction descriptions:', descriptions);

        const classificationResponse = await fetch('http://localhost:3001/api/ai/merchant-classification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ messages: descriptions }),
        });

        if (!classificationResponse.ok) {
          throw new Error('Classification response was not ok');
        }

        const classificationData = await classificationResponse.json();
        console.log('Classification data:', classificationData);

        const categories = JSON.parse(classificationData.choices[0].message.content);
        console.log('Parsed categories:', categories);

        const vendorCategoryMap = {};
        categories.forEach(category => {
          category.vendors.forEach(vendor => {
            vendorCategoryMap[vendor] = category.category;
          });
        });
        console.log('Vendor-Category Map:', vendorCategoryMap);

        const classifiedTransactions = data.map(transaction => ({
          ...transaction,
          category: vendorCategoryMap[transaction.description] || 'Unknown',
        }));

        console.log('Classified transactions:', classifiedTransactions);

        setTransactions(classifiedTransactions);
        setLoading(false);
      } catch (error) {
        console.log('Error fetching transactions:', error);
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
    const uploadUrl = `http://100.94.213.94:3000/upload/${uniqueId}`;
    console.log('QR Code URL:', uploadUrl); // Add this line
    
    // Generate QR code with the full URL
    const qr = await QRCode.toDataURL(uploadUrl);
    setQrCodeData(qr);
    openModal();
    
    // const uploadListener = setInterval(() => {
    //   checkForUpload(uniqueId);
    // }, 5000); // Check every 5 seconds

    // Clear the listener after 5 minutes to prevent indefinite checking
    setTimeout(() => {
      clearInterval(uploadListener);
      console.log('QR code expired');
    }, 5 * 60 * 1000);
  }

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
                <p className="text-xl ml-4">Classifying transactions...</p>
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

          <div className="mt-6">
            <button
              onClick={setupHandoff}
              className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded flex items-center"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Upload a Receipt
            </button>
          </div>
        </div>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="modal-overlay absolute inset-0 bg-black opacity-50"></div>
          <div className="modal-container bg-white md:max-w-md mx-auto rounded shadow-lg z-50 overflow-y-auto">
            <div className="modal-content py-4 text-center mx-auto px-6 ">
              <div className="flex justify-end">
                <button onClick={closeModal} className="modal-close">
                  <svg className="fill-current text-black" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18">
                    <path d="M14.53 4.53l-1.06-1.06L9 7.94 4.53 3.47 3.47 4.53 7.94 9l-4.47 4.47 1.06 1.06L9 10.06l4.47 4.47 1.06-1.06L10.06 9z"></path>
                  </svg>
                </button>
              </div>
              {qrCodeData && (
                <div className="mt-4 mx-auto text-center">
                  <p>Scan your receipt to upload</p>
                  <img src={qrCodeData} alt="QR Code" className="mx-auto w-full border-2 border-gray-300 rounded-md" />
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
        </div>
      )}
    </div>
  );
}