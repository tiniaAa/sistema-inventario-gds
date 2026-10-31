import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { ArrowDownLeft, ArrowUpRight, AlertCircle, PlusCircle, RefreshCw } from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { IngresoStockModal } from '../components/movimientos/IngresoStockModal';

export const Movimientos = () => {
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isIngresoModalOpen, setIsIngresoModalOpen] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  useEffect(() => {
    fetchMovimientos();
  }, []);

  const fetchMovimientos = async () => {
    setLoading(true);
    try {
      const res = await api.get('/movimientos?page=0&size=50');
      setMovimientos(res.data.content || res.data || []);
    } catch (e) {
      console.error('Error fetching movimientos', e);
    } finally {
      setLoading(false);
    }
  };

  const handleIngresoSuccess = (nuevoMovimiento) => {
    fetchMovimientos();
    setFeedbackMsg(
      `Ingreso registrado con éxito: +${nuevoMovimiento.cantidad} u. para "${nuevoMovimiento.productoNombre || 'Producto'}" (Saldo actual: ${nuevoMovimiento.stockPosterior}).`
    );
    setTimeout(() => setFeedbackMsg(''), 6000);
  };

  const getTipoBadge = (tipo) => {
    switch (tipo) {
      case 'INGRESO':
        return <Badge variant="outline">Ingreso (+)</Badge>;
      case 'EGRESO':
        return <Badge variant="solid">Egreso (-)</Badge>;
      case 'AJUSTE_MERMA':
        return <Badge variant="destructive">Merma (-)</Badge>;
      case 'AJUSTE_SOBRANTE':
        return <Badge variant="soft">Sobrante (+)</Badge>;
      default:
        return <Badge variant="soft">{tipo}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Alerta de confirmación de movimiento */}
      {feedbackMsg && (
        <div className="p-4 bg-[#ffffff] border border-[#e5e5e5] rounded-[18px] text-[13px] text-[#0a0a0a] flex items-center justify-between shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0a0a0a]" />
            <span>{feedbackMsg}</span>
          </div>
          <button
            onClick={() => setFeedbackMsg('')}
            className="text-[#737373] hover:text-[#0a0a0a] text-[12px] font-medium"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Cabecera y acciones */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-[30px] font-semibold text-[#0a0a0a] tracking-tight">Movimientos de Stock</h1>
          <p className="text-[14px] text-[#737373]">Historial de entradas, salidas y auditoría inmutable de inventario.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsIngresoModalOpen(true)}
            className="bg-[#0a0a0a] hover:bg-[#171717] text-[#fafafa] px-4 py-2 rounded-[18px] text-[14px] font-medium flex items-center gap-2 transition-colors cursor-pointer"
          >
            <PlusCircle size={16} strokeWidth={1.75} />
            Ingreso de Mercadería
          </button>
          <button
            onClick={fetchMovimientos}
            disabled={loading}
            title="Refrescar movimientos"
            className="bg-[#f5f5f5] hover:bg-[#e5e5e5] text-[#0a0a0a] p-2.5 rounded-[18px] text-[14px] font-medium transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={16} strokeWidth={1.75} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Tabla de movimientos */}
      <div className="bg-[#ffffff] rounded-[24px] border border-[#e5e5e5] shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[14px]">
            <thead className="bg-[#fafafa] text-[12px] uppercase text-[#737373] font-medium">
              <tr>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3 text-right">Cantidad</th>
                <th className="px-4 py-3 text-right">Saldo Ant.</th>
                <th className="px-4 py-3 text-right">Saldo Post.</th>
                <th className="px-4 py-3">Motivo / Documento</th>
                <th className="px-4 py-3">Operador</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e5e5]">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-[#737373] text-[14px]">
                    Cargando movimientos...
                  </td>
                </tr>
              ) : movimientos.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-[#737373] text-[14px]">
                    No hay registros de movimientos en el sistema.
                  </td>
                </tr>
              ) : (
                movimientos.map((m) => (
                  <tr key={m.id} className="hover:bg-[#fafafa] transition-colors">
                    <td className="px-4 py-3 text-[12px] text-[#737373]">
                      {m.fechaMovimiento ? new Date(m.fechaMovimiento).toLocaleString() : '-'}
                    </td>
                    <td className="px-4 py-3">{getTipoBadge(m.tipoMovimiento)}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-[#0a0a0a]">
                        {m.productoNombre || m.producto?.nombre || `Prod #${m.productoId}`}
                      </div>
                      {(m.productoSku || m.producto?.sku) && (
                        <div className="text-[11px] font-mono text-[#737373]">
                          SKU: {m.productoSku || m.producto?.sku}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold text-[#0a0a0a]">
                      {m.tipoMovimiento === 'INGRESO' || m.tipoMovimiento === 'AJUSTE_SOBRANTE' ? `+${m.cantidad}` : `-${m.cantidad}`}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-[#737373]">{m.stockAnterior}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold text-[#0a0a0a]">{m.stockPosterior}</td>
                    <td className="px-4 py-3 text-[#737373] max-w-xs truncate" title={m.motivo}>
                      {m.motivo}
                    </td>
                    <td className="px-4 py-3 text-[12px] font-mono text-[#737373]">
                      {m.usuarioUsername || m.usuario?.username || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para Ingreso de Mercadería */}
      <IngresoStockModal
        isOpen={isIngresoModalOpen}
        onClose={() => setIsIngresoModalOpen(false)}
        onSuccess={handleIngresoSuccess}
      />
    </div>
  );
};
