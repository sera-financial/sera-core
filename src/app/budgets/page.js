'use client';

import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { PlusIcon } from '@heroicons/react/24/outline';
import Navigation from '@/components/navigation';

export default function BudgetsPage() {
  const [currentPage, setCurrentPage] = useState('/transactions');
  const [budgets, setBudgets] = useState([
    { name: 'Housing', amount: 1000, color: '#FF6384' },
    { name: 'Food', amount: 500, color: '#36A2EB' },
    { name: 'Transportation', amount: 300, color: '#FFCE56' },
    { name: 'Entertainment', amount: 200, color: '#4BC0C0' },
    { name: 'Utilities', amount: 150, color: '#9966FF' },
  ]);


  const handleSeraAIClick = () => {
    // Implement SeraAI click functionality
    console.log('SeraAI clicked');
  };

  const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);

  return (
    <div className="min-h-screen bg-gray-100">
            <Navigation onSeraAIClick={handleSeraAIClick} currentPage={currentPage} />

      <main className="py-10">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Budget Breakdown</h2>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={budgets}
                        dataKey="amount"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {budgets.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-4">Budget Details</h2>
                <ul className="space-y-4">
                  {budgets.map((budget, index) => (
                    <li key={index} className="flex justify-between items-center">
                      <span className="text-gray-700">{budget.name}</span>
                      <span className="font-semibold">${budget.amount}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">Total Budget</span>
                    <span className="text-lg font-bold">${totalBudget}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-semi rounded-sm text-white bg-blue-500 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                  Add New Budget Category
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
