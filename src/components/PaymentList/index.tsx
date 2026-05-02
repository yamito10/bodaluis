import { useState } from 'react';
import { usePayments } from '../../hooks/usePayments';
import { useStore } from '../../store/useStore';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { ExportButton } from '../ExportButton';
import { Trash2, Calendar, Hash, Pencil, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';

export function PaymentList() {
  const { payments, loading, deletePayment } = usePayments();
  const { setEditingPayment } = useStore();
  const [paymentToDelete, setPaymentToDelete] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-7 w-40 rounded-md bg-primary/10 animate-pulse" />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-xl bg-primary/5 animate-pulse" />
        ))}
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
        <p className="font-medium">No hay pagos registrados aún</p>
        <p className="text-sm">Registra tu primer pago usando el formulario</p>
      </div>
    );
  }

  const confirmDelete = () => {
    if (paymentToDelete) {
      deletePayment(paymentToDelete);
      toast.success('Pago eliminado');
      setPaymentToDelete(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-foreground">
          Historial de Pagos
          <span className="ml-2 text-sm font-normal text-muted-foreground">({payments.length})</span>
        </h3>
        <ExportButton />
      </div>

      <AnimatePresence>
        {payments.map((payment, index) => (
          <motion.div
            key={payment.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, x: -20 }}
            transition={{ duration: 0.25, delay: index * 0.05 }}
            layout
          >
            <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur hover:shadow-md transition-all duration-200 group">
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-3">
                    <p className="text-lg font-bold text-primary">
                      ${payment.monto.toLocaleString()} MXN
                    </p>
                    {payment.codigoAutorizacion && (
                      <span className="hidden sm:flex items-center gap-1 bg-brand-sand/30 dark:bg-brand-sand/10 text-brand-ocean dark:text-cyan-300 px-2 py-0.5 rounded-full text-xs shrink-0">
                        <Hash className="h-3 w-3" />
                        <span className="max-w-[120px] truncate">{payment.codigoAutorizacion}</span>
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center text-sm text-muted-foreground gap-x-4 gap-y-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(payment.fecha + 'T12:00:00'), "d 'de' MMMM, yyyy", { locale: es })}
                    </span>
                    {payment.notas && (
                      <span className="flex items-center gap-1 italic text-xs">
                        <FileText className="h-3 w-3" />
                        {payment.notas}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                    onClick={() => setEditingPayment(payment)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setPaymentToDelete(payment.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      <Dialog open={!!paymentToDelete} onOpenChange={(open) => !open && setPaymentToDelete(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>¿Estás seguro de eliminar este pago?</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Esta acción no se puede deshacer. Se eliminará el registro permanentemente.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setPaymentToDelete(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
