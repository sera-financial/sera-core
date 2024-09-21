import Image from "next/image";
import Navigation from "@/components/navigation";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gradient-to-br from-blue-500 to-blue-300 text-white py-20">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4 text-white">Sera<i className="fa fa-leaf"></i></h1>
          <p className="text-xl mb-8">
            Your ultimate financial management tool.
          </p>
          <a
            href="/register"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Get Started
          </a>
        </div>
      </header>
      <main className="flex-grow container mx-auto p-8">
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-4">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg border-2 border-neutral-100 shadow-lg mx-auto text-center">
            <i className="fa fa-magnifying-glass bg-blue-500 text-white p-2 rounded-full mb-4"></i>

              <h3 className="text-xl font-bold mb-2">Track Expenses</h3>
              <p>
                Easily track your daily expenses and manage your budget
                effectively.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg border-2 border-neutral-100 shadow-lg mx-auto text-center">
              <i className="fa fa-cog bg-blue-500 text-white p-2 rounded-full mb-4"></i>
              <h3 className="text-xl font-bold mb-2">Set Budgets</h3>
              <p>
                Set monthly budgets and get notified when you are close to
                exceeding them.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg border-2 border-neutral-100 shadow-lg mx-auto text-center">
              <i className="fa fa-chart-line bg-blue-500 text-white p-2 rounded-full mb-4"></i>
              <h3 className="text-xl font-bold mb-2">Financial Insights</h3>
              <p>
                Get detailed financial insights and reports to understand your
                spending habits.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border-2 border-neutral-100 shadow-lg mx-auto text-center">
              <i className="fa fa-robot bg-blue-500 text-white p-2 rounded-full mb-4"></i>
              <h3 className="text-xl font-bold mb-2">AI Assistant</h3>
              <p>
                Get personalized financial advice and recommendations based on your spending habits.
              </p>
            </div>
            
          </div>

          
        </section>
    
        <section className="bg-gradient-to-br from-blue-500 to-blue-300 mx-auto  text-center text-white py-20">
          <h2 className="text-3xl font-bold mb-4">What are you waiting for?</h2>

          <p className="mb-8 text-lg">
            Take control of your finances with Sera.
          </p>
          <a
            href="/register"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Sign Up Now
          </a>
        </section>
      </main>
      <footer className="text-black py-8">
        <div className="container mx-auto text-center">
          <p>&copy; 2024 Pranav Ramesh, Kshitij Kochhar, Taimur Shaikh, and Yonatan Tussa. All rights reserved.</p>
          <p className="text-sm">Disclaimer: This is using a mock Capital One API. Please do not use real credit card information.</p>
        </div>
      </footer>
    </div>
  );
}