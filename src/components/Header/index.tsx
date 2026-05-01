import { useState, useEffect } from 'react';
import { Plane, Sun, Moon, Settings as SettingsIcon } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useConfig } from '../../hooks/useConfig';
import { Button } from '../ui/button';
import { Settings } from '../Settings';
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogHeader } from '../ui/dialog';

export function Header() {
  const { darkMode, toggleDarkMode } = useStore();
  const { fechaViaje } = useConfig();
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!fechaViaje) return;

    const updateCountdown = () => {
      const target = new Date(fechaViaje + 'T00:00:00');
      const now = new Date();
      const diff = Math.max(0, target.getTime() - now.getTime());

      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [fechaViaje]);

  return (
    <header className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-turquoise via-brand-ocean to-cyan-900 p-6 md:p-8 text-white shadow-2xl">
      {/* Wave pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <svg viewBox="0 0 1440 320" className="absolute bottom-0 w-full" preserveAspectRatio="none">
          <path fill="white" d="M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,213.3C672,192,768,128,864,128C960,128,1056,192,1152,208C1248,224,1344,192,1392,176L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2.5">
              <Plane className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Cancún 2026</h1>
              <p className="text-cyan-100 text-sm">Seguimiento de pagos • Agencia de viajes</p>
            </div>
          </div>
        </div>

        {/* Countdown */}
        {fechaViaje && (
          <div className="flex items-center gap-3">
            {[
              { value: countdown.days, label: 'Días' },
              { value: countdown.hours, label: 'Hrs' },
              { value: countdown.minutes, label: 'Min' },
              { value: countdown.seconds, label: 'Seg' },
            ].map((item) => (
              <div key={item.label} className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center min-w-[60px]">
                <div className="text-2xl md:text-3xl font-bold tabular-nums">{String(item.value).padStart(2, '0')}</div>
                <div className="text-[10px] uppercase tracking-widest text-cyan-200">{item.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2 absolute top-4 right-4 md:static">
          <Button
            variant="ghost"
            size="icon"
            className="text-white/80 hover:text-white hover:bg-white/15"
            onClick={toggleDarkMode}
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white/80 hover:text-white hover:bg-white/15">
                <SettingsIcon className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajustes del Viaje</DialogTitle>
              </DialogHeader>
              <Settings />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
}
