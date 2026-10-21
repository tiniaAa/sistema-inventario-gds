import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Package, AlertTriangle, ArrowLeftRight, ArrowRight, Boxes, FileSpreadsheet } from 'lucide-react';
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

  return (
    <div className="space-y-8">
      {/* Encabezado del Centro de Control */}
      <div>
        <h1 className="text-[32px] font-semibold text-[#0a0a0a] tracking-tight">Centro de Control de Almacén</h1>
        <p className="text-[14px] text-[#737373] mt-1">Selecciona un área operativa para gestionar inventario, consultar reportes o procesar despachos.</p>
      </div>

      {/* Selector de Módulos Operativos (Recuadros Grandes Interactivos) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Recuadro 1: Catálogo */}
        <Link
          to="/productos"
          className="group bg-[#ffffff] p-6 rounded-[24px] border border-[#e5e5e5] shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] hover:border-[#0a0a0a] transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-[14px] bg-[#f5f5f5] text-[#0a0a0a] flex items-center justify-center group-hover:bg-[#0a0a0a] group-hover:text-[#fafafa] transition-colors">
                <Package size={22} strokeWidth={1.75} />
              </div>
              <span className="text-[11px] font-mono text-[#737373] bg-[#f5f5f5] px-2 py-0.5 rounded-[18px]">MOD-01</span>
            </div>
            <h2 className="text-[18px] font-semibold text-[#0a0a0a] tracking-tight">Catálogo de Productos</h2>
            <p className="text-[13px] text-[#737373] mt-1.5 leading-relaxed">
              Alta de artículos, asignación de precios, códigos SKU y niveles de existencia.
            </p>
          </div>
          <div className="pt-5 mt-5 border-t border-[#e5e5e5] flex items-center justify-between">
            <span className="text-[14px] font-semibold text-[#0a0a0a] tabular-nums">{metrics.totalProductos} productos</span>
            <span className="text-[13px] font-medium text-[#0a0a0a] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Ingresar <ArrowRight size={14} />
            </span>
          </div>
        </Link>

        {/* Recuadro 2: Movimientos */}
        <Link
          to="/movimientos"
          className="group bg-[#ffffff] p-6 rounded-[24px] border border-[#e5e5e5] shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] hover:border-[#0a0a0a] transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-[14px] bg-[#f5f5f5] text-[#0a0a0a] flex items-center justify-center group-hover:bg-[#0a0a0a] group-hover:text-[#fafafa] transition-colors">
                <ArrowLeftRight size={22} strokeWidth={1.75} />
              </div>
              <span className="text-[11px] font-mono text-[#737373] bg-[#f5f5f5] px-2 py-0.5 rounded-[18px]">MOD-02</span>
            </div>
            <h2 className="text-[18px] font-semibold text-[#0a0a0a] tracking-tight">Movimientos de Stock</h2>
            <p className="text-[13px] text-[#737373] mt-1.5 leading-relaxed">
              Registro transaccional de ingresos por remito, despachos de egreso y ajustes por merma.
            </p>
          </div>
          <div className="pt-5 mt-5 border-t border-[#e5e5e5] flex items-center justify-between">
            <span className="text-[14px] font-semibold text-[#0a0a0a] tabular-nums">{metrics.ingresosHoy + metrics.egresosHoy} operaciones</span>
            <span className="text-[13px] font-medium text-[#0a0a0a] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Operar <ArrowRight size={14} />
            </span>
          </div>
        </Link>

        {/* Recuadro 3: Alertas y Quiebre de Stock */}
        <div className="bg-[#ffffff] p-6 rounded-[24px] border border-[#e5e5e5] shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-[14px] bg-[#f5f5f5] text-[#0a0a0a] flex items-center justify-center">
                <AlertTriangle size={22} strokeWidth={1.75} />
              </div>
              <span className="text-[11px] font-mono text-[#737373] bg-[#f5f5f5] px-2 py-0.5 rounded-[18px]">SUPERVISIÓN</span>
            </div>
            <h2 className="text-[18px] font-semibold text-[#0a0a0a] tracking-tight">Control de Reposición</h2>
            <p className="text-[13px] text-[#737373] mt-1.5 leading-relaxed">
              Monitoreo continuo de artículos que cayeron por debajo de su umbral mínimo de compra.
            </p>
          </div>
          <div className="pt-5 mt-5 border-t border-[#e5e5e5] flex items-center justify-between">
            <span className="text-[14px] font-semibold text-[#0a0a0a] tabular-nums">{metrics.productosCriticos} ítems críticos</span>
            <span className="text-[11px] px-2.5 py-0.5 rounded-[18px] bg-[#171717] text-[#fafafa] font-medium">
              Supervisión Activa
            </span>
          </div>
        </div>
      </div>

      {/* Tabla de Artículos por Debajo del Umbral Mínimo (HU-10) */}
      <div className="bg-[#ffffff] rounded-[24px] border border-[#e5e5e5] shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#e5e5e5] flex items-center justify-between">
          <div>
            <h2 className="text-[16px] font-semibold text-[#0a0a0a] flex items-center gap-2">
              <AlertTriangle size={17} strokeWidth={1.75} className="text-[#0a0a0a]" />
              Artículos en Punto Crítico de Reorden
            </h2>
            <p className="text-[12px] text-[#737373] mt-0.5">Listado generado por umbral automático de stock mínimo</p>
          </div>
          <span className="text-[12px] text-[#737373] hidden sm:inline">Actualizado en tiempo real</span>
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
                      <td className="px-4 py-3 text-right tabular-nums font-semibold text-[#0a0a0a]">{prod.stockActual}</td>
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
