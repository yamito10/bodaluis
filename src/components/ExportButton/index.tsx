import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { usePayments } from '../../hooks/usePayments';
import { useConfig } from '../../hooks/useConfig';
import { Button } from '../ui/button';
import { FileDown } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

export function ExportButton() {
  const { payments } = usePayments();
  const { meta } = useConfig();

  const handleExport = () => {
    try {
      const doc = new jsPDF();
      const totalPagado = payments.reduce((acc, p) => acc + p.monto, 0);
      const porcentaje = meta > 0 ? Math.round((totalPagado / meta) * 100) : 0;

      // Title
      doc.setFontSize(20);
      doc.setTextColor(14, 116, 144); // ocean color
      doc.text('✈️ Cancún 2026 — Reporte de Pagos', 14, 22);

      // Summary
      doc.setFontSize(11);
      doc.setTextColor(71, 85, 105);
      doc.text(`Fecha del reporte: ${format(new Date(), "d 'de' MMMM, yyyy", { locale: es })}`, 14, 32);
      doc.text(`Meta total: $${meta.toLocaleString()} MXN`, 14, 39);
      doc.text(`Total pagado: $${totalPagado.toLocaleString()} MXN`, 14, 46);
      doc.text(`Restante: $${Math.max(0, meta - totalPagado).toLocaleString()} MXN`, 14, 53);
      doc.text(`Progreso: ${porcentaje}%`, 14, 60);

      // Progress bar visual
      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(226, 232, 240);
      doc.roundedRect(14, 64, 180, 6, 3, 3, 'F');
      doc.setFillColor(6, 182, 212);
      doc.roundedRect(14, 64, Math.min(180, (180 * porcentaje) / 100), 6, 3, 3, 'F');

      // Payments table
      const sorted = [...payments].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
      const tableData = sorted.map((p, i) => [
        i + 1,
        format(new Date(p.fecha), "dd/MM/yyyy", { locale: es }),
        `$${p.monto.toLocaleString()}`,
        p.codigoAutorizacion || '—',
        p.notas || '—',
      ]);

      autoTable(doc, {
        startY: 76,
        head: [['#', 'Fecha', 'Monto', 'Código', 'Notas']],
        body: tableData,
        headStyles: {
          fillColor: [14, 116, 144],
          textColor: 255,
          fontSize: 10,
        },
        bodyStyles: { fontSize: 9 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        styles: { cellPadding: 3 },
      });

      doc.save('cancun-2026-pagos.pdf');
      toast.success('PDF descargado exitosamente');
    } catch (error) {
      console.error('Error al generar PDF:', error);
      toast.error('Error al generar el PDF');
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
      <FileDown className="h-4 w-4" />
      Exportar PDF
    </Button>
  );
}
