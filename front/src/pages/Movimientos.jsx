import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { ArrowDownLeft, ArrowUpRight, AlertCircle, PlusCircle } from 'lucide-react';
import { Badge } from '../components/common/Badge';

export const Movimientos = () => {
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMovimientos();
  }, []);

  const fetchMovimientos = async () => {
    setLoading(true);
    try {
      const res = await api.get('/movimientos');
      setMovimientos(res.data.content || res.data || []);
    } catch (e) {
      console.error('Error fetching movimientos', e);
    } finally {
      setLoading(false);
    }
  };

  const getTipoBadge = (tipo) => {
    switch (tipo) {
      case 'INGRESO':
        return <Badge variant="outline">Ingreso (+)</Badge>;
      case 'EGRESO':
        return <Badge variant="solid">Egreso (-)</Badge>;
      case 'AJUSTE_MERMA':
        return <Badge variant="destructive">Merma (-)</Badge>;
      default:
        return <Badge variant="soft">{tipo}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-[30px] font-semibold text-[#0a0a0a] tracking-tight">Movimientos de Stock</h1>
          <p className="text-[14px] text-[#737373]">Historial de entradas, salidas y ajustes de inventario.</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-[#0a0a0a] hover:bg-[#171717] text-[#fafafa] px-4 py-2 rounded-[18px] text-[14px] font-medium flex items-center gap-2 transition-colors">
            <PlusCircle size={16} strokeWidth={1.75} />
            Ingreso de Mercadería
          </button>
          <button className="bg-[#f5f5f5] hover:bg-[#e5e5e5] text-[#0a0a0a] px-4 py-2 rounded-[18px] text-[14px] font-medium flex items-center gap-2 transition-colors">
            <ArrowUpRight size={16} strokeWidth={1.75} />
            Egreso / Venta
          </button>
        </div>
      </div>

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
                  <td colSpan="8" className="text-center py-8 text-[#737373] text-[14px]">Cargando movimientos...</td>
                </tr>
              ) : movimientos.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-[#737373] text-[14px]">No hay registros de movimientos.</td>
                </tr>
              ) : (
                movimientos.map((m) => (
                  <tr key={m.id} className="hover:bg-[#fafafa]">
                    <td className="px-4 py-3 text-[12px] text-[#737373]">{new Date(m.fechaMovimiento).toLocaleString()}</td>
                    <td className="px-4 py-3">{getTipoBadge(m.tipoMovimiento)}</td>
                    <td className="px-4 py-3 font-medium text-[#0a0a0a]">{m.producto?.nombre || `Prod #${m.productoId}`}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold text-[#0a0a0a]">{m.cantidad}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-[#737373]">{m.stockAnterior}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-medium text-[#0a0a0a]">{m.stockPosterior}</td>
                    <td className="px-4 py-3 text-[#737373]">{m.motivo}</td>
                    <td className="px-4 py-3 text-[12px] font-mono text-[#737373]">{m.usuario?.username || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
