import { useEffect } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { PaymentForm } from './components/PaymentForm';
import { PaymentList } from './components/PaymentList';
import { PaymentChart } from './components/PaymentChart';
import { PinLock } from './components/PinLock';
import { Toaster } from 'sonner';
import { useStore } from './store/useStore';
import { useConfig } from './hooks/useConfig';

function App() {
  const { darkMode, isLocked } = useStore();
  // Initialize config listener
  useConfig();

  // Apply dark mode class to HTML element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen pb-12 transition-colors duration-300">
      <Toaster position="top-right" richColors theme={darkMode ? 'dark' : 'light'} />

      {isLocked && <PinLock />}

      <main className="container mx-auto px-4 py-6 max-w-6xl space-y-6">
        <Header />
        <Dashboard />
        <PaymentChart />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-8">
            <PaymentForm />
          </div>

          <div className="lg:col-span-2">
            <PaymentList />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
