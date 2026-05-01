import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ProgressBar } from '../ProgressBar';
import { usePayments } from '../../hooks/usePayments';
import { useConfig } from '../../hooks/useConfig';
import { DollarSign, Target, CreditCard, Percent, CalendarClock, TrendingUp } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { motion, type Easing } from 'framer-motion';
import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

const easeOut: Easing = [0, 0, 0.2, 1];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: easeOut },
  }),
};

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-6 w-full rounded-full" />
        </CardContent>
      </Card>
    </div>
  );
}

export function Dashboard() {
  const { payments, loading: loadingPayments } = usePayments();
  const { meta, loading: loadingMeta } = useConfig();
  const confettiRef = useRef(false);

  const totalPagado = payments.reduce((acc, curr) => acc + curr.monto, 0);
  const montoRestante = Math.max(0, meta - totalPagado);
  const porcentaje = meta > 0 ? Math.min(100, Math.round((totalPagado / meta) * 100)) : 0;
  const numeroPagos = payments.length;

  // Estimate next payment info
  const lastPayment = payments.length > 0 ? payments[0] : null;
  const avgPayment = numeroPagos > 0 ? Math.round(totalPagado / numeroPagos) : 0;
  const paymentsRemaining = avgPayment > 0 ? Math.ceil(montoRestante / avgPayment) : 0;

  // Confetti when reaching 100%
  useEffect(() => {
    if (porcentaje >= 100 && !confettiRef.current && !loadingPayments) {
      confettiRef.current = true;
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#06B6D4', '#0E7490', '#FEF3C7', '#22D3EE', '#FFD700'],
      });
    }
  }, [porcentaje, loadingPayments]);

  if (loadingPayments || loadingMeta) return <DashboardSkeleton />;

  const cards = [
    { title: 'Total Pagado', value: `$${totalPagado.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-500' },
    { title: 'Monto Restante', value: `$${montoRestante.toLocaleString()}`, icon: Target, color: 'text-amber-500' },
    { title: 'Número de Pagos', value: numeroPagos.toString(), icon: CreditCard, color: 'text-blue-500' },
    { title: 'Completado', value: `${porcentaje}%`, icon: Percent, color: 'text-brand-turquoise' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, i) => (
          <motion.div key={card.title} custom={i} variants={cardVariants} initial="hidden" animate="visible">
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-brand-turquoise/20 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{card.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div custom={4} variants={cardVariants} initial="hidden" animate="visible">
        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span>Progreso del Viaje</span>
              <span className="text-sm font-normal text-muted-foreground">
                Meta: ${meta.toLocaleString()} MXN
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ProgressBar percentage={porcentaje} />

            {/* Smart insights */}
            {montoRestante > 0 && avgPayment > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span>Pago promedio: <strong className="text-foreground">${avgPayment.toLocaleString()}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CreditCard className="h-4 w-4 text-primary" />
                  <span>Pagos restantes: <strong className="text-foreground">~{paymentsRemaining}</strong></span>
                </div>
                {lastPayment && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarClock className="h-4 w-4 text-primary" />
                    <span>Último pago: <strong className="text-foreground">{new Date(lastPayment.fecha).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}</strong></span>
                  </div>
                )}
              </div>
            )}

            {porcentaje >= 100 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-r from-emerald-50 to-cyan-50 dark:from-emerald-950/30 dark:to-cyan-950/30 rounded-lg p-4 text-center"
              >
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">🎉 ¡Felicidades! Has completado todos los pagos</p>
                <p className="text-sm text-muted-foreground">¡Prepara tus maletas para Cancún!</p>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
