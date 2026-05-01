import { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { useConfig } from '../../hooks/useConfig';
import { Target, CalendarDays, Lock, Unlock } from 'lucide-react';
import { toast } from 'sonner';

export function Settings() {
  const { meta, fechaViaje, pin, updateMeta, updateFechaViaje, updatePin } = useConfig();
  const [monto, setMonto] = useState<string>('');
  const [fecha, setFecha] = useState<string>('');
  const [newPin, setNewPin] = useState<string>('');

  useEffect(() => {
    setMonto(meta.toString());
    setFecha(fechaViaje || '');
    setNewPin(pin || '');
  }, [meta, fechaViaje, pin]);

  const handleSaveMeta = async () => {
    const val = parseFloat(monto);
    if (isNaN(val) || val < 0) {
      toast.error('Ingresa un monto válido');
      return;
    }
    try {
      await updateMeta(val);
      toast.success('Meta actualizada');
    } catch {
      toast.error('Error al actualizar la meta');
    }
  };

  const handleSaveFecha = async () => {
    if (!fecha) {
      toast.error('Selecciona una fecha');
      return;
    }
    try {
      await updateFechaViaje(fecha);
      toast.success('Fecha del viaje actualizada');
    } catch {
      toast.error('Error al actualizar la fecha');
    }
  };

  const handleSavePin = async () => {
    if (newPin && newPin.length !== 4) {
      toast.error('El PIN debe ser de 4 dígitos');
      return;
    }
    try {
      await updatePin(newPin || null);
      if (newPin) {
        toast.success('PIN activado');
      } else {
        toast.success('PIN desactivado');
        sessionStorage.removeItem('cancun_unlocked');
      }
    } catch {
      toast.error('Error al actualizar el PIN');
    }
  };

  return (
    <div className="space-y-6">
      {/* Meta */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          Monto Total de la Deuda (MXN)
        </Label>
        <div className="flex gap-2">
          <Input
            type="number"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            placeholder="Ej. 25000"
          />
          <Button onClick={handleSaveMeta} size="sm">Guardar</Button>
        </div>
      </div>

      {/* Fecha del Viaje */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-primary" />
          Fecha del Viaje (para countdown)
        </Label>
        <div className="flex gap-2">
          <Input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
          <Button onClick={handleSaveFecha} size="sm">Guardar</Button>
        </div>
      </div>

      {/* PIN */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          {pin ? <Lock className="h-4 w-4 text-primary" /> : <Unlock className="h-4 w-4 text-muted-foreground" />}
          PIN de Seguridad (4 dígitos)
        </Label>
        <div className="flex gap-2">
          <Input
            type="password"
            maxLength={4}
            pattern="[0-9]*"
            inputMode="numeric"
            value={newPin}
            onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="Dejar vacío para desactivar"
          />
          <Button onClick={handleSavePin} size="sm" variant={pin ? 'default' : 'outline'}>
            {pin ? 'Cambiar' : 'Activar'}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          {pin ? '🔒 PIN activo — se pedirá al abrir la app' : '🔓 Sin PIN — cualquiera puede ver la app'}
        </p>
      </div>
    </div>
  );
}
