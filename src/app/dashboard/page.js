import Image from 'next/image';
import Navigation from '../../components/navigation';

export default function Dashboard() {

    const categoryIcons = {
        'Food': { icon: 'fa-utensils', color: 'bg-red-400' },
        'Work': { icon: 'fa-briefcase', color: 'bg-orange-400' },
        'Food/Dining': { icon: 'fa-hamburger', color: 'bg-green-400' },
        'Venmo': { icon: 'fa-link', color: 'bg-blue-400' }
    };

    const transactions = [
        { name: 'Chipotle', category: 'Food', amount: '$54.00' },
        { name: 'Parking Lot Z', category: 'Work', amount: '$54.00' },
        { name: 'Dunkin’', category: 'Food/Dining', amount: '$12.00' },
        { name: 'Chipotle', category: 'Food/Dining', amount: '$54.00' },
        { name: 'Chipotle', category: 'Food/Dining', amount: '$54.00' },
        { name: 'VENMO', category: 'Venmo', amount: '$54.00' },
    ];

    return (
        <>
            <Navigation />

            <div className="max-w-7xl mx-auto">
                <div className="bg-neutral-100 w-full py-10 rounded-md mt-10 px-4 flex">
                    <div>
                        <h1 className="text-4xl text-neutral-600 font-bold ml-2 mt-4">
                            Welcome back, Pranav.
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
                            <button className='bg-gradient-to-br from-blue-200 hover:opacity-90 to-blue-300 px-10 py-2 rounded-md mt-4'>Connect your bank account</button>
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

                <br></br>    <br></br>    <br></br>    <br></br>    <br></br>
            </div>
        </>
    );
}