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
          <h1 className="text-[30px] font-semibold text-[#0a0a0a] tracking-tight">Categorías de Productos</h1>
          <p className="text-[14px] text-[#737373]">Clasificación y segmentación de artículos en almacén.</p>
        </div>
        <button className="bg-[#0a0a0a] hover:bg-[#171717] text-[#fafafa] px-4 py-2 rounded-[18px] text-[14px] font-medium flex items-center gap-2 transition-colors">
          <Plus size={16} strokeWidth={1.75} />
          Nueva Categoría
        </button>
      </div>

      <div className="bg-[#ffffff] rounded-[24px] border border-[#e5e5e5] shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] overflow-hidden">
        <table className="w-full text-left text-[14px]">
          <thead className="bg-[#fafafa] text-[12px] uppercase text-[#737373] font-medium">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Descripción</th>
              <th className="px-4 py-3 text-center">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5e5e5]">
            {loading ? (
              <tr><td colSpan="4" className="text-center py-6 text-[#737373]">Cargando...</td></tr>
            ) : categorias.length === 0 ? (
              <tr><td colSpan="4" className="text-center py-6 text-[#737373]">No hay categorías registradas.</td></tr>
            ) : (
              categorias.map((c) => (
                <tr key={c.id} className="hover:bg-[#fafafa]">
                  <td className="px-4 py-3 font-mono text-[12px] text-[#737373]">#{c.id}</td>
                  <td className="px-4 py-3 font-medium text-[#0a0a0a]">{c.nombre}</td>
                  <td className="px-4 py-3 text-[#737373]">{c.descripcion || '-'}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={c.activo ? 'outline' : 'destructive'}>{c.activo ? 'Activa' : 'Inactiva'}</Badge>
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
