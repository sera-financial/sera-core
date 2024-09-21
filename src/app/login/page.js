'use client'
import React, { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/api/users/login', { email, password });
      
      if (response.data.message === 'Logged in successfully') {
        // Store the token in local storage or cookies
        localStorage.setItem('token', response.data.token);
        // Redirect to the dashboard or another protected route
        window.location.href = '/dashboard';
      } else {
        setMessage("Something went wrong");
      }
    } catch (error) {
      console.log(error);
      setMessage(error.response.data.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
        <h2 className="text-xl text-left">Welcome back to <span onClick={() => window.location.href = '/'} className="font-bold cursor-pointer">Sera<i className="fas fa-leaf"></i></span></h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring focus:ring-blue-200"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring focus:ring-blue-200"
              required
            />
          </div>
          <button
            onClick={handleSubmit}
            className="w-full px-4 py-2 font-bold text-white bg-blue-500 rounded-md hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-200"
          >
            Login
          </button>


          <br />
          <br />
          <a href="/register" className="mt-12">
            <p className="text-sm text-blue-500">Don't have an account? Register</p>
          </a>
      
          {message && <p className="text-red-500">{message}</p>}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;