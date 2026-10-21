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
    { label: 'Total Productos', val: metrics.totalProductos, icon: Package },
    { label: 'Stock Crítico / Alertas', val: metrics.productosCriticos, icon: AlertTriangle },
    { label: 'Ingresos Registrados', val: metrics.ingresosHoy, icon: ArrowDownRight },
    { label: 'Egresos Registrados', val: metrics.egresosHoy, icon: ArrowUpRight },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[30px] font-semibold text-[#0a0a0a] tracking-tight">Estado del Depósito</h1>
        <p className="text-[14px] text-[#737373]">Métricas generales y control de reposición de mercadería.</p>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="bg-[#ffffff] p-5 rounded-[24px] border border-[#e5e5e5] shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] flex items-center justify-between"
            >
              <div>
                <p className="text-[12px] font-medium text-[#737373] uppercase tracking-wider">{kpi.label}</p>
                <p className="text-[36px] font-semibold text-[#0a0a0a] mt-1 tracking-tight tabular-nums">{kpi.val}</p>
              </div>
              <div className="p-2.5 rounded-[18px] bg-[#f5f5f5] text-[#737373]">
                <Icon size={20} strokeWidth={1.75} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Alertas de Stock Mínimo (HU-10) */}
      <div className="bg-[#ffffff] rounded-[24px] border border-[#e5e5e5] shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#e5e5e5] flex items-center justify-between">
          <h2 className="text-[16px] font-semibold text-[#0a0a0a] flex items-center gap-2">
            <AlertTriangle size={18} strokeWidth={1.75} className="text-[#0a0a0a]" />
            Productos por Debajo del Umbral Mínimo
          </h2>
          <span className="text-[12px] text-[#737373]">Actualización en tiempo real</span>
        </div>

        <div className="p-6">
          {alertas.length === 0 ? (
            <div className="text-center py-8 text-[#737373] text-[14px]">
              No se detectaron productos en estado crítico de reposición.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[14px]">
                <thead className="bg-[#fafafa] text-[12px] uppercase text-[#737373] font-medium">
                  <tr>
                    <th className="px-4 py-3">SKU</th>
                    <th className="px-4 py-3">Producto</th>
                    <th className="px-4 py-3 text-right">Stock Actual</th>
                    <th className="px-4 py-3 text-right">Stock Mínimo</th>
                    <th className="px-4 py-3 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e5e5]">
                  {alertas.map((prod) => (
                    <tr key={prod.id} className="hover:bg-[#fafafa]">
                      <td className="px-4 py-3 font-mono text-[12px] text-[#737373]">{prod.sku}</td>
                      <td className="px-4 py-3 font-medium text-[#0a0a0a]">{prod.nombre}</td>
                      <td className="px-4 py-3 text-right tabular-nums font-semibold">{prod.stockActual}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-[#737373]">{prod.stockMinimo}</td>
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
