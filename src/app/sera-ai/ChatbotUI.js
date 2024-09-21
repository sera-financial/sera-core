'use client';

import { useState } from 'react';

export default function ChatbotUI() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (input.trim()) {
      setMessages(prevMessages => [...prevMessages, { text: input, sender: 'user' }]);
      setInput('');

      // Add an initial AI message that will be updated
      setMessages(prevMessages => [...prevMessages, { text: '', sender: 'ai', isStreaming: true }]);

      try {
        const response = await fetch('http://localhost:3001/api/ai/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: input })
        });

        if (!response.ok) throw new Error('Network response was not ok');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let aiResponse = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          aiResponse += chunk;

          // Update the AI's response in real-time
          setMessages(prevMessages => {
            const newMessages = [...prevMessages];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage.sender === 'ai' && lastMessage.isStreaming) {
              lastMessage.text = aiResponse;
            }
            return newMessages;
          });
        }

        // Mark the message as no longer streaming
        setMessages(prevMessages => {
          const newMessages = [...prevMessages];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage.sender === 'ai' && lastMessage.isStreaming) {
            lastMessage.isStreaming = false;
          }
          return newMessages;
        });

      } catch (error) {
        console.error('Error:', error);
        setMessages(prevMessages => [...prevMessages, { text: "Sorry, I couldn't process that request.", sender: 'ai' }]);
      }
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