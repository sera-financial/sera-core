'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/navigation';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState('/transactions');

  useEffect(() => {
    // Mock data - replace with actual API call in production
    const mockTransactions = [
      { id: 1, type: 'expense', description: 'Grocery Shopping', amount: 85.50, date: '2023-06-15' },
      { id: 2, type: 'income', description: 'Salary Deposit', amount: 3000.00, date: '2023-06-01' },
      { id: 3, type: 'expense', description: 'Netflix Subscription', amount: 14.99, date: '2023-06-10' },
      { id: 4, type: 'expense', description: 'Gas Station', amount: 45.00, date: '2023-06-08' },
      { id: 5, type: 'income', description: 'Freelance Payment', amount: 500.00, date: '2023-06-20' },
    ];
    setTransactions(mockTransactions);
  }, []);

  const handleSeraAIClick = () => {
    // Implement SeraAI click functionality
    console.log('SeraAI clicked');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation onSeraAIClick={handleSeraAIClick} currentPage={currentPage} />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Transactions</h1>
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
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
                  <tr key={transaction.id}>
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
                      {transaction.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
