import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import api from '../../api/axios';

export const ProductoModal = ({ isOpen, onClose, onSuccess }) => {
  const [categorias, setCategorias] = useState([]);
  const [formData, setFormData] = useState({
    sku: '',
    nombre: '',
    descripcion: '',
    categoriaId: '',
    precioUnitario: '',
    stockInicial: 0,
    stockMinimo: 5,
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loadingCategorias, setLoadingCategorias] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      cargarCategorias();
      resetForm();
    }
  }, [isOpen]);

  const cargarCategorias = async () => {
    setLoadingCategorias(true);
    try {
      const res = await api.get('/categorias');
      setCategorias(res.data || []);
    } catch (err) {
      console.error('Error al cargar categorías', err);
      setApiError('No se pudieron cargar las categorías activas.');
    } finally {
      setLoadingCategorias(false);
    }
  };

  const resetForm = () => {
    setFormData({
      sku: '',
      nombre: '',
      descripcion: '',
      categoriaId: '',
      precioUnitario: '',
      stockInicial: 0,
      stockMinimo: 5,
    });
    setErrors({});
    setApiError('');
  };

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Limpia el error del campo al escribir
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (apiError) setApiError('');
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.sku.trim()) {
      newErrors.sku = 'El código SKU es obligatorio.';
    } else if (formData.sku.trim().length > 50) {
      newErrors.sku = 'El SKU no puede exceder los 50 caracteres.';
    }

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre del producto es obligatorio.';
    } else if (formData.nombre.trim().length > 100) {
      newErrors.nombre = 'El nombre no puede exceder los 100 caracteres.';
    }

    if (!formData.categoriaId) {
      newErrors.categoriaId = 'Debe seleccionar una categoría.';
    }

    const precio = parseFloat(formData.precioUnitario);
    if (formData.precioUnitario === '' || isNaN(precio) || precio < 0) {
      newErrors.precioUnitario = 'El precio debe ser un número mayor o igual a 0.';
    }

    const stockIni = parseInt(formData.stockInicial, 10);
    if (isNaN(stockIni) || stockIni < 0) {
      newErrors.stockInicial = 'El stock inicial no puede ser negativo.';
    }

    const stockMin = parseInt(formData.stockMinimo, 10);
    if (isNaN(stockMin) || stockMin < 0) {
      newErrors.stockMinimo = 'El stock mínimo no puede ser negativo.';
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
      sku: formData.sku.trim(),
      nombre: formData.nombre.trim(),
      descripcion: formData.descripcion.trim() || null,
      categoriaId: Number(formData.categoriaId),
      precioUnitario: Number(formData.precioUnitario),
      stockInicial: Number(formData.stockInicial) || 0,
      stockMinimo: Number(formData.stockMinimo) || 5,
    };

    try {
      const res = await api.post('/productos', payload);
      onSuccess(res.data);
      onClose();
    } catch (err) {
      if (err.response?.data?.fieldErrors) {
        setErrors(err.response.data.fieldErrors);
      } else if (err.response?.data?.message) {
        setApiError(err.response.data.message);
      } else {
        setApiError('Ocurrió un error inesperado al registrar el producto.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0a0a]/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#ffffff] rounded-[24px] border border-[#e5e5e5] shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] w-full max-w-xl max-h-[90vh] overflow-y-auto">
        {/* Cabecera */}
        <div className="p-6 border-b border-[#e5e5e5] flex justify-between items-center sticky top-0 bg-[#ffffff] z-10">
          <div>
            <h2 className="text-[20px] font-semibold text-[#0a0a0a] tracking-tight">Nuevo Producto</h2>
            <p className="text-[13px] text-[#737373]">Complete la información técnica y comercial para dar de alta el artículo.</p>
          </div>
          <button
            onClick={onClose}
            className="text-[#737373] hover:text-[#0a0a0a] p-1.5 rounded-[18px] hover:bg-[#f5f5f5] transition-colors"
          >
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {apiError && (
            <div className="p-3 bg-[#e7000b]/10 border border-[#e7000b]/20 rounded-[18px] text-[13px] text-[#e7000b] flex items-center gap-2">
              <AlertCircle size={16} strokeWidth={2} className="shrink-0" />
              <span>{apiError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* SKU */}
            <div>
              <label className="block text-[12px] font-medium uppercase tracking-wider text-[#737373] mb-1">
                SKU / Código <span className="text-[#e7000b]">*</span>
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                placeholder="ej. PROD-1001"
                className={`w-full px-3.5 py-2 bg-[#f5f5f5] text-[#0a0a0a] rounded-[18px] text-[14px] border ${
                  errors.sku ? 'border-[#e7000b]' : 'border-transparent focus:border-[#e5e5e5]'
                } focus:outline-none transition-colors`}
              />
              {errors.sku && <p className="text-[#e7000b] text-[12px] mt-1">{errors.sku}</p>}
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-[12px] font-medium uppercase tracking-wider text-[#737373] mb-1">
                Categoría <span className="text-[#e7000b]">*</span>
              </label>
              <select
                name="categoriaId"
                value={formData.categoriaId}
                onChange={handleChange}
                disabled={loadingCategorias}
                className={`w-full px-3.5 py-2 bg-[#f5f5f5] text-[#0a0a0a] rounded-[18px] text-[14px] border ${
                  errors.categoriaId ? 'border-[#e7000b]' : 'border-transparent focus:border-[#e5e5e5]'
                } focus:outline-none transition-colors disabled:opacity-50`}
              >
                <option value="">{loadingCategorias ? 'Cargando categorías...' : 'Seleccione una categoría'}</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
              {errors.categoriaId && <p className="text-[#e7000b] text-[12px] mt-1">{errors.categoriaId}</p>}
            </div>
          </div>

          {/* Nombre */}
          <div>
            <label className="block text-[12px] font-medium uppercase tracking-wider text-[#737373] mb-1">
              Nombre del Producto <span className="text-[#e7000b]">*</span>
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="ej. Monitor LED 24 Pulgadas IPS"
              className={`w-full px-3.5 py-2 bg-[#f5f5f5] text-[#0a0a0a] rounded-[18px] text-[14px] border ${
                errors.nombre ? 'border-[#e7000b]' : 'border-transparent focus:border-[#e5e5e5]'
              } focus:outline-none transition-colors`}
            />
            {errors.nombre && <p className="text-[#e7000b] text-[12px] mt-1">{errors.nombre}</p>}
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-[12px] font-medium uppercase tracking-wider text-[#737373] mb-1">
              Descripción
            </label>
            <textarea
              name="descripcion"
              rows={2}
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Especificaciones, características o detalles del producto..."
              className="w-full px-3.5 py-2 bg-[#f5f5f5] text-[#0a0a0a] rounded-[18px] text-[14px] border border-transparent focus:border-[#e5e5e5] focus:outline-none transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Precio Unitario */}
            <div>
              <label className="block text-[12px] font-medium uppercase tracking-wider text-[#737373] mb-1">
                Precio Unit. ($) <span className="text-[#e7000b]">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="precioUnitario"
                value={formData.precioUnitario}
                onChange={handleChange}
                placeholder="0.00"
                className={`w-full px-3.5 py-2 bg-[#f5f5f5] text-[#0a0a0a] tabular-nums rounded-[18px] text-[14px] border ${
                  errors.precioUnitario ? 'border-[#e7000b]' : 'border-transparent focus:border-[#e5e5e5]'
                } focus:outline-none transition-colors`}
              />
              {errors.precioUnitario && <p className="text-[#e7000b] text-[12px] mt-1">{errors.precioUnitario}</p>}
            </div>

            {/* Stock Inicial */}
            <div>
              <label className="block text-[12px] font-medium uppercase tracking-wider text-[#737373] mb-1">
                Stock Inicial <span className="text-[#e7000b]">*</span>
              </label>
              <input
                type="number"
                step="1"
                min="0"
                name="stockInicial"
                value={formData.stockInicial}
                onChange={handleChange}
                placeholder="0"
                className={`w-full px-3.5 py-2 bg-[#f5f5f5] text-[#0a0a0a] tabular-nums rounded-[18px] text-[14px] border ${
                  errors.stockInicial ? 'border-[#e7000b]' : 'border-transparent focus:border-[#e5e5e5]'
                } focus:outline-none transition-colors`}
              />
              {errors.stockInicial && <p className="text-[#e7000b] text-[12px] mt-1">{errors.stockInicial}</p>}
            </div>

            {/* Stock Mínimo */}
            <div>
              <label className="block text-[12px] font-medium uppercase tracking-wider text-[#737373] mb-1">
                Stock Mínimo <span className="text-[#e7000b]">*</span>
              </label>
              <input
                type="number"
                step="1"
                min="0"
                name="stockMinimo"
                value={formData.stockMinimo}
                onChange={handleChange}
                placeholder="5"
                className={`w-full px-3.5 py-2 bg-[#f5f5f5] text-[#0a0a0a] tabular-nums rounded-[18px] text-[14px] border ${
                  errors.stockMinimo ? 'border-[#e7000b]' : 'border-transparent focus:border-[#e5e5e5]'
                } focus:outline-none transition-colors`}
              />
              {errors.stockMinimo && <p className="text-[#e7000b] text-[12px] mt-1">{errors.stockMinimo}</p>}
            </div>
          </div>

          {/* Acciones */}
          <div className="pt-4 border-t border-[#e5e5e5] flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 bg-[#f5f5f5] hover:bg-[#e5e5e5] text-[#0a0a0a] rounded-[18px] text-[14px] font-medium transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-[#0a0a0a] hover:bg-[#171717] text-[#fafafa] rounded-[18px] text-[14px] font-medium transition-colors disabled:opacity-50"
            >
              {submitting ? 'Guardando...' : 'Crear Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
