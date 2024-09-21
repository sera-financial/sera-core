'use client'
import { useState, useEffect } from 'react';
import Navigation from '../../components/navigation';

export default function Dashboard() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [accountId, setAccountId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [accountDetails, setAccountDetails] = useState(null);
    const [balances, setBalances] = useState([]);
    const [budgets, setBudgets] = useState([]);
    const [newBudget, setNewBudget] = useState({ name: '', limit: '' });
    const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
    const categoryIcons = {
        'Food': { icon: 'fa-utensils', color: 'bg-red-400' },
        'Work': { icon: 'fa-briefcase', color: 'bg-orange-400' },
        'Food/Dining': { icon: 'fa-hamburger', color: 'bg-green-400' },
        'Venmo': { icon: 'fa-link', color: 'bg-blue-400' }
    };

    const transactions = [
        { name: 'Chipotle', category: 'Food', amount: '$54.00' },
        { name: 'Parking Lot Z', category: 'Work', amount: '$54.00' },
        { name: 'Dunkin', category: 'Food/Dining', amount: '$12.00' },
        { name: 'Chipotle', category: 'Food/Dining', amount: '$54.00' },
        { name: 'Chipotle', category: 'Food/Dining', amount: '$54.00' },
        { name: 'VENMO', category: 'Venmo', amount: '$54.00' },
    ];

    const generate = async () => {
        console.log('generate');
        // generate random id
        const id = Math.floor(Math.random() * 1000000);
        // first create customer
        const customerResponse = await fetch(`http://api.nessieisreal.com/customers?key=575fbd2b0728ae7c870640023404c388`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "first_name": accountDetails.firstName,
                "last_name": accountDetails.lastName,
                    "address": {
                      "street_number": "1",
                      "street_name": "1",
                      "city": "1",
                      "state": "PA",
                      "zip": "19060"
                    }
            }),
        });


		const customerData = await customerResponse.json();

		console.log(customerData.objectCreated._id);

		//generate a valid account number
		const accountNumber = Math.floor(
			Math.random() *
				1000000000000000000000000000000000000000000000000000000000000000
		);

		const response = await fetch(
			`http://api.nessieisreal.com/customers/${customerData.objectCreated._id}/accounts?key=575fbd2b0728ae7c870640023404c388`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					type: "Checking",
					nickname: `id account ${id}`,
					rewards: 0,
					balance: Math.floor(Math.random() * 1000000),
				}),
			}
		);

		const data = await response.json();

		document.getElementById("account_id").value = data.objectCreated._id;
		setAccountId(data.objectCreated._id);
		console.log(accountId);
	};



    useEffect(() => {
        const fetchAccountDetails = async () => {
            try {
                const response = await fetch(`http://localhost:3001/api/users/account`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();
                console.log(data);
                setAccountDetails(data.user); // Ensure this matches the backend response structure
                console.log(data.user);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching account details:', error);
            }
        };

        fetchAccountDetails();

        return () => {
            setAccountDetails(null);
        };
    }, []);

    useEffect(() => {
        const fetchBalances = async () => {
            try {
                const balancePromises = accountDetails.accountId.map(async (id) => {
                    const response = await fetch(`http://api.nessieisreal.com/accounts/${id}?key=575fbd2b0728ae7c870640023404c388`);
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    const data = await response.json();
                    return { 
                        id, 
                        balance: data.balance,
                        nickname: data.nickname,
                        type: data.type,
                        rewards: data.rewards
                    };
                });

                const balances = await Promise.all(balancePromises);
                setBalances(balances);
            } catch (error) {
                console.error('Error fetching balances:', error);
            }
        };

        if (accountDetails && accountDetails.accountId) {
            fetchBalances();
        }
    }, [accountDetails]);

    // Fetch budgets
    useEffect(() => {
        const fetchBudgets = async () => {
            try {
                const response = await fetch(`http://localhost:3001/api/budgets/${accountDetails._id}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setBudgets(data);
            } catch (error) {
                console.error('Error fetching budgets:', error);
            }
        };

        if (accountDetails) {
            fetchBudgets();
        }
    }, [accountDetails]);

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
                body: JSON.stringify({ userId: accountDetails._id, ...newBudget })
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

    const handleConnect = async () => {
        let accountId = document.getElementById('account_id').value;

        const response = await fetch(`http://localhost:3001/api/users/account/updateId`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                accountId: accountId
            })
        });

        const data = await response.json();
        console.log(data);

        // hide the modal
        setIsModalOpen(false);
        // reload the page
        window.location.reload();
    }

    return (
        <>
            <Navigation />

            {loading ? (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="spinner-border animate-spin inline-block w-20 h-20 border-4 border-t-blue-500 border-b-blue-500 border-r-transparent border-l-transparent rounded-full" role="status">
                    </div>

                

                </div>
            ) : (
            <div className="max-w-7xl mx-auto">
                <div className="bg-neutral-100 w-full py-10 rounded-md mt-10 px-10 flex">
                    <div>
                        <h1 className="text-4xl text-neutral-600 font-bold ml-2 mt-4">
                            Welcome back, {accountDetails.firstName}.
                        </h1>
                        <h1 className="text-2xl font-bold text-neutral-400 ml-2">
                            You have some pending tasks.
                        </h1>
                    </div>
                    <div className="ml-auto">
                        <div className="grid grid-cols-2 gap-x-4">
                            <div className="bg-gradient-to-br cursor-pointer from-pink-200 hover:opacity-90 to-indigo-300 px-10 py-10 rounded-md rounded-sm flex items-end">
                                <h1 className="text-white font-bold text-lg">Manage your budget</h1>
                            </div>

							<div className="cursor-pointer bg-gradient-to-r from-pink-200 hover:opacity-90 to-red-200 px-10 py-10 rounded-sm flex items-end">
								<h1 className="text-white font-bold text-lg ml-auto">
									Plan for retirement
								</h1>
							</div>
						</div>
					</div>
				</div>

				<div className="grid grid-cols-3 gap-4 gap-y-20 mt-10">
					<div className="col-span-2">
						<h1>
							RECENT TRANSACTIONS
							<button
								//onClick={generateFakeTransactions}
								className="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-1 px-2  text-xs rounded-sm mb-4 ml-4"
							>
								Generate?
							</button>
						</h1>
						<table className="w-full text-left">
							<thead>
								<tr className="border-b">
									<th className="py-2 font-normal text-sm uppercase text-gray-500">
										Name
									</th>
									<th className="py-2 font-normal text-sm uppercase text-gray-500">
										Category
									</th>
									<th className="py-2 font-normal text-sm uppercase text-gray-500">
										Amount
									</th>
								</tr>
							</thead>
							<tbody>
								{transactions.map((transaction, index) => (
									<tr key={index} className="border-b">
										<td className="py-2 uppercase">{transaction.name}</td>
										<td className="py-2 uppercase">
											{transaction.status}
											{/* {transaction.category && (
                                                <div className={`text-white  w-fit px-2 py-1 rounded flex items-center ${categoryIcons[transaction.category].color}`}>
                                                    <i className={`fa ${categoryIcons[transaction.category].icon} mr-2`}></i>
                                                    {transaction.category}f
                                                </div>
                                            )} */}
										</td>
										<td className="py-2">{transaction.amount}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					<div className="col-span-1">
						<h1 className='flex'>ENDING BALANCES
                        {balances.length != 0 && (
                                <button 								onClick={() => setIsModalOpen(true)}
                                 className='ml-auto text-sm bg-blue-500 hover:bg-blue-700 text-white  py-1 px-2 rounded-sm'>Add Account</button>
                        )}
                        </h1>
                        {balances.map((account, index) => (
                            <div key={index} className="bg-neutral-100 shadow-md rounded-sm mt-4 p-4 mb-4">
                                <p className="text-md text-neutral-400 truncate">{account.type.toUpperCase()} {account.nickname}</p>
                                <p className="text-xl text-green-500 ">
                                    ${account.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                                <p className="text-sm text-gray-500 hidden">Rewards: {account.rewards}</p>
                            </div>
                        ))}
                        {balances.length === 0 && (
                            <div className="text-center bg-neutral-100 px-4 py-10 mt-2">
							<i className="fa-solid fa-bank fa-2xl text-neutral-400"></i>
							<p className="mt-4">
								Hmm, looks like you haven't connected an account to Sera.
							</p>
							<button
								className="bg-gradient-to-br from-blue-200 hover:opacity-90 to-blue-300 px-10 py-2 rounded-md mt-4"
								onClick={() => setIsModalOpen(true)}
							>
								Connect your bank account
                                </button>
                            </div>
                        )}
					</div>

					<div className="col-span-4">
						<h1 className='flex'>YOUR BUDGETS
                            <button 
                                onClick={() => setIsBudgetModalOpen(true)} 
                                className='ml-auto text-sm bg-blue-500 hover:bg-blue-700 text-white py-1 px-2 rounded-sm'>
                                Create Budget
                            </button>
                        </h1>
                        <div className="grid grid-cols-3 gap-4 gap-y-10">
                            {budgets.map((budget, index) => (
                                <div key={index} className="bg-neutral-100 px-4 py-10 rounded-md border-l-4 border-blue-400 mt-4">
                                    <h1 className="text-xl font-bold">{budget.name}</h1>
                                    <p className="text-lg text-neutral-400">
                                        Limit: ${budget.limit}
                                    </p>
                                    <p className="text-lg text-neutral-400">
                                        Spent: ${budget.spent}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <br></br>             <br></br>             <br></br>             <br></br>
                    </div>

                    {isBudgetModalOpen && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                            <div className="bg-white max-w-4xl w-full px-6 py-10 rounded-md shadow-md">
                                <h2 className="text-xl font-bold mb-4">Create Budget</h2>
                                <form onSubmit={handleBudgetSubmit} className="mb-4">
                                    <input
                                        type="text"
                                        name="name"
                                        value={newBudget.name}
                                        onChange={handleBudgetChange}
                                        placeholder="Budget Name"
                                        className="border p-2 mr-2 w-full"
                                        required
                                    />
                                    <input
                                        type="number"
                                        name="limit"
                                        value={newBudget.limit}
                                        onChange={handleBudgetChange}
                                        placeholder="Budget Limit"
                                        className="border p-2 mr-2 w-full mt-4"
                                        required
                                    />
                                    <div className="flex justify-end mt-10">
                                        <button
                                            type="button"
                                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                                            onClick={() => setIsBudgetModalOpen(false)}
                                        >
                                            Cancel
                                        </button>
                                        <button type="submit" className="bg-blue-500 text-white p-2 rounded">Add Budget</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
				</div>

				{isModalOpen && (
					<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
						<div className="bg-white max-w-4xl w-full px-6 py-10 rounded-md shadow-md">
							<h2 className="text-xl font-bold mb-4">
								Connect Your Bank Account
							</h2>
							<div>
								<div className="mb-4">
									<label className="block text-sm font-medium text-gray-700">
										Bank Name
									</label>
									<select
										className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring focus:ring-blue-200"
										required
									>
										<option value="bank1">Capital One (Staging)</option>
									</select>
								</div>
								<div className="mb-4">
									<label className="block text-sm font-medium text-gray-700">
										Account ID{" "}
										<button
											onClick={generate}
											className="text-xs bg-blue-400 text-white px-2 hover:bg-blue-500 rounded-xs"
										>
											Generate?
										</button>
									</label>

									<input
										id="account_id"
										type="text"
										className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring focus:ring-blue-200"
										required
									/>
								</div>

                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                                        onClick={() => setIsModalOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        onClick={handleConnect}
                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                    >
                                        Connect
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            )}
        </>
    );
}
