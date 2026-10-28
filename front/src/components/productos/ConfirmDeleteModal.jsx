import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export const ConfirmDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  producto,
  loading = false,
  error = ''
}) => {
  if (!isOpen || !producto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0a0a]/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#ffffff] w-full max-w-md rounded-[24px] border border-[#e5e5e5] shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-[#e5e5e5] flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[18px] bg-[#f5f5f5] flex items-center justify-center text-[#e7000b]">
              <AlertTriangle size={20} strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-[18px] font-semibold text-[#0a0a0a] tracking-tight">
                Dar de baja producto
              </h2>
              <p className="text-[13px] text-[#737373]">
                Operación irreversible para el catálogo activo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 text-[#737373] hover:text-[#0a0a0a] rounded-[18px] hover:bg-[#f5f5f5] transition-colors cursor-pointer"
          >
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>

        {/* Contenido / Detalle */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-[#ffffff] border border-[#e7000b]/20 rounded-[18px] text-[13px] text-[#e7000b]">
              {error}
            </div>
          )}

          <p className="text-[14px] text-[#737373] leading-relaxed">
            ¿Está seguro de que desea deshabilitar el producto{' '}
            <strong className="text-[#0a0a0a] font-semibold">"{producto.nombre}"</strong>?
          </p>

          <div className="p-4 bg-[#fafafa] border border-[#e5e5e5] rounded-[18px] text-[13px] space-y-2">
            <div className="flex justify-between">
              <span className="text-[#737373]">Código SKU:</span>
              <span className="font-mono text-[#0a0a0a] font-medium">{producto.sku}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#737373]">Categoría:</span>
              <span className="text-[#0a0a0a] font-medium">{producto.categoria?.nombre || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#737373]">Stock actual:</span>
              <span className="font-semibold text-[#0a0a0a] tabular-nums">{producto.stockActual} unidades</span>
            </div>
          </div>

          <div className="text-[12px] text-[#737373] bg-[#f5f5f5] p-3 rounded-[18px]">
            <strong>Nota de auditoría:</strong> El producto no será eliminado físicamente de la base de datos para preservar la trazabilidad de los movimientos de inventario históricos.
          </div>
        </div>

        {/* Acciones */}
        <div className="p-4 bg-[#fafafa] border-t border-[#e5e5e5] flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 bg-[#f5f5f5] hover:bg-[#e5e5e5] text-[#0a0a0a] rounded-[18px] text-[14px] font-medium transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 bg-[#e7000b] hover:opacity-90 text-[#fafafa] rounded-[18px] text-[14px] font-medium transition-opacity cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Deshabilitando...' : 'Confirmar baja'}
          </button>
        </div>
      </div>
    </div>
  );
};
