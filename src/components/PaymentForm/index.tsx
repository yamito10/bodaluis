import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { usePayments } from '../../hooks/usePayments';
import { useStore } from '../../store/useStore';
import { extractPaymentInfo } from '../../lib/gemini';
import { toast } from 'sonner';
import { UploadCloud, Loader2, Edit3, Image as ImageIcon, X } from 'lucide-react';

const formSchema = z.object({
  monto: z.number().min(1, 'El monto debe ser mayor a 0'),
  fecha: z.string().min(1, 'La fecha es requerida'),
  codigoAutorizacion: z.string().optional(),
  notas: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function PaymentForm() {
  const { addPayment, updatePayment } = usePayments();
  const { editingPayment, setEditingPayment } = useStore();
  const [isExtracting, setIsExtracting] = useState(false);
  const [activeTab, setActiveTab] = useState('manual');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      monto: 0,
      fecha: new Date().toISOString().split('T')[0],
      codigoAutorizacion: '',
      notas: '',
    }
  });

  // Pre-fill form when editing
  useEffect(() => {
    if (editingPayment) {
      setValue('monto', editingPayment.monto);
      setValue('fecha', editingPayment.fecha);
      setValue('codigoAutorizacion', editingPayment.codigoAutorizacion || '');
      setValue('notas', editingPayment.notas || '');
      setActiveTab('manual');
    }
  }, [editingPayment, setValue]);

  const onSubmit = async (data: FormData) => {
    try {
      if (editingPayment) {
        await updatePayment(editingPayment.id, data.monto, data.fecha, data.codigoAutorizacion, data.notas);
        toast.success('Pago actualizado correctamente');
        setEditingPayment(null);
      } else {
        await addPayment(data.monto, data.fecha, data.codigoAutorizacion, data.notas);
        toast.success('Pago registrado correctamente');
      }
      reset();
    } catch (error) {
      toast.error('Error al guardar el pago');
    }
  };

  const handleCancel = () => {
    setEditingPayment(null);
    reset();
  };

  const processFile = async (file: File) => {
    setIsExtracting(true);
    toast.info('Analizando comprobante con IA...');

    try {
      const data = await extractPaymentInfo(file);
      if (data.monto) setValue('monto', Number(data.monto));

      if (data.fecha) {
        try {
          const d = new Date(data.fecha);
          if (!isNaN(d.getTime())) {
            setValue('fecha', d.toISOString().split('T')[0]);
          }
        } catch {
          // ignore parse error
        }
      }

      if (data.codigoAutorizacion) setValue('codigoAutorizacion', data.codigoAutorizacion.toString());

      toast.success('Datos extraídos correctamente. Revisa y guarda.');
      setActiveTab('manual');
    } catch (error) {
      toast.error('Error al analizar la imagen. Intenta manualmente.');
    } finally {
      setIsExtracting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      await processFile(file);
    } else {
      toast.error('Solo se aceptan imágenes');
    }
  };

  return (
    <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur shadow-lg border-brand-turquoise/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center justify-between">
          {editingPayment ? 'Editar Pago' : 'Registrar Nuevo Pago'}
          {editingPayment && (
            <Button variant="ghost" size="icon" onClick={handleCancel} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="manual" className="flex gap-2">
              <Edit3 className="h-4 w-4" />
              Manual
            </TabsTrigger>
            <TabsTrigger value="ocr" className="flex gap-2" disabled={!!editingPayment}>
              <ImageIcon className="h-4 w-4" />
              Escanear (IA)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="monto">Monto (MXN) *</Label>
                <Input id="monto" type="number" step="0.01" {...register('monto', { valueAsNumber: true })} onFocus={(e) => e.target.select()} />
                {errors.monto && <p className="text-sm text-destructive">{errors.monto.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="fecha">Fecha del Pago *</Label>
                <Input id="fecha" type="date" {...register('fecha')} />
                {errors.fecha && <p className="text-sm text-destructive">{errors.fecha.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="codigo">Código de Autorización (Opcional)</Label>
                <Input id="codigo" {...register('codigoAutorizacion')} placeholder="Ej. 123456" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notas">Notas / Concepto (Opcional)</Label>
                <Input id="notas" {...register('notas')} placeholder="Ej. Pago mensualidad marzo" />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingPayment ? 'Guardar Cambios' : 'Guardar Pago'}
                </Button>
                {editingPayment && (
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          </TabsContent>

          <TabsContent value="ocr">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
                isDragging
                  ? 'border-primary bg-primary/10 scale-[1.02]'
                  : 'border-primary/30 bg-brand-offwhite dark:bg-gray-800 hover:bg-primary/5'
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileSelect}
              />
              {isExtracting ? (
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p>La IA está leyendo el comprobante...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                  <UploadCloud className={`h-10 w-10 ${isDragging ? 'text-primary' : 'text-primary/50'}`} />
                  <p className="font-medium text-foreground">Sube o arrastra el comprobante de pago</p>
                  <p className="text-sm">Extraeremos el monto, fecha y código automáticamente</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
