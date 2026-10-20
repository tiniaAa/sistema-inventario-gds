import React, { useState } from 'react';
import api from '../api/axios';
import { Download, FileSpreadsheet } from 'lucide-react';

export const Reportes = () => {
  const [downloading, setDownloading] = useState(false);

  const exportarCSV = async () => {
    setDownloading(true);
    try {
      const response = await api.get('/reportes/inventario/csv', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `inventario_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      console.error('Error al exportar CSV', e);
      alert('Error al descargar el archivo CSV');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Auditoría y Reportes</h1>
        <p className="text-sm text-slate-500">Exportación de datos de existencias para control contable.</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm max-w-xl">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <FileSpreadsheet size={28} />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-slate-900">Inventario Completo (CSV)</h3>
            <p className="text-sm text-slate-500 mt-1">
              Descarga un archivo CSV con el catálogo completo, precios, stock actual y estado valorizado para balances.
            </p>
            <button
              onClick={exportarCSV}
              disabled={downloading}
              className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-colors disabled:opacity-50"
            >
              <Download size={16} />
              {downloading ? 'Generando archivo...' : 'Exportar CSV'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
