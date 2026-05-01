import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { usePayments } from '../../hooks/usePayments';
import { useConfig } from '../../hooks/useConfig';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { TrendingUp } from 'lucide-react';

export function PaymentChart() {
  const { payments } = usePayments();
  const { meta } = useConfig();

  const chartData = useMemo(() => {
    if (payments.length === 0) return [];

    // Sort payments by date (oldest first)
    const sorted = [...payments].sort(
      (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
    );

    let cumulative = 0;
    return sorted.map((p) => {
      cumulative += p.monto;
      return {
        fecha: format(new Date(p.fecha), 'dd MMM yy', { locale: es }),
        monto: p.monto,
        acumulado: cumulative,
        meta: meta,
      };
    });
  }, [payments, meta]);

  if (payments.length < 2) return null;

  return (
    <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5 text-primary" />
          Evolución de Pagos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="colorAcumulado" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
            <XAxis dataKey="fecha" tick={{ fontSize: 11 }} stroke="#94a3b8" />
            <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                fontSize: '13px',
              }}
              formatter={(value, name) => [
                `$${Number(value).toLocaleString()} MXN`,
                name === 'acumulado' ? 'Total acumulado' : 'Meta',
              ]}
            />
            <Area
              type="monotone"
              dataKey="acumulado"
              stroke="#06B6D4"
              strokeWidth={2.5}
              fill="url(#colorAcumulado)"
              dot={{ fill: '#06B6D4', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, strokeWidth: 0, fill: '#0E7490' }}
            />
            {meta > 0 && (
              <Area
                type="monotone"
                dataKey="meta"
                stroke="#0E7490"
                strokeWidth={1.5}
                strokeDasharray="6 4"
                fill="none"
                dot={false}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
