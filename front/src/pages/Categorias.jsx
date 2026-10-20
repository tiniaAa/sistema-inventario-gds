import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, Tag } from 'lucide-react';
import { Badge } from '../components/common/Badge';

export const Categorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategorias();
  }, []);

  const fetchCategorias = async () => {
    setLoading(true);
    try {
      const res = await api.get('/categorias');
      setCategorias(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Categorías de Productos</h1>
          <p className="text-sm text-slate-500">Clasificación y segmentación de artículos en almacén.</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-colors">
          <Plus size={16} />
          Nueva Categoría
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 text-xs uppercase text-slate-500 font-semibold">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Descripción</th>
              <th className="px-4 py-3 text-center">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {loading ? (
              <tr><td colSpan="4" className="text-center py-6 text-slate-500">Cargando...</td></tr>
            ) : categorias.length === 0 ? (
              <tr><td colSpan="4" className="text-center py-6 text-slate-500">No hay categorías registradas.</td></tr>
            ) : (
              categorias.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">#{c.id}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{c.nombre}</td>
                  <td className="px-4 py-3 text-slate-600">{c.descripcion || '-'}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={c.activo ? 'optimal' : 'danger'}>{c.activo ? 'Activa' : 'Inactiva'}</Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
