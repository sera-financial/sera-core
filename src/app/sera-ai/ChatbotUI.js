'use client';

import { useState } from 'react';

export default function ChatbotUI() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages(prev => [...prev, { text: input, sender: 'user' }, { text: '', sender: 'ai', isStreaming: true }]);
    setInput('');

    try {
      const response = await fetch('http://localhost:3001/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });

      if (!response.ok) throw new Error('Network response was not ok');

      console.log('Response received:', response);
      const data = JSON.parse(await response.json());

      const userId = (await fetch('http://localhost:3001/api/users/account', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      }).then(res => res.json())).user._id;

      const content = data?.content;
      console.log("The content is: ", content);
      for (let i = 0; i < data?.type?.length; i++) {
        const action = data.type[i];

        switch (action) {
          case 'text':
            await streamContent(content, setMessages);
            break;
          case 'updateBudget':
            await updateBudget(userId, content, setMessages);
            break;
          case 'addTransaction':
            await addTransaction(userId, content, setMessages);
            break;
          case 'reviewSpending':
            await reviewSpending(userId, content, setMessages);
            break;
          default:
            console.log('Unhandled action type:', action);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { text: "Sorry, I couldn't process that request.", sender: 'ai' }]);
    }
  };

  return (
    <div className="flex flex-col h-[600px] border rounded-lg">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message, index) => (
          <div key={index} className={`mb-2 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
            <span className={`inline-block p-2 rounded-lg ${message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
              {message.text}
            </span>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="border-t p-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full p-2 border rounded-lg"
          placeholder="Type your message..."
        />
      </form>
    </div>
  );
}

async function streamContent(content, setMessages) {
  let streamedContent = '';
  for (let i = 0; i < content.length; i++) {
    streamedContent += content[i];
    await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 16) + 5));
    setMessages(prev => {
      const updated = [...prev];
      updated[updated.length - 1] = {
        ...updated[updated.length - 1],
        text: streamedContent,
        isStreaming: i < content.length - 1
      };
      return updated;
    });
  }
}

async function updateBudget(userId, content, setMessages) {
  const { value, category } = content;
  const budgetData = await fetch(`http://localhost:3001/api/budgets/${userId}`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  }).then(res => res.json());

  const budgetId = budgetData.find(budget => budget.name.toLowerCase() === category.toLowerCase())?._id;

  try {
    const updateResponse = await fetch(`http://localhost:3001/api/budgets/update/${userId}/${budgetId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ limit: Number(value) })
    });

    if (!updateResponse.ok) throw new Error('Failed to update budget');

    setMessages(prev => [...prev, { text: `Budget updated: ${category} - $${value}`, sender: 'ai' }]);
  } catch (error) {
    console.error('Error updating budget:', error);
    setMessages(prev => [...prev, { text: "Sorry, I couldn't update the budget. Please try again later.", sender: 'ai' }]);
  }
}

async function addTransaction(userId, content, setMessages) {
  const { value, merchant_name, purchase_date, description } = content;

  console.log('Starting addTransaction function');
  console.log('Received parameters:', { userId, value, merchant_name, purchase_date, description });

  try {
    // Use CapitalOneAPI to create a merchant and get the merchant_id
    console.log('Attempting to generate merchant:', merchant_name);
    const merchantResponse = await fetch('http://api.nessieisreal.com/merchants?key=575fbd2b0728ae7c870640023404c388', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({name: merchant_name})
    });

    console.log('Merchant API response status:', merchantResponse.status);

    if (!merchantResponse.ok) {
        console.error('Failed to generate merchant. Status:', merchantResponse.status);
        throw new Error(`Failed to generate merchant: ${merchant_name}`);
    }

    const merchantData = await merchantResponse.json();
    console.log('Merchant data received:', merchantData);
    const merchant_id = merchantData.objectCreated._id;
    console.log('Merchant generated successfully:', merchant_name, 'with ID:', merchant_id);

    const purchase = {
      merchant_id: merchant_id,
      medium: "balance",
      purchase_date: new Date(purchase_date).toISOString().split('T')[0],
      amount: value,
      status: "pending",
      description: description
    };
    console.log('Prepared purchase object:', purchase);

    // Use CapitalOneAPI to create purchase
    console.log('Attempting to create purchase for account:', userId);

    const purchaseResponse = await fetch(`http://api.nessieisreal.com/accounts/${userId}/purchases?key=575fbd2b0728ae7c870640023404c388`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(purchase)
    });

    console.log('Purchase API response status:', purchaseResponse.status);

    if (!purchaseResponse.ok) {
        console.error('Failed to add transaction. Status:', purchaseResponse.status);
        throw new Error('Failed to add transaction');
    }

    const purchaseData = await purchaseResponse.json();
    console.log('Purchase created successfully:', purchaseData);

    setMessages(prev => {
      console.log('Updating messages with new transaction');
      return [...prev, { text: `Transaction added: ${merchant_name} - $${value}`, sender: 'ai' }];
    });
  } catch (error) {
    console.error('Error in addTransaction:', error);
    setMessages(prev => [...prev, { text: "Sorry, I couldn't add the transaction. Please try again later.", sender: 'ai' }]);
  }

  console.log('addTransaction function completed');
}