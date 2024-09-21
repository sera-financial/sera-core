'use client';

import { useRouter } from 'next/navigation';
import Navigation from '../../components/navigation';
import ChatbotUI from './ChatbotUI';

export default function SeraAIPage() {
  const router = useRouter();

  const handleSeraAIClick = () => {
    // Since we're already on the SeraAI page, we might want to do something else here
    // For now, let's just console.log
    console.log('Already on SeraAI page');
  };

  return (
    <>
      <Navigation onSeraAIClick={handleSeraAIClick} />
      <div className="container mx-auto p-4 h-screen flex flex-col">
        <h1 className="text-2xl font-bold mb-4">Sera AI Chatbot</h1>
        <div className="flex-1">
          <ChatbotUI />
        </div>
      </div>
    </>
  );
}
