import { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { useConfig } from '../../hooks/useConfig';
import { Lock, Delete } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function PinLock() {
  const { setIsLocked } = useStore();
  const { pin } = useConfig();
  const [inputPin, setInputPin] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // If no PIN is set, auto-unlock
  useEffect(() => {
    if (pin === null || pin === undefined || pin === '') {
      setIsLocked(false);
    }
    // Check sessionStorage
    if (sessionStorage.getItem('cancun_unlocked') === 'true') {
      setIsLocked(false);
    }
  }, [pin, setIsLocked]);

  const handleDigit = (digit: string) => {
    if (inputPin.length >= 4) return;
    const next = inputPin + digit;
    setInputPin(next);
    setError(false);

    if (next.length === 4) {
      if (next === pin) {
        sessionStorage.setItem('cancun_unlocked', 'true');
        setTimeout(() => setIsLocked(false), 300);
      } else {
        setError(true);
        setShake(true);
        setTimeout(() => {
          setInputPin('');
          setShake(false);
        }, 600);
      }
    }
  };

  const handleDelete = () => {
    setInputPin(inputPin.slice(0, -1));
    setError(false);
  };

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-br from-brand-turquoise via-brand-ocean to-cyan-900 flex items-center justify-center">
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{
          opacity: 1,
          scale: 1,
          x: shake ? [0, -10, 10, -10, 10, 0] : 0,
        }}
        transition={{ duration: shake ? 0.4 : 0.3 }}
        className="text-center space-y-8"
      >
        <div className="space-y-3">
          <div className="bg-white/15 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center mx-auto">
            <Lock className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Cancún 2026</h2>
          <p className="text-cyan-200 text-sm">Ingresa tu PIN de 4 dígitos</p>
        </div>

        {/* PIN dots */}
        <div className="flex justify-center gap-4">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              animate={{ scale: inputPin.length > i ? 1.2 : 1 }}
              className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                error
                  ? 'bg-red-400 border-red-400'
                  : inputPin.length > i
                  ? 'bg-white border-white'
                  : 'border-white/50'
              }`}
            />
          ))}
        </div>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-red-300 text-sm"
            >
              PIN incorrecto
            </motion.p>
          )}
        </AnimatePresence>

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto">
          {digits.map((d, i) => {
            if (d === '') return <div key={i} />;
            if (d === 'del')
              return (
                <button
                  key={i}
                  onClick={handleDelete}
                  className="h-14 rounded-xl text-white/80 hover:bg-white/15 transition-colors flex items-center justify-center"
                >
                  <Delete className="h-5 w-5" />
                </button>
              );
            return (
              <button
                key={i}
                onClick={() => handleDigit(d)}
                className="h-14 rounded-xl bg-white/10 backdrop-blur-sm text-white text-xl font-semibold hover:bg-white/25 active:scale-95 transition-all"
              >
                {d}
              </button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
