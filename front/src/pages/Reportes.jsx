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
        <h1 className="text-[30px] font-semibold text-[#0a0a0a] tracking-tight">Auditoría y Reportes</h1>
        <p className="text-[14px] text-[#737373]">Exportación de datos de existencias para control contable.</p>
      </div>

      <div className="bg-[#ffffff] p-6 rounded-[24px] border border-[#e5e5e5] shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] max-w-xl">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-[#f5f5f5] text-[#0a0a0a] rounded-[18px] border border-[#e5e5e5]">
            <FileSpreadsheet size={24} strokeWidth={1.75} />
          </div>
          <div className="flex-1">
            <h3 className="text-[16px] font-semibold text-[#0a0a0a] tracking-tight">Inventario Completo (CSV)</h3>
            <p className="text-[13px] text-[#737373] mt-1">
              Descarga un archivo CSV con el catálogo completo, precios, stock actual y estado valorizado para balances.
            </p>
            <button
              onClick={exportarCSV}
              disabled={downloading}
              className="mt-4 bg-[#0a0a0a] hover:bg-[#171717] text-[#fafafa] px-4 py-2 rounded-[18px] text-[14px] font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Download size={15} strokeWidth={1.75} />
              {downloading ? 'Generando archivo...' : 'Exportar CSV'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
