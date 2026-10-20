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
        return <Badge variant="optimal">Ingreso (+)</Badge>;
      case 'EGRESO':
        return <Badge variant="danger">Egreso (-)</Badge>;
      case 'AJUSTE_MERMA':
        return <Badge variant="warning">Merma (-)</Badge>;
      default:
        return <Badge variant="info">{tipo}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Movimientos de Stock</h1>
          <p className="text-sm text-slate-500">Historial de entradas, salidas y ajustes de inventario.</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-colors">
            <PlusCircle size={16} />
            Ingreso de Mercadería
          </button>
          <button className="bg-red-600 hover:bg-red-700 text-white px-3.5 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-colors">
            <ArrowUpRight size={16} />
            Egreso / Venta
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-xs uppercase text-slate-500 font-semibold">
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
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-slate-500 text-sm">Cargando movimientos...</td>
                </tr>
              ) : movimientos.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-slate-500 text-sm">No hay registros de movimientos.</td>
                </tr>
              ) : (
                movimientos.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-xs text-slate-500">{new Date(m.fechaMovimiento).toLocaleString()}</td>
                    <td className="px-4 py-3">{getTipoBadge(m.tipoMovimiento)}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{m.producto?.nombre || `Prod #${m.productoId}`}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold">{m.cantidad}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-500">{m.stockAnterior}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-medium">{m.stockPosterior}</td>
                    <td className="px-4 py-3 text-slate-600">{m.motivo}</td>
                    <td className="px-4 py-3 text-xs font-mono text-slate-500">{m.usuario?.username || '-'}</td>
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
