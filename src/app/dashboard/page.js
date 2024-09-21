import Image from 'next/image';
import Navigation from '../../components/navigation';

export default function Dashboard() {

    const transactions = [
        { name: 'Chipotle', category: 'Food', amount: '$54.00' },
        { name: 'Parking Lot Z', category: 'Work', amount: '$54.00' },
        { name: 'Dunkin’', category: 'Food/Dining', amount: '$12.00' },
        { name: 'Chipotle', category: 'Food/Dining', amount: '$54.00' },
        { name: 'Chipotle', category: 'Food/Dining', amount: '$54.00' },
        { name: 'VENMO', category: 'Connect your Venmo account', amount: '$54.00' },
      ];
  return (
   <>

   <Navigation />

   <div className="max-w-7xl mx-auto">


   <div className="bg-neutral-100 w-full py-10  rounded-md mt-10 px-4 flex">
        <h1 className="text-4xl font-bold ml-2">
             Hello, Pranav.
        </h1>
        <div className="ml-auto">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-10 py-10">
            <h1 className="text-white text-sm">
                Manage your budget
            </h1>
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
                  <span className="bg-gray-400 text-white px-2 py-1 rounded">
                    {transaction.category}
                  </span>
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
        </div>

        <div className="col-span-2">
        <h1>YOUR BUDGETS</h1>
        </div>

    
    </div>
    </div>

   </>
  );
}