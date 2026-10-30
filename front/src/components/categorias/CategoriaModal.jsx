import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { X, Tag, AlertCircle } from 'lucide-react';

export const CategoriaModal = ({
  isOpen,
  onClose,
  categoriaAEditar = null,
  onCategoriaSaved
}) => {
  const isEdit = Boolean(categoriaAEditar);

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (categoriaAEditar) {
        setFormData({
          nombre: categoriaAEditar.nombre || '',
          descripcion: categoriaAEditar.descripcion || ''
        });
      } else {
        setFormData({
          nombre: '',
          descripcion: ''
        });
      }
      setErrors({});
      setApiError('');
    }
  }, [isOpen, categoriaAEditar]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (apiError) setApiError('');
  };

  const validate = () => {
    const newErrors = {};
    const nombreTrimmed = formData.nombre.trim();

    if (!nombreTrimmed) {
      newErrors.nombre = 'El nombre de la categoría es obligatorio.';
    } else if (nombreTrimmed.length > 50) {
      newErrors.nombre = 'El nombre no puede superar los 50 caracteres.';
    }

    if (formData.descripcion && formData.descripcion.trim().length > 255) {
      newErrors.descripcion = 'La descripción no puede superar los 255 caracteres.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setApiError('');

    const payload = {
      nombre: formData.nombre.trim(),
      descripcion: formData.descripcion.trim() || null
    };

    try {
      let res;
      if (isEdit) {
        res = await api.put(`/categorias/${categoriaAEditar.id}`, payload);
      } else {
        res = await api.post('/categorias', payload);
      }

      if (onCategoriaSaved) {
        onCategoriaSaved(res.data, isEdit);
      }
      onClose();
    } catch (err) {
      console.error('Error al guardar categoría', err);
      const serverMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Ocurrió un error al procesar la categoría.';
      setApiError(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0a0a]/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#ffffff] w-full max-w-lg rounded-[24px] border border-[#e5e5e5] shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] overflow-hidden">
        {/* Encabezado */}
        <div className="p-6 border-b border-[#e5e5e5] flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[18px] bg-[#f5f5f5] flex items-center justify-center text-[#0a0a0a]">
              <Tag size={20} strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="text-[18px] font-semibold text-[#0a0a0a] tracking-tight">
                {isEdit ? 'Editar Categoría' : 'Nueva Categoría'}
              </h2>
              <p className="text-[13px] text-[#737373]">
                {isEdit
                  ? `Modificando ID #${categoriaAEditar.id}`
                  : 'Registrar un nuevo segmento para organizar productos'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
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

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[13px] font-medium text-[#0a0a0a]">
                  Nombre de la categoría <span className="text-[#e7000b]">*</span>
                </label>
                <span className="text-[11px] text-[#737373]">
                  {formData.nombre.length}/50
                </span>
              </div>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                maxLength={50}
                placeholder="Ej. Herramientas Eléctricas"
                disabled={loading}
                autoFocus
                className={`w-full bg-[#f5f5f5] text-[#0a0a0a] placeholder-[#737373] text-[14px] px-3.5 py-2.5 rounded-[18px] border-none focus:outline-none focus:ring-1 ${
                  errors.nombre
                    ? 'ring-1 ring-[#e7000b]'
                    : 'focus:ring-[#e5e5e5]'
                } transition-all`}
              />
              {errors.nombre && (
                <p className="mt-1 text-[12px] text-[#e7000b]">{errors.nombre}</p>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[13px] font-medium text-[#0a0a0a]">
                  Descripción <span className="text-[12px] text-[#737373] font-normal">(opcional)</span>
                </label>
                <span className="text-[11px] text-[#737373]">
                  {formData.descripcion.length}/255
                </span>
              </div>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                maxLength={255}
                rows={3}
                placeholder="Detalle o alcance de los artículos contenidos en esta categoría..."
                disabled={loading}
                className={`w-full bg-[#f5f5f5] text-[#0a0a0a] placeholder-[#737373] text-[14px] px-3.5 py-2.5 rounded-[18px] border-none focus:outline-none focus:ring-1 ${
                  errors.descripcion
                    ? 'ring-1 ring-[#e7000b]'
                    : 'focus:ring-[#e5e5e5]'
                } transition-all resize-none`}
              />
              {errors.descripcion && (
                <p className="mt-1 text-[12px] text-[#e7000b]">{errors.descripcion}</p>
              )}
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
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-[#0a0a0a] hover:bg-[#171717] text-[#fafafa] rounded-[18px] text-[14px] font-medium transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {loading
                ? isEdit
                  ? 'Guardando...'
                  : 'Creando...'
                : isEdit
                ? 'Guardar Cambios'
                : 'Crear Categoría'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
