"use client";

import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import { PlusIcon } from "@heroicons/react/24/outline";
import Navigation from "@/components/navigation";
import { useRouter } from "next/navigation";
import dotenv from "dotenv";

dotenv.config();

export default function BudgetsPage() {
	const [currentPage, setCurrentPage] = useState("/transactions");
	const [budgets, setBudgets] = useState([
		{ amount: 0, name: "null", color: "red" },
	]);
	const [accountDetails, setAccountDetails] = useState(null);
	const [loading, setLoading] = useState(true);
  const [newBudget, setNewBudget] = useState({ name: '', limit: '' });
  

	const handleSeraAIClick = () => {
		// Implement SeraAI click functionality
		console.log("SeraAI clicked");
	};

	useEffect(() => {
		const fetchAccountDetails = async () => {
			try {
				const response = await fetch(
					`http://localhost:3001/api/users/account`,
					{
						method: "GET",
						headers: {
							Authorization: `Bearer ${localStorage.getItem("token")}`,
						},
					}
				);

				if (!response.ok) {
					throw new Error("Network response was not ok");
				}

				const data = await response.json();
				setAccountDetails(data.user); // Ensure this matches the backend response structure
				setLoading(false);
				const token = localStorage.getItem("token");
				fetchBudgets(token, data.user._id);
			} catch (error) {
				console.error("Error fetching account details:", error);
			}
		};

		fetchAccountDetails();

		return () => {
			setAccountDetails(null);
		};
	}, []);

	const fetchBudgets = async (token, userId) => {
		try {
			console.log("Fetching budgets for user: " + userId);

			if (!token || !userId) {
				console.error("No token or userId found");
				return;
			}

			console.log("Flag");
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/api/budgets/${userId}`,
				{
					method: "GET",
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
				}
			);

			console.log(`${process.env.NEXT_PUBLIC_API_URL}/api/budgets/${userId}`);

			if (!response.ok) {
				throw new Error("Failed to fetch budgets");
			}

			console.log("Budgets: " + response);
			const data = await response.json();

			// Transform the data to match the expected format
			const formattedBudgets = data.map((budget, index) => ({
				name: budget.name,
				amount: budget.limit,
				color:
					budget.color ||
					`hsl(${Math.floor(index * 137.5) % 360}, 70%, 50%)`, // Generate a vibrant, diverse color palette
			}));

			console.log(formattedBudgets);
			setBudgets(formattedBudgets);
		} catch (error) {
			console.error("Error fetching budgets:", error);
			// Handle error (e.g., show error message to user)
		}
	};

	const handleBudgetChange = (e) => {
    const { name, value } = e.target;
    setNewBudget((prev) => ({ ...prev, [name]: value }));
};

const handleBudgetSubmit = async (e) => {
    e.preventDefault();
    try {
        const response = await fetch('http://localhost:3001/api/budgets/create', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId: accountDetails._id, ...newBudget})
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setBudgets(data);
        setNewBudget({ name: '', limit: '' });
        setIsBudgetModalOpen(false);
    } catch (error) {
        console.error('Error creating budget:', error);
    }
};

	const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);

	const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

	return (
		<div className="min-h-screen bg-gray-100">
			<Navigation onSeraAIClick={handleSeraAIClick} currentPage={currentPage} />

			<main className="py-10">
				<div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
					<div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<h2 className="text-xl font-semibold mb-4">Budget Breakdown</h2>
								<div style={{ width: "100%", height: 300 }}>
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
										<li
											key={index}
											className="flex justify-between items-center"
										>
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
								onClick={() => setIsBudgetModalOpen(true)}
								className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-semi rounded-sm text-white bg-blue-500 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
							>
								<PlusIcon className="-ml-1 mr-2 h-5 w-5" />
								Add New Budget Category
							</button>
						</div>
					</div>
				</div>
			</main>

			{isBudgetModalOpen && (
				<div className="fixed z-10 inset-0 overflow-y-auto">
					<div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
						<div className="fixed inset-0 transition-opacity" aria-hidden="true">
							<div className="absolute inset-0 bg-gray-500 opacity-75"></div>
						</div>
						<span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
						<div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
							<div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
								<h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Add New Budget</h3>
								<form onSubmit={handleBudgetSubmit}>
									<div className="mb-4">
										<label htmlFor="name" className="block text-sm font-medium text-gray-700">Budget Name</label>
										<input
											type="text"
											name="name"
											id="name"
											value={newBudget.name}
											onChange={handleBudgetChange}
											className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
										/>
									</div>
									<div className="mb-4">
										<label htmlFor="limit" className="block text-sm font-medium text-gray-700">Budget Limit</label>
										<input
											type="number"
											name="limit"
											id="limit"
											value={newBudget.limit}
											onChange={handleBudgetChange}
											className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
										/>
									</div>
									<div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
										<button
											type="submit"
											className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
										>
											Add Budget
										</button>
										<button
											type="button"
											onClick={() => setIsBudgetModalOpen(false)}
											className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
										>
											Cancel
										</button>
									</div>
								</form>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
