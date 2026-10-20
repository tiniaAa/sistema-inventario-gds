import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Package, AlertTriangle, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { StockBadge } from '../components/common/Badge';

export const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    totalProductos: 0,
    productosCriticos: 0,
    ingresosHoy: 0,
    egresosHoy: 0,
  });
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulación de carga inicial o fetch al backend
    const fetchDashboardData = async () => {
      try {
        const [resMetrics, resAlertas] = await Promise.allSettled([
          api.get('/dashboard/metricas'),
          api.get('/productos/alertas')
        ]);
        if (resMetrics.status === 'fulfilled') setMetrics(resMetrics.value.data);
        if (resAlertas.status === 'fulfilled') setAlertas(resAlertas.value.data);
      } catch (e) {
        console.error('Error fetching dashboard data', e);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const kpis = [
    { label: 'Total Productos', val: metrics.totalProductos, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Stock Crítico / Alertas', val: metrics.productosCriticos, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Ingresos Registrados', val: metrics.ingresosHoy, icon: ArrowDownRight, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Egresos Registrados', val: metrics.egresosHoy, icon: ArrowUpRight, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Estado del Depósito</h1>
        <p className="text-sm text-slate-500">Métricas generales y control de reposición de mercadería.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">{kpi.label}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">{kpi.val}</p>
              </div>
              <div className={`p-3 rounded-lg ${kpi.bg} ${kpi.color}`}>
                <Icon size={22} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Alertas de Stock Mínimo (HU-10) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-500" />
            Productos por Debajo del Umbral Mínimo
          </h2>
          <span className="text-xs text-slate-500">Actualización en tiempo real</span>
        </div>

        <div className="p-6">
          {alertas.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              No se detectaron productos en estado crítico de reposición.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 text-xs uppercase text-slate-500 font-semibold">
                  <tr>
                    <th className="px-4 py-3">SKU</th>
                    <th className="px-4 py-3">Producto</th>
                    <th className="px-4 py-3 text-right">Stock Actual</th>
                    <th className="px-4 py-3 text-right">Stock Mínimo</th>
                    <th className="px-4 py-3 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {alertas.map((prod) => (
                    <tr key={prod.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono text-xs">{prod.sku}</td>
                      <td className="px-4 py-3 font-medium text-slate-800">{prod.nombre}</td>
                      <td className="px-4 py-3 text-right tabular-nums font-semibold">{prod.stockActual}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-slate-500">{prod.stockMinimo}</td>
                      <td className="px-4 py-3 text-center">
                        <StockBadge stockActual={prod.stockActual} stockMinimo={prod.stockMinimo} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
