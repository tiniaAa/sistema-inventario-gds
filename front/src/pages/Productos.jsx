import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, Search, Filter, Edit2, Trash2 } from 'lucide-react';
import { StockBadge } from '../components/common/Badge';

export const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProductos();
  }, [page, search]);

  const fetchProductos = async () => {
    setLoading(true);
    try {
      const res = await api.get('/productos', {
        params: { page, size: 10, search: search || undefined }
      });
      setProductos(res.data.content || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error('Error fetching productos', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Catálogo de Productos</h1>
          <p className="text-sm text-slate-500">Gestión de artículos, precios y niveles de stock.</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-colors">
          <Plus size={16} />
          Nuevo Producto
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Barra de Búsqueda y Filtros */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search size={18} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, SKU o categoría..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-xs uppercase text-slate-500 font-semibold">
              <tr>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3 text-right">Precio Unit.</th>
                <th className="px-4 py-3 text-right">Stock Actual</th>
                <th className="px-4 py-3 text-center">Estado</th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-500 text-sm">Cargando catálogo...</td>
                </tr>
              ) : productos.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-500 text-sm">No se encontraron productos.</td>
                </tr>
              ) : (
                productos.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs">{prod.sku}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{prod.nombre}</td>
                    <td className="px-4 py-3 text-slate-600">{prod.categoria?.nombre || '-'}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-mono">${Number(prod.precioUnitario).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold">{prod.stockActual}</td>
                    <td className="px-4 py-3 text-center">
                      <StockBadge stockActual={prod.stockActual} stockMinimo={prod.stockMinimo} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button className="text-slate-400 hover:text-blue-600 transition-colors" title="Editar">
                          <Edit2 size={16} />
                        </button>
                        <button className="text-slate-400 hover:text-red-600 transition-colors" title="Baja lógica">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-600">
          <span>Página {page + 1} de {totalPages}</span>
          <div className="flex gap-2">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(p - 1, 0))}
              className="px-3 py-1 border border-slate-300 rounded-md disabled:opacity-50 hover:bg-slate-50"
            >
              Anterior
            </button>
            <button
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 border border-slate-300 rounded-md disabled:opacity-50 hover:bg-slate-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
