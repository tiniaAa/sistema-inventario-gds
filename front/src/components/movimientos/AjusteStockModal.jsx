import React, { useState, useEffect } from 'react';
import { X, SlidersHorizontal, AlertCircle, Info, PackageX, PackagePlus } from 'lucide-react';
import api from '../../api/axios';

export const AjusteStockModal = ({ isOpen, onClose, onSuccess }) => {
  const [productos, setProductos] = useState([]);
  const [loadingProductos, setLoadingProductos] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    productoId: '',
    tipoMovimiento: 'AJUSTE_MERMA',
    cantidad: '',
    motivo: '',
  });

  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (isOpen) {
      cargarProductos();
      resetForm();
    }
  }, [isOpen]);

  const cargarProductos = async () => {
    setLoadingProductos(true);
    try {
      const res = await api.get('/productos?page=0&size=200');
      const items = res.data?.content || res.data || [];
      setProductos(items);
    } catch (err) {
      console.error('Error al cargar productos para ajuste', err);
      setApiError('No se pudo cargar la lista de productos.');
    } finally {
      setLoadingProductos(false);
    }
  };

  const resetForm = () => {
    setFormData({
      productoId: '',
      tipoMovimiento: 'AJUSTE_MERMA',
      cantidad: '',
      motivo: '',
    });
    setProductoSeleccionado(null);
    setErrors({});
    setApiError('');
  };

  if (!isOpen) return null;

  const handleProductoChange = (e) => {
    const prodId = e.target.value;
    setFormData((prev) => ({ ...prev, productoId: prodId }));

    if (errors.productoId) setErrors((prev) => ({ ...prev, productoId: '' }));
    if (errors.cantidad) setErrors((prev) => ({ ...prev, cantidad: '' }));
    if (apiError) setApiError('');

    if (prodId) {
      const prod = productos.find((p) => String(p.id) === String(prodId));
      setProductoSeleccionado(prod || null);
    } else {
      setProductoSeleccionado(null);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (apiError) setApiError('');
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.productoId) {
      newErrors.productoId = 'Debe seleccionar un producto.';
    }

    const cant = parseInt(formData.cantidad, 10);
    if (!formData.cantidad || isNaN(cant) || cant <= 0) {
      newErrors.cantidad = 'La cantidad debe ser un número entero mayor a 0.';
    } else if (
      formData.tipoMovimiento === 'AJUSTE_MERMA' &&
      productoSeleccionado &&
      cant > productoSeleccionado.stockActual
    ) {
      newErrors.cantidad = `La merma solicitada (${cant}) excede el stock actual disponible (${productoSeleccionado.stockActual}).`;
    }

    if (!formData.motivo.trim()) {
      newErrors.motivo = 'La justificación o motivo del desvío es obligatorio.';
    } else if (formData.motivo.trim().length > 255) {
      newErrors.motivo = 'El motivo no puede exceder los 255 caracteres.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setApiError('');

    const payload = {
      productoId: Number(formData.productoId),
      tipoMovimiento: formData.tipoMovimiento,
      cantidad: parseInt(formData.cantidad, 10),
      motivo: formData.motivo.trim(),
    };

    try {
      const res = await api.post('/movimientos', payload);
      if (onSuccess) {
        onSuccess(res.data);
      }
      onClose();
    } catch (err) {
      console.error('Error al registrar ajuste de stock', err);
      if (err.response?.data?.fieldErrors) {
        setErrors(err.response.data.fieldErrors);
      } else if (err.response?.data?.message) {
        setApiError(err.response.data.message);
      } else {
        setApiError('Ocurrió un error inesperado al procesar el ajuste de inventario.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const stockActual = productoSeleccionado?.stockActual ?? 0;
  const cantAjuste = parseInt(formData.cantidad, 10) || 0;
  const esMerma = formData.tipoMovimiento === 'AJUSTE_MERMA';
  const stockProyectado = esMerma ? stockActual - cantAjuste : stockActual + cantAjuste;
  const esSuperaStock = esMerma && productoSeleccionado && cantAjuste > stockActual;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0a0a]/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#ffffff] rounded-[24px] border border-[#e5e5e5] shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] w-full max-w-lg overflow-hidden">
        {/* Cabecera */}
        <div className="p-6 border-b border-[#e5e5e5] flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[18px] bg-[#171717] flex items-center justify-center text-[#fafafa]">
              <SlidersHorizontal size={20} strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="text-[18px] font-semibold text-[#0a0a0a] tracking-tight">
                Ajuste Manual de Inventario
              </h2>
              <p className="text-[13px] text-[#737373]">
                Corrección por rotura, merma, vencimiento o recuento físico
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="p-1.5 text-[#737373] hover:text-[#0a0a0a] rounded-[18px] hover:bg-[#f5f5f5] transition-colors cursor-pointer"
          >
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {apiError && (
              <div className="p-3 bg-[#ffffff] border border-[#e7000b]/20 rounded-[18px] text-[13px] text-[#e7000b] flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{apiError}</span>
              </div>
            )}

            {/* Selector de Tipo de Ajuste */}
            <div>
              <label className="block text-[12px] font-medium uppercase tracking-wider text-[#737373] mb-1.5">
                Naturaleza del Ajuste <span className="text-[#e7000b]">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, tipoMovimiento: 'AJUSTE_MERMA' }));
                    if (errors.cantidad) setErrors((prev) => ({ ...prev, cantidad: '' }));
                  }}
                  className={`p-3 rounded-[18px] border text-left transition-colors flex items-center gap-2.5 cursor-pointer ${
                    formData.tipoMovimiento === 'AJUSTE_MERMA'
                      ? 'border-[#0a0a0a] bg-[#f5f5f5] text-[#0a0a0a]'
                      : 'border-[#e5e5e5] bg-[#ffffff] text-[#737373] hover:border-[#a3a3a3]'
                  }`}
                >
                  <PackageX size={18} strokeWidth={1.75} className="shrink-0" />
                  <div>
                    <div className="text-[13px] font-medium">Merma / Pérdida (-)</div>
                    <div className="text-[11px] text-[#737373]">Rotura, daño o vencimiento</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, tipoMovimiento: 'AJUSTE_SOBRANTE' }));
                    if (errors.cantidad) setErrors((prev) => ({ ...prev, cantidad: '' }));
                  }}
                  className={`p-3 rounded-[18px] border text-left transition-colors flex items-center gap-2.5 cursor-pointer ${
                    formData.tipoMovimiento === 'AJUSTE_SOBRANTE'
                      ? 'border-[#0a0a0a] bg-[#f5f5f5] text-[#0a0a0a]'
                      : 'border-[#e5e5e5] bg-[#ffffff] text-[#737373] hover:border-[#a3a3a3]'
                  }`}
                >
                  <PackagePlus size={18} strokeWidth={1.75} className="shrink-0" />
                  <div>
                    <div className="text-[13px] font-medium">Sobrante (+)</div>
                    <div className="text-[11px] text-[#737373]">Recuento físico favorable</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Selección de Producto */}
            <div>
              <label className="block text-[12px] font-medium uppercase tracking-wider text-[#737373] mb-1.5">
                Producto Afectado <span className="text-[#e7000b]">*</span>
              </label>
              <select
                name="productoId"
                value={formData.productoId}
                onChange={handleProductoChange}
                disabled={loadingProductos || submitting}
                className={`w-full px-3.5 py-2.5 bg-[#f5f5f5] text-[#0a0a0a] rounded-[18px] text-[14px] border-none focus:outline-none focus:ring-1 ${
                  errors.productoId ? 'ring-1 ring-[#e7000b]' : 'focus:ring-[#e5e5e5]'
                } transition-all disabled:opacity-50`}
              >
                <option value="">
                  {loadingProductos ? 'Cargando catálogo...' : 'Seleccione el artículo a ajustar'}
                </option>
                {productos.map((prod) => (
                  <option key={prod.id} value={prod.id}>
                    {prod.nombre} (SKU: {prod.sku}) — Stock actual: {prod.stockActual}
                  </option>
                ))}
              </select>
              {errors.productoId && (
                <p className="text-[#e7000b] text-[12px] mt-1">{errors.productoId}</p>
              )}
            </div>

            {/* Panel de Balances de Stock */}
            {productoSeleccionado && (
              <div className="p-4 bg-[#fafafa] rounded-[18px] border border-[#e5e5e5] space-y-2">
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-[#737373]">Stock registrado en sistema:</span>
                  <span className="font-mono font-medium text-[#0a0a0a] tabular-nums">
                    {stockActual} u.
                  </span>
                </div>
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-[#737373]">
                    {esMerma ? 'Descuento por merma:' : 'Adición por sobrante:'}
                  </span>
                  <span className="font-mono font-medium text-[#0a0a0a] tabular-nums">
                    {esMerma ? `-${cantAjuste}` : `+${cantAjuste}`} u.
                  </span>
                </div>
                <div className="pt-2 border-t border-[#e5e5e5] flex justify-between items-center text-[14px] font-semibold">
                  <span className="text-[#0a0a0a]">Saldo resultante auditado:</span>
                  <span
                    className={`font-mono tabular-nums ${
                      esSuperaStock ? 'text-[#e7000b]' : 'text-[#0a0a0a]'
                    }`}
                  >
                    {stockProyectado} u.
                  </span>
                </div>
                {esSuperaStock && (
                  <p className="text-[12px] text-[#e7000b] pt-1">
                    Atención: La merma no puede superar el stock registrado. No se permiten saldos negativos.
                  </p>
                )}
              </div>
            )}

            {/* Cantidad y Motivo */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <label className="block text-[12px] font-medium uppercase tracking-wider text-[#737373] mb-1.5">
                  Cantidad <span className="text-[#e7000b]">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  name="cantidad"
                  value={formData.cantidad}
                  onChange={handleChange}
                  placeholder="ej. 3"
                  disabled={submitting}
                  className={`w-full px-3.5 py-2.5 bg-[#f5f5f5] text-[#0a0a0a] tabular-nums rounded-[18px] text-[14px] border-none focus:outline-none focus:ring-1 ${
                    errors.cantidad ? 'ring-1 ring-[#e7000b]' : 'focus:ring-[#e5e5e5]'
                  } transition-all`}
                />
                {errors.cantidad && (
                  <p className="text-[#e7000b] text-[12px] mt-1">{errors.cantidad}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[12px] font-medium uppercase tracking-wider text-[#737373]">
                    Justificación / Acta <span className="text-[#e7000b]">*</span>
                  </label>
                  <span className="text-[11px] text-[#737373]">{formData.motivo.length}/255</span>
                </div>
                <input
                  type="text"
                  name="motivo"
                  maxLength={255}
                  value={formData.motivo}
                  onChange={handleChange}
                  placeholder="ej. Rotura en estantería sector B, Descomposición lote #31"
                  disabled={submitting}
                  className={`w-full px-3.5 py-2.5 bg-[#f5f5f5] text-[#0a0a0a] rounded-[18px] text-[14px] border-none focus:outline-none focus:ring-1 ${
                    errors.motivo ? 'ring-1 ring-[#e7000b]' : 'focus:ring-[#e5e5e5]'
                  } transition-all`}
                />
                {errors.motivo && (
                  <p className="text-[#e7000b] text-[12px] mt-1">{errors.motivo}</p>
                )}
              </div>
            </div>

            <div className="p-3 bg-[#ffffff] border border-[#e5e5e5] rounded-[18px] flex items-start gap-2.5 text-[12px] text-[#737373]">
              <Info size={16} strokeWidth={1.75} className="shrink-0 mt-0.5" />
              <span>
                Operación restringida a Administradores. Todo ajuste queda registrado con trazabilidad inmutable del usuario autenticado.
              </span>
            </div>
          </div>

          {/* Acciones */}
          <div className="p-4 bg-[#fafafa] border-t border-[#e5e5e5] flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 bg-[#f5f5f5] hover:bg-[#e5e5e5] text-[#0a0a0a] rounded-[18px] text-[14px] font-medium transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || esSuperaStock}
              className="px-5 py-2 bg-[#0a0a0a] hover:bg-[#171717] text-[#fafafa] rounded-[18px] text-[14px] font-medium transition-colors cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Registrando...' : 'Confirmar Ajuste'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
