

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
    const [isRetirementModalOpen, setIsRetirementModalOpen] = useState(false);
    const [syncedTransactions, setSyncedTransactions] = useState(null);
    const categoryIcons = {
        'Food': { icon: 'fa-utensils', color: 'bg-red-400' },
        'Work': { icon: 'fa-briefcase', color: 'bg-orange-400' },
        'Food/Dining': { icon: 'fa-hamburger', color: 'bg-green-400' },
        'Venmo': { icon: 'fa-link', color: 'bg-blue-400' }
    };

    // const transactions = [
    //     { name: 'Chipotle', category: 'Food', amount: '$54.00' },
    //     { name: 'Parking Lot Z', category: 'Work', amount: '$54.00' },
    //     { name: 'Dunkin', category: 'Food/Dining', amount: '$12.00' },
    //     { name: 'Chipotle', category: 'Food/Dining', amount: '$54.00' },
    //     { name: 'Chipotle', category: 'Food/Dining', amount: '$54.00' },
    //     { name: 'VENMO', category: 'Venmo', amount: '$54.00' },
    // ];

    const [transactions, setTransactions] = useState([]);
    const [bills, setBills] = useState([]);
    const [showAllTransactions, setShowAllTransactions] = useState(false);
    const [showAllBills, setShowAllBills] = useState(false);
    const [progress, setProgress] = useState(0);

   


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

                const transactionsResponse = await fetch(`http://api.nessieisreal.com/accounts/${data.user.accountId[0]}/purchases?key=575fbd2b0728ae7c870640023404c388`, {
                    method: 'GET',
                    headers: {
                        "Content-Type": "application/json",
                    }
                });

                if (!transactionsResponse.ok) {
                    throw new Error('Network response was not ok');
                }

                const transactionsData = await transactionsResponse.json();
                console.log('Fetched transactions:', transactionsData);

                const classifiedTransactions = await Promise.all(transactionsData.map(async (transaction) => {
                  try {
                    console.log('Classifying transaction:', transaction); // Add this line to log the transaction being classified
                    const classificationResponse = await fetch('http://localhost:3001/api/ai/read', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({ message: transaction.description, budgets }),
                    });
        
                    if (!classificationResponse.ok) {
                      throw new Error('Classification response was not ok');
                    }
        
                    const classificationData = await classificationResponse.json();
                
                    transaction.category = classificationData.category; // Adjust based on your API response structure
                    console.log('Classified transaction:', classificationData.category); // Add this line to log classified transactions
                  } catch (error) {
                    console.error('Error classifying transaction:', error);
                    transaction.category = 'Unknown'; // Default category if classification fails
                  }
        
                  return transaction;
                }));

                console.log('Classified transactions:', classifiedTransactions);

                // store transactions in state
                setTransactions(classifiedTransactions);
               // setSyncedTransactions(classifiedTransactions); // Add this line to set synced transactions
                console.log('Transactions state updated:', classifiedTransactions);

                console.log(data.user);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching account details:', error);
                setLoading(false);
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

                // Calculate the total amount spent for each budget category
                const updatedBudgets = data.map(budget => {
                    const totalSpent = transactions
                        .filter(transaction => transaction.category === budget.name)
                        .reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0);
                    return { ...budget, amount_spent: transaction.amount };
                });

                setBudgets(updatedBudgets);
            } catch (error) {
                console.error('Error fetching budgets:', error);
            }
        };

        if (accountDetails) {
            fetchBudgets();
        }
    }, [accountDetails, transactions]);

    const generateFakeTransactions = async () => {
        try {
            let merchants = [
                {
                  "name": "Panera Bread",
                  "category": "Fast Food",
                  "address": {
                    "street_number": "1200",
                    "street_name": "Liberty Ave",
                    "city": "Pittsburgh",
                    "state": "PA",
                    "zip": "15222"
                  },
                  "geocode": {
                    "lat": 40.4406,
                    "lng": -79.9959
                  }
                },
                {
                  "name": "7-Eleven",
                  "category": "Convenience Store",
                  "address": {
                    "street_number": "555",
                    "street_name": "Mission St",
                    "city": "San Francisco",
                    "state": "CA",
                    "zip": "94105"
                  },
                  "geocode": {
                    "lat": 37.7749,
                    "lng": -122.4194
                  }
                },
                {
                  "name": "Lowe's",
                  "category": "Home Improvement",
                  "address": {
                    "street_number": "3000",
                    "street_name": "South Blvd",
                    "city": "Charlotte",
                    "state": "NC",
                    "zip": "28203"
                  },
                  "geocode": {
                    "lat": 35.2271,
                    "lng": -80.8431
                  }
                },
                {
                  "name": "Apple Store",
                  "category": "Electronics",
                  "address": {
                    "street_number": "7000",
                    "street_name": "Fifth Ave",
                    "city": "New York",
                    "state": "NY",
                    "zip": "10019"
                  },
                  "geocode": {
                    "lat": 40.7128,
                    "lng": -74.0060
                  }
                },
                {
                  "name": "Costco",
                  "category": "Wholesale",
                  "address": {
                    "street_number": "123",
                    "street_name": "Dundee Rd",
                    "city": "Northbrook",
                    "state": "IL",
                    "zip": "60062"
                  },
                  "geocode": {
                    "lat": 42.1275,
                    "lng": -87.8289
                  }
                },
                {
                  "name": "Taco Bell",
                  "category": "Fast Food",
                  "address": {
                    "street_number": "200",
                    "street_name": "South St",
                    "city": "Houston",
                    "state": "TX",
                    "zip": "77002"
                  },
                  "geocode": {
                    "lat": 29.7604,
                    "lng": -95.3698
                  }
                },
                {
                  "name": "Kroger",
                  "category": "Grocery",
                  "address": {
                    "street_number": "1500",
                    "street_name": "Main St",
                    "city": "Cincinnati",
                    "state": "OH",
                    "zip": "45202"
                  },
                  "geocode": {
                    "lat": 39.1031,
                    "lng": -84.5120
                  }
                },
                {
                  "name": "CVS",
                  "category": "Pharmacy",
                  "address": {
                    "street_number": "333",
                    "street_name": "Lexington Ave",
                    "city": "New York",
                    "state": "NY",
                    "zip": "10016"
                  },
                  "geocode": {
                    "lat": 40.7484,
                    "lng": -73.9857
                  }
                },
                {
                  "name": "Staples",
                  "category": "Office Supplies",
                  "address": {
                    "street_number": "1100",
                    "street_name": "Commonwealth Ave",
                    "city": "Boston",
                    "state": "MA",
                    "zip": "02134"
                  },
                  "geocode": {
                    "lat": 42.3601,
                    "lng": -71.0589
                  }
                },
                {
                  "name": "Dollar Tree",
                  "category": "Retail",
                  "address": {
                    "street_number": "1200",
                    "street_name": "Oakland Blvd",
                    "city": "Fort Worth",
                    "state": "TX",
                    "zip": "76103"
                  },
                  "geocode": {
                    "lat": 32.7555,
                    "lng": -97.3308
                  }
                },
                {
                  "name": "Subway",
                  "category": "Fast Food",
                  "address": {
                    "street_number": "500",
                    "street_name": "Mission Blvd",
                    "city": "Fremont",
                    "state": "CA",
                    "zip": "94536"
                  },
                  "geocode": {
                    "lat": 37.5483,
                    "lng": -121.9886
                  }
                },
                {
                  "name": "PetSmart",
                  "category": "Pet Store",
                  "address": {
                    "street_number": "800",
                    "street_name": "Cherry St",
                    "city": "Kansas City",
                    "state": "MO",
                    "zip": "64106"
                  },
                  "geocode": {
                    "lat": 39.0997,
                    "lng": -94.5786
                  }
                },
                {
                  "name": "Nike Store",
                  "category": "Sporting Goods",
                  "address": {
                    "street_number": "1000",
                    "street_name": "Magnolia St",
                    "city": "Orlando",
                    "state": "FL",
                    "zip": "32801"
                  },
                  "geocode": {
                    "lat": 28.5383,
                    "lng": -81.3792
                  }
                },
                {
                  "name": "Pizza Hut",
                  "category": "Fast Food",
                  "address": {
                    "street_number": "1300",
                    "street_name": "Elm St",
                    "city": "Dallas",
                    "state": "TX",
                    "zip": "75201"
                  },
                  "geocode": {
                    "lat": 32.7767,
                    "lng": -96.7970
                  }
                },
                {
                  "name": "Walgreens",
                  "category": "Pharmacy",
                  "address": {
                    "street_number": "777",
                    "street_name": "Broadway",
                    "city": "Nashville",
                    "state": "TN",
                    "zip": "37203"
                  },
                  "geocode": {
                    "lat": 36.1627,
                    "lng": -86.7816
                  }
                },
                {
                  "name": "IKEA",
                  "category": "Furniture",
                  "address": {
                    "street_number": "1",
                    "street_name": "Bluewater Blvd",
                    "city": "Hyattsville",
                    "state": "MD",
                    "zip": "20785"
                  },
                  "geocode": {
                    "lat": 38.9423,
                    "lng": -76.9125
                  }
                },
                {
                  "name": "Trader Joe's",
                  "category": "Grocery",
                  "address": {
                    "street_number": "2300",
                    "street_name": "Vine St",
                    "city": "Hollywood",
                    "state": "CA",
                    "zip": "90068"
                  },
                  "geocode": {
                    "lat": 34.0928,
                    "lng": -118.3287
                  }
                },
                {
                  "name": "Chick-fil-A",
                  "category": "Fast Food",
                  "address": {
                    "street_number": "600",
                    "street_name": "Oak St",
                    "city": "Little Rock",
                    "state": "AR",
                    "zip": "72202"
                  },
                  "geocode": {
                    "lat": 34.7465,
                    "lng": -92.2896
                  }
                },
                {
                  "name": "Dick's Sporting Goods",
                  "category": "Sporting Goods",
                  "address": {
                    "street_number": "4500",
                    "street_name": "Park Rd",
                    "city": "Buffalo",
                    "state": "NY",
                    "zip": "14221"
                  },
                  "geocode": {
                    "lat": 42.8864,
                    "lng": -78.8784
                  }
                },
                {
                  "name": "Macy's",
                  "category": "Department Store",
                  "address": {
                    "street_number": "800",
                    "street_name": "State St",
                    "city": "New Haven",
                    "state": "CT",
                    "zip": "06510"
                  },
                  "geocode": {
                    "lat": 41.3083,
                    "lng": -72.9279
                  }
                },
                {
                  "name": "Whole Foods",
                  "category": "Grocery",
                  "address": {
                    "street_number": "3333",
                    "street_name": "Main St",
                    "city": "Austin",
                    "state": "TX",
                    "zip": "78705"
                  },
                  "geocode": {
                    "lat": 30.2672,
                    "lng": -97.7431
                  }
                },
                {
                  "name": "GameStop",
                  "category": "Electronics",
                  "address": {
                    "street_number": "1212",
                    "street_name": "Broadway Ave",
                    "city": "Cleveland",
                    "state": "OH",
                    "zip": "44115"
                  },
                  "geocode": {
                    "lat": 41.4993,
                    "lng": -81.6944
                  }
                },
                {
                  "name": "Barnes & Noble",
                  "category": "Books",
                  "address": {
                    "street_number": "450",
                    "street_name": "Lexington Ave",
                    "city": "New York",
                    "state": "NY",
                    "zip": "10017"
                  },
                  "geocode": {
                    "lat": 40.7527,
                    "lng": -73.9772
                  }
                },
                {
                  "name": "Panda Express",
                  "category": "Fast Food",
                  "address": {
                    "street_number": "2800",
                    "street_name": "Mission St",
                    "city": "San Francisco",
                    "state": "CA",
                    "zip": "94110"
                  },
                  "geocode": {
                    "lat": 37.7749,
                    "lng": -122.4194
                  }
                },
                {
                  "name": "Sephora",
                  "category": "Beauty",
                  "address": {
                    "street_number": "120",
                    "street_name": "Boylston St",
                    "city": "Boston",
                    "state": "MA",
                    "zip": "02116"
                  },
                  "geocode": {
                    "lat": 42.3542,
                    "lng": -71.0691
                  }
                },
                {
                  "name": "Bath & Body Works",
                  "category": "Beauty",
                  "address": {
                    "street_number": "987",
                    "street_name": "Magnolia St",
                    "city": "Anaheim",
                    "state": "CA",
                    "zip": "92801"
                  },
                  "geocode": {
                    "lat": 33.8366,
                    "lng": -117.9143
                  }
                },
                {
                  "name": "The Home Depot",
                  "category": "Home Improvement",
                  "address": {
                    "street_number": "2100",
                    "street_name": "El Camino Real",
                    "city": "Redwood City",
                    "state": "CA",
                    "zip": "94063"
                  },
                  "geocode": {
                    "lat": 37.4848,
                    "lng": -122.2281
                  }
                },
                {
                  "name": "Staples",
                  "category": "Office Supplies",
                  "address": {
                    "street_number": "500",
                    "street_name": "1st St",
                    "city": "San Jose",
                    "state": "CA",
                    "zip": "95112"
                  },
                  "geocode": {
                    "lat": 37.3382,
                    "lng": -121.8863
                  }
                },
                {
                  "name": "Bed Bath & Beyond",
                  "category": "Retail",
                  "address": {
                    "street_number": "222",
                    "street_name": "River Rd",
                    "city": "Edgewater",
                    "state": "NJ",
                    "zip": "07020"
                  },
                  "geocode": {
                    "lat": 40.8271,
                    "lng": -73.9752
                  }
                },
                {
                  "name": "Outback Steakhouse",
                  "category": "Restaurant",
                  "address": {
                    "street_number": "1400",
                    "street_name": "Willowbrook Mall",
                    "city": "Wayne",
                    "state": "NJ",
                    "zip": "07470"
                  },
                  "geocode": {
                    "lat": 40.9170,
                    "lng": -74.2515
                  }
                },
                {
                  "name": "Wendy's",
                  "category": "Fast Food",
                  "address": {
                    "street_number": "690",
                    "street_name": "Main St",
                    "city": "Richmond",
                    "state": "VA",
                    "zip": "23219"
                  },
                  "geocode": {
                    "lat": 37.5407,
                    "lng": -77.4360
                  }
                },
                {
                  "name": "Microsoft Store",
                  "category": "Electronics",
                  "address": {
                    "street_number": "3000",
                    "street_name": "Las Vegas Blvd",
                    "city": "Las Vegas",
                    "state": "NV",
                    "zip": "89109"
                  },
                  "geocode": {
                    "lat": 36.1699,
                    "lng": -115.1398
                  }
                },
                {
                  "name": "CVS",
                  "category": "Pharmacy",
                  "address": {
                    "street_number": "1200",
                    "street_name": "Broadway Ave",
                    "city": "Boulder",
                    "state": "CO",
                    "zip": "80302"
                  },
                  "geocode": {
                    "lat": 40.0150,
                    "lng": -105.2705
                  }
                },
                {
                  "name": "Best Buy",
                  "category": "Electronics",
                  "address": {
                    "street_number": "1600",
                    "street_name": "Galleria Blvd",
                    "city": "Roseville",
                    "state": "CA",
                    "zip": "95678"
                  },
                  "geocode": {
                    "lat": 38.7521,
                    "lng": -121.2880
                  }
                }
              ]
              
              
            const totalMerchants = merchants.length;
            let completedMerchants = 0;

            for (const merchant of merchants) {
                console.log('Generating merchant:', merchant.name);
                const transactionResponse = await fetch('http://api.nessieisreal.com/merchants?key=575fbd2b0728ae7c870640023404c388', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(merchant)
                });
    
                if (!transactionResponse.ok) {
                    throw new Error(`Failed to generate merchant: ${merchant.name}`);
                }
    
                const transactionData = await transactionResponse.json();
                console.log(transactionData);
                merchant._id = transactionData.objectCreated._id;
                console.log('Merchant generated:', merchant.name, 'with ID:', merchant._id);

                completedMerchants++;
                setProgress((completedMerchants / totalMerchants) * 100);
            }
    
            // Create mock transactions
            const accountId = accountDetails.accountId[0]; // Replace with actual account ID
            localStorage.setItem('accountId', accountId);
            for (const merchant of merchants) {
              setVerboseProgress(`${completedMerchants} / ${totalMerchants} merchants generated`);

                const purchase = {
                    merchant_id: merchant._id,
                    medium: "balance",
                    purchase_date: new Date().toISOString().split('T')[0],
                    amount: Math.floor(Math.random() * 100) + 1,
                    status: "pending",
                    description: `Purchase at ${merchant.name}`
                };
    
                const purchaseResponse = await fetch(`http://api.nessieisreal.com/accounts/${accountId}/purchases?key=575fbd2b0728ae7c870640023404c388`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(purchase)
                });
    
                if (!purchaseResponse.ok) {
                    throw new Error(`Failed to create purchase for merchant: ${merchant.name}`);
                }
                
                

                console.log('Purchase created for merchant:', merchant.name);
            }

            window.location.reload();
        } catch (error) {
            console.error('Error generating merchants or purchases:', error);
        }
    };

    const [verboseProgress, setVerboseProgress] = useState('');
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

                // Calculate the total amount spent for each budget category
                const updatedBudgets = data.map(budget => {
                    const totalSpent = transactions
                        .filter(transaction => transaction.category === budget.name)
                        .reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0);
                    return { ...budget, amount_spent: totalSpent };
                });

                setBudgets(updatedBudgets);
            } catch (error) {
                console.error('Error fetching budgets:', error);
            }
        };

        if (accountDetails) {
            fetchBudgets();
        }
    }, [accountDetails, transactions]);

    const handleBudgetChange = (e) => {
        const { name, value } = e.target;
        setNewBudget((prev) => ({ ...prev, [name]: value }));
    };

    const handleBudgetSubmit = async (e) => {
        e.preventDefault();
        try {
            // Calculate the total amount spent for the budget category
            const totalSpent = transactions
                .filter(transaction => transaction.category === newBudget.name)
                .reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0);

            const response = await fetch('http://localhost:3001/api/budgets/create', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId: accountDetails._id, ...newBudget, amount_spent: totalSpent })
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setBudgets(data);
            setNewBudget({ name: '', limit: '', amount_spent: 0 });
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

    const generateMockBills = async () => {
        try {
            const accountId = accountDetails.accountId[0];
            const mockBills = [
                { status: "pending", payee: "Electric Company", payment_date: "2023-05-15", payment_amount: 150 },
                { status: "pending", payee: "Water Utility", payment_date: "2023-05-20", payment_amount: 80 },
                { status: "pending", payee: "Internet Provider", payment_date: "2023-05-25", payment_amount: 70 },
                { status: "pending", payee: "Phone Company", payment_date: "2023-05-28", payment_amount: 60 },
                { status: "pending", payee: "Streaming Service", payment_date: "2023-06-01", payment_amount: 15 },
                { status: "pending", payee: "Gym Membership", payment_date: "2023-06-05", payment_amount: 50 },
                { status: "pending", payee: "Car Insurance", payment_date: "2023-06-10", payment_amount: 100 },
                { status: "pending", payee: "Credit Card", payment_date: "2023-06-15", payment_amount: 200 },
                { status: "pending", payee: "Rent", payment_date: "2023-07-01", payment_amount: 1200 },
                { status: "pending", payee: "Student Loan", payment_date: "2023-07-05", payment_amount: 300 },
                { status: "pending", payee: "Home Insurance", payment_date: "2023-07-10", payment_amount: 120 },
                { status: "pending", payee: "Gas Bill", payment_date: "2023-07-15", payment_amount: 50 },
                { status: "pending", payee: "Trash Service", payment_date: "2023-07-20", payment_amount: 25 },
                { status: "pending", payee: "HOA Fees", payment_date: "2023-08-01", payment_amount: 150 },
                { status: "pending", payee: "Subscription Box", payment_date: "2023-08-05", payment_amount: 35 },
            ];

            for (const bill of mockBills) {
                const response = await fetch(`http://api.nessieisreal.com/accounts/${accountId}/bills?key=575fbd2b0728ae7c870640023404c388`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(bill)
                });

                if (!response.ok) {
                    throw new Error(`Failed to create bill for payee: ${bill.payee}`);
                }
            }

            console.log('Mock bills generated successfully');
            fetchBills();
        } catch (error) {
            console.error('Error generating mock bills:', error);
        }
    };

    const fetchBills = async () => {
        try {
            const accountId = accountDetails.accountId[0];
            const response = await fetch(`http://api.nessieisreal.com/accounts/${accountId}/bills?key=575fbd2b0728ae7c870640023404c388`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch bills');
            }

            const data = await response.json();
            setBills(data);
        } catch (error) {
            console.error('Error fetching bills:', error);
        }
    };

    useEffect(() => {
        if (accountDetails && accountDetails.accountId) {
            fetchBills();
        }
    }, [accountDetails]);

    const displayedTransactions = showAllTransactions ? transactions : transactions.slice(0, 10);
    const displayedBills = showAllBills ? bills : bills.slice(0, 10);

    const syncAccount = async () => {
        const response = await fetch(`http://localhost:3001/api/transactions/sync`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(synce)
        });
        const data = await response.json();
        console.log(data);
        
    }
    

    const getCategoryIcon = (category) => {
        return categoryIcons[category] || { icon: 'fa-question', color: 'bg-gray-400' };
    };

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
                            <div 
                                className="bg-gradient-to-br cursor-pointer from-blue-400 hover:opacity-90 to-blue-300 px-10 py-10 rounded-sm flex items-end"
                                onClick={() => setIsBudgetModalOpen(true)}
                            >
                                <h1 className="text-white font-bold text-lg">Manage your budget</h1>
                            </div>

                            <div 
                                style={{ 
                                    backgroundImage: 'url("https://www.fidelity.com/bin-public/600_Fidelity_Com_English/images/migration/article/content_08/protect_ret_income_2020_banner.jpg")', 
                                    backgroundSize: 'cover', 
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'center',
                                    position: 'relative' // Add this line
                                }}
                                className="cursor-pointer  px-10 py-10 rounded-sm flex items-end"
                                onClick={() => setIsRetirementModalOpen(true)}
                            >
                                <div 
                                    style={{ 
                                        content: '""', 
                                        position: 'absolute', 
                                        top: 0, 
                                        left: 0, 
                                        
                                        width: '100%', 
                                        height: '100%', 
                                        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Add this line for black tint
                                        borderRadius: 'inherit' // Add this line to match the parent border radius
                                    }} 
                                />
                                <h1 className="text-white font-bold text-lg ml-auto z-10">
                                    Plan for retirement
                                </h1>
                                
                            </div>
                        </div>
                    </div>

                    {isBudgetModalOpen && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                            <div className="bg-white max-w-4xl w-full px-6 py-10 rounded-md shadow-md">
                                <h2 className="text-xl font-bold mb-4">Manage your budget</h2>
                                <p>Your budget management passage goes here...</p>
                                <div className="flex justify-end mt-10">
                                    <button
                                        type="button"
                                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                                        onClick={() => setIsBudgetModalOpen(false)}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {isRetirementModalOpen && (
                                              <div className="fixed z-50 inset-0 flex items-center justify-center bg-black bg-opacity-50">
                                              <div className="bg-white max-w-7xl w-full rounded-lg shadow-lg overflow-hidden">
                                                  <div className="relative">
                                                      <img 
                                                          src="https://www.fidelity.com/bin-public/600_Fidelity_Com_English/images/migration/article/content_08/protect_ret_income_2020_banner.jpg" 
                                                          alt="Retirement Planning" 
                                                          className="w-full h-40 object-cover scrollable"
                                                      />
                                                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                                          <h1 className="text-4xl font-bold text-white">Plan for Retirement</h1>
                                                      </div>
                                                  </div>
                                                  <div className="p-8">
                                                      <h2 className="text-2xl font-semibold text-blue-600 mb-4">Securing Your Future</h2>
                                                      <p className="text-lg leading-relaxed mb-6">
                                                          Planning for retirement is an essential part of financial well-being. It requires careful consideration of your savings, investments, and long-term goals. Whether you're just starting your career or approaching retirement age, having a strategic plan ensures that you can enjoy financial freedom in your later years.
                                                      </p>
                  
                                                      <h3 className="text-xl font-semibold mb-4 text-blue-500">1. Start Saving Early</h3>
                                                      <p className="mb-4">
                                                          The sooner you begin, the more time your investments will have to grow. Even small contributions can add up over time due to compound interest.
                                                      </p>
                  
                                                      <h3 className="text-xl font-semibold mb-4 text-blue-500">2. Set Clear Goals</h3>
                                                      <p className="mb-4">
                                                          Determine how much you'll need for retirement based on your lifestyle, health, and family needs. Planning for medical expenses and inflation is crucial.
                                                      </p>
                  
                                                      <h3 className="text-xl font-semibold mb-4 text-blue-500">3. Diversify Investments</h3>
                                                      <p className="mb-4">
                                                          Spread your savings across different types of assets, such as stocks, bonds, and real estate, to minimize risk.
                                                      </p>
                  
                                                      <h3 className="text-xl font-semibold mb-4 text-blue-500">4. Review Regularly</h3>
                                                      <p className="mb-6">
                                                          Regularly check your retirement plan to ensure you're on track. Adjust your savings and investment strategy based on changes in income, market trends, and personal goals.
                                                      </p>
                  
                                                      <p className="text-lg leading-relaxed">
                                                          By planning ahead and making informed decisions, you can secure your financial future and enjoy peace of mind in retirement.
                                                      </p>
                  
                                                      <div className="flex justify-end mt-10">
                                                          <button
                                                              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                                                              onClick={() => setIsRetirementModalOpen(false)}
                                                          >
                                                              Close
                                                          </button>
                                                      </div>
                                                  </div>
                                              </div>
                                          </div>
                    )}
                </div>

                <div className="grid grid-cols-3 gap-4 gap-y-20 mt-10">
                    <div className="col-span-2">
                        <h1 className="flex items-center">
                            RECENT TRANSACTIONS
                            <button
                                onClick={generateFakeTransactions}
                                className="ml-auto bg-neutral-500 hover:bg-neutral-700 text-white py-1 px-2 text-xs rounded-sm mb-4 ml-4"
                            >
                            <i className="fa-solid fa-plus"></i> Generate Transactions
                            </button>
                            <button
                                onClick={syncAccount}
                                className="ml-2 bg-neutral-500 hover:bg-neutral-700 text-white py-1 px-2 text-xs rounded-sm mb-4 "
                            >
                            <i className="fa-solid fa-sync"></i> Sync Account
                            </button>
                        </h1>
                        <span className="text-sm text-neutral-400">
                            {verboseProgress}
                        </span>
                        {progress > 0 && (
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                            </div>
                        )}
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b">
                                    <th className="py-2 font-normal text-sm uppercase text-gray-500">
                                        DESCRIPTOR
                                    </th>
                                    <th className=" py-2 font-normal text-sm uppercase text-gray-500">
                                        Category
                                    </th>
                                    <th className="py-2 font-normal text-sm uppercase text-gray-500">
                                        Amount
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayedTransactions.map((transaction, index) => {
                                    const { icon, color } = getCategoryIcon(transaction.category);
                                    return (
                                        <tr key={index} className="border-b">
                                            <td className="py-2 uppercase">{transaction.description}</td>
                                            <td className="py-2 uppercase flex items-center">
                                                <i className={`fa ${icon} ${color} px-2 py-1 rounded-full mr-2`}></i>
                                                {transaction.category}
                                            </td>
                                            <td className="py-2">
                                                {transaction.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {transactions.length > 10 && (
                            <div className="mt-2 text-left">
                                <button
                                    onClick={() => setShowAllTransactions(!showAllTransactions)}
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-semibold text-xs py-2 px-4 rounded"
                                >
                                    {showAllTransactions ? "Show Less" : "Show All Transactions"}
                                </button>
                            </div>
                        )}


                        <div className="col-span-4 mt-10">
                            <h1 className='flex'>
                                YOUR BILLS
                                <button 
                                    onClick={generateMockBills} 
                                    className='ml-auto text-sm bg-gray-500 hover:bg-gray-700 text-white text-xs py-1 px-2 rounded-sm'
                                >
                                <i className="fa-solid fa-plus"></i> Generate Mock Bills
                                </button>
                            </h1>
                            <div className="mt-4">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="py-2 font-normal text-sm uppercase text-gray-500">Payee</th>
                                            <th className="py-2 font-normal text-sm uppercase text-gray-500">Due Date</th>
                                            <th className="py-2 font-normal text-sm uppercase text-gray-500">Amount</th>
                                            <th className="py-2 font-normal text-sm uppercase text-gray-500">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {displayedBills.map((bill, index) => (
                                            <tr key={index} className="border-b">
                                                <td className="py-2">{bill.payee}</td>
                                                <td className="py-2">{new Date(bill.payment_date).toLocaleDateString()}</td>
                                                <td className="py-2">${bill.payment_amount.toFixed(2)}</td>
                                                <td className="py-2 capitalize">{bill.status}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {bills.length > 10 && (
                                    <div className="mt-4 ">
                                        <button
                                            onClick={() => setShowAllBills(!showAllBills)}
                                            className="bg-blue-500 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-4 rounded"
                                        >
                                            {showAllBills ? "Show Less" : "Show All Bills"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <br></br>  <br></br>  <br></br>  <br></br>

                    </div>

                    <div className="col-span-1 border-l-2 border-neutral-100 pl-4">
                        <h1 className='flex'>ENDING BALANCES
                            {balances.length != 0 && (
                                <button 								onClick={() => setIsModalOpen(true)}
                                    className='ml-auto text-xs bg-neutral-500 hover:bg-neutral-700  text-white  py-1 px-2 rounded-sm'><i className="fa-solid fa-plus"></i> Add Account</button>
                            )}
                        </h1>
                        {balances.map((account, index) => (
                            <div key={index} className="bg-neutral-100 shadow-md rounded-sm mt-4 p-4 mb-4">
                                <p className="text-md text-neutral-400 truncate">{account.type.toUpperCase()} {account.nickname}</p>
                                <p className="text-2xl text-green-500 font-bold ">
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

                        <div className="col-span-4 mt-10 border-t-2 border-neutral-100 ">
                            <h1 className='flex mt-4  '>YOUR BUDGETS
                                <button 
                                    onClick={() => setIsBudgetModalOpen(true)} 
                                    className='ml-auto text-xs bg-gray-500 hover:bg-gray-700 text-white py-1 px-2 rounded-sm'>
                                    <i className="fa-solid fa-plus"></i> Create Budget
                                </button>
                            </h1>
                            <div className="grid grid-cols-1 gap-4 gap-y-1 ">
                                {budgets.map((budget, index) => (
                                    <div key={index} className="bg-neutral-100 px-4 py-4 rounded-md border-l-4 border-blue-400 mt-2">
                                        <h1 className="text-lgfont-semibold">{budget.name}</h1>
                                        <p className="text-md text-neutral-400">
                                            ${budget.amount_spent }/${budget.limit}
                                        </p>
                                    </div>
                                ))}
                            </div>

                        </div>
                    </div>

                    {isBudgetModalOpen && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                            <div className="bg-white max-w-4xl w-full px-6 py-10 rounded-md shadow-md">
                                <h2 className="text-xl font-bold mb-4">Create Budget</h2>
                                <form onSubmit={handleBudgetSubmit} className="mb-4">
                                    <input
                                        type="text"
                                        id="budget_name"
                                        name="name"
                                        value={newBudget.name}
                                        onChange={handleBudgetChange}
                                        placeholder="Budget Name"
                                        className="border p-2 mr-2 w-full"
                                        required
                                    >

                                    </input>
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
                                                className="text-xs bg-neutral-500 text-white px-2 hover:bg-neutral-600 rounded-xs"
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
