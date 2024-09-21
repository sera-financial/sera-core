'use client'
import { useState, useEffect } from 'react';
import Navigation from '../../components/navigation';

export default function Dashboard() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [accountDetails, setAccountDetails] = useState(null);
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
        const accountNumber = Math.floor(Math.random() * 1000000000000000000000000000000000000000000000000000000000000000);


        const response = await fetch(`http://api.nessieisreal.com/customers/${customerData.objectCreated._id}/accounts?key=575fbd2b0728ae7c870640023404c388`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "type": "Checking",
                    "nickname": `id account ${id}`,
                    "rewards": 0,
                    "balance": Math.floor(Math.random() * 1000000)
            }),
        });

        const data = await response.json();

        document.getElementById('account_id').value = data.objectCreated._id;



    }



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

    const handleConnect = async () => {
        let accountId = document.getElementById('account_id').value;

        const response = await fetch(`http://localhost:3001/api/users/account/${accountId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const data = await response.json();
        console.log(data);
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
                                <h1 className="text-white font-bold text-lg ml-auto">Plan for retirement</h1>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 gap-y-20 mt-10">
                    <div className="col-span-2">
                        <h1>RECENT TRANSACTIONS</h1>
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b">
                                    <th className="py-2 font-normal text-sm uppercase text-gray-500">Name</th>
                                    <th className="py-2 font-normal text-sm uppercase text-gray-500">Category</th>
                                    <th className="py-2 font-normal text-sm uppercase text-gray-500">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((transaction, index) => (
                                    <tr key={index} className="border-b">
                                        <td className="py-2 uppercase">{transaction.name}</td>
                                        <td className="py-2">
                                            {transaction.category && (
                                                <div className={`text-white  w-fit px-2 py-1 rounded flex items-center ${categoryIcons[transaction.category].color}`}>
                                                    <i className={`fa ${categoryIcons[transaction.category].icon} mr-2`}></i>
                                                    {transaction.category}
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-2">{transaction.amount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="col-span-1">
                        <h1>ENDING BALANCES</h1>
                        <div className='text-center bg-neutral-100 px-4 py-10 mt-2'>
                            <i className="fa-solid fa-bank fa-2xl text-neutral-400"></i>
                            <p className='mt-4'>Hmm, looks like you haven't connected an account to Sera.</p>
                            <button
                                className='bg-gradient-to-br from-blue-200 hover:opacity-90 to-blue-300 px-10 py-2 rounded-md mt-4'
                                onClick={() => setIsModalOpen(true)}
                            >
                                Connect your bank account
                            </button>
                        </div>
                    </div>

                    <div className="col-span-4">
                        <h1>YOUR BUDGETS</h1>
                        <div className="grid grid-cols-3 gap-4">
                            {/* Add your budget items here */}

                            <div className='bg-neutral-100 px-4 py-10 rounded-md border-l-4 border-blue-400 mt-4'>
                                <h1 className='text-xl font-bold'>Groceries</h1>
                                <p className='text-lg text-neutral-400'>You've spent $120.00 this month</p>
                            </div>

                            <div className='bg-neutral-100 px-4 py-10 rounded-md border-l-4 border-red-400 mt-4'>
                                <h1 className='text-xl font-bold'>Entertainment</h1>
                                <p className='text-lg text-neutral-400'>You've spent $10.00 this month</p>
                            </div>

                            <div className='bg-neutral-100 px-4 py-10 rounded-md border-l-4 border-green-400 mt-4'>
                                <h1 className='text-xl font-bold'>Restaurants</h1>
                                <p className='text-lg text-neutral-400'>You've spent $100.00 this month</p>
                            </div>

                            <div className='bg-neutral-100 px-4 py-10 rounded-md border-l-4 border-orange-400 mt-4'>
                                <h1 className='text-xl font-bold'>Test</h1>
                                <p className='text-lg text-neutral-400'>You've spent $100.00 this month</p>
                            </div>

                        </div>
                    </div>
                </div>

                {isModalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white max-w-4xl w-full px-6 py-10 rounded-md shadow-md">
                            <h2 className="text-xl font-bold mb-4">Connect Your Bank Account</h2>
                            <div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">Bank Name</label>
                                    <select
                                        className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring focus:ring-blue-200"
                                        required
                                    >
                                        <option value="bank1">Capital One (Staging)</option>

                                    </select>
                                </div>
                                <div className="mb-4" >
                                    <label className="block text-sm font-medium text-gray-700">Account ID                                    <button onClick={generate} className="text-xs bg-blue-400 text-white px-2 hover:bg-blue-500 rounded-lg">Generate?</button></label>

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